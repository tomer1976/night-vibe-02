import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { ROUTE_NAMES } from '../navigation';
import { useRouteAccessSelectors } from '../state';
import { ShellEntryScreen } from './ShellEntryScreen';

export function SplashScreen() {
  const navigation = useNavigation();
  const { resolve, simulatedRoleContext } = useRouteAccessSelectors();

  useEffect(() => {
    const requestedRoute = simulatedRoleContext.isAuthenticated ? ROUTE_NAMES.UserGroup : ROUTE_NAMES.AuthGroup;
    const targetRoute = resolve(requestedRoute);

    const timeoutId = setTimeout(() => {
      navigation.navigate(targetRoute as never);
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [navigation, resolve, simulatedRoleContext.isAuthenticated]);

  return <ShellEntryScreen title="Splash" subtitle="Application shell bootstrap route." stateTemplate="loading" />;
}