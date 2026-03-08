import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { ShellEntryScreen } from './ShellEntryScreen';

export function SplashScreen() {
  const navigation = useNavigation();
  const { resolve, simulatedRoleContext } = useRouteAccessSelectors();

  useEffect(() => {
    const requestedRoute = simulatedRoleContext.isAuthenticated ? ROUTE_NAMES.UserGroup : ROUTE_NAMES.AuthGroup;
    const targetRoute = resolve(requestedRoute);

    const timeoutId = setTimeout(() => {
      navigation.dispatch(StackActions.replace(targetRoute));
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [navigation, resolve, simulatedRoleContext.isAuthenticated]);

  return <ShellEntryScreen title="Splash" subtitle="Application shell bootstrap route." stateTemplate="loading" />;
}