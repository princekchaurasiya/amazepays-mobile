import { clearAuthToken, getAuthToken } from '@/utils/storage';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

const rawBase =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://localhost:8000/api/v1';

/** Avoid double slashes when paths like `/catalog` are appended */
const baseURL = rawBase.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAuthToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 && unauthorizedHandler) {
      try {
        await clearAuthToken();
      } catch {
        /* ignore */
      }
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export function getApiBaseUrl() {
  return baseURL.replace(/\/$/, '');
}
