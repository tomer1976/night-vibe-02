import { DiscoveryCandidate, UserGender } from './models';
import { InteractionDecision, InteractionDuplicateScope, InteractionRequest, InteractionResult } from './services';

export const API_V1_DISCOVERY_ENDPOINTS = {
  feed: '/api/v1/discovery/feed',
  skip: '/api/v1/discovery/skip',
} as const;

export const API_V1_INTERACTION_ENDPOINTS = {
  like: '/api/v1/interactions/like',
  pass: '/api/v1/interactions/pass',
} as const;

export type ApiV1DiscoveryFeedRequest = {
  page_size?: number;
  cursor?: string;
};

export type ApiV1DiscoveryCandidate = {
  user_id: string;
  display_name: string;
  age: number;
  photos: string[];
  bio?: string;
};

export type ApiV1DiscoveryFeedResponse = {
  candidates: ApiV1DiscoveryCandidate[];
  next_cursor?: string;
};

export type ApiV1DiscoverySkipRequest = {
  target_user_id: string;
};

export type ApiV1InteractionRequest = {
  target_user_id: string;
  venue_id: string;
};

export type ApiV1InteractionResponse = {
  status: 'SUCCESS';
  interaction: 'LIKE' | 'PASS';
  match_created: boolean;
  match_id?: string;
};

export type DiscoveryApiV1MappingContext = {
  venueId: string;
  genderByUserId?: Record<string, UserGender>;
  fallbackGender?: UserGender;
  fallbackPhotoUrl?: string;
};

export type InteractionApiV1MappingContext = {
  interactionId?: string;
  idempotencyKey?: string;
  decision?: InteractionDecision;
  duplicateScope?: InteractionDuplicateScope;
};

const DEFAULT_FALLBACK_GENDER: UserGender = 'non_binary';
const DEFAULT_DUPLICATE_SCOPE: InteractionDuplicateScope = 'actor_target_venue_session';

export function mapDiscoveryFeedRequestToApiV1(request?: { pageSize?: number; cursor?: string }): ApiV1DiscoveryFeedRequest {
  if (!request) {
    return {};
  }

  const payload: ApiV1DiscoveryFeedRequest = {};

  if (typeof request.pageSize === 'number') {
    payload.page_size = request.pageSize;
  }

  if (typeof request.cursor === 'string' && request.cursor.length > 0) {
    payload.cursor = request.cursor;
  }

  return payload;
}

export function mapDiscoverySkipRequestToApiV1(targetUserId: string): ApiV1DiscoverySkipRequest {
  return {
    target_user_id: targetUserId,
  };
}

export function mapDiscoveryFeedResponseFromApiV1(
  response: ApiV1DiscoveryFeedResponse,
  context: DiscoveryApiV1MappingContext
): { candidates: DiscoveryCandidate[]; nextCursor?: string } {
  const fallbackGender = context.fallbackGender ?? DEFAULT_FALLBACK_GENDER;
  const fallbackPhotoUrl = context.fallbackPhotoUrl ?? '';

  return {
    candidates: response.candidates.map((candidate) => ({
      userId: candidate.user_id,
      displayName: candidate.display_name,
      age: candidate.age,
      gender: context.genderByUserId?.[candidate.user_id] ?? fallbackGender,
      profilePhotoUrl: candidate.photos[0] ?? fallbackPhotoUrl,
      venueId: context.venueId,
    })),
    nextCursor: response.next_cursor,
  };
}

export function mapInteractionRequestToApiV1(request: InteractionRequest): ApiV1InteractionRequest {
  return {
    target_user_id: request.targetUserId,
    venue_id: request.venueId,
  };
}

export function mapInteractionResponseFromApiV1(
  response: ApiV1InteractionResponse,
  request: InteractionRequest,
  context?: InteractionApiV1MappingContext
): InteractionResult {
  return {
    status: 'SUCCESS',
    interaction: response.interaction,
    interactionId: context?.interactionId ?? `placeholder-${response.interaction.toLowerCase()}-${request.targetUserId}`,
    targetUserId: request.targetUserId,
    venueId: request.venueId,
    idempotencyKey: context?.idempotencyKey ?? request.idempotencyKey,
    decision: context?.decision ?? 'created',
    duplicateScope: context?.duplicateScope ?? DEFAULT_DUPLICATE_SCOPE,
    matchCreated: response.match_created,
    matchId: response.match_id,
  };
}