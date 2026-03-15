import {
  createInitialInteractionQueueStoreState,
  createInteractionQueueKey,
  interactionQueueStoreReducer,
  selectCanSubmitInteraction,
  selectInteractionQueueEntry,
} from '../src/state/interactionQueueStore';

describe('interactionQueueStore', () => {
  it('blocks duplicate submission while interaction is in flight', () => {
    const request = {
      targetUserId: 'u-discovery-3',
      venueId: 'v-halo-club',
      idempotencyKey: 'profile-like-u-discovery-3',
    };

    const started = interactionQueueStoreReducer(createInitialInteractionQueueStoreState(), {
      type: 'BEGIN_INTERACTION',
      request,
      action: 'LIKE',
      now: '2026-03-15T20:00:00.000Z',
    });

    expect(selectCanSubmitInteraction(started, request, 'LIKE')).toBe(false);
    expect(selectInteractionQueueEntry(started, { targetUserId: 'u-discovery-3', venueId: 'v-halo-club', action: 'LIKE' })).toMatchObject({
      status: 'in_flight',
      action: 'LIKE',
    });
  });

  it('keeps duplicate-protected terminal state after successful completion', () => {
    const request = {
      targetUserId: 'u-discovery-3',
      venueId: 'v-halo-club',
      idempotencyKey: 'profile-like-u-discovery-3',
    };

    const started = interactionQueueStoreReducer(createInitialInteractionQueueStoreState(), {
      type: 'BEGIN_INTERACTION',
      request,
      action: 'LIKE',
      now: '2026-03-15T20:00:00.000Z',
    });

    const completed = interactionQueueStoreReducer(started, {
      type: 'COMPLETE_INTERACTION',
      request,
      action: 'LIKE',
      outcome: 'created',
      result: {
        status: 'SUCCESS',
        interaction: 'LIKE',
        interactionId: 'interaction-1',
        targetUserId: 'u-discovery-3',
        venueId: 'v-halo-club',
        idempotencyKey: 'profile-like-u-discovery-3',
        decision: 'created',
        duplicateScope: 'actor_target_venue_session',
        matchCreated: false,
      },
      now: '2026-03-15T20:00:01.000Z',
    });

    expect(selectCanSubmitInteraction(completed, request, 'LIKE')).toBe(false);
    expect(selectInteractionQueueEntry(completed, { targetUserId: 'u-discovery-3', venueId: 'v-halo-club', action: 'LIKE' })).toMatchObject({
      status: 'completed',
      outcome: 'created',
    });
  });

  it('allows resubmission after failure and supports reset', () => {
    const request = {
      targetUserId: 'u-discovery-3',
      venueId: 'v-halo-club',
      idempotencyKey: 'profile-like-u-discovery-3',
    };

    const failed = interactionQueueStoreReducer(createInitialInteractionQueueStoreState(), {
      type: 'COMPLETE_INTERACTION',
      request,
      action: 'LIKE',
      outcome: 'failure',
      errorCode: 'INTERNAL_ERROR',
      now: '2026-03-15T20:00:02.000Z',
    });

    expect(selectCanSubmitInteraction(failed, request, 'LIKE')).toBe(true);

    const reset = interactionQueueStoreReducer(failed, { type: 'RESET_QUEUE' });

    expect(selectInteractionQueueEntry(reset, { targetUserId: 'u-discovery-3', venueId: 'v-halo-club', action: 'LIKE' })).toBeUndefined();
    expect(createInteractionQueueKey({ targetUserId: 'u-discovery-3', venueId: 'v-halo-club', action: 'LIKE' })).toBe(
      'LIKE:v-halo-club:u-discovery-3'
    );
  });
});