import { AccountStatus, Role, UserGender } from '../contracts';

export type MockFixtureUser = {
  uid: string;
  displayName: string;
  age: number;
  gender: UserGender;
  profilePhotoUrl: string;
  status: AccountStatus;
  isNewUser: boolean;
  roles: readonly Role[];
  activeRoleContext: Role;
};

export type Sprint02PersonaKey = 'new_user' | 'active_returning_user' | 'suspended_user' | 'banned_user' | 'pending_deletion_user';

export type Sprint02AuthPersonaFixture = {
  personaKey: Sprint02PersonaKey;
  uid: string;
  displayName: string;
  status: AccountStatus;
  isNewUser: boolean;
};

export type Sprint02ProfileFixture = {
  uid: string;
  displayName: string;
  profileCompleted: boolean;
};

export type Sprint02PhotoFixture = {
  uid: string;
  photoId: string;
  photoUrl: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
};

export type MockFixtureRoleContext = {
  uid: string;
  availableRoles: readonly Role[];
  defaultRole: Role;
};

export type MockFixtureVenue = {
  venueId: string;
  name: string;
  coverPhotoUrl: string;
  description: string;
  addressText: string;
  category: 'bar' | 'club' | 'restaurant' | 'lounge' | 'event_space' | 'festival' | 'other';
  status: 'pending' | 'active' | 'rejected' | 'suspended' | 'expired';
  latitude: number;
  longitude: number;
};

export type MockFixtureSession = {
  sessionId: string;
  userId: string;
  venueId: string;
  status: 'active' | 'closed' | 'expired';
  checkinAt: string;
  checkoutAt: string | null;
  closeReason?: 'manual_checkout' | 'auto_replaced' | 'timeout' | 'venue_invalidated';
};

export type MockFixtureInteraction = {
  interactionId: string;
  actorUserId: string;
  targetUserId: string;
  action: 'like' | 'pass';
  venueId: string;
  actorSessionId: string;
  targetSessionId: string;
  createdAt: string;
};

export type MockDiscoveryCoordinates = {
  latitude: number;
  longitude: number;
};

export type MockVenueDistanceOutput = {
  venueId: string;
  distanceKm: number;
};

export type MockVenuePresenceParticipant = {
  participantId: string;
  userId: string;
  venueId: string;
  displayName: string;
  age: number;
  gender: UserGender;
  profilePhotoUrl: string;
  visibility: 'visible' | 'hidden';
};

export type Sprint04VenueSessionCandidatePartition = {
  partitionId: string;
  venueId: string;
  sessionStatus: MockFixtureSession['status'];
  participants: readonly MockVenuePresenceParticipant[];
};

export type Sprint04PreferenceCompatibilityReason =
  | 'age_in_range'
  | 'age_out_of_range'
  | 'gender_allowed'
  | 'gender_blocked'
  | 'mutual_visibility_pass'
  | 'mutual_visibility_fail';

export type Sprint04PreferenceCompatibilityFixture = {
  fixtureId: string;
  venueId: string;
  viewerUserId: string;
  targetUserId: string;
  viewerPreference: {
    preferredAgeMin: number;
    preferredAgeMax: number;
    preferredGenders: readonly UserGender[];
  };
  targetPreference: {
    preferredAgeMin: number;
    preferredAgeMax: number;
    preferredGenders: readonly UserGender[];
  };
  compatibility: {
    viewerToTarget: boolean;
    targetToViewer: boolean;
    mutualVisibility: boolean;
    eligibleForDiscovery: boolean;
    reasons: readonly Sprint04PreferenceCompatibilityReason[];
  };
};

export type Sprint04DiscoveryBlockSkipFixture = {
  fixtureId: string;
  venueId: string;
  viewerUserId: string;
  blockedUserIds: readonly string[];
  skippedUserIds: readonly string[];
  expectedExcludedUserIds: readonly string[];
};

export type Sprint04ReciprocalLikeScenarioFixture = {
  scenarioId: string;
  venueId: string;
  actorUserId: string;
  targetUserId: string;
  actorLikeAt: string;
  targetLikeAt?: string;
  expectedMatchCreated: boolean;
  expectedMatchId?: string;
};

export type Sprint04MatchLifecycleState = 'matched' | 'expired' | 'blocked';

export type Sprint04MatchLifecycleFixture = {
  fixtureId: string;
  matchId: string;
  users: readonly [string, string];
  venueId: string;
  status: Sprint04MatchLifecycleState;
  transitionedAt: string;
  transitionTrigger: 'reciprocal_like' | 'co_location_ended' | 'block_applied';
};

export type Sprint04PaginationCursorFixture = {
  fixtureId: string;
  partitionId: string;
  startOffset: number;
  pageSize: number;
  expectedCursor: string;
};

export type Sprint05ChatThreadStatus = 'active' | 'expired' | 'blocked';

export type Sprint05ChatSenderRole = 'self' | 'counterpart';

export type Sprint05ChatMessageFixture = {
  messageKey: string;
  senderRole: Sprint05ChatSenderRole;
  text: string;
  sentAt: string;
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed';
  deliveredAt?: string;
  readAt?: string;
};

