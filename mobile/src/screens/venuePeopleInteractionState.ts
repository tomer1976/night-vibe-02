import { DiscoveryCandidate } from '../contracts';

type VenuePeopleState = {
  dismissedPotentialUserIds: Set<string>;
  likedPotentialUserIds: Set<string>;
  hiddenMatchIds: Set<string>;
  returnedPotentialByUserId: Map<string, DiscoveryCandidate>;
};

const venuePeopleStateByVenueId = new Map<string, VenuePeopleState>();

function readOrCreateVenuePeopleState(venueId: string): VenuePeopleState {
  const existing = venuePeopleStateByVenueId.get(venueId);

  if (existing) {
    return existing;
  }

  const created: VenuePeopleState = {
    dismissedPotentialUserIds: new Set<string>(),
    likedPotentialUserIds: new Set<string>(),
    hiddenMatchIds: new Set<string>(),
    returnedPotentialByUserId: new Map<string, DiscoveryCandidate>(),
  };

  venuePeopleStateByVenueId.set(venueId, created);

  return created;
}

export function readVenuePeopleInteractionSnapshot(venueId: string) {
  const state = readOrCreateVenuePeopleState(venueId);

  return {
    dismissedPotentialUserIds: [...state.dismissedPotentialUserIds],
    likedPotentialUserIds: [...state.likedPotentialUserIds],
    hiddenMatchIds: [...state.hiddenMatchIds],
    returnedPotentials: [...state.returnedPotentialByUserId.values()],
  };
}

export function markPotentialLiked(venueId: string, userId: string) {
  const state = readOrCreateVenuePeopleState(venueId);
  state.likedPotentialUserIds.add(userId);
}

export function markPotentialUnliked(venueId: string, userId: string) {
  const state = readOrCreateVenuePeopleState(venueId);
  state.likedPotentialUserIds.delete(userId);
}

export function dismissPotential(venueId: string, userId: string) {
  const state = readOrCreateVenuePeopleState(venueId);
  state.dismissedPotentialUserIds.add(userId);
}

export function unhidePotential(venueId: string, candidate: DiscoveryCandidate) {
  const state = readOrCreateVenuePeopleState(venueId);
  state.dismissedPotentialUserIds.delete(candidate.userId);
  state.returnedPotentialByUserId.set(candidate.userId, candidate);
}

export function hideMatch(venueId: string, matchId: string) {
  const state = readOrCreateVenuePeopleState(venueId);
  state.hiddenMatchIds.add(matchId);
}

export function resetVenuePeopleInteractionState() {
  venuePeopleStateByVenueId.clear();
}
