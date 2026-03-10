import { createContext, PropsWithChildren, useContext, useMemo, useReducer, useState } from 'react';

import { AccountStatus, Role } from '../contracts';
import { readRuntimeMode } from '../config/firebaseRuntimeGuard';
import { readSimulatedRoleContextFromEnv } from '../navigation/roleContextSimulation';
import { AuthLifecycle, authStoreReducer, createInitialAuthStoreState } from './authStateStore';

export type AuthState = {
  accountStatus: AccountStatus;
  isAuthenticated: boolean;
  authLifecycle: AuthLifecycle;
  setAccountStatus: (status: AccountStatus) => void;
  setAuthenticated: (value: boolean) => void;
  beginAuthentication: () => void;
  completeAuthentication: (status: AccountStatus, isAuthenticated?: boolean) => void;
  enterSessionRecovery: () => void;
  resolveSessionRecovery: () => void;
  denyAccess: (status: Extract<AccountStatus, 'suspended' | 'banned' | 'deleted'>) => void;
  resetAuthState: (status?: AccountStatus, isAuthenticated?: boolean) => void;
};

export type RoleState = {
  activeRoleContext: Role | null;
  availableRoles: Role[];
  setActiveRoleContext: (role: Role | null) => void;
  setAvailableRoles: (roles: Role[]) => void;
};

export type FeatureFlagsState = {
  isMockModeEnabled: boolean;
  isRoleSimulationEnabled: boolean;
  setRoleSimulationEnabled: (value: boolean) => void;
};

export type OnboardingState = {
  profileCompleted: boolean;
  setProfileCompleted: (value: boolean) => void;
};

const defaultAuthState: AuthState = {
  accountStatus: 'active',
  isAuthenticated: true,
  authLifecycle: 'authenticated',
  setAccountStatus: () => undefined,
  setAuthenticated: () => undefined,
  beginAuthentication: () => undefined,
  completeAuthentication: () => undefined,
  enterSessionRecovery: () => undefined,
  resolveSessionRecovery: () => undefined,
  denyAccess: () => undefined,
  resetAuthState: () => undefined,
};

const defaultRoleState: RoleState = {
  activeRoleContext: 'RegularUser',
  availableRoles: ['RegularUser'],
  setActiveRoleContext: () => undefined,
  setAvailableRoles: () => undefined,
};

const defaultFeatureFlagsState: FeatureFlagsState = {
  isMockModeEnabled: readRuntimeMode() === 'phase1-mock',
  isRoleSimulationEnabled: true,
  setRoleSimulationEnabled: () => undefined,
};

const defaultOnboardingState: OnboardingState = {
  profileCompleted: true,
  setProfileCompleted: () => undefined,
};

const AuthStateContext = createContext<AuthState>(defaultAuthState);
const RoleStateContext = createContext<RoleState>(defaultRoleState);
const FeatureFlagsStateContext = createContext<FeatureFlagsState>(defaultFeatureFlagsState);
const OnboardingStateContext = createContext<OnboardingState>(defaultOnboardingState);

export function AppStateProvider({ children }: PropsWithChildren) {
  const simulatedRoleContext = readSimulatedRoleContextFromEnv();

  const [authStoreState, dispatchAuthStore] = useReducer(
    authStoreReducer,
    createInitialAuthStoreState({
      accountStatus: 'active',
      isAuthenticated: simulatedRoleContext.isAuthenticated,
    })
  );

  const [activeRoleContext, setActiveRoleContext] = useState<Role | null>(simulatedRoleContext.activeRoleContext);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([...simulatedRoleContext.availableRoles]);
  const [isRoleSimulationEnabled, setRoleSimulationEnabled] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(true);

  const authState = useMemo<AuthState>(
    () => ({
      accountStatus: authStoreState.accountStatus,
      isAuthenticated: authStoreState.isAuthenticated,
      authLifecycle: authStoreState.authLifecycle,
      setAccountStatus: (status) => {
        dispatchAuthStore({
          type: 'SET_ACCOUNT_STATUS',
          status,
        });
      },
      setAuthenticated: (value) => {
        dispatchAuthStore({
          type: 'SET_AUTHENTICATED',
          isAuthenticated: value,
        });
      },
      beginAuthentication: () => {
        dispatchAuthStore({ type: 'BEGIN_AUTHENTICATION' });
      },
      completeAuthentication: (status, isAuthenticated = true) => {
        dispatchAuthStore({
          type: 'COMPLETE_AUTHENTICATION',
          payload: {
            accountStatus: status,
            isAuthenticated,
          },
        });
      },
      enterSessionRecovery: () => {
        dispatchAuthStore({ type: 'ENTER_SESSION_RECOVERY' });
      },
      resolveSessionRecovery: () => {
        dispatchAuthStore({ type: 'RESOLVE_SESSION_RECOVERY' });
      },
      denyAccess: (status) => {
        dispatchAuthStore({
          type: 'DENY_ACCESS',
          status,
        });
      },
      resetAuthState: (status = 'active', isAuthenticated = false) => {
        dispatchAuthStore({
          type: 'RESET_AUTH_STATE',
          accountStatus: status,
          isAuthenticated,
        });
      },
    }),
    [authStoreState]
  );

  const roleState = useMemo<RoleState>(
    () => ({
      activeRoleContext,
      availableRoles,
      setActiveRoleContext,
      setAvailableRoles,
    }),
    [activeRoleContext, availableRoles]
  );

  const featureFlagsState = useMemo<FeatureFlagsState>(
    () => ({
      isMockModeEnabled: readRuntimeMode() === 'phase1-mock',
      isRoleSimulationEnabled,
      setRoleSimulationEnabled,
    }),
    [isRoleSimulationEnabled]
  );

  const onboardingState = useMemo<OnboardingState>(
    () => ({
      profileCompleted,
      setProfileCompleted,
    }),
    [profileCompleted]
  );

  return (
    <FeatureFlagsStateContext.Provider value={featureFlagsState}>
      <AuthStateContext.Provider value={authState}>
        <RoleStateContext.Provider value={roleState}>
          <OnboardingStateContext.Provider value={onboardingState}>{children}</OnboardingStateContext.Provider>
        </RoleStateContext.Provider>
      </AuthStateContext.Provider>
    </FeatureFlagsStateContext.Provider>
  );
}

export function useAuthState(): AuthState {
  return useContext(AuthStateContext);
}

export function useRoleState(): RoleState {
  return useContext(RoleStateContext);
}

export function useFeatureFlagsState(): FeatureFlagsState {
  return useContext(FeatureFlagsStateContext);
}

export function useOnboardingState(): OnboardingState {
  return useContext(OnboardingStateContext);
}