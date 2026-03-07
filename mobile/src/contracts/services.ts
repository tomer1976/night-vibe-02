import { ApiResponse } from './api';
import {
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

export interface AuthService {
  getSession(): Promise<ApiResponse<AuthSession>>;
  signInWithProvider(provider: 'google' | 'apple'): Promise<ApiResponse<AuthSession>>;
  signOut(): Promise<ApiResponse<{ signedOut: true }>>;
}

export interface ProfileService {
  getMyProfile(): Promise<ApiResponse<UserProfile>>;
  updateMyProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>>;
}

export interface RolesService {
  getAvailableRoles(): Promise<ApiResponse<Role[]>>;
  setActiveRoleContext(role: Role): Promise<ApiResponse<{ activeRoleContext: Role }>>;
}

export interface VenuesService {
  getNearbyVenues(): Promise<ApiResponse<VenueSummary[]>>;
}

export interface PresenceService {
  getActiveSession(): Promise<ApiResponse<VenueSession | null>>;
  checkIn(venueId: string): Promise<ApiResponse<VenueSession>>;
  checkOut(sessionId: string): Promise<ApiResponse<{ sessionClosed: true }>>;
}

export interface DiscoveryService {
  getCandidates(cursor?: string): Promise<ApiResponse<{ items: DiscoveryCandidate[]; nextCursor?: string }>>;
}

export interface InteractionsService {
  like(targetUserId: string): Promise<ApiResponse<{ action: 'like'; targetUserId: string }>>;
  pass(targetUserId: string): Promise<ApiResponse<{ action: 'pass'; targetUserId: string }>>;
}

export interface MatchService {
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
  roles: RolesService;
  venues: VenuesService;
  presence: PresenceService;
  discovery: DiscoveryService;
  interactions: InteractionsService;
  match: MatchService;
  chat: ChatService;
  safety: SafetyService;
  notifications: NotificationsService;
  analytics: AnalyticsService;
};