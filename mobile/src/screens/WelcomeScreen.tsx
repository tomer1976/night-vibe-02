import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';

export function WelcomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Welcome" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        <Card subtitle="Sign in to continue with your mock authentication flow." title="Welcome Screen">
          <View style={{ gap: theme.spacing.md }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.body }}>
              Continue to login or recover a pending deletion session.
            </Text>
            <Button label="Go to Login" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.Login))} />
            <Button
              label="Session Recovery"
              onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.SessionRecovery))}
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
    justifyContent: 'center',
  },
});
