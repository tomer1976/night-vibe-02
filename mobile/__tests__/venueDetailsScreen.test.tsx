import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { VenueDetailsScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function VenueDetailsTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="VenueDetails" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={VenueDetailsScreen} initialParams={{ venueId: 'v-halo-club' }} name="VenueDetails" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue details screen', () => {
  it('renders richer venue details content and supports direct checkout action', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Address: 12 Harbor Street, Tel Aviv')).toBeTruthy();
    expect(await findByText(/High-energy dance floor with live DJs/i)).toBeTruthy();
    expect(await findByText('Status: Active')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    expect(await findByText('Matches')).toBeTruthy();

    if (queryByText('Checkout')) {
      expect(await findByText('Jordan • 27 • female')).toBeTruthy();
      fireEvent.press(getByText('Checkout'));

      expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
      expect(await findByText('Check in to this venue to see people here.')).toBeTruthy();
      return;
    }

    expect(await findByText('Check in to this venue to see people here.')).toBeTruthy();
    fireEvent.press(getByText('Check-In'));
    expect(await findByText('Check-in completed. You are now checked into this venue.')).toBeTruthy();
    expect(await findByText('Jordan • 27 • female')).toBeTruthy();
    fireEvent.press(getByText('Checkout'));

    expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
    expect(await findByText('Check in to this venue to see people here.')).toBeTruthy();
  });

  it('switches between potential matches and matches tabs on venue page', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();

    if (queryByText('Checkout')) {
      fireEvent.press(getByText('Checkout'));
      expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
    }

    fireEvent.press(getByText('Check-In'));

    expect(await findByText('Check-in completed. You are now checked into this venue.')).toBeTruthy();
    expect(await findByText('Jordan • 27 • female')).toBeTruthy();
    fireEvent.press(getByText('Matches'));

    expect(await findByText('Jordan • 27 • female')).toBeTruthy();
  });
});