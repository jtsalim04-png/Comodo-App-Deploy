import { Platform } from 'react-native';

/**
 * Hosted Comodo website + JSON API (Symfony).
 * The mobile app runs on your device/emulator; only the website is hosted here.
 * @see https://webdevcomodo-production-8ae6.up.railway.app
 */
export const PRODUCTION_API_URL =
  'https://webdevcomodo-production-8ae6.up.railway.app';

/**
 * false = use PRODUCTION_API_URL (hosted website).
 * true = local Symfony on port 8000 (`symfony server:start` in Comodo-booking) + `npm run android:reverse`
 */
export const USE_LOCAL_API = false;

export const API_PORT = 8000;

/** Metro bundler only — not used for API calls. See package.json `start` / `android`. */
export const METRO_PORT = 8082;

/**
 * Override when testing on a phone over Wi‑Fi against local Symfony (no USB).
 * Example: '192.168.5.243' (your PC’s IPv4 on the same network as the phone)
 * Only applies when USE_LOCAL_API is true.
 */
export const DEV_API_HOST_OVERRIDE = null;

/**
 * OAuth 2.0 Web Client ID from Google Cloud Console (same value as Symfony GOOGLE_CLIENT_ID).
 * Required for Google Sign-In idToken audience verification on the backend.
 */
export const GOOGLE_WEB_CLIENT_ID = null;

const isAndroidEmulator = () => {
  if (Platform.OS !== 'android') {
    return false;
  }
  const model = String(Platform.constants?.Model ?? '');
  const fingerprint = String(Platform.constants?.Fingerprint ?? '');
  return /sdk_gphone|emulator|Android SDK built for x86/i.test(
    `${model} ${fingerprint}`,
  );
};

const resolveDevHost = () => {
  if (DEV_API_HOST_OVERRIDE) {
    return DEV_API_HOST_OVERRIDE;
  }
  if (Platform.OS === 'ios') {
    return '127.0.0.1';
  }
  if (Platform.OS === 'android') {
    return isAndroidEmulator() ? '10.0.2.2' : '127.0.0.1';
  }
  return '127.0.0.1';
};

export const DEV_HOST = resolveDevHost();

const stripTrailingSlash = url => url.replace(/\/$/, '');

const resolveBaseUrl = () => {
  if (!USE_LOCAL_API) {
    return stripTrailingSlash(PRODUCTION_API_URL);
  }
  return `http://${DEV_HOST}:${API_PORT}`;
};

export const BASE_URL = resolveBaseUrl();

/**
 * Try authenticated WebSocket when logged in (local :8001 or wss on API host).
 * Echo demo is only used from the Profile → realtime demo screen when this fails locally.
 */
export const USE_BACKEND_WEBSOCKET = true;

/** WebSocket URL — Symfony WS on 8001 locally, wss on API host in production. */
export const WS_URL = USE_LOCAL_API
  ? `ws://${DEV_HOST}:8001`
  : `wss://${new URL(BASE_URL).host}/ws`;

/** Public echo server used when backend WebSocket is unavailable. */
export const WS_DEMO_ECHO_URL = 'wss://echo.websocket.org';

/**
 * Mercure hub (optional). Same host as API when deployed.
 */
export const MERCURE_HUB_URL = `${BASE_URL}/.well-known/mercure`;
