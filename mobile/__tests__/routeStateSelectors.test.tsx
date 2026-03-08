import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { ROUTE_NAMES } from '../src/navigation';
import { AppStateProvider, useFeatureFlagsState, useRouteAccessSelectors, useRoleState } from '../src/state';

function RouteSelectorProbe() {
  const routeAccess = useRouteAccessSelectors();
  const { setRoleSimulationEnabled } = useFeatureFlagsState();
  const { setActiveRoleContext, setAvailableRoles } = useRoleState();

  const ownerResolution = routeAccess.resolveWithAccess(ROUTE_NAMES.OwnerGroup);
  const userResolution = routeAccess.resolveWithAccess(ROUTE_NAMES.UserGroup);

  return (
    <View>
      <Text>{`ownerAllowed:${ownerResolution.isAllowed}`}</Text>
      <Text>{`ownerResolved:${ownerResolution.resolvedRoute}`}</Text>
      <Text>{`userAllowed:${userResolution.isAllowed}`}</Text>
      <Text>{`activeRole:${routeAccess.simulatedRoleContext.activeRoleContext ?? 'none'}`}</Text>

      <Pressable
        onPress={() => {
          setAvailableRoles(['RegularUser', 'VenueOwner']);
          setActiveRoleContext('VenueOwner');
        }}
        testID="set-owner-role"
      >
        <Text>set-owner-role</Text>
      </Pressable>

      <Pressable onPress={() => setRoleSimulationEnabled(false)} testID="disable-role-sim">
        <Text>disable-role-sim</Text>
      </Pressable>
    </View>
  );
}

describe('route state selectors', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_MOCK_IS_AUTHENTICATED: 'true',
      EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'RegularUser',
      EXPO_PUBLIC_MOCK_AVAILABLE_ROLES: 'RegularUser',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('resolves route safety from typed app state selectors', () => {
    const { getByTestId, getByText } = render(
      <AppStateProvider>
        <RouteSelectorProbe />
      </AppStateProvider>
    );

    expect(getByText('ownerAllowed:false')).toBeTruthy();
    expect(getByText(`ownerResolved:${ROUTE_NAMES.UnknownRouteFallback}`)).toBeTruthy();

    fireEvent.press(getByTestId('set-owner-role'));

    expect(getByText('ownerAllowed:true')).toBeTruthy();
    expect(getByText(`ownerResolved:${ROUTE_NAMES.OwnerGroup}`)).toBeTruthy();
    expect(getByText('activeRole:VenueOwner')).toBeTruthy();
  });

  it('routes to fallback when role simulation feature flag is disabled', () => {
    const { getByTestId, getByText } = render(
      <AppStateProvider>
        <RouteSelectorProbe />
      </AppStateProvider>
    );

    fireEvent.press(getByTestId('set-owner-role'));
    expect(getByText('ownerAllowed:true')).toBeTruthy();

    fireEvent.press(getByTestId('disable-role-sim'));

    expect(getByText('ownerAllowed:false')).toBeTruthy();
    expect(getByText(`ownerResolved:${ROUTE_NAMES.UnknownRouteFallback}`)).toBeTruthy();
  });
});