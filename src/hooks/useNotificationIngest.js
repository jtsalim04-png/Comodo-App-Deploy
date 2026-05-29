import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ingestNotification } from '../app/notifications/ingest';
import { isBusinessType } from '../app/realtime/types';

/**
 * Ingest Mercure, WebSocket, and local rtPublish messages into the inbox + Notifee.
 */
export default function useNotificationIngest({ enabled = true } = {}) {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth?.data);
  const lastMessage = useSelector(state => state.ws?.lastMessage);
  const lastMessageAt = useSelector(state => state.ws?.lastMessageAt);
  const lastHandledAt = useRef(0);

  useEffect(() => {
    if (!enabled || !auth?.token || !lastMessageAt || !lastMessage) {
      return;
    }
    if (lastMessageAt === lastHandledAt.current) {
      return;
    }
    if (!isBusinessType(lastMessage?.type)) {
      return;
    }

    lastHandledAt.current = lastMessageAt;
    ingestNotification(dispatch, lastMessage, auth);
  }, [auth, dispatch, enabled, lastMessage, lastMessageAt]);
}
