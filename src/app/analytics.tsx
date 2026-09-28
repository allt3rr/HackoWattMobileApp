import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Spacing,
} from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApi';
import { ForecastHorizon } from '@/types/api';

const CATEGORY_COLORS: Record<string, { label: string; color: string }> = {
  Baza_kWh: { label: 'Baza stała', color: Palette.slateGrey },
  Ogrzewanie_kWh: { label: 'Ogrzewanie', color: '#EF4444' },
  Oswietlenie_kWh: { label: 'Oświetlenie', color: '#EAB308' },
  Gotowanie_kWh: { label: 'Gotowanie', color: '#F97316' },
  RTV_PC_kWh: { label: 'RTV & PC', color: Palette.charcoal },
  Duze_AGD_kWh: { label: 'Duże AGD', color: Palette.radioactiveGrass },
};

export default function AnalyticsScreen() {
  const isDark = useColorScheme() === 'dark';

  const [historyPage, setHistoryPage] = useState(1);
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>(24);

  // 1. Consumption History
  const {
    data: historyData,
    isLoading: historyLoading,
    isRefreshing: historyRefreshing,
    error: historyError,
    sourceUrl: historyUrl,
    refetch: refetchHistory,
  } = useApiQuery(
    () => hackoWattApi.getConsumptionHistory({ page: historyPage, page_size: 7 }),
    historyPage
  );

  // 2. Consumption Forecast
  const {
    data: forecastData,
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecast,
  } = useApiQuery(
    () => hackoWattApi.getConsumptionForecast(forecastHorizon),
    forecastHorizon
  );

  // 3. System Metrics
  const {
    data: metricsData,
    refetch: refetchMetrics,
  } = useApiQuery(hackoWattApi.getSystemMetrics);

  const handleRefresh = async () => {
    await Promise.all([refetchHistory(), refetchForecast(), refetchMetrics()]);
  };

  // Helper to extract category breakdown percentages from summary categories_totals
  const renderCategoryBreakdown = (categoriesTotals: Record<string, number>, totalKwh: number) => {
    const entries = Object.entries(categoriesTotals);
    if (!entries.length || totalKwh <= 0) return null;

    return (
      <View style={styles.breakdownWrap}>
        {/* Multi-segment stacked bar */}
        <View style={[styles.multiBar, { backgroundColor: isDark ? '#2E333A' : '#E2E8F0' }]}>
          {entries.map(([key, val]) => {
            const pct = Math.max(1, (val / totalKwh) * 100);
            const color = CATEGORY_COLORS[key]?.color || Palette.slateGrey;
            return (
              <View
                key={key}
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  height: '100%',
                }}
              />
            );
          })}
        </View>

        {/* Legend list */}
        <View style={styles.legendGrid}>
          {entries.map(([key, val]) => {
            const pct = ((val / totalKwh) * 100).toFixed(1);
            const cat = CATEGORY_COLORS[key] || { label: key, color: Palette.slateGrey };
            return (
              <View key={key} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.catName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    {cat.label}
                  </Text>
                </View>
                <View style={styles.catRight}>
                  <Text style={[styles.catVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    {val.toFixed(1)} kWh
                  </Text>
                  <Text style={[styles.catPct, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    ({pct}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
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
            refreshing={historyRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
              Zużycie & Prognozy
            </Text>
            <Text style={[styles.screenSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Historia 6 kategorii, predykcja zapotrzebowania i metryki modelu
            </Text>
          </View>
          <ApiStatusIndicator sourceUrl={historyUrl} onRefresh={handleRefresh} />
        </View>

        {/* ============================================================ */}
        {/* SECTION 1: PROGNOZA ZAPOTRZEBOWANIA */}
        {/* ============================================================ */}
        <Card highlightZone="yellow" style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <View style={styles.forecastTitleGroup}>
              <Ionicons name="trending-up" size={20} color={Palette.radioactiveGrass} />
              <View>
                <Text style={[styles.forecastTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Prognoza Zapotrzebowania
                </Text>
                <Text style={[styles.forecastSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Model AI z przewidywaniem szczytów i pogodą
                </Text>
              </View>
            </View>
            <StatusBadge variant="blue" label={`Horyzont ${forecastHorizon}h`} />
          </View>

          {/* Horizon Selector */}
          <SegmentedControl
            value={forecastHorizon}
            onChange={(val) => setForecastHorizon(val as ForecastHorizon)}
            options={[
              { value: 24, label: 'Doba (24h)' },
              { value: 72, label: '3 dni (72h)' },
              { value: 168, label: 'Tydzień (168h)' },
            ]}
          />

          {forecastLoading && !forecastData ? (
            <ActivityIndicator size="small" color={Palette.radioactiveGrass} style={{ marginVertical: 16 }} />
          ) : forecastData ? (
            <>
              {/* Summary KPIs */}
              <View style={styles.kpiRow}>
                <MetricTile
                  label="Prognozowane zużycie"
                  value={forecastData.total_kwh.toFixed(1)}
                  unit="kWh"
                  subtitle={`Horyzont ${forecastData.horizon_hours}h`}
                  accentColor={Palette.radioactiveGrass}
                />
                <MetricTile
                  label="Liczba szczytów"
                  value={forecastData.peaks ? forecastData.peaks.length : 0}
                  subtitle="Wykryte anomalie"
                  accentColor="#EF4444"
                />
              </View>

              {/* Hourly Chart preview */}
              {forecastData.items && forecastData.items.length > 0 ? (
                <>
                  <Text style={[styles.chartSectionLabel, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
                    Wykres godzinowy prognozy (kWh):
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                    <View style={styles.chartContainer}>
                      {forecastData.items.slice(0, 36).map((point, index) => {
                        const maxVal = 2.5;
                        const heightPercent = Math.min(100, (point.total_kwh / maxVal) * 100);
                        const isHigh = point.total_kwh > 1.1;
                        const hour = point.timestamp.substring(11, 16);

                        return (
                          <View key={index} style={styles.chartCol}>
                            <Text style={[styles.chartVal, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                              {point.total_kwh.toFixed(1)}
                            </Text>
                            <View style={[styles.chartTrack, { backgroundColor: isDark ? '#2E333A' : '#E2E8F0' }]}>
                              <View
                                style={[
                                  styles.chartFill,
                                  {
                                    height: `${heightPercent}%`,
                                    backgroundColor: isHigh ? '#EF4444' : Palette.radioactiveGrass,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={[styles.chartHour, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                              {hour}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </>
              ) : null}

              {/* Peak Explanations */}
              {forecastData.peaks && forecastData.peaks.length > 0 ? (
                <View style={styles.peaksSection}>
                  <Text style={[styles.peaksHeader, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Zidentyfikowane szczyty i wyjaśnienia:
                  </Text>
                  {forecastData.peaks.map((peak, idx) => {
                    const formattedDate = new Date(peak.timestamp).toLocaleString('pl-PL', {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.peakCard,
                          {
                            backgroundColor: isDark ? '#231B1B' : '#FEF2F2',
                            borderColor: '#FECACA',
                          },
                        ]}>
                        <View style={styles.peakHeader}>
                          <View style={styles.peakLeft}>
                            <Ionicons name="alert-circle" size={16} color="#EF4444" />
                            <Text style={styles.peakHourText}>{formattedDate}</Text>
                          </View>
                          <StatusBadge variant="red" label={`Szczyt: ${peak.total_kwh} kWh`} />
                        </View>
                        <Text style={[styles.peakExpl, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                          {peak.explanation}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : (
            <ErrorStateCard
              error={forecastError || { message: 'Brak danych prognozy z serwera backendu.' }}
              sourceUrl={historyUrl}
              onRetry={handleRefresh}
              isRetrying={historyRefreshing}
              title="Błąd ładowania prognozy zapotrzebowania"
            />
          )}
        </Card>

        {/* ============================================================ */}
        {/* SECTION 2: METRYKI MODELU AI */}
        {/* ============================================================ */}
        {metricsData ? (
          <Card style={styles.metricsCard}>
            <View style={styles.metricsHeader}>
              <View style={styles.metricsTitleGroup}>
                <Ionicons name="hardware-chip" size={18} color={Palette.radioactiveGrass} />
                <View>
                  <Text style={[styles.metricsTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Dokładność Modelu Prognostycznego
                  </Text>
                  <Text style={[styles.metricsPeriod, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Okres: {metricsData.okres_od} do {metricsData.okres_do} ({metricsData.godzin}h)
                  </Text>
                </View>
              </View>
              <StatusBadge variant="green" label="Aktywny" />
            </View>

            <View style={styles.kpiRow}>
              <MetricTile
                label="Błąd MAE (Model)"
                value={metricsData.mae_model.toFixed(3)}
                unit="kWh"
                subtitle={`Baseline: ${metricsData.mae_baseline.toFixed(3)}`}
                accentColor={Palette.radioactiveGrass}
              />
              <MetricTile
                label="Błąd MAPE (Model)"
                value={`${metricsData.mape_model.toFixed(1)}%`}
                subtitle={`Baseline: ${metricsData.mape_baseline.toFixed(1)}%`}
                accentColor={isDark ? Palette.chartreuse : Palette.sageGreen}
              />
            </View>
          </Card>
        ) : null}

        {/* ============================================================ */}
        {/* SECTION 3: HISTORIA ZUŻYCIA */}
        {/* ============================================================ */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="bar-chart" size={18} color={Palette.sageGreen} />
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
            Historia zużycia z podziałem na 6 kategorii
          </Text>
        </View>

        {historyLoading && !historyData ? (
          <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
        ) : historyData ? (
          <>
            {/* 6-Category Breakdown Card */}
            <Card style={styles.breakdownCard}>
              <View style={{ gap: 2 }}>
                <Text style={[styles.breakdownTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Struktura zużycia w okresie
                </Text>
                <Text style={[styles.breakdownSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Łącznie: {historyData.summary.total_kwh.toFixed(1)} kWh ({historyData.summary.start} do {historyData.summary.end})
                </Text>
              </View>

              {renderCategoryBreakdown(
                historyData.summary.categories_totals,
                historyData.summary.total_kwh
              )}
            </Card>

            {/* Daily Records with Pagination */}
            <Card style={styles.recordsCard}>
              <View style={styles.recordsHeader}>
                <Text style={[styles.recordsTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Godzinowy rejestr pomiarów
                </Text>
                <Text style={[styles.pageIndicator, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Strona {historyData.pagination.page} z {historyData.pagination.total_pages}
                </Text>
              </View>

              {historyData.items.map((rec, idx) => {
                const dateStr = rec.timestamp.replace('T', ' ').substring(0, 16);
                return (
                  <View
                    key={idx}
                    style={[
                      styles.recordRow,
                      { borderBottomColor: isDark ? '#2E333A' : '#E2E8F0' },
                    ]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recordDate, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {dateStr} ({rec.temperature_c}°C)
                      </Text>
                      <Text style={[styles.recordCategories, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Ogrz: {rec.categories.Ogrzewanie_kWh?.toFixed(2) ?? 0} kWh • AGD: {rec.categories.Duze_AGD_kWh?.toFixed(2) ?? 0} kWh • RTV: {rec.categories.RTV_PC_kWh?.toFixed(2) ?? 0} kWh
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.recordKwh, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                        {rec.total_kwh.toFixed(3)} kWh
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Pagination Controls */}
              <View style={styles.paginationRow}>
                <Pressable
                  disabled={!historyData.pagination.has_previous}
                  onPress={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  style={[
                    styles.pageBtn,
                    {
                      borderColor: isDark ? '#373C44' : '#CBD5E1',
                      opacity: historyData.pagination.has_previous ? 1 : 0.4,
                    },
                  ]}>
                  <Ionicons
                    name="chevron-back"
                    size={16}
                    color={historyData.pagination.has_previous ? Palette.radioactiveGrass : Palette.slateGrey}
                  />
                  <Text
                    style={[
                      styles.pageBtnText,
                      {
                        color: historyData.pagination.has_previous
                          ? isDark
                            ? Palette.chartreuse
                            : Palette.sageGreen
                          : Palette.slateGrey,
                      },
                    ]}>
                    Poprzednia
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!historyData.pagination.has_next}
                  onPress={() => setHistoryPage((p) => p + 1)}
                  style={[
                    styles.pageBtn,
                    {
                      borderColor: isDark ? '#373C44' : '#CBD5E1',
                      opacity: historyData.pagination.has_next ? 1 : 0.4,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pageBtnText,
                      {
                        color: historyData.pagination.has_next
                          ? isDark
                            ? Palette.chartreuse
                            : Palette.sageGreen
                          : Palette.slateGrey,
                      },
                    ]}>
                    Następna
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={historyData.pagination.has_next ? Palette.radioactiveGrass : Palette.slateGrey}
                  />
                </Pressable>
              </View>
            </Card>
          </>
        ) : (
          <ErrorStateCard
            error={historyError || { message: 'Brak danych historii zużycia z serwera backendu.' }}
            sourceUrl={historyUrl}
            onRetry={handleRefresh}
            isRetrying={historyRefreshing}
            title="Błąd ładowania historii zużycia"
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
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  forecastCard: {
    gap: 14,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  forecastTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  forecastSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  chartSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  chartScroll: {
    marginVertical: 6,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 120,
    paddingTop: 10,
    paddingBottom: 4,
  },
  chartCol: {
    alignItems: 'center',
    width: 32,
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  chartVal: {
    fontSize: 9,
    fontWeight: '700',
  },
  chartTrack: {
    width: 14,
    height: 70,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartFill: {
    width: '100%',
    borderRadius: 7,
  },
  chartHour: {
    fontSize: 10,
    fontWeight: '600',
  },
  peaksSection: {
    marginTop: 8,
    gap: 8,
  },
  peaksHeader: {
    fontSize: 13,
    fontWeight: '800',
  },
  peakCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  peakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  peakHourText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },
  peakExpl: {
    fontSize: 12,
    lineHeight: 16,
  },
  metricsCard: {
    padding: 14,
    gap: 12,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricsPeriod: {
    fontSize: 11,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  breakdownCard: {
    padding: 14,
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownSub: {
    fontSize: 11,
  },
  breakdownWrap: {
    gap: 10,
  },
  multiBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  legendGrid: {
    gap: 6,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
  },
  catRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  catPct: {
    fontSize: 11,
  },
  recordsCard: {
    padding: 14,
    gap: 10,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  pageIndicator: {
    fontSize: 11,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  recordDate: {
    fontSize: 12,
    fontWeight: '800',
  },
  recordCategories: {
    fontSize: 10,
    marginTop: 2,
  },
  recordKwh: {
    fontSize: 12,
    fontWeight: '800',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});