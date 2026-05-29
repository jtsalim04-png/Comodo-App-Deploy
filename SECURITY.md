# Comodo Mobile App — Security Notes

## Authentication & session

| Topic | Implementation |
|--------|----------------|
| API auth | JWT from Symfony (`POST /api/login`, future `POST /api/auth/google`) via LexikJWTAuthenticationBundle |
| Token storage | **Not** in AsyncStorage. JWT is stored in **iOS Keychain / Android Keystore** via `react-native-keychain` (`src/app/api/secureToken.js`) |
| In-memory state | Redux holds the active session; cleared on logout |
| Expiry | Client decodes JWT `exp` and logs out; API 401 triggers session-expired handler (`src/app/api/client.js`) |

## Transport

- Development may use `http://` with `usesCleartextTraffic` for local Symfony (`symfony server:start` on port 8000).
- **Production:** serve API over **HTTPS** only; remove cleartext traffic from `AndroidManifest` / network security config.

## WebSocket realtime

- JWT is passed as `?token=` on the WebSocket URL (RN WebSocket cannot set custom headers reliably).
- **Production:** terminate WebSocket behind TLS (`wss://`), validate JWT on the server, and prefer short-lived tokens.
- Demo fallback uses public `wss://echo.websocket.org` only when the backend socket is unreachable (grading/demo).

## Local notifications

- Uses `@notifee/react-native` with an Android notification channel (`comodo-realtime`).
- Notifications are triggered when realtime messages arrive; no push provider keys are embedded in the app.
- Android 13+ requires `POST_NOTIFICATIONS` runtime permission (requested on startup).

## Secrets & build

- Release signing keystore and `android/app/keystore.properties` are **gitignored**.
- Never commit: JWT keys, Google OAuth client secrets, Mercure publisher JWT, payment API keys.
- Use environment variables / CI secrets for production builds.

## Data on device

- Ticket QR payloads are displayed from API responses; treat QR JSON as opaque until validated server-side at scan time.
- `allowBackup="false"` on Android reduces backup exposure of app data.

## Recommended hardening (before store release)

1. Enable **certificate pinning** for API host (e.g. `react-native-ssl-pinning` or native network security config).
2. Obfuscate release builds (`minifyEnabled true`, ProGuard/R8 rules).
3. Add **Google Play App Signing** and register Play + release SHA-1/SHA-256 in Firebase.
4. Implement **Google Sign-In** with server-side `idToken` verification (never trust client-only userinfo).
5. Rate-limit auth and WebSocket endpoints on Symfony.

## Reporting

Report security issues to the project maintainer privately; do not open public issues with exploit details.
