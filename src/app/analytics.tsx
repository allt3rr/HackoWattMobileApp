import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
import { safeString, safeToFixed } from '@/utils/formatters';

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
    const entries = Object.entries(categoriesTotals || {});
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
            const pct = safeToFixed((val / (totalKwh || 1)) * 100, 1);
            const cat = CATEGORY_COLORS[key] || { label: key, color: Palette.slateGrey };
            return (
              <View key={key} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <AppText style={[styles.catName, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                    {cat.label}
                  </AppText>
                </View>
                <View style={styles.catRight}>
                  <AppText style={[styles.catVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    {safeToFixed(val, 1)} kWh
                  </AppText>
                  <AppText style={[styles.catPct, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    ({pct}%)
                  </AppText>
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
            refreshing={historyRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header with EkoDzik Mobile Logo & Accessibility Bar */}
        <AppHeader
          title="eko-dziki"
          subtitle="Zużycie, Prognozy & Metryki Modelu"
          sourceUrl={historyUrl}
          onRefresh={handleRefresh}
        />

        {/* ============================================================ */}
        {/* SECTION 1: PROGNOZA ZAPOTRZEBOWANIA */}
        {/* ============================================================ */}
        <Card highlightZone="yellow" style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <View style={styles.forecastTitleGroup}>
              <Ionicons name="trending-up" size={22} color={Palette.radioactiveGrass} />
              <View style={{ flex: 1 }}>
                <AppText style={[styles.forecastTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Prognoza Zapotrzebowania
                </AppText>
                <AppText style={[styles.forecastSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Model AI z przewidywaniem szczytów i pogody
                </AppText>
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
                  value={safeToFixed(forecastData.total_kwh, 1)}
                  unit="kWh"
                  subtitle={`Horyzont ${forecastData.horizon_hours}h`}
                  accentColor={Palette.radioactiveGrass}
                />
                <MetricTile
                  label="Liczba szczytów"
                  value={Array.isArray(forecastData.peaks) ? forecastData.peaks.length : 0}
                  subtitle="Wykryte anomalie"
                  accentColor="#EF4444"
                />
              </View>

              {/* Hourly Chart preview */}
              {forecastData.items && forecastData.items.length > 0 ? (
                <>
                  <AppText style={[styles.chartSectionLabel, { color: isDark ? '#E2E8F0' : Palette.charcoal }]}>
                    Wykres godzinowy prognozy (kWh):
                  </AppText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                    <View style={styles.chartContainer}>
                      {forecastData.items.slice(0, 36).map((point, index) => {
                        const maxVal = 2.5;
                        const heightPercent = Math.min(100, (point.total_kwh / maxVal) * 100);
                        const isHigh = point.total_kwh > 1.1;
                        const hour = point.timestamp ? point.timestamp.substring(11, 16) : '--:--';

                        return (
                          <View key={index} style={styles.chartCol}>
                            <AppText style={[styles.chartVal, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                              {safeToFixed(point.total_kwh, 1)}
                            </AppText>
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
                            <AppText style={[styles.chartHour, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                              {hour}
                            </AppText>
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
                  <AppText style={[styles.peaksHeader, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                    Zidentyfikowane szczyty i wyjaśnienia:
                  </AppText>
                  {forecastData.peaks.map((peak, idx) => {
                    const formattedDate = peak.timestamp
                      ? new Date(peak.timestamp).toLocaleString('pl-PL', {
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';
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
                            <Ionicons name="alert-circle" size={18} color="#EF4444" />
                            <AppText style={styles.peakHourText}>{formattedDate}</AppText>
                          </View>
                          <StatusBadge variant="red" label={`Szczyt: ${safeToFixed(peak.total_kwh, 2)} kWh`} />
                        </View>
                        <AppText style={[styles.peakExpl, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                          {safeString(peak.explanation)}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : (
            <ErrorStateCard
              error={forecastError || { message: 'Błąd pobierania prognozy.' }}
              onRetry={handleRefresh}
              title="Błąd prognozy"
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
                <Ionicons name="shield-checkmark" size={20} color={Palette.radioactiveGrass} />
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.metricsTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                    Dokładność i Metryki Modelu AI
                  </AppText>
                  <AppText style={[styles.metricsPeriod, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Zbiór: {metricsData.godzin} godzin • Status: Aktywny
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <MetricTile
                label="MAPE Modelu"
                value={`${safeToFixed(metricsData.mape_model, 2)}%`}
                subtitle={`Baza: ${safeToFixed(metricsData.mape_baseline, 2)}%`}
                accentColor={Palette.radioactiveGrass}
              />
              <MetricTile
                label="MAE Błędu"
                value={`${safeToFixed(metricsData.mae_model, 3)}`}
                unit="kWh"
                subtitle={`Baza: ${safeToFixed(metricsData.mae_baseline, 3)}`}
                accentColor={isDark ? Palette.chartreuse : Palette.sageGreen}
              />
            </View>
          </Card>
        ) : null}

        {/* ============================================================ */}
        {/* SECTION 3: 6-CATEGORY CONSUMPTION HISTORY */}
        {/* ============================================================ */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="bar-chart" size={18} color={Palette.sageGreen} />
          <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
            Historia zużycia z podziałem na 6 kategorii
          </AppText>
        </View>

        {historyLoading && !historyData ? (
          <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
        ) : historyData ? (
          <>
            {/* 6-Category Breakdown Card */}
            <Card style={styles.breakdownCard}>
              <View style={{ gap: 2 }}>
                <AppText style={[styles.breakdownTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Struktura zużycia w okresie
                </AppText>
                <AppText style={[styles.breakdownSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Łącznie: {safeToFixed(historyData.summary?.total_kwh, 1)} kWh ({historyData.summary?.start} do {historyData.summary?.end})
                </AppText>
              </View>

              {renderCategoryBreakdown(
                historyData.summary?.categories_totals,
                historyData.summary?.total_kwh
              )}
            </Card>

            {/* Daily Records with Pagination */}
            <Card style={styles.recordsCard}>
              <View style={styles.recordsHeader}>
                <AppText style={[styles.recordsTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Godzinowy rejestr pomiarów
                </AppText>
                <AppText style={[styles.pageIndicator, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Strona {historyData.pagination?.page ?? 1} z {historyData.pagination?.total_pages ?? 1}
                </AppText>
              </View>

              {historyData.items.map((rec, idx) => {
                const dateStr = rec.timestamp ? rec.timestamp.replace('T', ' ').substring(0, 16) : '';
                const tempStr = rec.temperature_c != null ? ` (${safeToFixed(rec.temperature_c, 1)}°C)` : '';
                return (
                  <View
                    key={idx}
                    style={[
                      styles.recordRow,
                      { borderBottomColor: isDark ? '#2E333A' : '#E2E8F0' },
                    ]}>
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <AppText style={[styles.recordDate, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                        {dateStr}{tempStr}
                      </AppText>
                      <AppText style={[styles.recordCategories, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Ogrz: {safeToFixed(rec.categories?.Ogrzewanie_kWh, 2)} kWh • AGD: {safeToFixed(rec.categories?.Duze_AGD_kWh, 2)} kWh • RTV: {safeToFixed(rec.categories?.RTV_PC_kWh, 2)} kWh
                      </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                      <AppText style={[styles.recordKwh, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                        {safeToFixed(rec.total_kwh, 3)} kWh
                      </AppText>
                    </View>
                  </View>
                );
              })}

              {/* Pagination Controls (Large 44px Buttons) */}
              <View style={styles.paginationRow}>
                <Pressable
                  disabled={!historyData.pagination.has_previous}
                  onPress={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Poprzednia strona historii"
                  style={[
                    styles.pageBtn,
                    {
                      borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.2)',
                      opacity: historyData.pagination.has_previous ? 1 : 0.4,
                      backgroundColor: isDark ? '#2B3037' : '#FFFFFF',
                    },
                  ]}>
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={historyData.pagination.has_previous ? (isDark ? Palette.chartreuse : Palette.charcoal) : Palette.slateGrey}
                  />
                  <AppText
                    style={[
                      styles.pageBtnText,
                      {
                        color: historyData.pagination.has_previous
                          ? isDark
                            ? Palette.chartreuse
                            : Palette.charcoal
                          : Palette.slateGrey,
                      },
                    ]}>
                    Poprzednia
                  </AppText>
                </Pressable>

                <Pressable
                  disabled={!historyData.pagination.has_next}
                  onPress={() => setHistoryPage((p) => p + 1)}
                  accessibilityRole="button"
                  accessibilityLabel="Następna strona historii"
                  style={[
                    styles.pageBtn,
                    {
                      borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.2)',
                      opacity: historyData.pagination.has_next ? 1 : 0.4,
                      backgroundColor: isDark ? '#2B3037' : '#FFFFFF',
                    },
                  ]}>
                  <AppText
                    style={[
                      styles.pageBtnText,
                      {
                        color: historyData.pagination.has_next
                          ? isDark
                            ? Palette.chartreuse
                            : Palette.charcoal
                          : Palette.slateGrey,
                      },
                    ]}>
                    Następna
                  </AppText>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={historyData.pagination.has_next ? (isDark ? Palette.chartreuse : Palette.charcoal) : Palette.slateGrey}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
  },
  forecastCard: {
    gap: 14,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  forecastTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 180,
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
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
    gap: 6,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  metricsTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 180,
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
    fontSize: 16,
    fontWeight: '900',
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
    height: 14,
    borderRadius: 7,
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
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 2,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 120,
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
    flexWrap: 'wrap',
    gap: 6,
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
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '800',
  },
  recordCategories: {
    fontSize: 11,
    marginTop: 2,
  },
  recordKwh: {
    fontSize: 13,
    fontWeight: '900',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  pageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});