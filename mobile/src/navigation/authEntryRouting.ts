import { AccountStatus } from '../contracts';
import { ROUTE_NAMES } from './routeGroups';

type ResolveAuthEntryRouteInput = {
  isAuthenticated: boolean;
  accountStatus: AccountStatus;
  isNewUser: boolean;
};

export function resolveAuthEntryRoute(input: ResolveAuthEntryRouteInput) {
  if (!input.isAuthenticated) {
    return ROUTE_NAMES.Welcome;
  }

  if (input.accountStatus === 'pending_deletion') {
    return ROUTE_NAMES.SessionRecovery;
  }

  if (
    input.accountStatus === 'suspended' ||
    input.accountStatus === 'banned' ||
    input.accountStatus === 'deleted'
  ) {
    return ROUTE_NAMES.AccessDenied;
  }

  if (input.isNewUser) {
    return ROUTE_NAMES.OnboardingName;
  }

  return ROUTE_NAMES.UserGroup;
}
