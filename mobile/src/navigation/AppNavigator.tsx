import { NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComponentType, useMemo } from 'react';

import { AccessDeniedScreen } from '../screens/AccessDeniedScreen';
import { AccountDeletionRecoveryScreen } from '../screens/AccountDeletionRecoveryScreen';
import { AccountSettingsScreen } from '../screens/AccountSettingsScreen';
import { AdminEntryScreen } from '../screens/AdminEntryScreen';
import { AuthEntryScreen } from '../screens/AuthEntryScreen';
import { CheckInConfirmationScreen } from '../screens/CheckInConfirmationScreen';
import { CheckoutConfirmationScreen } from '../screens/CheckoutConfirmationScreen';
import { DiscoveryFallbackScreen } from '../screens/DiscoveryFallbackScreen';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';
import { DiscoveryProfilePreviewScreen } from '../screens/DiscoveryProfilePreviewScreen';
import { MatchConfirmationScreen } from '../screens/MatchConfirmationScreen';
import { ChatThreadsScreen } from '../screens/ChatThreadsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LinkedAccountsScreen } from '../screens/LinkedAccountsScreen';
import { ModeratorEntryScreen } from '../screens/ModeratorEntryScreen';
import { NearbyVenuesScreen } from '../screens/NearbyVenuesScreen';
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
import { VenueDetailsScreen } from '../screens/VenueDetailsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useAuthState, useFeatureFlagsState, useOnboardingState } from '../state';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { useTheme } from '../theme';
import { resolveDeepLinkTargetRoute } from './deepLinkRouting';
import { ROUTE_NAMES } from './routeGroups';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const theme = useTheme();
  const { accountStatus } = useAuthState();
  const { isMockModeEnabled } = useFeatureFlagsState();
  const { profileCompleted } = useOnboardingState();
  const routeAccessSelectors = useRouteAccessSelectors();
  const { simulatedRoleContext } = routeAccessSelectors;
  const isDeepLinkingEnabled = isMockModeEnabled && process.env.NODE_ENV !== 'test';

  const linking = useMemo(
    () => {
      if (!isDeepLinkingEnabled) {
        return undefined;
      }

      return {
        prefixes: ['nightvibe://', 'https://nightvibe.app'],
        getStateFromPath: (path: string) => {
          const targetRouteName = resolveDeepLinkTargetRoute({
            path,
            accountStatus,
            isMockModeEnabled,
            profileCompleted,
            simulatedRoleContext,
          });

          return {
            index: 0,
            routes: [{ name: targetRouteName }],
          };
        },
      };
    },
    [accountStatus, isDeepLinkingEnabled, isMockModeEnabled, profileCompleted, simulatedRoleContext]
  );

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
    <NavigationContainer linking={linking} theme={navigationTheme}>
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
        <Stack.Screen name={ROUTE_NAMES.NearbyVenues}>{() => renderProtectedRoute('NearbyVenues', NearbyVenuesScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.VenueDetails}>{() => renderProtectedRoute('VenueDetails', VenueDetailsScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.DiscoveryFallback}>{() => renderProtectedRoute('DiscoveryFallback', DiscoveryFallbackScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.DiscoveryProfilePreview}>
          {() => renderProtectedRoute('DiscoveryProfilePreview', DiscoveryProfilePreviewScreen)}
        </Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.MatchConfirmation}>{() => renderProtectedRoute('MatchConfirmation', MatchConfirmationScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.ChatThreads}>{() => renderProtectedRoute('ChatThreads', ChatThreadsScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.CheckInConfirmation}>{() => renderProtectedRoute('CheckInConfirmation', CheckInConfirmationScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.CheckoutConfirmation}>{() => renderProtectedRoute('CheckoutConfirmation', CheckoutConfirmationScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.UserProfile}>{() => renderProtectedRoute('UserProfile', UserProfileScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.EditProfile}>{() => renderProtectedRoute('EditProfile', EditProfileScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.ProfilePhotosManagement}>
          {() => renderProtectedRoute('ProfilePhotosManagement', ProfilePhotosManagementScreen)}
        </Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.AccountSettings}>{() => renderProtectedRoute('AccountSettings', AccountSettingsScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.LinkedAccounts}>{() => renderProtectedRoute('LinkedAccounts', LinkedAccountsScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.DeleteAccount}>{() => renderProtectedRoute('DeleteAccount', DeleteAccountScreen)}</Stack.Screen>
        <Stack.Screen name={ROUTE_NAMES.AccountDeletionRecovery}>
          {() => renderProtectedRoute('AccountDeletionRecovery', AccountDeletionRecoveryScreen)}
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
