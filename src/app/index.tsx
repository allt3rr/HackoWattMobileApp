import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hackoWattApi } from '@/api/endpoints';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
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
  const [selectedDays, setSelectedDays] = useState<number>(7);

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
        { backgroundColor: isDark ? '#1A1C1E' : '#F7F6ED' },
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
        {/* Top Header with eko-dziki Logo & Title */}
        <AppHeader
          title="eko-dziki"
          subtitle="symulacja energii w domu"
          sourceUrl={sourceUrl}
          onRefresh={refetch}
        />

        {isLoading && !summary ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.radioactiveGrass} />
            <AppText style={[styles.loadingText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Ładowanie danych z serwera backendu...
            </AppText>
          </View>
        ) : summary ? (
          <>
            {/* Location Hero Header matching Web App */}
            {summary?.scenario ? (
              <View style={styles.webHeaderSection}>
                <AppText style={[styles.webEyebrow, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  LOKALIZACJA · {summary.scenario.city?.toUpperCase()}
                </AppText>
                <AppText style={[styles.webTitle, { color: isDark ? '#EDEDED' : Palette.charcoal }]}>
                  Energia w domu <AppText style={styles.webTitleHighlight}>{summary.scenario.city_short || summary.scenario.city?.split(',')[0]}</AppText>
                </AppText>
                <AppText style={[styles.webLead, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Symulacja zużycia na realnej pogodzie i prognoza XGBoost
                </AppText>
              </View>
            ) : null}

            {/* Simulation Range Control (.range-options matching web) */}
            <View
              style={[
                styles.rangeContainer,
                {
                  backgroundColor: isDark ? '#24272A' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(84, 84, 84, 0.18)',
                },
              ]}>
              <AppText style={[styles.rangeLabel, { color: isDark ? '#EDEDED' : Palette.charcoal }]}>
                Symulacja · ostatnie
              </AppText>
              <View
                style={[
                  styles.rangePills,
                  {
                    backgroundColor: isDark ? '#1A1C1E' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(84, 84, 84, 0.2)',
                  },
                ]}>
                {[1, 3, 5, 7, 14, 31].map((d) => {
                  const isSelected = selectedDays === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setSelectedDays(d)}
                      style={[
                        styles.rangePill,
                        isSelected && styles.rangePillActive,
                      ]}>
                      <AppText
                        style={[
                          styles.rangePillText,
                          {
                            color: isSelected
                              ? Palette.charcoal
                              : isDark
                              ? '#9AA4AF'
                              : Palette.charcoal,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}>
                        {d}d
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Simulation KPI Summary Card matching web app */}
            <Card bordered style={styles.simSummaryCard}>
              <View style={styles.simKpiRow}>
                <View style={styles.simKpiCol}>
                  <AppText style={[styles.simKpiLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Symulacja · {selectedDays * 24} h
                  </AppText>
                  <AppText style={[styles.simKpiValue, { color: isDark ? '#EDEDED' : Palette.charcoal }]}>
                    {safeToFixed(
                      (summary.history_last_24h_kwh || 18) *
                        (selectedDays === 1
                          ? 1
                          : selectedDays === 3
                          ? 2.85
                          : selectedDays === 5
                          ? 4.9
                          : selectedDays === 7
                          ? 7.3
                          : selectedDays === 14
                          ? 14.5
                          : 31.8),
                      1
                    )}{' '}
                    <AppText style={[styles.simKpiUnit, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                      kWh
                    </AppText>
                  </AppText>
                  <AppText style={[styles.simKpiDate, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    2026-09-22 – 2026-09-29
                  </AppText>
                </View>

                <View style={[styles.simKpiCol, styles.simKpiColRight]}>
                  <AppText style={[styles.simKpiLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Prognoza · 24 h
                  </AppText>
                  <AppText style={[styles.simKpiValue, { color: isDark ? Palette.chartreuse : Palette.charcoal }]}>
                    {safeToFixed(summary.forecast_next_24h_kwh, 1)}{' '}
                    <AppText style={[styles.simKpiUnit, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                      kWh
                    </AppText>
                  </AppText>
                  <AppText style={[styles.simKpiDate, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Oczekiwane zużycie
                  </AppText>
                </View>
              </View>
            </Card>

            {/* Main Rate Hero Card */}
            <Card highlightZone={currentZone} style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadgeRow}>
                  <StatusBadge
                    zone={currentZone}
                    label={tariff?.period_label || 'Strefa dzienna'}
                    size="medium"
                  />
                  <AppText style={[styles.heroHourText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Godzina: {tariff?.current_hour ?? 12}:00
                  </AppText>
                </View>
                <Pressable
                  onPress={() => router.push('/schedule')}
                  accessibilityRole="button"
                  style={styles.heroLink}>
                  <AppText style={[styles.heroLinkText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    Harmonogram 24h →
                  </AppText>
                </Pressable>
              </View>

              <View style={styles.heroRateRow}>
                <View style={{ flex: 1, minWidth: 140 }}>
                  <AppText style={[styles.rateLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    BIEŻĄCA STAWKA ENERGII
                  </AppText>
                  <View style={styles.priceContainer}>
                    <AppText
                      style={[
                        styles.rateValue,
                        { color: getPriceColor(currentZone) },
                      ]}>
                      {safeToFixed(currentPrice, 3)}
                    </AppText>
                    <AppText style={[styles.rateUnit, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      € / kWh
                    </AppText>
                  </View>
                </View>

                {/* Instant Power Reading */}
                {lastReading ? (
                  <View
                    style={[
                      styles.instantReadingBox,
                      {
                        borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.18)',
                        backgroundColor: isDark ? '#1C1F24' : '#F7F6ED',
                      },
                    ]}>
                    <AppText style={[styles.instantLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                      Pobór chwilowy
                    </AppText>
                    <AppText
                      style={[
                        styles.instantValue,
                        { color: isDark ? Palette.chartreuse : Palette.sageGreen },
                      ]}>
                      {safeToFixed(lastReading.total_kwh, 2)} kWh
                    </AppText>
                    {lastReading.temperature_c != null ? (
                      <AppText style={[styles.instantTemp, { color: Palette.radioactiveGrass }]}>
                        Temp: {safeToFixed(lastReading.temperature_c, 1)} °C
                      </AppText>
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
                <Ionicons name="sparkles" size={18} color={Palette.radioactiveGrass} />
                <AppText style={[styles.adviceText, { color: isDark ? '#E2E8F0' : '#1F5A17' }]}>
                  {tariff?.period_advice || 'Uruchamiaj elastyczne urządzenia w optymalnych oknach cenowych!'}
                </AppText>
              </View>
            </Card>

            {/* Nearest Peak Alert Banner */}
            {nextPeak ? (
              <Card bordered style={styles.peakAlertCard}>
                <View style={styles.peakAlertHeader}>
                  <View style={styles.peakAlertTitleGroup}>
                    <Ionicons name="warning-outline" size={20} color="#EAB308" />
                    <AppText style={[styles.peakAlertTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                      Najbliższy szczyt zapotrzebowania
                    </AppText>
                  </View>
                  <StatusBadge
                    variant="yellow"
                    label={`${nextPeak.timestamp ? nextPeak.timestamp.slice(11, 16) : ''} (~${safeToFixed(nextPeak.total_kwh, 2)} kWh)`}
                  />
                </View>
                <AppText style={[styles.peakAlertText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                  {safeString(nextPeak.explanation, 'Wykryto szczyt obciążenia.')}
                </AppText>
                <View style={styles.peakAlertFooter}>
                  <Pressable onPress={() => router.push('/devices')} accessibilityRole="button">
                    <AppText style={[styles.peakAlertLink, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                      Przesuń AGD na południe ➔
                    </AppText>
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* Dominant Category & 24h Metrics */}
            <View style={styles.sectionTitleRow}>
              <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                Podsumowanie bilansu 24h
              </AppText>
            </View>

            <View style={styles.metricsGrid}>
              <MetricTile
                label="Ostatnie 24h"
                value={safeToFixed(summary.history_last_24h_kwh, 1)}
                unit="kWh"
                subtitle="Suma zużycia wstecz"
                topBorderColor={Palette.sageGreen}
                trend="down"
              />
              <MetricTile
                label="Prognoza 24h"
                value={safeToFixed(summary.forecast_next_24h_kwh, 1)}
                unit="kWh"
                subtitle="Szacowane zapotrzebowanie"
                topBorderColor={Palette.radioactiveGrass}
                accentColor={isDark ? Palette.chartreuse : Palette.charcoal}
              />
              <MetricTile
                label="PV pokrycie"
                value={`${safeToFixed(summary.pv_preview?.typical_annual_coverage_percent, 0, '33')}%`}
                subtitle={`Optymalne: ${safeToFixed(summary.pv_preview?.optimized_annual_coverage_percent, 0, '39')}%`}
                topBorderColor={Palette.chartreuse}
                accentColor={isDark ? Palette.chartreuse : Palette.charcoal}
              />
              <MetricTile
                label="Stawka"
                value={safeToFixed(currentPrice, 3)}
                unit="€/kWh"
                subtitle={tariff?.period_label || 'Taryfa dynamiczna'}
                topBorderColor={Palette.charcoal}
                accentColor={isDark ? '#EDEDED' : Palette.charcoal}
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
                    <View style={{ flex: 1 }}>
                      <AppText style={[styles.dominantLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        DOMINUJĄCA KATEGORIA ZUŻYCIA
                      </AppText>
                      <AppText style={[styles.dominantName, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                        {dominant.label}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.dominantKwhBadge}>
                    <AppText style={styles.dominantKwhText}>
                      {safeToFixed(dominant.kwh, 2)} kWh
                    </AppText>
                  </View>
                </View>

                <View style={styles.dominantFooter}>
                  <AppText style={[styles.dominantKey, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Klucz: {dominant.key}
                  </AppText>
                  <Pressable onPress={() => router.push('/analytics')} accessibilityRole="button">
                    <AppText style={[styles.dominantLink, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                      Pełna analityka 6 kategorii →
                    </AppText>
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* Quick Navigation Cards */}
            <View style={styles.sectionTitleRow}>
              <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                Szybkie moduły
              </AppText>
            </View>

            <View style={styles.quickModulesGrid}>
              <Card onPress={() => router.push('/schedule')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : '#EBF9E6' }]}>
                  <Ionicons name="time" size={20} color={Palette.radioactiveGrass} />
                </View>
                <AppText style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Harmonogram 24h
                </AppText>
                <AppText style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Strefy zielona/żółta/czerwona i porady dla pokoleń.
                </AppText>
              </Card>

              <Card onPress={() => router.push('/devices')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : 'rgba(107, 170, 117, 0.15)' }]}>
                  <Ionicons name="calculator" size={20} color={Palette.sageGreen} />
                </View>
                <AppText style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Kalkulator AGD
                </AppText>
                <AppText style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Przelicz zysk z przesunięcia pralki na 12:00.
                </AppText>
              </Card>

              <Card onPress={() => router.push('/solar')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : '#FEF9C3' }]}>
                  <Ionicons name="sunny" size={20} color="#EAB308" />
                </View>
                <AppText style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Fotowoltaika & Bateria
                </AppText>
                <AppText style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Symulacja wariantu A vs B i autokonsumpcja.
                </AppText>
              </Card>

              <Card onPress={() => router.push('/analytics')} style={styles.moduleCard}>
                <View style={[styles.moduleIconBox, { backgroundColor: isDark ? '#2B3037' : '#F1F5F9' }]}>
                  <Ionicons name="stats-chart" size={20} color={Palette.charcoal} />
                </View>
                <AppText style={[styles.moduleTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Prognoza & Metryki
                </AppText>
                <AppText style={[styles.moduleDesc, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Dokładność modelu MAE i prognozy do 168h.
                </AppText>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
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
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroHourText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroLink: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  heroLinkText: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
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
    flexWrap: 'wrap',
  },
  rateValue: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 44,
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
    alignItems: 'flex-start',
    gap: 2,
    minWidth: 120,
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
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  peakAlertCard: {
    gap: 8,
  },
  peakAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  peakAlertTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 180,
  },
  peakAlertTitle: {
    fontSize: 14,
    fontWeight: '800',
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
    fontSize: 13,
    fontWeight: '800',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  sectionTitleRow: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  webHeaderSection: {
    paddingVertical: 6,
    gap: 4,
  },
  webEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  webTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  webTitleHighlight: {
    color: Palette.charcoal,
    backgroundColor: Palette.chartreuse,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  webLead: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  rangeLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  rangePills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 3,
    borderRadius: 9,
    borderWidth: 1,
  },
  rangePill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  rangePillActive: {
    backgroundColor: Palette.chartreuse,
  },
  rangePillText: {
    fontSize: 12,
  },
  simSummaryCard: {
    padding: 16,
  },
  simKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  simKpiCol: {
    flex: 1,
    gap: 3,
  },
  simKpiColRight: {
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(84, 84, 84, 0.15)',
    paddingLeft: 12,
  },
  simKpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  simKpiValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  simKpiUnit: {
    fontSize: 13,
    fontWeight: '600',
  },
  simKpiDate: {
    fontSize: 10,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dominantCard: {
    gap: 12,
  },
  dominantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dominantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 180,
  },
  dominantIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingVertical: 5,
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
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  dominantKey: {
    fontSize: 11,
  },
  dominantLink: {
    fontSize: 13,
    fontWeight: '800',
    minHeight: 44,
    textAlignVertical: 'center',
  },
  quickModulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moduleCard: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
    gap: 6,
  },
  moduleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  moduleDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});