# Mobile App Submission Checklist (30 pts rubric)

## Deliverables covered

| Requirement | Status | Where |
|-------------|--------|--------|
| Signed release APK | Scripts + Gradle | `npm run android:keystore` then `npm run android:apk` → `dist/ComodoApp-release.apk` |
| WebSocket realtime demo | Screen + saga | Profile → **WebSocket & notifications demo** |
| Local notifications | Notifee | Auto on WS message + **Send test local notification** button |
| Security notes | Document | [`SECURITY.md`](../SECURITY.md) |

---

## 1. Build signed release APK

### One-time: create release keystore

```powershell
cd C:\Users\Jefferson\Documents\AppDev\ComodoApp
npm run android:keystore
```

This creates:

- `android/app/keystores/comodo-release.keystore`
- `android/app/keystore.properties` (gitignored)

Register **SHA-1** and **SHA-256** from the script output in Firebase → Project settings → Your Android app.

### Build APK

```powershell
npm run android:apk
```

Output: **`dist/ComodoApp-release.apk`** (signed with your release key).

Install on a physical device:

```powershell
adb install -r dist\ComodoApp-release.apk
```

---

## 2. WebSocket realtime demo (grader steps)

1. Install the release APK on a **physical** Android phone.
2. Log in with email/password (Symfony API on port 8000; use `npm run android:reverse` if USB debugging).
3. Open **Profile** → **WebSocket & notifications demo**.
4. Observe:
   - **Status: Connected** (backend `ws://127.0.0.1:8001` when WS server runs, or echo fallback).
   - **Recent messages** list updates.
5. Tap **Send WebSocket ping** — server/echo should respond; message appears in the list.
6. Tap **Send test local notification** — system notification appears.

Backend WebSocket URL (dev): `ws://<host>:8001/?token=<jwt>` — see `src/app/api/config.js`.

---

## 3. Local notifications

- Permission requested on app launch (Android 13+).
- Incoming WebSocket/Mercure-style payloads trigger a local notification via Notifee.
- Manual test: demo screen → **Send test local notification**.

---

## 4. Firebase Test Lab (physical devices, no emulators)

1. Build release APK (above).
2. [Firebase Console](https://console.firebase.google.com) → **Test Lab** → **Run a test**.
3. Upload `dist/ComodoApp-release.apk`.
4. Select **Robo test** (or instrumentation if you add tests later).
5. Under devices, choose **Physical devices** only (filter out virtual).
6. Run test and review:
   - **Crashes / ANRs**
   - **Screenshots & video**
   - **Logcat** for WebSocket/notification errors

---

## 5. Security notes for reviewers

See [`SECURITY.md`](../SECURITY.md): Keychain JWT storage, HTTPS recommendation, WS token handling, secrets gitignore, and production hardening list.
