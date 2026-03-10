import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ListItem, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { readAccountSettingsDraftFromParams } from './accountSettingsDraft';

const statusToneByValue = {
  active: 'success',
  suspended: 'warning',
  banned: 'danger',
  pending_deletion: 'warning',
  deleted: 'danger',
} as const;

export function AccountSettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readAccountSettingsDraftFromParams(route.params);

  const linkedProviders = draft.linkedAccounts.filter((account) => account.linked).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Manage account status, linked providers, and deletion lifecycle." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Account Settings Screen">
          <View style={[styles.row, { marginBottom: theme.spacing.md }]}> 
            <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>Account Status</Text>
            <Badge label={draft.status.replace('_', ' ')} tone={statusToneByValue[draft.status]} />
          </View>

          <Text style={[styles.value, { color: theme.colors.textPrimary, fontSize: theme.typography.body, marginBottom: theme.spacing.xs }]}>
            Linked Providers: {linkedProviders}/{draft.linkedAccounts.length}
          </Text>
          <Text style={[styles.value, { color: theme.colors.textSecondary, fontSize: theme.typography.body }]}>Recovery Window: {draft.recoveryWindowDays} days</Text>
        </Card>

        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.LinkedAccounts, { draft }))}
          subtitle="Link and unlink provider accounts"
          title="Linked Accounts Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.DeleteAccount, { draft }))}
          subtitle="Request account deletion and start recovery window"
          title="Delete Account Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.AccountDeletionRecovery, { draft }))}
          subtitle="Cancel pending deletion within recovery window"
          title="Account Deletion Recovery Screen"
          trailingText="Open"
        />

        <Button label="Back to Profile" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserProfile))} variant="secondary" />
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
  },
  value: {
  },
});