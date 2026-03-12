import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import {
  ActiveVenueSessionScreen,
  CheckInConfirmationScreen,
  CheckoutConfirmationScreen,
  NearbyVenuesScreen,
  VenueDetailsScreen,
} from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function VenueBrowseCheckinCheckoutNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="NearbyVenues" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
              <Stack.Screen component={VenueDetailsScreen} name="VenueDetails" />
              <Stack.Screen component={CheckInConfirmationScreen} name="CheckInConfirmation" />
              <Stack.Screen component={ActiveVenueSessionScreen} name="ActiveVenueSession" />
              <Stack.Screen component={CheckoutConfirmationScreen} name="CheckoutConfirmation" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue browse to checkout happy path', () => {
  it('completes browse -> check-in -> active session -> checkout flow', async () => {
    const { findByText, getAllByText, getByLabelText, getByText } = render(
      <VenueBrowseCheckinCheckoutNavigator />,
    );

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    fireEvent.press(getAllByText(/View Details:/i)[0]);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(getByText('Start Check-In'));

    expect(await findByText('Venue Check-In Confirmation Screen')).toBeTruthy();
    fireEvent.press(getByText('Confirm Check-In'));

    expect(await findByText('Check-in confirmed')).toBeTruthy();
    fireEvent.press(getByText('Open Active Session'));

    expect(await findByText('Active Venue Session Screen')).toBeTruthy();
    fireEvent.press(getByText('Proceed to Checkout'));

    expect(await findByText('Venue Checkout Confirmation Screen')).toBeTruthy();
    fireEvent.press(getByLabelText('Confirm Checkout'));

    expect(await findByText('Checkout Completed')).toBeTruthy();
    fireEvent.press(getByText('Return to Nearby Venues'));

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
  });
});