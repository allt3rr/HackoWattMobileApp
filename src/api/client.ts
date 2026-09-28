import { envConfig } from '@/config/env';
import { ApiResponse } from '@/types/api';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

export class HackoWattApiClient {
  private timeoutDefault = 10000;

  /**
   * Universal typed request executor sending Bearer token authentication
   * Directly communicates with the live backend endpoints.
   */
  public async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { bearerToken } = envConfig.get();
    const resolvedBaseUrl = envConfig.getResolvedBaseUrl();
    const {
      method = 'GET',
      headers = {},
      params,
      body,
      timeoutMs = this.timeoutDefault,
    } = config;

    // Normalize endpoint URL
    const cleanBase = resolvedBaseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Construct query parameters
    let queryString = '';
    if (params) {
      const definedParams = Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (definedParams) {
        queryString = (cleanEndpoint.includes('?') ? '&' : '?') + definedParams;
      }
    }

    const fullUrl = `${cleanBase}${cleanEndpoint}${queryString}`;

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    };

    if (body !== undefined && body !== null && method !== 'GET') {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Attach Bearer Token Authentication if present
    if (
      bearerToken &&
      bearerToken.trim().length > 0 &&
      bearerToken.trim() !== 'your_bearer_token_here'
    ) {
      requestHeaders['Authorization'] = `Bearer ${bearerToken.trim()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const authErrorMessage =
          response.status === 401
            ? 'Błąd 401: Brak lub nieprawidłowy Bearer Token. Sprawdź EXPO_PUBLIC_API_TOKEN w pliku .env.'
            : response.status === 403
            ? 'Błąd 403: Odmowa dostępu. Token nie posiada uprawnień do tego zasobu.'
            : response.status === 405
            ? `Błąd 405: Metoda niedozwolona (${method}) dla endpointu ${cleanEndpoint}.`
            : `Błąd serwera (${response.status}): ${response.statusText}`;

        return {
          success: false,
          error: {
            message: authErrorMessage,
            statusCode: response.status,
            details: errorData,
          },
          isMock: false,
          timestamp: Date.now(),
          sourceUrl: fullUrl,
        };
      }

      const json = await response.json();
      // Django endpoints return { "status": "success", "data": ... }
      const payload: T =
        json && typeof json === 'object' && 'data' in json && (json as Record<string, unknown>).data !== undefined
          ? ((json as Record<string, unknown>).data as T)
          : (json as T);

      return {
        success: true,
        data: payload,
        isMock: false,
        timestamp: Date.now(),
        sourceUrl: fullUrl,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      const isTimeout = (err as { name?: string })?.name === 'AbortError';
      const message = isTimeout
        ? `Przekroczono limit czasu oczekiwania na odpowiedź (${timeoutMs}ms)`
        : `Nie udało się połączyć z ${fullUrl}. Sprawdź, czy serwer backendu pod adresem ${cleanBase} jest uruchomiony.`;

      return {
        success: false,
        error: {
          message,
          code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          details: err,
        },
        isMock: false,
        timestamp: Date.now(),
        sourceUrl: fullUrl,
      };
    }
  }

  public get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, params });
  }
}

export const apiClient = new HackoWattApiClient();
