import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BottomNavShell, Button, Card, Input, SafetyStatusBanner, TopBar } from '../components';
import { ChatEligibilityFailureReason } from '../contracts';
import { isChatEligibilityFailureCode, resolveChatEligibilityFallbackRoute } from '../navigation/chatEligibilityRouteGuard';
import { isMainTabKey, MAIN_TAB_ITEMS, resolveMainTabRouteName } from '../navigation/mainTabs';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

type ChatConversationRouteParams = {
  chatId?: string;
  matchId?: string;
  counterpartUserId?: string;
  counterpartName?: string;
  threadStatus?: 'active' | 'expired' | 'blocked';
  venueId?: string;
};

type LocalMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  sentAtIso: string;
};

const DELIVERY_LABEL: Record<LocalMessage['deliveryStatus'], string> = {
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed',
};

const DELIVERY_TONE: Record<LocalMessage['deliveryStatus'], 'info' | 'success' | 'warning' | 'danger'> = {
  sent: 'info',
  delivered: 'info',
  read: 'success',
  failed: 'danger',
};

const DELIVERY_ROW_LABEL: Record<LocalMessage['deliveryStatus'], string> = {
  sent: 'Delivery: Sent',
  delivered: 'Delivery: Delivered',
  read: 'Delivery: Read',
  failed: 'Delivery: Failed',
};

const getDisabledReasonLabel = (reason: ChatEligibilityFailureReason | 'thread_blocked' | 'thread_expired' | undefined) => {
  if (reason === 'blocked' || reason === 'thread_blocked') {
    return 'Chat is disabled because a safety block is active.';
  }

  if (reason === 'moderation_action') {
    return 'Chat is disabled due to a moderation action on this conversation.';
  }

  if (reason === 'left_venue') {
    return 'Chat is disabled because you are no longer checked in at this venue.';
  }

  if (reason === 'not_checked_in') {
    return 'Chat is disabled because no active venue session was found.';
  }

  if (reason === 'match_expired' || reason === 'thread_expired') {
    return 'Chat is disabled because the match or co-location eligibility expired.';
  }

  return 'Send a mock message.';
};

