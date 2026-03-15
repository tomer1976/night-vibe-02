import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { DiscoveryProfilePreviewScreen, MatchConfirmationScreen } from '../src/screens';
import { resetVenuePeopleInteractionState } from '../src/screens/venuePeopleInteractionState';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function buildServicesOverride(matchCreated: boolean, withActiveSession: boolean): BackendServiceContracts {
  const locator = createMockBackendServiceLocator();

  return {
    ...locator.services,
    presence: {
      ...locator.services.presence,
      getMyActiveSession: async () => {
        if (withActiveSession) {
          return locator.services.presence.getMyActiveSession();
        }

        return {
          status: 'SUCCESS',
          data: null,
          request_id: 'req-no-active-session',
        };
      },
    },
    interactions: {
      ...locator.services.interactions,
      likeUser: async (request) => ({
        status: 'SUCCESS',
        data: {
          status: 'SUCCESS',
          interaction: 'LIKE',
          interactionId: 'interaction-test-1',
          targetUserId: request.targetUserId,
          venueId: request.venueId,
          idempotencyKey: request.idempotencyKey,
          decision: 'created',
          duplicateScope: 'actor_target_venue_session',
          matchCreated,
          matchId: matchCreated ? 'match-u-regular-1-u-discovery-3' : undefined,
        },
        request_id: 'req-test-1',
      }),
    },
  };
}

function NearbyVenuesGuardStub() {
  return <Text>Nearby Venues Guarded Route</Text>;
}

function DiscoveryProfilePreviewMatchNavigator({ matchCreated, withActiveSession = true }: { matchCreated: boolean; withActiveSession?: boolean }) {
  const servicesOverride = buildServicesOverride(matchCreated, withActiveSession);

  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.DiscoveryProfilePreview} screenOptions={{ headerShown: false }}>
              <Stack.Screen
                component={DiscoveryProfilePreviewScreen}
                initialParams={{
                  venueId: 'v-halo-club',
                  source: 'potential',
                  userId: 'u-discovery-3',
                  displayName: 'Sky',
                  age: 27,
                  gender: 'female',
                  profilePhotoUrl: 'mock://user-photo/sky',
                }}
                name={ROUTE_NAMES.DiscoveryProfilePreview}
              />
              <Stack.Screen component={MatchConfirmationScreen} name={ROUTE_NAMES.MatchConfirmation} />
              <Stack.Screen component={NearbyVenuesGuardStub} name={ROUTE_NAMES.NearbyVenues} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

function DiscoveryProfilePreviewAsMatchNavigator() {
  const locator = createMockBackendServiceLocator();

  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={locator.services}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.DiscoveryProfilePreview} screenOptions={{ headerShown: false }}>
              <Stack.Screen
                component={DiscoveryProfilePreviewScreen}
                initialParams={{
                  venueId: 'v-halo-club',
                  source: 'match',
                  userId: 'u-discovery-3',
                  displayName: 'Sky',
                  age: 27,
                  gender: 'female',
                  profilePhotoUrl: 'mock://user-photo/sky',
                  matchId: 'match-u-regular-1-u-discovery-3',
                }}
                name={ROUTE_NAMES.DiscoveryProfilePreview}
              />
              <Stack.Screen component={NearbyVenuesGuardStub} name={ROUTE_NAMES.NearbyVenues} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('discovery profile preview to match confirmation', () => {
  beforeEach(() => {
    resetVenuePeopleInteractionState();
  });

  it('opens match confirmation only when reciprocal match is created', async () => {
    const withMatch = render(<DiscoveryProfilePreviewMatchNavigator matchCreated />);

    fireEvent.press(await withMatch.findByText('Like'));
    expect(await withMatch.findByText('Match Confirmation Screen')).toBeTruthy();
    expect(await withMatch.findByText('Match State: Created')).toBeTruthy();

    resetVenuePeopleInteractionState();

    const withoutMatch = render(<DiscoveryProfilePreviewMatchNavigator matchCreated={false} />);

    fireEvent.press(await withoutMatch.findByText('Like'));
    expect(await withoutMatch.findByText('Liked Sky.')).toBeTruthy();
    expect(withoutMatch.queryByText('Match Confirmation Screen')).toBeNull();
  });

  it('redirects discovery preview to nearby venues when there is no active venue session', async () => {
    const screen = render(<DiscoveryProfilePreviewMatchNavigator matchCreated withActiveSession={false} />);

    expect(await screen.findByText('Nearby Venues Guarded Route')).toBeTruthy();
    expect(screen.queryByText('Discovery Profile Preview Screen')).toBeNull();
  });

  it('shows clear eligibility and state labels for match profiles', async () => {
    const screen = render(<DiscoveryProfilePreviewAsMatchNavigator />);

    expect(await screen.findByText('Eligibility: Active in Same Venue')).toBeTruthy();
    expect(await screen.findByText('Profile State: Match')).toBeTruthy();
    expect(await screen.findByText('Interaction State: Matched')).toBeTruthy();
  });
});
