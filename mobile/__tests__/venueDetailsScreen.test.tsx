import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { DiscoveryProfilePreviewScreen, VenueDetailsScreen } from '../src/screens';
import { ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';
import { resetVenuePeopleInteractionState } from '../src/screens/venuePeopleInteractionState';

const Stack = createNativeStackNavigator();

function VenueDetailsTestNavigator() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="VenueDetails" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={VenueDetailsScreen} initialParams={{ venueId: 'v-halo-club' }} name="VenueDetails" />
              <Stack.Screen component={DiscoveryProfilePreviewScreen} name="DiscoveryProfilePreview" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue details screen', () => {
  beforeEach(() => {
    resetVenuePeopleInteractionState();
  });

  it('opens dedicated discovery profile page when tapping a potential match bar', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Address: 12 Harbor Street, Tel Aviv')).toBeTruthy();
    expect(await findByText(/High-energy dance floor with live DJs/i)).toBeTruthy();
    expect(await findByText('Status: Active')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    expect(await findByText('Matches')).toBeTruthy();
    expect(await findByText('Riley Active • 29 • non binary')).toBeTruthy();
    expect(queryByText('Discovery Profile Preview Screen')).toBeNull();

    fireEvent.press(getByText('Riley Active • 29 • non binary'));

    expect(await findByText('Discovery Profile Preview Screen')).toBeTruthy();
    expect(await findByText('Like')).toBeTruthy();
    expect(await findByText('Pass')).toBeTruthy();
    expect(queryByText('Unmatch')).toBeNull();

    fireEvent.press(getByText('Back to Venue'));
    expect(await findByText('Venue Details Screen')).toBeTruthy();
  });

  it('shows like/pass for potential profile and toggles like to unlike', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(getByText('Riley Active • 29 • non binary'));

    expect(await findByText('Like')).toBeTruthy();
    expect(await findByText('Pass')).toBeTruthy();
    expect(queryByText('Unmatch')).toBeNull();

    fireEvent.press(getByText('Like'));
    expect(await findByText('Liked Riley Active.')).toBeTruthy();
    expect(await findByText('Unlike')).toBeTruthy();

    fireEvent.press(getByText('Unlike'));
    expect(await findByText('Removed like for Riley Active.')).toBeTruthy();
    expect(await findByText('Like')).toBeTruthy();
  });

  it('unmatch removes from matches and returns profile to potential list as unliked', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Matches')).toBeTruthy();
    fireEvent.press(getByText('Matches'));
    fireEvent.press(getByText('Jordan • 27 • female'));

    expect(await findByText('Unmatch')).toBeTruthy();
    expect(queryByText('Like')).toBeNull();
    expect(queryByText('Pass')).toBeNull();

    fireEvent.press(getByText('Unmatch'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(getByText('Potential Matches'));
    expect(await findByText('Jordan • 27 • female')).toBeTruthy();

    fireEvent.press(getByText('Jordan • 27 • female'));
    expect(await findByText('Like')).toBeTruthy();
    expect(queryByText('Unlike')).toBeNull();
  });
});