import { eventChannel } from 'redux-saga';
import { call, cancelled, delay, put, select, take, takeLatest } from 'redux-saga/effects';
import { createAuthedWebSocket, createDemoEchoWebSocket } from '../api/ws';
import {
  clearActiveWebSocket,
  sendWebSocketMessage,
  setActiveWebSocket,
} from '../api/wsConnection';
import { showLocalNotification } from '../api/notifications';
import {
  AUTH_BOOTSTRAP_COMPLETE,
  RT_CONNECTED,
  RT_CONNECT,
  RT_DISCONNECTED,
  RT_MESSAGE,
  USER_LOGIN_COMPLETE,
  WS_SEND_PING,
} from '../actions';

const selectApiJwt = state => state?.auth?.data?.token ?? null;

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

function notificationCopy(payload) {
  if (!payload) {
    return { title: 'Comodo', body: 'Realtime update received.' };
  }
  const type = payload.type || payload.event || 'update';
  const title = payload.title || `Comodo · ${type}`;
  const body =
    payload.message ||
    payload.body ||
    (typeof payload.data === 'string' ? payload.data : null) ||
    JSON.stringify(payload).slice(0, 120);
  return { title, body };
}

function* notifyFromPayload(payload) {
  const { title, body } = notificationCopy(payload);
  yield call(showLocalNotification, { title, body, data: payload || {} });
}

function* runSocketSession(socket, { demo = false } = {}) {
  setActiveWebSocket(socket);
  const channel = yield call(createSocketChannel, socket);

  try {
    while (true) {
      const evt = yield take(channel);
      if (evt.type === 'open') {
        yield put({ type: RT_CONNECTED });
        if (demo) {
          socket.send('Comodo WebSocket demo ping');
        }
      } else if (evt.type === 'close' || evt.type === 'error') {
        yield put({ type: RT_DISCONNECTED });
        return false;
      } else if (evt.type === 'message') {
        const payload = safeParseMessage(evt.data);
        const normalized = demo
          ? { type: 'ws.echo', message: payload?.data ?? payload }
          : payload;
        yield put({ type: RT_MESSAGE, payload: normalized });
        yield call(notifyFromPayload, normalized);
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

export function* wsConnectLoop() {
  yield take(AUTH_BOOTSTRAP_COMPLETE);
  yield take(RT_CONNECT);

  while (true) {
    let token = yield select(selectApiJwt);
    if (!token) {
      yield take(USER_LOGIN_COMPLETE);
      token = yield select(selectApiJwt);
    }

    const backendSocket = yield call(createAuthedWebSocket, token);
    const backendOk = yield call(runSocketSession, backendSocket, { demo: false });

    if (!backendOk) {
      yield put({
        type: RT_MESSAGE,
        payload: {
          type: 'ws.demo',
          message:
            'Backend WebSocket unavailable — switching to public echo demo server.',
        },
      });
      const echoSocket = yield call(createDemoEchoWebSocket);
      yield call(runSocketSession, echoSocket, { demo: true });
    }

    yield delay(2000);
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
