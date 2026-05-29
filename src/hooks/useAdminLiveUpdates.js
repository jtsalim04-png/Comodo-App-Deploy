import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { showLocalNotification } from '../app/api/notifications';
import { isAdmin } from '../utils/roles';

/**
 * Refetches admin data when a ticket is purchased on the website (Mercure SSE or poll).
 */
export default function useAdminLiveUpdates(onRefresh) {
  const auth = useSelector(state => state.auth);
  const lastMessage = useSelector(state => state.ws?.lastMessage);
  const lastMessageAt = useSelector(state => state.ws?.lastMessageAt);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!isAdmin(auth?.data) || !lastMessageAt || !lastMessage) {
      return;
    }

    const type = lastMessage?.type;
    if (type === 'ticket.purchased' || type === 'admin.poll') {
      onRefreshRef.current?.();

      if (type === 'ticket.purchased') {
        const title = lastMessage.eventTitle || 'New ticket sale';
        const email = lastMessage.customerEmail || 'Customer';
        const price = lastMessage.price != null ? `₱${lastMessage.price}` : '';
        showLocalNotification({
          title: 'New ticket purchased',
          body: [title, email, price].filter(Boolean).join(' · '),
          data: lastMessage,
        });
      }
    }
  }, [auth?.data, lastMessage, lastMessageAt]);
}
