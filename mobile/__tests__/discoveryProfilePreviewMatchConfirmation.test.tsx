import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { DiscoveryProfilePreviewScreen, MatchConfirmationScreen } from '../src/screens';
import { resetVenuePeopleInteractionState } from '../src/screens/venuePeopleInteractionState';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function buildServicesOverride(matchCreated: boolean): BackendServiceContracts {
  const locator = createMockBackendServiceLocator();

  return {
    ...locator.services,
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

function DiscoveryProfilePreviewMatchNavigator({ matchCreated }: { matchCreated: boolean }) {
  const servicesOverride = buildServicesOverride(matchCreated);

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

    resetVenuePeopleInteractionState();

    const withoutMatch = render(<DiscoveryProfilePreviewMatchNavigator matchCreated={false} />);

    fireEvent.press(await withoutMatch.findByText('Like'));
    expect(await withoutMatch.findByText('Liked Sky.')).toBeTruthy();
    expect(withoutMatch.queryByText('Match Confirmation Screen')).toBeNull();
  });
});
