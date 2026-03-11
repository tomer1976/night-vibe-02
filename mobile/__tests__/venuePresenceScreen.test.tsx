import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { ActiveVenueSessionScreen, VenuePresenceScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function VenuePresenceTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="VenuePresence" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={VenuePresenceScreen} name="VenuePresence" />
              <Stack.Screen component={ActiveVenueSessionScreen} name="ActiveVenueSession" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue presence screen', () => {
  it('renders mock active attendee summaries for the active venue', async () => {
    const { findByText, getByText } = render(<VenuePresenceTestNavigator />);

    expect(await findByText('Venue Presence Screen')).toBeTruthy();
    expect(await findByText('Venue: Halo Club')).toBeTruthy();
    expect(await findByText('Active attendees: 2')).toBeTruthy();
    expect(await findByText('Visible summaries: 1')).toBeTruthy();
    expect(await findByText('Jordan')).toBeTruthy();
    expect(await findByText('Age 27 • Venue v-halo-club')).toBeTruthy();

    fireEvent.press(getByText('Back to Active Session'));
    expect(await findByText('Active Venue Session Screen')).toBeTruthy();
  });
});