export type Sprint05ChatThreadFixture = {
  fixtureId: string;
  status: Sprint05ChatThreadStatus;
  unreadCount: number;
  latestMessageKey: string;
};

export type Sprint05TypingIndicatorScenarioFixture = {
  scenarioId: string;
  threadStatus: Sprint05ChatThreadStatus | 'any';
  typing: boolean;
  timeoutMs: number;
  expectedExpiresInMs: number;
};

export type Sprint05SafetyBlockFixture = {
  fixtureId: string;
  actorUserId: string;
  targetUserId: string;
  appliedAt: string;
  chatAccessRevoked: boolean;
  discoveryVisibilityRevoked: boolean;
};

export type Sprint05SafetyReportFixture = {
  fixtureId: string;
  reportId: string;
  reporterUserId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
  status: 'pending' | 'resolved';
  moderationOutcomeId?: string;
};

export type Sprint05ModerationOutcomePlaceholderFixture = {
  fixtureId: string;
  moderationOutcomeId: string;
  reportId: string;
  action: 'warning' | 'suspension' | 'ban' | 'no_action';
  status: 'pending' | 'resolved';
  resolutionSummary: string;
  resolvedAt?: string;
};

export type Sprint05NotificationFixture = {
  fixtureId: string;
  notificationId: string;
  userId: string;
  type: 'match_notification' | 'message_notification' | 'venue_activity_notification' | 'safety_notification' | 'system_notification';
  title: string;
  body: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  eventId: string;
  eventType: string;
  dedupKey: string;
};

export type Sprint05NotificationDedupScenarioFixture = {
  scenarioId: string;
  userId: string;
  dedupKey: string;
  dedupWindowSeconds: number;
  replayCount: number;
  expectedCreatedCount: number;
  expectedSuppressedCount: number;
};

export type Sprint05NotificationRateLimitScenarioFixture = {
  scenarioId: string;
  userId: string;
  maxNotificationsPerMinute: number;
  attemptedCount: number;
  expectedDeliveredCount: number;
  expectedSuppressedCount: number;
};

export type MockFixtureSet = {
  users: readonly MockFixtureUser[];
  roleContexts: readonly MockFixtureRoleContext[];
  venues: readonly MockFixtureVenue[];
  sessions: readonly MockFixtureSession[];
  interactions: readonly MockFixtureInteraction[];
};

const regularUserRoles: readonly Role[] = Object.freeze(['RegularUser']);
const ownerRoles: readonly Role[] = Object.freeze(['RegularUser', 'VenueOwner']);
const moderatorRoles: readonly Role[] = Object.freeze(['RegularUser', 'Moderator']);
const adminRoles: readonly Role[] = Object.freeze(['RegularUser', 'Administrator']);

const users: readonly MockFixtureUser[] = Object.freeze([
  Object.freeze({
    uid: 'u-regular-1',
    displayName: 'Alex',
    age: 28,
    gender: 'male',
    profilePhotoUrl: 'mock://user-photo/alex',
    status: 'active',
    isNewUser: false,
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-new-1',
    displayName: 'Ari New',
    age: 24,
    gender: 'female',
    profilePhotoUrl: 'mock://user-photo/ari',
    status: 'active',
    isNewUser: true,
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-active-1',
    displayName: 'Riley Active',
    age: 29,
    gender: 'non_binary',
    profilePhotoUrl: 'mock://user-photo/riley',
    status: 'active',
    isNewUser: false,
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-suspended-1',
    displayName: 'Casey Suspended',
    age: 30,
    gender: 'female',
    profilePhotoUrl: 'mock://user-photo/casey',
    status: 'suspended',
    isNewUser: false,
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-banned-1',
    displayName: 'Parker Banned',
    age: 33,
    gender: 'male',
    profilePhotoUrl: 'mock://user-photo/parker',
    status: 'banned',
    isNewUser: false,
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-pending-del-1',
    displayName: 'Jordan Pending',
    age: 31,
    gender: 'non_binary',
    profilePhotoUrl: 'mock://user-photo/jordan-pending',
    status: 'pending_deletion',
    isNewUser: false,
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-owner-1',
    displayName: 'Jordan',
    age: 27,
    gender: 'female',
    profilePhotoUrl: 'mock://user-photo/jordan-owner',
    status: 'active',
    isNewUser: false,
    roles: ownerRoles,
    activeRoleContext: 'VenueOwner',
  }),
  Object.freeze({
    uid: 'u-moderator-1',
    displayName: 'Morgan',
    age: 35,
    gender: 'non_binary',
    profilePhotoUrl: 'mock://user-photo/morgan',
    status: 'active',
    isNewUser: false,
    roles: moderatorRoles,
    activeRoleContext: 'Moderator',
  }),
  Object.freeze({
    uid: 'u-admin-1',
    displayName: 'Taylor',
    age: 31,
    gender: 'male',
    profilePhotoUrl: 'mock://user-photo/taylor',
    status: 'active',
    isNewUser: false,
    roles: adminRoles,
    activeRoleContext: 'Administrator',
  }),
]);

