import { BackendServiceContracts, PresenceCallableOperations } from '../src/contracts';

describe('backend service contracts', () => {
  it('defines placeholder callable operations for future check-in/check-out integration', async () => {
    const callables: PresenceCallableOperations = {
      checkIn: async (request) => ({
        status: 'SUCCESS',
        request_id: 'req-callable-checkin',
        data: {
          status: 'SUCCESS',
          venueId: request.venueId,
          sessionId: 's-callable',
          checkinTimestamp: '2026-03-12T00:00:00Z',
          previousVenueCheckout: false,
        },
      }),
      checkOut: async () => ({
        status: 'SUCCESS',
        request_id: 'req-callable-checkout',
        data: {
          status: 'SUCCESS',
          checkoutTime: '2026-03-12T00:10:00Z',
        },
      }),
    };

    const checkInResponse = await callables.checkIn({ venueId: 'v1', latitude: 32.1, longitude: 34.8 });
    const checkOutResponse = await callables.checkOut({});

    expect(checkInResponse.status).toBe('SUCCESS');
    expect(checkOutResponse.status).toBe('SUCCESS');
  });

  it('supports a complete typed service locator without concrete implementations', async () => {
    const services: BackendServiceContracts = {
      auth: {
        getSession: async () => ({ status: 'SUCCESS', request_id: 'req-1', data: { uid: 'u1', status: 'active', roles: ['RegularUser'], activeRoleContext: 'RegularUser' } }),
        login: async () => ({
          status: 'SUCCESS',
          request_id: 'req-1a',
          data: {
            uid: 'u1',
            status: 'active',
            roles: ['RegularUser'],
            activeRoleContext: 'RegularUser',
            accessToken: 'access',
            refreshToken: 'refresh',
            isNewUser: false,
          },
        }),
        refreshSession: async () => ({ status: 'SUCCESS', request_id: 'req-1b', data: { accessToken: 'access-2', tokenExpiration: '2026-03-10T00:00:00Z' } }),
        linkProvider: async () => ({ status: 'SUCCESS', request_id: 'req-1c', data: { providers: ['google'] } }),
        signInWithProvider: async () => ({ status: 'FAIL', request_id: 'req-2', error: { code: 'UNAUTHORIZED', message: 'Mock' } }),
        signOut: async () => ({ status: 'SUCCESS', request_id: 'req-3', data: { signedOut: true } }),
      },
      profile: {
        getMyProfile: async () => ({ status: 'SUCCESS', request_id: 'req-4', data: { uid: 'u1', displayName: 'Alex', profileCompleted: true } }),
        updateMyProfile: async () => ({ status: 'SUCCESS', request_id: 'req-5', data: { uid: 'u1', displayName: 'Alex', profileCompleted: true } }),
        upsertMyProfile: async () => ({ status: 'SUCCESS', request_id: 'req-5a', data: { uid: 'u1', displayName: 'Alex', profileCompleted: true } }),
        uploadMyPhoto: async () => ({ status: 'SUCCESS', request_id: 'req-5b', data: { photoId: 'p1', photoUrl: 'mock://p1', moderationStatus: 'pending' } }),
        deleteMyPhoto: async () => ({ status: 'SUCCESS', request_id: 'req-5c', data: { photoId: 'p1', removed: true } }),
      },
      accountLifecycle: {
        getAccountStatus: async () => ({ status: 'SUCCESS', request_id: 'req-5d', data: { status: 'active' } }),
        requestAccountDeletion: async () => ({ status: 'SUCCESS', request_id: 'req-5e', data: { accountStatus: 'pending_deletion', recoveryWindowDays: 30 } }),
        recoverAccount: async () => ({ status: 'SUCCESS', request_id: 'req-5f', data: { accountStatus: 'active' } }),
        getLinkedProviders: async () => ({ status: 'SUCCESS', request_id: 'req-5g', data: [{ provider: 'google', linkedAt: '2026-03-10T00:00:00Z' }] }),
      },
      roles: {
        getAvailableRoles: async () => ({ status: 'SUCCESS', request_id: 'req-6', data: ['RegularUser'] }),
        setActiveRoleContext: async () => ({ status: 'SUCCESS', request_id: 'req-7', data: { activeRoleContext: 'RegularUser' } }),
      },
      venues: {
        getNearbyVenues: async () => ({ status: 'SUCCESS', request_id: 'req-8', data: [] }),
      },
      presence: {
        getMyActiveSession: async () => ({ status: 'SUCCESS', request_id: 'req-8a', data: null }),
        checkInWithContext: async () => ({
          status: 'SUCCESS',
          request_id: 'req-8b',
          data: {
            status: 'SUCCESS',
            venueId: 'v1',
            sessionId: 's1',
            checkinTimestamp: '2026-03-11T00:00:00Z',
            previousVenueCheckout: false,
          },
        }),
        checkOutActiveSession: async () => ({
          status: 'SUCCESS',
          request_id: 'req-8c',
          data: {
            status: 'SUCCESS',
            checkoutTime: '2026-03-11T00:10:00Z',
          },
        }),
        getStateTransitions: async () => ({ status: 'SUCCESS', request_id: 'req-8d', data: [] }),
        getActiveSession: async () => ({ status: 'SUCCESS', request_id: 'req-9', data: null }),
        checkIn: async () => ({ status: 'SUCCESS', request_id: 'req-10', data: { sessionId: 's1', userId: 'u1', venueId: 'v1', status: 'active' } }),
        checkOut: async () => ({ status: 'SUCCESS', request_id: 'req-11', data: { sessionClosed: true } }),
      },
      discovery: {
        getFeed: async () => ({ status: 'SUCCESS', request_id: 'req-11a', data: { candidates: [] } }),
        skipCandidate: async () => ({ status: 'SUCCESS', request_id: 'req-11b', data: { skipped: true, targetUserId: 'u2' } }),
        getCandidates: async () => ({ status: 'SUCCESS', request_id: 'req-12', data: { items: [] } }),
      },
      interactions: {
        getIdempotencyContract: async () => ({
          status: 'SUCCESS',
          request_id: 'req-12-contract',
          data: {
            duplicateScope: 'actor_target_venue_session',
            duplicateErrorCode: 'DUPLICATE_INTERACTION',
            idempotentReplayBehavior: 'return_original_success',
            idempotencyKey: {
              required: false,
              maxLength: 128,
            },
          },
        }),
        likeUser: async () => ({
          status: 'SUCCESS',
          request_id: 'req-12a',
          data: {
            status: 'SUCCESS',
            interaction: 'LIKE',
            interactionId: 'int-like-1',
            targetUserId: 'u2',
            venueId: 'v1',
            decision: 'created',
            duplicateScope: 'actor_target_venue_session',
            matchCreated: false,
          },
        }),
        passUser: async () => ({
          status: 'SUCCESS',
          request_id: 'req-12b',
          data: {
            status: 'SUCCESS',
            interaction: 'PASS',
            interactionId: 'int-pass-1',
            targetUserId: 'u2',
            venueId: 'v1',
            decision: 'created',
            duplicateScope: 'actor_target_venue_session',
            matchCreated: false,
          },
        }),
        like: async () => ({ status: 'SUCCESS', request_id: 'req-13', data: { action: 'like', targetUserId: 'u2' } }),
        pass: async () => ({ status: 'SUCCESS', request_id: 'req-14', data: { action: 'pass', targetUserId: 'u2' } }),
      },
      match: {
        listMatches: async () => ({ status: 'SUCCESS', request_id: 'req-14a', data: { matches: [] } }),
        getMatches: async () => ({ status: 'SUCCESS', request_id: 'req-15', data: [] }),
      },
      chat: {
        getThreads: async () => ({ status: 'SUCCESS', request_id: 'req-16', data: [] }),
        getEligibility: async (chatId) => ({ status: 'SUCCESS', request_id: 'req-16a', data: { chatId, eligible: true, evaluatedAt: '2026-03-18T00:00:00Z' } }),
        listMessages: async () => ({ status: 'SUCCESS', request_id: 'req-16b', data: [] }),
        sendMessageWithLifecycle: async (request) => ({
          status: 'SUCCESS',
          request_id: 'req-16c',
          data: {
            chatId: request.chatId,
            messageId: 'msg-1',
            status: 'sent',
            sentAt: '2026-03-18T00:00:00Z',
          },
        }),
        markMessageDelivered: async (chatId, messageId) => ({
          status: 'SUCCESS',
          request_id: 'req-16d',
          data: { chatId, messageId, status: 'delivered', updatedAt: '2026-03-18T00:00:01Z' },
        }),
        markMessageRead: async (chatId, messageId) => ({
          status: 'SUCCESS',
          request_id: 'req-16e',
          data: { chatId, messageId, status: 'read', updatedAt: '2026-03-18T00:00:02Z' },
        }),
        setTypingIndicator: async (chatId, typing) => ({
          status: 'SUCCESS',
          request_id: 'req-16f',
          data: {
            chatId,
            userId: 'u1',
            typing,
            expiresAt: '2026-03-18T00:00:05Z',
          },
        }),
        sendMessage: async () => ({ status: 'SUCCESS', request_id: 'req-17', data: { chatId: 'c1', sent: true } }),
      },
      safety: {
        blockUser: async () => ({ status: 'SUCCESS', request_id: 'req-18', data: { blocked: true, targetUserId: 'u2' } }),
        reportUser: async () => ({ status: 'SUCCESS', request_id: 'req-19', data: { reportId: 'r1', reporterId: 'u1', reportedUserId: 'u2', status: 'pending' } }),
        onEnforcementEvent: () => () => {},
      },
      notifications: {
        getNotifications: async () => ({ status: 'SUCCESS', request_id: 'req-20', data: [] }),
        markAsRead: async () => ({ status: 'SUCCESS', request_id: 'req-21', data: { notificationId: 'n1', read: true } }),
      },
      analytics: {
        getVenueAnalytics: async () => ({ status: 'SUCCESS', request_id: 'req-22', data: { venueId: 'v1', population: 10, popularityScore: 0.7, updatedAt: '2026-03-08T00:00:00Z' } }),
      },
    };

    const session = await services.auth.getSession();
    expect(session.status).toBe('SUCCESS');
    expect(typeof services.discovery.getCandidates).toBe('function');
    expect(typeof services.analytics.getVenueAnalytics).toBe('function');
  });
});