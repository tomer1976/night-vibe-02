import { ApiErrorCode } from '../contracts';
import { AppRouteName, ROUTE_NAMES } from './routeGroups';

type ChatEligibilityFallbackRoute = {
  routeName: AppRouteName;
  params?: Record<string, unknown>;
};

const CHAT_ELIGIBILITY_FAILURE_CODES: ReadonlySet<ApiErrorCode> = new Set([
  'NOT_CHECKED_IN',
  'CHAT_EXPIRED',
  'ACCESS_DENIED',
  'PERMISSION_DENIED',
]);

export function isChatEligibilityFailureCode(code: ApiErrorCode): boolean {
  return CHAT_ELIGIBILITY_FAILURE_CODES.has(code);
}

export function resolveChatEligibilityFallbackRoute(
  code: ApiErrorCode,
  venueId?: string
): ChatEligibilityFallbackRoute {
  if (code === 'NOT_CHECKED_IN' || !venueId) {
    return {
      routeName: ROUTE_NAMES.NearbyVenues,
    };
  }

  return {
    routeName: ROUTE_NAMES.VenueDetails,
    params: {
      venueId,
    },
  };
}