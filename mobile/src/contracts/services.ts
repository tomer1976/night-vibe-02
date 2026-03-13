import { ApiResponse } from './api';
import {
  AccountStatus,
  AuthSession,
  ChatThread,
  DiscoveryCandidate,
  MatchRecord,
  NotificationRecord,
  Role,
  SafetyReport,
  UserProfile,
  VenueAnalyticsSnapshot,
  VenueSession,
  VenueSummary,
} from './models';

export type AuthProvider = 'google' | 'apple';

export type AuthLoginRequest = {
  provider: AuthProvider;
  providerToken?: string;
  deviceId?: string;
  clientVersion?: string;
};

export type AuthLoginResult = AuthSession & {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};

export type AuthRefreshResult = {
  accessToken: string;
  tokenExpiration: string;
};

export type LinkedProviderRecord = {
  provider: AuthProvider;
  linkedAt: string;
};

export type AccountDeletionResult = {
  accountStatus: AccountStatus;
  recoveryWindowDays: number;
};

export type AccountRecoveryResult = {
  accountStatus: AccountStatus;
};

export type ProfilePhotoRecord = {
  photoId: string;
  photoUrl: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
};

export type VenueDiscoveryRequest = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

export type PresenceCloseReason = 'manual_checkout' | 'auto_replaced' | 'timeout' | 'venue_invalidated';

export type PresenceStateTransition = {
  sessionId: string;
  userId: string;
  venueId: string;
  fromStatus: VenueSession['status'];
  toStatus: VenueSession['status'];
  reason?: PresenceCloseReason;
  transitionedAt: string;
};

export type PresenceCheckInRequest = {
  venueId: string;
  latitude: number;
  longitude: number;
  locationCapturedAt?: string;
  idempotencyKey?: string;
};

export type PresenceCheckInResult = {
  status: 'SUCCESS';
  venueId: string;
  sessionId: string;
  checkinTimestamp: string;
  previousVenueCheckout: boolean;
};

export type PresenceCheckOutResult = {
  status: 'SUCCESS';
  checkoutTime: string;
};

// Sprint-03 placeholder callable contracts for future Firebase conversion.
export type PresenceCheckInCallableRequest = {
  venueId: string;
  latitude: number;
  longitude: number;
  idempotencyKey?: string;
};

export type PresenceCheckInCallableResponse = PresenceCheckInResult;

export type PresenceCheckOutCallableRequest = {
  idempotencyKey?: string;
};

export type PresenceCheckOutCallableResponse = PresenceCheckOutResult;

export interface PresenceCallableOperations {
  checkIn(request: PresenceCheckInCallableRequest): Promise<ApiResponse<PresenceCheckInCallableResponse>>;
  checkOut(request: PresenceCheckOutCallableRequest): Promise<ApiResponse<PresenceCheckOutCallableResponse>>;
}

export interface AuthService {
  getSession(): Promise<ApiResponse<AuthSession>>;
  login(request: AuthLoginRequest): Promise<ApiResponse<AuthLoginResult>>;
  refreshSession(refreshToken: string): Promise<ApiResponse<AuthRefreshResult>>;
  linkProvider(provider: AuthProvider, providerToken?: string): Promise<ApiResponse<{ providers: AuthProvider[] }>>;

  // Legacy Sprint-01 compatibility shim
  signInWithProvider(provider: 'google' | 'apple'): Promise<ApiResponse<AuthSession>>;
  signOut(): Promise<ApiResponse<{ signedOut: true }>>;
}

export interface ProfileService {
  getMyProfile(): Promise<ApiResponse<UserProfile>>;

  upsertMyProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>>;
  uploadMyPhoto(fileName: string): Promise<ApiResponse<ProfilePhotoRecord>>;
  deleteMyPhoto(photoId: string): Promise<ApiResponse<{ photoId: string; removed: true }>>;

  // Legacy Sprint-01 compatibility shim
  updateMyProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>>;
}

export interface AccountLifecycleService {
  getAccountStatus(): Promise<ApiResponse<{ status: AccountStatus }>>;
  requestAccountDeletion(confirmationToken: string): Promise<ApiResponse<AccountDeletionResult>>;
  recoverAccount(): Promise<ApiResponse<AccountRecoveryResult>>;
  getLinkedProviders(): Promise<ApiResponse<LinkedProviderRecord[]>>;
}

