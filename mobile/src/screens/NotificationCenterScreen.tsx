import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, NotificationListItem, TopBar } from '../components';
import { NotificationRecord } from '../contracts';
import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

function toMillis(instant?: string) {
  if (!instant) {
    return Number.NaN;
  }

  return new Date(instant).getTime();
}

function normalizeNotifications(records: NotificationRecord[]): NotificationRecord[] {
  const byId = records.reduce<Record<string, NotificationRecord>>((accumulator, record) => {
    const existing = accumulator[record.notificationId];
    if (!existing) {
      accumulator[record.notificationId] = record;
      return accumulator;
    }

    const existingUpdatedAtMs = toMillis(existing.updatedAt);
    const nextUpdatedAtMs = toMillis(record.updatedAt);
    const existingCreatedAtMs = toMillis(existing.createdAt);
    const nextCreatedAtMs = toMillis(record.createdAt);

    const shouldReplace =
      nextUpdatedAtMs > existingUpdatedAtMs ||
      (nextUpdatedAtMs === existingUpdatedAtMs && nextCreatedAtMs >= existingCreatedAtMs);

    if (shouldReplace) {
      accumulator[record.notificationId] = record;
    }

    return accumulator;
  }, {});

  return Object.values(byId).sort((left, right) => toMillis(right.createdAt) - toMillis(left.createdAt));
}

export function NotificationCenterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const services = useServiceLocator();
  const theme = useTheme();

  const routeParams =
    (route.params as { returnRouteName?: AppRouteName; returnParams?: Record<string, unknown> } | undefined) ?? {};
  const returnRouteLabel = routeParams.returnRouteName?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'Previous Screen';

  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  const unreadCount = useMemo(() => notifications.filter((entry) => !entry.read).length, [notifications]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.notifications.getNotifications();

      if (response.status === 'FAIL') {
        setNotifications([]);
        setErrorText(response.error.message);
        return;
      }

      setNotifications(normalizeNotifications(response.data));
    } catch {
      setNotifications([]);
      setErrorText('Unable to load notifications right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [services.notifications]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setIsMarkingRead(notificationId);
      setErrorText(undefined);

      try {
        const response = await services.notifications.markAsRead(notificationId);

        if (response.status === 'FAIL') {
          setErrorText(response.error.message);
          return;
        }

        setNotifications((current) =>
          current.map((entry) =>
            entry.notificationId === notificationId
              ? {
                  ...entry,
                  read: true,
                }
              : entry
          )
        );
      } catch {
        setErrorText('Unable to update read state right now. Please try again.');
      } finally {
        setIsMarkingRead(null);
      }
    },
    [services.notifications]
  );

  const handleReturn = useCallback(() => {
    if (!routeParams.returnRouteName) {
      if (shouldReplaceRoute(ROUTE_NAMES.NotificationCenter, ROUTE_NAMES.AccountSettings, undefined, undefined)) {
        navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccountSettings));
      }

      return;
    }

    if (
      shouldReplaceRoute(
        ROUTE_NAMES.NotificationCenter,
        routeParams.returnRouteName,
        undefined,
        routeParams.returnParams
      )
    ) {
      navigation.dispatch(StackActions.replace(routeParams.returnRouteName, routeParams.returnParams));
    }
  }, [navigation, routeParams.returnParams, routeParams.returnRouteName]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}>
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}>
        <TopBar subtitle="In-app notification timeline with read-state transitions." title="Notification Center" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}>
        <Card subtitle="Mock mode deterministic notifications" title="Notification Center Screen">
          <View style={styles.badgeRow}>
            <Badge label={`Total: ${notifications.length}`} tone="info" />
            <Badge label={`Unread: ${unreadCount}`} tone={unreadCount > 0 ? 'warning' : 'success'} />
          </View>
        </Card>

        {isLoading ? (
          <LoadingStateTemplate message="Loading notifications." title="Fetching Notifications" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadNotifications()} title="Notifications Failed" />
        ) : notifications.length === 0 ? (
          <EmptyStateTemplate
            actionLabel="Open Notification Preferences"
            message="No notifications are available in the current mock scenario."
            onAction={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.NotificationPreferences))}
            title="No Notifications"
          />
        ) : (
          <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }} showsVerticalScrollIndicator={false}>
            {notifications.map((entry) => (
              <NotificationListItem
                isMarkingRead={isMarkingRead === entry.notificationId}
                key={entry.notificationId}
                notification={entry}
                onMarkRead={(notificationId) => {
                  void markAsRead(notificationId);
                }}
              />
            ))}
          </ScrollView>
        )}

        <Button
          label="Notification Preferences"
          onPress={() =>
            navigation.dispatch(
              StackActions.push(ROUTE_NAMES.NotificationPreferences, {
                returnRouteName: routeParams.returnRouteName,
                returnParams: routeParams.returnParams,
                returnToNotificationCenter: true,
              })
            )
          }
          variant="secondary"
        />
        <Button
          label={`Return to ${returnRouteLabel}`}
          onPress={handleReturn}
          variant="secondary"
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});