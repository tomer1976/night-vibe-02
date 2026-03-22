import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ListItem, SafetyStatusBanner, TopBar } from '../components';
import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { sprint04DiscoveryBlockSkipFixtures } from '../mocks';
import { useTheme } from '../theme';

const ACTIVE_USER_ID = 'u-regular-1';

function getBlockedCount() {
  const fixture = sprint04DiscoveryBlockSkipFixtures.find((item) => item.viewerUserId === ACTIVE_USER_ID);
  return fixture?.blockedUserIds.length ?? 0;
}

export function SafetyCenterScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  const blockedCount = getBlockedCount();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Safety actions and enforcement overview." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="Cross-surface safety controls" title="Safety Center Screen">
          <View style={styles.badgeRow}>
            <Badge label={`Blocked users: ${blockedCount}`} tone="warning" />
            <Badge label="Reports: mock mode" tone="info" />
          </View>

          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall, marginTop: theme.spacing.sm }}>
            Safety actions immediately impact chat eligibility and discovery visibility in Sprint-05 mock scenarios.
          </Text>

          <View style={{ marginTop: theme.spacing.sm }}>
            <SafetyStatusBanner
              detail="Cross-surface enforcement is active: block/report actions immediately affect discovery and chat states."
              statusLabel="Enforcement Active"
              title="Safety Status"
              tone="warning"
            />
          </View>
        </Card>

        <ListItem
          onPress={() =>
            navigation.dispatch(
              StackActions.push(ROUTE_NAMES.NotificationCenter, {
                returnRouteName: ROUTE_NAMES.SafetyCenter as AppRouteName,
              })
            )
          }
          subtitle="Review notification timeline for safety and chat events"
          title="Notification Center Screen"
          trailingText="Open"
        />

        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.BlockedUsers))}
          subtitle="Review and unblock users from your blocked list"
          title="Blocked Users Screen"
          trailingText="Open"
        />

        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.ReportUser, { targetUserId: 'u-discovery-1', targetDisplayName: 'Riley', matchId: 'match-u-regular-1-u-discovery-1' }))}
          subtitle="Submit a report with deterministic mock outcomes"
          title="Report User Screen"
          trailingText="Open"
        />

        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.BlockUserConfirmation, { targetUserId: 'u-discovery-1', targetDisplayName: 'Riley', matchId: 'match-u-regular-1-u-discovery-1' }))}
          subtitle="Confirm immediate block action propagation"
          title="Block User Confirmation Screen"
          trailingText="Open"
        />

        <Button label="Open Chat Threads" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.ChatThreads))} variant="secondary" />
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
