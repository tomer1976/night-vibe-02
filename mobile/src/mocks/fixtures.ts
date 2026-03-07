import { AccountStatus, Role } from '../contracts';

export type MockFixtureUser = {
  uid: string;
  displayName: string;
  status: AccountStatus;
  roles: readonly Role[];
  activeRoleContext: Role;
};

export type MockFixtureRoleContext = {
  uid: string;
  availableRoles: readonly Role[];
  defaultRole: Role;
};

export type MockFixtureVenue = {
  venueId: string;
  name: string;
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
    status: 'active',
    roles: regularUserRoles,
    activeRoleContext: 'RegularUser',
  }),
  Object.freeze({
    uid: 'u-owner-1',
    displayName: 'Jordan',
    status: 'active',
    roles: ownerRoles,
    activeRoleContext: 'VenueOwner',
  }),
  Object.freeze({
    uid: 'u-moderator-1',
    displayName: 'Morgan',
    status: 'active',
    roles: moderatorRoles,
    activeRoleContext: 'Moderator',
  }),
  Object.freeze({
    uid: 'u-admin-1',
    displayName: 'Taylor',
    status: 'active',
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
    category: 'club',
    status: 'active',
    latitude: 32.0853,
    longitude: 34.7818,
  }),
  Object.freeze({
    venueId: 'v-luna-lounge',
    name: 'Luna Lounge',
    category: 'lounge',
    status: 'active',
    latitude: 32.0806,
    longitude: 34.7805,
  }),
  Object.freeze({
    venueId: 'v-pending-rooftop',
    name: 'Rooftop Pending',
    category: 'bar',
    status: 'pending',
    latitude: 32.074,
    longitude: 34.7921,
  }),
]);

const sessions: readonly MockFixtureSession[] = Object.freeze([
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
  }),
  Object.freeze({
    sessionId: 's-admin-1-expired',
    userId: 'u-admin-1',
    venueId: 'v-luna-lounge',
    status: 'expired',
    checkinAt: '2026-03-08T16:00:00.000Z',
    checkoutAt: '2026-03-08T20:00:00.000Z',
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
