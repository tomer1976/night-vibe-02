import {
  ChatEligibilityResult,
  ChatMessageLifecycleResult,
  ChatSendMessageRequest,
  ChatSendMessageResult,
  NotificationListRequest,
  NotificationListResult,
  NotificationPreferencesUpdate,
  NotificationPublishRequest,
  NotificationPublishResult,
} from './services';
import { NotificationPreferences, NotificationRecord, SafetyReport } from './models';

export const API_V1_CHAT_ENDPOINTS = {
  threads: '/api/v1/chat/threads',
  eligibility: '/api/v1/chat/eligibility',
  messages: '/api/v1/chat/messages',
  send: '/api/v1/chat/send',
  markDelivered: '/api/v1/chat/messages/delivered',
  markRead: '/api/v1/chat/messages/read',
  typing: '/api/v1/chat/typing',
} as const;

export const API_V1_SAFETY_ENDPOINTS = {
  block: '/api/v1/safety/block',
  report: '/api/v1/safety/report',
} as const;

export const API_V1_NOTIFICATION_ENDPOINTS = {
  list: '/api/v1/notifications',
  markRead: '/api/v1/notifications/read',
  preferences: '/api/v1/notifications/preferences',
  dedupConfig: '/api/v1/notifications/dedup-config',
  publish: '/api/v1/notifications/publish',
} as const;

export type ApiV1ChatSendMessageRequest = {
  chat_id: string;
  message_text: string;
};

export type ApiV1ChatSendMessageResponse = {
  chat_id: string;
  message_id: string;
  status: 'sent';
  sent_at: string;
};

export type ApiV1ChatEligibilityResponse = {
  chat_id: string;
  eligible: boolean;
  reason?: ChatEligibilityResult['reason'];
  evaluated_at: string;
};

export type ApiV1ChatMessageLifecycleResponse = {
  chat_id: string;
  message_id: string;
  status: 'delivered' | 'read';
  updated_at: string;
};

export type ApiV1SafetyBlockRequest = {
  target_user_id: string;
};

export type ApiV1SafetyReportRequest = {
  target_user_id: string;
  reason: string;
};

export type ApiV1SafetyReportResponse = {
  report_id: string;
  reporter_user_id: string;
  reported_user_id: string;
  status: SafetyReport['status'];
};

export type ApiV1NotificationListRequest = {
  cursor?: string;
  page_size?: number;
  unread_only?: boolean;
};

