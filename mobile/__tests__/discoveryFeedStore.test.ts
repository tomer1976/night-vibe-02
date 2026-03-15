import { DiscoveryCandidate } from '../src/contracts';
import {
  createInitialDiscoveryFeedStoreState,
  discoveryFeedStoreReducer,
  selectDiscoveryCandidateVisibilityReason,
  selectDiscoveryCandidateVisibilityReasonsByUserId,
  selectVisibleDiscoveryCandidates,
} from '../src/state/discoveryFeedStore';

const baseCandidates: DiscoveryCandidate[] = [
  {
    userId: 'u-1',
    displayName: 'Ari',
    age: 24,
    gender: 'female',
    profilePhotoUrl: 'mock://user-photo/ari',
    venueId: 'v-halo-club',
  },
  {
    userId: 'u-2',
    displayName: 'Blake',
    age: 31,
    gender: 'male',
    profilePhotoUrl: 'mock://user-photo/blake',
    venueId: 'v-halo-club',
  },
  {
    userId: 'u-3',
    displayName: 'Cleo',
    age: 27,
    gender: 'non_binary',
    profilePhotoUrl: 'mock://user-photo/cleo',
    venueId: 'v-luna-lounge',
  },
];

describe('discoveryFeedStore', () => {
  it('starts with empty cache, defaults, and pagination state', () => {
    const state = createInitialDiscoveryFeedStoreState();

    expect(state.cachedCandidates).toEqual([]);
    expect(state.filters.venueId).toBeNull();
    expect(state.filters.genders).toEqual([]);
    expect(state.filters.minAge).toBeNull();
    expect(state.filters.maxAge).toBeNull();
    expect(state.filters.excludedUserIds).toEqual([]);
    expect(state.pagination.pageSize).toBe(2);
    expect(state.pagination.nextCursor).toBeUndefined();
    expect(state.pagination.isExhausted).toBe(false);
    expect(state.pagination.requestedCursors).toEqual([]);
  });

  it('appends pages, dedupes candidates, and tracks next cursor exhaustion', () => {
    const initial = createInitialDiscoveryFeedStoreState();

    const firstPageState = discoveryFeedStoreReducer(initial, {
      type: 'APPEND_PAGE',
      candidates: [baseCandidates[0], baseCandidates[1]],
      requestedCursor: '0',
      nextCursor: '2',
      fetchedAt: '2026-03-15T21:00:00.000Z',
    });

    const secondPageState = discoveryFeedStoreReducer(firstPageState, {
      type: 'APPEND_PAGE',
      candidates: [baseCandidates[1], baseCandidates[2]],
      requestedCursor: '2',
      nextCursor: undefined,
      fetchedAt: '2026-03-15T21:01:00.000Z',
    });

    expect(secondPageState.cachedCandidates.map((candidate) => candidate.userId)).toEqual(['u-1', 'u-2', 'u-3']);
    expect(secondPageState.pagination.requestedCursors).toEqual(['0', '2']);
    expect(secondPageState.pagination.nextCursor).toBeUndefined();
    expect(secondPageState.pagination.isExhausted).toBe(true);
    expect(secondPageState.lastFetchedAt).toBe('2026-03-15T21:01:00.000Z');
  });

  it('applies venue and age/gender filters to visible candidates', () => {
    const initial = createInitialDiscoveryFeedStoreState();
    const cached = discoveryFeedStoreReducer(initial, {
      type: 'APPEND_PAGE',
      candidates: baseCandidates,
      requestedCursor: '0',
      nextCursor: undefined,
      fetchedAt: '2026-03-15T21:02:00.000Z',
    });

    const filtered = discoveryFeedStoreReducer(cached, {
      type: 'SET_FILTERS',
      filters: {
        venueId: 'v-halo-club',
        genders: ['female', 'female'],
        minAge: 18,
        maxAge: 29,
      },
    });

    const visible = selectVisibleDiscoveryCandidates(filtered);

    expect(visible.map((candidate) => candidate.userId)).toEqual(['u-1']);
    expect(filtered.filters.genders).toEqual(['female']);
  });

  it('resets feed while preserving configured filters and page size', () => {
    const initial = createInitialDiscoveryFeedStoreState();
    const withFilters = discoveryFeedStoreReducer(initial, {
      type: 'SET_FILTERS',
      filters: {
        venueId: 'v-halo-club',
        excludedUserIds: ['u-2'],
      },
    });
    const withPageSize = discoveryFeedStoreReducer(withFilters, {
      type: 'SET_PAGE_SIZE',
      pageSize: 4,
    });
    const withFeed = discoveryFeedStoreReducer(withPageSize, {
      type: 'APPEND_PAGE',
      candidates: baseCandidates,
      requestedCursor: '0',
      nextCursor: '3',
      fetchedAt: '2026-03-15T21:03:00.000Z',
    });

    const reset = discoveryFeedStoreReducer(withFeed, { type: 'RESET_FEED' });

    expect(reset.cachedCandidates).toEqual([]);
    expect(reset.pagination.pageSize).toBe(4);
    expect(reset.pagination.requestedCursors).toEqual([]);
    expect(reset.filters.venueId).toBe('v-halo-club');
    expect(reset.filters.excludedUserIds).toEqual(['u-2']);
  });

  it('returns explicit visibility reason per candidate', () => {
    const initial = createInitialDiscoveryFeedStoreState();
    const withCache = discoveryFeedStoreReducer(initial, {
      type: 'APPEND_PAGE',
      candidates: baseCandidates,
      requestedCursor: '0',
      nextCursor: undefined,
      fetchedAt: '2026-03-15T21:04:00.000Z',
    });
    const withFilters = discoveryFeedStoreReducer(withCache, {
      type: 'SET_FILTERS',
      filters: {
        venueId: 'v-halo-club',
        genders: ['female'],
        minAge: 18,
        maxAge: 29,
        excludedUserIds: ['u-1'],
      },
    });

    expect(selectDiscoveryCandidateVisibilityReason(withFilters, baseCandidates[0]).code).toBe('excluded_user');
    expect(selectDiscoveryCandidateVisibilityReason(withFilters, baseCandidates[1]).code).toBe('gender_filtered');
    expect(selectDiscoveryCandidateVisibilityReason(withFilters, baseCandidates[2]).code).toBe('venue_mismatch');
  });

  it('builds visibility reason map keyed by user id', () => {
    const initial = createInitialDiscoveryFeedStoreState();
    const withCache = discoveryFeedStoreReducer(initial, {
      type: 'APPEND_PAGE',
      candidates: baseCandidates,
      requestedCursor: '0',
      nextCursor: undefined,
      fetchedAt: '2026-03-15T21:05:00.000Z',
    });

    const reasonMap = selectDiscoveryCandidateVisibilityReasonsByUserId(withCache);

    expect(Object.keys(reasonMap).sort()).toEqual(['u-1', 'u-2', 'u-3']);
    expect(reasonMap['u-1'].code).toBe('visible');
  });
});