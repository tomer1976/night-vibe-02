export type Role = 'RegularUser' | 'VenueOwner' | 'Moderator' | 'Administrator';

export type AccountStatus = 'active' | 'suspended' | 'banned' | 'pending_deletion' | 'deleted';

export type AuthSession = {
  uid: string;
  status: AccountStatus;
  roles: Role[];
  activeRoleContext: Role;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  profileCompleted: boolean;
};

export type VenueSummary = {
  venueId: string;
  name: string;
  distanceKm: number;
  category: 'bar' | 'club' | 'restaurant' | 'lounge' | 'event_space' | 'festival' | 'other';
  status: 'pending' | 'active' | 'rejected' | 'suspended' | 'expired';
  activitySnapshot: {
    checkinCount: number;
    liveStatus: 'calm' | 'steady' | 'busy';
  };
};

export type VenueSession = {
  sessionId: string;
  userId: string;
  venueId: string;
  status: 'active' | 'closed' | 'expired';
};

export type DiscoveryCandidate = {
  userId: string;
  displayName: string;
  age: number;
  venueId: string;
};

export type MatchRecord = {
  matchId: string;
  users: [string, string];
  status: 'matched' | 'expired' | 'blocked';
};

export type ChatThread = {
  chatId: string;
  matchId: string;
  participants: [string, string];
  status: 'active' | 'expired' | 'blocked';
};

export type SafetyReport = {
  reportId: string;
  reporterId: string;
  reportedUserId: string;
  status: 'pending' | 'resolved';
};

export type NotificationRecord = {
  notificationId: string;
  userId: string;
  type: 'match_notification' | 'message_notification' | 'venue_activity_notification' | 'safety_notification' | 'system_notification';
  read: boolean;
};

export type VenueAnalyticsSnapshot = {
  venueId: string;
  population: number;
  popularityScore: number;
  updatedAt: string;
};