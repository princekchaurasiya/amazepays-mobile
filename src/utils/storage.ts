import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEY = 'amazepays_auth';

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  }

  return await SecureStore.getItemAsync(STORAGE_KEY);
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
