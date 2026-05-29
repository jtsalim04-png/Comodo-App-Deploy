import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateFromNotification(route, params = {}) {
  if (!navigationRef.isReady() || !route) {
    return;
  }

  try {
    navigationRef.navigate(route, params);
  } catch {
    // ignore navigation errors (wrong stack state)
  }
}
