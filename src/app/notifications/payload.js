import { RT } from '../realtime/types';

const TYPE_ALIASES = {
  ticket_purchased: RT.TICKET_PURCHASED,
  'ticket-purchased': RT.TICKET_PURCHASED,
  event_created: RT.EVENT_CREATED,
  event_updated: RT.EVENT_UPDATED,
  event_deleted: RT.EVENT_DELETED,
};

export function normalizeRealtimePayload(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const type = TYPE_ALIASES[raw.type] || raw.type;
  return { ...raw, type };
}

export function getBuyerLabel(payload) {
  if (payload.customerName?.trim()) {
    return payload.customerName.trim();
  }
  if (payload.holderName?.trim() && payload.holderName !== 'Guest') {
    return payload.holderName.trim();
  }
  const first = payload.firstName || payload.customerFirstName;
  const last = payload.lastName || payload.customerLastName;
  if (first || last) {
    return `${first || ''} ${last || ''}`.trim();
  }
  if (payload.customerEmail) {
    return payload.customerEmail;
  }
  if (payload.holderEmail) {
    return payload.holderEmail;
  }
  return 'A customer';
}

export function buildTicketPurchasedPayload({
  event,
  ticket,
  user,
  customer,
  eventId,
  eventTitle,
  price,
  message,
} = {}) {
  const ev = event || ticket?.event || {};
  const person = customer || user || {};
  const title = eventTitle || ev.title || 'Event';
  const buyerName =
    [person.firstName, person.lastName].filter(Boolean).join(' ').trim() ||
    person.holderName ||
    person.name ||
    null;

  return normalizeRealtimePayload({
    type: RT.TICKET_PURCHASED,
    eventTitle: title,
    eventId: eventId ?? ev.id ?? ticket?.eventId,
    ticketId: ticket?.id,
    price: price ?? ticket?.price ?? ev.price,
    customerEmail: person.email || ticket?.holderEmail || person.holderEmail,
    customerName: buyerName || ticket?.holderName,
    holderName: ticket?.holderName,
    holderEmail: ticket?.holderEmail,
    message,
  });
}

export function ticketToPurchasedPayload(ticket) {
  if (!ticket) {
    return null;
  }
  return buildTicketPurchasedPayload({ ticket, event: ticket.event });
}
