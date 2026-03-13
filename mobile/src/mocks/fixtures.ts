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
