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

  it('stops emitting after callback unsubscribe', async () => {
    const locator = createMockBackendServiceLocator();
    const callback = jest.fn();

    const unsubscribe = locator.services.safety.onEnforcementEvent(callback);
    unsubscribe();

    await locator.services.safety.reportUser('u-target-2', 'spam');

    expect(callback).not.toHaveBeenCalled();
  });
});
