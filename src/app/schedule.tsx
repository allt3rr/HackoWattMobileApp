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
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BottomTabInset, MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApi';
import { ScheduleTimelineSlot } from '@/types/api';
import { extractHour, safeString, safeToFixed } from '@/utils/formatters';

type AudienceKey = 'dziadkowie' | 'mlodziez' | 'rodzice';

const DEFAULT_TIPS_BY_GENERATION = {
  dziadkowie:
    'Dziadkowie w domu (09:00–14:00): To idealny czas na gotowanie, pieczenie, pranie i zmywanie. Energia słoneczna PV pokrywa większość bieżącego zapotrzebowania domu.',
  mlodziez:
    'Młodzież i dzieci (po 15:00): Unikaj jednoczesnego włączania wielu urządzeń. Komputery i konsole zużywają niewiele, ale dogrzewacze czy czajnik potęgują drogi szczyt.',
  rodzice:
    'Pracujący rodzice (wieczór i rano): Korzystaj z funkcji opóźnionego startu w zmywarkach i pralkach na nocną dolinę (00:00–06:00) lub na godziny południowe.',
};

const DEFAULT_BEST_WINDOWS = {
  day_solar_window: {
    label: 'Okno słoneczne i dzienne',
    hours: '09:00 – 15:00',
    for_who: 'Dziadkowie i osoby pracujące zdalnie',
    recommended_devices: ['Pralka', 'Zmywarka', 'Suszarka'],
  },
  night_valley_window: {
    label: 'Nocna dolina taryfowa',
    hours: '00:00 – 06:00',
    for_who: 'Pracujący rodzice (timer w AGD, ładowanie EV)',
  },
  peak_avoid_window: {
    label: 'Szczyt popołudniowy (najdrożej)',
    hours: '17:00 – 21:00',
    advice: 'Unikaj jednoczesnego uruchamiania płyty indukcyjnej, piekarnika i pralki.',
  },
};

function getSlotActionFallback(statusCode: string): string {
  if (statusCode === 'green') {
    return 'Zielona strefa (najtańszy prąd / PV). Uruchamiaj pralkę, zmywarkę, ładowanie urządzeń.';
  }
  if (statusCode === 'yellow') {
    return 'Żółta strefa (stawka pośrednia). Standardowa praca urządzeń, optymalizuj zużycie tła.';
  }
  return 'Czerwona strefa (drogi szczyt). Ogranicz pracę urządzeń o dużej mocy (piekarnik, suszarka, czajnik).';
}

