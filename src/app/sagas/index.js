import { all } from 'redux-saga/effects';
import { authBootstrap, authLogout, googleLogin, userLogin } from './auth';
import { adminLiveUpdatesLoop } from './realtime';
import { wsConnectLoop, wsSendPing } from './ws';

export default function* rootSaga() {
  yield all([
    userLogin(),
    googleLogin(),
    authBootstrap(),
    authLogout(),
    adminLiveUpdatesLoop(),
    wsConnectLoop(),
    wsSendPing(),
  ]);
}
