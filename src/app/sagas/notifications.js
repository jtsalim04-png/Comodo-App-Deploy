import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { showLocalNotification } from '../api/notifications';
import {
  buildNotificationItem,
  clearIngestDedupe,
  shouldSkipIngest,
} from '../notifications/ingest';
import { normalizeRealtimePayload } from '../notifications/payload';
import {
  NOTIFICATION_INGEST,
  RESET_USER_LOGIN,
  RT_MESSAGE,
} from '../actions';

const selectAuth = state => state.auth?.data ?? null;

function* ingestPayload(payload) {
  const normalized = normalizeRealtimePayload(payload);
  if (!normalized?.type || shouldSkipIngest(normalized)) {
    return;
  }

  const auth = yield select(selectAuth);
  if (!auth?.token) {
    return;
  }

  const item = buildNotificationItem(normalized, auth);
  if (!item) {
    return;
  }

  yield put({ type: NOTIFICATION_INGEST, payload: item });

  try {
    yield call(showLocalNotification, {
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
    // Inbox updated even if tray notification fails
  }
}

function* onMercureMessage(action) {
  yield* ingestPayload(action.payload);
}

function* clearRecentOnLogout() {
  clearIngestDedupe();
}

export function* notificationIngestWatcher() {
  yield takeEvery(RT_MESSAGE, onMercureMessage);
}

export function* notificationLogoutClear() {
  yield takeLatest(RESET_USER_LOGIN, clearRecentOnLogout);
}
