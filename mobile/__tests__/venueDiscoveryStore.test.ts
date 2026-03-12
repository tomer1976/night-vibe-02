import { VenueSummary } from '../src/contracts';
import {
  createInitialVenueDiscoveryStoreState,
  selectVisibleVenues,
  venueDiscoveryStoreReducer,
} from '../src/state/venueDiscoveryStore';

const baseVenues: VenueSummary[] = [
  {
    venueId: 'v-halo-club',
    name: 'Halo Club',
    distanceKm: 1.06,
    category: 'club',
    status: 'active',
    activitySnapshot: {
      checkinCount: 2,
      liveStatus: 'busy',
    },
  },
  {
    venueId: 'v-luna-lounge',
    name: 'Luna Lounge',
    distanceKm: 1.35,
    category: 'lounge',
    status: 'active',
    activitySnapshot: {
      checkinCount: 0,
      liveStatus: 'calm',
    },
  },
  {
    venueId: 'v-amber-bar',
    name: 'Amber Bar',
    distanceKm: 0.9,
    category: 'bar',
    status: 'active',
    activitySnapshot: {
      checkinCount: 1,
      liveStatus: 'steady',
    },
  },
];

describe('venueDiscoveryStore', () => {
  it('starts with empty cache and default filter/sort values', () => {
    const initialState = createInitialVenueDiscoveryStoreState();

    expect(initialState.cachedVenues).toEqual([]);
    expect(initialState.filters.categories).toEqual([]);
    expect(initialState.filters.statuses).toEqual([]);
    expect(initialState.filters.liveStatuses).toEqual([]);
    expect(initialState.filters.maxDistanceKm).toBeNull();
    expect(initialState.sortMode).toBe('distance_then_activity');
    expect(initialState.lastFetchedAt).toBeNull();
  });

  it('caches venues and records fetch timestamp', () => {
    const initialState = createInitialVenueDiscoveryStoreState();

    const nextState = venueDiscoveryStoreReducer(initialState, {
      type: 'SET_CACHED_VENUES',
      venues: baseVenues,
      fetchedAt: '2026-03-12T20:00:00.000Z',
    });

    expect(nextState.cachedVenues).toEqual(baseVenues);
    expect(nextState.lastFetchedAt).toBe('2026-03-12T20:00:00.000Z');
  });

  it('applies filters to derived visible venues', () => {
    const initialState = createInitialVenueDiscoveryStoreState();
    const cachedState = venueDiscoveryStoreReducer(initialState, {
      type: 'SET_CACHED_VENUES',
      venues: baseVenues,
      fetchedAt: '2026-03-12T20:05:00.000Z',
    });

    const filteredState = venueDiscoveryStoreReducer(cachedState, {
      type: 'SET_FILTERS',
      filters: {
        categories: ['club', 'club'],
        liveStatuses: ['busy'],
        maxDistanceKm: 1.1,
      },
    });

    const visible = selectVisibleVenues(filteredState);

    expect(visible.map((venue) => venue.venueId)).toEqual(['v-halo-club']);
    expect(filteredState.filters.categories).toEqual(['club']);
  });

  it('sorts by activity first when configured', () => {
    const initialState = createInitialVenueDiscoveryStoreState();
    const cachedState = venueDiscoveryStoreReducer(initialState, {
      type: 'SET_CACHED_VENUES',
      venues: baseVenues,
      fetchedAt: '2026-03-12T20:10:00.000Z',
    });

    const sortedState = venueDiscoveryStoreReducer(cachedState, {
      type: 'SET_SORT_MODE',
      sortMode: 'activity_then_distance',
    });

    const visible = selectVisibleVenues(sortedState);

    expect(visible.map((venue) => venue.venueId)).toEqual(['v-halo-club', 'v-amber-bar', 'v-luna-lounge']);
  });

  it('clears cache while preserving filter and sort preferences', () => {
    const initialState = createInitialVenueDiscoveryStoreState();
    const cachedState = venueDiscoveryStoreReducer(initialState, {
      type: 'SET_CACHED_VENUES',
      venues: baseVenues,
      fetchedAt: '2026-03-12T20:12:00.000Z',
    });

    const configuredState = venueDiscoveryStoreReducer(cachedState, {
      type: 'SET_FILTERS',
      filters: {
        statuses: ['active'],
      },
    });

    const clearedState = venueDiscoveryStoreReducer(configuredState, { type: 'CLEAR_CACHE' });

    expect(clearedState.cachedVenues).toEqual([]);
    expect(clearedState.lastFetchedAt).toBeNull();
    expect(clearedState.filters.statuses).toEqual(['active']);
    expect(clearedState.sortMode).toBe('distance_then_activity');
  });
});
