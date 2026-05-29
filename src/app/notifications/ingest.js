import { showLocalNotification } from '../api/notifications';
import { getRealtimeNotificationCopy } from '../realtime/notifications';
import { isBusinessType } from '../realtime/types';
import { notificationIngest } from '../actions';
import { normalizeRealtimePayload } from './payload';
import { getNotificationNavigationTarget } from './targets';

const MAX_ITEMS = 100;
const DEDUPE_MS = 4000;
const recentIngest = new Map();

let idCounter = 0;

export function shouldSkipIngest(payload) {
  const normalized = normalizeRealtimePayload(payload);
  if (!normalized?.type) {
    return true;
  }
  const key = `${normalized.type}|${normalized.ticketId ?? ''}|${normalized.eventId ?? ''}`;
  const now = Date.now();
  const prev = recentIngest.get(key);
  if (prev != null && now - prev < DEDUPE_MS) {
    return true;
  }
  recentIngest.set(key, now);
  return false;
}

export function clearIngestDedupe() {
  recentIngest.clear();
}

const nextId = () => {
  idCounter += 1;
  return `n-${Date.now()}-${idCounter}`;
};

export function buildNotificationItem(payload, authData) {
  const normalized = normalizeRealtimePayload(payload);
  if (!normalized || !isBusinessType(normalized.type)) {
    return null;
  }

  const copy = getRealtimeNotificationCopy(normalized, authData);
  if (!copy) {
    return null;
  }

  const nav = getNotificationNavigationTarget(normalized, authData);

  return {
    id: nextId(),
    type: normalized.type,
    title: copy.title,
    body: copy.body,
    payload: normalized,
    read: false,
    createdAt: Date.now(),
    targetRoute: nav?.targetRoute,
    targetParams: nav?.targetParams ?? {},
  };
}

/**
 * Add to Redux inbox and show matching system notification (Notifee).
 */
export async function ingestNotification(dispatch, payload, authData) {
  const normalized = normalizeRealtimePayload(payload);
  if (!normalized || shouldSkipIngest(normalized)) {
    return null;
  }

  const item = buildNotificationItem(normalized, authData);
  if (!item) {
    return null;
  }

  dispatch(notificationIngest(item));

  try {
    await showLocalNotification({
      title: item.title,
      body: item.body,
      data: {
        type: String(normalized.type || ''),
        notificationId: item.id,
        targetRoute: item.targetRoute || '',
        targetParamsJson: JSON.stringify(item.targetParams || {}),
        eventId: normalized.eventId != null ? String(normalized.eventId) : '',
        ticketId: normalized.ticketId != null ? String(normalized.ticketId) : '',
      },
    });
  } catch {
    // Inbox still updated if system notification fails (permissions, etc.)
  }

  return item;
}

export { MAX_ITEMS };
