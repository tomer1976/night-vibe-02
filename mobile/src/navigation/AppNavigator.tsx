import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentType } from 'react';

import {
  AdminEntryScreen,
  AuthEntryScreen,
  ModeratorEntryScreen,
  OwnerEntryScreen,
  SplashScreen,
  UnknownRouteFallbackScreen,
  UserEntryScreen,
} from '../screens';
import { useAuthState, useFeatureFlagsState, useRoleState } from '../state';
import { useTheme } from '../theme';
import { ROUTE_NAMES } from './routeGroups';
import { resolveRouteWithFallback, SimulatedRoleContext } from './roleContextSimulation';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const theme = useTheme();
  const { isAuthenticated } = useAuthState();
  const { activeRoleContext, availableRoles } = useRoleState();
  const { isRoleSimulationEnabled } = useFeatureFlagsState();

  const simulatedRoleContext: SimulatedRoleContext = {
    isAuthenticated: isRoleSimulationEnabled ? isAuthenticated : false,
    activeRoleContext: isRoleSimulationEnabled ? activeRoleContext : null,
    availableRoles: isRoleSimulationEnabled ? availableRoles : [],
  };

  const renderProtectedRoute = (routeName: keyof typeof ROUTE_NAMES, ScreenComponent: ComponentType) => {
    const requestedRouteName = ROUTE_NAMES[routeName];
    const resolvedRouteName = resolveRouteWithFallback(requestedRouteName, simulatedRoleContext);

    if (resolvedRouteName === requestedRouteName) {
      return <ScreenComponent />;
    }

    const activeRole = simulatedRoleContext.activeRoleContext ?? 'none';
    const authState = simulatedRoleContext.isAuthenticated ? 'authenticated' : 'unauthenticated';

    return (
      <UnknownRouteFallbackScreen
        subtitle={`Fallback for blocked route ${requestedRouteName} under simulated context (${authState}, role: ${activeRole}).`}
      />
    );
  };

  const navigationTheme: NavigationTheme = {
    dark: true,
    colors: {
      primary: theme.colors.accentPrimary,
      background: theme.colors.backgroundPrimary,
      card: theme.colors.backgroundSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.backgroundSecondary,
      notification: theme.colors.accentSecondary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800',
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTE_NAMES.Splash}>
        <Stack.Screen name={ROUTE_NAMES.Splash} component={SplashScreen} />
        <Stack.Screen name={ROUTE_NAMES.AuthGroup}>{() => renderProtectedRoute('AuthGroup', AuthEntryScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.UserGroup}>{() => renderProtectedRoute('UserGroup', UserEntryScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.OwnerGroup}>{() => renderProtectedRoute('OwnerGroup', OwnerEntryScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.ModeratorGroup}>{() => renderProtectedRoute('ModeratorGroup', ModeratorEntryScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.AdminGroup}>{() => renderProtectedRoute('AdminGroup', AdminEntryScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.UnknownRouteFallback} component={UnknownRouteFallbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
