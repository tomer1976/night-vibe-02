import { DiscoveryCandidate } from '../contracts';

export type DiscoveryFeedFilters = {
  venueId: string | null;
  genders: DiscoveryCandidate['gender'][];
  minAge: number | null;
  maxAge: number | null;
  excludedUserIds: string[];
};

export type DiscoveryFeedPagination = {
  pageSize: number;
  nextCursor?: string;
  isExhausted: boolean;
  requestedCursors: string[];
};

export type DiscoveryFeedStoreState = {
  cachedCandidates: DiscoveryCandidate[];
  filters: DiscoveryFeedFilters;
  pagination: DiscoveryFeedPagination;
  lastFetchedAt: string | null;
};

export type DiscoveryFeedStoreAction =
  | {
      type: 'RESET_FEED';
    }
  | {
      type: 'SET_FILTERS';
      filters: Partial<DiscoveryFeedFilters>;
    }
  | {
      type: 'RESET_FILTERS';
    }
  | {
      type: 'SET_PAGE_SIZE';
      pageSize: number;
    }
  | {
      type: 'APPEND_PAGE';
      candidates: DiscoveryCandidate[];
      requestedCursor?: string;
      nextCursor?: string;
      fetchedAt?: string;
    };

function normalizeNullableAge(value: number | null | undefined): number | null {
  if (typeof value === 'undefined' || value === null) {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(18, Math.trunc(value));
}

function normalizePageSize(pageSize: number) {
  if (!Number.isFinite(pageSize)) {
    return 1;
  }

  return Math.max(1, Math.trunc(pageSize));
}

function toUniqueList<T extends string>(items: T[]): T[] {
  return items.filter((item, index) => items.indexOf(item) === index);
}

function dedupeCandidatesByUserId(candidates: DiscoveryCandidate[]): DiscoveryCandidate[] {
  const byUserId = new Map<string, DiscoveryCandidate>();

  for (const candidate of candidates) {
    if (!byUserId.has(candidate.userId)) {
      byUserId.set(candidate.userId, candidate);
    }
  }

  return [...byUserId.values()];
}

export function createInitialDiscoveryFeedFilters(): DiscoveryFeedFilters {
  return {
    venueId: null,
    genders: [],
    minAge: null,
    maxAge: null,
    excludedUserIds: [],
  };
}

export function createInitialDiscoveryFeedStoreState(): DiscoveryFeedStoreState {
  return {
    cachedCandidates: [],
    filters: createInitialDiscoveryFeedFilters(),
    pagination: {
      pageSize: 2,
      nextCursor: undefined,
      isExhausted: false,
      requestedCursors: [],
    },
    lastFetchedAt: null,
  };
}

export function selectVisibleDiscoveryCandidates(state: DiscoveryFeedStoreState): DiscoveryCandidate[] {
  return state.cachedCandidates.filter((candidate) => {
    const venueMatch = state.filters.venueId === null || candidate.venueId === state.filters.venueId;
    const genderMatch = state.filters.genders.length === 0 || state.filters.genders.includes(candidate.gender);
    const minAgeMatch = state.filters.minAge === null || candidate.age >= state.filters.minAge;
    const maxAgeMatch = state.filters.maxAge === null || candidate.age <= state.filters.maxAge;
    const excludedMatch = !state.filters.excludedUserIds.includes(candidate.userId);

    return venueMatch && genderMatch && minAgeMatch && maxAgeMatch && excludedMatch;
  });
}

export function discoveryFeedStoreReducer(
  state: DiscoveryFeedStoreState,
  action: DiscoveryFeedStoreAction,
): DiscoveryFeedStoreState {
  switch (action.type) {
    case 'RESET_FEED': {
      if (state.cachedCandidates.length === 0 && state.lastFetchedAt === null && state.pagination.requestedCursors.length === 0) {
        return state;
      }

      return {
        ...state,
        cachedCandidates: [],
        pagination: {
          ...state.pagination,
          nextCursor: undefined,
          isExhausted: false,
          requestedCursors: [],
        },
        lastFetchedAt: null,
      };
    }

    case 'SET_FILTERS': {
      const genders = action.filters.genders ? toUniqueList(action.filters.genders) : state.filters.genders;
      const excludedUserIds = action.filters.excludedUserIds
        ? toUniqueList(action.filters.excludedUserIds)
        : state.filters.excludedUserIds;
      const minAge =
        typeof action.filters.minAge === 'undefined' ? state.filters.minAge : normalizeNullableAge(action.filters.minAge);
      const maxAge =
        typeof action.filters.maxAge === 'undefined' ? state.filters.maxAge : normalizeNullableAge(action.filters.maxAge);

      return {
        ...state,
        filters: {
          venueId: typeof action.filters.venueId === 'undefined' ? state.filters.venueId : action.filters.venueId,
          genders,
          minAge,
          maxAge,
          excludedUserIds,
        },
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        filters: createInitialDiscoveryFeedFilters(),
      };
    }

    case 'SET_PAGE_SIZE': {
      const nextPageSize = normalizePageSize(action.pageSize);

      if (nextPageSize === state.pagination.pageSize) {
        return state;
      }

      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: nextPageSize,
        },
      };
    }

    case 'APPEND_PAGE': {
      const mergedCandidates = dedupeCandidatesByUserId([...state.cachedCandidates, ...action.candidates]);
      const requestedCursors = action.requestedCursor
        ? toUniqueList([...state.pagination.requestedCursors, action.requestedCursor])
        : state.pagination.requestedCursors;

      return {
        ...state,
        cachedCandidates: mergedCandidates,
        pagination: {
          ...state.pagination,
          nextCursor: action.nextCursor,
          isExhausted: typeof action.nextCursor === 'undefined',
          requestedCursors,
        },
        lastFetchedAt: action.fetchedAt ?? new Date().toISOString(),
      };
    }

    default:
      return state;
  }
}