import { rtPublish } from '../actions';
import { ingestNotification } from './ingest';
import { buildTicketPurchasedPayload } from './payload';

/** Local sale or event — refresh lists and show inbox + phone notification. */
export async function publishBusinessEvent(dispatch, authData, payload) {
  dispatch(rtPublish(payload));
  return ingestNotification(dispatch, payload, authData);
}

export async function publishTicketSale(dispatch, authData, details) {
  const payload = buildTicketPurchasedPayload(details);
  return publishBusinessEvent(dispatch, authData, payload);
}
