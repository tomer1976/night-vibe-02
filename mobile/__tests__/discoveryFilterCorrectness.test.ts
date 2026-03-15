import {
  sprint03VenuePresenceParticipants,
  sprint04DiscoveryBlockSkipFixtures,
  sprint04PreferenceCompatibilityFixtures,
} from '../src/mocks';
import {
  createInitialDiscoveryFeedStoreState,
  discoveryFeedStoreReducer,
  selectDiscoveryCandidateVisibilityReason,
  selectVisibleDiscoveryCandidates,
} from '../src/state/discoveryFeedStore';

const haloFixtureCandidates = sprint03VenuePresenceParticipants
  .filter((participant) => participant.venueId === 'v-halo-club' && participant.visibility === 'visible')
  .map((participant) => ({
    userId: participant.userId,
    displayName: participant.displayName,
    age: participant.age,
    gender: participant.gender,
    profilePhotoUrl: participant.profilePhotoUrl,
    venueId: participant.venueId,
  }));

describe('discovery filter correctness', () => {
  it('applies preference age and gender filters using Sprint-04 compatibility fixtures', () => {
    const compatibilityFixture = sprint04PreferenceCompatibilityFixtures.find(
      (fixture) => fixture.fixtureId === 's4-pref-regular-owner-gender-mismatch'
    );

    expect(compatibilityFixture).toBeDefined();

    if (!compatibilityFixture) {
      return;
    }

    const withFeed = discoveryFeedStoreReducer(createInitialDiscoveryFeedStoreState(), {
      type: 'APPEND_PAGE',
      candidates: haloFixtureCandidates,
      requestedCursor: '0',
      nextCursor: undefined,
      fetchedAt: '2026-03-15T21:30:00.000Z',
    });

    const withPreferenceFilters = discoveryFeedStoreReducer(withFeed, {
      type: 'SET_FILTERS',
      filters: {
        venueId: compatibilityFixture.venueId,
        minAge: compatibilityFixture.viewerPreference.preferredAgeMin,
        maxAge: compatibilityFixture.viewerPreference.preferredAgeMax,
        genders: [...compatibilityFixture.viewerPreference.preferredGenders],
      },
    });

    const visibleUserIds = selectVisibleDiscoveryCandidates(withPreferenceFilters).map((candidate) => candidate.userId);

    expect(visibleUserIds).toEqual(['u-persona-active-1']);

    const ownerCandidate = haloFixtureCandidates.find((candidate) => candidate.userId === 'u-owner-1');
    expect(ownerCandidate).toBeDefined();

    if (!ownerCandidate) {
      return;
    }

    expect(selectDiscoveryCandidateVisibilityReason(withPreferenceFilters, ownerCandidate).code).toBe('gender_filtered');
  });

  it('applies block and skip exclusions using Sprint-04 block/skip fixtures', () => {
    const blockSkipFixture = sprint04DiscoveryBlockSkipFixtures.find(
      (fixture) => fixture.fixtureId === 's4-blockskip-regular-halo'
    );

    expect(blockSkipFixture).toBeDefined();

    if (!blockSkipFixture) {
      return;
    }

    const withFeed = discoveryFeedStoreReducer(createInitialDiscoveryFeedStoreState(), {
      type: 'APPEND_PAGE',
      candidates: haloFixtureCandidates,
      requestedCursor: '0',
      nextCursor: undefined,
      fetchedAt: '2026-03-15T21:31:00.000Z',
    });

    const withBlockSkipFilters = discoveryFeedStoreReducer(withFeed, {
      type: 'SET_FILTERS',
      filters: {
        venueId: blockSkipFixture.venueId,
        excludedUserIds: [...blockSkipFixture.expectedExcludedUserIds],
      },
    });

    const visibleUserIds = selectVisibleDiscoveryCandidates(withBlockSkipFilters).map((candidate) => candidate.userId);

    expect(visibleUserIds).toEqual([]);

    for (const excludedUserId of blockSkipFixture.expectedExcludedUserIds) {
      const candidate = haloFixtureCandidates.find((entry) => entry.userId === excludedUserId);
      expect(candidate).toBeDefined();

      if (!candidate) {
        continue;
      }

      expect(selectDiscoveryCandidateVisibilityReason(withBlockSkipFilters, candidate).code).toBe('excluded_user');
    }
  });
});