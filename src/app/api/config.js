import { Platform } from 'react-native';

/**
 * Your running Comodo website Symfony server (symfony server:start → port 8000).
 * Same API as the website: /api/login, /api/events, /api/tickets.
 */
export const API_PORT = 8000;

/** Metro bundler only — not used for API calls. See package.json `start` / `android`. */
export const METRO_PORT = 8082;

/**
 * Override when testing on a phone over Wi‑Fi (no USB / no adb reverse).
 * Example: '192.168.5.243' (your PC’s IPv4 on the same network as the phone)
 */
export const DEV_API_HOST_OVERRIDE = null;

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

/**
 * Dev ports — two different servers:
 * - 8000 → Comodo website API (BASE_URL below) — same Symfony app as the website
 * - 8081 → database only (not used by this app)
 * - 8082 → Metro (JS UI) — set in metro.config.js, gradle.properties, package.json
 */
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
export const BASE_URL = `http://${DEV_HOST}:${API_PORT}`;

/**
 * Mercure hub URL (Server-Sent Events).
 * In dev you typically run Mercure on 3000 or behind your reverse proxy.
 * Update to match your deployment.
 */
export const MERCURE_PORT = 3000;
export const MERCURE_HUB_URL = `http://${DEV_HOST}:${MERCURE_PORT}/.well-known/mercure`;
