import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { createMockClock, createMockResponseFactory } from '../src/mocks';
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

  it('returns incomplete onboarding profile fixture for the Sprint-02 new-user persona', async () => {
    const locator = createMockBackendServiceLocator({
      activeUserId: 'u-persona-new-1',
    });

    const profileResponse = await locator.services.profile.getMyProfile();
    expect(profileResponse.status).toBe('SUCCESS');

    if (profileResponse.status === 'SUCCESS') {
      expect(profileResponse.data.uid).toBe('u-persona-new-1');
      expect(profileResponse.data.profileCompleted).toBe(false);
    }
  });

  it('supports deterministic session refresh before refresh token expiry', async () => {
    const clock = createMockClock({
      startAt: '2026-03-08T20:00:00.000Z',
      stepMs: 1_000,
    });

    const locator = createMockBackendServiceLocator({
      clock,
      sessionSimulation: {
        accessTokenTtlMs: 5_000,
        refreshTokenTtlMs: 10_000,
      },
    });

    const loginResponse = await locator.services.auth.login({ provider: 'google' });
    expect(loginResponse.status).toBe('SUCCESS');

    if (loginResponse.status === 'FAIL') {
      throw new Error('Expected SUCCESS login response.');
    }

    clock.advanceBy(3_000);
    const refreshResponse = await locator.services.auth.refreshSession(loginResponse.data.refreshToken);

    expect(refreshResponse).toEqual({
      status: 'SUCCESS',
      request_id: 'req-sprint01-0002',
      data: {
        accessToken: 'mock-access-u-regular-1-v2',
        tokenExpiration: '2026-03-08T20:00:10.000Z',
      },
    });
  });

  it('returns unauthorized when refresh token is invalid or expired', async () => {
    const clock = createMockClock({
      startAt: '2026-03-08T20:00:00.000Z',
      stepMs: 1_000,
    });

    const locator = createMockBackendServiceLocator({
      clock,
      sessionSimulation: {
        accessTokenTtlMs: 5_000,
        refreshTokenTtlMs: 4_000,
      },
    });

    const loginResponse = await locator.services.auth.login({ provider: 'google' });
    expect(loginResponse.status).toBe('SUCCESS');

    const invalidTokenResponse = await locator.services.auth.refreshSession('invalid-refresh-token');
    expect(invalidTokenResponse.status).toBe('FAIL');
    if (invalidTokenResponse.status === 'FAIL') {
      expect(invalidTokenResponse.error.code).toBe('UNAUTHORIZED');
      expect(invalidTokenResponse.error.details).toEqual({ reason: 'refresh_token_mismatch' });
    }

    if (loginResponse.status === 'FAIL') {
      throw new Error('Expected SUCCESS login response.');
    }

    clock.advanceBy(5_000);
    const expiredTokenResponse = await locator.services.auth.refreshSession(loginResponse.data.refreshToken);

    expect(expiredTokenResponse.status).toBe('FAIL');
    if (expiredTokenResponse.status === 'FAIL') {
      expect(expiredTokenResponse.error.code).toBe('UNAUTHORIZED');
      expect(expiredTokenResponse.error.details).toMatchObject({ reason: 'refresh_token_expired' });
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