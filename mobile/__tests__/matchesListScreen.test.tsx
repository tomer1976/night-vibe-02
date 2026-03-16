import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts, MatchRecord } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { MatchesListScreen, UserEntryScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function buildMatch(overrides: Partial<MatchRecord>): MatchRecord {
  return {
    matchId: 'match-1',
    users: ['u-1', 'u-2'],
    venueId: 'v-halo-club',
    counterpart: {
      userId: 'u-2',
      displayName: 'Riley',
      age: 29,
      gender: 'non_binary',
      profilePhotoUrl: 'mock://user-photo/riley',
    },
    status: 'matched',
    ...overrides,
  };
}

function MatchesListTestNavigator({ servicesOverride }: { servicesOverride: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.MatchesList} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={MatchesListScreen} name={ROUTE_NAMES.MatchesList} />
              <Stack.Screen component={UserEntryScreen} name={ROUTE_NAMES.UserGroup} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('matches list screen', () => {
  it('renders active and expired match sections', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      match: {
        ...locator.services.match,
        listMatches: async () => ({
          status: 'SUCCESS',
          data: {
            matches: [
              buildMatch({
                matchId: 'match-active-1',
                counterpart: {
                  userId: 'u-10',
                  displayName: 'Jordan',
                  age: 27,
                  gender: 'female',
                  profilePhotoUrl: 'mock://user-photo/jordan',
                },
                status: 'matched',
              }),
              buildMatch({
                matchId: 'match-expired-1',
                counterpart: {
                  userId: 'u-11',
                  displayName: 'Avery',
                  age: 31,
                  gender: 'male',
                  profilePhotoUrl: 'mock://user-photo/avery',
                },
                status: 'expired',
              }),
            ],
          },
          request_id: 'req-matches-list-success-1',
        }),
      },
    };

    const screen = render(<MatchesListTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('Matches List Screen')).toBeTruthy();
    expect(await screen.findByText('Active Matches')).toBeTruthy();
    expect(await screen.findByText('Expired Matches')).toBeTruthy();
    expect(await screen.findByText('Jordan • 27 • female')).toBeTruthy();
    expect(await screen.findByText('Avery • 31 • male')).toBeTruthy();
    expect(await screen.findByText('Active: 1')).toBeTruthy();
    expect(await screen.findByText('Expired: 1')).toBeTruthy();
  });

  it('renders empty state when no active or expired matches are returned', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      match: {
        ...locator.services.match,
        listMatches: async () => ({
          status: 'SUCCESS',
          data: {
            matches: [],
          },
          request_id: 'req-matches-list-empty-1',
        }),
      },
    };

    const screen = render(<MatchesListTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('No Matches')).toBeTruthy();
    expect(await screen.findByText('No active or expired matches are available yet.')).toBeTruthy();
  });

  it('renders retry state on failure and recovers after retry', async () => {
    const locator = createMockBackendServiceLocator();
    let attempt = 0;

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      match: {
        ...locator.services.match,
        listMatches: async () => {
          attempt += 1;

          if (attempt === 1) {
            return {
              status: 'FAIL',
              error: {
                code: 'INTERNAL_ERROR',
                message: 'Simulated match list failure.',
                details: {
                  scenario: 'retry',
                },
              },
              request_id: 'req-matches-list-fail-1',
            };
          }

          return {
            status: 'SUCCESS',
            data: {
              matches: [
                buildMatch({
                  matchId: 'match-active-after-retry',
                  counterpart: {
                    userId: 'u-12',
                    displayName: 'Quinn',
                    age: 26,
                    gender: 'female',
                    profilePhotoUrl: 'mock://user-photo/quinn',
                  },
                  status: 'matched',
                }),
              ],
            },
            request_id: 'req-matches-list-success-2',
          };
        },
      },
    };

    const screen = render(<MatchesListTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('Matches Failed')).toBeTruthy();
    expect(await screen.findByText('Simulated match list failure.')).toBeTruthy();

    fireEvent.press(screen.getByText('Retry'));

    expect(await screen.findByText('Active Matches')).toBeTruthy();
    expect(await screen.findByText('Quinn • 26 • female')).toBeTruthy();
  });
});