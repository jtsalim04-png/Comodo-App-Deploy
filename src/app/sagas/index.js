import { all } from 'redux-saga/effects';
import { authBootstrap, authLogout, userLogin } from './auth';

export default function* rootSaga() {
  yield all([userLogin(), authBootstrap(), authLogout()]);
}
