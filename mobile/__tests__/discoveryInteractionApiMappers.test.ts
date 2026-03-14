import {
  API_V1_DISCOVERY_ENDPOINTS,
  API_V1_INTERACTION_ENDPOINTS,
  mapDiscoveryFeedRequestToApiV1,
  mapDiscoveryFeedResponseFromApiV1,
  mapDiscoverySkipRequestToApiV1,
  mapInteractionRequestToApiV1,
  mapInteractionResponseFromApiV1,
} from '../src/contracts';

describe('discovery and interaction api v1 contract mappers', () => {
  it('maps discovery feed request to api v1 snake_case payload', () => {
    expect(mapDiscoveryFeedRequestToApiV1()).toEqual({});

    expect(
      mapDiscoveryFeedRequestToApiV1({
        pageSize: 20,
        cursor: 'cursor_2',
      })
    ).toEqual({
      page_size: 20,
      cursor: 'cursor_2',
    });
  });

  it('maps discovery feed response to internal discovery candidates', () => {
    const mapped = mapDiscoveryFeedResponseFromApiV1(
      {
        candidates: [
          {
            user_id: 'u_2',
            display_name: 'Dana',
            age: 29,
            photos: ['https://example/photo.jpg'],
            bio: 'Hello',
          },
        ],
        next_cursor: 'cursor_3',
      },
      {
        venueId: 'v_1',
        genderByUserId: {
          u_2: 'female',
        },
      }
    );

    expect(mapped).toEqual({
      candidates: [
        {
          userId: 'u_2',
          displayName: 'Dana',
          age: 29,
          gender: 'female',
          profilePhotoUrl: 'https://example/photo.jpg',
          venueId: 'v_1',
        },
      ],
      nextCursor: 'cursor_3',
    });
  });

  it('maps skip and interaction requests to api v1 payloads', () => {
    expect(mapDiscoverySkipRequestToApiV1('u_99')).toEqual({
      target_user_id: 'u_99',
    });

    expect(
      mapInteractionRequestToApiV1({
        targetUserId: 'u_77',
        venueId: 'v_9',
        idempotencyKey: 'idem-1',
      })
    ).toEqual({
      target_user_id: 'u_77',
      venue_id: 'v_9',
    });
  });

  it('maps interaction response to internal interaction result contract', () => {
    const mapped = mapInteractionResponseFromApiV1(
      {
        status: 'SUCCESS',
        interaction: 'LIKE',
        match_created: true,
        match_id: 'm_123',
      },
      {
        targetUserId: 'u_55',
        venueId: 'v_4',
        idempotencyKey: 'idem-5',
      },
      {
        interactionId: 'interaction-123',
      }
    );

    expect(mapped).toEqual({
      status: 'SUCCESS',
      interaction: 'LIKE',
      interactionId: 'interaction-123',
      targetUserId: 'u_55',
      venueId: 'v_4',
      idempotencyKey: 'idem-5',
      decision: 'created',
      duplicateScope: 'actor_target_venue_session',
      matchCreated: true,
      matchId: 'm_123',
    });
  });

  it('exposes stable endpoint constants for phase-2 adapter wiring', () => {
    expect(API_V1_DISCOVERY_ENDPOINTS).toEqual({
      feed: '/api/v1/discovery/feed',
      skip: '/api/v1/discovery/skip',
    });

    expect(API_V1_INTERACTION_ENDPOINTS).toEqual({
      like: '/api/v1/interactions/like',
      pass: '/api/v1/interactions/pass',
    });
  });
});
