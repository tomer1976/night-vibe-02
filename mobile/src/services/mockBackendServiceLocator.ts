import {
  AccountStatus,
  BackendServiceContracts,
  ChatThread,
  DiscoveryCandidate,
  MatchRecord,
  NotificationRecord,
  Role,
  SafetyReport,
  UserProfile,
  VenueAnalyticsSnapshot,
  VenueSession,
  VenueSummary,
} from '../contracts';
import {
  createMockClock,
  createMockResponseFactory,
  MockClock,
  MockResponseFactory,
  sprint01Fixtures,
  sprint02ProfileFixtures,
} from '../mocks';

type MockServiceLocatorOptions = {
  activeUserId?: string;
  clock?: MockClock;
  responseFactory?: MockResponseFactory;
  sessionSimulation?: {
    accessTokenTtlMs?: number;
    refreshTokenTtlMs?: number;
  };
};

type MockServiceLocator = {
  services: BackendServiceContracts;
  clock: MockClock;
  responseFactory: MockResponseFactory;
};

const DEFAULT_USER_ID = 'u-regular-1';
const DEFAULT_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const DEFAULT_REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function computeMatchRecords(activeUserId: string): MatchRecord[] {
  const likes = sprint01Fixtures.interactions.filter((interaction) => interaction.action === 'like');
  const matchMap = new Map<string, MatchRecord>();

  for (const like of likes) {
    const reciprocal = likes.find(
      (candidate) =>
        candidate.actorUserId === like.targetUserId &&
        candidate.targetUserId === like.actorUserId &&
        candidate.venueId === like.venueId
    );

    if (!reciprocal) {
      continue;
    }

    if (like.actorUserId !== activeUserId && like.targetUserId !== activeUserId) {
      continue;
    }

    const users = [like.actorUserId, like.targetUserId].sort() as [string, string];
    const matchId = `match-${users[0]}-${users[1]}`;

    if (!matchMap.has(matchId)) {
      matchMap.set(matchId, {
        matchId,
        users,
        status: 'matched',
      });
    }
  }

  return [...matchMap.values()];
}

function buildDiscoveryCandidates(activeUserId: string): DiscoveryCandidate[] {
  const activeSession = sprint01Fixtures.sessions.find((session) => session.userId === activeUserId && session.status === 'active');

  if (!activeSession) {
    return [];
  }

  const coLocatedUserIds = sprint01Fixtures.sessions
    .filter(
      (session) =>
        session.status === 'active' &&
        session.venueId === activeSession.venueId &&
        session.userId !== activeUserId
    )
    .map((session) => session.userId);

  return sprint01Fixtures.users
    .filter((user) => coLocatedUserIds.includes(user.uid))
    .map((user) => ({
      userId: user.uid,
      displayName: user.displayName,
      age: 27,
      venueId: activeSession.venueId,
    }));
}