const roleContexts: readonly MockFixtureRoleContext[] = Object.freeze([
  Object.freeze({
    uid: 'u-regular-1',
    availableRoles: regularUserRoles,
    defaultRole: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-new-1',
    availableRoles: regularUserRoles,
    defaultRole: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-active-1',
    availableRoles: regularUserRoles,
    defaultRole: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-suspended-1',
    availableRoles: regularUserRoles,
    defaultRole: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-banned-1',
    availableRoles: regularUserRoles,
    defaultRole: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-persona-pending-del-1',
    availableRoles: regularUserRoles,
    defaultRole: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-owner-1',
    availableRoles: ownerRoles,
    defaultRole: 'VenueOwner',
  }),
  Object.freeze({
    uid: 'u-moderator-1',
    availableRoles: moderatorRoles,
    defaultRole: 'Moderator',
  }),
  Object.freeze({
    uid: 'u-admin-1',
    availableRoles: adminRoles,
    defaultRole: 'Administrator',
  }),
]);

const venues: readonly MockFixtureVenue[] = Object.freeze([
  Object.freeze({
    venueId: 'v-halo-club',
    name: 'Halo Club',
    coverPhotoUrl: 'mock://venue-photo/halo-club',
    description: 'High-energy dance floor with live DJs and curated late-night sets.',
    addressText: '12 Harbor Street, Tel Aviv',
    category: 'club',
    status: 'active',
    latitude: 32.0853,
    longitude: 34.7818,
  }),
  Object.freeze({
    venueId: 'v-luna-lounge',
    name: 'Luna Lounge',
    coverPhotoUrl: 'mock://venue-photo/luna-lounge',
    description: 'Relaxed lounge setting with signature cocktails and softer music.',
    addressText: '48 Moonlight Avenue, Tel Aviv',
    category: 'lounge',
    status: 'active',
    latitude: 32.0806,
    longitude: 34.7805,
  }),
  Object.freeze({
    venueId: 'v-pending-rooftop',
    name: 'Rooftop Pending',
    coverPhotoUrl: 'mock://venue-photo/rooftop-pending',
    description: 'Open-air rooftop concept currently pending moderation review.',
    addressText: '8 Skyline Road, Tel Aviv',
    category: 'bar',
    status: 'pending',
    latitude: 32.074,
    longitude: 34.7921,
  }),
  Object.freeze({
    venueId: 'v-rejected-cellar',
    name: 'Cellar Rejected',
    coverPhotoUrl: 'mock://venue-photo/cellar-rejected',
    description: 'Basement venue mock fixture representing rejected moderation state.',
    addressText: '22 Old Port Lane, Tel Aviv',
    category: 'club',
    status: 'rejected',
    latitude: 32.0712,
    longitude: 34.7899,
  }),
  Object.freeze({
    venueId: 'v-suspended-plaza',
    name: 'Plaza Suspended',
    coverPhotoUrl: 'mock://venue-photo/plaza-suspended',
    description: 'Event plaza mock fixture representing suspended lifecycle state.',
    addressText: '3 Central Plaza, Tel Aviv',
    category: 'event_space',
    status: 'suspended',
    latitude: 32.0791,
    longitude: 34.7965,
  }),
]);

const sessions: readonly MockFixtureSession[] = Object.freeze([
  Object.freeze({
    sessionId: 's-regular-1-replaced-closed',
    userId: 'u-regular-1',
    venueId: 'v-luna-lounge',
    status: 'closed',
    checkinAt: '2026-03-08T18:35:00.000Z',
    checkoutAt: '2026-03-08T18:59:00.000Z',
    closeReason: 'auto_replaced',
  }),
  Object.freeze({
    sessionId: 's-regular-1-active',
    userId: 'u-regular-1',
    venueId: 'v-halo-club',
    status: 'active',
    checkinAt: '2026-03-08T19:00:00.000Z',
    checkoutAt: null,
  }),
  Object.freeze({
    sessionId: 's-owner-1-active',
    userId: 'u-owner-1',
    venueId: 'v-halo-club',
    status: 'active',
    checkinAt: '2026-03-08T19:05:00.000Z',
    checkoutAt: null,
  }),
  Object.freeze({
    sessionId: 's-moderator-1-closed',
    userId: 'u-moderator-1',
    venueId: 'v-luna-lounge',
    status: 'closed',
    checkinAt: '2026-03-08T18:00:00.000Z',
    checkoutAt: '2026-03-08T18:45:00.000Z',
    closeReason: 'manual_checkout',
  }),
  Object.freeze({
    sessionId: 's-admin-1-expired',
    userId: 'u-admin-1',
    venueId: 'v-luna-lounge',
    status: 'expired',
    checkinAt: '2026-03-08T16:00:00.000Z',
    checkoutAt: '2026-03-08T20:00:00.000Z',
    closeReason: 'timeout',
  }),
]);

