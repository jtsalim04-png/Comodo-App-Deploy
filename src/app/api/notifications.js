import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'comodo-realtime';

let channelReady = false;

export async function ensureNotificationChannel() {
  if (channelReady) {
    return CHANNEL_ID;
  }
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Comodo updates',
      importance: AndroidImportance.HIGH,
    });
  }
  channelReady = true;
  return CHANNEL_ID;
}

export async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

export async function showLocalNotification({ title, body, data } = {}) {
  await ensureNotificationChannel();

  const stringData = {};
  const raw = data || {};
  for (const key of Object.keys(raw)) {
    const value = raw[key];
    if (value != null && typeof value === 'object') {
      stringData[key] = JSON.stringify(value);
    } else {
      stringData[key] = String(value ?? '');
    }
  }

  await notifee.displayNotification({
    title: title || 'Comodo',
    body: body || 'You have a new update.',
    data: stringData,
    android: {
      channelId: CHANNEL_ID,
      pressAction: { id: 'default' },
    },
    ios: {
      foregroundPresentationOptions: {
        banner: true,
        sound: true,
        list: true,
      },
    },
  });
}
