import { VenueSession } from '../src/contracts';
import { selectSameVenueDiscoveryEligibility } from '../src/state';

describe('discovery eligibility selectors', () => {
  const activeVenueSession: VenueSession = {
    sessionId: 'session-1',
    userId: 'u-regular-1',
    venueId: 'v-halo-club',
    status: 'active',
    checkinAt: '2026-03-15T20:00:00.000Z',
    checkoutAt: null,
  };

  it('returns eligible state for active same-venue session', () => {
    const eligibility = selectSameVenueDiscoveryEligibility(activeVenueSession, 'v-halo-club');

    expect(eligibility.isEligible).toBe(true);
    expect(eligibility.code).toBe('eligible_same_venue');
    expect(eligibility.label).toBe('Eligibility: Active in Same Venue');
  });

  it('returns not_checked_in when there is no active session', () => {
    const eligibility = selectSameVenueDiscoveryEligibility(null, 'v-halo-club');

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.code).toBe('not_checked_in');
  });

  it('returns inactive_session when session status is not active', () => {
    const eligibility = selectSameVenueDiscoveryEligibility(
      {
        ...activeVenueSession,
        status: 'closed',
      },
      'v-halo-club'
    );

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.code).toBe('inactive_session');
  });

  it('returns different_venue when active session is for another venue', () => {
    const eligibility = selectSameVenueDiscoveryEligibility(activeVenueSession, 'v-luna-lounge');

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.code).toBe('different_venue');
  });

  it('returns missing_venue_context when venue context is not provided', () => {
    const eligibility = selectSameVenueDiscoveryEligibility(activeVenueSession, undefined);

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.code).toBe('missing_venue_context');
  });
});
