import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountStateBannerCard, Button, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useAuthState } from '../state';
import { useTheme } from '../theme';

export function SessionRecoveryScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { setAccountStatus, setAuthenticated } = useAuthState();

  const recoverSession = () => {
    setAuthenticated(true);
    setAccountStatus('active');
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup));
  };

  const cancelRecovery = () => {
    setAuthenticated(false);
    setAccountStatus('pending_deletion');
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.Welcome));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Session Recovery" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        <AccountStateBannerCard
          detail="Recover now to return your account to active status."
          statusLabel="PENDING DELETION"
          subtitle="Your account is in a pending deletion recovery window."
          title="Session Recovery Screen"
          tone="warning"
        >
          <View style={{ gap: theme.spacing.md }}>
            <Button label="Recover Account" onPress={recoverSession} />
            <Button label="Cancel and Exit" onPress={cancelRecovery} variant="secondary" />
          </View>
        </AccountStateBannerCard>
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
    justifyContent: 'center',
  },
});
