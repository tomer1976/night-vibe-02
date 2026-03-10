import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentType } from 'react';

import { AccessDeniedScreen } from '../screens/AccessDeniedScreen';
import { AdminEntryScreen } from '../screens/AdminEntryScreen';
import { AuthEntryScreen } from '../screens/AuthEntryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ModeratorEntryScreen } from '../screens/ModeratorEntryScreen';
import { OnboardingBioScreen } from '../screens/OnboardingBioScreen';
import { OnboardingDateOfBirthScreen } from '../screens/OnboardingDateOfBirthScreen';
import { OnboardingGenderScreen } from '../screens/OnboardingGenderScreen';
import { OnboardingNameScreen } from '../screens/OnboardingNameScreen';
import { OnboardingPhotoUploadScreen } from '../screens/OnboardingPhotoUploadScreen';
import { OnboardingPreferencesScreen } from '../screens/OnboardingPreferencesScreen';
import { OnboardingTermsScreen } from '../screens/OnboardingTermsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ProfilePhotosManagementScreen } from '../screens/ProfilePhotosManagementScreen';
import { OwnerEntryScreen } from '../screens/OwnerEntryScreen';
import { ProfileCompletionRequiredScreen } from '../screens/ProfileCompletionRequiredScreen';
import { SessionRecoveryScreen } from '../screens/SessionRecoveryScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { UnknownRouteFallbackScreen } from '../screens/UnknownRouteFallbackScreen';
import { UserEntryScreen } from '../screens/UserEntryScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { useTheme } from '../theme';
import { ROUTE_NAMES } from './routeGroups';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const theme = useTheme();
  const routeAccessSelectors = useRouteAccessSelectors();
  const { simulatedRoleContext } = routeAccessSelectors;

  const renderProtectedRoute = (routeName: keyof typeof ROUTE_NAMES, ScreenComponent: ComponentType) => {
    const requestedRouteName = ROUTE_NAMES[routeName];
    const { isAllowed } = routeAccessSelectors.resolveWithAccess(requestedRouteName);

    if (isAllowed) {
      return <ScreenComponent />;
    }

    const activeRole = simulatedRoleContext.activeRoleContext ?? 'none';
    const authState = simulatedRoleContext.isAuthenticated ? 'authenticated' : 'unauthenticated';

    return (
      <UnknownRouteFallbackScreen
        requestedRouteName={requestedRouteName}
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
      <Stack.Navigator
        initialRouteName={ROUTE_NAMES.Splash}
        screenOptions={{
          animation: 'none',
          contentStyle: { backgroundColor: theme.colors.backgroundPrimary },
          headerShown: false,
        }}
      >
        <Stack.Screen name={ROUTE_NAMES.Splash} component={SplashScreen} />
        <Stack.Screen name={ROUTE_NAMES.Welcome} component={WelcomeScreen} />
        <Stack.Screen name={ROUTE_NAMES.Login} component={LoginScreen} />
        <Stack.Screen name={ROUTE_NAMES.SessionRecovery} component={SessionRecoveryScreen} />
        <Stack.Screen name={ROUTE_NAMES.AccessDenied} component={AccessDeniedScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingName} component={OnboardingNameScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingDateOfBirth} component={OnboardingDateOfBirthScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingGender} component={OnboardingGenderScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingPhotoUpload} component={OnboardingPhotoUploadScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingBio} component={OnboardingBioScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingPreferences} component={OnboardingPreferencesScreen} />
        <Stack.Screen name={ROUTE_NAMES.OnboardingTerms} component={OnboardingTermsScreen} />
        <Stack.Screen name={ROUTE_NAMES.ProfileCompletionRequired} component={ProfileCompletionRequiredScreen} />
        <Stack.Screen name={ROUTE_NAMES.UserProfile}>{() => renderProtectedRoute('UserProfile', UserProfileScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.EditProfile}>{() => renderProtectedRoute('EditProfile', EditProfileScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.ProfilePhotosManagement}>
          {() => renderProtectedRoute('ProfilePhotosManagement', ProfilePhotosManagementScreen)}
        </Stack.Screen>
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
