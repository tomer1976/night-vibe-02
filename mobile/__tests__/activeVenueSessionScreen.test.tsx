import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { createMockClock } from '../src/mocks';
import { ActiveVenueSessionScreen, CheckoutConfirmationScreen, NearbyVenuesScreen, VenuePresenceScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function ActiveVenueSessionTestNavigator({ servicesOverride }: { servicesOverride?: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="ActiveVenueSession" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={ActiveVenueSessionScreen} name="ActiveVenueSession" />
              <Stack.Screen component={VenuePresenceScreen} name="VenuePresence" />
              <Stack.Screen component={CheckoutConfirmationScreen} name="CheckoutConfirmation" />
              <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('active venue session screen', () => {
  it('renders active session metadata and recent transition indicators', async () => {
    const { findAllByText, findByText, getByText } = render(<ActiveVenueSessionTestNavigator />);

    expect(await findByText('Active Venue Session Screen')).toBeTruthy();
    expect(await findByText('Session Status Card')).toBeTruthy();
    expect(await findByText('Session Timer Card')).toBeTruthy();
    expect(await findByText('Venue Session Status')).toBeTruthy();
    expect(await findByText('Venue: v-halo-club')).toBeTruthy();
    expect(await findByText('User: u-regular-1')).toBeTruthy();
    expect(await findByText('Status: active')).toBeTruthy();
    expect(await findByText('Transitions: 3')).toBeTruthy();
    expect(await findByText(/Started at:/)).toBeTruthy();
    expect(await findByText(/Elapsed:/)).toBeTruthy();
    expect(await findByText(/Timeout remaining:/)).toBeTruthy();

    fireEvent.press(getByText('Open Venue Presence'));
    expect(await findByText('Venue Presence Screen')).toBeTruthy();
    fireEvent.press(getByText('Back to Active Session'));
    expect(await findByText('Active Venue Session Screen')).toBeTruthy();

    fireEvent.press(getByText('Proceed to Checkout'));
    expect(await findByText('Venue Checkout Confirmation Screen')).toBeTruthy();

    fireEvent.press(getByText('Back to Active Session'));
    expect(await findByText('Active Venue Session Screen')).toBeTruthy();

    fireEvent.press(getByText('Proceed to Checkout'));
    expect(await findByText('Venue Checkout Confirmation Screen')).toBeTruthy();
    const confirmCheckoutButtons = await findAllByText('Confirm Checkout');
    fireEvent.press(confirmCheckoutButtons[confirmCheckoutButtons.length - 1]);
    expect(await findByText('Checkout Completed')).toBeTruthy();
    fireEvent.press(getByText('Return to Nearby Venues'));
    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
  });

  it('renders no-active-session state after deterministic timeout and refresh', async () => {
    jest.useFakeTimers();

    try {
      const clock = createMockClock({
        startAt: '2026-03-08T22:59:00.000Z',
        stepMs: 1_000,
      });

      const mockLocator = createMockBackendServiceLocator({
        activeUserId: 'u-regular-1',
        clock,
      });

      const { findByText } = render(
        <ActiveVenueSessionTestNavigator servicesOverride={mockLocator.services} />,
      );

      expect(await findByText('Active Venue Session Screen')).toBeTruthy();
      expect(await findByText('Status: active')).toBeTruthy();

      clock.advanceBy(2 * 60 * 1000);

      await act(async () => {
        jest.advanceTimersByTime(15_000);
      });

      expect(await findByText('No Active Session')).toBeTruthy();
      expect(await findByText('No active venue session exists in the current mock state.')).toBeTruthy();
      expect(await findByText('Browse Nearby Venues')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });
});