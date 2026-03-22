import { SafetyEnforcementEvent, SafetyReport } from '../contracts';

export type SafetyStoreState = {
  blockedUserIds: string[];
  reportsById: Record<string, SafetyReport>;
  reportOrder: string[];
  enforcementEvents: SafetyEnforcementEvent[];
  lastSyncedAt: string | null;
};

export type SafetyStoreAction =
  | {
      type: 'SET_BLOCKED_USERS_SNAPSHOT';
      blockedUserIds: string[];
      syncedAt?: string;
    }
  | {
      type: 'APPLY_BLOCK';
      targetUserId: string;
      occurredAt?: string;
    }
  | {
      type: 'APPLY_UNBLOCK';
      targetUserId: string;
      occurredAt?: string;
    }
  | {
      type: 'UPSERT_REPORT';
      report: SafetyReport;
      syncedAt?: string;
    }
  | {
      type: 'APPLY_ENFORCEMENT_EVENT';
      event: SafetyEnforcementEvent;
    }
  | {
      type: 'REPLAY_ENFORCEMENT_EVENTS';
      events: SafetyEnforcementEvent[];
    }
  | {
      type: 'RESET_SAFETY_STORE';
    };

function toIsoNow(instant?: string) {
  return instant ?? new Date().toISOString();
}

function toMillis(instant?: string | null) {
  if (!instant) {
    return Number.NaN;
  }

  return new Date(instant).getTime();
}

function toUniqueSortedUserIds(userIds: string[]) {
  return [...new Set(userIds)].sort((left, right) => left.localeCompare(right));
}

function appendUniqueInOrder(values: string[], value: string) {
  if (values.includes(value)) {
    return values;
  }

  return [...values, value];
}

function mergeEnforcementEvent(
  events: SafetyEnforcementEvent[],
  event: SafetyEnforcementEvent
): SafetyEnforcementEvent[] {
  const existingIndex = events.findIndex((candidate) => candidate.eventId === event.eventId);
  const nextEvents = [...events];

  if (existingIndex >= 0) {
    nextEvents[existingIndex] = event;
  } else {
    nextEvents.push(event);
  }

  return nextEvents.sort((left, right) => {
    const leftTime = toMillis(left.occurredAt);
    const rightTime = toMillis(right.occurredAt);

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.eventId.localeCompare(right.eventId);
  });
}

function upsertReport(state: SafetyStoreState, report: SafetyReport) {
  return {
    reportsById: {
      ...state.reportsById,
      [report.reportId]: report,
    },
    reportOrder: appendUniqueInOrder(state.reportOrder, report.reportId),
  };
}

function applyEnforcementEvent(state: SafetyStoreState, event: SafetyEnforcementEvent): SafetyStoreState {
  let nextState = {
    ...state,
    enforcementEvents: mergeEnforcementEvent(state.enforcementEvents, event),
    lastSyncedAt: event.occurredAt,
  };

  if (event.action === 'block_applied') {
    nextState = {
      ...nextState,
      blockedUserIds: toUniqueSortedUserIds([...nextState.blockedUserIds, event.targetUserId]),
    };
  }

  if (event.action === 'report_submitted' && event.relatedReportId) {
    const report: SafetyReport = {
      reportId: event.relatedReportId,
      reporterId: event.actorUserId,
      reportedUserId: event.targetUserId,
      status: 'pending',
    };

    const nextReportState = upsertReport(nextState, report);
    nextState = {
      ...nextState,
      ...nextReportState,
    };
  }

  return nextState;
}

export function createInitialSafetyStoreState(): SafetyStoreState {
  return {
    blockedUserIds: [],
    reportsById: {},
    reportOrder: [],
    enforcementEvents: [],
    lastSyncedAt: null,
  };
}

export function selectBlockedUserIds(state: SafetyStoreState): string[] {
  return state.blockedUserIds;
}

export function selectIsUserBlocked(state: SafetyStoreState, targetUserId: string): boolean {
  return state.blockedUserIds.includes(targetUserId);
}

export function selectSafetyReports(state: SafetyStoreState): SafetyReport[] {
  return state.reportOrder
    .map((reportId) => state.reportsById[reportId])
    .filter((report): report is SafetyReport => Boolean(report));
}

export function selectLatestSafetyEnforcementEventByTargetUserId(
  state: SafetyStoreState,
  targetUserId: string
): SafetyEnforcementEvent | undefined {
  const matches = state.enforcementEvents.filter((event) => event.targetUserId === targetUserId);
  return matches[matches.length - 1];
}

export function safetyStoreReducer(state: SafetyStoreState, action: SafetyStoreAction): SafetyStoreState {
  switch (action.type) {
    case 'SET_BLOCKED_USERS_SNAPSHOT': {
      return {
        ...state,
        blockedUserIds: toUniqueSortedUserIds(action.blockedUserIds),
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'APPLY_BLOCK': {
      return {
        ...state,
        blockedUserIds: toUniqueSortedUserIds([...state.blockedUserIds, action.targetUserId]),
        lastSyncedAt: toIsoNow(action.occurredAt),
      };
    }

    case 'APPLY_UNBLOCK': {
      return {
        ...state,
        blockedUserIds: state.blockedUserIds.filter((userId) => userId !== action.targetUserId),
        lastSyncedAt: toIsoNow(action.occurredAt),
      };
    }

    case 'UPSERT_REPORT': {
      const nextReportState = upsertReport(state, action.report);

      return {
        ...state,
        ...nextReportState,
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'APPLY_ENFORCEMENT_EVENT': {
      return applyEnforcementEvent(state, action.event);
    }

    case 'REPLAY_ENFORCEMENT_EVENTS': {
      let nextState = state;

      for (const event of action.events) {
        nextState = safetyStoreReducer(nextState, {
          type: 'APPLY_ENFORCEMENT_EVENT',
          event,
        });
      }

      return nextState;
    }

    case 'RESET_SAFETY_STORE': {
      return createInitialSafetyStoreState();
    }

    default:
      return state;
  }
}
