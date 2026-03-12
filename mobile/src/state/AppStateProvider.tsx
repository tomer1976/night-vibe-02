import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import { AccountStatus, PresenceCheckInResult, PresenceStateTransition, Role, VenueSession, VenueSummary } from '../contracts';
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
import {
  createInitialVenueDiscoveryFilters,
  createInitialVenueDiscoveryStoreState,
  selectVisibleVenues,
  VenueDiscoveryFilters,
  VenueDiscoverySortMode,
  venueDiscoveryStoreReducer,
} from './venueDiscoveryStore';
import {
  createInitialPresenceSessionStoreState,
  presenceSessionStoreReducer,
} from './presenceSessionStore';
import { readMockAppStateSnapshot, writeMockAppStateSnapshot } from './mockStatePersistence';

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
  isStateHydrated: boolean;
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

export type VenueDiscoveryState = {
  cachedVenues: VenueSummary[];
  visibleVenues: VenueSummary[];
  filters: VenueDiscoveryFilters;
  sortMode: VenueDiscoverySortMode;
  lastFetchedAt: string | null;
  setCachedVenues: (venues: VenueSummary[], fetchedAt?: string) => void;
  setFilters: (filters: Partial<VenueDiscoveryFilters>) => void;
  resetFilters: () => void;
  setSortMode: (sortMode: VenueDiscoverySortMode) => void;
  clearCachedVenues: () => void;
};

