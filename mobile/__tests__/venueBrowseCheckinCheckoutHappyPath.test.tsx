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
  it('completes browse -> venue details tabs -> checkout flow', async () => {
    const { findByText, getByText } = render(
      <VenueBrowseCheckinCheckoutNavigator />,
    );

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    expect(await findByText('You are checked in')).toBeTruthy();
    fireEvent.press(getByText('Halo Club'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    fireEvent.press(getByText('Matches'));
    expect(await findByText('Jordan • 27 • female')).toBeTruthy();

    fireEvent.press(getByText('Checkout'));
    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
  });
});