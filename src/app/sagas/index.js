import { all } from 'redux-saga/effects';
import { authBootstrap, authLogout, userLogin } from './auth';
import { wsConnectLoop, wsSendPing } from './ws';

export default function* rootSaga() {
  yield all([
    userLogin(),
    authBootstrap(),
    authLogout(),
    wsConnectLoop(),
    wsSendPing(),
  ]);
}
