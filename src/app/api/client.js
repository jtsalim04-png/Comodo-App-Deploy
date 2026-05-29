import { Platform } from 'react-native';

import { API_PORT, BASE_URL, USE_LOCAL_API } from './config';
import { isRouteNotFoundError } from './errors';
import { notifySessionExpired } from './session';
import { isJwtAuthError } from './token';

const networkErrorMessage = () => {
  const localHint =
    USE_LOCAL_API && Platform.OS === 'android'
      ? ' On a physical Android device over USB, run: npm run android:reverse'
      : '';
  const localServerHint = USE_LOCAL_API
    ? ` Start your website with symfony server:start on port ${API_PORT}.`
    : ' Check your internet connection and that the deployed server is online.';
  return `Cannot reach the Comodo API at ${BASE_URL}.${localHint}${localServerHint}`;
};

/** Shared fetch wrapper so login/events/tickets get the same network errors. */
export async function fetchWithNetworkHint(url, init) {
  try {
    return await fetch(url, init);
  } catch (networkError) {
    const error = new Error(networkErrorMessage());
    error.cause = networkError;
    throw error;
  }
}

export async function apiRequest(
  path,
  { method = 'GET', token, body, accept = 'application/json' } = {},
) {
  const headers = {
    Accept: accept,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithNetworkHint(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.['hydra:description'] ||
      data?.detail ||
      `Request failed (${response.status})`;

    if (token && isJwtAuthError(response.status, message)) {
      notifySessionExpired(
        typeof message === 'string' && message.toLowerCase().includes('expired')
          ? 'Your login session has expired. Please sign in again.'
          : 'Please sign in again to continue.',
      );
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    error.isUnauthorized = response.status === 401;
    error.isRouteNotFound = isRouteNotFoundError(error);
    throw error;
  }

  return data;
}

export const parseCollection = data => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data?.['hydra:member']) {
    return data['hydra:member'];
  }
  if (data?.member) {
    return data.member;
  }
  return [];
};
