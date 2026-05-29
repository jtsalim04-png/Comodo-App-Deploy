import { call, put } from 'redux-saga/effects';
import { USER_LOGIN_COMPLETE, USER_LOGIN_ERROR, USER_LOGIN_REQUEST } from '../actions';
import { saveJwt } from '../api/secureToken';
import { getUserFromToken } from '../api/token';

/** Shared post-login flow for email/password and Google. */
export function* completeAuthFromApiResponse(data, fallbackEmail) {
  if (!data?.token) {
    throw new Error('Login succeeded but no token was returned from the server.');
  }

  const fromJwt = getUserFromToken(data.token);
  const apiUser = data.user || {};
  const user = {
    ...fromJwt,
    ...apiUser,
    email: apiUser.email || fromJwt?.email || fallbackEmail,
    roles:
      Array.isArray(apiUser.roles) && apiUser.roles.length > 0
        ? apiUser.roles
        : fromJwt?.roles || [],
  };

  yield call(saveJwt, data.token);

  yield put({
    type: USER_LOGIN_COMPLETE,
    payload: {
      token: data.token,
      user,
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
