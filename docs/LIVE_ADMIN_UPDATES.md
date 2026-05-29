# Live admin updates (website purchase → phone)

## Scenario

- **Admin** logged in on the **mobile app**
- **User** buys a ticket on the **website**
- Admin dashboard/events **update automatically** (no manual refresh)

## How it works

| Step | What happens |
|------|----------------|
| 1 | User completes purchase on [Comodo Booking](https://webdevcomodo-production-8ae6.up.railway.app) |
| 2 | Symfony publishes `ticket.purchased` to Mercure (SSE hub) |
| 3 | Admin app subscribes to topic `/topics/admin/tickets` |
| 4 | App refetches events + shows a local notification |

## Fallback

If Mercure is **not** configured on Railway yet, the app **polls every 12 seconds** while you are logged in as admin (still no manual refresh needed, slight delay).

## Backend requirement

See [Comodo-booking `docs/MERCURE_RAILWAY.md`](../../Comodo-booking/docs/MERCURE_RAILWAY.md) — deploy a Mercure hub and set `MERCURE_URL`, `MERCURE_PUBLIC_URL`, `MERCURE_JWT_SECRET` on Symfony.

Check: `GET https://webdevcomodo-production-8ae6.up.railway.app/api/realtime/config` should return `"enabled": true`.
