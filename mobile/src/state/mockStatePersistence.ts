import AsyncStorage from '@react-native-async-storage/async-storage';

import { AccountSettingsDraft } from '../screens/accountSettingsDraft';
import { ProfileDraft } from '../screens/profileDraft';
import { AccountStatus, Role } from '../contracts';
import { AuthLifecycle, AuthStoreState } from './authStateStore';
import { OnboardingProgressState } from './onboardingProgressStore';
import { createInitialPresenceSessionStoreState, PresenceSessionStoreState } from './presenceSessionStore';

const MOCK_APP_STATE_STORAGE_KEY = 'night-vibe:phase1-mock-app-state:v1';

export type MockAppStateSnapshot = {
  auth: AuthStoreState;
  activeRoleContext: Role | null;
  availableRoles: Role[];
  isRoleSimulationEnabled: boolean;
  onboarding: OnboardingProgressState;
  profileCompleted: boolean;
  profileDraft: ProfileDraft;
  accountLifecycleDraft: AccountSettingsDraft;
  presenceSession: PresenceSessionStoreState;
};

const allowedAccountStatuses: AccountStatus[] = ['active', 'suspended', 'banned', 'pending_deletion', 'deleted'];
const allowedAuthLifecycles: AuthLifecycle[] = [
  'signed_out',
  'authenticating',
  'authenticated',
  'session_recovery',
  'access_denied',
];
const allowedRoles: Role[] = ['RegularUser', 'VenueOwner', 'Moderator', 'Administrator'];

function parseRoleArray(value: unknown): Role[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is Role => typeof entry === 'string' && allowedRoles.includes(entry as Role));
}

function isValidAuthState(value: unknown): value is AuthStoreState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AuthStoreState>;

  return (
    typeof candidate.isAuthenticated === 'boolean' &&
    typeof candidate.accountStatus === 'string' &&
    allowedAccountStatuses.includes(candidate.accountStatus as AccountStatus) &&
    typeof candidate.authLifecycle === 'string' &&
    allowedAuthLifecycles.includes(candidate.authLifecycle as AuthLifecycle)
  );
}

function isValidOnboardingState(value: unknown): value is OnboardingProgressState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<OnboardingProgressState>;

  return (
    typeof candidate.currentStep === 'number' &&
    Array.isArray(candidate.completedSteps) &&
    candidate.completedSteps.every((step) => typeof step === 'number')
  );
}

function fallbackAuthState(auth: Partial<AuthStoreState>): AuthStoreState {
  const accountStatus =
    typeof auth.accountStatus === 'string' && allowedAccountStatuses.includes(auth.accountStatus as AccountStatus)
      ? (auth.accountStatus as AccountStatus)
      : 'active';

  const isAuthenticated = typeof auth.isAuthenticated === 'boolean' ? auth.isAuthenticated : true;
  const authLifecycle =
    typeof auth.authLifecycle === 'string' && allowedAuthLifecycles.includes(auth.authLifecycle as AuthLifecycle)
      ? (auth.authLifecycle as AuthLifecycle)
      : 'authenticated';

  return {
    accountStatus,
    isAuthenticated,
    authLifecycle,
  };
}

function fallbackOnboardingState(onboarding: Partial<OnboardingProgressState>): OnboardingProgressState {
  const currentStep = typeof onboarding.currentStep === 'number' ? onboarding.currentStep : 1;
  const completedSteps = Array.isArray(onboarding.completedSteps)
    ? onboarding.completedSteps.filter((step): step is number => typeof step === 'number')
    : [];

  return {
    currentStep,
    completedSteps,
  };
}

function fallbackPresenceSessionState(value: unknown): PresenceSessionStoreState {
  if (!value || typeof value !== 'object') {
    return createInitialPresenceSessionStoreState();
  }

  const candidate = value as Partial<PresenceSessionStoreState>;
  const fallback = createInitialPresenceSessionStoreState();

  return {
    activeSession: candidate.activeSession ?? fallback.activeSession,
    transitions: Array.isArray(candidate.transitions) ? candidate.transitions : fallback.transitions,
    lastSyncedAt: typeof candidate.lastSyncedAt === 'string' ? candidate.lastSyncedAt : fallback.lastSyncedAt,
  };
}

export async function readMockAppStateSnapshot(): Promise<MockAppStateSnapshot | null> {
  try {
    const serialized = await AsyncStorage.getItem(MOCK_APP_STATE_STORAGE_KEY);

    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized) as Partial<MockAppStateSnapshot>;
    if (!parsed.auth || !parsed.onboarding || !parsed.profileDraft || !parsed.accountLifecycleDraft) {
      return null;
    }

    const activeRoleContext =
      typeof parsed.activeRoleContext === 'string' && allowedRoles.includes(parsed.activeRoleContext as Role)
        ? (parsed.activeRoleContext as Role)
        : null;

    if (typeof parsed.profileDraft !== 'object' || typeof parsed.accountLifecycleDraft !== 'object') {
      return null;
    }

    const auth = isValidAuthState(parsed.auth) ? parsed.auth : fallbackAuthState(parsed.auth);
    const onboarding = isValidOnboardingState(parsed.onboarding)
      ? parsed.onboarding
      : fallbackOnboardingState(parsed.onboarding);

    return {
      auth,
      activeRoleContext,
      availableRoles: parseRoleArray(parsed.availableRoles),
      isRoleSimulationEnabled: typeof parsed.isRoleSimulationEnabled === 'boolean' ? parsed.isRoleSimulationEnabled : true,
      onboarding,
      profileCompleted: typeof parsed.profileCompleted === 'boolean' ? parsed.profileCompleted : true,
      profileDraft: parsed.profileDraft as ProfileDraft,
      accountLifecycleDraft: parsed.accountLifecycleDraft as AccountSettingsDraft,
      presenceSession: fallbackPresenceSessionState(parsed.presenceSession),
    };
  } catch {
    return null;
  }
}

export async function writeMockAppStateSnapshot(snapshot: MockAppStateSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(MOCK_APP_STATE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    return;
  }
}
