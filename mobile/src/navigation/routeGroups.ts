export const ROUTE_NAMES = {
  Splash: 'Splash',
  AuthGroup: 'AuthGroup',
  UserGroup: 'UserGroup',
  OwnerGroup: 'OwnerGroup',
  ModeratorGroup: 'ModeratorGroup',
  AdminGroup: 'AdminGroup',
  UnknownRouteFallback: 'UnknownRouteFallback',
} as const;

export type AppRouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

export const ROUTE_GROUP_OWNERSHIP: Record<AppRouteName, string> = {
  [ROUTE_NAMES.Splash]: 'app-shell',
  [ROUTE_NAMES.AuthGroup]: 'auth',
  [ROUTE_NAMES.UserGroup]: 'user',
  [ROUTE_NAMES.OwnerGroup]: 'venue-owner',
  [ROUTE_NAMES.ModeratorGroup]: 'moderation',
  [ROUTE_NAMES.AdminGroup]: 'administration',
  [ROUTE_NAMES.UnknownRouteFallback]: 'app-shell',
};