import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { NearbyVenuesScreen, UserEntryScreen, VenueDetailsScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function NearbyVenuesTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="UserGroup" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={UserEntryScreen} name="UserGroup" />
              <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
              <Stack.Screen component={VenueDetailsScreen} name="VenueDetails" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('nearby venues screen', () => {
  it('renders venue list with category/status/activity metadata from mock discovery', async () => {
    const { getByText, findByText } = render(<NearbyVenuesTestNavigator />);

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    expect(await findByText('Halo Club')).toBeTruthy();
    expect(await findByText('Luna Lounge')).toBeTruthy();
    expect(await findByText('1.20 km • club • active • 2 active • Busy now')).toBeTruthy();
    expect(await findByText('1.90 km • lounge • active • 0 active • Steady now')).toBeTruthy();

    fireEvent.press(getByText('Halo Club'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Start Check-In')).toBeTruthy();
  });
});
