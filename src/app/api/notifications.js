import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'comodo-realtime';

let channelReady = false;

export async function ensureNotificationChannel() {
  if (channelReady || Platform.OS !== 'android') {
    channelReady = true;
    return CHANNEL_ID;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Comodo updates',
    importance: AndroidImportance.HIGH,
  });
  channelReady = true;
  return CHANNEL_ID;
}

export async function requestNotificationPermission() {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

export async function showLocalNotification({ title, body, data } = {}) {
  await ensureNotificationChannel();
  await notifee.displayNotification({
    title: title || 'Comodo',
    body: body || 'You have a new update.',
    data: data || {},
    android: {
      channelId: CHANNEL_ID,
      pressAction: { id: 'default' },
    },
  });
}
