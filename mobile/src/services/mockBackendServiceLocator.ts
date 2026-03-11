import {
  AccountStatus,
  BackendServiceContracts,
  ChatThread,
  DiscoveryCandidate,
  MatchRecord,
  NotificationRecord,
  PresenceCheckInResult,
  PresenceCheckOutResult,
  PresenceStateTransition,
  Role,
  SafetyReport,
  UserProfile,
  VenueAnalyticsSnapshot,
  VenueSession,
  VenueSummary,
} from '../contracts';
import {
  MockFixtureSession,
  createMockClock,
  createMockResponseFactory,
  MockClock,
  MockResponseFactory,
  sprint01Fixtures,
  sprint03DiscoveryCoordinates,
  sprint03VenuePresenceParticipants,
  sprint03VenueDistanceOutputs,
  sprint02AuthPersonaFixtures,
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
const DELETION_RECOVERY_WINDOW_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const CHECKIN_RADIUS_METERS = 75;
const STALE_LOCATION_THRESHOLD_MS = 5 * 60 * 1000;

function calculateMockDistanceMeters(
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number }
) {
  const latDeltaMeters = (left.latitude - right.latitude) * 111_320;
  const longitudeMetersFactor = 111_320 * Math.cos((right.latitude * Math.PI) / 180);
  const lonDeltaMeters = (left.longitude - right.longitude) * longitudeMetersFactor;

  return Math.sqrt(latDeltaMeters * latDeltaMeters + lonDeltaMeters * lonDeltaMeters);
}

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

  const fixtureParticipants = sprint03VenuePresenceParticipants.filter(
    (participant) =>
      participant.venueId === activeSession.venueId &&
      participant.visibility === 'visible' &&
      participant.userId !== activeUserId
  );

  return fixtureParticipants.map((participant) => ({
    userId: participant.userId,
    displayName: participant.displayName,
    age: participant.age,
    venueId: participant.venueId,
  }));
}

function resolvePersonaFixtureByHint(loginHint: string) {
  const normalizedHint = loginHint.trim().toLowerCase();

  if (normalizedHint.length === 0) {
    return null;
  }

  if (normalizedHint.includes('new')) {
    return sprint02AuthPersonaFixtures.find((persona) => persona.personaKey === 'new_user') ?? null;
  }

  if (normalizedHint.includes('suspended')) {
    return sprint02AuthPersonaFixtures.find((persona) => persona.personaKey === 'suspended_user') ?? null;
  }

  if (normalizedHint.includes('banned')) {
    return sprint02AuthPersonaFixtures.find((persona) => persona.personaKey === 'banned_user') ?? null;
  }

  if (normalizedHint.includes('pending')) {
    return sprint02AuthPersonaFixtures.find((persona) => persona.personaKey === 'pending_deletion_user') ?? null;
  }

  return sprint02AuthPersonaFixtures.find((persona) => persona.personaKey === 'active_returning_user') ?? null;
}

function buildPresenceStateTransitions(sessions: readonly MockFixtureSession[]): PresenceStateTransition[] {
  return sessions
    .filter((session) => session.status === 'closed' || session.status === 'expired')
    .map((session) => {
      const reason: PresenceStateTransition['reason'] =
        session.status === 'expired'
          ? 'timeout'
          : session.sessionId.includes('replaced')
            ? 'auto_replaced'
            : 'manual_checkout';

      const transition: PresenceStateTransition = {
        sessionId: session.sessionId,
        userId: session.userId,
        venueId: session.venueId,
        fromStatus: 'active',
        toStatus: session.status,
        reason,
        transitionedAt: session.checkoutAt ?? session.checkinAt,
      };

      return transition;
    })
    .sort((left, right) => left.transitionedAt.localeCompare(right.transitionedAt));
}

function mapFixtureSessionToVenueSession(session: MockFixtureSession): VenueSession {
  return {
    sessionId: session.sessionId,
    userId: session.userId,
    venueId: session.venueId,
    status: session.status,
    checkinAt: session.checkinAt,
    checkoutAt: session.checkoutAt,
  };
}

