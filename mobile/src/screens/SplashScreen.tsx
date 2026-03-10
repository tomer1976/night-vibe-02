import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { useAuthState } from '../state';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { ShellEntryScreen } from './ShellEntryScreen';

export function SplashScreen() {
  const navigation = useNavigation();
  const { accountStatus, isAuthenticated } = useAuthState();
  const { resolve } = useRouteAccessSelectors();

  useEffect(() => {
    let targetRoute: AppRouteName = ROUTE_NAMES.Welcome;

    if (!isAuthenticated) {
      targetRoute = ROUTE_NAMES.Welcome;
    } else if (accountStatus === 'pending_deletion') {
      targetRoute = ROUTE_NAMES.SessionRecovery;
    } else if (accountStatus === 'suspended' || accountStatus === 'banned' || accountStatus === 'deleted') {
      targetRoute = ROUTE_NAMES.AccessDenied;
    } else {
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