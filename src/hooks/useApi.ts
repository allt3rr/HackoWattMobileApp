import { ApiErrorDetail, ApiResponse } from '@/types/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: ApiErrorDetail | null;
  isMock: boolean;
  sourceUrl: string;
  refetch: () => Promise<void>;
}

export function useApiQuery<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  depsKey?: string | number
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiErrorDetail | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [sourceUrl, setSourceUrl] = useState<string>('');

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetcherRef.current();
      if (!isMountedRef.current) return;

      setSourceUrl(response.sourceUrl);
      setIsMock(response.isMock);

      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError({
        message: err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania danych',
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetcherRef.current();
        if (ignore) return;
        setSourceUrl(response.sourceUrl);
        setIsMock(response.isMock);
        if (response.success) {
          setData(response.data);
          setError(null);
        } else {
          setError(response.error);
        }
      } catch (err) {
        if (ignore) return;
        setError({
          message: err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania danych',
        });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [depsKey]);

  const refetch = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    isMock,
    sourceUrl,
    refetch,
  };
}
