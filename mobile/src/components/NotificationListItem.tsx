import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationRecord } from '../contracts';
import { getSurfaceElevationStyle, useTheme } from '../theme';
import { Badge } from './Badge';

type NotificationBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type NotificationTypeVariant = {
  label: string;
  tone: NotificationBadgeTone;
  fallbackTitle: string;
  fallbackBody: string;
};

type NotificationListItemProps = {
  notification: NotificationRecord;
  isMarkingRead?: boolean;
  onMarkRead?: (notificationId: string) => void;
};

const VARIANT_BY_TYPE: Record<NotificationRecord['type'], NotificationTypeVariant> = {
  match_notification: {
    label: 'Match',
    tone: 'success',
    fallbackTitle: 'New match update',
    fallbackBody: 'A match lifecycle event requires your attention.',
  },
  message_notification: {
    label: 'Message',
    tone: 'info',
    fallbackTitle: 'New message',
    fallbackBody: 'You received a new message in a current chat thread.',
  },
  venue_activity_notification: {
    label: 'Venue',
    tone: 'info',
    fallbackTitle: 'Venue activity update',
    fallbackBody: 'A venue activity event was recorded in your current context.',
  },
  safety_notification: {
    label: 'Safety',
    tone: 'warning',
    fallbackTitle: 'Safety action update',
    fallbackBody: 'A block/report or enforcement state changed and needs review.',
  },
  system_notification: {
    label: 'System',
    tone: 'danger',
    fallbackTitle: 'System notice',
    fallbackBody: 'A system-level event affects your current experience.',
  },
};

const buildReadStateTone = (read: boolean): NotificationBadgeTone => (read ? 'success' : 'warning');

export function NotificationListItem({ notification, isMarkingRead = false, onMarkRead }: NotificationListItemProps) {
  const theme = useTheme();
  const variant = VARIANT_BY_TYPE[notification.type];
  const title = notification.title ?? variant.fallbackTitle;
  const body = notification.body ?? variant.fallbackBody;
  const canMarkRead = !notification.read && !isMarkingRead && Boolean(onMarkRead);
  const markReadLabel = isMarkingRead ? 'Marking...' : notification.read ? 'Read' : 'Mark read';
  const readStateLabel = notification.read ? 'Read' : 'Unread';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: notification.read ? theme.colors.backgroundSecondary : theme.colors.surfaceCard,
          borderColor: notification.read ? theme.colors.backgroundSecondary : theme.colors.accentPrimary,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        },
        getSurfaceElevationStyle('low'),
      ]}
    >
      <View style={[styles.header, { marginBottom: theme.spacing.sm }]}> 
        <View style={styles.badgeRow}>
          <Badge label={variant.label} tone={variant.tone} />
          <Badge label={readStateLabel} tone={buildReadStateTone(notification.read)} />
        </View>
        {onMarkRead ? (
          <Pressable
            accessibilityRole="button"
            disabled={!canMarkRead}
            onPress={() => {
              if (canMarkRead) {
                onMarkRead(notification.notificationId);
              }
            }}
          >
            <Text
              style={[
                styles.markReadLabel,
                {
                  color: canMarkRead ? theme.colors.accentSecondary : theme.colors.textSecondary,
                  fontSize: theme.typography.meta,
                },
              ]}
            >
              {markReadLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.title, { color: theme.colors.textPrimary, fontSize: theme.typography.body }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    gap: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  markReadLabel: {
    fontWeight: '600',
  },
  title: {
    fontWeight: '700',
  },
  body: {
    lineHeight: 20,
  },
});
