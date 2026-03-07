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

export const ROUTE_MODULE_OWNERS = {
  AppShell: 'app-shell',
  Auth: 'auth',
  User: 'user',
  VenueOwner: 'venue-owner',
  Moderation: 'moderation',
  Administration: 'administration',
} as const;

export type RouteModuleOwner = (typeof ROUTE_MODULE_OWNERS)[keyof typeof ROUTE_MODULE_OWNERS];

export const ROUTE_GROUP_OWNERSHIP: Record<AppRouteName, RouteModuleOwner> = {
  [ROUTE_NAMES.Splash]: ROUTE_MODULE_OWNERS.AppShell,
  [ROUTE_NAMES.AuthGroup]: ROUTE_MODULE_OWNERS.Auth,
  [ROUTE_NAMES.UserGroup]: ROUTE_MODULE_OWNERS.User,
  [ROUTE_NAMES.OwnerGroup]: ROUTE_MODULE_OWNERS.VenueOwner,
  [ROUTE_NAMES.ModeratorGroup]: ROUTE_MODULE_OWNERS.Moderation,
  [ROUTE_NAMES.AdminGroup]: ROUTE_MODULE_OWNERS.Administration,
  [ROUTE_NAMES.UnknownRouteFallback]: ROUTE_MODULE_OWNERS.AppShell,
};