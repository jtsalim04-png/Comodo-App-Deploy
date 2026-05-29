import { getBuyerLabel } from '../notifications/payload';
import { isAdmin } from '../../utils/roles';
import { RT, isBusinessType } from './types';

function formatPrice(value) {
  if (value == null || value === '') {
    return '';
  }
  return `₱${value}`;
}

/**
 * Human-readable title/body for known realtime payloads.
 */
export function getRealtimeNotificationCopy(payload, authData) {
  if (!payload?.type || !isBusinessType(payload.type)) {
    return null;
  }

  const admin = isAdmin(authData);
  const eventTitle = payload.eventTitle || payload.title || 'Event';

  switch (payload.type) {
    case RT.TICKET_PURCHASED: {
      if (admin) {
        const buyer = getBuyerLabel(payload);
        const price = formatPrice(payload.price);
        const extras = [price, payload.ticketId ? `Ticket #${payload.ticketId}` : '']
          .filter(Boolean)
          .join(' · ');
        return {
          title: `${buyer} purchased ${eventTitle}`,
          body: extras || 'New sale',
        };
      }
      return {
        title: 'Ticket confirmed',
        body: payload.message || `Your ticket for "${eventTitle}" is ready.`,
      };
    }
    case RT.EVENT_CREATED:
      return {
        title: admin ? 'New event published' : 'New event available',
        body: eventTitle,
      };
    case RT.EVENT_UPDATED:
      return {
        title: 'Event updated',
        body: eventTitle,
      };
    case RT.EVENT_DELETED:
      return {
        title: 'Event removed',
        body: eventTitle,
      };
    default:
      return null;
  }
}

/**
 * @deprecated Use useNotificationIngest + ingestNotification (inbox + Notifee).
 */
export async function notifyFromRealtimePayload(payload, authData, dispatch) {
  if (!dispatch) {
    return;
  }
  const { ingestNotification } = await import('../notifications/ingest');
  await ingestNotification(dispatch, payload, authData);
}
