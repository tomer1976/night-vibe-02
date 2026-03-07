import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  AdminEntryScreen,
  AuthEntryScreen,
  ModeratorEntryScreen,
  OwnerEntryScreen,
  SplashScreen,
  UnknownRouteFallbackScreen,
  UserEntryScreen,
} from '../screens';
import { useTheme } from '../theme';
import { ROUTE_NAMES } from './routeGroups';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const theme = useTheme();

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
        <Stack.Screen name={ROUTE_NAMES.AuthGroup} component={AuthEntryScreen} />
        <Stack.Screen name={ROUTE_NAMES.UserGroup} component={UserEntryScreen} />
        <Stack.Screen name={ROUTE_NAMES.OwnerGroup} component={OwnerEntryScreen} />
        <Stack.Screen name={ROUTE_NAMES.ModeratorGroup} component={ModeratorEntryScreen} />
        <Stack.Screen name={ROUTE_NAMES.AdminGroup} component={AdminEntryScreen} />
        <Stack.Screen name={ROUTE_NAMES.UnknownRouteFallback} component={UnknownRouteFallbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
