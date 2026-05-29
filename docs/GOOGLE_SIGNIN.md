# Google Sign-In (mobile + Symfony)

## Backend (`Comodo-booking`)

### Endpoint

`POST /api/auth/google`

```json
{ "idToken": "<google-id-token>" }
```

Response (same shape as `/api/login`):

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "roles": ["ROLE_USER"],
    "verified": true,
    "authType": "google"
  }
}
```

### Database migration

```bash
cd Comodo-booking
php bin/console doctrine:migrations:migrate
```

Adds `user.auth_type` (`local` | `google`).

### Environment

Uses existing `GOOGLE_CLIENT_ID` (OAuth **Web** client ID from Google Cloud Console).

---

## Mobile (`ComodoApp`)

1. In Google Cloud Console, create an **OAuth Web client** (same ID as Symfony `GOOGLE_CLIENT_ID`).
2. Create an **Android** OAuth client with package `com.comodoapp` and your SHA-1 fingerprints.
3. Set in `src/app/api/config.js`:

```javascript
export const GOOGLE_WEB_CLIENT_ID = 'xxxx.apps.googleusercontent.com';
```

4. Rebuild the app: `npm run android`

### Flow

1. User taps **Continue with Google**
2. App obtains Google **idToken** via `@react-native-google-signin/google-signin`
3. App calls `POST /api/auth/google`
4. Symfony verifies token, finds/creates `auth_type=google` user, returns Lexik JWT
5. App stores JWT in Keychain/Keystore (Redux session)
