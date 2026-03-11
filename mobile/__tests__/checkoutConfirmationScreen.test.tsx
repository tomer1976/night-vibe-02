import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { CheckoutConfirmationScreen, NearbyVenuesScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function CheckoutConfirmationTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="CheckoutConfirmation" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={CheckoutConfirmationScreen} name="CheckoutConfirmation" />
              <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('checkout confirmation screen', () => {
  it('confirms checkout and transitions user toward nearby venues state', async () => {
    const { findByText, getByLabelText, getByText } = render(<CheckoutConfirmationTestNavigator />);

    expect(await findByText('Venue Checkout Confirmation Screen')).toBeTruthy();

    fireEvent.press(getByLabelText('Confirm Checkout'));

    expect(await findByText('Checkout Completed')).toBeTruthy();
    expect(await findByText(/Checkout completed at/)).toBeTruthy();

    fireEvent.press(getByText('Return to Nearby Venues'));
    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
  });
});