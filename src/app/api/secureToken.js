import * as Keychain from 'react-native-keychain';

const SERVICE = 'comodo.jwt';
const USERNAME = 'jwt';

export async function saveJwt(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Cannot save empty JWT');
  }
  await Keychain.setGenericPassword(USERNAME, token, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getJwt() {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) {
    return null;
  }
  return credentials.password || null;
}

export async function clearJwt() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

