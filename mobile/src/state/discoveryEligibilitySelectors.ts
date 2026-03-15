import { VenueSession } from '../contracts';

export type SameVenueDiscoveryEligibilityCode =
  | 'eligible_same_venue'
  | 'missing_venue_context'
  | 'not_checked_in'
  | 'inactive_session'
  | 'different_venue';

export type SameVenueDiscoveryEligibility = {
  isEligible: boolean;
  code: SameVenueDiscoveryEligibilityCode;
  label: string;
  helperMessage: string;
};

export function selectSameVenueDiscoveryEligibility(
  activeSession: VenueSession | null,
  venueId: string | null | undefined
): SameVenueDiscoveryEligibility {
  if (!venueId) {
    return {
      isEligible: false,
      code: 'missing_venue_context',
      label: 'Eligibility: Missing Venue Context',
      helperMessage: 'Discovery requires a valid venue context before eligibility can be evaluated.',
    };
  }

  if (!activeSession) {
    return {
      isEligible: false,
      code: 'not_checked_in',
      label: 'Eligibility: No Active Session',
      helperMessage: 'Check in to this venue to access discovery and interaction actions.',
    };
  }

  if (activeSession.status !== 'active') {
    return {
      isEligible: false,
      code: 'inactive_session',
      label: 'Eligibility: Session Not Active',
      helperMessage: 'Your current session is not active. Re-check in to continue discovery.',
    };
  }

  if (activeSession.venueId !== venueId) {
    return {
      isEligible: false,
      code: 'different_venue',
      label: 'Eligibility: Different Venue Session',
      helperMessage: 'Discovery is restricted to users currently co-located in the same venue.',
    };
  }

  return {
    isEligible: true,
    code: 'eligible_same_venue',
    label: 'Eligibility: Active in Same Venue',
    helperMessage: 'You are currently eligible for venue-restricted discovery interactions.',
  };
}
