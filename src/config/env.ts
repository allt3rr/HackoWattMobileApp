/**
 * Environment configuration and dynamic settings for HackoWatt API
 * Connects directly to live backend server via Bearer Token authorization.
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
 * Resolves localhost URL automatically:
 * - On physical devices: maps localhost/127.0.0.1 to Expo host IP or LAN fallback (e.g. 192.168.0.161)
 * - On Android emulators: maps localhost/127.0.0.1 to 10.0.2.2
 * - On Web and iOS simulators: keeps localhost as is.
 */
export function resolvePlatformUrl(url: string): string {
  if (!url) return url;

  const isPhysical = Device.isDevice;

  if (isPhysical) {
    const devHost = getExpoHostIp() || '192.168.0.161';
    return url
      .replace('://localhost', `://${devHost}`)
      .replace('://127.0.0.1', `://${devHost}`);
  }

  if (Platform.OS === 'android') {
    return url
      .replace('://localhost', '://10.0.2.2')
      .replace('://127.0.0.1', '://10.0.2.2');
  }

  return url;
}

const DEFAULT_RAW_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'http://localhost:8000';

const DEFAULT_BEARER_TOKEN =
  process.env.EXPO_PUBLIC_API_TOKEN ||
  process.env.EXPO_PUBLIC_BEARER_TOKEN ||
  process.env.EXPO_PUBLIC_API_KEY ||
  '';

class ConfigManager {
  private config: AppEnvConfig = {
    apiBaseUrl: DEFAULT_RAW_URL,
    bearerToken: DEFAULT_BEARER_TOKEN,
    apiKey: DEFAULT_BEARER_TOKEN,
  };

  private listeners = new Set<(cfg: AppEnvConfig) => void>();

  public get(): Readonly<AppEnvConfig> {
    return this.config;
  }

  public getResolvedBaseUrl(): string {
    return resolvePlatformUrl(this.config.apiBaseUrl);
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
    if (!token) return '(Brak tokenu w .env)';
    if (token.length <= 8) return '****';
    return `${token.slice(0, 4)}••••${token.slice(-4)}`;
  }
}

export const envConfig = new ConfigManager();
