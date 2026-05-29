import { call, put } from 'redux-saga/effects';
import { USER_LOGIN_COMPLETE, USER_LOGIN_ERROR, USER_LOGIN_REQUEST } from '../actions';
import { saveJwt } from '../api/secureToken';

/** Shared post-login flow for email/password and Google. */
export function* completeAuthFromApiResponse(data, fallbackEmail) {
  if (!data?.token) {
    throw new Error('Login succeeded but no token was returned from the server.');
  }

  yield call(saveJwt, data.token);

  yield put({
    type: USER_LOGIN_COMPLETE,
    payload: {
      token: data.token,
      user: data.user || { email: fallbackEmail },
    },
  });
}

export function* authRequestStart() {
  yield put({ type: USER_LOGIN_REQUEST });
}

export function* authRequestFailed(error, fallback = 'Login failed') {
  yield put({
    type: USER_LOGIN_ERROR,
    error: error?.message || fallback,
  });
}
