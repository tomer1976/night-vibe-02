import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { ROUTE_NAMES } from '../src/navigation';
import { AppStateProvider, useFeatureFlagsState, useOnboardingState, useRouteAccessSelectors, useRoleState } from '../src/state';

function RouteSelectorProbe() {
  const routeAccess = useRouteAccessSelectors();
  const { setRoleSimulationEnabled } = useFeatureFlagsState();
  const { setProfileCompleted } = useOnboardingState();
  const { setActiveRoleContext, setAvailableRoles } = useRoleState();

  const ownerResolution = routeAccess.resolveWithAccess(ROUTE_NAMES.OwnerGroup);
  const userResolution = routeAccess.resolveWithAccess(ROUTE_NAMES.UserGroup);
  const userProfileResolution = routeAccess.resolveWithAccess(ROUTE_NAMES.UserProfile);
  const accountSettingsResolution = routeAccess.resolveWithAccess(ROUTE_NAMES.AccountSettings);

  return (
    <View>
      <Text>{`ownerAllowed:${ownerResolution.isAllowed}`}</Text>
      <Text>{`ownerResolved:${ownerResolution.resolvedRoute}`}</Text>
      <Text>{`userAllowed:${userResolution.isAllowed}`}</Text>
      <Text>{`userResolved:${userResolution.resolvedRoute}`}</Text>
      <Text>{`userProfileAllowed:${userProfileResolution.isAllowed}`}</Text>
      <Text>{`userProfileResolved:${userProfileResolution.resolvedRoute}`}</Text>
      <Text>{`accountSettingsAllowed:${accountSettingsResolution.isAllowed}`}</Text>
      <Text>{`accountSettingsResolved:${accountSettingsResolution.resolvedRoute}`}</Text>
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

      <Pressable onPress={() => setProfileCompleted(false)} testID="set-profile-incomplete">
        <Text>set-profile-incomplete</Text>
      </Pressable>

      <Pressable onPress={() => setProfileCompleted(true)} testID="set-profile-complete">
        <Text>set-profile-complete</Text>
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

  it('gates post-onboarding user routes when profile is incomplete', () => {
    const { getByTestId, getByText } = render(
      <AppStateProvider>
        <RouteSelectorProbe />
      </AppStateProvider>
    );

    expect(getByText('userAllowed:true')).toBeTruthy();
    expect(getByText(`userResolved:${ROUTE_NAMES.UserGroup}`)).toBeTruthy();
    expect(getByText('userProfileAllowed:true')).toBeTruthy();
    expect(getByText(`userProfileResolved:${ROUTE_NAMES.UserProfile}`)).toBeTruthy();
    expect(getByText('accountSettingsAllowed:true')).toBeTruthy();
    expect(getByText(`accountSettingsResolved:${ROUTE_NAMES.AccountSettings}`)).toBeTruthy();

    fireEvent.press(getByTestId('set-profile-incomplete'));

    expect(getByText('userAllowed:false')).toBeTruthy();
    expect(getByText(`userResolved:${ROUTE_NAMES.ProfileCompletionRequired}`)).toBeTruthy();
    expect(getByText('userProfileAllowed:false')).toBeTruthy();
    expect(getByText(`userProfileResolved:${ROUTE_NAMES.ProfileCompletionRequired}`)).toBeTruthy();
    expect(getByText('accountSettingsAllowed:false')).toBeTruthy();
    expect(getByText(`accountSettingsResolved:${ROUTE_NAMES.ProfileCompletionRequired}`)).toBeTruthy();

    fireEvent.press(getByTestId('set-profile-complete'));

    expect(getByText('userAllowed:true')).toBeTruthy();
    expect(getByText(`userResolved:${ROUTE_NAMES.UserGroup}`)).toBeTruthy();
    expect(getByText('userProfileAllowed:true')).toBeTruthy();
    expect(getByText(`userProfileResolved:${ROUTE_NAMES.UserProfile}`)).toBeTruthy();
    expect(getByText('accountSettingsAllowed:true')).toBeTruthy();
    expect(getByText(`accountSettingsResolved:${ROUTE_NAMES.AccountSettings}`)).toBeTruthy();
  });
});