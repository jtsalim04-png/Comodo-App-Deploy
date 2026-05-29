/** Holds the active WebSocket instance for demo send from UI. */
let activeSocket = null;

export function setActiveWebSocket(socket) {
  activeSocket = socket;
}

export function clearActiveWebSocket(socket) {
  if (activeSocket === socket) {
    activeSocket = null;
  }
}

export function sendWebSocketMessage(text) {
  if (!activeSocket || activeSocket.readyState !== 1) {
    return false;
  }
  activeSocket.send(text);
  return true;
}
