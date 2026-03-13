import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import {
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
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue browse to checkout happy path', () => {
  it('completes browse -> check-in -> venue details tabs -> checkout flow', async () => {
    const { findByText, getByText } = render(
      <VenueBrowseCheckinCheckoutNavigator />,
    );

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    fireEvent.press(getByText('Check-In'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    fireEvent.press(getByText('Matches'));
    expect(await findByText('No matches are available in this venue right now.')).toBeTruthy();

    fireEvent.press(getByText('Checkout'));
    expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
    fireEvent.press(getByText('Back to Nearby Venues'));

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
  });
});