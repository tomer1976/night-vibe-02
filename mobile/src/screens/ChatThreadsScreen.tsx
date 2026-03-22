import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BottomNavShell, Button, Card, EmptyStateTemplate, ErrorStateTemplate, ListItem, LoadingStateTemplate, TopBar } from '../components';
import { ChatThread } from '../contracts';
import { isChatEligibilityFailureCode, resolveChatEligibilityFallbackRoute } from '../navigation/chatEligibilityRouteGuard';
import { isMainTabKey, MAIN_TAB_ITEMS, resolveMainTabRouteName } from '../navigation/mainTabs';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

const formatGenderLabel = (gender: ChatThread['counterpart']['gender']) => gender.replace('_', ' ');
const formatThreadStatusLabel = (status: ChatThread['status']) => status.replace('_', ' ');
const formatDeliveryLabel = (status: ChatThread['latestMessage']['deliveryStatus']) => status.replace('_', ' ');

const toThreadStatusTone = (status: ChatThread['status']): 'success' | 'warning' | 'danger' => {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'expired') {
    return 'warning';
  }

  return 'danger';
};

export function ChatThreadsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const services = useServiceLocator();
  const theme = useTheme();

  const routeParams =
    (route.params as { venueId?: string; matchId?: string; openConversation?: boolean } | undefined) ?? {};

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [threads, setThreads] = useState<ChatThread[]>([]);

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.chat.getThreads();

      if (response.status === 'FAIL') {
        if (isChatEligibilityFailureCode(response.error.code)) {
          const fallbackRoute = resolveChatEligibilityFallbackRoute(response.error.code, routeParams.venueId);

          if (
            shouldReplaceRoute(
              ROUTE_NAMES.ChatThreads,
              fallbackRoute.routeName,
              undefined,
              fallbackRoute.params
            )
          ) {
            navigation.dispatch(StackActions.replace(fallbackRoute.routeName, fallbackRoute.params));
          }

          return;
        }

        setThreads([]);
        setErrorText(response.error.message);
        return;
      }

      setThreads(response.data);
    } catch {
      setThreads([]);
      setErrorText('Unable to load chat threads right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigation, routeParams.venueId, services.chat]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const orderedThreads = useMemo(
    () => [...threads].sort((left, right) => new Date(right.latestMessage.sentAt).getTime() - new Date(left.latestMessage.sentAt).getTime()),
    [threads]
  );

  const activeThreadCount = useMemo(() => threads.filter((thread) => thread.status === 'active').length, [threads]);

  const openConversation = useCallback(
    (thread: ChatThread) => {
      navigation.dispatch(
        StackActions.push(ROUTE_NAMES.ChatConversation, {
          chatId: thread.chatId,
          matchId: thread.matchId,
          counterpartUserId: thread.counterpart.userId,
          counterpartName: thread.counterpart.displayName,
          threadStatus: thread.status,
          venueId: routeParams.venueId,
        })
      );
    },
    [navigation, routeParams.venueId]
  );

  useEffect(() => {
    if (!routeParams.openConversation || !routeParams.matchId || orderedThreads.length === 0) {
      return;
    }

    const matchedThread = orderedThreads.find((thread) => thread.matchId === routeParams.matchId);

    if (!matchedThread) {
      return;
    }

    openConversation(matchedThread);
  }, [openConversation, orderedThreads, routeParams.matchId, routeParams.openConversation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Thread previews with latest message and status." title="Night Vibe" variant="main-tab" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="Mock chat thread timeline." title="Chat Threads Screen">
          {isLoading ? (
            <LoadingStateTemplate message="Loading your chat threads." title="Fetching Threads" />
          ) : errorText ? (
            <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadThreads()} title="Threads Failed" />
          ) : orderedThreads.length === 0 ? (
            <EmptyStateTemplate
              actionLabel="Open Nearby Venues"
              message="No chat threads are available yet."
              onAction={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))}
              title="No Chat Threads"
            />
          ) : (
            <ScrollView contentContainerStyle={{ gap: theme.spacing.md }} showsVerticalScrollIndicator={false}>
              <View style={styles.summaryRow}>
                <Badge label={`Threads: ${orderedThreads.length}`} tone="info" />
                <Badge label={`Active: ${activeThreadCount}`} tone="success" />
                {routeParams.venueId ? <Badge label={`Venue scope: ${routeParams.venueId}`} tone="info" /> : null}
              </View>

              {orderedThreads.map((thread) => (
                <View key={thread.chatId} style={{ gap: theme.spacing.xs }}>
                  <ListItem
                    subtitle={`${thread.latestMessage.text} (${formatDeliveryLabel(thread.latestMessage.deliveryStatus)})`}
                    title={`${thread.counterpart.displayName} • ${thread.counterpart.age} • ${formatGenderLabel(thread.counterpart.gender)}`}
                    trailingText={thread.unreadCount > 0 ? `${thread.unreadCount} new` : 'Open'}
                    onPress={() => openConversation(thread)}
                  />
                  <View style={styles.threadMetaRow}>
                    <Badge label={`Status: ${formatThreadStatusLabel(thread.status)}`} tone={toThreadStatusTone(thread.status)} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>Match: {thread.matchId}</Text>
                  </View>
                </View>
              ))}

              <Button label="Open Nearby Venues" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))} variant="secondary" />
              <Button
                label="Notification Center"
                onPress={() =>
                  navigation.dispatch(
                    StackActions.push(ROUTE_NAMES.NotificationCenter, {
                      returnRouteName: ROUTE_NAMES.ChatThreads as AppRouteName,
                      returnParams: routeParams.venueId
                        ? {
                            venueId: routeParams.venueId,
                          }
                        : undefined,
                    })
                  )
                }
                variant="secondary"
              />
            </ScrollView>
          )}
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

            if (!shouldReplaceRoute(ROUTE_NAMES.ChatThreads, targetRouteName, undefined, undefined)) {
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
  threadMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
});