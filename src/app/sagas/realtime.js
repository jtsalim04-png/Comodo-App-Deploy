import { eventChannel } from 'redux-saga';
import { call, cancelled, delay, put, select, take } from 'redux-saga/effects';
import { createMercureEventSource } from '../api/mercure';
import {
  AUTH_BOOTSTRAP_COMPLETE,
  RT_CONNECTED,
  RT_CONNECT,
  RT_DISCONNECTED,
  RT_MESSAGE,
  USER_LOGIN_COMPLETE,
} from '../actions';

const selectApiJwt = state => state?.auth?.data?.token ?? null;

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

/**
 * Mercure expects a *Mercure JWT* to authorize private topics.
 * For now we connect without hub auth. For private notifications, add an API
 * endpoint that returns a Mercure JWT for the current user.
 */
export function* realtimeLoop() {
  // wait until bootstrap happens (so we know if we have a token)
  yield take(AUTH_BOOTSTRAP_COMPLETE);

  // optional manual trigger; App dispatches RT_CONNECT on startup
  yield take(RT_CONNECT);

  while (true) {
    // wait for login to exist
    const token = yield select(selectApiJwt);
    if (!token) {
      yield take(USER_LOGIN_COMPLETE);
      continue;
    }

    // Public topic examples (adjust to your backend publishing):
    const topics = [
      'comodo://user/notifications', // can be public or user-scoped later
    ];

    const es = yield call(createMercureEventSource, { topics });
    const ch = yield call(createSseChannel, es);

    try {
      while (true) {
        const evt = yield take(ch);
        if (evt.type === 'open') {
          yield put({ type: RT_CONNECTED });
        } else if (evt.type === 'error') {
          yield put({ type: RT_DISCONNECTED });
          break;
        } else if (evt.type === 'message') {
          yield put({ type: RT_MESSAGE, payload: safeParseMessage(evt.data) });
        }
      }
    } finally {
      ch.close();
      if (yield cancelled()) {
        try {
          es.close();
        } catch (e) {}
        yield put({ type: RT_DISCONNECTED });
        return;
      }
    }

    yield delay(1500);
  }
}

