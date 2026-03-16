import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { resolveAuthEntryRoute } from '../navigation/authEntryRouting';
import { useAuthState, useFeatureFlagsState, useOnboardingState } from '../state';
import { ShellEntryScreen } from './ShellEntryScreen';

export function SplashScreen() {
  const navigation = useNavigation();
  const { accountStatus, isAuthenticated } = useAuthState();
  const { isStateHydrated } = useFeatureFlagsState();
  const { profileCompleted } = useOnboardingState();

  useEffect(() => {
    if (!isStateHydrated && process.env.NODE_ENV !== 'test') {
      return;
    }

    const targetRoute: AppRouteName = resolveAuthEntryRoute({
      isAuthenticated,
      accountStatus,
      isNewUser: false,
    });

    const startupRoute =
      targetRoute === ROUTE_NAMES.UserGroup
        ? profileCompleted
          ? ROUTE_NAMES.NearbyVenues
          : ROUTE_NAMES.ProfileCompletionRequired
        : targetRoute;

    const timeoutId = setTimeout(() => {
      navigation.dispatch(StackActions.replace(startupRoute));
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [accountStatus, isAuthenticated, isStateHydrated, navigation, profileCompleted]);

  return <ShellEntryScreen title="Splash" subtitle="Application shell bootstrap route." stateTemplate="loading" />;
}