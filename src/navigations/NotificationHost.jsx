import { useEffect } from 'react';
import notifee, { EventType } from '@notifee/react-native';

import NotificationPanel from '../components/NotificationPanel';
import { navigateFromNotificationData } from '../app/notifications/navigate';
import useAdminSaleNotifications from '../hooks/useAdminSaleNotifications';
const NotificationHost = ({ children, enabled }) => {
  useAdminSaleNotifications({ enabled });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        navigateFromNotificationData(detail.notification?.data);
      }
    });

    return unsubscribe;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    notifee.getInitialNotification().then(initial => {
      if (initial?.notification?.data) {
        navigateFromNotificationData(initial.notification.data);
      }
    });
  }, [enabled]);

  return (
    <>
      {children}
      {enabled ? <NotificationPanel /> : null}
    </>
  );
};

export default NotificationHost;
