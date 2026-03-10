import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { readAccountSettingsDraftFromParams } from './accountSettingsDraft';

export function AccountDeletionRecoveryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readAccountSettingsDraftFromParams(route.params);

  const isPendingDeletion = draft.status === 'pending_deletion';

  const recoverAccount = () => {
    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.AccountSettings, {
        draft: {
          ...draft,
          status: 'active',
          deletionRequestedAt: null,
        },
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Recover pending account deletions during the mock recovery window." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Account Deletion Recovery Screen">
          <View style={[styles.badgeRow, { marginBottom: theme.spacing.md }]}> 
            <Badge label={draft.status.replace('_', ' ')} tone={isPendingDeletion ? 'warning' : 'success'} />
          </View>

          {isPendingDeletion ? (
            <>
              <Text style={[styles.body, { color: theme.colors.textPrimary, marginBottom: theme.spacing.xs }]}>Deletion requested at: {draft.deletionRequestedAt ?? 'Not available'}</Text>
              <Text style={[styles.body, { color: theme.colors.textSecondary }]}>Recover before {draft.recoveryWindowDays} days pass to keep your account active.</Text>
            </>
          ) : (
            <Text style={[styles.body, { color: theme.colors.textSecondary }]}>Account is currently active. No recovery action is required.</Text>
          )}
        </Card>

        <View style={[styles.actions, { gap: theme.spacing.md }]}> 
          {isPendingDeletion ? <Button label="Recover Account" onPress={recoverAccount} /> : null}
          <Button label="Back to Account Settings" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccountSettings, { draft }))} variant="secondary" />
        </View>
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
    alignItems: 'flex-start',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
  },
});