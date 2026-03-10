import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useReducer, useState } from 'react';

import { AccountStatus, Role } from '../contracts';
import { readRuntimeMode } from '../config/firebaseRuntimeGuard';
import { readSimulatedRoleContextFromEnv } from '../navigation/roleContextSimulation';
import { AccountSettingsDraft, LinkedAccountDraft, LinkedAccountProvider } from '../screens/accountSettingsDraft';
import { ProfileDraft } from '../screens/profileDraft';
import {
  accountLifecycleStoreReducer,
  createInitialAccountLifecycleStoreState,
} from './accountLifecycleStore';
import { AuthLifecycle, authStoreReducer, createInitialAuthStoreState } from './authStateStore';
import {
  ONBOARDING_TOTAL_STEPS,
  createInitialOnboardingProgressState,
  onboardingProgressReducer,
} from './onboardingProgressStore';
import {
  createInitialProfileDraftStoreState,
  profileDraftStoreReducer,
} from './profileDraftStore';

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
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  profileCompleted: boolean;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetProgress: () => void;
  setProfileCompleted: (value: boolean) => void;
};

export type ProfileDraftState = {
  savedDraft: ProfileDraft;
  editingDraft: ProfileDraft;
  isEditing: boolean;
  replaceProfileDraft: (draft: ProfileDraft) => void;
  startProfileEdit: (draft?: ProfileDraft) => void;
  updateProfileEditDraft: (patch: Partial<ProfileDraft>) => void;
  saveProfileEdit: () => void;
  cancelProfileEdit: () => void;
  resetProfileDraft: () => void;
};

export type AccountLifecycleState = {
  savedDraft: AccountSettingsDraft;
  editingLinkedAccounts: LinkedAccountDraft[];
  isEditingLinkedAccounts: boolean;
  replaceAccountLifecycleDraft: (draft: AccountSettingsDraft) => void;
  startLinkedAccountsEdit: () => void;
  toggleLinkedProvider: (provider: LinkedAccountProvider) => void;
  saveLinkedAccountsEdit: () => void;
  cancelLinkedAccountsEdit: () => void;
  requestAccountDeletion: (requestedAtIso: string) => void;
  recoverAccount: () => void;
  resetAccountLifecycle: () => void;
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
  currentStep: 1,
  completedSteps: [],
  totalSteps: ONBOARDING_TOTAL_STEPS,
  profileCompleted: true,
  setCurrentStep: () => undefined,
  markStepCompleted: () => undefined,
  goToNextStep: () => undefined,
  goToPreviousStep: () => undefined,
  resetProgress: () => undefined,
  setProfileCompleted: () => undefined,
};

const defaultProfileDraftState: ProfileDraftState = {
  savedDraft: createInitialProfileDraftStoreState().savedDraft,
  editingDraft: createInitialProfileDraftStoreState().editingDraft,
  isEditing: false,
  replaceProfileDraft: () => undefined,
  startProfileEdit: () => undefined,
  updateProfileEditDraft: () => undefined,
  saveProfileEdit: () => undefined,
  cancelProfileEdit: () => undefined,
  resetProfileDraft: () => undefined,
};

const defaultAccountLifecycleState: AccountLifecycleState = {
  savedDraft: createInitialAccountLifecycleStoreState().savedDraft,
  editingLinkedAccounts: createInitialAccountLifecycleStoreState().editingLinkedAccounts,
  isEditingLinkedAccounts: false,
  replaceAccountLifecycleDraft: () => undefined,
  startLinkedAccountsEdit: () => undefined,
  toggleLinkedProvider: () => undefined,
  saveLinkedAccountsEdit: () => undefined,
  cancelLinkedAccountsEdit: () => undefined,
  requestAccountDeletion: () => undefined,
  recoverAccount: () => undefined,
  resetAccountLifecycle: () => undefined,
};

