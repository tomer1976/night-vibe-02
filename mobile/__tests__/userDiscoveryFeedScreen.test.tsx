import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { UserDiscoveryFeedScreen, UserEntryScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function UserDiscoveryFeedTestNavigator({ servicesOverride }: { servicesOverride?: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.UserGroup} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={UserEntryScreen} name={ROUTE_NAMES.UserGroup} />
              <Stack.Screen component={UserDiscoveryFeedScreen} name={ROUTE_NAMES.UserDiscoveryFeed} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('user discovery feed screen', () => {
  it('progresses deterministically through paged candidates and reaches feed exhausted state', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const getFeed = jest
      .fn()
      .mockResolvedValueOnce({
        status: 'SUCCESS',
        data: {
          candidates: [
            {
              userId: 'u-discovery-a',
              displayName: 'Sam',
              age: 26,
              gender: 'female',
              profilePhotoUrl: 'mock://user-photo/sam',
              venueId: 'v-halo-club',
            },
          ],
          nextCursor: '1',
        },
        request_id: 'req-feed-1',
      })
      .mockResolvedValueOnce({
        status: 'SUCCESS',
        data: {
          candidates: [
            {
              userId: 'u-discovery-b',
              displayName: 'Noa',
              age: 29,
              gender: 'non_binary',
              profilePhotoUrl: 'mock://user-photo/noa',
              venueId: 'v-halo-club',
            },
          ],
        },
        request_id: 'req-feed-2',
      });

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      discovery: {
        ...mockLocator.services.discovery,
        getFeed,
      },
    };

    const { getByText, findByText } = render(<UserDiscoveryFeedTestNavigator servicesOverride={servicesOverride} />);

    fireEvent.press(getByText('User Discovery Feed Screen'));

    expect(await findByText('User Discovery Feed Screen')).toBeTruthy();
    expect(await findByText('Sam')).toBeTruthy();
    expect(await findByText('Candidate 1 in deterministic progression.')).toBeTruthy();

    fireEvent.press(getByText('View Next Candidate'));

    expect(await findByText('Noa')).toBeTruthy();
    expect(await findByText('Candidate 2 in deterministic progression.')).toBeTruthy();

    fireEvent.press(getByText('Finish Feed'));

    expect(await findByText('Feed Exhausted')).toBeTruthy();
    expect(await findByText('The current cursor reached the end of available candidates.')).toBeTruthy();
  });

  it('shows retryable error state when discovery feed is denied without active venue session', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      discovery: {
        ...mockLocator.services.discovery,
        getFeed: async () => ({
          status: 'FAIL',
          error: {
            code: 'NOT_CHECKED_IN',
            message: 'Active venue session is required before discovery feed can be loaded.',
          },
          request_id: 'req-feed-not-checked-in',
        }),
      },
    };

    const { getByText, findByText } = render(<UserDiscoveryFeedTestNavigator servicesOverride={servicesOverride} />);

    fireEvent.press(getByText('User Discovery Feed Screen'));

    expect(await findByText('Discovery Feed Failed')).toBeTruthy();
    expect(await findByText('Active venue session is required before discovery feed can be loaded.')).toBeTruthy();
    expect(await findByText('Retry')).toBeTruthy();
  });
});
