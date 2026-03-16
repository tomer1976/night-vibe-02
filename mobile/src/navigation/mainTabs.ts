import { AppRouteName, ROUTE_NAMES } from './routeGroups';

export type MainTabKey = 'venues' | 'chats' | 'settings' | 'profile';

export const MAIN_TAB_ITEMS: readonly { key: MainTabKey; label: string }[] = [
  { key: 'venues', label: 'Venues' },
  { key: 'chats', label: 'Chats' },
  { key: 'settings', label: 'Settings' },
  { key: 'profile', label: 'Profile' },
] as const;

export function isMainTabKey(key: string): key is MainTabKey {
  return key === 'venues' || key === 'chats' || key === 'settings' || key === 'profile';
}

export function resolveMainTabRouteName(key: MainTabKey): AppRouteName {
  if (key === 'venues') {
    return ROUTE_NAMES.NearbyVenues;
  }

  if (key === 'chats') {
    return ROUTE_NAMES.ChatThreads;
  }

  if (key === 'settings') {
    return ROUTE_NAMES.AccountSettings;
  }

  return ROUTE_NAMES.UserProfile;
}
