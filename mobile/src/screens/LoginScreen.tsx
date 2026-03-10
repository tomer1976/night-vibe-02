import { StackActions, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, ErrorStateTemplate, Input, LoadingStateTemplate, TopBar } from '../components';
import { resolveAuthEntryRoute } from '../navigation/authEntryRouting';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useAuthState, useOnboardingState } from '../state';
import { useTheme } from '../theme';

export function LoginScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { beginAuthentication, completeAuthentication, resetAuthState } = useAuthState();
  const { setProfileCompleted } = useOnboardingState();
  const services = useServiceLocator();

  const [identityInput, setIdentityInput] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>();
  const [submitErrorText, setSubmitErrorText] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedIdentity = useMemo(() => identityInput.trim().toLowerCase(), [identityInput]);

  const handleLogin = async () => {
    if (normalizedIdentity.length === 0) {
      setErrorText('Enter an email or persona key to continue.');
      return;
    }

    setErrorText(undefined);
    setSubmitErrorText(undefined);
    beginAuthentication();
    setIsSubmitting(true);

    try {
      const loginResponse = await services.auth.login({
        provider: 'google',
        providerToken: normalizedIdentity,
      });

      if (loginResponse.status === 'FAIL') {
        resetAuthState('active', false);
        setProfileCompleted(false);
        setSubmitErrorText(loginResponse.error.message);
        return;
      }

      let resolvedAccountStatus = loginResponse.data.status;
      const accountStatusResponse = await services.accountLifecycle.getAccountStatus();
      if (accountStatusResponse.status === 'SUCCESS') {
        resolvedAccountStatus = accountStatusResponse.data.status;
      }

      const profileResponse = await services.profile.getMyProfile();
      const isProfileCompleted =
        profileResponse.status === 'SUCCESS' ? profileResponse.data.profileCompleted : !loginResponse.data.isNewUser;

      completeAuthentication(resolvedAccountStatus, true);
      setProfileCompleted(isProfileCompleted);

      const targetRoute = resolveAuthEntryRoute({
        isAuthenticated: true,
        accountStatus: resolvedAccountStatus,
        isNewUser: loginResponse.data.isNewUser,
      });

      navigation.dispatch(StackActions.replace(targetRoute));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Login" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        {isSubmitting ? (
          <LoadingStateTemplate
            message="We are validating your mock session and loading account/profile state."
            title="Signing In"
          />
        ) : submitErrorText ? (
          <ErrorStateTemplate
            actionLabel="Try Again"
            message={submitErrorText}
            onAction={() => setSubmitErrorText(undefined)}
            title="Login Failed"
          />
        ) : (
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
                Persona hints: use new, suspended, banned, pending, or deleted in the value.
              </Text>
              <Button label="Sign In" onPress={handleLogin} />
              <Button label="Back to Welcome" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.Welcome))} variant="secondary" />
            </View>
          </Card>
        )}
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
