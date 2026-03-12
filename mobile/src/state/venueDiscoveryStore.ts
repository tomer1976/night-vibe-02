import { VenueSummary } from '../contracts';

export type VenueDiscoverySortMode = 'distance_then_activity' | 'activity_then_distance';

export type VenueDiscoveryFilters = {
  categories: VenueSummary['category'][];
  statuses: VenueSummary['status'][];
  liveStatuses: VenueSummary['activitySnapshot']['liveStatus'][];
  maxDistanceKm: number | null;
};

export type VenueDiscoveryStoreState = {
  cachedVenues: VenueSummary[];
  filters: VenueDiscoveryFilters;
  sortMode: VenueDiscoverySortMode;
  lastFetchedAt: string | null;
};

export type VenueDiscoveryStoreAction =
  | { type: 'SET_CACHED_VENUES'; venues: VenueSummary[]; fetchedAt?: string }
  | { type: 'SET_FILTERS'; filters: Partial<VenueDiscoveryFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_SORT_MODE'; sortMode: VenueDiscoverySortMode }
  | { type: 'CLEAR_CACHE' };

function toUniqueList<T extends string>(items: T[]): T[] {
  return items.filter((item, index) => items.indexOf(item) === index);
}

function normalizeDistance(distance: number | null | undefined): number | null {
  if (distance === null || typeof distance === 'undefined') {
    return null;
  }

  if (!Number.isFinite(distance) || distance < 0) {
    return null;
  }

  return Number(distance.toFixed(2));
}

export function createInitialVenueDiscoveryFilters(): VenueDiscoveryFilters {
  return {
    categories: [],
    statuses: [],
    liveStatuses: [],
    maxDistanceKm: null,
  };
}

export function createInitialVenueDiscoveryStoreState(): VenueDiscoveryStoreState {
  return {
    cachedVenues: [],
    filters: createInitialVenueDiscoveryFilters(),
    sortMode: 'distance_then_activity',
    lastFetchedAt: null,
  };
}

function sortByDistanceThenActivity(left: VenueSummary, right: VenueSummary) {
  if (left.distanceKm !== right.distanceKm) {
    return left.distanceKm - right.distanceKm;
  }

  if (left.activitySnapshot.checkinCount !== right.activitySnapshot.checkinCount) {
    return right.activitySnapshot.checkinCount - left.activitySnapshot.checkinCount;
  }

  return left.venueId.localeCompare(right.venueId);
}

function sortByActivityThenDistance(left: VenueSummary, right: VenueSummary) {
  if (left.activitySnapshot.checkinCount !== right.activitySnapshot.checkinCount) {
    return right.activitySnapshot.checkinCount - left.activitySnapshot.checkinCount;
  }

  if (left.distanceKm !== right.distanceKm) {
    return left.distanceKm - right.distanceKm;
  }

  return left.venueId.localeCompare(right.venueId);
}

export function selectVisibleVenues(state: VenueDiscoveryStoreState): VenueSummary[] {
  const filtered = state.cachedVenues.filter((venue) => {
    const categoryMatch = state.filters.categories.length === 0 || state.filters.categories.includes(venue.category);
    const statusMatch = state.filters.statuses.length === 0 || state.filters.statuses.includes(venue.status);
    const liveStatusMatch =
      state.filters.liveStatuses.length === 0 || state.filters.liveStatuses.includes(venue.activitySnapshot.liveStatus);
    const distanceMatch = state.filters.maxDistanceKm === null || venue.distanceKm <= state.filters.maxDistanceKm;

    return categoryMatch && statusMatch && liveStatusMatch && distanceMatch;
  });

  if (state.sortMode === 'activity_then_distance') {
    return [...filtered].sort(sortByActivityThenDistance);
  }

  return [...filtered].sort(sortByDistanceThenActivity);
}

export function venueDiscoveryStoreReducer(
  state: VenueDiscoveryStoreState,
  action: VenueDiscoveryStoreAction,
): VenueDiscoveryStoreState {
  switch (action.type) {
    case 'SET_CACHED_VENUES': {
      return {
        ...state,
        cachedVenues: action.venues,
        lastFetchedAt: action.fetchedAt ?? new Date().toISOString(),
      };
    }

    case 'SET_FILTERS': {
      const categories = action.filters.categories
        ? toUniqueList(action.filters.categories)
        : state.filters.categories;
      const statuses = action.filters.statuses
        ? toUniqueList(action.filters.statuses)
        : state.filters.statuses;
      const liveStatuses = action.filters.liveStatuses
        ? toUniqueList(action.filters.liveStatuses)
        : state.filters.liveStatuses;
      const maxDistanceKm =
        typeof action.filters.maxDistanceKm === 'undefined'
          ? state.filters.maxDistanceKm
          : normalizeDistance(action.filters.maxDistanceKm);

      return {
        ...state,
        filters: {
          categories,
          statuses,
          liveStatuses,
          maxDistanceKm,
        },
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        filters: createInitialVenueDiscoveryFilters(),
      };
    }

    case 'SET_SORT_MODE': {
      if (action.sortMode === state.sortMode) {
        return state;
      }

      return {
        ...state,
        sortMode: action.sortMode,
      };
    }

    case 'CLEAR_CACHE': {
      if (state.cachedVenues.length === 0 && state.lastFetchedAt === null) {
        return state;
      }

      return {
        ...state,
        cachedVenues: [],
        lastFetchedAt: null,
      };
    }

    default:
      return state;
  }
}