export type PresenceSessionState = {
  activeSession: VenueSession | null;
  transitions: PresenceStateTransition[];
  lastSyncedAt: string | null;
  setSessionSnapshot: (session: VenueSession | null, transitions?: PresenceStateTransition[], syncedAt?: string) => void;
  applyCheckInResult: (result: PresenceCheckInResult, userId?: string) => void;
  applyCheckout: (checkoutTime: string) => void;
  applyTimeout: (expiredAt: string) => void;
  resetPresenceSession: () => void;
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
  isStateHydrated: false,
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

const defaultVenueDiscoveryState: VenueDiscoveryState = {
  cachedVenues: [],
  visibleVenues: [],
  filters: createInitialVenueDiscoveryFilters(),
  sortMode: 'distance_then_activity',
  lastFetchedAt: null,
  setCachedVenues: () => undefined,
  setFilters: () => undefined,
  resetFilters: () => undefined,
  setSortMode: () => undefined,
  clearCachedVenues: () => undefined,
};

const defaultPresenceSessionState: PresenceSessionState = {
  activeSession: null,
  transitions: [],
  lastSyncedAt: null,
  setSessionSnapshot: () => undefined,
  applyCheckInResult: () => undefined,
  applyCheckout: () => undefined,
  applyTimeout: () => undefined,
  resetPresenceSession: () => undefined,
};

const AuthStateContext = createContext<AuthState>(defaultAuthState);
const RoleStateContext = createContext<RoleState>(defaultRoleState);
const FeatureFlagsStateContext = createContext<FeatureFlagsState>(defaultFeatureFlagsState);
const OnboardingStateContext = createContext<OnboardingState>(defaultOnboardingState);
const ProfileDraftStateContext = createContext<ProfileDraftState>(defaultProfileDraftState);
const AccountLifecycleStateContext = createContext<AccountLifecycleState>(defaultAccountLifecycleState);
const VenueDiscoveryStateContext = createContext<VenueDiscoveryState>(defaultVenueDiscoveryState);
const PresenceSessionStateContext = createContext<PresenceSessionState>(defaultPresenceSessionState);

export function AppStateProvider({ children }: PropsWithChildren) {
  const isMockModeEnabled = readRuntimeMode() === 'phase1-mock';
  const isHydrationEnabledInTests = process.env.EXPO_PUBLIC_ENABLE_MOCK_STATE_HYDRATION_TEST === 'true';
  const shouldSkipAsyncHydrationForTests = process.env.NODE_ENV === 'test' && !isHydrationEnabledInTests;
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
  const [venueDiscoveryStoreState, dispatchVenueDiscoveryStore] = useReducer(
    venueDiscoveryStoreReducer,
    createInitialVenueDiscoveryStoreState()
  );
  const [presenceSessionStoreState, dispatchPresenceSessionStore] = useReducer(
    presenceSessionStoreReducer,
    createInitialPresenceSessionStoreState()
  );
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [isStateHydrated, setIsStateHydrated] = useState(!isMockModeEnabled || shouldSkipAsyncHydrationForTests);

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

  const setCachedVenues = useCallback((venues: VenueSummary[], fetchedAt?: string) => {
    dispatchVenueDiscoveryStore({
      type: 'SET_CACHED_VENUES',
      venues,
      fetchedAt,
    });
  }, []);

  const setVenueDiscoveryFilters = useCallback((filters: Partial<VenueDiscoveryFilters>) => {
    dispatchVenueDiscoveryStore({
      type: 'SET_FILTERS',
      filters,
    });
  }, []);

  const resetVenueDiscoveryFilters = useCallback(() => {
    dispatchVenueDiscoveryStore({ type: 'RESET_FILTERS' });
  }, []);

  const setVenueDiscoverySortMode = useCallback((sortMode: VenueDiscoverySortMode) => {
    dispatchVenueDiscoveryStore({
      type: 'SET_SORT_MODE',
      sortMode,
    });
  }, []);

  const clearCachedVenues = useCallback(() => {
    dispatchVenueDiscoveryStore({ type: 'CLEAR_CACHE' });
  }, []);

  const setSessionSnapshot = useCallback(
    (session: VenueSession | null, transitions?: PresenceStateTransition[], syncedAt?: string) => {
      dispatchPresenceSessionStore({
        type: 'SET_SESSION_SNAPSHOT',
        session,
        transitions,
        syncedAt,
      });
    },
    []
  );

  const applyCheckInResult = useCallback((result: PresenceCheckInResult, userId?: string) => {
    dispatchPresenceSessionStore({
      type: 'APPLY_CHECKIN_RESULT',
      result,
      userId,
    });
  }, []);

  const applyCheckout = useCallback((checkoutTime: string) => {
    dispatchPresenceSessionStore({
      type: 'APPLY_CHECKOUT',
      checkoutTime,
    });
  }, []);

  const applyTimeout = useCallback((expiredAt: string) => {
    dispatchPresenceSessionStore({
      type: 'APPLY_TIMEOUT',
      expiredAt,
    });
  }, []);

  const resetPresenceSession = useCallback(() => {
    dispatchPresenceSessionStore({ type: 'RESET_STATE' });
  }, []);

  useEffect(() => {
    if (shouldSkipAsyncHydrationForTests) {
      return;
    }

    if (!isMockModeEnabled) {
      setIsStateHydrated(true);
      return;
    }

    let isMounted = true;

    const hydrateState = async () => {
      const snapshot = await readMockAppStateSnapshot();

      if (!isMounted) {
        return;
      }

      if (snapshot) {
        dispatchAuthStore({
          type: 'HYDRATE_STATE',
          state: snapshot.auth,
        });

        dispatchOnboardingState({
          type: 'HYDRATE_STATE',
          state: snapshot.onboarding,
        });

        dispatchProfileDraftStore({
          type: 'REPLACE_DRAFT',
          draft: snapshot.profileDraft,
        });

        dispatchAccountLifecycleStore({
          type: 'REPLACE_DRAFT',
          draft: snapshot.accountLifecycleDraft,
        });

        dispatchPresenceSessionStore({
          type: 'HYDRATE_STATE',
          state: snapshot.presenceSession,
        });

        setActiveRoleContext(snapshot.activeRoleContext);
        setAvailableRoles(snapshot.availableRoles);
        setRoleSimulationEnabled(snapshot.isRoleSimulationEnabled);
        setProfileCompleted(snapshot.profileCompleted);
      }

      setIsStateHydrated(true);
    };

    void hydrateState();

    return () => {
      isMounted = false;
    };
  }, [isMockModeEnabled, shouldSkipAsyncHydrationForTests]);

  useEffect(() => {
    if (!isMockModeEnabled || !isStateHydrated) {
      return;
    }

    void writeMockAppStateSnapshot({
      auth: authStoreState,
      activeRoleContext,
      availableRoles,
      isRoleSimulationEnabled,
      onboarding: onboardingStateStore,
      profileCompleted,
      profileDraft: profileDraftStoreState.savedDraft,
      accountLifecycleDraft: accountLifecycleStoreState.savedDraft,
      presenceSession: presenceSessionStoreState,
    });
  }, [
    accountLifecycleStoreState.savedDraft,
    activeRoleContext,
    authStoreState,
    availableRoles,
    isMockModeEnabled,
    isRoleSimulationEnabled,
    isStateHydrated,
    onboardingStateStore,
    presenceSessionStoreState,
    profileCompleted,
    profileDraftStoreState.savedDraft,
  ]);

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
      isMockModeEnabled,
      isStateHydrated,
      isRoleSimulationEnabled,
      setRoleSimulationEnabled,
    }),
    [isMockModeEnabled, isRoleSimulationEnabled, isStateHydrated]
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

  const venueDiscoveryState = useMemo<VenueDiscoveryState>(
    () => ({
      cachedVenues: venueDiscoveryStoreState.cachedVenues,
      visibleVenues: selectVisibleVenues(venueDiscoveryStoreState),
      filters: venueDiscoveryStoreState.filters,
      sortMode: venueDiscoveryStoreState.sortMode,
      lastFetchedAt: venueDiscoveryStoreState.lastFetchedAt,
      setCachedVenues,
      setFilters: setVenueDiscoveryFilters,
      resetFilters: resetVenueDiscoveryFilters,
      setSortMode: setVenueDiscoverySortMode,
      clearCachedVenues,
    }),
    [
      clearCachedVenues,
      resetVenueDiscoveryFilters,
      setCachedVenues,
      setVenueDiscoveryFilters,
      setVenueDiscoverySortMode,
      venueDiscoveryStoreState,
    ]
  );

  const presenceSessionState = useMemo<PresenceSessionState>(
    () => ({
      activeSession: presenceSessionStoreState.activeSession,
      transitions: presenceSessionStoreState.transitions,
      lastSyncedAt: presenceSessionStoreState.lastSyncedAt,
      setSessionSnapshot,
      applyCheckInResult,
      applyCheckout,
      applyTimeout,
      resetPresenceSession,
    }),
    [
      applyCheckInResult,
      applyCheckout,
      applyTimeout,
      presenceSessionStoreState,
      resetPresenceSession,
      setSessionSnapshot,
    ]
  );

  return (
    <FeatureFlagsStateContext.Provider value={featureFlagsState}>
      <AuthStateContext.Provider value={authState}>
        <RoleStateContext.Provider value={roleState}>
          <OnboardingStateContext.Provider value={onboardingState}>
            <ProfileDraftStateContext.Provider value={profileDraftState}>
              <AccountLifecycleStateContext.Provider value={accountLifecycleState}>
                <VenueDiscoveryStateContext.Provider value={venueDiscoveryState}>
                  <PresenceSessionStateContext.Provider value={presenceSessionState}>{children}</PresenceSessionStateContext.Provider>
                </VenueDiscoveryStateContext.Provider>
              </AccountLifecycleStateContext.Provider>
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

export function useVenueDiscoveryState(): VenueDiscoveryState {
  return useContext(VenueDiscoveryStateContext);
}

export function usePresenceSessionState(): PresenceSessionState {
  return useContext(PresenceSessionStateContext);
}