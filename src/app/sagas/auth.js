import { takeLatest, call, put } from 'redux-saga/effects';
import {
  USER_LOGIN,
  USER_GOOGLE_LOGIN,
  AUTH_BOOTSTRAP,
  AUTH_BOOTSTRAP_COMPLETE,
  RESET_USER_LOGIN,
} from '../actions';
import { userLogin as userLoginApi, googleAuth as googleAuthApi } from '../api/auth';
import { signInWithGoogle } from '../api/googleSignIn';
import { clearJwt, getJwt } from '../api/secureToken';
import { isTokenExpired } from '../api/token';
import {
  authRequestFailed,
  authRequestStart,
  completeAuthFromApiResponse,
} from './authSession';

export function* userLoginAsync(action) {
  try {
    yield call(authRequestStart);
    const data = yield call(userLoginApi, action.payload);
    yield call(completeAuthFromApiResponse, data, action.payload?.email);
  } catch (error) {
    yield call(authRequestFailed, error);
  }
}

export function* googleLoginAsync() {
  try {
    yield call(authRequestStart);
    const idToken = yield call(signInWithGoogle);
    const data = yield call(googleAuthApi, { idToken });
    yield call(completeAuthFromApiResponse, data, data?.user?.email);
  } catch (error) {
    yield call(authRequestFailed, error, 'Google sign-in failed');
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

    yield call(completeAuthFromApiResponse, { token, user: null });
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

export function* googleLogin() {
  yield takeLatest(USER_GOOGLE_LOGIN, googleLoginAsync);
}

export function* authBootstrap() {
  yield takeLatest(AUTH_BOOTSTRAP, authBootstrapAsync);
}

export function* authLogout() {
  yield takeLatest(RESET_USER_LOGIN, authLogoutAsync);
}
