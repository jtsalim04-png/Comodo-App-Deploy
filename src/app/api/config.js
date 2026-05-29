import { Platform } from 'react-native';

/**
 * Deployed Comodo website + API (Symfony on Railway).
 * @see https://webdevcomodo-production-8ae6.up.railway.app
 */
export const PRODUCTION_API_URL =
  'https://webdevcomodo-production-8ae6.up.railway.app';

/**
 * Set true to use local Symfony instead of Railway (symfony server:start → port 8000).
 * For USB debugging with local API: true + `npm run android:reverse`
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
 * Railway/production Symfony serves HTTPS only — no WebSocket server on that host yet.
 * When false, the app uses the public echo demo server for the realtime UI.
 */
export const USE_BACKEND_WEBSOCKET = USE_LOCAL_API;

/** WebSocket — only used when USE_BACKEND_WEBSOCKET is true (local port 8001). */
export const WS_URL = USE_LOCAL_API
  ? `ws://${DEV_HOST}:8001`
  : `wss://${new URL(BASE_URL).host}`;

/** Public echo server used when backend WebSocket is unavailable. */
export const WS_DEMO_ECHO_URL = 'wss://echo.websocket.org';

/**
 * Mercure hub (optional). Same host as API when deployed.
 */
export const MERCURE_HUB_URL = `${BASE_URL}/.well-known/mercure`;
