import { createMockBackendServiceLocator } from '../src/services';

describe('interaction idempotency and duplicate contract', () => {
  it('exposes the idempotency contract and supports idempotent replay by key', async () => {
    const locator = createMockBackendServiceLocator();

    const contractResponse = await locator.services.interactions.getIdempotencyContract();
    expect(contractResponse.status).toBe('SUCCESS');

    if (contractResponse.status !== 'SUCCESS') {
      return;
    }

    expect(contractResponse.data.duplicateScope).toBe('actor_target_venue_session');
    expect(contractResponse.data.duplicateErrorCode).toBe('DUPLICATE_INTERACTION');
    expect(contractResponse.data.idempotentReplayBehavior).toBe('return_original_success');

    const activeSessionResponse = await locator.services.presence.getMyActiveSession();
    expect(activeSessionResponse.status).toBe('SUCCESS');

    if (activeSessionResponse.status !== 'SUCCESS') {
      return;
    }

    expect(activeSessionResponse.data).toBeTruthy();

    if (!activeSessionResponse.data) {
      return;
    }

    const interactionRequest = {
      targetUserId: 'u-discovery-3',
      venueId: activeSessionResponse.data.venueId,
      idempotencyKey: 'idem-like-u-discovery-3',
    };

    const first = await locator.services.interactions.likeUser(interactionRequest);
    const second = await locator.services.interactions.likeUser(interactionRequest);
    const third = await locator.services.interactions.likeUser({
      ...interactionRequest,
      idempotencyKey: 'idem-like-u-discovery-3-v2',
    });

    expect(first.status).toBe('SUCCESS');
    expect(second.status).toBe('SUCCESS');
    expect(third.status).toBe('FAIL');

    if (first.status !== 'SUCCESS' || second.status !== 'SUCCESS' || third.status !== 'FAIL') {
      return;
    }

    expect(first.data.decision).toBe('created');
    expect(second.data.decision).toBe('idempotent_replay');
    expect(second.data.interactionId).toBe(first.data.interactionId);
    expect(third.error.code).toBe('DUPLICATE_INTERACTION');
  });

  it('rejects interaction requests when user is not checked in', async () => {
    const locator = createMockBackendServiceLocator();

    const checkoutResult = await locator.services.presence.checkOutActiveSession();
    expect(checkoutResult.status).toBe('SUCCESS');

    const response = await locator.services.interactions.passUser({
      targetUserId: 'u-discovery-4',
      venueId: 'v-halo-club',
      idempotencyKey: 'idem-pass-u-discovery-4',
    });

    expect(response.status).toBe('FAIL');

    if (response.status !== 'FAIL') {
      return;
    }

    expect(response.error.code).toBe('NOT_CHECKED_IN');
  });
});
