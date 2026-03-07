import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { ROUTE_NAMES } from './routeGroups';

type GroupPlaceholderScreenProps = {
  title: string;
};

function GroupPlaceholderScreen({ title }: GroupPlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

function SplashRouteScreen() {
  return <GroupPlaceholderScreen title="Splash Route Group" />;
}

function AuthRouteScreen() {
  return <GroupPlaceholderScreen title="Auth Route Group" />;
}

function UserRouteScreen() {
  return <GroupPlaceholderScreen title="User Route Group" />;
}

function OwnerRouteScreen() {
  return <GroupPlaceholderScreen title="Owner Route Group" />;
}

function ModeratorRouteScreen() {
  return <GroupPlaceholderScreen title="Moderator Route Group" />;
}

function AdminRouteScreen() {
  return <GroupPlaceholderScreen title="Admin Route Group" />;
}

function UnknownRouteFallbackScreen() {
  return <GroupPlaceholderScreen title="Unknown Route Fallback" />;
}

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
        <Stack.Screen name={ROUTE_NAMES.Splash} component={SplashRouteScreen} />
        <Stack.Screen name={ROUTE_NAMES.AuthGroup} component={AuthRouteScreen} />
        <Stack.Screen name={ROUTE_NAMES.UserGroup} component={UserRouteScreen} />
        <Stack.Screen name={ROUTE_NAMES.OwnerGroup} component={OwnerRouteScreen} />
        <Stack.Screen name={ROUTE_NAMES.ModeratorGroup} component={ModeratorRouteScreen} />
        <Stack.Screen name={ROUTE_NAMES.AdminGroup} component={AdminRouteScreen} />
        <Stack.Screen name={ROUTE_NAMES.UnknownRouteFallback} component={UnknownRouteFallbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});