const interactions: readonly MockFixtureInteraction[] = Object.freeze([
  Object.freeze({
    interactionId: 'i-regular-to-owner-like',
    actorUserId: 'u-regular-1',
    targetUserId: 'u-owner-1',
    action: 'like',
    venueId: 'v-halo-club',
    actorSessionId: 's-regular-1-active',
    targetSessionId: 's-owner-1-active',
    createdAt: '2026-03-08T19:10:00.000Z',
  }),
  Object.freeze({
    interactionId: 'i-owner-to-regular-like',
    actorUserId: 'u-owner-1',
    targetUserId: 'u-regular-1',
    action: 'like',
    venueId: 'v-halo-club',
    actorSessionId: 's-owner-1-active',
    targetSessionId: 's-regular-1-active',
    createdAt: '2026-03-08T19:11:00.000Z',
  }),
  Object.freeze({
    interactionId: 'i-admin-to-owner-pass',
    actorUserId: 'u-admin-1',
    targetUserId: 'u-owner-1',
    action: 'pass',
    venueId: 'v-luna-lounge',
    actorSessionId: 's-admin-1-expired',
    targetSessionId: 's-owner-1-active',
    createdAt: '2026-03-08T19:12:00.000Z',
  }),
]);

export const sprint01Fixtures: MockFixtureSet = Object.freeze({
  users,
  roleContexts,
  venues,
  sessions,
  interactions,
});

export const sprint03DiscoveryCoordinates = Object.freeze({
  defaultNearbyOrigin: Object.freeze({
    latitude: 32.0865,
    longitude: 34.793,
  }),
});

export const sprint03VenueDistanceOutputs: readonly MockVenueDistanceOutput[] = Object.freeze([
  Object.freeze({
    venueId: 'v-halo-club',
    distanceKm: 1.06,
  }),
  Object.freeze({
    venueId: 'v-luna-lounge',
    distanceKm: 1.35,
  }),
]);

export const sprint03VenuePresenceParticipants: readonly MockVenuePresenceParticipant[] = Object.freeze([
  Object.freeze({
    participantId: 'vp-halo-owner-visible',
    userId: 'u-owner-1',
    venueId: 'v-halo-club',
    displayName: 'Jordan',
    age: 27,
    gender: 'female',
    profilePhotoUrl: 'mock://user-photo/jordan-owner',
    visibility: 'visible',
  }),
  Object.freeze({
    participantId: 'vp-halo-active-visible',
    userId: 'u-persona-active-1',
    venueId: 'v-halo-club',
    displayName: 'Riley Active',
    age: 29,
    gender: 'non_binary',
    profilePhotoUrl: 'mock://user-photo/riley',
    visibility: 'visible',
  }),
  Object.freeze({
    participantId: 'vp-halo-admin-hidden',
    userId: 'u-admin-1',
    venueId: 'v-halo-club',
    displayName: 'Taylor',
    age: 31,
    gender: 'male',
    profilePhotoUrl: 'mock://user-photo/taylor',
    visibility: 'hidden',
  }),
]);

export const sprint04VenueSessionCandidateFixtures: readonly Sprint04VenueSessionCandidatePartition[] = Object.freeze([
  Object.freeze({
    partitionId: 's4-v-halo-club-active',
    venueId: 'v-halo-club',
    sessionStatus: 'active',
    participants: sprint03VenuePresenceParticipants,
  }),
  Object.freeze({
    partitionId: 's4-v-luna-lounge-active',
    venueId: 'v-luna-lounge',
    sessionStatus: 'active',
    participants: Object.freeze([
      Object.freeze({
        participantId: 'vp-luna-moderator-hidden',
        userId: 'u-moderator-1',
        venueId: 'v-luna-lounge',
        displayName: 'Morgan',
        age: 35,
        gender: 'non_binary',
        profilePhotoUrl: 'mock://user-photo/morgan',
        visibility: 'hidden',
      }),
    ]),
  }),
  Object.freeze({
    partitionId: 's4-v-halo-club-closed',
    venueId: 'v-halo-club',
    sessionStatus: 'closed',
    participants: Object.freeze([]),
  }),
  Object.freeze({
    partitionId: 's4-v-luna-lounge-expired',
    venueId: 'v-luna-lounge',
    sessionStatus: 'expired',
    participants: Object.freeze([]),
  }),
]);