export default function ScheduleScreen() {
  const isDark = useColorScheme() === 'dark';
  const [selectedAudience, setSelectedAudience] = useState<AudienceKey>('dziadkowie');
  const [selectedHour, setSelectedHour] = useState<ScheduleTimelineSlot | null>(null);

  const {
    data: schedule,
    isLoading: scheduleLoading,
    isRefreshing: scheduleRefreshing,
    error: scheduleError,
    sourceUrl: scheduleUrl,
    refetch: refetchSchedule,
  } = useApiQuery(hackoWattApi.getSmartScheduleToday);

  const {
    data: tariffs,
    refetch: refetchTariffs,
  } = useApiQuery(hackoWattApi.getTariffs);

  const handleRefresh = async () => {
    await Promise.all([refetchSchedule(), refetchTariffs()]);
  };

  const currentHourNow = extractHour(schedule?.current_hour);
  const timeline = schedule?.timeline || [];

  const tips = schedule?.tips_by_generation;
  const currentTipText =
    selectedAudience === 'dziadkowie'
      ? safeString(tips?.dla_dziadkow, DEFAULT_TIPS_BY_GENERATION.dziadkowie)
      : selectedAudience === 'mlodziez'
      ? safeString(tips?.dla_mlodziezy, DEFAULT_TIPS_BY_GENERATION.mlodziez)
      : safeString(tips?.dla_rodzicow, DEFAULT_TIPS_BY_GENERATION.rodzice);

  const bestWindows = schedule?.best_windows ?? DEFAULT_BEST_WINDOWS;

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
            refreshing={scheduleRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header with Logo & Accessibility Controller */}
        <AppHeader
          title="eko-dziki"
          subtitle="Harmonogram 24h & Porady Pokoleniowe"
          sourceUrl={scheduleUrl}
          onRefresh={handleRefresh}
        />

        {scheduleLoading && !schedule ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.radioactiveGrass} />
            <AppText style={[styles.loadingText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Pobieranie harmonogramu i taryf z serwera...
            </AppText>
          </View>
        ) : schedule ? (
          <>
            {/* Zone Legend */}
            <Card style={styles.legendCard}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Palette.radioactiveGrass }]} />
                  <AppText style={[styles.legendText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Zielona: Tani / PV
                  </AppText>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
                  <AppText style={[styles.legendText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Żółta: Średnia
                  </AppText>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <AppText style={[styles.legendText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Czerwona: Szczyt
                  </AppText>
                </View>
              </View>
            </Card>

            {/* 24h Timeline Visualizer Grid */}
            <Card style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <View style={styles.timelineTitleGroup}>
                  <Ionicons name="time" size={20} color={Palette.radioactiveGrass} />
                  <AppText style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                    Harmonogram 24h (Dotknij godzinę)
                  </AppText>
                </View>
                <AppText style={[styles.timelineCurrentHour, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                  Teraz: {currentHourNow}:00
                </AppText>
              </View>

              <View style={styles.slotsGrid}>
                {timeline.map((slot) => {
                  const isCurrent = slot.is_current || slot.hour === currentHourNow;
                  const isSelected = selectedHour?.hour === slot.hour;

                  const getSlotBg = () => {
                    if (slot.status_code === 'green') {
                      return isDark ? 'rgba(132, 221, 99, 0.16)' : '#EBF9E6';
                    }
                    if (slot.status_code === 'yellow') {
                      return isDark ? 'rgba(234, 179, 8, 0.16)' : '#FEF9C3';
                    }
                    return isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEE2E2';
                  };

                  const getSlotBorder = () => {
                    if (isSelected) return isDark ? Palette.chartreuse : Palette.charcoal;
                    if (isCurrent) return Palette.radioactiveGrass;
                    if (slot.status_code === 'green') return Palette.radioactiveGrass;
                    if (slot.status_code === 'yellow') return '#FACC15';
                    return '#F87171';
                  };

                  return (
                    <Pressable
                      key={slot.hour}
                      onPress={() => setSelectedHour(slot)}
                      accessibilityRole="button"
                      accessibilityLabel={`Godzina ${slot.hour}:00, stawka ${safeToFixed(slot.price_per_kwh, 2)} euro`}
                      style={[
                        styles.slotBtn,
                        {
                          backgroundColor: getSlotBg(),
                          borderColor: getSlotBorder(),
                          borderWidth: isSelected || isCurrent ? 2 : 1,
                        },
                      ]}>
                      <AppText style={[styles.slotHour, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                        {slot.hour}:00
                      </AppText>
                      <AppText
                        style={[
                          styles.slotPrice,
                          {
                            color:
                              slot.status_code === 'green'
                                ? isDark
                                  ? Palette.chartreuse
                                  : '#1F5A17'
                                : slot.status_code === 'yellow'
                                ? isDark
                                  ? '#FDE047'
                                  : '#854D0E'
                                : isDark
                                ? '#FCA5A5'
                                : '#991B1B',
                          },
                        ]}>
                        {safeToFixed(slot.price_per_kwh, 2)} €
                      </AppText>
                      {isCurrent ? (
                        <View style={styles.nowBadge}>
                          <AppText style={styles.nowBadgeText}>TERAZ</AppText>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {/* Selected Hour Details Box */}
              {selectedHour ? (
                <View
                  style={[
                    styles.selectedHourBox,
                    {
                      borderColor:
                        selectedHour.status_code === 'green'
                          ? Palette.radioactiveGrass
                          : selectedHour.status_code === 'yellow'
                          ? '#EAB308'
                          : '#EF4444',
                      backgroundColor: isDark ? '#1C1F24' : '#FFFFFF',
                    },
                  ]}>
                  <View style={styles.selectedHourHeader}>
                    <AppText style={[styles.selectedHourTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                      Szczegóły: {selectedHour.hour_label}
                    </AppText>
                    <StatusBadge zone={selectedHour.status_code} label={selectedHour.badge} />
                  </View>
                  <AppText style={[styles.selectedHourRate, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Stawka:{' '}
                    <AppText style={{ fontWeight: '800', color: isDark ? Palette.chartreuse : Palette.sageGreen }}>
                      {safeToFixed(selectedHour.price_per_kwh, 3)} €/kWh
                    </AppText>
                  </AppText>
                  <AppText style={[styles.selectedHourAction, { color: isDark ? '#E2E8F0' : Palette.charcoal }]}>
                    💡 {selectedHour.recommended_action || getSlotActionFallback(selectedHour.status_code)}
                  </AppText>
                </View>
              ) : null}
            </Card>

            {/* Best Efficiency Windows */}
            {bestWindows ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="sparkles" size={18} color={Palette.radioactiveGrass} />
                  <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                    Rekomendowane Okna Czasowe
                  </AppText>
                </View>

                <View style={styles.windowsList}>
                  <Card style={styles.windowCard}>
                    <View style={styles.windowHeader}>
                      <AppText style={[styles.windowTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                        ☀️ {bestWindows.day_solar_window.label}
                      </AppText>
                      <StatusBadge variant="green" label={bestWindows.day_solar_window.hours} />
                    </View>
                    <AppText style={[styles.windowDesc, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Dla kogo: {bestWindows.day_solar_window.for_who}
                    </AppText>
                    {bestWindows.day_solar_window.recommended_devices ? (
                      <AppText style={[styles.windowExtra, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                        Zalecane AGD: {bestWindows.day_solar_window.recommended_devices.join(', ')}
                      </AppText>
                    ) : null}
                  </Card>

                  <Card style={styles.windowCard}>
                    <View style={styles.windowHeader}>
                      <AppText style={[styles.windowTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                        🌙 {bestWindows.night_valley_window.label}
                      </AppText>
                      <StatusBadge variant="blue" label={bestWindows.night_valley_window.hours} />
                    </View>
                    <AppText style={[styles.windowDesc, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Dla kogo: {bestWindows.night_valley_window.for_who}
                    </AppText>
                  </Card>

                  <Card style={styles.windowCard}>
                    <View style={styles.windowHeader}>
                      <AppText style={[styles.windowTitle, { color: '#EF4444' }]}>
                        ⚠️ {bestWindows.peak_avoid_window.label}
                      </AppText>
                      <StatusBadge variant="red" label={bestWindows.peak_avoid_window.hours} />
                    </View>
                    <AppText style={[styles.windowDesc, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Porada: {bestWindows.peak_avoid_window.advice}
                    </AppText>
                  </Card>
                </View>
              </>
            ) : null}

            {/* Section: Porady dla Pokoleń */}
            <View style={styles.sectionTitleRow}>
              <Ionicons name="people" size={18} color={Palette.sageGreen} />
              <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                Porady dedykowane dla pokoleń
              </AppText>
            </View>

            <SegmentedControl
              value={selectedAudience}
              onChange={(val) => setSelectedAudience(val as AudienceKey)}
              options={[
                { value: 'dziadkowie', label: '👓 Dla dziadków' },
                { value: 'mlodziez', label: '⚡ Dla młodzieży' },
                { value: 'rodzice', label: '💼 Dla rodziców' },
              ]}
            />

            <Card highlightZone={selectedAudience === 'dziadkowie' ? 'green' : 'yellow'} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View
                  style={[
                    styles.tipIconCircle,
                    {
                      backgroundColor:
                        selectedAudience === 'dziadkowie'
                          ? isDark
                            ? 'rgba(132, 221, 99, 0.2)'
                            : '#EBF9E6'
                          : selectedAudience === 'mlodziez'
                          ? isDark
                            ? 'rgba(203, 255, 77, 0.2)'
                            : '#FEF9C3'
                          : isDark
                          ? 'rgba(107, 170, 117, 0.2)'
                          : 'rgba(107, 170, 117, 0.15)',
                    },
                  ]}>
                  <Ionicons
                    name={
                      selectedAudience === 'dziadkowie'
                        ? 'home'
                        : selectedAudience === 'mlodziez'
                        ? 'game-controller'
                        : 'briefcase'
                    }
                    size={18}
                    color={
                      selectedAudience === 'dziadkowie'
                        ? Palette.radioactiveGrass
                        : selectedAudience === 'mlodziez'
                        ? '#CA8A04'
                        : Palette.sageGreen
                    }
                  />
                </View>
                <AppText style={[styles.tipTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  {selectedAudience === 'dziadkowie'
                    ? 'Porady dla Dziadków w domu'
                    : selectedAudience === 'mlodziez'
                    ? 'Porady dla Młodzieży i dzieci'
                    : 'Porady dla Pracujących Rodziców'}
                </AppText>
              </View>

              <AppText style={[styles.tipText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                {currentTipText}
              </AppText>
            </Card>

            {/* Official Tariffs Overview */}
            {tariffs && tariffs.periods ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="pricetags" size={18} color={Palette.slateGrey} />
                  <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                    Oficjalne Taryfy Dobowe
                  </AppText>
                </View>

                <View style={styles.tariffsList}>
                  {tariffs.periods.map((t, idx) => (
                    <Card key={idx} style={styles.tariffCard}>
                      <View style={styles.tariffHeader}>
                        <AppText style={[styles.tariffLabel, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                          {t.label}
                        </AppText>
                        <AppText
                          style={[
                            styles.tariffPrice,
                            {
                              color:
                                t.price_per_kwh <= 0.18
                                  ? isDark
                                    ? Palette.chartreuse
                                    : Palette.sageGreen
                                  : t.price_per_kwh <= 0.28
                                  ? '#EAB308'
                                  : '#EF4444',
                            },
                          ]}>
                          {safeToFixed(t.price_per_kwh, 3)} €/kWh
                        </AppText>
                      </View>
                      <AppText style={[styles.tariffHours, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Godziny: {t.start_hour}:00 – {t.end_hour}:00
                      </AppText>
                    </Card>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <ErrorStateCard
            error={scheduleError || { message: 'Błąd pobierania harmonogramu.' }}
            sourceUrl={scheduleUrl}
            onRetry={handleRefresh}
            isRetrying={scheduleRefreshing}
            title="Brak harmonogramu"
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
  legendCard: {
    padding: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineCard: {
    gap: 12,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  timelineTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 160,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  timelineCurrentHour: {
    fontSize: 12,
    fontWeight: '800',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  slotBtn: {
    width: '23.5%',
    minWidth: 64,
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  slotHour: {
    fontSize: 11,
    fontWeight: '700',
  },
  slotPrice: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  nowBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: Palette.chartreuse,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  nowBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#0F172A',
  },
  selectedHourBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
    marginTop: 4,
  },
  selectedHourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedHourTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  selectedHourRate: {
    fontSize: 13,
  },
  selectedHourAction: {
    fontSize: 13,
    lineHeight: 18,
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
  windowsList: {
    gap: 8,
  },
  windowCard: {
    gap: 6,
    padding: 12,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  windowTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  windowDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  windowExtra: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  tipCard: {
    gap: 10,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  tipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tariffsList: {
    gap: 8,
  },
  tariffCard: {
    gap: 4,
    padding: 12,
  },
  tariffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tariffLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  tariffPrice: {
    fontSize: 14,
    fontWeight: '900',
  },
  tariffHours: {
    fontSize: 12,
    fontWeight: '600',
  },
});