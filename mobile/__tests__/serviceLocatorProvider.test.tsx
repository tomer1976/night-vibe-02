import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ServiceLocatorProvider, useServiceLocator, createMockBackendServiceLocator } from '../src/services';

describe('mock service locator wiring', () => {
  it('creates a complete mock backend contract set', async () => {
    const locator = createMockBackendServiceLocator({
      activeUserId: 'u-regular-1',
    });

    const sessionResponse = await locator.services.auth.getSession();
    const venuesResponse = await locator.services.venues.getNearbyVenues();
    const discoveryResponse = await locator.services.discovery.getCandidates();

    expect(sessionResponse.status).toBe('SUCCESS');
    expect(venuesResponse.status).toBe('SUCCESS');
    expect(discoveryResponse.status).toBe('SUCCESS');
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

    expect(renderDisabled).toThrow('Real service locator wiring is not available in Sprint-01. Enable phase1 mock mode.');
  });
});