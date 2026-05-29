import { all } from 'redux-saga/effects';
import { authBootstrap, authLogout, googleLogin, userLogin } from './auth';
import { notificationIngestWatcher, notificationLogoutClear } from './notifications';
import { liveUpdatesLoop } from './realtime';
import { wsConnectLoop, wsSendPing } from './ws';

export default function* rootSaga() {
  yield all([
    userLogin(),
    googleLogin(),
    authBootstrap(),
    authLogout(),
    notificationIngestWatcher(),
    notificationLogoutClear(),
    liveUpdatesLoop(),
    wsConnectLoop(),
    wsSendPing(),
  ]);
}
