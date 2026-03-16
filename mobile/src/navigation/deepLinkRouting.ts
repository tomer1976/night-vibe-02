import { AccountStatus } from '../contracts';
import { resolveAuthEntryRoute } from './authEntryRouting';
import { AppRouteName, ROUTE_NAMES } from './routeGroups';
import { resolveRouteWithFallback, SimulatedRoleContext } from './roleContextSimulation';

type ResolveDeepLinkRouteInput = {
  path: string;
  accountStatus: AccountStatus;
  isMockModeEnabled: boolean;
  profileCompleted: boolean;
  simulatedRoleContext: SimulatedRoleContext;
};

const DEEP_LINK_PATH_TO_ROUTE: Record<string, AppRouteName> = {
  '': ROUTE_NAMES.Splash,
  splash: ROUTE_NAMES.Splash,
  auth: ROUTE_NAMES.AuthGroup,
  welcome: ROUTE_NAMES.Welcome,
  login: ROUTE_NAMES.Login,
  'session-recovery': ROUTE_NAMES.SessionRecovery,
  'access-denied': ROUTE_NAMES.AccessDenied,
  'onboarding/name': ROUTE_NAMES.OnboardingName,
  'onboarding/date-of-birth': ROUTE_NAMES.OnboardingDateOfBirth,
  'onboarding/gender': ROUTE_NAMES.OnboardingGender,
  'onboarding/photo-upload': ROUTE_NAMES.OnboardingPhotoUpload,
  'onboarding/bio': ROUTE_NAMES.OnboardingBio,
  'onboarding/preferences': ROUTE_NAMES.OnboardingPreferences,
  'onboarding/terms': ROUTE_NAMES.OnboardingTerms,
  'profile-completion-required': ROUTE_NAMES.ProfileCompletionRequired,
  user: ROUTE_NAMES.UserGroup,
  'venues/details': ROUTE_NAMES.VenueDetails,
  'discovery/profile-preview': ROUTE_NAMES.DiscoveryProfilePreview,
  'chat/threads': ROUTE_NAMES.ChatThreads,
  'venues/check-in-confirmation': ROUTE_NAMES.CheckInConfirmation,
  'venues/checkout-confirmation': ROUTE_NAMES.CheckoutConfirmation,
  profile: ROUTE_NAMES.UserProfile,
  'profile/edit': ROUTE_NAMES.EditProfile,
  'profile/photos': ROUTE_NAMES.ProfilePhotosManagement,
  'settings/account': ROUTE_NAMES.AccountSettings,
  'settings/linked-accounts': ROUTE_NAMES.LinkedAccounts,
  'settings/delete-account': ROUTE_NAMES.DeleteAccount,
  'settings/account-deletion-recovery': ROUTE_NAMES.AccountDeletionRecovery,
  owner: ROUTE_NAMES.OwnerGroup,
  moderator: ROUTE_NAMES.ModeratorGroup,
  admin: ROUTE_NAMES.AdminGroup,
  unknown: ROUTE_NAMES.UnknownRouteFallback,
};

function normalizeDeepLinkPath(path: string): string {
  const withoutQuery = path.split('?')[0] ?? '';
  const withoutHash = withoutQuery.split('#')[0] ?? '';

  return withoutHash.trim().replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();
}

function isPostOnboardingRoute(routeName: AppRouteName) {
  return (
    routeName === ROUTE_NAMES.UserGroup ||
    routeName === ROUTE_NAMES.VenueDetails ||
    routeName === ROUTE_NAMES.DiscoveryProfilePreview ||
    routeName === ROUTE_NAMES.MatchesList ||
    routeName === ROUTE_NAMES.ChatThreads ||
    routeName === ROUTE_NAMES.CheckInConfirmation ||
    routeName === ROUTE_NAMES.CheckoutConfirmation ||
    routeName === ROUTE_NAMES.UserProfile ||
    routeName === ROUTE_NAMES.EditProfile ||
    routeName === ROUTE_NAMES.ProfilePhotosManagement ||
    routeName === ROUTE_NAMES.AccountSettings ||
    routeName === ROUTE_NAMES.LinkedAccounts ||
    routeName === ROUTE_NAMES.DeleteAccount ||
    routeName === ROUTE_NAMES.AccountDeletionRecovery
  );
}

function applyOnboardingGate(routeName: AppRouteName, profileCompleted: boolean) {
  if (isPostOnboardingRoute(routeName) && !profileCompleted) {
    return ROUTE_NAMES.ProfileCompletionRequired;
  }

  return routeName;
}

export function resolveRouteFromDeepLinkPath(path: string): AppRouteName | null {
  const normalizedPath = normalizeDeepLinkPath(path);
  return DEEP_LINK_PATH_TO_ROUTE[normalizedPath] ?? null;
}

function resolveMockModeSafeRoute(
  accountStatus: AccountStatus,
  profileCompleted: boolean,
  simulatedRoleContext: SimulatedRoleContext,
): AppRouteName {
  const authEntryRoute = resolveAuthEntryRoute({
    isAuthenticated: simulatedRoleContext.isAuthenticated,
    accountStatus,
    isNewUser: !profileCompleted,
  });

  const resolvedAuthEntryRoute = resolveRouteWithFallback(authEntryRoute, simulatedRoleContext);

  if (resolvedAuthEntryRoute === ROUTE_NAMES.UnknownRouteFallback) {
    return ROUTE_NAMES.Welcome;
  }

  return applyOnboardingGate(resolvedAuthEntryRoute, profileCompleted);
}

export function resolveDeepLinkTargetRoute(input: ResolveDeepLinkRouteInput): AppRouteName {
  const requestedRoute = resolveRouteFromDeepLinkPath(input.path);

  if (!requestedRoute) {
    return input.isMockModeEnabled
      ? resolveMockModeSafeRoute(input.accountStatus, input.profileCompleted, input.simulatedRoleContext)
      : ROUTE_NAMES.UnknownRouteFallback;
  }

  const roleResolvedRoute = resolveRouteWithFallback(requestedRoute, input.simulatedRoleContext);
  const fullyResolvedRoute = applyOnboardingGate(roleResolvedRoute, input.profileCompleted);

  if (fullyResolvedRoute === ROUTE_NAMES.UnknownRouteFallback && input.isMockModeEnabled) {
    return resolveMockModeSafeRoute(input.accountStatus, input.profileCompleted, input.simulatedRoleContext);
  }

  return fullyResolvedRoute;
}