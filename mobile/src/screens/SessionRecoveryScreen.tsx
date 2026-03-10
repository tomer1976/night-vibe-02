import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
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
        <Card subtitle="Your account is in a pending deletion recovery window." title="Session Recovery Screen">
          <View style={{ gap: theme.spacing.md }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.body }}>
              Recover now to return your account to active status.
            </Text>
            <Button label="Recover Account" onPress={recoverSession} />
            <Button label="Cancel and Exit" onPress={cancelRecovery} variant="secondary" />
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
    justifyContent: 'center',
  },
});
