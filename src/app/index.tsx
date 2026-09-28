import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hackoWattApi } from '@/api/endpoints';
import { ApiStatusIndicator } from '@/components/ui/ApiStatusIndicator';
import { Card } from '@/components/ui/Card';
import { ErrorStateCard } from '@/components/ui/ErrorStateCard';
import { MetricTile } from '@/components/ui/MetricTile';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Spacing,
} from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApi';
import { ScheduleZone } from '@/types/api';
import { safeString, safeToFixed } from '@/utils/formatters';

export default function DashboardScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const {
    data: summary,
    isLoading,
    isRefreshing,
    error,
    sourceUrl,
    refetch,
  } = useApiQuery(hackoWattApi.getDashboardSummary);

  const tariff = summary?.tariff;
  const lastReading = summary?.last_reading;
  const currentZone: ScheduleZone = tariff?.period_color || 'yellow';
  const currentPrice = tariff?.price_eur ?? 0.28;
  const nextPeak = summary?.next_peak;
  const dominant = lastReading?.dominant_category;

  const getPriceColor = (zone: ScheduleZone) => {
    if (zone === 'green') return isDark ? Palette.chartreuse : Palette.radioactiveGrass;
    if (zone === 'yellow') return '#EAB308';
    return '#EF4444';
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#16181A' : '#F6F8F6' },
      ]}
      edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + Spacing.six, maxWidth: MaxContentWidth },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.brandTitleRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="flash" size={16} color="#0F172A" />
              </View>
              <Text style={[styles.brandTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                HackoWatt
              </Text>
            </View>
            <Text style={[styles.brandSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Inteligentny doradca energetyczny
            </Text>
          </View>
          <ApiStatusIndicator sourceUrl={sourceUrl} onRefresh={refetch} />
        </View>

        {isLoading && !summary ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.radioactiveGrass} />
            <Text style={[styles.loadingText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Ładowanie danych z serwera backendu...
            </Text>
          </View>
        ) : summary ? (
          <>
            {/* Main Rate Hero Card */}
            <Card highlightZone={currentZone} style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadgeRow}>
                  <StatusBadge
                    zone={currentZone}
                    label={tariff?.period_label || 'Strefa dzienna'}
                    size="medium"
                  />
                  <Text style={[styles.heroHourText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Godzina: {tariff?.current_hour ?? 12}:00
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/schedule')}
                  style={styles.heroLink}>
                  <Text style={[styles.heroLinkText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    Harmonogram 24h →
                  </Text>
                </Pressable>
              </View>

              <View style={styles.heroRateRow}>
                <View>
                  <Text style={[styles.rateLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    BIEŻĄCA STAWKA ENERGII
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text
                      style={[
                        styles.rateValue,
                        { color: getPriceColor(currentZone) },
                      ]}>
                      {safeToFixed(currentPrice, 3)}
                    </Text>
                    <Text style={[styles.rateUnit, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      € / kWh
                    </Text>
                  </View>
                </View>

                {/* Instant Power Reading */}
                {lastReading ? (
                  <View
                    style={[
                      styles.instantReadingBox,
                      {
                        borderColor: isDark ? '#373C44' : '#E2E8F0',
                        backgroundColor: isDark ? '#1C1F24' : '#F8FAFC',
                      },
                    ]}>
                    <Text style={[styles.instantLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                      Pobór chwilowy
                    </Text>
                    <Text
                      style={[
                        styles.instantValue,
                        { color: isDark ? Palette.chartreuse : Palette.sageGreen },
                      ]}>
                      {safeToFixed(lastReading.total_kwh, 2)} kWh
                    </Text>
                    {lastReading.temperature_c != null ? (
                      <Text style={[styles.instantTemp, { color: Palette.radioactiveGrass }]}>
                        Temp: {safeToFixed(lastReading.temperature_c, 1)} °C
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <View
                style={[
                  styles.adviceBanner,
                  {
                    backgroundColor: isDark ? 'rgba(107, 170, 117, 0.12)' : '#EBF9E6',
                    borderColor: isDark ? Palette.charcoal : Palette.radioactiveGrass,
                  },
                ]}>
                <Ionicons name="sparkles" size={16} color={Palette.radioactiveGrass} />
                <Text style={[styles.adviceText, { color: isDark ? '#E2E8F0' : '#1F5A17' }]}>
                  {tariff?.period_advice || 'Uruchamiaj elastyczne urządzenia w optymalnych oknach cenowych!'}
                </Text>
              </View>
            </Card>

            {/* Nearest Peak Alert Banner */}
            {nextPeak ? (
              <Card bordered style={styles.peakAlertCard}>
                <View style={styles.peakAlertHeader}>
                  <View style={styles.peakAlertTitleGroup}>
                    <Ionicons name="warning-outline" size={20} color="#EAB308" />
                    <Text style={[styles.peakAlertTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      Najbliższy szczyt zapotrzebowania
                    </Text>
                  </View>
                  <StatusBadge
                    variant="yellow"
                    label={`${nextPeak.timestamp ? nextPeak.timestamp.slice(11, 16) : ''} (~${safeToFixed(nextPeak.total_kwh, 2)} kWh)`}
                  />
                </View>
                <Text style={[styles.peakAlertText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                  {safeString(nextPeak.explanation, 'Wykryto szczyt obciążenia.')}
                </Text>
                <View style={styles.peakAlertFooter}>
                  <Pressable onPress={() => router.push('/devices')}>
                    <Text style={[styles.peakAlertLink, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                      Przesuń AGD na południe ➔
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* Dominant Category & 24h Metrics */}
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                Podsumowanie bilansu 24h
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricTile
                label="Ostatnie 24h"
                value={safeToFixed(summary.history_last_24h_kwh, 1)}
                unit="kWh"
                subtitle="Suma zużycia z doby wstecz"
                trend="down"
              />
              <MetricTile
                label="Prognoza 24h"
                value={safeToFixed(summary.forecast_next_24h_kwh, 1)}
                unit="kWh"
                subtitle="Szacowane zapotrzebowanie"
                accentColor={Palette.radioactiveGrass}
              />
              <MetricTile
                label="PV pokrycie"
                value={`${safeToFixed(summary.pv_preview?.typical_annual_coverage_percent, 0, '33')}%`}
                subtitle={`Optymalne: ${safeToFixed(summary.pv_preview?.optimized_annual_coverage_percent, 0, '39')}%`}
                accentColor={isDark ? Palette.chartreuse : Palette.sageGreen}
              />
            </View>

            {/* Dominant Category Card */}
            {dominant ? (
              <Card style={styles.dominantCard}>
                <View style={styles.dominantHeader}>
                  <View style={styles.dominantLeft}>
                    <View style={styles.dominantIconCircle}>
                      <Ionicons name="flame" size={18} color="#EF4444" />
                    </View>
                    <View>
                      <Text style={[styles.dominantLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        DOMINUJĄCA KATEGORIA ZUŻYCIA
                      </Text>
                      <Text style={[styles.dominantName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {dominant.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dominantKwhBadge}>
                    <Text style={styles.dominantKwhText}>
                      {safeToFixed(dominant.kwh, 2)} kWh
                    </Text>
                  </View>
                </View>

                <View style={styles.dominantFooter}>
                  <Text style={[styles.dominantKey, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Klucz: {dominant.key}
                  </Text>
                  <Pressable onPress={() => router.push('/analytics')}>
                    <Text style={[styles.dominantLink, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                      Pełna analityka 6 kategorii →
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* Quick Navigation Cards */}
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                Szybkie moduły
              </Text>
            </View>

            <View style={styles.quickModulesGrid}>
              <Card onPress={() => router.push('/schedule')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : '#EBF9E6' }]}>
                  <Ionicons name="time" size={20} color={Palette.radioactiveGrass} />
                </View>
                <Text style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Harmonogram 24h
                </Text>
                <Text style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Strefy zielona/żółta/czerwona i porady dla pokoleń.
                </Text>
              </Card>

              <Card onPress={() => router.push('/devices')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : 'rgba(107, 170, 117, 0.15)' }]}>
                  <Ionicons name="calculator" size={20} color={Palette.sageGreen} />
                </View>
                <Text style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Kalkulator AGD
                </Text>
                <Text style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Przelicz zysk z przesunięcia pralki na 12:00.
                </Text>
              </Card>

              <Card onPress={() => router.push('/solar')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : '#FEF9C3' }]}>
                  <Ionicons name="sunny" size={20} color="#EAB308" />
                </View>
                <Text style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Fotowoltaika & Bateria
                </Text>
                <Text style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Symulacja wariantu A vs B i autokonsumpcja.
                </Text>
              </Card>

              <Card onPress={() => router.push('/analytics')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : '#F1F5F9' }]}>
                  <Ionicons name="stats-chart" size={20} color={Palette.charcoal} />
                </View>
                <Text style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Prognoza & Metryki
                </Text>
                <Text style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Dokładność modelu MAE i prognozy do 168h.
                </Text>
              </Card>
            </View>
          </>
        ) : (
          <ErrorStateCard
            error={error || { message: 'Brak danych z serwera backendu. Sprawdź połączenie z serwerem i odśwież widok.' }}
            sourceUrl={sourceUrl}
            onRetry={refetch}
            isRetrying={isRefreshing}
            title="Brak połączenia z pulpitem"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: Palette.radioactiveGrass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  heroCard: {
    gap: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroHourText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroLink: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  heroLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  rateValue: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 46,
  },
  rateUnit: {
    fontSize: 14,
    fontWeight: '700',
  },
  instantReadingBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    gap: 2,
  },
  instantLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  instantValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  instantTemp: {
    fontSize: 11,
    fontWeight: '700',
  },
  adviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  adviceText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  peakAlertCard: {
    gap: 8,
  },
  peakAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peakAlertTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  peakAlertTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  peakAlertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  peakAlertFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  peakAlertLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitleRow: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dominantCard: {
    gap: 12,
  },
  dominantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dominantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dominantIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dominantLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dominantName: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  dominantKwhBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dominantKwhText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
  },
  dominantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  dominantKey: {
    fontSize: 11,
  },
  dominantLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickModulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    flex: 1,
    minWidth: '45%',
    gap: 6,
  },
  moduleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  moduleDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});