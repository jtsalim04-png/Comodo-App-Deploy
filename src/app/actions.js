export const USER_LOGIN = 'USER_LOGIN';
export const USER_GOOGLE_LOGIN = 'USER_GOOGLE_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_COMPLETE = 'USER_LOGIN_COMPLETE';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const RESET_USER_LOGIN = 'RESET_USER_LOGIN';

export const AUTH_BOOTSTRAP = 'AUTH_BOOTSTRAP';
export const AUTH_BOOTSTRAP_COMPLETE = 'AUTH_BOOTSTRAP_COMPLETE';

export const RT_CONNECT = 'RT_CONNECT';
export const RT_CONNECTED = 'RT_CONNECTED';
export const RT_DISCONNECTED = 'RT_DISCONNECTED';
export const RT_MESSAGE = 'RT_MESSAGE';
export const WS_SEND_PING = 'WS_SEND_PING';

export const authLogin = payload => ({
  type: USER_LOGIN,
  payload,
});

export const authGoogleLogin = () => ({
  type: USER_GOOGLE_LOGIN,
});

export const authLogout = () => ({
  type: RESET_USER_LOGIN,
});

export const authBootstrap = () => ({
  type: AUTH_BOOTSTRAP,
});

export const rtConnect = () => ({
  type: RT_CONNECT,
});

export const wsSendPing = () => ({
  type: WS_SEND_PING,
});
