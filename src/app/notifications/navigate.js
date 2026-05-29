import { navigateFromNotification } from '../../navigations/navigationRef';
import { ROUTES } from '../../utils';

const ADMIN_TAB_ROUTES = new Set([
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_EVENTS,
  ROUTES.ADMIN_TICKETS,
  ROUTES.ADMIN_ACTIVITY_LOGS,
]);

const USER_TAB_ROUTES = new Set([
  ROUTES.USER_DASHBOARD,
  ROUTES.USER_EVENTS,
  ROUTES.USER_MY_TICKETS,
  ROUTES.USER_PROFILE,
]);

export function navigateFromNotificationItem(item) {
  if (!item?.targetRoute) {
    return;
  }

  const { targetRoute, targetParams = {} } = item;

  if (ADMIN_TAB_ROUTES.has(targetRoute)) {
    navigateFromNotification('AdminTabs', {
      screen: targetRoute,
      params: targetParams,
    });
    return;
  }

  if (USER_TAB_ROUTES.has(targetRoute)) {
    navigateFromNotification('UserTabs', {
      screen: targetRoute,
      params: targetParams,
    });
    return;
  }

  navigateFromNotification(targetRoute, targetParams);
}

export function navigateFromNotificationData(data) {
  if (!data) {
    return;
  }

  let targetParams = data.targetParams || {};
  if (data.targetParamsJson) {
    try {
      targetParams = JSON.parse(data.targetParamsJson);
    } catch {
      targetParams = {};
    }
  }

  if (data.targetRoute) {
    navigateFromNotificationItem({
      targetRoute: data.targetRoute,
      targetParams,
    });
  }
}
