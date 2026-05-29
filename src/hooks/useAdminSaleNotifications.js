import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAdminTickets } from '../app/api/admin';
import { ingestNotification } from '../app/notifications/ingest';
import { ticketToPurchasedPayload } from '../app/notifications/payload';
import { ADMIN_POLL_INTERVAL_MS } from '../app/realtime/types';
import { isAdmin } from '../utils/roles';

/**
 * When Mercure is off, detect new admin ticket sales by polling /api/admin/tickets.
 */
export default function useAdminSaleNotifications({ enabled = true } = {}) {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth?.data);
  const seenIdsRef = useRef(null);
  const readyRef = useRef(false);

  const checkForNewSales = useCallback(async () => {
    if (!enabled || !auth?.token || !isAdmin(auth)) {
      return;
    }

    try {
      const tickets = await fetchAdminTickets(auth.token);
      const currentIds = new Set(tickets.map(t => String(t.id)));

      if (!readyRef.current) {
        seenIdsRef.current = currentIds;
        readyRef.current = true;
        return;
      }

      for (const ticket of tickets) {
        const id = String(ticket.id);
        if (!seenIdsRef.current.has(id)) {
          const payload = ticketToPurchasedPayload(ticket);
          if (payload) {
            await ingestNotification(dispatch, payload, auth);
          }
        }
      }

      seenIdsRef.current = currentIds;
    } catch {
      // ignore poll errors
    }
  }, [auth, dispatch, enabled]);

  useEffect(() => {
    if (!enabled || !isAdmin(auth)) {
      return undefined;
    }

    checkForNewSales();
    const id = setInterval(checkForNewSales, ADMIN_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [auth, checkForNewSales, enabled]);
}
