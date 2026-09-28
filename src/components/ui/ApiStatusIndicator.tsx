import { hackoWattApi } from '@/api/endpoints';
import { envConfig } from '@/config/env';
import { Palette } from '@/constants/theme';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';

interface ApiStatusIndicatorProps {
  sourceUrl?: string;
  onRefresh?: () => void;
}

export function ApiStatusIndicator({ sourceUrl, onRefresh }: ApiStatusIndicatorProps) {
  const isDark = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [cfg, setCfg] = useState(envConfig.get());
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [editUrl, setEditUrl] = useState(cfg.apiBaseUrl);
  const [editToken, setEditToken] = useState(cfg.bearerToken || cfg.apiKey || '');

  useEffect(() => {
    return envConfig.subscribe((newCfg) => {
      setCfg(newCfg);
      setEditUrl(newCfg.apiBaseUrl);
      setEditToken(newCfg.bearerToken || newCfg.apiKey || '');
    });
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = Date.now();
    try {
      const res = await hackoWattApi.getSystemMetrics();
      const elapsed = Date.now() - start;
      if (res.success) {
        setTestResult(
          `Połączenie udane (${elapsed}ms)! Model MAPE: ${res.data.mape_model}% (godzin: ${res.data.godzin})`
        );
      } else {
        setTestResult(`Błąd: ${res.error.message}`);
      }
    } catch (e) {
      setTestResult(`Błąd sieci: ${e instanceof Error ? e.message : 'Nieznany błąd'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    envConfig.set({
      apiBaseUrl: editUrl.trim(),
      bearerToken: editToken.trim(),
      apiKey: editToken.trim(),
    });
    setModalVisible(false);
    onRefresh?.();
  };

  const hasToken = envConfig.hasBearerToken();

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? '#373C44' : '#E0E5E2',
          backgroundColor: isDark ? '#22252A' : '#FFFFFF',
          gap: 6,
        }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: Palette.radioactiveGrass }} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FFFFFF' : '#1C2024' }}>
          API Live
        </Text>
        <Text style={{ fontSize: 11, color: isDark ? '#9AA4AF' : Palette.slateGrey }}>
          {hasToken ? `Token: ${envConfig.getMaskedToken()}` : 'Brak tokenu'}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 480, borderRadius: 20, borderWidth: 1, borderColor: isDark ? '#373C44' : '#E2E8F0', backgroundColor: isDark ? '#22252A' : '#FFFFFF', padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: isDark ? '#FFFFFF' : '#1C2024' }}>
              Konfiguracja HackoWatt API
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: isDark ? '#CBD5E1' : Palette.slateGrey }}>
              Pobieranie wyłącznie z endpointów backendu (<Text style={{ fontWeight: '700' }}>.env</Text>).
            </Text>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1C2024' }}>
                API Base URL (np. http://localhost:8000)
              </Text>
              <TextInput
                value={editUrl}
                onChangeText={setEditUrl}
                placeholder="http://localhost:8000"
                placeholderTextColor={Palette.slateGrey}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? '#373C44' : '#CBD5E1',
                  color: isDark ? '#FFFFFF' : '#1C2024',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  fontSize: 13,
                  backgroundColor: isDark ? '#181A1D' : '#F8FAFC',
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#E2E8F0' : '#1C2024' }}>
                Bearer Token (Nagłówek Authorization: Bearer &lt;token&gt;)
              </Text>
              <TextInput
                value={editToken}
                onChangeText={setEditToken}
                placeholder="Wpisz token lub ustaw w .env"
                placeholderTextColor={Palette.slateGrey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? '#373C44' : '#CBD5E1',
                  color: isDark ? '#FFFFFF' : '#1C2024',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  fontSize: 13,
                  backgroundColor: isDark ? '#181A1D' : '#F8FAFC',
                }}
              />
            </View>

            {sourceUrl ? (
              <Text style={{ fontSize: 11, color: isDark ? '#9AA4AF' : Palette.slateGrey, fontFamily: 'monospace' }}>
                Ostatnie żądanie: {sourceUrl}
              </Text>
            ) : null}

            {testResult ? (
              <View style={{ backgroundColor: isDark ? 'rgba(107, 170, 117, 0.15)' : '#EBF9E6', borderColor: Palette.sageGreen, borderWidth: 1, borderRadius: 8, padding: 10 }}>
                <Text style={{ fontSize: 12, color: isDark ? Palette.chartreuse : '#1F5A17', fontWeight: '600' }}>{testResult}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={handleTestConnection}
                disabled={isTesting}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#2B3037' : '#EDF1EE' }}>
                {isTesting ? (
                  <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
                ) : (
                  <Text style={{ color: isDark ? Palette.chartreuse : Palette.charcoal, fontWeight: '700', fontSize: 13 }}>Testuj połączenie</Text>
                )}
              </Pressable>

              <Pressable onPress={handleSave} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.radioactiveGrass }}>
                <Text style={{ color: '#0F172A', fontWeight: '800', fontSize: 13 }}>Zapisz</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setModalVisible(false)}
              style={{ alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 12, color: isDark ? '#9AA4AF' : Palette.slateGrey }}>
                Zamknij
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}