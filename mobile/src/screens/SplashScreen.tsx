import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { resolveAuthEntryRoute } from '../navigation/authEntryRouting';
import { useAuthState } from '../state';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { ShellEntryScreen } from './ShellEntryScreen';

export function SplashScreen() {
  const navigation = useNavigation();
  const { accountStatus, isAuthenticated } = useAuthState();
  const { resolve } = useRouteAccessSelectors();

  useEffect(() => {
    let targetRoute: AppRouteName = resolveAuthEntryRoute({
      isAuthenticated,
      accountStatus,
      isNewUser: false,
    });

    if (targetRoute === ROUTE_NAMES.UserGroup) {
      targetRoute = resolve(ROUTE_NAMES.UserGroup);
    }

    const timeoutId = setTimeout(() => {
      navigation.dispatch(StackActions.replace(targetRoute));
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [accountStatus, isAuthenticated, navigation, resolve]);

  return <ShellEntryScreen title="Splash" subtitle="Application shell bootstrap route." stateTemplate="loading" />;
}