export interface RolesService {
  getAvailableRoles(): Promise<ApiResponse<Role[]>>;
  setActiveRoleContext(role: Role): Promise<ApiResponse<{ activeRoleContext: Role }>>;
}

export interface VenueDiscoveryService {
  getNearbyVenues(request?: VenueDiscoveryRequest): Promise<ApiResponse<VenueSummary[]>>;
}

export interface PresenceService {
  getMyActiveSession(): Promise<ApiResponse<VenueSession | null>>;
  checkInWithContext(request: PresenceCheckInRequest): Promise<ApiResponse<PresenceCheckInResult>>;
  checkOutActiveSession(): Promise<ApiResponse<PresenceCheckOutResult>>;

  // Sprint-03 state transition contract for deterministic mock clock and timeout simulation.
  getStateTransitions(): Promise<ApiResponse<PresenceStateTransition[]>>;

  // Legacy Sprint-01/02 compatibility shims
  getActiveSession(): Promise<ApiResponse<VenueSession | null>>;
  checkIn(venueId: string): Promise<ApiResponse<VenueSession>>;
  checkOut(sessionId: string): Promise<ApiResponse<{ sessionClosed: true }>>;
}

export type VenuesService = VenueDiscoveryService;

export interface DiscoveryService {
  getFeed(request?: { pageSize?: number; cursor?: string }): Promise<ApiResponse<{ candidates: DiscoveryCandidate[]; nextCursor?: string }>>;
  skipCandidate(targetUserId: string): Promise<ApiResponse<{ skipped: true; targetUserId: string }>>;

  // Legacy Sprint-01/03 compatibility shim
  getCandidates(cursor?: string): Promise<ApiResponse<{ items: DiscoveryCandidate[]; nextCursor?: string }>>;
}

export type InteractionRequest = {
  targetUserId: string;
  venueId: string;
  idempotencyKey?: string;
};

export type InteractionResult = {
  status: 'SUCCESS';
  interaction: 'LIKE' | 'PASS';
  targetUserId: string;
  matchCreated: boolean;
  matchId?: string;
};

export interface InteractionService {
  likeUser(request: InteractionRequest): Promise<ApiResponse<InteractionResult>>;
  passUser(request: InteractionRequest): Promise<ApiResponse<InteractionResult>>;
}

export interface InteractionsService extends InteractionService {
  // Legacy Sprint-01/03 compatibility shim
  like(targetUserId: string): Promise<ApiResponse<{ action: 'like'; targetUserId: string }>>;
  pass(targetUserId: string): Promise<ApiResponse<{ action: 'pass'; targetUserId: string }>>;
}

export interface MatchService {
  listMatches(request?: { status?: MatchRecord['status'] }): Promise<ApiResponse<{ matches: MatchRecord[] }>>;

  // Legacy Sprint-01/03 compatibility shim
  getMatches(): Promise<ApiResponse<MatchRecord[]>>;
}

export interface ChatService {
  getThreads(): Promise<ApiResponse<ChatThread[]>>;
  sendMessage(chatId: string, message: string): Promise<ApiResponse<{ chatId: string; sent: true }>>;
}

export interface SafetyService {
  blockUser(targetUserId: string): Promise<ApiResponse<{ blocked: true; targetUserId: string }>>;
  reportUser(targetUserId: string, reason: string): Promise<ApiResponse<SafetyReport>>;
}

export interface NotificationsService {
  getNotifications(): Promise<ApiResponse<NotificationRecord[]>>;
  markAsRead(notificationId: string): Promise<ApiResponse<{ notificationId: string; read: true }>>;
}

export interface AnalyticsService {
  getVenueAnalytics(venueId: string): Promise<ApiResponse<VenueAnalyticsSnapshot>>;
}

export type BackendServiceContracts = {
  auth: AuthService;
  profile: ProfileService;
  accountLifecycle: AccountLifecycleService;
  roles: RolesService;
  venues: VenueDiscoveryService;
  presence: PresenceService;
  discovery: DiscoveryService;
  interactions: InteractionsService;
  match: MatchService;
  chat: ChatService;
  safety: SafetyService;
  notifications: NotificationsService;
  analytics: AnalyticsService;
};