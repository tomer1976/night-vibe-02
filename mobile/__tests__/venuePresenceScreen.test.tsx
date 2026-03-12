import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ActiveVenueSessionScreen, VenuePresenceScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function VenuePresenceTestNavigator({ servicesOverride }: { servicesOverride?: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="VenuePresence" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={VenuePresenceScreen} name="VenuePresence" />
              <Stack.Screen component={ActiveVenueSessionScreen} name="ActiveVenueSession" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue presence screen', () => {
  it('renders mock active attendee summaries for the active venue', async () => {
    const { findByText, getByText } = render(<VenuePresenceTestNavigator />);

    expect(await findByText('Venue Presence Screen')).toBeTruthy();
    expect(await findByText('Venue: Halo Club')).toBeTruthy();
    expect(await findByText('Active attendees: 2')).toBeTruthy();
    expect(await findByText('Visible summaries: 1')).toBeTruthy();
    expect(await findByText('Jordan')).toBeTruthy();
    expect(await findByText('Age 27 • Venue v-halo-club')).toBeTruthy();

    fireEvent.press(getByText('Back to Active Session'));
    expect(await findByText('Active Venue Session Screen')).toBeTruthy();
  });

  it('renders empty state when no active session is available', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      presence: {
        ...mockLocator.services.presence,
        getMyActiveSession: async () => ({
          status: 'SUCCESS',
          data: null,
          request_id: 'req-presence-empty',
        }),
      },
    };

    const { findByText } = render(<VenuePresenceTestNavigator servicesOverride={servicesOverride} />);

    expect(await findByText('No Active Session')).toBeTruthy();
    expect(await findByText('No active session is available, so venue presence cannot be displayed.')).toBeTruthy();
    expect(await findByText('Browse Nearby Venues')).toBeTruthy();
  });

  it('renders retry state and recovers after retry action', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const getMyActiveSession = jest
      .fn()
      .mockResolvedValueOnce({
        status: 'FAIL',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Simulated presence load failure.',
        },
        request_id: 'req-presence-fail',
      })
      .mockResolvedValueOnce({
        status: 'SUCCESS',
        data: {
          sessionId: 's-regular-1-active',
          userId: 'u-regular-1',
          venueId: 'v-halo-club',
          status: 'active',
          checkinAt: '2026-03-08T19:00:00.000Z',
          checkoutAt: null,
        },
        request_id: 'req-presence-recovered',
      });

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      presence: {
        ...mockLocator.services.presence,
        getMyActiveSession,
      },
    };

    const { findByText, getByText } = render(<VenuePresenceTestNavigator servicesOverride={servicesOverride} />);

    expect(await findByText('Venue Presence Failed')).toBeTruthy();
    expect(await findByText('Simulated presence load failure.')).toBeTruthy();
    fireEvent.press(getByText('Retry'));
    expect(await findByText('Venue Presence Screen')).toBeTruthy();
    expect(await findByText('Venue: Halo Club')).toBeTruthy();
  });
});
