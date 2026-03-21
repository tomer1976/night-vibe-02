import {
  AccountStatus,
  BackendServiceContracts,
  ChatEligibilityResult,
  ChatMessageLifecycleResult,
  ChatMessageRecord,
  ChatSendMessageRequest,
  ChatSendMessageResult,
  ChatThread,
  ChatTypingIndicatorResult,
  DiscoveryCandidate,
  MatchRecord,
  NotificationMarkReadResult,
  NotificationPreferences,
  NotificationPublishRequest,
  NotificationPublishResult,
  NotificationRecord,
  InteractionResult,
  PresenceCheckInResult,
  PresenceCheckOutResult,
  PresenceStateTransition,
  Role,
  SafetyEnforcementAction,
  SafetyEnforcementCallback,
  SafetyEnforcementEvent,
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
  sprint04VenueSessionCandidateFixtures,
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
const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000;
const NOTIFICATION_DEDUP_WINDOW_SECONDS = 30;
const NOTIFICATION_RATE_LIMIT_PER_MINUTE = 20;

type MockInteractionRecord = {
  interactionId: string;
  actorUserId: string;
  targetUserId: string;
  venueId: string;
  actorSessionId: string;
  action: 'LIKE' | 'PASS';
  idempotencyKey?: string;
};

const INTERACTION_IDEMPOTENCY_CONTRACT = {
  duplicateScope: 'actor_target_venue_session',
  duplicateErrorCode: 'DUPLICATE_INTERACTION',
  idempotentReplayBehavior: 'return_original_success',
  idempotencyKey: {
    required: false,
    maxLength: 128,
  },
} as const;

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
  const userById = new Map(sprint01Fixtures.users.map((user) => [user.uid, user]));

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
      const counterpartUserId = users[0] === activeUserId ? users[1] : users[0];
      const counterpartUser = userById.get(counterpartUserId);

      if (!counterpartUser) {
        continue;
      }

      matchMap.set(matchId, {
        matchId,
        users,
        venueId: like.venueId,
        counterpart: {
          userId: counterpartUser.uid,
          displayName: counterpartUser.displayName,
          age: counterpartUser.age,
          gender: counterpartUser.gender,
          profilePhotoUrl: counterpartUser.profilePhotoUrl,
        },
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

  const matchedUserIdsInVenue = new Set(
    computeMatchRecords(activeUserId)
      .filter((match) => match.venueId === activeSession.venueId)
      .map((match) => match.counterpart.userId)
  );

  const partition = sprint04VenueSessionCandidateFixtures.find(
    (item) => item.venueId === activeSession.venueId && item.sessionStatus === activeSession.status
  );

  const fixtureParticipants = (partition?.participants ?? sprint03VenuePresenceParticipants).filter(
    (participant) =>
      participant.venueId === activeSession.venueId &&
      participant.visibility === 'visible' &&
      participant.userId !== activeUserId &&
      !matchedUserIdsInVenue.has(participant.userId)
  );

  return fixtureParticipants.map((participant) => ({
    userId: participant.userId,
    displayName: participant.displayName,
    age: participant.age,
    gender: participant.gender,
    profilePhotoUrl: participant.profilePhotoUrl,
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
        session.closeReason ??
        (session.status === 'expired'
          ? 'timeout'
          : session.sessionId.includes('replaced')
            ? 'auto_replaced'
            : 'manual_checkout');

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
  const interactionRecords: MockInteractionRecord[] = [];
  const chatMessagesByChatId = new Map<string, ChatMessageRecord[]>();
  const safetyEnforcementSubscribers = new Set<SafetyEnforcementCallback>();
  const notificationRecords: NotificationRecord[] = [];
  const notificationPublishHistory: { dedupKey: string; createdAtMs: number }[] = [];
  let notificationPreferences: NotificationPreferences = {
    matchNotifications: true,
    messageNotifications: true,
    venueNotifications: true,
    safetyNotifications: true,
    systemNotifications: true,
    updatedAt: clock.peek(),
  };

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
  const applyDeterministicSessionTimeouts = () => {
    const nowMs = asMillis(clock.peek());

    for (const session of localSessions) {
      if (session.status !== 'active') {
        continue;
      }

      const checkinAtMs = asMillis(session.checkinAt);
      if (!Number.isFinite(checkinAtMs)) {
        continue;
      }

      const expiresAtMs = checkinAtMs + SESSION_TIMEOUT_MS;
      if (nowMs < expiresAtMs) {
        continue;
      }

      session.status = 'expired';
      session.checkoutAt = new Date(expiresAtMs).toISOString();
      session.closeReason = 'timeout';
    }
  };

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

  const buildInteractionResult = (input: {
    action: 'LIKE' | 'PASS';
    interactionId: string;
    targetUserId: string;
    venueId: string;
    idempotencyKey?: string;
    decision: 'created' | 'idempotent_replay';
  }): InteractionResult => ({
    status: 'SUCCESS',
    interaction: input.action,
    interactionId: input.interactionId,
    targetUserId: input.targetUserId,
    venueId: input.venueId,
    idempotencyKey: input.idempotencyKey,
    decision: input.decision,
    duplicateScope: INTERACTION_IDEMPOTENCY_CONTRACT.duplicateScope,
    matchCreated: false,
  });

  const getChatThreads = (): ChatThread[] => {
    const matches = computeMatchRecords(currentUser.uid);

    const toThreadStatus = (status: (typeof matches)[number]['status']): ChatThread['status'] => {
      if (status === 'matched') {
        return 'active';
      }

      if (status === 'expired') {
        return 'expired';
      }

      return 'blocked';
    };

    const buildLatestMessage = (matchId: string, status: ChatThread['status']): ChatThread['latestMessage'] => {
      const statusToDelivery: Record<ChatThread['status'], ChatThread['latestMessage']['deliveryStatus']> = {
        active: 'delivered',
        expired: 'read',
        blocked: 'sent',
      };

      const statusToText: Record<ChatThread['status'], string> = {
        active: 'See you near the dance floor.',
        expired: 'Looks like the venue session ended.',
        blocked: 'This conversation is currently restricted.',
      };

      return {
        messageId: `msg-${matchId}-latest`,
        text: statusToText[status],
        sentAt: clock.now(),
        deliveryStatus: statusToDelivery[status],
      };
    };

    return matches.map((match) => ({
      chatId: `chat-${match.matchId}`,
      matchId: match.matchId,
      participants: [match.users[0], match.users[1]],
      counterpart: {
        userId: match.counterpart.userId,
        displayName: match.counterpart.displayName,
        age: match.counterpart.age,
        gender: match.counterpart.gender,
      },
      latestMessage: buildLatestMessage(match.matchId, toThreadStatus(match.status)),
      unreadCount: match.status === 'matched' ? 1 : 0,
      status: toThreadStatus(match.status),
    }));
  };

  const resolveChatEligibility = (chatId: string): ChatEligibilityResult => {
    applyDeterministicSessionTimeouts();

    const activeSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');
    if (!activeSession) {
      return {
        chatId,
        eligible: false,
        reason: 'not_checked_in',
        evaluatedAt: clock.now(),
      };
    }

    const thread = getChatThreads().find((entry) => entry.chatId === chatId);
    if (!thread) {
      return {
        chatId,
        eligible: false,
        reason: 'match_expired',
        evaluatedAt: clock.now(),
      };
    }

    if (thread.status === 'blocked') {
      return {
        chatId,
        eligible: false,
        reason: 'blocked',
        evaluatedAt: clock.now(),
      };
    }

    if (thread.status === 'expired') {
      return {
        chatId,
        eligible: false,
        reason: 'match_expired',
        evaluatedAt: clock.now(),
      };
    }

    return {
      chatId,
      eligible: true,
      evaluatedAt: clock.now(),
    };
  };

  const listChatMessages = (chatId: string): ChatMessageRecord[] => {
    const existingMessages = chatMessagesByChatId.get(chatId);
    if (existingMessages) {
      return existingMessages;
    }

    const seededMessages: ChatMessageRecord[] = [
      {
        messageId: `${chatId}-seed-1`,
        chatId,
        senderUserId: currentUser.uid,
        text: 'Mock seeded message.',
        sentAt: clock.now(),
        deliveryStatus: 'read',
        deliveredAt: clock.now(),
        readAt: clock.now(),
      },
    ];

    chatMessagesByChatId.set(chatId, seededMessages);
    return seededMessages;
  };

  const sendLifecycleMessage = (request: ChatSendMessageRequest) => {
    const eligibility = resolveChatEligibility(request.chatId);
    const failureScenario = eligibility.reason === 'blocked' ? 'ACCESS_DENIED' : 'CHAT_EXPIRED';

    if (!eligibility.eligible) {
      return responseFactory.build({
        key: 'chat.sendMessageWithLifecycle',
        data: {
          chatId: request.chatId,
          messageId: '',
          status: 'sent',
          sentAt: clock.now(),
        } satisfies ChatSendMessageResult,
        scenario: failureScenario,
        errorMessage: 'Chat eligibility requirements are not satisfied for message send.',
        details: {
          reason: eligibility.reason,
        },
      });
    }

    const sentAt = clock.now();
    const messageId = `${request.chatId}-msg-${Date.now()}`;
    const newMessage: ChatMessageRecord = {
      messageId,
      chatId: request.chatId,
      senderUserId: currentUser.uid,
      text: request.messageText,
      sentAt,
      deliveryStatus: 'sent',
    };

    const currentMessages = listChatMessages(request.chatId);
    chatMessagesByChatId.set(request.chatId, [...currentMessages, newMessage]);

    return responseFactory.build({
      key: 'chat.sendMessageWithLifecycle',
      data: {
        chatId: request.chatId,
        messageId,
        status: 'sent',
        sentAt,
      } satisfies ChatSendMessageResult,
    });
  };

  const markMessageLifecycle = (
    chatId: string,
    messageId: string,
    status: ChatMessageLifecycleResult['status']
  ) => {
    const messages = listChatMessages(chatId);
    const message = messages.find((entry) => entry.messageId === messageId);

    if (!message) {
      return responseFactory.build({
        key: `chat.markMessage.${status}`,
        data: {
          chatId,
          messageId,
          status,
          updatedAt: clock.now(),
        } satisfies ChatMessageLifecycleResult,
        scenario: 'NOT_FOUND',
        errorMessage: 'Message not found in mock chat timeline.',
      });
    }

    const updatedAt = clock.now();
    const updatedMessages = messages.map((entry) => {
      if (entry.messageId !== messageId) {
        return entry;
      }

      if (status === 'delivered') {
        return {
          ...entry,
          deliveryStatus: 'delivered' as const,
          deliveredAt: updatedAt,
        };
      }

      return {
        ...entry,
        deliveryStatus: 'read' as const,
        deliveredAt: entry.deliveredAt ?? updatedAt,
        readAt: updatedAt,
      };
    });

    chatMessagesByChatId.set(chatId, updatedMessages);

    return responseFactory.build({
      key: `chat.markMessage.${status}`,
      data: {
        chatId,
        messageId,
        status,
        updatedAt,
      } satisfies ChatMessageLifecycleResult,
    });
  };

  const submitInteraction = (action: 'LIKE' | 'PASS', request: { targetUserId: string; venueId: string; idempotencyKey?: string }) => {
    applyDeterministicSessionTimeouts();

    const actorSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

    if (!actorSession) {
      return responseFactory.build({
        key: `interactions.${action.toLowerCase()}User`,
        data: buildInteractionResult({
          action,
          interactionId: '',
          targetUserId: request.targetUserId,
          venueId: request.venueId,
          decision: 'created',
        }),
        scenario: 'NOT_CHECKED_IN',
        errorMessage: 'Active venue session is required before interactions are allowed.',
      });
    }

    if (actorSession.venueId !== request.venueId) {
      return responseFactory.build({
        key: `interactions.${action.toLowerCase()}User`,
        data: buildInteractionResult({
          action,
          interactionId: '',
          targetUserId: request.targetUserId,
          venueId: request.venueId,
          decision: 'created',
        }),
        scenario: 'ACCESS_DENIED',
        errorMessage: 'Interaction venue must match active session venue context.',
      });
    }

    const duplicate = interactionRecords.find(
      (record) =>
        record.actorUserId === currentUser.uid &&
        record.targetUserId === request.targetUserId &&
        record.venueId === request.venueId &&
        record.actorSessionId === actorSession.sessionId
    );

    if (duplicate) {
      if (request.idempotencyKey && duplicate.idempotencyKey === request.idempotencyKey) {
        return responseFactory.build({
          key: `interactions.${action.toLowerCase()}User`,
          data: buildInteractionResult({
            action: duplicate.action,
            interactionId: duplicate.interactionId,
            targetUserId: duplicate.targetUserId,
            venueId: duplicate.venueId,
            idempotencyKey: duplicate.idempotencyKey,
            decision: 'idempotent_replay',
          }),
        });
      }

      return responseFactory.build({
        key: `interactions.${action.toLowerCase()}User`,
        data: buildInteractionResult({
          action: duplicate.action,
          interactionId: duplicate.interactionId,
          targetUserId: duplicate.targetUserId,
          venueId: duplicate.venueId,
          idempotencyKey: duplicate.idempotencyKey,
          decision: 'idempotent_replay',
        }),
        scenario: 'DUPLICATE_INTERACTION',
        errorMessage: 'Duplicate interaction detected for actor-target-venue-session scope.',
      });
    }

    const createdRecord: MockInteractionRecord = {
      interactionId: `interaction-${currentUser.uid}-${request.targetUserId}-${actorSession.sessionId}`,
      actorUserId: currentUser.uid,
      targetUserId: request.targetUserId,
      venueId: request.venueId,
      actorSessionId: actorSession.sessionId,
      action,
      idempotencyKey: request.idempotencyKey,
    };

    interactionRecords.push(createdRecord);

    return responseFactory.build({
      key: `interactions.${action.toLowerCase()}User`,
      data: buildInteractionResult({
        action: createdRecord.action,
        interactionId: createdRecord.interactionId,
        targetUserId: createdRecord.targetUserId,
        venueId: createdRecord.venueId,
        idempotencyKey: createdRecord.idempotencyKey,
        decision: 'created',
      }),
    });
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

  const emitSafetyEnforcementEvent = (
    action: SafetyEnforcementAction,
    targetUserId: string,
    options?: { relatedReportId?: string }
  ) => {
    const occurredAt = clock.now();
    const event: SafetyEnforcementEvent = {
      eventId: `safety-${action}-${occurredAt}-${targetUserId}`,
      action,
      actorUserId: currentUser.uid,
      targetUserId,
      occurredAt,
      chatAccessRevoked: true,
      discoveryVisibilityRevoked: true,
      relatedReportId: options?.relatedReportId,
    };

    for (const subscriber of safetyEnforcementSubscribers) {
      subscriber(event);
    }
  };

  const notificationPreferenceEnabledByType = (type: NotificationRecord['type']) => {
    const preferenceByType: Record<NotificationRecord['type'], keyof NotificationPreferences> = {
      match_notification: 'matchNotifications',
      message_notification: 'messageNotifications',
      venue_activity_notification: 'venueNotifications',
      safety_notification: 'safetyNotifications',
      system_notification: 'systemNotifications',
    };

    return notificationPreferences[preferenceByType[type]];
  };

  const listNotifications = (request?: { cursor?: string; pageSize?: number; unreadOnly?: boolean }) => {
    const sorted = [...notificationRecords].sort((left, right) => {
      const leftMs = left.createdAt ? asMillis(left.createdAt) : 0;
      const rightMs = right.createdAt ? asMillis(right.createdAt) : 0;
      return rightMs - leftMs;
    });

    const filtered = request?.unreadOnly ? sorted.filter((entry) => !entry.read) : sorted;
    const pageSize = request?.pageSize && request.pageSize > 0 ? request.pageSize : filtered.length || 20;
    const startOffset = request?.cursor ? Number.parseInt(request.cursor, 10) : 0;
    const safeStartOffset = Number.isFinite(startOffset) && startOffset >= 0 ? startOffset : 0;
    const items = filtered.slice(safeStartOffset, safeStartOffset + pageSize);
    const nextOffset = safeStartOffset + items.length;

    return {
      items,
      nextCursor: nextOffset < filtered.length ? String(nextOffset) : undefined,
    };
  };

  const markNotificationRead = (notificationId: string) => {
    const existing = notificationRecords.find((entry) => entry.notificationId === notificationId);

    if (!existing) {
      return responseFactory.build({
        key: 'notifications.markNotificationRead',
        data: {
          notificationId,
          read: true,
          readAt: clock.now(),
        } satisfies NotificationMarkReadResult,
        scenario: 'NOT_FOUND',
        errorMessage: 'Notification not found for read-state transition.',
      });
    }

    const readAt = clock.now();
    for (let index = 0; index < notificationRecords.length; index += 1) {
      if (notificationRecords[index].notificationId !== notificationId) {
        continue;
      }

      notificationRecords[index] = {
        ...notificationRecords[index],
        read: true,
        readAt,
        updatedAt: readAt,
      };
      break;
    }

    return responseFactory.build({
      key: 'notifications.markNotificationRead',
      data: {
        notificationId,
        read: true,
        readAt,
      } satisfies NotificationMarkReadResult,
    });
  };

  const publishInAppNotification = (request: NotificationPublishRequest) => {
    const nowIso = clock.now();
    const nowMs = asMillis(nowIso);
    const dedupKey = `${currentUser.uid}+${request.eventType}+${request.eventId}`;
    const dedupWindowMs = NOTIFICATION_DEDUP_WINDOW_SECONDS * 1000;

    if (!notificationPreferenceEnabledByType(request.type)) {
      return responseFactory.build({
        key: 'notifications.publishInAppNotification',
        data: {
          outcome: 'suppressed_preference_filtered',
          dedupKey,
          occurredAt: nowIso,
        } satisfies NotificationPublishResult,
      });
    }

    const withinCurrentMinute = notificationPublishHistory.filter((entry) => nowMs - entry.createdAtMs < 60_000);
    if (withinCurrentMinute.length >= NOTIFICATION_RATE_LIMIT_PER_MINUTE) {
      return responseFactory.build({
        key: 'notifications.publishInAppNotification',
        data: {
          outcome: 'suppressed_rate_limited',
          dedupKey,
          occurredAt: nowIso,
        } satisfies NotificationPublishResult,
      });
    }

    const duplicate = notificationRecords.find((entry) => {
      const createdAtMs = entry.createdAt ? asMillis(entry.createdAt) : 0;
      return entry.dedupKey === dedupKey && nowMs - createdAtMs <= dedupWindowMs;
    });

    if (duplicate) {
      return responseFactory.build({
        key: 'notifications.publishInAppNotification',
        data: {
          outcome: 'suppressed_deduplicated',
          notificationId: duplicate.notificationId,
          dedupKey,
          occurredAt: nowIso,
        } satisfies NotificationPublishResult,
      });
    }

    const notificationId = `notification-${notificationRecords.length + 1}`;
    notificationRecords.push({
      notificationId,
      userId: currentUser.uid,
      type: request.type,
      title: request.title,
      body: request.body,
      eventId: request.eventId,
      eventType: request.eventType,
      dedupKey,
      read: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    notificationPublishHistory.push({ dedupKey, createdAtMs: nowMs });

    return responseFactory.build({
      key: 'notifications.publishInAppNotification',
      data: {
        outcome: 'created',
        notificationId,
        dedupKey,
        occurredAt: nowIso,
      } satisfies NotificationPublishResult,
    });
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
        applyDeterministicSessionTimeouts();

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
              coverPhotoUrl: venue.coverPhotoUrl,
              description: venue.description,
              addressText: venue.addressText,
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
        applyDeterministicSessionTimeouts();

        const session = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        const mappedSession: VenueSession | null = session ? mapFixtureSessionToVenueSession(session) : null;

        return responseFactory.build({ key: 'presence.getMyActiveSession', data: mappedSession });
      },
      checkInWithContext: async (request) => {
        applyDeterministicSessionTimeouts();

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
          currentActiveSession.closeReason = 'auto_replaced';
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
        applyDeterministicSessionTimeouts();

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
        currentActiveSession.closeReason = 'manual_checkout';

        const response: PresenceCheckOutResult = {
          status: 'SUCCESS',
          checkoutTime,
        };

        return responseFactory.build({ key: 'presence.checkOutActiveSession', data: response });
      },
      getStateTransitions: async () => {
        applyDeterministicSessionTimeouts();

        const transitions = buildPresenceStateTransitions(localSessions);
        return responseFactory.build({ key: 'presence.getStateTransitions', data: transitions });
      },
      getActiveSession: async () => {
        applyDeterministicSessionTimeouts();

        const session = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        const mappedSession: VenueSession | null = session ? mapFixtureSessionToVenueSession(session) : null;

        return responseFactory.build({ key: 'presence.getActiveSession', data: mappedSession });
      },
      checkIn: async (venueId) => {
        applyDeterministicSessionTimeouts();

        const currentActiveSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');
        if (currentActiveSession) {
          currentActiveSession.status = 'closed';
          currentActiveSession.checkoutAt = clock.now();
          currentActiveSession.closeReason = 'auto_replaced';
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
          existingSession.closeReason = 'manual_checkout';
        }

        return responseFactory.build({ key: 'presence.checkOut', data: { sessionClosed: true } });
      },
    },
    discovery: {
      getFeed: async (request) => {
        applyDeterministicSessionTimeouts();

        const actorSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        if (!actorSession) {
          return responseFactory.build({
            key: 'discovery.getFeed',
            data: {
              candidates: [],
              nextCursor: undefined,
            },
            scenario: 'NOT_CHECKED_IN',
            errorMessage: 'Active venue session is required before discovery feed access is allowed.',
          });
        }

        const candidates = buildDiscoveryCandidates(currentUser.uid);
        const pageSize = request?.pageSize && request.pageSize > 0 ? request.pageSize : candidates.length;
        const startOffset = request?.cursor ? Number.parseInt(request.cursor, 10) : 0;
        const safeStartOffset = Number.isFinite(startOffset) && startOffset >= 0 ? startOffset : 0;
        const page = candidates.slice(safeStartOffset, safeStartOffset + pageSize);
        const nextOffset = safeStartOffset + page.length;
        const nextCursor = nextOffset < candidates.length ? String(nextOffset) : undefined;

        return responseFactory.build({
          key: 'discovery.getFeed',
          data: {
            candidates: page,
            nextCursor,
          },
        });
      },
      skipCandidate: async (targetUserId) =>
        responseFactory.build({
          key: 'discovery.skipCandidate',
          data: {
            skipped: true,
            targetUserId,
          },
        }),
      getCandidates: async () => {
        applyDeterministicSessionTimeouts();

        const items = buildDiscoveryCandidates(currentUser.uid);
        return responseFactory.build({ key: 'discovery.getCandidates', data: { items } });
      },
    },
    interactions: {
      getIdempotencyContract: async () => responseFactory.build({ key: 'interactions.getIdempotencyContract', data: INTERACTION_IDEMPOTENCY_CONTRACT }),
      likeUser: async (request) => submitInteraction('LIKE', request),
      passUser: async (request) => submitInteraction('PASS', request),
      like: async (targetUserId) => {
        applyDeterministicSessionTimeouts();

        const actorSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        if (!actorSession) {
          return responseFactory.build({
            key: 'interactions.like',
            data: { action: 'like', targetUserId },
            scenario: 'NOT_CHECKED_IN',
            errorMessage: 'Active venue session is required before interactions are allowed.',
          });
        }

        const result = submitInteraction('LIKE', {
          targetUserId,
          venueId: actorSession.venueId,
        });

        if (result.status === 'FAIL') {
          return responseFactory.build({
            key: 'interactions.like',
            data: { action: 'like', targetUserId },
            scenario: result.error.code,
            errorMessage: result.error.message,
            details: result.error.details,
          });
        }

        return responseFactory.build({ key: 'interactions.like', data: { action: 'like', targetUserId } });
      },
      pass: async (targetUserId) => {
        applyDeterministicSessionTimeouts();

        const actorSession = localSessions.find((entry) => entry.userId === currentUser.uid && entry.status === 'active');

        if (!actorSession) {
          return responseFactory.build({
            key: 'interactions.pass',
            data: { action: 'pass', targetUserId },
            scenario: 'NOT_CHECKED_IN',
            errorMessage: 'Active venue session is required before interactions are allowed.',
          });
        }

        const result = submitInteraction('PASS', {
          targetUserId,
          venueId: actorSession.venueId,
        });

        if (result.status === 'FAIL') {
          return responseFactory.build({
            key: 'interactions.pass',
            data: { action: 'pass', targetUserId },
            scenario: result.error.code,
            errorMessage: result.error.message,
            details: result.error.details,
          });
        }

        return responseFactory.build({ key: 'interactions.pass', data: { action: 'pass', targetUserId } });
      },
    },
    match: {
      listMatches: async (request) => {
        const matches = computeMatchRecords(currentUser.uid);
        const filteredMatches = request?.status ? matches.filter((match) => match.status === request.status) : matches;

        return responseFactory.build({
          key: 'match.listMatches',
          data: {
            matches: filteredMatches,
          },
        });
      },
      getMatches: async () => {
        const matches = computeMatchRecords(currentUser.uid);
        return responseFactory.build({ key: 'match.getMatches', data: matches });
      },
    },
    chat: {
      getThreads: async () => responseFactory.build({ key: 'chat.getThreads', data: getChatThreads() }),
      getEligibility: async (chatId) =>
        responseFactory.build({
          key: 'chat.getEligibility',
          data: resolveChatEligibility(chatId),
        }),
      listMessages: async (chatId) =>
        responseFactory.build({
          key: 'chat.listMessages',
          data: listChatMessages(chatId),
        }),
      sendMessageWithLifecycle: async (request) => sendLifecycleMessage(request),
      markMessageDelivered: async (chatId, messageId) => markMessageLifecycle(chatId, messageId, 'delivered'),
      markMessageRead: async (chatId, messageId) => markMessageLifecycle(chatId, messageId, 'read'),
      setTypingIndicator: async (chatId, typing) => {
        const nowIso = clock.now();
        const expiresAt = new Date(new Date(nowIso).getTime() + 5_000).toISOString();

        return responseFactory.build({
          key: 'chat.setTypingIndicator',
          data: {
            chatId,
            userId: currentUser.uid,
            typing,
            expiresAt,
          } satisfies ChatTypingIndicatorResult,
        });
      },
      sendMessage: async (chatId, message) => {
        const sendResult = sendLifecycleMessage({
          chatId,
          messageText: message,
        });

        if (sendResult.status === 'FAIL') {
          return responseFactory.build({
            key: 'chat.sendMessage',
            data: {
              chatId,
              sent: true,
            },
            scenario: sendResult.error.code,
            errorMessage: sendResult.error.message,
            details: sendResult.error.details,
          });
        }

        return responseFactory.build({ key: 'chat.sendMessage', data: { chatId, sent: true } });
      },
    },
    safety: {
      blockUser: async (targetUserId) => {
        emitSafetyEnforcementEvent('block_applied', targetUserId);

        return responseFactory.build({ key: 'safety.blockUser', data: { blocked: true, targetUserId } });
      },
      reportUser: async (targetUserId) => {
        const report: SafetyReport = {
          reportId: `report-${clock.now()}`,
          reporterId: currentUser.uid,
          reportedUserId: targetUserId,
          status: 'pending',
        };

        emitSafetyEnforcementEvent('report_submitted', targetUserId, { relatedReportId: report.reportId });

        return responseFactory.build({ key: 'safety.reportUser', data: report });
      },
      onEnforcementEvent: (callback) => {
        safetyEnforcementSubscribers.add(callback);

        return () => {
          safetyEnforcementSubscribers.delete(callback);
        };
      },
    },
    notifications: {
      listNotifications: async (request) =>
        responseFactory.build({
          key: 'notifications.listNotifications',
          data: listNotifications(request),
        }),
      markNotificationRead: async (notificationId) => markNotificationRead(notificationId),
      getNotificationPreferences: async () =>
        responseFactory.build({
          key: 'notifications.getNotificationPreferences',
          data: notificationPreferences,
        }),
      updateNotificationPreferences: async (preferences) => {
        notificationPreferences = {
          ...notificationPreferences,
          ...preferences,
          updatedAt: clock.now(),
        };

        return responseFactory.build({
          key: 'notifications.updateNotificationPreferences',
          data: notificationPreferences,
        });
      },
      getDedupWindowConfig: async () =>
        responseFactory.build({
          key: 'notifications.getDedupWindowConfig',
          data: {
            dedupWindowSeconds: NOTIFICATION_DEDUP_WINDOW_SECONDS,
            maxNotificationsPerMinute: NOTIFICATION_RATE_LIMIT_PER_MINUTE,
          },
        }),
      publishInAppNotification: async (request) => publishInAppNotification(request),
      getNotifications: async () =>
        responseFactory.build({
          key: 'notifications.getNotifications',
          data: listNotifications().items,
        }),
      markAsRead: async (notificationId) => {
        const response = markNotificationRead(notificationId);

        if (response.status === 'FAIL') {
          return responseFactory.build({
            key: 'notifications.markAsRead',
            data: { notificationId, read: true },
            scenario: response.error.code,
            errorMessage: response.error.message,
            details: response.error.details,
          });
        }

        return responseFactory.build({
          key: 'notifications.markAsRead',
          data: { notificationId, read: true },
        });
      },
    },
    analytics: {
      getVenueAnalytics: async (venueId) => {
        applyDeterministicSessionTimeouts();

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