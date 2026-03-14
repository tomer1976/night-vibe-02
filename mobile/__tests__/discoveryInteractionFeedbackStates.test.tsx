import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { DiscoveryProfilePreviewScreen } from '../src/screens';
import { resetVenuePeopleInteractionState } from '../src/screens/venuePeopleInteractionState';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function NearbyVenuesGuardStub() {
  return <Text>Nearby Venues Guarded Route</Text>;
}

function buildNavigator(servicesOverride: BackendServiceContracts) {
  return render(
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="DiscoveryProfilePreview" screenOptions={{ headerShown: false }}>
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
                name="DiscoveryProfilePreview"
              />
              <Stack.Screen component={NearbyVenuesGuardStub} name={ROUTE_NAMES.NearbyVenues} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('discovery interaction feedback states', () => {
  beforeEach(() => {
    resetVenuePeopleInteractionState();
  });

  it('shows loading then success feedback for like', async () => {
    const locator = createMockBackendServiceLocator();
    let resolveLike: (() => void) | undefined;

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      interactions: {
        ...locator.services.interactions,
        likeUser: async (request) => {
          await new Promise<void>((resolve) => {
            resolveLike = resolve;
          });

          return {
            status: 'SUCCESS',
            data: {
              status: 'SUCCESS',
              interaction: 'LIKE',
              interactionId: 'interaction-feedback-success',
              targetUserId: request.targetUserId,
              venueId: request.venueId,
              idempotencyKey: request.idempotencyKey,
              decision: 'created',
              duplicateScope: 'actor_target_venue_session',
              matchCreated: false,
            },
            request_id: 'req-feedback-success',
          };
        },
      },
    };

    const screen = buildNavigator(servicesOverride);
    const { findByText, getByText } = screen;

    fireEvent.press(await findByText('Like'));
    expect(await findByText('Processing interaction…')).toBeTruthy();

    resolveLike?.();

    expect(await findByText('Liked Sky.')).toBeTruthy();
    expect(await findByText('Unlike')).toBeTruthy();
    expect(getByText('Back to Venue')).toBeTruthy();
  });

  it('shows duplicate feedback when duplicate interaction is returned', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      interactions: {
        ...locator.services.interactions,
        likeUser: async () => ({
          status: 'FAIL',
          error: {
            code: 'DUPLICATE_INTERACTION',
            message: 'Duplicate interaction detected for actor-target-venue-session scope.',
            details: { scope: 'actor_target_venue_session' },
          },
          request_id: 'req-feedback-duplicate',
        }),
      },
    };

    const screen = buildNavigator(servicesOverride);
    const { findByText, queryByText } = screen;

    fireEvent.press(await findByText('Like'));

    expect(await findByText('Duplicate interaction detected for actor-target-venue-session scope.')).toBeTruthy();
    expect(queryByText('Unlike')).toBeNull();
  });

  it('shows failure feedback when like request throws', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      interactions: {
        ...locator.services.interactions,
        likeUser: async () => {
          throw new Error('transport_failure');
        },
      },
    };

    const screen = buildNavigator(servicesOverride);
    const { findByText } = screen;

    fireEvent.press(await findByText('Like'));

    expect(await findByText('Unable to submit like right now. Please retry.')).toBeTruthy();

    await waitFor(async () => {
      expect(await findByText('Like')).toBeTruthy();
    });
  });
});
