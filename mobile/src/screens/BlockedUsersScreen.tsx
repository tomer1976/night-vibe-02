import { StackActions, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ListItem, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { sprint01Fixtures, sprint04DiscoveryBlockSkipFixtures } from '../mocks';
import { useTheme } from '../theme';

type BlockedUserView = {
  userId: string;
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'non_binary';
};

const ACTIVE_USER_ID = 'u-regular-1';

function buildSeedBlockedUsers(): BlockedUserView[] {
  const fixture = sprint04DiscoveryBlockSkipFixtures.find((item) => item.viewerUserId === ACTIVE_USER_ID);
  const blockedUserIds = fixture?.blockedUserIds?.length
    ? fixture.blockedUserIds
    : sprint04DiscoveryBlockSkipFixtures[0]?.blockedUserIds ?? [];

  return blockedUserIds
    .map((userId) => {
      const user = sprint01Fixtures.users.find((entry) => entry.uid === userId);

      if (!user) {
        return null;
      }

      return {
        userId: user.uid,
        displayName: user.displayName,
        age: user.age,
        gender: user.gender,
      };
    })
    .filter((user): user is BlockedUserView => user !== null);
}

function formatGender(gender: BlockedUserView['gender']) {
  return gender.replace('_', ' ');
}

export function BlockedUsersScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserView[]>(() => buildSeedBlockedUsers());

  const blockedCount = blockedUsers.length;
  const hasBlockedUsers = blockedCount > 0;
  const summaryLabel = useMemo(() => `${blockedCount} blocked`, [blockedCount]);

  const handleUnblock = (targetUserId: string) => {
    setBlockedUsers((current) => current.filter((user) => user.userId !== targetUserId));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Manage blocked users in deterministic mock mode." title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="Blocked users management" title="Blocked Users Screen">
          {hasBlockedUsers ? (
            <ScrollView contentContainerStyle={{ gap: theme.spacing.sm }} showsVerticalScrollIndicator={false}>
              <Badge label={summaryLabel} tone="warning" />
              {blockedUsers.map((user) => (
                <View key={user.userId} style={{ gap: theme.spacing.xs }}>
                  <ListItem
                    subtitle={`User ID: ${user.userId}`}
                    title={`${user.displayName} • ${user.age} • ${formatGender(user.gender)}`}
                    trailingText="Blocked"
                  />
                  <Button label="Unblock" onPress={() => handleUnblock(user.userId)} variant="secondary" />
                </View>
              ))}
            </ScrollView>
          ) : (
            <EmptyStateTemplate
              actionLabel="Open Safety Center"
              message="You do not have any blocked users right now."
              onAction={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.SafetyCenter))}
              title="No Blocked Users"
            />
          )}

          <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall, marginTop: theme.spacing.sm }}>
            Block state propagates across discovery and chat visibility according to Sprint-05 safety constraints.
          </Text>

          <View style={{ marginTop: theme.spacing.sm }}>
            <Button
              label="Open Safety Center"
              onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.SafetyCenter))}
              variant="secondary"
            />
          </View>
        </Card>
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
});
