import { RT } from '../realtime/types';
import { isAdmin } from '../../utils/roles';
import { ROUTES } from '../../utils';

export function getNotificationNavigationTarget(payload, authData) {
  if (!payload?.type) {
    return null;
  }

  const eventId = payload.eventId ?? payload.event?.id;
  const ticketId = payload.ticketId ?? payload.ticket?.id;
  const admin = isAdmin(authData);

  if (admin) {
    switch (payload.type) {
      case RT.TICKET_PURCHASED:
        if (ticketId != null) {
          return {
            targetRoute: ROUTES.ADMIN_TICKET_DETAIL,
            targetParams: { ticketId: Number(ticketId) },
          };
        }
        return { targetRoute: ROUTES.ADMIN_TICKETS, targetParams: {} };
      case RT.EVENT_CREATED:
        return { targetRoute: ROUTES.ADMIN_EVENTS, targetParams: {} };
      case RT.EVENT_UPDATED:
        if (eventId != null) {
          return {
            targetRoute: ROUTES.ADMIN_EVENT_FORM,
            targetParams: { mode: 'edit', event: { id: Number(eventId) } },
          };
        }
        return { targetRoute: ROUTES.ADMIN_EVENTS, targetParams: {} };
      case RT.EVENT_DELETED:
        return { targetRoute: ROUTES.ADMIN_EVENTS, targetParams: {} };
      default:
        return null;
    }
  }

  switch (payload.type) {
    case RT.TICKET_PURCHASED:
      if (ticketId != null) {
        return {
          targetRoute: ROUTES.USER_TICKET_DETAIL,
          targetParams: { ticketId: Number(ticketId) },
        };
      }
      return { targetRoute: ROUTES.USER_MY_TICKETS, targetParams: {} };
    case RT.EVENT_CREATED:
    case RT.EVENT_UPDATED:
      if (eventId != null) {
        return {
          targetRoute: ROUTES.USER_EVENT_DETAIL,
          targetParams: { eventId: Number(eventId) },
        };
      }
      return { targetRoute: ROUTES.USER_EVENTS, targetParams: {} };
    case RT.EVENT_DELETED:
      return { targetRoute: ROUTES.USER_EVENTS, targetParams: {} };
    default:
      return null;
  }
}