export type ApiV1NotificationRecord = {
  notification_id: string;
  user_id: string;
  type: NotificationRecord['type'];
  title?: string;
  body?: string;
  event_id?: string;
  event_type?: string;
  dedup_key?: string;
  read: boolean;
  read_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type ApiV1NotificationListResponse = {
  items: ApiV1NotificationRecord[];
  next_cursor?: string;
};

export type ApiV1NotificationPreferences = {
  match_notifications: boolean;
  message_notifications: boolean;
  venue_notifications: boolean;
  safety_notifications: boolean;
  system_notifications: boolean;
  updated_at: string;
};

export type ApiV1NotificationPreferencesUpdate = {
  match_notifications?: boolean;
  message_notifications?: boolean;
  venue_notifications?: boolean;
  safety_notifications?: boolean;
  system_notifications?: boolean;
};

export type ApiV1NotificationPublishRequest = {
  type: NotificationRecord['type'];
  title: string;
  body: string;
  event_id: string;
  event_type: string;
};

export type ApiV1NotificationPublishResponse = {
  outcome: NotificationPublishResult['outcome'];
  notification_id?: string;
  dedup_key: string;
  occurred_at: string;
};

export function mapChatSendMessageRequestToApiV1(request: ChatSendMessageRequest): ApiV1ChatSendMessageRequest {
  return {
    chat_id: request.chatId,
    message_text: request.messageText,
  };
}

export function mapChatSendMessageResponseFromApiV1(response: ApiV1ChatSendMessageResponse): ChatSendMessageResult {
  return {
    chatId: response.chat_id,
    messageId: response.message_id,
    status: response.status,
    sentAt: response.sent_at,
  };
}

export function mapChatEligibilityResponseFromApiV1(response: ApiV1ChatEligibilityResponse): ChatEligibilityResult {
  return {
    chatId: response.chat_id,
    eligible: response.eligible,
    reason: response.reason,
    evaluatedAt: response.evaluated_at,
  };
}

export function mapChatMessageLifecycleResponseFromApiV1(
  response: ApiV1ChatMessageLifecycleResponse
): ChatMessageLifecycleResult {
  return {
    chatId: response.chat_id,
    messageId: response.message_id,
    status: response.status,
    updatedAt: response.updated_at,
  };
}

export function mapSafetyBlockRequestToApiV1(targetUserId: string): ApiV1SafetyBlockRequest {
  return {
    target_user_id: targetUserId,
  };
}

export function mapSafetyReportRequestToApiV1(targetUserId: string, reason: string): ApiV1SafetyReportRequest {
  return {
    target_user_id: targetUserId,
    reason,
  };
}

export function mapSafetyReportResponseFromApiV1(response: ApiV1SafetyReportResponse): SafetyReport {
  return {
    reportId: response.report_id,
    reporterId: response.reporter_user_id,
    reportedUserId: response.reported_user_id,
    status: response.status,
  };
}

export function mapNotificationListRequestToApiV1(request?: NotificationListRequest): ApiV1NotificationListRequest {
  if (!request) {
    return {};
  }

  const payload: ApiV1NotificationListRequest = {};

  if (typeof request.cursor === 'string' && request.cursor.length > 0) {
    payload.cursor = request.cursor;
  }

  if (typeof request.pageSize === 'number') {
    payload.page_size = request.pageSize;
  }

  if (typeof request.unreadOnly === 'boolean') {
    payload.unread_only = request.unreadOnly;
  }

  return payload;
}

export function mapNotificationRecordFromApiV1(record: ApiV1NotificationRecord): NotificationRecord {
  return {
    notificationId: record.notification_id,
    userId: record.user_id,
    type: record.type,
    title: record.title,
    body: record.body,
    eventId: record.event_id,
    eventType: record.event_type,
    dedupKey: record.dedup_key,
    read: record.read,
    readAt: record.read_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapNotificationListResponseFromApiV1(response: ApiV1NotificationListResponse): NotificationListResult {
  return {
    items: response.items.map((item) => mapNotificationRecordFromApiV1(item)),
    nextCursor: response.next_cursor,
  };
}

export function mapNotificationPreferencesFromApiV1(response: ApiV1NotificationPreferences): NotificationPreferences {
  return {
    matchNotifications: response.match_notifications,
    messageNotifications: response.message_notifications,
    venueNotifications: response.venue_notifications,
    safetyNotifications: response.safety_notifications,
    systemNotifications: response.system_notifications,
    updatedAt: response.updated_at,
  };
}

export function mapNotificationPreferencesUpdateToApiV1(
  update: NotificationPreferencesUpdate
): ApiV1NotificationPreferencesUpdate {
  const payload: ApiV1NotificationPreferencesUpdate = {};

  if (typeof update.matchNotifications === 'boolean') {
    payload.match_notifications = update.matchNotifications;
  }

  if (typeof update.messageNotifications === 'boolean') {
    payload.message_notifications = update.messageNotifications;
  }

  if (typeof update.venueNotifications === 'boolean') {
    payload.venue_notifications = update.venueNotifications;
  }

  if (typeof update.safetyNotifications === 'boolean') {
    payload.safety_notifications = update.safetyNotifications;
  }

  if (typeof update.systemNotifications === 'boolean') {
    payload.system_notifications = update.systemNotifications;
  }

  return payload;
}

export function mapNotificationPublishRequestToApiV1(request: NotificationPublishRequest): ApiV1NotificationPublishRequest {
  return {
    type: request.type,
    title: request.title,
    body: request.body,
    event_id: request.eventId,
    event_type: request.eventType,
  };
}

export function mapNotificationPublishResponseFromApiV1(
  response: ApiV1NotificationPublishResponse
): NotificationPublishResult {
  return {
    outcome: response.outcome,
    notificationId: response.notification_id,
    dedupKey: response.dedup_key,
    occurredAt: response.occurred_at,
  };
}