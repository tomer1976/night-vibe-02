import {
  createInitialSafetyStoreState,
  safetyStoreReducer,
  selectBlockedUserIds,
  selectIsUserBlocked,
  selectLatestSafetyEnforcementEventByTargetUserId,
  selectSafetyReports,
} from '../src/state';

describe('safetyStore', () => {
  it('stores deterministic blocked-user snapshots', () => {
    const state = safetyStoreReducer(createInitialSafetyStoreState(), {
      type: 'SET_BLOCKED_USERS_SNAPSHOT',
      blockedUserIds: ['u-3', 'u-2', 'u-3'],
      syncedAt: '2026-03-23T20:00:00.000Z',
    });

    expect(selectBlockedUserIds(state)).toEqual(['u-2', 'u-3']);
    expect(state.lastSyncedAt).toBe('2026-03-23T20:00:00.000Z');
  });

  it('applies block and unblock actions idempotently', () => {
    const blocked = safetyStoreReducer(createInitialSafetyStoreState(), {
      type: 'APPLY_BLOCK',
      targetUserId: 'u-9',
      occurredAt: '2026-03-23T20:01:00.000Z',
    });

    const blockedAgain = safetyStoreReducer(blocked, {
      type: 'APPLY_BLOCK',
      targetUserId: 'u-9',
      occurredAt: '2026-03-23T20:01:30.000Z',
    });

    const unblocked = safetyStoreReducer(blockedAgain, {
      type: 'APPLY_UNBLOCK',
      targetUserId: 'u-9',
      occurredAt: '2026-03-23T20:02:00.000Z',
    });

    expect(selectBlockedUserIds(blockedAgain)).toEqual(['u-9']);
    expect(selectIsUserBlocked(unblocked, 'u-9')).toBe(false);
    expect(unblocked.lastSyncedAt).toBe('2026-03-23T20:02:00.000Z');
  });

  it('upserts reports and preserves insertion order', () => {
    const withFirstReport = safetyStoreReducer(createInitialSafetyStoreState(), {
      type: 'UPSERT_REPORT',
      report: {
        reportId: 'report-1',
        reporterId: 'u-1',
        reportedUserId: 'u-2',
        status: 'pending',
      },
      syncedAt: '2026-03-23T20:03:00.000Z',
    });

    const withUpdatedFirstReport = safetyStoreReducer(withFirstReport, {
      type: 'UPSERT_REPORT',
      report: {
        reportId: 'report-1',
        reporterId: 'u-1',
        reportedUserId: 'u-2',
        status: 'resolved',
      },
      syncedAt: '2026-03-23T20:03:30.000Z',
    });

    const withSecondReport = safetyStoreReducer(withUpdatedFirstReport, {
      type: 'UPSERT_REPORT',
      report: {
        reportId: 'report-2',
        reporterId: 'u-1',
        reportedUserId: 'u-3',
        status: 'pending',
      },
      syncedAt: '2026-03-23T20:04:00.000Z',
    });

    expect(selectSafetyReports(withSecondReport)).toEqual([
      {
        reportId: 'report-1',
        reporterId: 'u-1',
        reportedUserId: 'u-2',
        status: 'resolved',
      },
      {
        reportId: 'report-2',
        reporterId: 'u-1',
        reportedUserId: 'u-3',
        status: 'pending',
      },
    ]);
  });

  it('applies enforcement events with deterministic ordering and side effects', () => {
    const start = createInitialSafetyStoreState();

    const withReportEvent = safetyStoreReducer(start, {
      type: 'APPLY_ENFORCEMENT_EVENT',
      event: {
        eventId: 'evt-report-1',
        action: 'report_submitted',
        actorUserId: 'u-1',
        targetUserId: 'u-2',
        occurredAt: '2026-03-23T20:05:00.000Z',
        chatAccessRevoked: true,
        discoveryVisibilityRevoked: true,
        relatedReportId: 'report-enforcement-1',
      },
    });

    const withBlockEvent = safetyStoreReducer(withReportEvent, {
      type: 'APPLY_ENFORCEMENT_EVENT',
      event: {
        eventId: 'evt-block-1',
        action: 'block_applied',
        actorUserId: 'u-1',
        targetUserId: 'u-2',
        occurredAt: '2026-03-23T20:06:00.000Z',
        chatAccessRevoked: true,
        discoveryVisibilityRevoked: true,
      },
    });

    expect(selectIsUserBlocked(withBlockEvent, 'u-2')).toBe(true);
    expect(selectSafetyReports(withBlockEvent)).toEqual([
      {
        reportId: 'report-enforcement-1',
        reporterId: 'u-1',
        reportedUserId: 'u-2',
        status: 'pending',
      },
    ]);

    expect(selectLatestSafetyEnforcementEventByTargetUserId(withBlockEvent, 'u-2')?.eventId).toBe('evt-block-1');
  });

  it('replays enforcement events and resets cleanly', () => {
    const replayed = safetyStoreReducer(createInitialSafetyStoreState(), {
      type: 'REPLAY_ENFORCEMENT_EVENTS',
      events: [
        {
          eventId: 'evt-block-2',
          action: 'block_applied',
          actorUserId: 'u-1',
          targetUserId: 'u-8',
          occurredAt: '2026-03-23T20:10:00.000Z',
          chatAccessRevoked: true,
          discoveryVisibilityRevoked: true,
        },
        {
          eventId: 'evt-block-2',
          action: 'block_applied',
          actorUserId: 'u-1',
          targetUserId: 'u-8',
          occurredAt: '2026-03-23T20:10:30.000Z',
          chatAccessRevoked: true,
          discoveryVisibilityRevoked: true,
        },
      ],
    });

    expect(replayed.enforcementEvents).toHaveLength(1);
    expect(replayed.enforcementEvents[0].occurredAt).toBe('2026-03-23T20:10:30.000Z');
    expect(selectBlockedUserIds(replayed)).toEqual(['u-8']);

    const reset = safetyStoreReducer(replayed, { type: 'RESET_SAFETY_STORE' });
    expect(reset).toEqual(createInitialSafetyStoreState());
  });
});
