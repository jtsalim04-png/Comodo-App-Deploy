import { takeLatest, call, put } from 'redux-saga/effects';
import {
  USER_LOGIN,
  USER_LOGIN_REQUEST,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  AUTH_BOOTSTRAP,
  AUTH_BOOTSTRAP_COMPLETE,
} from '../actions';
import { userLogin as userLoginApi } from '../api/auth';
import { clearJwt, getJwt, saveJwt } from '../api/secureToken';
import { isTokenExpired } from '../api/token';
import { RESET_USER_LOGIN } from '../actions';

export function* userLoginAsync(action) {
  console.log('User login saga started: ', action);

  try {
    yield put({ type: USER_LOGIN_REQUEST });

    const data = yield call(userLoginApi, action.payload);

    if (!data?.token) {
      throw new Error('Login succeeded but no token was returned from the server.');
    }

    yield call(saveJwt, data.token);

    yield put({
      type: USER_LOGIN_COMPLETE,
      payload: {
        token: data.token,
        user: data.user || { email: action.payload?.email },
      },
    });
  } catch (error) {
    console.log('User login saga error: ', error);
    yield put({
      type: USER_LOGIN_ERROR,
      error: error?.message || 'Login failed',
    });
  }
}

export function* authBootstrapAsync() {
  try {
    const token = yield call(getJwt);
    if (!token || isTokenExpired(token)) {
      if (token) {
        yield call(clearJwt);
      }
      yield put({ type: AUTH_BOOTSTRAP_COMPLETE, payload: { token: null } });
      return;
    }

    yield put({
      type: USER_LOGIN_COMPLETE,
      payload: { token, user: null },
    });
    yield put({ type: AUTH_BOOTSTRAP_COMPLETE, payload: { token } });
  } catch (e) {
    yield put({ type: AUTH_BOOTSTRAP_COMPLETE, payload: { token: null } });
  }
}

export function* authLogoutAsync() {
  try {
    yield call(clearJwt);
  } catch (e) {
    // no-op
  }
}

export function* userLogin() {
  yield takeLatest(USER_LOGIN, userLoginAsync);
}

export function* authBootstrap() {
  yield takeLatest(AUTH_BOOTSTRAP, authBootstrapAsync);
}

export function* authLogout() {
  yield takeLatest(RESET_USER_LOGIN, authLogoutAsync);
}
