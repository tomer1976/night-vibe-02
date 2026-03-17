import { isChatEligibilityFailureCode, resolveChatEligibilityFallbackRoute } from '../src/navigation/chatEligibilityRouteGuard';

describe('chat eligibility route guard', () => {
  it('identifies canonical eligibility failure error codes', () => {
    expect(isChatEligibilityFailureCode('NOT_CHECKED_IN')).toBe(true);
    expect(isChatEligibilityFailureCode('CHAT_EXPIRED')).toBe(true);
    expect(isChatEligibilityFailureCode('ACCESS_DENIED')).toBe(true);
    expect(isChatEligibilityFailureCode('PERMISSION_DENIED')).toBe(true);
    expect(isChatEligibilityFailureCode('VALIDATION_ERROR')).toBe(false);
  });

  it('routes NOT_CHECKED_IN to nearby venues regardless of venue context', () => {
    expect(resolveChatEligibilityFallbackRoute('NOT_CHECKED_IN', 'v-halo-club')).toEqual({
      routeName: 'NearbyVenues',
    });
    expect(resolveChatEligibilityFallbackRoute('NOT_CHECKED_IN')).toEqual({
      routeName: 'NearbyVenues',
    });
  });

  it('routes other eligibility failures to venue details when venue context exists', () => {
    expect(resolveChatEligibilityFallbackRoute('CHAT_EXPIRED', 'v-halo-club')).toEqual({
      routeName: 'VenueDetails',
      params: {
        venueId: 'v-halo-club',
      },
    });
  });

  it('falls back to nearby venues when venue context is missing', () => {
    expect(resolveChatEligibilityFallbackRoute('ACCESS_DENIED')).toEqual({
      routeName: 'NearbyVenues',
    });
  });
});