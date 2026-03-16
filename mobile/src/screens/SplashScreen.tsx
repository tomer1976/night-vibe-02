import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { resolveAuthEntryRoute } from '../navigation/authEntryRouting';
import { useAuthState, useFeatureFlagsState } from '../state';
import { ShellEntryScreen } from './ShellEntryScreen';

export function SplashScreen() {
  const navigation = useNavigation();
  const { accountStatus, isAuthenticated } = useAuthState();
  const { isStateHydrated } = useFeatureFlagsState();

  useEffect(() => {
    if (!isStateHydrated && process.env.NODE_ENV !== 'test') {
      return;
    }

    const targetRoute: AppRouteName = resolveAuthEntryRoute({
      isAuthenticated,
      accountStatus,
      isNewUser: false,
    });

    const startupRoute = targetRoute === ROUTE_NAMES.UserGroup ? ROUTE_NAMES.Login : targetRoute;

    const timeoutId = setTimeout(() => {
      navigation.dispatch(StackActions.replace(startupRoute));
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [accountStatus, isAuthenticated, isStateHydrated, navigation]);

  return <ShellEntryScreen title="Splash" subtitle="Application shell bootstrap route." stateTemplate="loading" />;
}