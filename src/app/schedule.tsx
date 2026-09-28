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
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Spacing,
} from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApi';
import { ScheduleTimelineSlot } from '@/types/api';

type AudienceKey = 'dziadkowie' | 'mlodziez' | 'rodzice';

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

  const currentHourNow = schedule?.current_hour ?? new Date().getHours();
  const timeline = schedule?.timeline || [];

  const tips = schedule?.tips_by_generation;
  const currentTipText =
    selectedAudience === 'dziadkowie'
      ? tips?.dla_dziadkow
      : selectedAudience === 'mlodziez'
      ? tips?.dla_mlodziezy
      : tips?.dla_rodzicow;

  const bestWindows = schedule?.best_windows;

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
            refreshing={scheduleRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
              Harmonogram Dnia
            </Text>
            <Text style={[styles.screenSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Strefy cenowe 24h i inteligentne porady dla pokoleń
            </Text>
          </View>
          <ApiStatusIndicator sourceUrl={scheduleUrl} onRefresh={handleRefresh} />
        </View>

        {scheduleLoading && !schedule ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.radioactiveGrass} />
            <Text style={[styles.loadingText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Pobieranie harmonogramu i taryf z serwera...
            </Text>
          </View>
        ) : schedule ? (
          <>
            {/* Zone Legend */}
            <Card style={styles.legendCard}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Palette.radioactiveGrass }]} />
                  <Text style={[styles.legendText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Zielona: Tani prąd / PV
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
                  <Text style={[styles.legendText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Żółta: Średnia
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.legendText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Czerwona: Szczyt
                  </Text>
                </View>
              </View>
            </Card>

            {/* 24h Timeline Visualizer Grid */}
            <Card style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <View style={styles.timelineTitleGroup}>
                  <Ionicons name="time" size={18} color={Palette.radioactiveGrass} />
                  <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Harmonogram 24 godzin (Wybierz godzinę)
                  </Text>
                </View>
                <Text style={[styles.timelineCurrentHour, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                  Teraz: {currentHourNow}:00
                </Text>
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
                    if (isSelected) return isDark ? Palette.chartreuse : '#1C2024';
                    if (isCurrent) return Palette.radioactiveGrass;
                    if (slot.status_code === 'green') return Palette.radioactiveGrass;
                    if (slot.status_code === 'yellow') return '#FACC15';
                    return '#F87171';
                  };

                  return (
                    <Pressable
                      key={slot.hour}
                      onPress={() => setSelectedHour(slot)}
                      style={[
                        styles.slotBtn,
                        {
                          backgroundColor: getSlotBg(),
                          borderColor: getSlotBorder(),
                          borderWidth: isSelected || isCurrent ? 2 : 1,
                        },
                      ]}>
                      <Text style={[styles.slotHour, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                        {slot.hour}:00
                      </Text>
                      <Text
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
                        {slot.price_per_kwh.toFixed(2)}
                      </Text>
                      {isCurrent ? (
                        <View style={styles.nowBadge}>
                          <Text style={styles.nowBadgeText}>TERAZ</Text>
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
                    <Text style={[styles.selectedHourTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      Szczegóły: {selectedHour.hour_label}
                    </Text>
                    <StatusBadge zone={selectedHour.status_code} label={selectedHour.badge} />
                  </View>
                  <Text style={[styles.selectedHourRate, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Stawka:{' '}
                    <Text style={{ fontWeight: '800', color: isDark ? Palette.chartreuse : Palette.sageGreen }}>
                      {selectedHour.price_per_kwh.toFixed(3)} €/kWh
                    </Text>
                  </Text>
                  <Text style={[styles.selectedHourAction, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
                    💡 {selectedHour.recommended_action}
                  </Text>
                </View>
              ) : null}
            </Card>

            {/* Best Efficiency Windows */}
            {bestWindows ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="sparkles" size={18} color={Palette.radioactiveGrass} />
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Rekomendowane Okna Czasowe
                  </Text>
                </View>

                <View style={styles.windowsList}>
                  <Card style={styles.windowCard}>
                    <View style={styles.windowHeader}>
                      <Text style={[styles.windowTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        ☀️ {bestWindows.day_solar_window.label}
                      </Text>
                      <StatusBadge variant="green" label={bestWindows.day_solar_window.hours} />
                    </View>
                    <Text style={[styles.windowDesc, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Dla kogo: {bestWindows.day_solar_window.for_who}
                    </Text>
                    {bestWindows.day_solar_window.recommended_devices ? (
                      <Text style={[styles.windowExtra, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                        Zalecane AGD: {bestWindows.day_solar_window.recommended_devices.join(', ')}
                      </Text>
                    ) : null}
                  </Card>

                  <Card style={styles.windowCard}>
                    <View style={styles.windowHeader}>
                      <Text style={[styles.windowTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        🌙 {bestWindows.night_valley_window.label}
                      </Text>
                      <StatusBadge variant="blue" label={bestWindows.night_valley_window.hours} />
                    </View>
                    <Text style={[styles.windowDesc, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Dla kogo: {bestWindows.night_valley_window.for_who}
                    </Text>
                  </Card>

                  <Card style={styles.windowCard}>
                    <View style={styles.windowHeader}>
                      <Text style={[styles.windowTitle, { color: '#EF4444' }]}>
                        ⚠️ {bestWindows.peak_avoid_window.label}
                      </Text>
                      <StatusBadge variant="red" label={bestWindows.peak_avoid_window.hours} />
                    </View>
                    <Text style={[styles.windowDesc, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Porada: {bestWindows.peak_avoid_window.advice}
                    </Text>
                  </Card>
                </View>
              </>
            ) : null}

            {/* Section: Porady dla Pokoleń */}
            <View style={styles.sectionTitleRow}>
              <Ionicons name="people" size={18} color={Palette.sageGreen} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                Porady dedykowane dla pokoleń
              </Text>
            </View>

            <SegmentedControl
              value={selectedAudience}
              onChange={(val) => setSelectedAudience(val as AudienceKey)}
              options={[
                { value: 'dziadkowie', label: 'Dla dziadków' },
                { value: 'mlodziez', label: 'Dla młodzieży' },
                { value: 'rodzice', label: 'Dla rodziców' },
              ]}
            />

            {currentTipText ? (
              <Card style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={[styles.tipIconCircle, { backgroundColor: isDark ? '#2B3037' : '#EBF9E6' }]}>
                    <Ionicons
                      name={
                        selectedAudience === 'dziadkowie'
                          ? 'sunny'
                          : selectedAudience === 'mlodziez'
                          ? 'game-controller'
                          : 'shield-checkmark'
                      }
                      size={20}
                      color={Palette.radioactiveGrass}
                    />
                  </View>
                  <Text style={[styles.tipTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    {selectedAudience === 'dziadkowie'
                      ? 'Dziadkowie w domu (9:00 - 14:00)'
                      : selectedAudience === 'mlodziez'
                      ? 'Młodzież i dzieci (po 14:00)'
                      : 'Rodzice (wieczorem i rano)'}
                  </Text>
                </View>

                <Text style={[styles.tipText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                  {currentTipText}
                </Text>
              </Card>
            ) : null}

            {/* Tariffs Breakdown Section */}
            {tariffs ? (
              <>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="pricetags" size={18} color={Palette.charcoal} />
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Strefy Taryfowe ({tariffs.currency})
                  </Text>
                </View>

                <View style={styles.tariffsList}>
                  {tariffs.periods.map((period, idx) => (
                    <Card key={idx} style={styles.tariffCard}>
                      <View style={styles.tariffHeader}>
                        <Text style={[styles.tariffLabel, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                          {period.label}
                        </Text>
                        <Text style={[styles.tariffPrice, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                          {period.price_per_kwh.toFixed(2)} €/kWh
                        </Text>
                      </View>
                      <Text style={[styles.tariffHours, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Godziny: {period.start_hour}:00 – {period.end_hour}:00
                      </Text>
                    </Card>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <ErrorStateCard
            error={scheduleError || { message: 'Nie udało się pobrać harmonogramu z serwera.' }}
            sourceUrl={scheduleUrl}
            onRetry={handleRefresh}
            isRetrying={scheduleRefreshing}
            title="Błąd harmonogramu"
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
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineCard: {
    gap: 14,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineCurrentHour: {
    fontSize: 12,
    fontWeight: '700',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotBtn: {
    width: '14.8%',
    minWidth: 42,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotHour: {
    fontSize: 10,
    fontWeight: '600',
  },
  slotPrice: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  nowBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: Palette.chartreuse,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  nowBadgeText: {
    fontSize: 7,
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
  },
  selectedHourTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  selectedHourRate: {
    fontSize: 12,
  },
  selectedHourAction: {
    fontSize: 12,
    lineHeight: 16,
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
  windowsList: {
    gap: 8,
  },
  windowCard: {
    gap: 4,
    padding: 12,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  windowDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  windowExtra: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tipCard: {
    gap: 8,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
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
  },
  tariffLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  tariffPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  tariffHours: {
    fontSize: 11,
    fontWeight: '600',
  },
});