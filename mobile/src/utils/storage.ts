import * as Keychain from 'react-native-keychain';

/**
 * Secure storage for the authentication JWT, backed by the iOS Keychain
 * and Android Keystore via react-native-keychain.
 */

const KEYCHAIN_SERVICE = 'com.serpentis.app.auth';
const KEYCHAIN_USERNAME = 'serpentis_auth_token';

export async function saveToken(token: string): Promise<void> {
  try {
    await Keychain.setGenericPassword(KEYCHAIN_USERNAME, token, {
      service: KEYCHAIN_SERVICE,
    });
  } catch  {
    throw new Error('Failed to securely store the authentication token.');
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (!credentials) {
      return null;
    }

    return credentials.password;
  } catch  {
    // If the Keychain read fails (corrupted entry, permission issue, etc.)
    // we treat it as "no session" rather than crashing the app.
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch  {
    // Best-effort clear — nothing meaningful to recover from here.
  }
}
