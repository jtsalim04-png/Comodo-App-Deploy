import { Alert } from 'react-native';

import { showApiError } from './apiError';

const ADMIN_FORBIDDEN_MESSAGE =
  'Your account does not have administrator permissions.';

const ADMIN_UNAVAILABLE_MESSAGE =
  'Admin API routes are not available on this server. Confirm the latest Comodo website is deployed to Railway and try again. Events and tickets still use /api/events and /api/tickets.';

/** Classify admin load errors; returns true if handled (no further alert). */
export const classifyAdminLoadError = (error, handlers = {}) => {
  const { setApiUnavailable, setAccessDenied } = handlers;

  if (error?.status === 404) {
    setApiUnavailable?.(true);
    return true;
  }
  if (error?.status === 403 || error?.isForbidden) {
    setAccessDenied?.(true);
    return true;
  }
  if (error?.isUnauthorized) {
    return true;
  }
  return false;
};

export const showAdminApiError = (error, fallback = 'Something went wrong') => {
  if (error?.isUnauthorized) {
    return;
  }
  if (error?.status === 403 || error?.isForbidden) {
    Alert.alert('Admin access required', ADMIN_FORBIDDEN_MESSAGE);
    return;
  }
  if (error?.status === 404) {
    Alert.alert('Admin API not available', ADMIN_UNAVAILABLE_MESSAGE);
    return;
  }
  showApiError(error, fallback);
};
