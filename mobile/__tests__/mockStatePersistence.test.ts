import { MockAppStateSnapshot, readMockAppStateSnapshot, writeMockAppStateSnapshot } from '../src/state/mockStatePersistence';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
}));

describe('mockStatePersistence', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('writes and restores snapshot for relaunch hydration', async () => {
    const snapshot: MockAppStateSnapshot = {
      auth: {
        accountStatus: 'pending_deletion',
        isAuthenticated: false,
        authLifecycle: 'signed_out',
      },
      activeRoleContext: 'RegularUser',
      availableRoles: ['RegularUser'],
      isRoleSimulationEnabled: true,
      onboarding: {
        currentStep: 4,
        completedSteps: [1, 2, 3],
      },
      profileCompleted: false,
      profileDraft: {
        displayName: 'Persisted Persona',
        bio: 'Persisted bio',
        preferredAgeMin: '21',
        preferredAgeMax: '32',
        preferredGenders: 'female',
        profileCompleted: false,
        photos: [
          {
            photoId: 'photo-1',
            url: 'mock://photo/1',
            moderationStatus: 'approved',
          },
        ],
      },
      accountLifecycleDraft: {
        status: 'pending_deletion',
        deletionRequestedAt: '2026-03-11T10:00:00.000Z',
        recoveryWindowDays: 30,
        linkedAccounts: [
          { provider: 'google', linked: true },
          { provider: 'apple', linked: false },
          { provider: 'facebook', linked: false },
        ],
      },
      presenceSession: {
        activeSession: {
          sessionId: 's-persisted',
          userId: 'u-persisted',
          venueId: 'v-persisted',
          status: 'active',
          checkinAt: '2026-03-11T20:00:00.000Z',
          checkoutAt: null,
        },
        transitions: [],
        lastSyncedAt: '2026-03-11T20:00:00.000Z',
      },
    };

    await writeMockAppStateSnapshot(snapshot);
    const restored = await readMockAppStateSnapshot();

    expect(restored).toEqual(snapshot);
  });

  it('returns null when no snapshot exists', async () => {
    const restored = await readMockAppStateSnapshot();

    expect(restored).toBeNull();
  });
});
