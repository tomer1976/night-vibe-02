import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { AccountStatus, Role } from '../contracts';
import { readRuntimeMode } from '../config/firebaseRuntimeGuard';
import { readSimulatedRoleContextFromEnv } from '../navigation/roleContextSimulation';

export type AuthState = {
  accountStatus: AccountStatus;
  isAuthenticated: boolean;
  setAccountStatus: (status: AccountStatus) => void;
  setAuthenticated: (value: boolean) => void;
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
  setAccountStatus: () => undefined,
  setAuthenticated: () => undefined,
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

  const [accountStatus, setAccountStatus] = useState<AccountStatus>('active');
  const [isAuthenticated, setAuthenticated] = useState<boolean>(simulatedRoleContext.isAuthenticated);
  const [activeRoleContext, setActiveRoleContext] = useState<Role | null>(simulatedRoleContext.activeRoleContext);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([...simulatedRoleContext.availableRoles]);
  const [isRoleSimulationEnabled, setRoleSimulationEnabled] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(true);

  const authState = useMemo<AuthState>(
    () => ({
      accountStatus,
      isAuthenticated,
      setAccountStatus,
      setAuthenticated,
    }),
    [accountStatus, isAuthenticated]
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