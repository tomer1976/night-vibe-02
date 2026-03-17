import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountStateBannerCard, Button, TopBar } from '../components';
import { useAuthState } from '../state';
import { useTheme } from '../theme';
import { ROUTE_NAMES } from '../navigation/routeGroups';

const ACCOUNT_STATUS_COPY: Record<'suspended' | 'banned' | 'deleted', string> = {
  suspended: 'Your account is suspended. Access is temporarily denied.',
  banned: 'Your account is banned. Access is permanently denied.',
  deleted: 'Your account is deleted. Login is not available.',
};

export function AccessDeniedScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { accountStatus, resetAuthState } = useAuthState();

  const deniedReason =
    accountStatus === 'banned' || accountStatus === 'suspended' || accountStatus === 'deleted'
      ? ACCOUNT_STATUS_COPY[accountStatus]
      : 'Your account status does not allow access right now.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Access Denied" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        <AccountStateBannerCard
          detail="Contact support if you believe this is a mistake."
          statusLabel={accountStatus.toUpperCase()}
          subtitle={deniedReason}
          title="Account Access Denied Screen"
          tone="danger"
        >
          <View style={{ gap: theme.spacing.md }}>
            <Button
              label="Open Welcome"
              onPress={() => {
                resetAuthState('active', false);
                navigation.dispatch(StackActions.replace(ROUTE_NAMES.Welcome));
              }}
            />
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
