import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountStateBannerCard, Button, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useAccountLifecycleState } from '../state';
import { useTheme } from '../theme';

export function AccountDeletionRecoveryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { recoverAccount, savedDraft: draft } = useAccountLifecycleState();

  const isPendingDeletion = draft.status === 'pending_deletion';

  const handleRecoverAccount = () => {
    recoverAccount();
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccountSettings));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Recover pending account deletions during the mock recovery window." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <AccountStateBannerCard
          detail={
            isPendingDeletion
              ? `Deletion requested at: ${draft.deletionRequestedAt ?? 'Not available'}`
              : 'Account is currently active. No recovery action is required.'
          }
          statusLabel={draft.status.replace('_', ' ').toUpperCase()}
          subtitle={
            isPendingDeletion
              ? `Recover before ${draft.recoveryWindowDays} days pass to keep your account active.`
              : 'Recovery is available only while account status is pending deletion.'
          }
          title="Account Deletion Recovery Screen"
          tone={isPendingDeletion ? 'warning' : 'success'}
        />

        <View style={[styles.actions, { gap: theme.spacing.md }]}> 
          {isPendingDeletion ? <Button label="Recover Account" onPress={handleRecoverAccount} /> : null}
          <Button label="Open Account Settings" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccountSettings))} variant="secondary" />
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
  actions: {
    width: '100%',
  },
});