# ComodoApp ↔ Comodo-booking alignment

Separate projects. This document **compares** them and records how the mobile app is **aligned** to the web app—not a single merged deployment.

| Project | Repo / path | Role |
|---------|-------------|------|
| **Comodo website** | `ComodoWebsite` (Symfony on port 8000) | Web + JSON API |
| **ComodoApp** | This repo | React Native customer (and admin) app |

---

## Customer navigation

| Web (`base.html.twig`) | Mobile (`UserNav` tabs) | Aligned |
|------------------------|-------------------------|---------|
| Dashboard | Dashboard | Yes |
| Order Tickets | Order tickets | Yes |
| My Tickets | My tickets | Yes |
| My Profile | Profile | Yes |
| Logout | Profile → Log out | Yes |

---

## Auth

| Feature | Web | Mobile |
|---------|-----|--------|
| Login | Form + session | `POST /api/login` → JWT |
| Register | Form | `POST /api/register` |
| Email verification | Required before login | Same (403 if unverified) |
| Roles | USER, ORGANIZER, ADMIN | Admin → `AdminNav`, else `UserNav` |

---

## Events

| Feature | Web | Mobile |
|---------|-----|--------|
| List upcoming | Dashboard carousel | Dashboard + Order tickets |
| Event detail | `/orders/{id}` | `UserEventDetail` |
| Fields | title, description, date, location, price, seatType, organizer | Same |
| API | Server-rendered + `/api/events` | `GET /api/events`, `GET /api/events/{id}` |

---

## Ticket purchase

| Aspect | Web (`OrderController`) | Mobile (aligned) |
|--------|-------------------------|------------------|
| Action | `POST /orders/{id}/purchase` (CSRF) | `POST /api/tickets` `{ eventId }` |
| Status after buy | `confirmed` | Same (via API) |
| Success copy | “Ticket purchased successfully! Your payment is marked as completed.” | Same alert text |
| Button label | “Purchase Now” | “Purchase Now” |
| Confirm | JS `confirm(...)` before submit | `Alert` confirm before API call |

**Note:** The running website server must expose `ApiTicketController` at `/api/tickets` (same contract as `src/app/api/tickets.js`).

---

## QR code & downloadable ticket

| Aspect | Web (`order/show.html.twig`) | Mobile (aligned) |
|--------|------------------------------|------------------|
| QR content | `ticket.qrCodePath` (JSON from server) | Same field → `getTicketQrValue()` |
| QR JSON keys | ticketId, eventId, customerId, price, status, purchaseDate, nonce, issuedAt | Must match server payload |
| Ticket # | `ticket.id` | Shown on pass |
| Holder | firstName + lastName | `holderName` |
| Date & time | Single formatted field | Combined on pass |
| Location / Price / Seat | Yes | Yes |
| Download | HTML file via JS | PNG via Share (`react-native-view-shot`) |

---

## My tickets list

| Column / field | Web (`my_tickets.html.twig`) | Mobile (`TicketCard`) |
|----------------|------------------------------|------------------------|
| Event | title | title |
| Date | formatted | yes |
| Location | yes | yes |
| Price | ₱ formatted | yes |
| Status | title case | yes |
| Purchased | purchaseDate | yes |
| Open ticket | order show + preview | Tap → `UserTicketDetail` |

---

## Admin

| Web ([Comodo-booking](https://github.com/jtsalim04-png/Comodo-booking)) | Mobile |
|-----|--------|
| Overview (stats, role chart, top events) | Admin tab **Overview** → `GET /api/admin/dashboard` |
| Users (CRUD, toggle status, reset password) | Admin tab **Users** → `/api/admin/users` |
| Events (CRUD) | Admin tab **Events** → `/api/events` |
| Tickets / Sales (list, create, delete, view) | Admin tab **Tickets** → `/api/admin/tickets` |
| Activity logs (filters) | Admin tab **Logs** → `/api/admin/activity-logs` |

Mobile uses the hosted website API (`PRODUCTION_API_URL` in `config.js`). Admin JSON routes live under `/api/admin/*` (`ApiAdminController` on the Symfony server). The app shows a 404 hint only when the dashboard route is missing on the deployed host.

---

## API surface (mobile expects)

Base URL: `src/app/api/config.js` → `BASE_URL` (port **8000** only — same Symfony host as the website).

| Port | Service |
|------|---------|
| **8000** | Comodo website + `/api/*` (mobile uses this) |
| **8081** | Database (server only; mobile does **not** use this) |
| **8082** | Metro JS dev server (`npm start` / `npm run android`) |

Physical Android + USB: run `npm run android:reverse` (forwards 8000 + 8082), then API is `http://127.0.0.1:8000`. Events are **only** loaded from `/api/events` (no local demo list).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/login` | JWT |
| POST | `/api/register` | Account |
| GET | `/api/events` | List |
| GET | `/api/events/{id}` | Detail |
| GET | `/api/tickets` | My tickets |
| GET | `/api/tickets/{id}` | One ticket |
| POST | `/api/tickets` | Purchase |

---

## Intentional differences

| Topic | Reason |
|-------|--------|
| Deployed separately | Two repos; configure `BASE_URL` per environment |
| Download format | Web = HTML; mobile = image share (platform limitation) |
| About / Contact | Web public pages; not in mobile app |

---

## Parity checklist (Comodo website server)

To match mobile without “merging” repos, the web project should expose:

- [x] `POST /api/tickets` with same logic as `order_purchase`
- [x] `GET /api/tickets` filtered by logged-in customer
- [x] `TicketQrService` writing the same JSON into `qr_code_path`
