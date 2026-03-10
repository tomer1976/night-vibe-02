import { StackActions, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Input, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useAuthState } from '../state';
import { useTheme } from '../theme';

export function LoginScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { setAccountStatus, setAuthenticated } = useAuthState();

  const [identityInput, setIdentityInput] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>();

  const normalizedIdentity = useMemo(() => identityInput.trim().toLowerCase(), [identityInput]);

  const handleLogin = () => {
    if (normalizedIdentity.length === 0) {
      setErrorText('Enter an email or persona key to continue.');
      return;
    }

    setErrorText(undefined);

    if (normalizedIdentity.includes('pending')) {
      setAuthenticated(true);
      setAccountStatus('pending_deletion');
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.SessionRecovery));
      return;
    }

    if (normalizedIdentity.includes('suspended')) {
      setAuthenticated(true);
      setAccountStatus('suspended');
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccessDenied));
      return;
    }

    if (normalizedIdentity.includes('banned')) {
      setAuthenticated(true);
      setAccountStatus('banned');
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccessDenied));
      return;
    }

    if (normalizedIdentity.includes('deleted')) {
      setAuthenticated(true);
      setAccountStatus('deleted');
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccessDenied));
      return;
    }

    setAuthenticated(true);
    setAccountStatus('active');
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Login" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        <Card subtitle="Mock login accepts persona keys in the input value." title="Login Screen">
          <View style={{ gap: theme.spacing.md }}>
            <Input
              autoCapitalize="none"
              errorText={errorText}
              label="Email or Persona"
              onChangeText={setIdentityInput}
              placeholder="active-user@example.com"
              testID="login-identity-input"
              value={identityInput}
            />
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
              Persona hints: use suspended, banned, pending, or deleted in the value.
            </Text>
            <Button label="Sign In" onPress={handleLogin} />
            <Button label="Back to Welcome" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.Welcome))} variant="secondary" />
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
