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
export const RT_PUBLISH = 'RT_PUBLISH';
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

/** Broadcast a realtime event locally (e.g. after REST purchase/create). */
export const rtPublish = payload => ({
  type: RT_PUBLISH,
  payload,
});

export const wsSendPing = () => ({
  type: WS_SEND_PING,
});

export const NOTIFICATION_INGEST = 'NOTIFICATION_INGEST';
export const NOTIFICATION_MARK_READ = 'NOTIFICATION_MARK_READ';
export const NOTIFICATION_MARK_ALL_READ = 'NOTIFICATION_MARK_ALL_READ';
export const NOTIFICATION_CLEAR = 'NOTIFICATION_CLEAR';

export const notificationIngest = payload => ({
  type: NOTIFICATION_INGEST,
  payload,
});

export const notificationMarkRead = id => ({
  type: NOTIFICATION_MARK_READ,
  payload: id,
});

export const notificationMarkAllRead = () => ({
  type: NOTIFICATION_MARK_ALL_READ,
});

export const notificationClear = () => ({
  type: NOTIFICATION_CLEAR,
});
