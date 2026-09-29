/**
 * Environment configuration and dynamic settings for HackoWatt API
 * Connects directly to backend server via Bearer Token authorization.
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface AppEnvConfig {
  apiBaseUrl: string;
  bearerToken: string;
  apiKey?: string;
}

/**
 * Extracts host IP address from Expo bundler if available.
 */
export function getExpoHostIp(): string | null {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })?.manifest2?.extra?.expoClient?.hostUri ||
      (Constants as { manifest?: { debuggerHost?: string } })?.manifest?.debuggerHost;

    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host.trim().length > 0 && host !== 'localhost' && host !== '127.0.0.1') {
        return host.trim();
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Determines the direct backend URL:
 * 1. Web browser: connects directly to port 8000 on the current browser host (e.g. localhost or LAN IP).
 * 2. Explicit EXPO_PUBLIC_API_URL if configured in .env.
 * 3. Mobile physical device (Expo Go): connects to the development host IP on port 8000.
 * 4. Fallback: http://192.168.0.161:8000.
 */
export function resolveApiBaseUrl(): string {
  // If in web browser (desktop or mobile browser):
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host.length > 0) {
      return `http://${host}:8000`;
    }
  }

  // If explicit environment variable is defined:
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // Android emulator
  if (Platform.OS === 'android' && !Device.isDevice) {
    return 'http://10.0.2.2:8000';
  }

  // Physical device running Expo Go
  const devHost = getExpoHostIp();
  if (devHost) {
    return `http://${devHost}:8000`;
  }

  return 'http://192.168.0.161:8000';
}

export function resolvePlatformUrl(url: string): string {
  if (!url) return resolveApiBaseUrl();
  return url;
}

const DEFAULT_BEARER_TOKEN =
  process.env.EXPO_PUBLIC_API_TOKEN ||
  process.env.EXPO_PUBLIC_BEARER_TOKEN ||
  process.env.EXPO_PUBLIC_API_KEY ||
  'hackowatt-demo-mobile-key-2026';

class ConfigManager {
  private config: AppEnvConfig = {
    apiBaseUrl: resolveApiBaseUrl(),
    bearerToken: DEFAULT_BEARER_TOKEN,
    apiKey: DEFAULT_BEARER_TOKEN,
  };

  private listeners = new Set<(cfg: AppEnvConfig) => void>();

  public get(): Readonly<AppEnvConfig> {
    return this.config;
  }

  public getResolvedBaseUrl(): string {
    return resolveApiBaseUrl();
  }

  public set(partial: Partial<AppEnvConfig>): void {
    const updatedToken = partial.bearerToken ?? partial.apiKey ?? this.config.bearerToken;
    this.config = {
      ...this.config,
      ...partial,
      bearerToken: updatedToken,
      apiKey: updatedToken,
    };
    this.listeners.forEach((listener) => listener(this.config));
  }

  public subscribe(listener: (cfg: AppEnvConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public hasBearerToken(): boolean {
    return Boolean(this.config.bearerToken && this.config.bearerToken.trim().length > 0);
  }

  public getMaskedToken(): string {
    const token = this.config.bearerToken;
    if (!token) return '(Brak tokenu)';
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}••••${token.slice(-4)}`;
  }
}

export const envConfig = new ConfigManager();

