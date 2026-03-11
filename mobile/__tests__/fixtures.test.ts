import {
  sprint01Fixtures,
  sprint02AuthPersonaFixtures,
  sprint02PhotoFixtures,
  sprint02ProfileFixtures,
  sprint03DiscoveryCoordinates,
  sprint03VenuePresenceParticipants,
  sprint03VenueDistanceOutputs,
} from '../src/mocks';

describe('sprint01 fixtures', () => {
  it('provides deterministic fixture counts', () => {
    expect(sprint01Fixtures.users).toHaveLength(9);
    expect(sprint01Fixtures.roleContexts).toHaveLength(9);
    expect(sprint01Fixtures.venues).toHaveLength(5);
    expect(sprint01Fixtures.sessions).toHaveLength(5);
    expect(sprint01Fixtures.interactions).toHaveLength(3);
  });

  it('includes Sprint-03 venue catalog statuses for discovery and eligibility scenarios', () => {
    const venueStatuses = new Set(sprint01Fixtures.venues.map((venue) => venue.status));

    expect(venueStatuses).toEqual(new Set(['active', 'pending', 'rejected', 'suspended']));
  });

  it('includes Sprint-03 mock discovery coordinates and deterministic distance outputs', () => {
    expect(Number.isFinite(sprint03DiscoveryCoordinates.defaultNearbyOrigin.latitude)).toBe(true);
    expect(Number.isFinite(sprint03DiscoveryCoordinates.defaultNearbyOrigin.longitude)).toBe(true);

    expect(sprint03VenueDistanceOutputs).toEqual([
      { venueId: 'v-halo-club', distanceKm: 1.06 },
      { venueId: 'v-luna-lounge', distanceKm: 1.35 },
    ]);
  });

  it('includes Sprint-03 venue presence participant fixtures with visible and hidden records', () => {
    expect(sprint03VenuePresenceParticipants.length).toBeGreaterThanOrEqual(2);

    const visibilityValues = new Set(sprint03VenuePresenceParticipants.map((participant) => participant.visibility));
    expect(visibilityValues).toEqual(new Set(['visible', 'hidden']));

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const fixtureVenueIds = new Set(sprint01Fixtures.venues.map((venue) => venue.venueId));

    for (const participant of sprint03VenuePresenceParticipants) {
      expect(fixtureUserIds.has(participant.userId)).toBe(true);
      expect(fixtureVenueIds.has(participant.venueId)).toBe(true);
      expect(participant.displayName.length).toBeGreaterThan(0);
      expect(participant.age).toBeGreaterThanOrEqual(18);
    }
  });

  it('includes required Sprint-02 auth personas', () => {
    expect(sprint02AuthPersonaFixtures).toHaveLength(5);

    const personaKeys = new Set(sprint02AuthPersonaFixtures.map((persona) => persona.personaKey));
    expect(personaKeys).toEqual(
      new Set(['new_user', 'active_returning_user', 'suspended_user', 'banned_user', 'pending_deletion_user'])
    );

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));

    for (const persona of sprint02AuthPersonaFixtures) {
      expect(fixtureUserIds.has(persona.uid)).toBe(true);
    }
  });

  it('includes Sprint-02 profile fixtures for complete and incomplete onboarding states', () => {
    expect(sprint02ProfileFixtures.length).toBeGreaterThan(0);

    const completionStates = new Set(sprint02ProfileFixtures.map((profile) => profile.profileCompleted));
    expect(completionStates.has(true)).toBe(true);
    expect(completionStates.has(false)).toBe(true);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    for (const profile of sprint02ProfileFixtures) {
      expect(fixtureUserIds.has(profile.uid)).toBe(true);
      expect(profile.displayName.length).toBeGreaterThan(0);
    }
  });

  it('includes Sprint-02 photo fixtures across moderation states', () => {
    expect(sprint02PhotoFixtures.length).toBeGreaterThanOrEqual(3);

    const moderationStates = new Set(sprint02PhotoFixtures.map((photo) => photo.moderationStatus));
    expect(moderationStates).toEqual(new Set(['pending', 'approved', 'rejected']));

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    for (const photo of sprint02PhotoFixtures) {
      expect(fixtureUserIds.has(photo.uid)).toBe(true);
      expect(photo.photoId.length).toBeGreaterThan(0);
      expect(photo.photoUrl.startsWith('mock://')).toBe(true);
    }
  });

  it('keeps role context aligned with assigned user roles', () => {
    for (const roleContext of sprint01Fixtures.roleContexts) {
      const user = sprint01Fixtures.users.find((fixtureUser) => fixtureUser.uid === roleContext.uid);

      expect(user).toBeDefined();
      expect(roleContext.availableRoles).toEqual(user?.roles);
      expect(roleContext.availableRoles).toContain(roleContext.defaultRole);
      expect(user?.roles).toContain(user?.activeRoleContext ?? 'RegularUser');
    }
  });

  it('enforces at most one active session per user in fixture data', () => {
    const activeSessions = sprint01Fixtures.sessions.filter((session) => session.status === 'active');
    const activeUserIds = activeSessions.map((session) => session.userId);
    const uniqueActiveUserIds = new Set(activeUserIds);

    expect(uniqueActiveUserIds.size).toBe(activeUserIds.length);
  });

  it('includes Sprint-03 replaced and expired session fixtures for transition scenarios', () => {
    const sessionIds = new Set(sprint01Fixtures.sessions.map((session) => session.sessionId));
    const sessionStatuses = new Set(sprint01Fixtures.sessions.map((session) => session.status));

    expect(sessionIds.has('s-regular-1-replaced-closed')).toBe(true);
    expect(sessionIds.has('s-admin-1-expired')).toBe(true);
    expect(sessionStatuses).toEqual(new Set(['active', 'closed', 'expired']));
  });

  it('ensures interactions reference known users, venues, and sessions', () => {
    const userIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const venueIds = new Set(sprint01Fixtures.venues.map((venue) => venue.venueId));
    const sessionIds = new Set(sprint01Fixtures.sessions.map((session) => session.sessionId));

    for (const interaction of sprint01Fixtures.interactions) {
      expect(userIds.has(interaction.actorUserId)).toBe(true);
      expect(userIds.has(interaction.targetUserId)).toBe(true);
      expect(venueIds.has(interaction.venueId)).toBe(true);
      expect(sessionIds.has(interaction.actorSessionId)).toBe(true);
      expect(sessionIds.has(interaction.targetSessionId)).toBe(true);
      expect(interaction.actorUserId).not.toBe(interaction.targetUserId);
    }
  });
});