export function createMockBackendServiceLocator(options?: MockServiceLocatorOptions): MockServiceLocator {
  const activeUserId = options?.activeUserId ?? DEFAULT_USER_ID;
  let currentUser = sprint01Fixtures.users.find((user) => user.uid === activeUserId) ?? sprint01Fixtures.users[0];
  let currentRoleContext = sprint01Fixtures.roleContexts.find((context) => context.uid === currentUser.uid);

  const clock = options?.clock ?? createMockClock({
    startAt: '2026-03-08T20:00:00.000Z',
  });

  const responseFactory = options?.responseFactory ??
    createMockResponseFactory({
      seed: 'req-sprint01',
    });

  const accessTokenTtlMs = options?.sessionSimulation?.accessTokenTtlMs ?? DEFAULT_ACCESS_TOKEN_TTL_MS;
  const refreshTokenTtlMs = options?.sessionSimulation?.refreshTokenTtlMs ?? DEFAULT_REFRESH_TOKEN_TTL_MS;
  const localSessions: MockFixtureSession[] = sprint01Fixtures.sessions.map((session) => ({ ...session }));

  if (!Number.isInteger(accessTokenTtlMs) || accessTokenTtlMs <= 0) {
    throw new Error('Invalid accessTokenTtlMs. Use a positive integer milliseconds value.');
  }

  if (!Number.isInteger(refreshTokenTtlMs) || refreshTokenTtlMs <= 0) {
    throw new Error('Invalid refreshTokenTtlMs. Use a positive integer milliseconds value.');
  }

  const authSession = {
    uid: currentUser.uid,
    status: currentUser.status,
    roles: [...currentUser.roles],
    activeRoleContext: currentUser.activeRoleContext,
  };

  let linkedProviders = authSession.roles.length > 0 ? (['google'] as ('google' | 'apple')[]) : [];
  let accountStatus: AccountStatus = authSession.status;
  let deletionRequestedAtMs: number | null = null;
  let deletionFinalizesAtMs: number | null = null;
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
    activeAccessToken = `mock-access-${currentUser.uid}-v${sessionVersion}`;
    activeRefreshToken = `mock-refresh-${currentUser.uid}-v${sessionVersion}`;
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

  const scheduleDeletionTimeline = (requestedAtIso: string) => {
    deletionRequestedAtMs = asMillis(requestedAtIso);
    deletionFinalizesAtMs = deletionRequestedAtMs + DELETION_RECOVERY_WINDOW_DAYS * DAY_IN_MS;
  };

  const applyDeletionTimeline = () => {
    if (accountStatus !== 'pending_deletion' || deletionFinalizesAtMs === null) {
      return;
    }

    const nowMs = asMillis(clock.peek());
    if (nowMs > deletionFinalizesAtMs) {
      accountStatus = 'deleted';
      deletionRequestedAtMs = null;
      deletionFinalizesAtMs = null;
    }
  };

  if (accountStatus === 'pending_deletion') {
    scheduleDeletionTimeline(clock.peek());
  }

  issueSessionTokens();
  const seededProfile = sprint02ProfileFixtures.find((profile) => profile.uid === currentUser.uid);
  let activeUserProfile: UserProfile = {
    uid: currentUser.uid,
    displayName: seededProfile?.displayName ?? currentUser.displayName,
    profileCompleted: seededProfile?.profileCompleted ?? true,
  };

  const services: BackendServiceContracts = {
    auth: {
      getSession: async () => responseFactory.build({ key: 'auth.getSession', data: authSession }),
      login: async (request) => {
        const loginHint = request.providerToken ?? '';

        if (loginHint.trim().toLowerCase().includes('deleted')) {
          accountStatus = 'deleted';
          authSession.status = 'deleted';

          return responseFactory.build({
            key: 'auth.login',
            data: {
              ...authSession,
              ...issueSessionTokens(),
              isNewUser: false,
            },
          });
        }

        const matchedPersona = resolvePersonaFixtureByHint(loginHint);

        if (matchedPersona) {
          const personaUser = sprint01Fixtures.users.find((user) => user.uid === matchedPersona.uid);
          if (personaUser) {
            currentUser = personaUser;
            currentRoleContext = sprint01Fixtures.roleContexts.find((context) => context.uid === currentUser.uid);
            linkedProviders = ['google'];

            authSession.uid = currentUser.uid;
            authSession.status = currentUser.status;
            authSession.roles = [...currentUser.roles];
            authSession.activeRoleContext = currentUser.activeRoleContext;
            accountStatus = currentUser.status;
            deletionRequestedAtMs = null;
            deletionFinalizesAtMs = null;

            if (accountStatus === 'pending_deletion') {
              scheduleDeletionTimeline(clock.peek());
            }

            const personaProfile = sprint02ProfileFixtures.find((profile) => profile.uid === currentUser.uid);
            activeUserProfile = {
              uid: currentUser.uid,
              displayName: personaProfile?.displayName ?? currentUser.displayName,
              profileCompleted: personaProfile?.profileCompleted ?? !currentUser.isNewUser,
            };
          }
        }

        return responseFactory.build({
          key: 'auth.login',
          data: {
            ...authSession,
            ...issueSessionTokens(),
            isNewUser: currentUser.isNewUser,
          },
        });
      },
      refreshSession: async (refreshToken) => {
        const failedValidation = validateRefreshToken(refreshToken);
        if (failedValidation) {
          return failedValidation;
        }

        const issuedAt = clock.now();
        const issuedAtMs = asMillis(issuedAt);
        activeAccessToken = `mock-access-${currentUser.uid}-v${sessionVersion}`;
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
          uid: currentUser.uid,
          displayName: profile.displayName ?? activeUserProfile.displayName,
          profileCompleted: profile.profileCompleted ?? activeUserProfile.profileCompleted,
        };

        return responseFactory.build({ key: 'profile.updateMyProfile', data: activeUserProfile });
      },
      upsertMyProfile: async (profile) => {
        activeUserProfile = {
          uid: currentUser.uid,
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
      getAccountStatus: async () => {
        applyDeletionTimeline();
        authSession.status = accountStatus;
        return responseFactory.build({ key: 'accountLifecycle.getAccountStatus', data: { status: accountStatus } });
      },
      requestAccountDeletion: async () => {
        applyDeletionTimeline();

        if (accountStatus === 'deleted') {
          return responseFactory.build({
            key: 'accountLifecycle.requestAccountDeletion',
            data: {
              accountStatus,
              recoveryWindowDays: DELETION_RECOVERY_WINDOW_DAYS,
            },
            scenario: 'CONFLICT',
            errorMessage: 'Mock account has already been permanently deleted.',
            details: {
              reason: 'already_deleted',
            },
          });
        }

        if (accountStatus !== 'pending_deletion') {
          const requestedAtIso = clock.now();
          scheduleDeletionTimeline(requestedAtIso);
          accountStatus = 'pending_deletion';
          authSession.status = 'pending_deletion';
        }

        accountStatus = 'pending_deletion';
        authSession.status = 'pending_deletion';

        return responseFactory.build({
          key: 'accountLifecycle.requestAccountDeletion',
          data: {
            accountStatus,
            recoveryWindowDays: DELETION_RECOVERY_WINDOW_DAYS,
          },
        });
      },
      recoverAccount: async () => {
        applyDeletionTimeline();

        if (accountStatus !== 'pending_deletion') {
          return responseFactory.build({
            key: 'accountLifecycle.recoverAccount',
            data: {
              accountStatus,
            },
            scenario: 'CONFLICT',
            errorMessage: 'Mock account is not in a recoverable pending-deletion state.',
            details: {
              reason: 'not_recoverable_status',
              status: accountStatus,
            },
          });
        }

        accountStatus = 'active';
        authSession.status = 'active';
        deletionRequestedAtMs = null;
        deletionFinalizesAtMs = null;

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
        const roles = [...(currentRoleContext?.availableRoles ?? ['RegularUser'])] as Role[];
        return responseFactory.build({ key: 'roles.getAvailableRoles', data: roles });
      },
      setActiveRoleContext: async (role) =>
        responseFactory.build({
          key: 'roles.setActiveRoleContext',
          data: { activeRoleContext: role },
        }),
    },
    venues: {
      getNearbyVenues: async (request) => {
        const hasRequestCoordinates =
          Number.isFinite(request?.latitude) &&
          Number.isFinite(request?.longitude);

        const discoveryCoordinates = hasRequestCoordinates
          ? {
              latitude: request?.latitude ?? sprint03DiscoveryCoordinates.defaultNearbyOrigin.latitude,
              longitude: request?.longitude ?? sprint03DiscoveryCoordinates.defaultNearbyOrigin.longitude,
            }
          : sprint03DiscoveryCoordinates.defaultNearbyOrigin;

        const deterministicDistanceByVenueId = new Map(
          sprint03VenueDistanceOutputs.map((entry) => [entry.venueId, entry.distanceKm])
        );

        const venues: VenueSummary[] = sprint01Fixtures.venues
          .filter((venue) => venue.status === 'active')
          .map((venue) => {
            const checkinCount = localSessions.filter(
              (session) => session.status === 'active' && session.venueId === venue.venueId
            ).length;

            const computedDistanceKm = Number(
              (
                calculateMockDistanceMeters(
                  {
                    latitude: discoveryCoordinates.latitude,
                    longitude: discoveryCoordinates.longitude,
                  },
                  {
                    latitude: venue.latitude,
                    longitude: venue.longitude,
                  }
                ) / 1000
              ).toFixed(2)
            );

            const distanceKm = hasRequestCoordinates
              ? computedDistanceKm
              : deterministicDistanceByVenueId.get(venue.venueId) ?? computedDistanceKm;

            const liveStatus: VenueSummary['activitySnapshot']['liveStatus'] =
              checkinCount >= 2 ? 'busy' : checkinCount >= 1 ? 'steady' : 'calm';

            return {
              venueId: venue.venueId,
              name: venue.name,
              distanceKm,
              category: venue.category,
              status: venue.status,
              activitySnapshot: {
                checkinCount,
                liveStatus,
              },
            };
          })
          .sort((left, right) => {
            if (left.distanceKm !== right.distanceKm) {
              return left.distanceKm - right.distanceKm;
            }

            if (left.activitySnapshot.checkinCount !== right.activitySnapshot.checkinCount) {
              return right.activitySnapshot.checkinCount - left.activitySnapshot.checkinCount;
            }

            return left.venueId.localeCompare(right.venueId);
          });

        return responseFactory.build({ key: 'venues.getNearbyVenues', data: venues });
      },
    },
    presence: {
      getMyActiveSession: async () => {
        const session = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        const mappedSession: VenueSession | null = session ? mapFixtureSessionToVenueSession(session) : null;

        return responseFactory.build({ key: 'presence.getMyActiveSession', data: mappedSession });
      },
      checkInWithContext: async (request) => {
        const targetVenue = sprint01Fixtures.venues.find((venue) => venue.venueId === request.venueId);

        if (!targetVenue || targetVenue.status !== 'active') {
          return responseFactory.build({
            key: 'presence.checkInWithContext',
            data: {
              status: 'SUCCESS',
              venueId: request.venueId,
              sessionId: '',
              checkinTimestamp: clock.peek(),
              previousVenueCheckout: false,
            },
            scenario: 'NOT_FOUND',
            errorMessage: 'Mock venue is not active or not found for check-in.',
          });
        }

        if (!Number.isFinite(request.latitude) || !Number.isFinite(request.longitude)) {
          return responseFactory.build({
            key: 'presence.checkInWithContext',
            data: {
              status: 'SUCCESS',
              venueId: request.venueId,
              sessionId: '',
              checkinTimestamp: clock.peek(),
              previousVenueCheckout: false,
            },
            scenario: 'PERMISSION_DENIED',
            errorMessage: 'Mock location is unavailable or permission was denied.',
          });
        }

        if (request.locationCapturedAt) {
          const locationCapturedAtMs = new Date(request.locationCapturedAt).getTime();
          const nowMs = new Date(clock.peek()).getTime();

          if (!Number.isFinite(locationCapturedAtMs) || nowMs - locationCapturedAtMs > STALE_LOCATION_THRESHOLD_MS) {
            return responseFactory.build({
              key: 'presence.checkInWithContext',
              data: {
                status: 'SUCCESS',
                venueId: request.venueId,
                sessionId: '',
                checkinTimestamp: clock.peek(),
                previousVenueCheckout: false,
              },
              scenario: 'VALIDATION_ERROR',
              errorMessage: 'Mock location payload is stale and must be refreshed before check-in.',
            });
          }
        }

        const distanceMeters = calculateMockDistanceMeters(
          { latitude: request.latitude, longitude: request.longitude },
          { latitude: targetVenue.latitude, longitude: targetVenue.longitude }
        );

        if (distanceMeters > CHECKIN_RADIUS_METERS) {
          return responseFactory.build({
            key: 'presence.checkInWithContext',
            data: {
              status: 'SUCCESS',
              venueId: request.venueId,
              sessionId: '',
              checkinTimestamp: clock.peek(),
              previousVenueCheckout: false,
            },
            scenario: 'OUT_OF_RANGE',
            errorMessage: 'Mock check-in is outside the allowed proximity radius.',
            details: {
              distance_meters: Math.round(distanceMeters),
              max_allowed_meters: CHECKIN_RADIUS_METERS,
            },
          });
        }

        const currentActiveSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        if (currentActiveSession && currentActiveSession.venueId !== request.venueId) {
          currentActiveSession.status = 'closed';
          currentActiveSession.checkoutAt = clock.now();
        }

        if (currentActiveSession && currentActiveSession.venueId === request.venueId) {
          const response: PresenceCheckInResult = {
            status: 'SUCCESS',
            venueId: request.venueId,
            sessionId: currentActiveSession.sessionId,
            checkinTimestamp: currentActiveSession.checkinAt,
            previousVenueCheckout: false,
          };

          return responseFactory.build({ key: 'presence.checkInWithContext', data: response });
        }

        const createdAt = clock.now();
        const createdSession: MockFixtureSession = {
          sessionId: `s-${currentUser.uid}-${createdAt}`,
          userId: currentUser.uid,
          venueId: request.venueId,
          status: 'active',
          checkinAt: createdAt,
          checkoutAt: null,
        };

        localSessions.push(createdSession);

        const response: PresenceCheckInResult = {
          status: 'SUCCESS',
          venueId: request.venueId,
          sessionId: createdSession.sessionId,
          checkinTimestamp: createdSession.checkinAt,
          previousVenueCheckout: Boolean(currentActiveSession && currentActiveSession.venueId !== request.venueId),
        };

        return responseFactory.build({ key: 'presence.checkInWithContext', data: response });
      },
      checkOutActiveSession: async () => {
        const currentActiveSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        if (!currentActiveSession) {
          return responseFactory.build({
            key: 'presence.checkOutActiveSession',
            data: {
              status: 'SUCCESS',
              checkoutTime: '',
            },
            scenario: 'NOT_CHECKED_IN',
            errorMessage: 'No active session is available to check out.',
          });
        }

        const checkoutTime = clock.now();
        currentActiveSession.status = 'closed';
        currentActiveSession.checkoutAt = checkoutTime;

        const response: PresenceCheckOutResult = {
          status: 'SUCCESS',
          checkoutTime,
        };

        return responseFactory.build({ key: 'presence.checkOutActiveSession', data: response });
      },
      getStateTransitions: async () => {
        const transitions = buildPresenceStateTransitions(localSessions);
        return responseFactory.build({ key: 'presence.getStateTransitions', data: transitions });
      },
      getActiveSession: async () => {
        const session = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        const mappedSession: VenueSession | null = session ? mapFixtureSessionToVenueSession(session) : null;

        return responseFactory.build({ key: 'presence.getActiveSession', data: mappedSession });
      },
      checkIn: async (venueId) => {
        const currentActiveSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');
        if (currentActiveSession) {
          currentActiveSession.status = 'closed';
          currentActiveSession.checkoutAt = clock.now();
        }

        const createdAt = clock.now();
        const session: MockFixtureSession = {
          sessionId: `s-${currentUser.uid}-${createdAt}`,
          userId: currentUser.uid,
          venueId,
          status: 'active',
          checkinAt: createdAt,
          checkoutAt: null,
        };

        localSessions.push(session);

        return responseFactory.build({ key: 'presence.checkIn', data: mapFixtureSessionToVenueSession(session) });
      },
      checkOut: async (sessionId) => {
        const existingSession = localSessions.find((entry) => entry.sessionId === sessionId && entry.userId === currentUser.uid);

        if (existingSession && existingSession.status === 'active') {
          existingSession.status = 'closed';
          existingSession.checkoutAt = clock.now();
        }

        return responseFactory.build({ key: 'presence.checkOut', data: { sessionClosed: true } });
      },
    },
    discovery: {
      getCandidates: async () => {
        const items = buildDiscoveryCandidates(currentUser.uid);
        return responseFactory.build({ key: 'discovery.getCandidates', data: { items } });
      },
    },
    interactions: {
      like: async (targetUserId) => responseFactory.build({ key: 'interactions.like', data: { action: 'like', targetUserId } }),
      pass: async (targetUserId) => responseFactory.build({ key: 'interactions.pass', data: { action: 'pass', targetUserId } }),
    },
    match: {
      getMatches: async () => {
        const matches = computeMatchRecords(currentUser.uid);
        return responseFactory.build({ key: 'match.getMatches', data: matches });
      },
    },
    chat: {
      getThreads: async () => {
        const matches = computeMatchRecords(currentUser.uid);
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
          reporterId: currentUser.uid,
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
        const population = localSessions.filter((session) => session.status === 'active' && session.venueId === venueId).length;
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