const AuthStateContext = createContext<AuthState>(defaultAuthState);
const RoleStateContext = createContext<RoleState>(defaultRoleState);
const FeatureFlagsStateContext = createContext<FeatureFlagsState>(defaultFeatureFlagsState);
const OnboardingStateContext = createContext<OnboardingState>(defaultOnboardingState);
const ProfileDraftStateContext = createContext<ProfileDraftState>(defaultProfileDraftState);
const AccountLifecycleStateContext = createContext<AccountLifecycleState>(defaultAccountLifecycleState);

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
  const [onboardingStateStore, dispatchOnboardingState] = useReducer(
    onboardingProgressReducer,
    createInitialOnboardingProgressState()
  );
  const [profileDraftStoreState, dispatchProfileDraftStore] = useReducer(
    profileDraftStoreReducer,
    createInitialProfileDraftStoreState()
  );
  const [accountLifecycleStoreState, dispatchAccountLifecycleStore] = useReducer(
    accountLifecycleStoreReducer,
    createInitialAccountLifecycleStoreState()
  );
  const [profileCompleted, setProfileCompleted] = useState(true);

  const replaceProfileDraft = useCallback((draft: ProfileDraft) => {
    dispatchProfileDraftStore({
      type: 'REPLACE_DRAFT',
      draft,
    });
  }, []);

  const startProfileEdit = useCallback((draft?: ProfileDraft) => {
    dispatchProfileDraftStore({
      type: 'START_EDIT',
      draft,
    });
  }, []);

  const updateProfileEditDraft = useCallback((patch: Partial<ProfileDraft>) => {
    dispatchProfileDraftStore({
      type: 'UPDATE_EDIT_DRAFT',
      patch,
    });
  }, []);

  const saveProfileEdit = useCallback(() => {
    dispatchProfileDraftStore({ type: 'SAVE_EDIT' });
  }, []);

  const cancelProfileEdit = useCallback(() => {
    dispatchProfileDraftStore({ type: 'CANCEL_EDIT' });
  }, []);

  const resetProfileDraft = useCallback(() => {
    dispatchProfileDraftStore({ type: 'RESET_DRAFT' });
  }, []);

  const replaceAccountLifecycleDraft = useCallback((draft: AccountSettingsDraft) => {
    dispatchAccountLifecycleStore({
      type: 'REPLACE_DRAFT',
      draft,
    });
  }, []);

  const startLinkedAccountsEdit = useCallback(() => {
    dispatchAccountLifecycleStore({ type: 'START_LINKED_ACCOUNTS_EDIT' });
  }, []);

  const toggleLinkedProvider = useCallback((provider: LinkedAccountProvider) => {
    dispatchAccountLifecycleStore({
      type: 'TOGGLE_LINKED_PROVIDER',
      provider,
    });
  }, []);

  const saveLinkedAccountsEdit = useCallback(() => {
    dispatchAccountLifecycleStore({ type: 'SAVE_LINKED_ACCOUNTS_EDIT' });
  }, []);

  const cancelLinkedAccountsEdit = useCallback(() => {
    dispatchAccountLifecycleStore({ type: 'CANCEL_LINKED_ACCOUNTS_EDIT' });
  }, []);

  const requestAccountDeletion = useCallback((requestedAtIso: string) => {
    dispatchAccountLifecycleStore({
      type: 'REQUEST_DELETION',
      requestedAtIso,
    });
  }, []);

  const recoverAccount = useCallback(() => {
    dispatchAccountLifecycleStore({ type: 'RECOVER_ACCOUNT' });
  }, []);

  const resetAccountLifecycle = useCallback(() => {
    dispatchAccountLifecycleStore({ type: 'RESET_ACCOUNT_LIFECYCLE' });
  }, []);

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
      currentStep: onboardingStateStore.currentStep,
      completedSteps: onboardingStateStore.completedSteps,
      totalSteps: ONBOARDING_TOTAL_STEPS,
      profileCompleted,
      setCurrentStep: (step) => {
        dispatchOnboardingState({
          type: 'SET_CURRENT_STEP',
          step,
        });
      },
      markStepCompleted: (step) => {
        dispatchOnboardingState({
          type: 'MARK_STEP_COMPLETED',
          step,
        });
      },
      goToNextStep: () => {
        dispatchOnboardingState({ type: 'GO_TO_NEXT_STEP' });
      },
      goToPreviousStep: () => {
        dispatchOnboardingState({ type: 'GO_TO_PREVIOUS_STEP' });
      },
      resetProgress: () => {
        dispatchOnboardingState({ type: 'RESET_PROGRESS' });
      },
      setProfileCompleted,
    }),
    [onboardingStateStore, profileCompleted]
  );

  const profileDraftState = useMemo<ProfileDraftState>(
    () => ({
      savedDraft: profileDraftStoreState.savedDraft,
      editingDraft: profileDraftStoreState.editingDraft,
      isEditing: profileDraftStoreState.isEditing,
      replaceProfileDraft,
      startProfileEdit,
      updateProfileEditDraft,
      saveProfileEdit,
      cancelProfileEdit,
      resetProfileDraft,
    }),
    [
      cancelProfileEdit,
      profileDraftStoreState,
      replaceProfileDraft,
      resetProfileDraft,
      saveProfileEdit,
      startProfileEdit,
      updateProfileEditDraft,
    ]
  );

  const accountLifecycleState = useMemo<AccountLifecycleState>(
    () => ({
      savedDraft: accountLifecycleStoreState.savedDraft,
      editingLinkedAccounts: accountLifecycleStoreState.editingLinkedAccounts,
      isEditingLinkedAccounts: accountLifecycleStoreState.isEditingLinkedAccounts,
      replaceAccountLifecycleDraft,
      startLinkedAccountsEdit,
      toggleLinkedProvider,
      saveLinkedAccountsEdit,
      cancelLinkedAccountsEdit,
      requestAccountDeletion,
      recoverAccount,
      resetAccountLifecycle,
    }),
    [
      accountLifecycleStoreState,
      cancelLinkedAccountsEdit,
      recoverAccount,
      replaceAccountLifecycleDraft,
      requestAccountDeletion,
      resetAccountLifecycle,
      saveLinkedAccountsEdit,
      startLinkedAccountsEdit,
      toggleLinkedProvider,
    ]
  );

  return (
    <FeatureFlagsStateContext.Provider value={featureFlagsState}>
      <AuthStateContext.Provider value={authState}>
        <RoleStateContext.Provider value={roleState}>
          <OnboardingStateContext.Provider value={onboardingState}>
            <ProfileDraftStateContext.Provider value={profileDraftState}>
              <AccountLifecycleStateContext.Provider value={accountLifecycleState}>{children}</AccountLifecycleStateContext.Provider>
            </ProfileDraftStateContext.Provider>
          </OnboardingStateContext.Provider>
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

export function useProfileDraftState(): ProfileDraftState {
  return useContext(ProfileDraftStateContext);
}

export function useAccountLifecycleState(): AccountLifecycleState {
  return useContext(AccountLifecycleStateContext);
}