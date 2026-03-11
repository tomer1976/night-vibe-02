import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { CheckInConfirmationScreen, VenueDetailsScreen } from '../src/screens';
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
              <Stack.Screen component={CheckInConfirmationScreen} name="CheckInConfirmation" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue details screen', () => {
  it('navigates into check-in confirmation flow from venue details', async () => {
    const { findByText, getByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(getByText('Start Check-In'));

    expect(await findByText('Venue Check-In Confirmation Screen')).toBeTruthy();
  });
});