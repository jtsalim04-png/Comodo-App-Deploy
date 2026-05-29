import { eventChannel } from 'redux-saga';
import { call, cancelled, delay, put, select, take } from 'redux-saga/effects';
import { createMercureEventSource } from '../api/mercure';
import { fetchMercureSubscriberToken, fetchRealtimeConfig } from '../api/realtime';
import { isAdmin } from '../../utils/roles';
import {
  AUTH_BOOTSTRAP_COMPLETE,
  RT_CONNECTED,
  RT_CONNECT,
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
        yield put({ type: RT_MESSAGE, payload: safeParseMessage(evt.data) });
      }
    }
  } finally {
    ch.close();
    try {
      es.close();
    } catch (e) {}
    if (yield cancelled()) {
      yield put({ type: RT_DISCONNECTED });
    }
  }
}

function* adminPollingFallback() {
  while (true) {
    yield put({
      type: RT_MESSAGE,
      payload: { type: 'admin.poll' },
    });
    yield delay(12000);
  }
}

/**
 * Admin live updates: Mercure SSE when hub is configured, else periodic refresh poll.
 */
export function* adminLiveUpdatesLoop() {
  yield take(AUTH_BOOTSTRAP_COMPLETE);
  yield take(RT_CONNECT);

  while (true) {
    let auth = yield select(selectAuth);
    if (!auth?.token) {
      yield take(USER_LOGIN_COMPLETE);
      auth = yield select(selectAuth);
    }

    if (!isAdmin(auth)) {
      yield delay(3000);
      continue;
    }

    let config = { enabled: false };
    try {
      config = yield call(fetchRealtimeConfig);
    } catch (e) {
      // API unreachable — retry later
      yield delay(5000);
      continue;
    }

    if (!config?.enabled || !config?.hubUrl) {
      yield put({
        type: RT_MESSAGE,
        payload: {
          type: 'ws.info',
          message:
            'Live updates: Mercure not configured on server. Polling every 12s instead.',
        },
      });
      yield call(adminPollingFallback);
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
