import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { ActiveVenueSessionScreen, CheckoutConfirmationScreen, NearbyVenuesScreen, VenuePresenceScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function ActiveVenueSessionTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
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
});