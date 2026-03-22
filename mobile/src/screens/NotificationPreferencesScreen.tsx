import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ListItem, TopBar } from '../components';
import { NotificationRecord } from '../contracts';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';

type PreferenceState = Record<NotificationRecord['type'], boolean>;

const DEFAULT_PREFERENCES: PreferenceState = {
  match_notification: true,
  message_notification: true,
  venue_activity_notification: true,
  safety_notification: true,
  system_notification: true,
};

const preferenceCopy: Record<NotificationRecord['type'], { title: string; subtitle: string }> = {
  match_notification: {
    title: 'Match Notifications',
    subtitle: 'Notify when a new mutual match is created in active venue context.',
  },
  message_notification: {
    title: 'Message Notifications',
    subtitle: 'Notify for new chat messages while eligibility remains active.',
  },
  venue_activity_notification: {
    title: 'Venue Activity Notifications',
    subtitle: 'Notify for relevant venue activity and check-in state transitions.',
  },
  safety_notification: {
    title: 'Safety Notifications',
    subtitle: 'Notify for safety actions, reports, and enforcement outcomes.',
  },
  system_notification: {
    title: 'System Notifications',
    subtitle: 'Notify for service-level status and account lifecycle updates.',
  },
};

export function NotificationPreferencesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const [preferences, setPreferences] = useState<PreferenceState>(DEFAULT_PREFERENCES);
  const routeParams =
    (route.params as {
      returnRouteName?: AppRouteName;
      returnParams?: Record<string, unknown>;
      returnToNotificationCenter?: boolean;
    } | undefined) ?? {};
  const returnRouteLabel = routeParams.returnRouteName?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'Previous Screen';

  const enabledCount = useMemo(() => Object.values(preferences).filter(Boolean).length, [preferences]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}>
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}>
        <TopBar subtitle="Toggle in-app notification categories for mock preference behavior." title="Notification Preferences" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}>
        <Card subtitle="Preference filtering used by notification list simulations." title="Notification Preferences Screen">
          <View style={styles.badgeRow}>
            <Badge label={`Enabled: ${enabledCount}`} tone={enabledCount === 0 ? 'danger' : 'success'} />
            <Badge label={`Disabled: ${Object.keys(preferences).length - enabledCount}`} tone="warning" />
          </View>

          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall, marginTop: theme.spacing.sm }}>
            These toggles are persisted in local screen state for Sprint-05 UI simulation. Contract-backed preference storage is implemented in a later task.
          </Text>
        </Card>

        {(Object.keys(preferences) as NotificationRecord['type'][]).map((type) => (
          <ListItem
            key={type}
            onPress={() =>
              setPreferences((current) => ({
                ...current,
                [type]: !current[type],
              }))
            }
            subtitle={preferenceCopy[type].subtitle}
            title={preferenceCopy[type].title}
            trailingText={preferences[type] ? 'Enabled' : 'Disabled'}
          />
        ))}

        {routeParams.returnToNotificationCenter ? (
          <Button
            label="Back to Notification Center"
            onPress={() => {
              if (
                shouldReplaceRoute(
                  ROUTE_NAMES.NotificationPreferences,
                  ROUTE_NAMES.NotificationCenter,
                  undefined,
                  {
                    returnRouteName: routeParams.returnRouteName,
                    returnParams: routeParams.returnParams,
                  }
                )
              ) {
                navigation.dispatch(
                  StackActions.replace(ROUTE_NAMES.NotificationCenter, {
                    returnRouteName: routeParams.returnRouteName,
                    returnParams: routeParams.returnParams,
                  })
                );
              }
            }}
            variant="secondary"
          />
        ) : null}

        <Button
          label={`Return to ${returnRouteLabel}`}
          onPress={() => {
            if (!routeParams.returnRouteName) {
              if (
                shouldReplaceRoute(
                  ROUTE_NAMES.NotificationPreferences,
                  ROUTE_NAMES.AccountSettings,
                  undefined,
                  undefined
                )
              ) {
                navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccountSettings));
              }

              return;
            }

            if (
              shouldReplaceRoute(
                ROUTE_NAMES.NotificationPreferences,
                routeParams.returnRouteName,
                undefined,
                routeParams.returnParams
              )
            ) {
              navigation.dispatch(StackActions.replace(routeParams.returnRouteName, routeParams.returnParams));
            }
          }}
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