const formatMessageTime = (isoTimestamp: string) => {
  const timestamp = new Date(isoTimestamp);
  if (Number.isNaN(timestamp.getTime())) {
    return '--:--';
  }

  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
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

const isComposerDisabled = (
  status: ChatConversationRouteParams['threadStatus'],
  reason: ChatEligibilityFailureReason | undefined
) => status === 'expired' || status === 'blocked' || Boolean(reason);

const formatStatusLabel = (status: ChatConversationRouteParams['threadStatus']) => {
  if (!status) {
    return 'unknown';
  }

  return status;
};

const ELIGIBILITY_REFRESH_INTERVAL_MS = 5_000;

export function ChatConversationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const services = useServiceLocator();
  const theme = useTheme();

  const params = (route.params as ChatConversationRouteParams | undefined) ?? {};
  const chatId = params.chatId ?? 'unknown-chat';
  const matchId = params.matchId ?? 'unknown-match';
  const counterpartUserId = params.counterpartUserId;
  const counterpartName = params.counterpartName ?? 'Match';
  const threadStatus = params.threadStatus ?? 'active';

  const [draftMessage, setDraftMessage] = useState('');
  const [sendStateText, setSendStateText] = useState<string | undefined>();
  const [eligibilityFailureReason, setEligibilityFailureReason] = useState<ChatEligibilityFailureReason | undefined>();
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([
    {
      id: `${chatId}-seed-1`,
      sender: 'them',
      text: `Hey, it's ${counterpartName}.`,
      deliveryStatus: 'read',
      sentAtIso: new Date(Date.now() - 60_000).toISOString(),
    },
  ]);
  const activeDeliveryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const statusFallbackReason = useMemo<
    ChatEligibilityFailureReason | 'thread_blocked' | 'thread_expired' | undefined
  >(() => {
    if (eligibilityFailureReason) {
      return eligibilityFailureReason;
    }

    if (threadStatus === 'blocked') {
      return 'thread_blocked';
    }

    if (threadStatus === 'expired') {
      return 'thread_expired';
    }

    return undefined;
  }, [eligibilityFailureReason, threadStatus]);

  const composerDisabled = isComposerDisabled(threadStatus, eligibilityFailureReason);

  const canSend = useMemo(
    () => !composerDisabled && draftMessage.trim().length > 0,
    [composerDisabled, draftMessage]
  );

  const validateConversationEntryEligibility = useCallback(async () => {
    if (!params.chatId) {
      return;
    }

    const response = await services.chat.getEligibility(params.chatId);

    if (response.status === 'SUCCESS') {
      setEligibilityFailureReason(response.data.eligible ? undefined : response.data.reason);
      return;
    }

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
    }
  }, [navigation, params.chatId, params.venueId, services.chat]);

  useEffect(() => {
    let cancelled = false;

    const refreshEligibility = async () => {
      await validateConversationEntryEligibility();

      if (cancelled) {
        return;
      }
    };

    void refreshEligibility();
    const intervalId = setInterval(() => {
      void refreshEligibility();
    }, ELIGIBILITY_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [validateConversationEntryEligibility]);

  useEffect(
    () => () => {
      for (const timer of activeDeliveryTimers.current) {
        clearTimeout(timer);
      }

      activeDeliveryTimers.current = [];
    },
    []
  );

  const scheduleDeliveryTransitions = (messageId: string) => {
    const deliveredTimer = setTimeout(() => {
      setLocalMessages((current) =>
        current.map((message) =>
          message.id === messageId && message.deliveryStatus === 'sent'
            ? { ...message, deliveryStatus: 'delivered' }
            : message
        )
      );
    }, 600);

    const readTimer = setTimeout(() => {
      setLocalMessages((current) =>
        current.map((message) =>
          message.id === messageId && message.deliveryStatus === 'delivered'
            ? { ...message, deliveryStatus: 'read' }
            : message
        )
      );
    }, 1400);

    activeDeliveryTimers.current.push(deliveredTimer, readTimer);
  };

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
      sentAtIso: new Date().toISOString(),
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

      setLocalMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id ? { ...message, deliveryStatus: 'failed' } : message
        )
      );
      setSendStateText(response.error.message);
      return;
    }

    scheduleDeliveryTransitions(pendingMessage.id);
    setSendStateText('Message sent in mock mode. Delivery state will update automatically.');
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

            {statusFallbackReason ? (
              <SafetyStatusBanner
                detail={getDisabledReasonLabel(statusFallbackReason)}
                statusLabel="Chat Disabled"
                title="Safety Eligibility Status"
                tone="warning"
              />
            ) : (
              <SafetyStatusBanner
                detail="Chat is active for this match and venue session."
                statusLabel="Chat Enabled"
                title="Safety Eligibility Status"
                tone="success"
              />
            )}

            <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }} style={styles.messagesScroll}>
              {localMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.sender === 'me' ? styles.messageRowMine : styles.messageRowTheirs,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor:
                          message.sender === 'me' ? theme.colors.accentPrimary : theme.colors.backgroundSecondary,
                        borderRadius: theme.radius.md,
                        borderColor: theme.colors.surfaceCard,
                      },
                    ]}
                  >
                    <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>{message.text}</Text>
                    <View style={styles.messageMetaRow}>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
                        {formatMessageTime(message.sentAtIso)}
                      </Text>
                      {message.sender === 'me' ? (
                        <View style={styles.deliveryStatusRow}>
                          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
                            {DELIVERY_ROW_LABEL[message.deliveryStatus]}
                          </Text>
                          <Badge
                            label={DELIVERY_LABEL[message.deliveryStatus]}
                            tone={DELIVERY_TONE[message.deliveryStatus]}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <Input
              editable={!composerDisabled}
              helperText={getDisabledReasonLabel(statusFallbackReason)}
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
                label="Open Threads"
                onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.ChatThreads))}
                variant="secondary"
              />
            </View>

            <View style={styles.actionRow}>
              <Button
                disabled={!counterpartUserId}
                label="Report User"
                onPress={() =>
                  navigation.dispatch(
                    StackActions.push(ROUTE_NAMES.ReportUser, {
                      sourceRouteName: ROUTE_NAMES.ChatConversation,
                      targetDisplayName: counterpartName,
                      targetUserId: counterpartUserId,
                      matchId,
                      venueId: params.venueId,
                      chatId,
                    })
                  )
                }
                variant="secondary"
              />
              <Button
                disabled={!counterpartUserId}
                label="Block User"
                onPress={() =>
                  navigation.dispatch(
                    StackActions.push(ROUTE_NAMES.BlockUserConfirmation, {
                      sourceRouteName: ROUTE_NAMES.ChatConversation,
                      targetDisplayName: counterpartName,
                      targetUserId: counterpartUserId,
                      matchId,
                      venueId: params.venueId,
                      chatId,
                    })
                  )
                }
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
  messageRow: {
    width: '100%',
  },
  messageRowMine: {
    alignItems: 'flex-end',
  },
  messageRowTheirs: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderWidth: 1,
    gap: 6,
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  deliveryStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
});