import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, ListItem, LoadingStateTemplate, TopBar } from '../components';
import { NotificationRecord } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

const formatTypeLabel = (type: NotificationRecord['type']) => type.replaceAll('_', ' ');

const typeToneByType: Record<NotificationRecord['type'], 'info' | 'success' | 'warning' | 'danger'> = {
  match_notification: 'success',
  message_notification: 'info',
  venue_activity_notification: 'info',
  safety_notification: 'warning',
  system_notification: 'danger',
};

export function NotificationCenterScreen() {
  const navigation = useNavigation();
  const services = useServiceLocator();
  const theme = useTheme();

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

      setNotifications(response.data);
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
              <View key={entry.notificationId} style={{ gap: theme.spacing.xs }}>
                <ListItem
                  onPress={entry.read ? undefined : () => void markAsRead(entry.notificationId)}
                  subtitle={`Type: ${formatTypeLabel(entry.type)}`}
                  title={`Notification ${entry.notificationId}`}
                  trailingText={entry.read ? 'Read' : isMarkingRead === entry.notificationId ? 'Marking...' : 'Mark read'}
                />
                <View style={styles.notificationMeta}>
                  <Badge label={entry.read ? 'Read' : 'Unread'} tone={entry.read ? 'success' : 'warning'} />
                  <Badge label={formatTypeLabel(entry.type)} tone={typeToneByType[entry.type]} />
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Button
          label="Notification Preferences"
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.NotificationPreferences))}
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
  notificationMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});