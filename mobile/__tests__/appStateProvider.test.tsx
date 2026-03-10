import { act, fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { AppStateProvider, useAuthState, useFeatureFlagsState, useRoleState } from '../src/state';

function StateProbe() {
  const {
    accountStatus,
    authLifecycle,
    beginAuthentication,
    completeAuthentication,
    enterSessionRecovery,
    isAuthenticated,
    resetAuthState,
    setAuthenticated,
  } = useAuthState();
  const { activeRoleContext, availableRoles, setActiveRoleContext } = useRoleState();
  const { isMockModeEnabled, isRoleSimulationEnabled, setRoleSimulationEnabled } = useFeatureFlagsState();

  return (
    <View>
      <Text>{`auth:${isAuthenticated}`}</Text>
      <Text>{`status:${accountStatus}`}</Text>
      <Text>{`lifecycle:${authLifecycle}`}</Text>
      <Text>{`activeRole:${activeRoleContext ?? 'none'}`}</Text>
      <Text>{`roles:${availableRoles.join('|')}`}</Text>
      <Text>{`mockMode:${isMockModeEnabled}`}</Text>
      <Text>{`roleSimulation:${isRoleSimulationEnabled}`}</Text>

      <Pressable onPress={() => setAuthenticated(false)} testID="set-auth-false">
        <Text>set-auth-false</Text>
      </Pressable>
      <Pressable onPress={() => setActiveRoleContext('Administrator')} testID="set-role-admin">
        <Text>set-role-admin</Text>
      </Pressable>
      <Pressable onPress={() => setRoleSimulationEnabled(false)} testID="disable-role-sim">
        <Text>disable-role-sim</Text>
      </Pressable>
      <Pressable onPress={beginAuthentication} testID="begin-authentication">
        <Text>begin-authentication</Text>
      </Pressable>
      <Pressable onPress={() => completeAuthentication('suspended')} testID="complete-auth-suspended">
        <Text>complete-auth-suspended</Text>
      </Pressable>
      <Pressable onPress={enterSessionRecovery} testID="enter-session-recovery">
        <Text>enter-session-recovery</Text>
      </Pressable>
      <Pressable onPress={() => resetAuthState('active', false)} testID="reset-auth-signed-out">
        <Text>reset-auth-signed-out</Text>
      </Pressable>
    </View>
  );
}

describe('AppStateProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_MOCK_IS_AUTHENTICATED: 'true',
      EXPO_PUBLIC_MOCK_ACTIVE_ROLE: 'VenueOwner',
      EXPO_PUBLIC_MOCK_AVAILABLE_ROLES: 'RegularUser,VenueOwner',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('initializes auth/role state from simulated role context env', () => {
    const { getByText } = render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>
    );

    expect(getByText('auth:true')).toBeTruthy();
    expect(getByText('status:active')).toBeTruthy();
    expect(getByText('lifecycle:authenticated')).toBeTruthy();
    expect(getByText('activeRole:VenueOwner')).toBeTruthy();
    expect(getByText('roles:RegularUser|VenueOwner')).toBeTruthy();
  });

  it('updates each state container through setters', () => {
    const { getByTestId, getByText } = render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>
    );

    act(() => {
      fireEvent.press(getByTestId('set-auth-false'));
      fireEvent.press(getByTestId('set-role-admin'));
      fireEvent.press(getByTestId('disable-role-sim'));
    });

    expect(getByText('auth:false')).toBeTruthy();
    expect(getByText('activeRole:Administrator')).toBeTruthy();
    expect(getByText('roleSimulation:false')).toBeTruthy();
  });

  it('runs auth lifecycle transitions via auth store actions', () => {
    const { getByTestId, getByText } = render(
      <AppStateProvider>
        <StateProbe />
      </AppStateProvider>
    );

    act(() => {
      fireEvent.press(getByTestId('begin-authentication'));
    });

    expect(getByText('lifecycle:authenticating')).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId('complete-auth-suspended'));
    });

    expect(getByText('status:suspended')).toBeTruthy();
    expect(getByText('lifecycle:access_denied')).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId('enter-session-recovery'));
    });

    expect(getByText('status:pending_deletion')).toBeTruthy();
    expect(getByText('lifecycle:session_recovery')).toBeTruthy();

    act(() => {
      fireEvent.press(getByTestId('reset-auth-signed-out'));
    });

    expect(getByText('auth:false')).toBeTruthy();
    expect(getByText('status:active')).toBeTruthy();
    expect(getByText('lifecycle:signed_out')).toBeTruthy();
  });
});