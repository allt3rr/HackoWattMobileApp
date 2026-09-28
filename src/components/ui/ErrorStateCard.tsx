import { envConfig } from '@/config/env';
import { ApiErrorDetail } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

interface ErrorStateCardProps {
  error: ApiErrorDetail | null;
  sourceUrl?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  title?: string;
}

export function ErrorStateCard({
  error,
  sourceUrl,
  onRetry,
  isRetrying = false,
  title = 'Brak połączenia z API',
}: ErrorStateCardProps) {
  const resolvedUrl = envConfig.getResolvedBaseUrl();
  const hasToken = envConfig.hasBearerToken();

  const isAuthError = error?.statusCode === 401 || error?.statusCode === 403;

  return (
    <View className="rounded-[16px] border-[1px] border-[#E2E8F0] dark:border-[#334155] p-[16px] gap-[12px] my-[8px]">
      <View className="flex-row items-center gap-[10px]">
        <View className="w-[36px] h-[36px] rounded-[18px] bg-[#FFE4E6] items-center justify-center">
          <Ionicons
            name={isAuthError ? 'key-outline' : 'cloud-offline-outline'}
            size={22}
            color="#E11D48"
          />
        </View>
        <View className="flex">
          <Text className="text-[15px] font-bold dark:text-white">
            {title}
          </Text>
          <Text className="text-[11px] font-semibold dark:text-gray-300">
            {error?.statusCode ? `Kod błędu: HTTP ${error.statusCode}` : 'Brak odpowiedzi serwera'}
          </Text>
        </View>
      </View>

      <Text className="text-[13px] leading-[18px] dark:text-gray-200">
        {error?.message || 'Nie udało się pobrać danych z zewnętrznego serwera backendu.'}
      </Text>

      <View className="p-[10px] rounded-[10px] border-[1px] border-[#E2E8F0] dark:border-[#334155] gap-[4px]">
        <Text className="text-[11px] font-bold mb-[2px] dark:text-white">
          Konfiguracja środowiska (.env):
        </Text>
        <Text className="text-[11px] dark:text-gray-300">
          • URL backendu: <Text className="font-semibold">{resolvedUrl}</Text>
        </Text>
        <Text className="text-[11px] dark:text-gray-300">
          • Autoryzacja: <Text className="font-semibold">{hasToken ? `Bearer ${envConfig.getMaskedToken()}` : 'Brak tokenu Bearer w .env'}</Text>
        </Text>
        {sourceUrl ? (
          <Text className="text-[11px] dark:text-gray-300">
            • Endpoint: <Text className="font-semibold">{sourceUrl}</Text>
          </Text>
        ) : null}
      </View>

      <View className="gap-[2px]">
        <Text className="text-[11px] font-bold dark:text-white">
          Wskazówka:
        </Text>
        {isAuthError ? (
          <Text className="text-[11px] leading-[16px] dark:text-gray-300">
            Upewnij się, że klucz <Text className="font-semibold">EXPO_PUBLIC_API_TOKEN</Text> w pliku{' '}
            <Text className="font-semibold">.env</Text> zawiera aktywny token autoryzacyjny Bearer.
          </Text>
        ) : (
          <Text className="text-[11px] leading-[16px] dark:text-gray-300">
            Upewnij się, że serwer backendu pod adresem <Text className="font-semibold">{envConfig.getResolvedBaseUrl()}</Text> jest uruchomiony na <Text className="font-semibold">0.0.0.0:8000</Text> i oba urządzenia są w tej samej sieci Wi-Fi.
          </Text>
        )}
      </View>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          disabled={isRetrying}
          className="flex-row items-center justify-center gap-[6px] bg-[#E11D48] py-[10px] rounded-[10px] mt-[4px]">
          {isRetrying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text className="text-[#FFFFFF] font-bold text-[13px]">Ponów połączenie</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}