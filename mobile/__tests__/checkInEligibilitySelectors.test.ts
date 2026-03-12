import { VenueSession, VenueSummary } from '../src/contracts';
import { selectCheckInEligibilityDisplayState } from '../src/state';

const activeVenue: VenueSummary = {
  venueId: 'v-halo-club',
  name: 'Halo Club',
  distanceKm: 0.75,
  category: 'club',
  status: 'active',
  activitySnapshot: {
    checkinCount: 12,
    liveStatus: 'busy',
  },
};

function createActiveSession(overrides?: Partial<VenueSession>): VenueSession {
  return {
    sessionId: 's-user-1',
    userId: 'u-1',
    venueId: 'v-luna-lounge',
    status: 'active',
    checkinAt: '2026-03-13T21:00:00.000Z',
    checkoutAt: null,
    ...overrides,
  };
}

describe('checkInEligibilitySelectors', () => {
  it('returns missing_venue state when venue context is unavailable', () => {
    const result = selectCheckInEligibilityDisplayState(null, null);

    expect(result.code).toBe('missing_venue');
    expect(result.canAttemptCheckIn).toBe(false);
    expect(result.buttonLabel).toBe('Start Check-In');
    expect(result.helperMessage).toContain('Venue details are missing');
  });

  it('returns venue_inactive state when venue is not active', () => {
    const result = selectCheckInEligibilityDisplayState(
      {
        ...activeVenue,
        status: 'suspended',
      },
      null,
    );

    expect(result.code).toBe('venue_inactive');
    expect(result.canAttemptCheckIn).toBe(false);
    expect(result.buttonLabel).toBe('Check-In Unavailable');
    expect(result.helperMessage).toBe('Check-in is disabled because this venue is not currently active.');
  });

  it('returns already_checked_in_here state when active session is in selected venue', () => {
    const result = selectCheckInEligibilityDisplayState(
      activeVenue,
      createActiveSession({
        venueId: 'v-halo-club',
      }),
    );

    expect(result.code).toBe('already_checked_in_here');
    expect(result.canAttemptCheckIn).toBe(false);
    expect(result.buttonLabel).toBe('Already Checked In');
    expect(result.helperMessage).toBe('You already have an active session in this venue.');
  });

  it('returns session_replacement_required state when active session exists in another venue', () => {
    const result = selectCheckInEligibilityDisplayState(activeVenue, createActiveSession());

    expect(result.code).toBe('session_replacement_required');
    expect(result.canAttemptCheckIn).toBe(true);
    expect(result.buttonLabel).toBe('Switch Venue Check-In');
    expect(result.helperMessage).toContain('auto-close your current active venue session');
  });

  it('returns eligible state when active venue has no current active session', () => {
    const result = selectCheckInEligibilityDisplayState(activeVenue, null);

    expect(result.code).toBe('eligible');
    expect(result.canAttemptCheckIn).toBe(true);
    expect(result.buttonLabel).toBe('Start Check-In');
    expect(result.helperMessage).toBeNull();
  });
});