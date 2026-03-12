import { VenueSession, VenueSummary } from '../contracts';

export type CheckInEligibilityDisplayStateCode =
  | 'missing_venue'
  | 'venue_inactive'
  | 'already_checked_in_here'
  | 'session_replacement_required'
  | 'eligible';

export type CheckInEligibilityDisplayState = {
  code: CheckInEligibilityDisplayStateCode;
  canAttemptCheckIn: boolean;
  buttonLabel: string;
  helperMessage: string | null;
};

export function selectCheckInEligibilityDisplayState(
  venue: VenueSummary | null | undefined,
  activeSession: VenueSession | null | undefined,
): CheckInEligibilityDisplayState {
  if (!venue) {
    return {
      code: 'missing_venue',
      canAttemptCheckIn: false,
      buttonLabel: 'Start Check-In',
      helperMessage: 'Venue details are missing. Return to Nearby Venues and try again.',
    };
  }

  if (venue.status !== 'active') {
    return {
      code: 'venue_inactive',
      canAttemptCheckIn: false,
      buttonLabel: 'Check-In Unavailable',
      helperMessage: 'Check-in is disabled because this venue is not currently active.',
    };
  }

  if (activeSession?.status === 'active' && activeSession.venueId === venue.venueId) {
    return {
      code: 'already_checked_in_here',
      canAttemptCheckIn: false,
      buttonLabel: 'Already Checked In',
      helperMessage: 'You already have an active session in this venue.',
    };
  }

  if (activeSession?.status === 'active' && activeSession.venueId !== venue.venueId) {
    return {
      code: 'session_replacement_required',
      canAttemptCheckIn: true,
      buttonLabel: 'Switch Venue Check-In',
      helperMessage: 'Starting check-in here will auto-close your current active venue session.',
    };
  }

  return {
    code: 'eligible',
    canAttemptCheckIn: true,
    buttonLabel: 'Start Check-In',
    helperMessage: null,
  };
}