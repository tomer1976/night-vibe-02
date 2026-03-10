import { Role } from '../contracts';
import { AppRouteName, ROUTE_NAMES } from './routeGroups';

export type SimulatedRoleContext = {
  isAuthenticated: boolean;
  activeRoleContext: Role | null;
  availableRoles: readonly Role[];
};

const VALID_ROLES: readonly Role[] = ['RegularUser', 'VenueOwner', 'Moderator', 'Administrator'];

const rolePresetMap: Record<Role, readonly Role[]> = {
  RegularUser: ['RegularUser'],
  VenueOwner: ['RegularUser', 'VenueOwner'],
  Moderator: ['RegularUser', 'Moderator'],
  Administrator: ['RegularUser', 'Administrator'],
};

const parseBooleanEnv = (value: string | undefined, fallback: boolean) => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1') {
    return true;
  }

  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  return fallback;
};

const parseRole = (value: string | undefined): Role | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return VALID_ROLES.find((role) => role === normalized) ?? null;
};

const parseAvailableRoles = (value: string | undefined): Role[] => {
  if (!value) {
    return [];
  }

  const unique = new Set<Role>();
  const segments = value.split(',').map((segment) => segment.trim());

  for (const segment of segments) {
    const parsedRole = parseRole(segment);
    if (parsedRole) {
      unique.add(parsedRole);
    }
  }

  return [...unique];
};

export function isKnownAppRouteName(routeName: string): routeName is AppRouteName {
  return Object.values(ROUTE_NAMES).includes(routeName as AppRouteName);
}

export function readSimulatedRoleContextFromEnv(
  env: Record<string, string | undefined> = process.env,
): SimulatedRoleContext {
  const isAuthenticated = parseBooleanEnv(env.EXPO_PUBLIC_MOCK_IS_AUTHENTICATED, true);

  if (!isAuthenticated) {
    return {
      isAuthenticated: false,
      activeRoleContext: null,
      availableRoles: [],
    };
  }

  const selectedRole = parseRole(env.EXPO_PUBLIC_MOCK_ACTIVE_ROLE) ?? 'RegularUser';
  const configuredAvailableRoles = parseAvailableRoles(env.EXPO_PUBLIC_MOCK_AVAILABLE_ROLES);
  const availableRoles = configuredAvailableRoles.length > 0 ? configuredAvailableRoles : [...rolePresetMap[selectedRole]];

  if (!availableRoles.includes(selectedRole)) {
    availableRoles.push(selectedRole);
  }

  return {
    isAuthenticated: true,
    activeRoleContext: selectedRole,
    availableRoles,
  };
}

export function canAccessRoute(routeName: AppRouteName, context: SimulatedRoleContext): boolean {
  if (routeName === ROUTE_NAMES.Splash || routeName === ROUTE_NAMES.UnknownRouteFallback) {
    return true;
  }

  if (
    routeName === ROUTE_NAMES.Welcome ||
    routeName === ROUTE_NAMES.Login ||
    routeName === ROUTE_NAMES.SessionRecovery ||
    routeName === ROUTE_NAMES.AccessDenied ||
    routeName === ROUTE_NAMES.OnboardingName ||
    routeName === ROUTE_NAMES.OnboardingDateOfBirth ||
    routeName === ROUTE_NAMES.OnboardingGender ||
    routeName === ROUTE_NAMES.OnboardingPhotoUpload ||
    routeName === ROUTE_NAMES.OnboardingBio ||
    routeName === ROUTE_NAMES.OnboardingPreferences ||
    routeName === ROUTE_NAMES.OnboardingTerms ||
    routeName === ROUTE_NAMES.ProfileCompletionRequired
  ) {
    return true;
  }

  if (routeName === ROUTE_NAMES.AuthGroup) {
    return !context.isAuthenticated;
  }

  if (!context.isAuthenticated || !context.activeRoleContext) {
    return false;
  }

  if (!context.availableRoles.includes(context.activeRoleContext)) {
    return false;
  }

  switch (routeName) {
    case ROUTE_NAMES.UserGroup:
      return context.activeRoleContext === 'RegularUser';
    case ROUTE_NAMES.OwnerGroup:
      return context.activeRoleContext === 'VenueOwner';
    case ROUTE_NAMES.ModeratorGroup:
      return context.activeRoleContext === 'Moderator';
    case ROUTE_NAMES.AdminGroup:
      return context.activeRoleContext === 'Administrator';
    default:
      return false;
  }
}

export function resolveRouteWithFallback(routeName: string, context: SimulatedRoleContext): AppRouteName {
  if (!isKnownAppRouteName(routeName)) {
    return ROUTE_NAMES.UnknownRouteFallback;
  }

  if (canAccessRoute(routeName, context)) {
    return routeName;
  }

  return ROUTE_NAMES.UnknownRouteFallback;
}
