import { eventChannel } from 'redux-saga';
import { call, cancelled, delay, put, select, take } from 'redux-saga/effects';
import { createMercureEventSource } from '../api/mercure';
import { fetchMercureSubscriberToken, fetchRealtimeConfig } from '../api/realtime';
import { isAdmin } from '../../utils/roles';
import {
  AUTH_BOOTSTRAP_COMPLETE,
  RT_CONNECTED,
  RT_DISCONNECTED,
  RT_MESSAGE,
  USER_LOGIN_COMPLETE,
} from '../actions';

const selectAuth = state => state.auth?.data ?? null;

function createSseChannel(es) {
  return eventChannel(emit => {
    es.addEventListener('open', () => emit({ type: 'open' }));
    es.addEventListener('error', () => emit({ type: 'error' }));
    es.addEventListener('message', evt => emit({ type: 'message', data: evt?.data }));

    return () => {
      try {
        es.close();
      } catch (e) {
        // ignore
      }
    };
  });
}

function safeParseMessage(raw) {
  if (raw == null) return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return { type: 'text', data: raw };
  }
}

function* runMercureSession(hubUrl, topic, mercureJwt) {
  const es = yield call(createMercureEventSource, {
    hubUrl,
    topics: [topic],
    mercureJwt,
  });
  const ch = yield call(createSseChannel, es);

  try {
    while (true) {
      const evt = yield take(ch);
      if (evt.type === 'open') {
        yield put({ type: RT_CONNECTED, payload: { mode: 'mercure' } });
      } else if (evt.type === 'error') {
        yield put({ type: RT_DISCONNECTED });
        return false;
      } else if (evt.type === 'message') {
        const payload = safeParseMessage(evt.data);
        yield put({ type: RT_MESSAGE, payload });
      }
    }
  } finally {
    ch.close();
    try {
      es.close();
    } catch (e) {
      // ignore
    }
    if (yield cancelled()) {
      yield put({ type: RT_DISCONNECTED });
    }
  }
}

/**
 * Mercure SSE for push updates (tickets, events). Admin screens also poll via useAdminLiveUpdates.
 */
export function* liveUpdatesLoop() {
  yield take(AUTH_BOOTSTRAP_COMPLETE);

  while (true) {
    let auth = yield select(selectAuth);
    if (!auth?.token) {
      yield take(USER_LOGIN_COMPLETE);
      auth = yield select(selectAuth);
    }

    if (!auth?.token) {
      yield delay(3000);
      continue;
    }

    let config = { enabled: false };
    try {
      config = yield call(fetchRealtimeConfig);
    } catch (e) {
      yield delay(5000);
      continue;
    }

    if (!config?.enabled || !config?.hubUrl) {
      yield delay(isAdmin(auth) ? 5000 : 15000);
      continue;
    }

    try {
      const tokenResponse = yield call(fetchMercureSubscriberToken, auth.token);
      if (!tokenResponse?.token) {
        yield delay(5000);
        continue;
      }

      yield call(
        runMercureSession,
        config.hubUrl,
        config.topic || tokenResponse.topic,
        tokenResponse.token,
      );
    } catch (e) {
      yield put({ type: RT_DISCONNECTED });
    }

    yield delay(3000);
  }
}

/** @deprecated alias */
export const adminLiveUpdatesLoop = liveUpdatesLoop;
