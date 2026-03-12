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
    expect(await findByText('Check-in confirmed')).toBeTruthy();

    fireEvent.press(getByText('Out of Range'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText('Check-in blocked: you are out of range')).toBeTruthy();
    expect(await findByText(/Move closer to this venue and retry once you are within the check-in radius\./)).toBeTruthy();

    fireEvent.press(getByText('Location Permission Denied'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText('Check-in blocked: location permission is required')).toBeTruthy();
    expect(await findByText(/Enable location permission to verify venue proximity before check-in\./)).toBeTruthy();

    fireEvent.press(getByText('Stale Location'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText('Check-in blocked: refresh your location')).toBeTruthy();
    expect(await findByText(/Your location reading is stale\. Refresh location and confirm check-in again\./)).toBeTruthy();

    fireEvent.press(getByText('Venue Ineligible'));
    fireEvent.press(getByText('Confirm Check-In'));
    expect(await findByText('Check-in blocked: venue is not eligible')).toBeTruthy();
    expect(await findByText(/This venue is unavailable for check-in in the current mock scenario\./)).toBeTruthy();
  });
});