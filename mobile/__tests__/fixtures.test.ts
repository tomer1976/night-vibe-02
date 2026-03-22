import {
  createSprint04DeterministicPaginationCursor,
  sprint01Fixtures,
  sprint02AuthPersonaFixtures,
  sprint04DiscoveryBlockSkipFixtures,
  sprint04MatchLifecycleFixtures,
  sprint04PaginationCursorFixtures,
  sprint02PhotoFixtures,
  sprint02ProfileFixtures,
  sprint03DiscoveryCoordinates,
  sprint03VenuePresenceParticipants,
  sprint03VenueDistanceOutputs,
  sprint04PreferenceCompatibilityFixtures,
  sprint04ReciprocalLikeScenarioFixtures,
  sprint04VenueSessionCandidateFixtures,
  sprint05TypingIndicatorScenarioFixtures,
  sprint05SafetyBlockFixtures,
  sprint05SafetyReportFixtures,
  sprint05ModerationOutcomePlaceholderFixtures,
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

  it('includes Sprint-04 candidate fixture datasets partitioned by venue and session context', () => {
    expect(sprint04VenueSessionCandidateFixtures.length).toBeGreaterThanOrEqual(4);

    const partitionKeys = new Set(
      sprint04VenueSessionCandidateFixtures.map((partition) => `${partition.venueId}:${partition.sessionStatus}`)
    );

    expect(partitionKeys.size).toBe(sprint04VenueSessionCandidateFixtures.length);
    expect(partitionKeys.has('v-halo-club:active')).toBe(true);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const fixtureVenueIds = new Set(sprint01Fixtures.venues.map((venue) => venue.venueId));

    for (const partition of sprint04VenueSessionCandidateFixtures) {
      expect(fixtureVenueIds.has(partition.venueId)).toBe(true);

      for (const participant of partition.participants) {
        expect(participant.venueId).toBe(partition.venueId);
        expect(fixtureUserIds.has(participant.userId)).toBe(true);
      }
    }
  });

  it('includes Sprint-04 preference compatibility fixture matrix coverage', () => {
    expect(sprint04PreferenceCompatibilityFixtures.length).toBeGreaterThanOrEqual(3);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const fixtureVenueIds = new Set(sprint01Fixtures.venues.map((venue) => venue.venueId));

    const hasEligibleEntry = sprint04PreferenceCompatibilityFixtures.some((fixture) => fixture.compatibility.eligibleForDiscovery);
    const hasIneligibleEntry = sprint04PreferenceCompatibilityFixtures.some((fixture) => !fixture.compatibility.eligibleForDiscovery);

    expect(hasEligibleEntry).toBe(true);
    expect(hasIneligibleEntry).toBe(true);

    for (const fixture of sprint04PreferenceCompatibilityFixtures) {
      expect(fixtureVenueIds.has(fixture.venueId)).toBe(true);
      expect(fixtureUserIds.has(fixture.viewerUserId)).toBe(true);
      expect(fixtureUserIds.has(fixture.targetUserId)).toBe(true);
      expect(fixture.viewerUserId).not.toBe(fixture.targetUserId);
      expect(fixture.viewerPreference.preferredAgeMin).toBeGreaterThanOrEqual(18);
      expect(fixture.viewerPreference.preferredAgeMax).toBeGreaterThanOrEqual(fixture.viewerPreference.preferredAgeMin);
      expect(fixture.targetPreference.preferredAgeMin).toBeGreaterThanOrEqual(18);
      expect(fixture.targetPreference.preferredAgeMax).toBeGreaterThanOrEqual(fixture.targetPreference.preferredAgeMin);
      expect(fixture.compatibility.reasons.length).toBeGreaterThan(0);
    }
  });

  it('includes Sprint-04 block and skip fixture states for filtering coverage', () => {
    expect(sprint04DiscoveryBlockSkipFixtures.length).toBeGreaterThanOrEqual(2);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const fixtureVenueIds = new Set(sprint01Fixtures.venues.map((venue) => venue.venueId));

    for (const fixture of sprint04DiscoveryBlockSkipFixtures) {
      expect(fixtureVenueIds.has(fixture.venueId)).toBe(true);
      expect(fixtureUserIds.has(fixture.viewerUserId)).toBe(true);
      expect(fixture.expectedExcludedUserIds.length).toBeGreaterThan(0);

      for (const excludedUserId of fixture.expectedExcludedUserIds) {
        expect(fixtureUserIds.has(excludedUserId)).toBe(true);
        const isBlocked = fixture.blockedUserIds.includes(excludedUserId);
        const isSkipped = fixture.skippedUserIds.includes(excludedUserId);
        expect(isBlocked || isSkipped).toBe(true);
      }
    }
  });

  it('includes Sprint-04 reciprocal-like scenario fixture packs', () => {
    expect(sprint04ReciprocalLikeScenarioFixtures.length).toBeGreaterThanOrEqual(3);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const fixtureVenueIds = new Set(sprint01Fixtures.venues.map((venue) => venue.venueId));

    const hasReciprocalMatchScenario = sprint04ReciprocalLikeScenarioFixtures.some(
      (fixture) => fixture.expectedMatchCreated
    );
    const hasNoMatchScenario = sprint04ReciprocalLikeScenarioFixtures.some(
      (fixture) => !fixture.expectedMatchCreated
    );

    expect(hasReciprocalMatchScenario).toBe(true);
    expect(hasNoMatchScenario).toBe(true);

    for (const fixture of sprint04ReciprocalLikeScenarioFixtures) {
      expect(fixtureVenueIds.has(fixture.venueId)).toBe(true);
      expect(fixtureUserIds.has(fixture.actorUserId)).toBe(true);
      expect(fixtureUserIds.has(fixture.targetUserId)).toBe(true);
      expect(fixture.actorUserId).not.toBe(fixture.targetUserId);

      if (fixture.expectedMatchCreated) {
        expect(fixture.targetLikeAt).toBeDefined();
        expect(fixture.expectedMatchId).toBeDefined();
      }
    }
  });

  it('includes Sprint-04 match lifecycle fixtures across matched, expired, and blocked states', () => {
    expect(sprint04MatchLifecycleFixtures.length).toBeGreaterThanOrEqual(3);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const states = new Set(sprint04MatchLifecycleFixtures.map((fixture) => fixture.status));

    expect(states).toEqual(new Set(['matched', 'expired', 'blocked']));

    for (const fixture of sprint04MatchLifecycleFixtures) {
      expect(fixture.matchId.startsWith('match-')).toBe(true);
      expect(fixture.users).toHaveLength(2);
      expect(fixture.users[0]).not.toBe(fixture.users[1]);
      expect(fixtureUserIds.has(fixture.users[0])).toBe(true);
      expect(fixtureUserIds.has(fixture.users[1])).toBe(true);
    }
  });

  it('generates deterministic Sprint-04 pagination cursor fixtures', () => {
    expect(sprint04PaginationCursorFixtures.length).toBeGreaterThanOrEqual(3);

    for (const fixture of sprint04PaginationCursorFixtures) {
      expect(fixture.expectedCursor).toBe(
        createSprint04DeterministicPaginationCursor(fixture.partitionId, fixture.startOffset, fixture.pageSize)
      );
    }

    expect(createSprint04DeterministicPaginationCursor('s4-v-halo-club-active', 0, 2)).toBe('s4:s4-v-halo-club-active:0:2');
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

  it('includes Sprint-05 typing indicator timeout scenarios for active, blocked, and expired states', () => {
    expect(sprint05TypingIndicatorScenarioFixtures.length).toBeGreaterThanOrEqual(4);

    const startScenarioStatuses = new Set(
      sprint05TypingIndicatorScenarioFixtures
        .filter((fixture) => fixture.typing)
        .map((fixture) => fixture.threadStatus)
    );

    expect(startScenarioStatuses).toEqual(new Set(['active', 'expired', 'blocked']));

    const hasImmediateStopScenario = sprint05TypingIndicatorScenarioFixtures.some(
      (fixture) => !fixture.typing && fixture.threadStatus === 'any' && fixture.timeoutMs === 0
    );

    expect(hasImmediateStopScenario).toBe(true);

    for (const scenario of sprint05TypingIndicatorScenarioFixtures) {
      expect(scenario.timeoutMs).toBeGreaterThanOrEqual(0);
      expect(scenario.timeoutMs).toBe(scenario.expectedExpiresInMs);
    }
  });

  it('includes Sprint-05 block fixtures with immediate chat and discovery revocation flags', () => {
    expect(sprint05SafetyBlockFixtures.length).toBeGreaterThanOrEqual(2);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));

    for (const fixture of sprint05SafetyBlockFixtures) {
      expect(fixtureUserIds.has(fixture.actorUserId)).toBe(true);
      expect(fixtureUserIds.has(fixture.targetUserId)).toBe(true);
      expect(fixture.actorUserId).not.toBe(fixture.targetUserId);
      expect(fixture.chatAccessRevoked).toBe(true);
      expect(fixture.discoveryVisibilityRevoked).toBe(true);
    }
  });

  it('includes Sprint-05 report fixtures with pending and resolved moderation linkage coverage', () => {
    expect(sprint05SafetyReportFixtures.length).toBeGreaterThanOrEqual(2);

    const fixtureUserIds = new Set(sprint01Fixtures.users.map((user) => user.uid));
    const statuses = new Set(sprint05SafetyReportFixtures.map((fixture) => fixture.status));

    expect(statuses).toEqual(new Set(['pending', 'resolved']));

    for (const fixture of sprint05SafetyReportFixtures) {
      expect(fixtureUserIds.has(fixture.reporterUserId)).toBe(true);
      expect(fixtureUserIds.has(fixture.reportedUserId)).toBe(true);
      expect(fixture.reporterUserId).not.toBe(fixture.reportedUserId);
      expect(fixture.reason.length).toBeGreaterThan(0);
      if (fixture.status === 'resolved') {
        expect(fixture.moderationOutcomeId).toBeDefined();
      }
    }
  });

  it('includes Sprint-05 moderation outcome placeholders for all action categories', () => {
    expect(sprint05ModerationOutcomePlaceholderFixtures.length).toBeGreaterThanOrEqual(4);

    const reportIds = new Set(sprint05SafetyReportFixtures.map((fixture) => fixture.reportId));
    const actions = new Set(sprint05ModerationOutcomePlaceholderFixtures.map((fixture) => fixture.action));
    const linkedToKnownReport = sprint05ModerationOutcomePlaceholderFixtures.some((fixture) => reportIds.has(fixture.reportId));

    expect(actions).toEqual(new Set(['warning', 'suspension', 'ban', 'no_action']));
    expect(linkedToKnownReport).toBe(true);

    for (const fixture of sprint05ModerationOutcomePlaceholderFixtures) {
      if (fixture.status === 'resolved') {
        expect(fixture.resolvedAt).toBeDefined();
      }
      expect(fixture.resolutionSummary.length).toBeGreaterThan(0);
    }
  });
});
