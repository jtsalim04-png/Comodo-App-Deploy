import { all } from 'redux-saga/effects';
import { authBootstrap, authLogout, userLogin } from './auth';
import { realtimeLoop } from './realtime';

export default function* rootSaga() {
  yield all([userLogin(), authBootstrap(), authLogout(), realtimeLoop()]);
}
