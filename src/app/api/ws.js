import { WS_DEMO_ECHO_URL, WS_URL } from './config';

/**
 * WebSocket with JWT auth via query string (portable on React Native).
 */
export function createAuthedWebSocket(jwt) {
  const url = jwt ? `${WS_URL}?token=${encodeURIComponent(jwt)}` : WS_URL;
  return new WebSocket(url);
}

/** Public echo server for offline/demo grading when backend WS is unavailable. */
export function createDemoEchoWebSocket() {
  return new WebSocket(WS_DEMO_ECHO_URL);
}
