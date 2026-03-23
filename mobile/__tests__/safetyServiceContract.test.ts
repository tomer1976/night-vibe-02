import { SafetyEnforcementEvent } from '../src/contracts';
import { createMockBackendServiceLocator } from '../src/services';

describe('SafetyService enforcement callbacks', () => {
  it('emits deterministic enforcement event on block action', async () => {
    const locator = createMockBackendServiceLocator();
    const events: SafetyEnforcementEvent[] = [];

    const unsubscribe = locator.services.safety.onEnforcementEvent((event) => {
      events.push(event);
    });

    const response = await locator.services.safety.blockUser('u-target-1');

    expect(response.status).toBe('SUCCESS');
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: 'block_applied',
      actorUserId: 'u-regular-1',
      targetUserId: 'u-target-1',
      chatAccessRevoked: true,
      discoveryVisibilityRevoked: true,
    });

    unsubscribe();
  });

  it('emits deterministic enforcement event on report action with linked report id', async () => {
    const locator = createMockBackendServiceLocator();
    const events: SafetyEnforcementEvent[] = [];

    const unsubscribe = locator.services.safety.onEnforcementEvent((event) => {
      events.push(event);
    });

    const response = await locator.services.safety.reportUser('u-target-2', 'spam');

    expect(response.status).toBe('SUCCESS');
    if (response.status !== 'SUCCESS') {
      throw new Error(`Expected success response, got ${response.error.code}`);
    }

    expect(response.data.status).toBe('pending');
    expect(response.data.reportedUserId).toBe('u-target-2');
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: 'report_submitted',
      actorUserId: 'u-regular-1',
      targetUserId: 'u-target-2',
      chatAccessRevoked: true,
      discoveryVisibilityRevoked: true,
      relatedReportId: response.data.reportId,
    });

    unsubscribe();
  });

  it('invokes block enforcement callback immediately in the same action flow', async () => {
    const locator = createMockBackendServiceLocator();
    const callback = jest.fn();

    const unsubscribe = locator.services.safety.onEnforcementEvent(callback);

    const pendingResponse = locator.services.safety.blockUser('u-target-3');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toMatchObject({
      action: 'block_applied',
      targetUserId: 'u-target-3',
    });

    await pendingResponse;
    unsubscribe();
  });

  it('stops emitting after callback unsubscribe', async () => {
    const locator = createMockBackendServiceLocator();
    const callback = jest.fn();

    const unsubscribe = locator.services.safety.onEnforcementEvent(callback);
    unsubscribe();

    await locator.services.safety.reportUser('u-target-2', 'spam');

    expect(callback).not.toHaveBeenCalled();
  });
});