export const sprint04PreferenceCompatibilityFixtures: readonly Sprint04PreferenceCompatibilityFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's4-pref-regular-active-compatible',
    venueId: 'v-halo-club',
    viewerUserId: 'u-regular-1',
    targetUserId: 'u-persona-active-1',
    viewerPreference: Object.freeze({
      preferredAgeMin: 24,
      preferredAgeMax: 32,
      preferredGenders: Object.freeze<UserGender[]>(['female', 'non_binary']),
    }),
    targetPreference: Object.freeze({
      preferredAgeMin: 25,
      preferredAgeMax: 34,
      preferredGenders: Object.freeze<UserGender[]>(['male']),
    }),
    compatibility: Object.freeze({
      viewerToTarget: true,
      targetToViewer: true,
      mutualVisibility: true,
      eligibleForDiscovery: true,
      reasons: Object.freeze<Sprint04PreferenceCompatibilityReason[]>(['age_in_range', 'gender_allowed', 'mutual_visibility_pass']),
    }),
  }),
  Object.freeze({
    fixtureId: 's4-pref-regular-owner-gender-mismatch',
    venueId: 'v-halo-club',
    viewerUserId: 'u-regular-1',
    targetUserId: 'u-owner-1',
    viewerPreference: Object.freeze({
      preferredAgeMin: 24,
      preferredAgeMax: 34,
      preferredGenders: Object.freeze<UserGender[]>(['non_binary']),
    }),
    targetPreference: Object.freeze({
      preferredAgeMin: 22,
      preferredAgeMax: 35,
      preferredGenders: Object.freeze<UserGender[]>(['male', 'non_binary']),
    }),
    compatibility: Object.freeze({
      viewerToTarget: false,
      targetToViewer: true,
      mutualVisibility: false,
      eligibleForDiscovery: false,
      reasons: Object.freeze<Sprint04PreferenceCompatibilityReason[]>(['age_in_range', 'gender_blocked', 'mutual_visibility_fail']),
    }),
  }),
  Object.freeze({
    fixtureId: 's4-pref-active-owner-age-mismatch',
    venueId: 'v-halo-club',
    viewerUserId: 'u-persona-active-1',
    targetUserId: 'u-owner-1',
    viewerPreference: Object.freeze({
      preferredAgeMin: 30,
      preferredAgeMax: 35,
      preferredGenders: Object.freeze<UserGender[]>(['female']),
    }),
    targetPreference: Object.freeze({
      preferredAgeMin: 27,
      preferredAgeMax: 31,
      preferredGenders: Object.freeze<UserGender[]>(['non_binary']),
    }),
    compatibility: Object.freeze({
      viewerToTarget: false,
      targetToViewer: true,
      mutualVisibility: false,
      eligibleForDiscovery: false,
      reasons: Object.freeze<Sprint04PreferenceCompatibilityReason[]>(['age_out_of_range', 'gender_allowed', 'mutual_visibility_fail']),
    }),
  }),
]);

export const sprint04DiscoveryBlockSkipFixtures: readonly Sprint04DiscoveryBlockSkipFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's4-blockskip-regular-halo',
    venueId: 'v-halo-club',
    viewerUserId: 'u-regular-1',
    blockedUserIds: Object.freeze(['u-owner-1']),
    skippedUserIds: Object.freeze(['u-persona-active-1']),
    expectedExcludedUserIds: Object.freeze(['u-owner-1', 'u-persona-active-1']),
  }),
  Object.freeze({
    fixtureId: 's4-blockskip-active-halo',
    venueId: 'v-halo-club',
    viewerUserId: 'u-persona-active-1',
    blockedUserIds: Object.freeze([]),
    skippedUserIds: Object.freeze(['u-owner-1']),
    expectedExcludedUserIds: Object.freeze(['u-owner-1']),
  }),
]);

export const sprint04ReciprocalLikeScenarioFixtures: readonly Sprint04ReciprocalLikeScenarioFixture[] = Object.freeze([
  Object.freeze({
    scenarioId: 's4-like-one-sided-no-match',
    venueId: 'v-halo-club',
    actorUserId: 'u-regular-1',
    targetUserId: 'u-persona-active-1',
    actorLikeAt: '2026-03-08T19:20:00.000Z',
    expectedMatchCreated: false,
  }),
  Object.freeze({
    scenarioId: 's4-like-reciprocal-match',
    venueId: 'v-halo-club',
    actorUserId: 'u-regular-1',
    targetUserId: 'u-owner-1',
    actorLikeAt: '2026-03-08T19:22:00.000Z',
    targetLikeAt: '2026-03-08T19:23:00.000Z',
    expectedMatchCreated: true,
    expectedMatchId: 'match-u-owner-1-u-regular-1',
  }),
  Object.freeze({
    scenarioId: 's4-like-not-colocated-no-match',
    venueId: 'v-luna-lounge',
    actorUserId: 'u-owner-1',
    targetUserId: 'u-regular-1',
    actorLikeAt: '2026-03-08T19:26:00.000Z',
    targetLikeAt: '2026-03-08T19:27:00.000Z',
    expectedMatchCreated: false,
  }),
]);

export const sprint04MatchLifecycleFixtures: readonly Sprint04MatchLifecycleFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's4-match-lifecycle-matched',
    matchId: 'match-u-owner-1-u-regular-1',
    users: Object.freeze(['u-owner-1', 'u-regular-1']) as readonly [string, string],
    venueId: 'v-halo-club',
    status: 'matched',
    transitionedAt: '2026-03-08T19:23:00.000Z',
    transitionTrigger: 'reciprocal_like',
  }),
  Object.freeze({
    fixtureId: 's4-match-lifecycle-expired',
    matchId: 'match-u-owner-1-u-persona-active-1',
    users: Object.freeze(['u-owner-1', 'u-persona-active-1']) as readonly [string, string],
    venueId: 'v-halo-club',
    status: 'expired',
    transitionedAt: '2026-03-08T23:30:00.000Z',
    transitionTrigger: 'co_location_ended',
  }),
  Object.freeze({
    fixtureId: 's4-match-lifecycle-blocked',
    matchId: 'match-u-persona-active-1-u-regular-1',
    users: Object.freeze(['u-persona-active-1', 'u-regular-1']) as readonly [string, string],
    venueId: 'v-halo-club',
    status: 'blocked',
    transitionedAt: '2026-03-08T19:40:00.000Z',
    transitionTrigger: 'block_applied',
  }),
]);