export function createMockBackendServiceLocator(options?: MockServiceLocatorOptions): MockServiceLocator {
  const activeUserId = options?.activeUserId ?? DEFAULT_USER_ID;
  const activeUser = sprint01Fixtures.users.find((user) => user.uid === activeUserId) ?? sprint01Fixtures.users[0];
  const activeRoleContext = sprint01Fixtures.roleContexts.find((context) => context.uid === activeUser.uid);

  const clock = options?.clock ?? createMockClock({
    startAt: '2026-03-08T20:00:00.000Z',
  });

  const responseFactory = options?.responseFactory ??
    createMockResponseFactory({
      seed: 'req-sprint01',
    });

  const accessTokenTtlMs = options?.sessionSimulation?.accessTokenTtlMs ?? DEFAULT_ACCESS_TOKEN_TTL_MS;
  const refreshTokenTtlMs = options?.sessionSimulation?.refreshTokenTtlMs ?? DEFAULT_REFRESH_TOKEN_TTL_MS;

  if (!Number.isInteger(accessTokenTtlMs) || accessTokenTtlMs <= 0) {
    throw new Error('Invalid accessTokenTtlMs. Use a positive integer milliseconds value.');
  }

  if (!Number.isInteger(refreshTokenTtlMs) || refreshTokenTtlMs <= 0) {
    throw new Error('Invalid refreshTokenTtlMs. Use a positive integer milliseconds value.');
  }

  const authSession = {
    uid: activeUser.uid,
    status: activeUser.status,
    roles: [...activeUser.roles],
    activeRoleContext: activeUser.activeRoleContext,
  };

  let linkedProviders = authSession.roles.length > 0 ? (['google'] as ('google' | 'apple')[]) : [];
  let accountStatus: AccountStatus = authSession.status;
  let sessionVersion = 0;
  let activeAccessToken = '';
  let activeRefreshToken = '';
  let accessTokenExpiresAtMs = 0;
  let refreshTokenExpiresAtMs = 0;

  const asMillis = (instant: string) => new Date(instant).getTime();
  const issueSessionTokens = () => {
    const issuedAt = clock.now();
    const issuedAtMs = asMillis(issuedAt);

    sessionVersion += 1;
    activeAccessToken = `mock-access-${activeUser.uid}-v${sessionVersion}`;
    activeRefreshToken = `mock-refresh-${activeUser.uid}-v${sessionVersion}`;
    accessTokenExpiresAtMs = issuedAtMs + accessTokenTtlMs;
    refreshTokenExpiresAtMs = issuedAtMs + refreshTokenTtlMs;

    return {
      accessToken: activeAccessToken,
      refreshToken: activeRefreshToken,
      tokenExpiration: new Date(accessTokenExpiresAtMs).toISOString(),
    };
  };

  const validateRefreshToken = (refreshToken: string) => {
    if (refreshToken !== activeRefreshToken) {
      return responseFactory.build({
        key: 'auth.refreshSession',
        data: {
          accessToken: '',
          tokenExpiration: '',
        },
        scenario: 'UNAUTHORIZED',
        errorMessage: 'Mock refresh token is invalid for the current session.',
        details: {
          reason: 'refresh_token_mismatch',
        },
      });
    }

    const nowMs = asMillis(clock.peek());

    if (nowMs > refreshTokenExpiresAtMs) {
      return responseFactory.build({
        key: 'auth.refreshSession',
        data: {
          accessToken: '',
          tokenExpiration: '',
        },
        scenario: 'UNAUTHORIZED',
        errorMessage: 'Mock refresh token has expired.',
        details: {
          reason: 'refresh_token_expired',
          refresh_token_expires_at: new Date(refreshTokenExpiresAtMs).toISOString(),
          now: new Date(nowMs).toISOString(),
        },
      });
    }

    return null;
  };

  issueSessionTokens();
  const seededProfile = sprint02ProfileFixtures.find((profile) => profile.uid === activeUser.uid);
  let activeUserProfile: UserProfile = {
    uid: activeUser.uid,
    displayName: seededProfile?.displayName ?? activeUser.displayName,
    profileCompleted: seededProfile?.profileCompleted ?? true,
  };

  const services: BackendServiceContracts = {
    auth: {
      getSession: async () => responseFactory.build({ key: 'auth.getSession', data: authSession }),
      login: async () =>
        responseFactory.build({
          key: 'auth.login',
          data: {
            ...authSession,
            ...issueSessionTokens(),
            isNewUser: activeUser.isNewUser,
          },
        }),
      refreshSession: async (refreshToken) => {
        const failedValidation = validateRefreshToken(refreshToken);
        if (failedValidation) {
          return failedValidation;
        }

        const issuedAt = clock.now();
        const issuedAtMs = asMillis(issuedAt);
        activeAccessToken = `mock-access-${activeUser.uid}-v${sessionVersion}`;
        accessTokenExpiresAtMs = issuedAtMs + accessTokenTtlMs;

        return responseFactory.build({
          key: 'auth.refreshSession',
          data: {
            accessToken: activeAccessToken,
            tokenExpiration: new Date(accessTokenExpiresAtMs).toISOString(),
          },
        });
      },
      linkProvider: async (provider) => {
        if (!linkedProviders.includes(provider)) {
          linkedProviders = [...linkedProviders, provider];
        }

        return responseFactory.build({ key: 'auth.linkProvider', data: { providers: linkedProviders } });
      },
      signInWithProvider: async () => responseFactory.build({ key: 'auth.signInWithProvider', data: authSession }),
      signOut: async () => responseFactory.build({ key: 'auth.signOut', data: { signedOut: true } }),
    },
    profile: {
      getMyProfile: async () => responseFactory.build({ key: 'profile.getMyProfile', data: activeUserProfile }),
      updateMyProfile: async (profile) => {
        activeUserProfile = {
          uid: activeUser.uid,
          displayName: profile.displayName ?? activeUserProfile.displayName,
          profileCompleted: profile.profileCompleted ?? activeUserProfile.profileCompleted,
        };

        return responseFactory.build({ key: 'profile.updateMyProfile', data: activeUserProfile });
      },
      upsertMyProfile: async (profile) => {
        activeUserProfile = {
          uid: activeUser.uid,
          displayName: profile.displayName ?? activeUserProfile.displayName,
          profileCompleted: profile.profileCompleted ?? activeUserProfile.profileCompleted,
        };

        return responseFactory.build({ key: 'profile.upsertMyProfile', data: activeUserProfile });
      },
      uploadMyPhoto: async (fileName) =>
        responseFactory.build({
          key: 'profile.uploadMyPhoto',
          data: {
            photoId: `photo-${fileName}-${clock.now()}`,
            photoUrl: `mock://profile-photo/${fileName}`,
            moderationStatus: 'pending' as const,
          },
        }),
      deleteMyPhoto: async (photoId) => responseFactory.build({ key: 'profile.deleteMyPhoto', data: { photoId, removed: true } }),
    },
    accountLifecycle: {
      getAccountStatus: async () => responseFactory.build({ key: 'accountLifecycle.getAccountStatus', data: { status: accountStatus } }),
      requestAccountDeletion: async () => {
        accountStatus = 'pending_deletion';

        return responseFactory.build({
          key: 'accountLifecycle.requestAccountDeletion',
          data: {
            accountStatus,
            recoveryWindowDays: 30,
          },
        });
      },
      recoverAccount: async () => {
        accountStatus = 'active';

        return responseFactory.build({
          key: 'accountLifecycle.recoverAccount',
          data: {
            accountStatus,
          },
        });
      },
      getLinkedProviders: async () =>
        responseFactory.build({
          key: 'accountLifecycle.getLinkedProviders',
          data: linkedProviders.map((provider) => ({
            provider,
            linkedAt: clock.now(),
          })),
        }),
    },
    roles: {
      getAvailableRoles: async () => {
        const roles = [...(activeRoleContext?.availableRoles ?? ['RegularUser'])] as Role[];
        return responseFactory.build({ key: 'roles.getAvailableRoles', data: roles });
      },
      setActiveRoleContext: async (role) =>
        responseFactory.build({
          key: 'roles.setActiveRoleContext',
          data: { activeRoleContext: role },
        }),
    },
    venues: {
      getNearbyVenues: async () => {
        const venues: VenueSummary[] = sprint01Fixtures.venues
          .filter((venue) => venue.status === 'active')
          .map((venue, index) => ({
            venueId: venue.venueId,
            name: venue.name,
            distanceKm: Number((1.2 + index * 0.7).toFixed(2)),
          }));

        return responseFactory.build({ key: 'venues.getNearbyVenues', data: venues });
      },
    },
    presence: {
      getActiveSession: async () => {
        const session = sprint01Fixtures.sessions.find((entry) => entry.userId === activeUser.uid && entry.status === 'active');

        const mappedSession: VenueSession | null = session
          ? {
              sessionId: session.sessionId,
              userId: session.userId,
              venueId: session.venueId,
              status: session.status,
            }
          : null;

        return responseFactory.build({ key: 'presence.getActiveSession', data: mappedSession });
      },
      checkIn: async (venueId) => {
        const session: VenueSession = {
          sessionId: `s-${activeUser.uid}-${clock.now()}`,
          userId: activeUser.uid,
          venueId,
          status: 'active',
        };

        return responseFactory.build({ key: 'presence.checkIn', data: session });
      },
      checkOut: async () => responseFactory.build({ key: 'presence.checkOut', data: { sessionClosed: true } }),
    },
    discovery: {
      getCandidates: async () => {
        const items = buildDiscoveryCandidates(activeUser.uid);
        return responseFactory.build({ key: 'discovery.getCandidates', data: { items } });
      },
    },
    interactions: {
      like: async (targetUserId) => responseFactory.build({ key: 'interactions.like', data: { action: 'like', targetUserId } }),
      pass: async (targetUserId) => responseFactory.build({ key: 'interactions.pass', data: { action: 'pass', targetUserId } }),
    },
    match: {
      getMatches: async () => {
        const matches = computeMatchRecords(activeUser.uid);
        return responseFactory.build({ key: 'match.getMatches', data: matches });
      },
    },
    chat: {
      getThreads: async () => {
        const matches = computeMatchRecords(activeUser.uid);
        const threads: ChatThread[] = matches.map((match) => ({
          chatId: `chat-${match.matchId}`,
          matchId: match.matchId,
          participants: [match.users[0], match.users[1]],
          status: 'active',
        }));

        return responseFactory.build({ key: 'chat.getThreads', data: threads });
      },
      sendMessage: async (chatId) => responseFactory.build({ key: 'chat.sendMessage', data: { chatId, sent: true } }),
    },
    safety: {
      blockUser: async (targetUserId) => responseFactory.build({ key: 'safety.blockUser', data: { blocked: true, targetUserId } }),
      reportUser: async (targetUserId) => {
        const report: SafetyReport = {
          reportId: `report-${clock.now()}`,
          reporterId: activeUser.uid,
          reportedUserId: targetUserId,
          status: 'pending',
        };

        return responseFactory.build({ key: 'safety.reportUser', data: report });
      },
    },
    notifications: {
      getNotifications: async () => {
        const notifications: NotificationRecord[] = [];
        return responseFactory.build({ key: 'notifications.getNotifications', data: notifications });
      },
      markAsRead: async (notificationId) =>
        responseFactory.build({
          key: 'notifications.markAsRead',
          data: { notificationId, read: true },
        }),
    },
    analytics: {
      getVenueAnalytics: async (venueId) => {
        const population = sprint01Fixtures.sessions.filter((session) => session.status === 'active' && session.venueId === venueId).length;
        const snapshot: VenueAnalyticsSnapshot = {
          venueId,
          population,
          popularityScore: Number((population / 10).toFixed(2)),
          updatedAt: clock.now(),
        };

        return responseFactory.build({ key: 'analytics.getVenueAnalytics', data: snapshot });
      },
    },
  };

  return {
    services,
    clock,
    responseFactory,
  };
}