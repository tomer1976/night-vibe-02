import { sprint01Fixtures } from '../src/mocks';

describe('sprint01 fixtures', () => {
  it('provides deterministic fixture counts', () => {
    expect(sprint01Fixtures.users).toHaveLength(4);
    expect(sprint01Fixtures.roleContexts).toHaveLength(4);
    expect(sprint01Fixtures.venues).toHaveLength(3);
    expect(sprint01Fixtures.sessions).toHaveLength(4);
    expect(sprint01Fixtures.interactions).toHaveLength(3);
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