export function createSprint04DeterministicPaginationCursor(partitionId: string, startOffset: number, pageSize: number) {
  return `s4:${partitionId}:${startOffset}:${pageSize}`;
}

export const sprint04PaginationCursorFixtures: readonly Sprint04PaginationCursorFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's4-cursor-halo-page-1',
    partitionId: 's4-v-halo-club-active',
    startOffset: 0,
    pageSize: 2,
    expectedCursor: createSprint04DeterministicPaginationCursor('s4-v-halo-club-active', 0, 2),
  }),
  Object.freeze({
    fixtureId: 's4-cursor-halo-page-2',
    partitionId: 's4-v-halo-club-active',
    startOffset: 2,
    pageSize: 2,
    expectedCursor: createSprint04DeterministicPaginationCursor('s4-v-halo-club-active', 2, 2),
  }),
  Object.freeze({
    fixtureId: 's4-cursor-luna-page-1',
    partitionId: 's4-v-luna-lounge-active',
    startOffset: 0,
    pageSize: 1,
    expectedCursor: createSprint04DeterministicPaginationCursor('s4-v-luna-lounge-active', 0, 1),
  }),
]);

export const sprint05ChatThreadFixtures: readonly Sprint05ChatThreadFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's5-chat-thread-active',
    status: 'active',
    unreadCount: 1,
    latestMessageKey: 'active-latest',
  }),
  Object.freeze({
    fixtureId: 's5-chat-thread-expired',
    status: 'expired',
    unreadCount: 0,
    latestMessageKey: 'expired-latest',
  }),
  Object.freeze({
    fixtureId: 's5-chat-thread-blocked',
    status: 'blocked',
    unreadCount: 0,
    latestMessageKey: 'blocked-latest',
  }),
]);

export const sprint05ChatMessageFixturesByStatus: Record<Sprint05ChatThreadStatus, readonly Sprint05ChatMessageFixture[]> = Object.freeze({
  active: Object.freeze([
    Object.freeze({
      messageKey: 'active-seed-1',
      senderRole: 'counterpart',
      text: 'I just got to the venue entrance.',
      sentAt: '2026-03-08T19:18:00.000Z',
      deliveryStatus: 'read',
      deliveredAt: '2026-03-08T19:18:03.000Z',
      readAt: '2026-03-08T19:18:10.000Z',
    }),
    Object.freeze({
      messageKey: 'active-seed-2',
      senderRole: 'self',
      text: 'Perfect, I am near the dance floor.',
      sentAt: '2026-03-08T19:18:30.000Z',
      deliveryStatus: 'delivered',
      deliveredAt: '2026-03-08T19:18:33.000Z',
    }),
    Object.freeze({
      messageKey: 'active-latest',
      senderRole: 'counterpart',
      text: 'See you near the dance floor.',
      sentAt: '2026-03-08T19:19:00.000Z',
      deliveryStatus: 'sent',
    }),
  ]),
  expired: Object.freeze([
    Object.freeze({
      messageKey: 'expired-seed-1',
      senderRole: 'counterpart',
      text: 'Looks like one of us checked out.',
      sentAt: '2026-03-08T23:25:00.000Z',
      deliveryStatus: 'read',
      deliveredAt: '2026-03-08T23:25:03.000Z',
      readAt: '2026-03-08T23:25:10.000Z',
    }),
    Object.freeze({
      messageKey: 'expired-latest',
      senderRole: 'self',
      text: 'Looks like the venue session ended.',
      sentAt: '2026-03-08T23:26:00.000Z',
      deliveryStatus: 'read',
      deliveredAt: '2026-03-08T23:26:02.000Z',
      readAt: '2026-03-08T23:26:04.000Z',
    }),
  ]),
  blocked: Object.freeze([
    Object.freeze({
      messageKey: 'blocked-seed-1',
      senderRole: 'counterpart',
      text: 'Conversation restricted by safety action.',
      sentAt: '2026-03-08T19:39:40.000Z',
      deliveryStatus: 'delivered',
      deliveredAt: '2026-03-08T19:39:43.000Z',
    }),
    Object.freeze({
      messageKey: 'blocked-latest',
      senderRole: 'self',
      text: 'This conversation is currently restricted.',
      sentAt: '2026-03-08T19:40:00.000Z',
      deliveryStatus: 'failed',
    }),
  ]),
});

