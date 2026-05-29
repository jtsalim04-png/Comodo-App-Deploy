import { eventChannel } from 'redux-saga';
import { call, cancelled, delay, put, select, take, takeLatest } from 'redux-saga/effects';
import { createAuthedWebSocket, createDemoEchoWebSocket } from '../api/ws';
import { USE_BACKEND_WEBSOCKET, USE_LOCAL_API } from '../api/config';
import {
  clearActiveWebSocket,
  sendWebSocketMessage,
  setActiveWebSocket,
} from '../api/wsConnection';
import { showLocalNotification } from '../api/notifications';
import { RT } from '../realtime/types';
import {
  AUTH_BOOTSTRAP_COMPLETE,
  RT_CONNECTED,
  RT_DISCONNECTED,
  RT_MESSAGE,
  USER_LOGIN_COMPLETE,
  WS_SEND_PING,
} from '../actions';

const selectApiJwt = state => state?.auth?.data?.token ?? null;
const selectAuth = state => state.auth?.data ?? null;

function createSocketChannel(socket) {
  return eventChannel(emit => {
    socket.onopen = () => emit({ type: 'open' });
    socket.onclose = () => emit({ type: 'close' });
    socket.onerror = () => emit({ type: 'error' });
    socket.onmessage = event => emit({ type: 'message', data: event?.data });

    return () => {
      try {
        socket.close();
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

function* runSocketSession(socket, { demo = false } = {}) {
  setActiveWebSocket(socket);
  const channel = yield call(createSocketChannel, socket);
  const mode = demo ? 'demo' : 'backend';

  try {
    while (true) {
      const evt = yield take(channel);
      if (evt.type === 'open') {
        yield put({ type: RT_CONNECTED, payload: { mode } });
        if (demo) {
          socket.send('Comodo WebSocket demo ping');
        }
      } else if (evt.type === 'close' || evt.type === 'error') {
        yield put({ type: RT_DISCONNECTED });
        return false;
      } else if (evt.type === 'message') {
        const payload = safeParseMessage(evt.data);
        const normalized = demo
          ? { type: RT.WS_ECHO, message: payload?.data ?? payload }
          : payload;
        yield put({ type: RT_MESSAGE, payload: normalized });
        if (!demo) {
          yield call(notifyIncomingPayload, normalized);
        }
      }
    }
  } finally {
    channel.close();
    clearActiveWebSocket(socket);
    try {
      socket.close();
    } catch (e) {
      // ignore
    }
    if (yield cancelled()) {
      yield put({ type: RT_DISCONNECTED });
    }
  }
}

function* connectDemoEcho() {
  yield put({
    type: RT_MESSAGE,
    payload: {
      type: RT.WS_INFO,
      message:
        'Backend WebSocket unavailable. Connected to echo demo (Profile screen only).',
    },
  });
  const echoSocket = yield call(createDemoEchoWebSocket);
  yield call(runSocketSession, echoSocket, { demo: true });
}

export function* wsConnectLoop() {
  yield take(AUTH_BOOTSTRAP_COMPLETE);

  while (true) {
    if (!USE_BACKEND_WEBSOCKET) {
      if (USE_LOCAL_API) {
        yield call(connectDemoEcho);
      }
      yield delay(5000);
      continue;
    }

    let token = yield select(selectApiJwt);
    if (!token) {
      yield take(USER_LOGIN_COMPLETE);
      token = yield select(selectApiJwt);
    }

    if (!token) {
      yield delay(3000);
      continue;
    }

    const backendSocket = yield call(createAuthedWebSocket, token);
    const backendOk = yield call(runSocketSession, backendSocket, { demo: false });

    if (!backendOk && USE_LOCAL_API) {
      yield call(connectDemoEcho);
    }

    yield delay(3000);
  }
}

export function* wsSendPingAsync() {
  const sent = sendWebSocketMessage(
    JSON.stringify({ type: 'ping', at: new Date().toISOString() }),
  );
  if (!sent) {
    yield call(showLocalNotification, {
      title: 'WebSocket',
      body: 'Not connected. Wait for Connected status or check your server.',
    });
  }
}

export function* wsSendPing() {
  yield takeLatest(WS_SEND_PING, wsSendPingAsync);
}
