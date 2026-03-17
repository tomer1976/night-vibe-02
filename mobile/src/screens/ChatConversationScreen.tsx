import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BottomNavShell, Button, Card, Input, ListItem, TopBar } from '../components';
import { isChatEligibilityFailureCode, resolveChatEligibilityFallbackRoute } from '../navigation/chatEligibilityRouteGuard';
import { isMainTabKey, MAIN_TAB_ITEMS, resolveMainTabRouteName } from '../navigation/mainTabs';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

type ChatConversationRouteParams = {
  chatId?: string;
  matchId?: string;
  counterpartName?: string;
  threadStatus?: 'active' | 'expired' | 'blocked';
  venueId?: string;
};

type LocalMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
};

const toStatusTone = (status: ChatConversationRouteParams['threadStatus']): 'success' | 'warning' | 'danger' => {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'expired') {
    return 'warning';
  }

  return 'danger';
};

const isComposerDisabled = (status: ChatConversationRouteParams['threadStatus']) => status === 'expired' || status === 'blocked';

const formatStatusLabel = (status: ChatConversationRouteParams['threadStatus']) => {
  if (!status) {
    return 'unknown';
  }

  return status;
};

export function ChatConversationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const services = useServiceLocator();
  const theme = useTheme();

  const params = (route.params as ChatConversationRouteParams | undefined) ?? {};
  const chatId = params.chatId ?? 'unknown-chat';
  const matchId = params.matchId ?? 'unknown-match';
  const counterpartName = params.counterpartName ?? 'Match';
  const threadStatus = params.threadStatus ?? 'active';

  const [draftMessage, setDraftMessage] = useState('');
  const [sendStateText, setSendStateText] = useState<string | undefined>();
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([
    {
      id: `${chatId}-seed-1`,
      sender: 'them',
      text: `Hey, it's ${counterpartName}.`,
      deliveryStatus: 'read',
    },
  ]);

  const composerDisabled = isComposerDisabled(threadStatus);

  const canSend = useMemo(
    () => !composerDisabled && draftMessage.trim().length > 0,
    [composerDisabled, draftMessage]
  );

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const trimmedMessage = draftMessage.trim();
    const pendingMessage: LocalMessage = {
      id: `${chatId}-local-${Date.now()}`,
      sender: 'me',
      text: trimmedMessage,
      deliveryStatus: 'sent',
    };

    setLocalMessages((current) => [...current, pendingMessage]);
    setDraftMessage('');
    setSendStateText(undefined);

    const response = await services.chat.sendMessage(chatId, trimmedMessage);

    if (response.status === 'FAIL') {
      if (isChatEligibilityFailureCode(response.error.code)) {
        const fallbackRoute = resolveChatEligibilityFallbackRoute(response.error.code, params.venueId);

        if (
          shouldReplaceRoute(
            ROUTE_NAMES.ChatConversation,
            fallbackRoute.routeName,
            undefined,
            fallbackRoute.params
          )
        ) {
          navigation.dispatch(StackActions.replace(fallbackRoute.routeName, fallbackRoute.params));
        }

        return;
      }

      setSendStateText(response.error.message);
      return;
    }

    setSendStateText('Message sent in mock mode.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Mock conversation view with composer behavior." title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle={`Chat: ${chatId}`} title={`${counterpartName} Conversation`}>
          <View style={{ gap: theme.spacing.sm }}>
            <View style={styles.summaryRow}>
              <Badge label={`Match: ${matchId}`} tone="info" />
              <Badge label={`Status: ${formatStatusLabel(threadStatus)}`} tone={toStatusTone(threadStatus)} />
              {params.venueId ? <Badge label={`Venue: ${params.venueId}`} tone="info" /> : null}
            </View>

            <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }} style={styles.messagesScroll}>
              {localMessages.map((message) => (
                <ListItem
                  key={message.id}
                  subtitle={`Delivery: ${message.deliveryStatus}`}
                  title={`${message.sender === 'me' ? 'You' : counterpartName}: ${message.text}`}
                />
              ))}
            </ScrollView>

            <Input
              editable={!composerDisabled}
              helperText={composerDisabled ? 'Chat is disabled due to eligibility state.' : 'Send a mock message.'}
              label="Message"
              multiline
              onChangeText={setDraftMessage}
              placeholder={composerDisabled ? 'Chat is disabled.' : 'Type your message...'}
              value={draftMessage}
            />

            {sendStateText ? <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{sendStateText}</Text> : null}

            <View style={styles.actionRow}>
              <Button disabled={!canSend} label="Send" onPress={() => void handleSend()} />
              <Button
                label="Back to Threads"
                onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.ChatThreads))}
                variant="secondary"
              />
            </View>
          </View>
        </Card>
      </View>

      <View style={[styles.bottom, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }]}> 
        <BottomNavShell
          activeKey="chats"
          items={MAIN_TAB_ITEMS}
          onItemPress={(item) => {
            if (!isMainTabKey(item.key)) {
              return;
            }

            const targetRouteName = resolveMainTabRouteName(item.key);

            if (!shouldReplaceRoute(ROUTE_NAMES.ChatConversation, targetRouteName, undefined, undefined)) {
              return;
            }

            navigation.dispatch(StackActions.replace(targetRouteName));
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  bottom: {
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  messagesScroll: {
    maxHeight: 280,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
});