export const sprint05TypingIndicatorScenarioFixtures: readonly Sprint05TypingIndicatorScenarioFixture[] = Object.freeze([
  Object.freeze({
    scenarioId: 's5-typing-active-start',
    threadStatus: 'active',
    typing: true,
    timeoutMs: 5_000,
    expectedExpiresInMs: 5_000,
  }),
  Object.freeze({
    scenarioId: 's5-typing-expired-start',
    threadStatus: 'expired',
    typing: true,
    timeoutMs: 1_000,
    expectedExpiresInMs: 1_000,
  }),
  Object.freeze({
    scenarioId: 's5-typing-blocked-start',
    threadStatus: 'blocked',
    typing: true,
    timeoutMs: 1_000,
    expectedExpiresInMs: 1_000,
  }),
  Object.freeze({
    scenarioId: 's5-typing-stop-immediate',
    threadStatus: 'any',
    typing: false,
    timeoutMs: 0,
    expectedExpiresInMs: 0,
  }),
]);

export const sprint05SafetyBlockFixtures: readonly Sprint05SafetyBlockFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's5-block-regular-owner',
    actorUserId: 'u-regular-1',
    targetUserId: 'u-owner-1',
    appliedAt: '2026-03-08T19:40:00.000Z',
    chatAccessRevoked: true,
    discoveryVisibilityRevoked: true,
  }),
  Object.freeze({
    fixtureId: 's5-block-owner-active',
    actorUserId: 'u-owner-1',
    targetUserId: 'u-persona-active-1',
    appliedAt: '2026-03-08T20:10:00.000Z',
    chatAccessRevoked: true,
    discoveryVisibilityRevoked: true,
  }),
]);

export const sprint05SafetyReportFixtures: readonly Sprint05SafetyReportFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's5-report-pending-spam',
    reportId: 'report-s5-001',
    reporterUserId: 'u-regular-1',
    reportedUserId: 'u-owner-1',
    reason: 'spam',
    createdAt: '2026-03-08T19:41:00.000Z',
    status: 'pending',
  }),
  Object.freeze({
    fixtureId: 's5-report-resolved-harassment',
    reportId: 'report-s5-002',
    reporterUserId: 'u-owner-1',
    reportedUserId: 'u-persona-active-1',
    reason: 'harassment',
    createdAt: '2026-03-08T20:12:00.000Z',
    status: 'resolved',
    moderationOutcomeId: 'mod-outcome-s5-002',
  }),
]);

export const sprint05ModerationOutcomePlaceholderFixtures: readonly Sprint05ModerationOutcomePlaceholderFixture[] =
  Object.freeze([
    Object.freeze({
      fixtureId: 's5-mod-outcome-warning',
      moderationOutcomeId: 'mod-outcome-s5-002',
      reportId: 'report-s5-002',
      action: 'warning',
      status: 'resolved',
      resolutionSummary: 'Warning issued after evidence review.',
      resolvedAt: '2026-03-08T20:20:00.000Z',
    }),
    Object.freeze({
      fixtureId: 's5-mod-outcome-suspension-placeholder',
      moderationOutcomeId: 'mod-outcome-s5-003',
      reportId: 'report-s5-003',
      action: 'suspension',
      status: 'pending',
      resolutionSummary: 'Placeholder outcome pending moderation review workflow.',
    }),
    Object.freeze({
      fixtureId: 's5-mod-outcome-ban-placeholder',
      moderationOutcomeId: 'mod-outcome-s5-004',
      reportId: 'report-s5-004',
      action: 'ban',
      status: 'pending',
      resolutionSummary: 'Placeholder outcome pending escalation decision.',
    }),
    Object.freeze({
      fixtureId: 's5-mod-outcome-no-action-placeholder',
      moderationOutcomeId: 'mod-outcome-s5-005',
      reportId: 'report-s5-005',
      action: 'no_action',
      status: 'pending',
      resolutionSummary: 'Placeholder outcome pending insufficient evidence review.',
    }),
  ]);

export const sprint05NotificationFixtures: readonly Sprint05NotificationFixture[] = Object.freeze([
  Object.freeze({
    fixtureId: 's5-notification-match-unread',
    notificationId: 'notif-s5-001',
    userId: 'u-regular-1',
    type: 'match_notification',
    title: 'You have a new match',
    body: 'Jordan matched with you at Halo Club.',
    read: false,
    createdAt: '2026-03-08T19:24:00.000Z',
    eventId: 'event-s5-match-001',
    eventType: 'match_created',
    dedupKey: 'match_created:u-owner-1:u-regular-1:v-halo-club',
  }),
  Object.freeze({
    fixtureId: 's5-notification-message-read',
    notificationId: 'notif-s5-002',
    userId: 'u-regular-1',
    type: 'message_notification',
    title: 'New message',
    body: 'Jordan: See you near the dance floor.',
    read: true,
    readAt: '2026-03-08T19:20:10.000Z',
    createdAt: '2026-03-08T19:19:05.000Z',
    eventId: 'event-s5-message-001',
    eventType: 'message_received',
    dedupKey: 'message_received:chat-u-owner-1-u-regular-1:active-latest',
  }),
  Object.freeze({
    fixtureId: 's5-notification-safety-unread',
    notificationId: 'notif-s5-003',
    userId: 'u-owner-1',
    type: 'safety_notification',
    title: 'Safety update',
    body: 'A report was submitted and is pending review.',
    read: false,
    createdAt: '2026-03-08T20:12:10.000Z',
    eventId: 'event-s5-safety-001',
    eventType: 'report_submitted',
    dedupKey: 'report_submitted:report-s5-002',
  }),
]);

