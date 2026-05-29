# Live updates & notifications (Mercure + WebSocket)

## What triggers updates

| Action | Message `type` | Who gets notified |
|--------|----------------|-------------------|
| Ticket purchased (app or website) | `ticket.purchased` | Admin: new sale; user: confirmation |
| Event created | `event.created` | All subscribed clients |
| Event updated | `event.updated` | All subscribed clients |
| Event deleted | `event.deleted` | All subscribed clients |

Purchases and event saves from the **mobile app** also broadcast locally (`rtPublish`) so lists refresh and Notifee shows a notification even before the server pushes.

## Transport

1. **Mercure (SSE)** — primary on Railway when `GET /api/realtime/config` returns `"enabled": true`. All signed-in users subscribe via `/api/realtime/mercure-token`.
2. **WebSocket** — `wss://<api-host>/ws?token=<jwt>` when the Symfony WS server is running (local port **8001** in dev).
3. **Admin polling** — every **3s** in `useAdminLiveUpdates` (`ADMIN_POLL_INTERVAL_MS` in `src/app/realtime/types.js`). Instant refresh also on Mercure events (tickets, events).

## Backend requirement

Symfony must publish JSON to Mercure (and optionally WebSocket) on:

- `POST /api/tickets` → `{ "type": "ticket.purchased", "eventTitle", "customerEmail", "price", ... }`
- `POST /api/events` → `{ "type": "event.created", "eventTitle", ... }`
- `PUT/PATCH /api/events/{id}` → `event.updated`
- `DELETE /api/events/{id}` → `event.deleted`

See [Comodo-booking `docs/MERCURE_RAILWAY.md`](../../Comodo-booking/docs/MERCURE_RAILWAY.md).

Check: `GET https://webdevcomodo-production-8ae6.up.railway.app/api/realtime/config` should return `"enabled": true`.
