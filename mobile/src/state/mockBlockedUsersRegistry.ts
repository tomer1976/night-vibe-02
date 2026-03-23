import { sprint01Fixtures, sprint04DiscoveryBlockSkipFixtures } from '../mocks';

export type MockBlockedUserEntry = {
  userId: string;
  displayName?: string;
};

const ACTIVE_USER_ID = 'u-regular-1';

type BlockedUsersListener = (entries: readonly MockBlockedUserEntry[]) => void;

let blockedUsersById = buildInitialBlockedUsersMap();
const listeners = new Set<BlockedUsersListener>();

function buildInitialBlockedUsersMap(): Map<string, MockBlockedUserEntry> {
  const fixture = sprint04DiscoveryBlockSkipFixtures.find((item) => item.viewerUserId === ACTIVE_USER_ID);
  const seededIds = fixture?.blockedUserIds?.length
    ? fixture.blockedUserIds
    : sprint04DiscoveryBlockSkipFixtures[0]?.blockedUserIds ?? [];

  const entries = seededIds.map((userId) => {
    const seededUser = sprint01Fixtures.users.find((entry) => entry.uid === userId);
    return {
      userId,
      displayName: seededUser?.displayName,
    } satisfies MockBlockedUserEntry;
  });

  return new Map(entries.map((entry) => [entry.userId, entry]));
}

function emitChange() {
  const snapshot = getMockBlockedUsers();
  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function getMockBlockedUsers(): readonly MockBlockedUserEntry[] {
  return [...blockedUsersById.values()].sort((left, right) => left.userId.localeCompare(right.userId));
}

export function getMockBlockedUserIds(): readonly string[] {
  return getMockBlockedUsers().map((entry) => entry.userId);
}

export function isMockUserBlocked(userId: string): boolean {
  return blockedUsersById.has(userId);
}

export function applyMockBlockUser(entry: MockBlockedUserEntry): void {
  const existing = blockedUsersById.get(entry.userId);

  blockedUsersById.set(entry.userId, {
    userId: entry.userId,
    displayName: entry.displayName ?? existing?.displayName,
  });

  emitChange();
}

export function applyMockUnblockUser(userId: string): void {
  if (!blockedUsersById.delete(userId)) {
    return;
  }

  emitChange();
}

export function subscribeToMockBlockedUsers(listener: BlockedUsersListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function resetMockBlockedUsersRegistry(): void {
  blockedUsersById = buildInitialBlockedUsersMap();
  emitChange();
}