export const sprint05NotificationDedupScenarioFixtures: readonly Sprint05NotificationDedupScenarioFixture[] = Object.freeze([
  Object.freeze({
    scenarioId: 's5-notif-dedup-match-replay',
    userId: 'u-regular-1',
    dedupKey: 'match_created:u-owner-1:u-regular-1:v-halo-club',
    dedupWindowSeconds: 30,
    replayCount: 3,
    expectedCreatedCount: 1,
    expectedSuppressedCount: 2,
  }),
  Object.freeze({
    scenarioId: 's5-notif-dedup-message-retry',
    userId: 'u-regular-1',
    dedupKey: 'message_received:chat-u-owner-1-u-regular-1:active-latest',
    dedupWindowSeconds: 30,
    replayCount: 2,
    expectedCreatedCount: 1,
    expectedSuppressedCount: 1,
  }),
]);

export const sprint05NotificationRateLimitScenarioFixtures: readonly Sprint05NotificationRateLimitScenarioFixture[] =
  Object.freeze([
    Object.freeze({
      scenarioId: 's5-notif-rate-limit-burst-25',
      userId: 'u-regular-1',
      maxNotificationsPerMinute: 20,
      attemptedCount: 25,
      expectedDeliveredCount: 20,
      expectedSuppressedCount: 5,
    }),
    Object.freeze({
      scenarioId: 's5-notif-rate-limit-at-threshold',
      userId: 'u-owner-1',
      maxNotificationsPerMinute: 20,
      attemptedCount: 20,
      expectedDeliveredCount: 20,
      expectedSuppressedCount: 0,
    }),
  ]);

export const sprint02AuthPersonaFixtures: readonly Sprint02AuthPersonaFixture[] = Object.freeze([
  Object.freeze({
    personaKey: 'new_user',
    uid: 'u-persona-new-1',
    displayName: 'Ari New',
    status: 'active',
    isNewUser: true,
  }),
  Object.freeze({
    personaKey: 'active_returning_user',
    uid: 'u-persona-active-1',
    displayName: 'Riley Active',
    status: 'active',
    isNewUser: false,
  }),
  Object.freeze({
    personaKey: 'suspended_user',
    uid: 'u-persona-suspended-1',
    displayName: 'Casey Suspended',
    status: 'suspended',
    isNewUser: false,
  }),
  Object.freeze({
    personaKey: 'banned_user',
    uid: 'u-persona-banned-1',
    displayName: 'Parker Banned',
    status: 'banned',
    isNewUser: false,
  }),
  Object.freeze({
    personaKey: 'pending_deletion_user',
    uid: 'u-persona-pending-del-1',
    displayName: 'Jordan Pending',
    status: 'pending_deletion',
    isNewUser: false,
  }),
]);

export const sprint02ProfileFixtures: readonly Sprint02ProfileFixture[] = Object.freeze([
  Object.freeze({
    uid: 'u-persona-new-1',
    displayName: 'Ari New',
    profileCompleted: false,
  }),
  Object.freeze({
    uid: 'u-persona-active-1',
    displayName: 'Riley Active',
    profileCompleted: true,
  }),
  Object.freeze({
    uid: 'u-persona-suspended-1',
    displayName: 'Casey Suspended',
    profileCompleted: true,
  }),
  Object.freeze({
    uid: 'u-persona-banned-1',
    displayName: 'Parker Banned',
    profileCompleted: true,
  }),
  Object.freeze({
    uid: 'u-persona-pending-del-1',
    displayName: 'Jordan Pending',
    profileCompleted: true,
  }),
  Object.freeze({
    uid: 'u-regular-1',
    displayName: 'Alex',
    profileCompleted: true,
  }),
]);

export const sprint02PhotoFixtures: readonly Sprint02PhotoFixture[] = Object.freeze([
  Object.freeze({
    uid: 'u-persona-active-1',
    photoId: 'photo-active-approved-1',
    photoUrl: 'mock://profile-photo/u-persona-active-1/1',
    moderationStatus: 'approved',
  }),
  Object.freeze({
    uid: 'u-persona-new-1',
    photoId: 'photo-new-pending-1',
    photoUrl: 'mock://profile-photo/u-persona-new-1/1',
    moderationStatus: 'pending',
  }),
  Object.freeze({
    uid: 'u-persona-banned-1',
    photoId: 'photo-banned-rejected-1',
    photoUrl: 'mock://profile-photo/u-persona-banned-1/1',
    moderationStatus: 'rejected',
  }),
]);
