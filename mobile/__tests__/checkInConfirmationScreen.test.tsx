import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { CheckInConfirmationScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function CheckInConfirmationTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="CheckInConfirmation" screenOptions={{ headerShown: false }}>
              <Stack.Screen
                component={CheckInConfirmationScreen}
                initialParams={{ venueId: 'v-halo-club', venueName: 'Halo Club' }}
                name="CheckInConfirmation"
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('check-in confirmation screen', () => {
  it('supports deterministic success and denial scenarios', async () => {
    const { findByText, getByText } = render(<CheckInConfirmationTestNavigator />);

    expect(await findByText('Venue Check-In Confirmation Screen')).toBeTruthy();

    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText(/Check-in succeeded\. Session/)).toBeTruthy();

    fireEvent.press(getByText('Out of Range'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText(/Check-in denied: OUT_OF_RANGE\./)).toBeTruthy();

    fireEvent.press(getByText('Location Permission Denied'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText(/Check-in denied: PERMISSION_DENIED\./)).toBeTruthy();

    fireEvent.press(getByText('Stale Location'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText(/Check-in denied: VALIDATION_ERROR\./)).toBeTruthy();

    fireEvent.press(getByText('Venue Ineligible'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText(/Check-in denied: NOT_FOUND\./)).toBeTruthy();
  });
});