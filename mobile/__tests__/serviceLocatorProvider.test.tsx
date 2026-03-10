import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { createMockResponseFactory } from '../src/mocks';
import { ServiceLocatorProvider, useServiceLocator, createMockBackendServiceLocator } from '../src/services';

describe('mock service locator wiring', () => {
  it('creates a complete mock backend contract set', async () => {
    const locator = createMockBackendServiceLocator({
      activeUserId: 'u-regular-1',
    });

    const sessionResponse = await locator.services.auth.getSession();
    const venuesResponse = await locator.services.venues.getNearbyVenues();
    const discoveryResponse = await locator.services.discovery.getCandidates();
    const accountStatusResponse = await locator.services.accountLifecycle.getAccountStatus();

    expect(sessionResponse.status).toBe('SUCCESS');
    expect(venuesResponse.status).toBe('SUCCESS');
    expect(discoveryResponse.status).toBe('SUCCESS');
    expect(accountStatusResponse.status).toBe('SUCCESS');
  });

  it('returns deterministic success and failure envelopes through mock services', async () => {
    const responseFactory = createMockResponseFactory({ seed: 'req-deterministic' });
    const locator = createMockBackendServiceLocator({ responseFactory });

    const successResponse = await locator.services.auth.getSession();
    expect(successResponse).toEqual({
      status: 'SUCCESS',
      request_id: 'req-deterministic-0001',
      data: {
        uid: 'u-regular-1',
        status: 'active',
        roles: ['RegularUser'],
        activeRoleContext: 'RegularUser',
      },
    });

    responseFactory.setScenario('discovery.getCandidates', 'PERMISSION_DENIED');
    const failureResponse = await locator.services.discovery.getCandidates();

    expect(failureResponse.status).toBe('FAIL');
    if (failureResponse.status === 'FAIL') {
      expect(failureResponse.request_id).toBe('req-deterministic-0002');
      expect(failureResponse.error.code).toBe('PERMISSION_DENIED');
      expect(failureResponse.error.message).toBe('Mock permission denied for this operation.');
    }
  });

  it('returns isNewUser=true for the Sprint-02 new-user persona login', async () => {
    const locator = createMockBackendServiceLocator({
      activeUserId: 'u-persona-new-1',
    });

    const loginResponse = await locator.services.auth.login({ provider: 'google' });
    expect(loginResponse.status).toBe('SUCCESS');

    if (loginResponse.status === 'SUCCESS') {
      expect(loginResponse.data.isNewUser).toBe(true);
      expect(loginResponse.data.status).toBe('active');
    }
  });

  it('provides services through ServiceLocatorProvider', async () => {
    function Probe() {
      const services = useServiceLocator();
      void services;
      return <Text>service-locator-ready</Text>;
    }

    const { getByText } = render(
      <ServiceLocatorProvider isMockModeEnabled>
        <Probe />
      </ServiceLocatorProvider>
    );

    expect(getByText('service-locator-ready')).toBeTruthy();
  });

  it('throws when mock mode is disabled in Sprint-01', () => {
    const renderDisabled = () =>
      render(
        <ServiceLocatorProvider isMockModeEnabled={false}>
          <Text>disabled</Text>
        </ServiceLocatorProvider>
      );

    expect(renderDisabled).toThrow('Real service locator wiring is not available in Phase 1. Enable phase1 mock mode.');
  });
});