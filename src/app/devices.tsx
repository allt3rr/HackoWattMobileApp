import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hackoWattApi } from '@/api/endpoints';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ErrorStateCard } from '@/components/ui/ErrorStateCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Spacing,
} from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApi';
import { DeviceGuidanceItem } from '@/types/api';
import { safeString, safeToFixed } from '@/utils/formatters';

interface EnrichedDevice {
  device: string;
  cycleOrAnnualText: string;
  annualSavingsText: string;
  bestHours: string;
  targetGroup: string;
  tip: string;
}

function mapToBackendDevice(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('pral')) return 'Pralka';
  if (n.includes('zmyw')) return 'Zmywarka';
  if (n.includes('susz')) return 'Suszarka';
  return 'Pralka';
}

function enrichDeviceGuidance(device: DeviceGuidanceItem): EnrichedDevice {
  const name = device.device;
  const n = name.toLowerCase();

  let cycleOrAnnualText = `${safeToFixed(device.annual_energy_kwh, 1)} kWh / rok`;
  if (device.energy_per_cycle_kwh != null) {
    cycleOrAnnualText = `${safeToFixed(device.energy_per_cycle_kwh, 2)} kWh / cykl`;
  }

  let savingsEur = device.annual_savings_potential_eur;
  if (savingsEur == null && device.energy_started_outside_pv_window_kwh != null) {
    savingsEur = Math.round(device.energy_started_outside_pv_window_kwh * 0.15 * 10) / 10;
  }

  let bestHours = device.best_hours;
  let targetGroup = device.target_group;
  let tip = device.tip_pl;

  if (n.includes('zmyw')) {
    savingsEur = savingsEur ?? 28;
    bestHours = bestHours || '09:00 – 15:00 lub 01:00 – 05:00';
    targetGroup = targetGroup || 'Dziadkowie w dzień / Rodzice (timer nocny)';
    tip = tip || 'Uruchamiaj tylko w pełni załadowaną zmywarkę w programie Eco 50°C.';
  } else if (n.includes('pral')) {
    savingsEur = savingsEur ?? 22;
    bestHours = bestHours || '09:00 – 14:00 (Słońce / PV)';
    targetGroup = targetGroup || 'Dziadkowie w domu / Młodzież po szkole';
    tip = tip || 'Pranie w 30–40°C zużywa do 40% mniej energii niż w 60°C.';
  } else if (n.includes('susz')) {
    savingsEur = savingsEur ?? 45;
    bestHours = bestHours || '10:00 – 15:00 (Maksimum PV)';
    targetGroup = targetGroup || 'Rodzice w weekend / Dziadkowie w południe';
    tip = tip || 'Suszarka bębnowa pobiera najwięcej prądu – uruchamiaj tylko w oknie PV!';
  } else if (n.includes('gotow') || n.includes('piek')) {
    savingsEur = savingsEur ?? 18;
    bestHours = bestHours || '11:00 – 14:00 (Przed szczytem)';
    targetGroup = targetGroup || 'Dziadkowie w domu w ciągu dnia';
    tip = tip || 'Gotuj pod przykryciem i wykorzystuj ciepło resztkowe piekarnika.';
  } else {
    savingsEur = savingsEur ?? 14;
    bestHours = bestHours || 'Poza godzinami 17:00 – 21:00';
    targetGroup = targetGroup || 'Młodzież i pracujący rodzice';
    tip = tip || 'Wyłączaj urządzenia ze stanu czuwania (standby) listwą zasilającą.';
  }

  return {
    device: name,
    cycleOrAnnualText,
    annualSavingsText: `+${safeToFixed(savingsEur, 0)} €/rok`,
    bestHours,
    targetGroup,
    tip,
  };
}

export default function DevicesScreen() {
  const isDark = useColorScheme() === 'dark';

  // Calculator State
  const [selectedDeviceName, setSelectedDeviceName] = useState('Pralka');
  const [origHour, setOrigHour] = useState(19);
  const [targetHour, setTargetHour] = useState(12);

  // Device Filter for Events
  const [eventDeviceFilter, setEventDeviceFilter] = useState('');

  // 1. Devices Guidance Query
  const {
    data: guidanceData,
    isLoading: guidanceLoading,
    isRefreshing: guidanceRefreshing,
    error: guidanceError,
    sourceUrl,
    refetch: refetchGuidance,
  } = useApiQuery(hackoWattApi.getDeviceGuidance);

  // 2. Flexible Events Query
  const {
    data: eventsData,
    refetch: refetchEvents,
  } = useApiQuery(
    () => hackoWattApi.getFlexibleEvents({ device: eventDeviceFilter }),
    eventDeviceFilter
  );

  // 3. Shift Simulation Query
  const {
    data: simResult,
    isLoading: isSimulating,
    refetch: refetchSimulation,
  } = useApiQuery(
    () =>
      hackoWattApi.simulateDeviceShift({
        device: mapToBackendDevice(selectedDeviceName),
        original_hour: origHour,
        target_hour: targetHour,
      }),
    `${mapToBackendDevice(selectedDeviceName)}-${origHour}-${targetHour}`
  );

  const handleRefresh = async () => {
    await Promise.all([refetchGuidance(), refetchEvents(), refetchSimulation()]);
  };

  const handleSelectGuidanceDevice = (device: DeviceGuidanceItem) => {
    setSelectedDeviceName(device.device);
    setTargetHour(12);
    setOrigHour(19);
  };

  const getDeviceIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const n = name.toLowerCase();
    if (n.includes('zmyw')) return 'restaurant';
    if (n.includes('pral')) return 'water';
    if (n.includes('susz')) return 'cloud';
    if (n.includes('piek') || n.includes('gotow')) return 'flame';
    return 'hardware-chip';
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
            refreshing={guidanceRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header with EkoDzik Mobile Logo & Accessibility Bar */}
        <AppHeader
          title="eko-dziki"
          subtitle="Urządzenia AGD & Kalkulator Oszczędności"
          sourceUrl={sourceUrl}
          onRefresh={handleRefresh}
        />

        {/* ============================================================ */}
        {/* SHIFT SIMULATOR CALCULATOR */}
        {/* ============================================================ */}
        <Card highlightZone="green" style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <View style={styles.calcTitleGroup}>
              <Ionicons name="calculator" size={24} color={Palette.radioactiveGrass} />
              <View style={{ flex: 1 }}>
                <AppText style={[styles.calcTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  Kalkulator przesunięcia pracy AGD
                </AppText>
                <AppText style={[styles.calcSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Przelicz zysk w EUR z przesunięcia cyklu (np. 19:00 ➔ 12:00)
                </AppText>
              </View>
            </View>
            <StatusBadge variant="green" label="Oszczędzaj €" />
          </View>

          {/* Device Picker Buttons */}
          <AppText style={[styles.pickerLabel, { color: isDark ? '#E2E8F0' : Palette.charcoal }]}>
            Wybierz urządzenie do kalkulacji:
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.devicePillsRow}>
            {['Pralka', 'Zmywarka', 'Suszarka bębnowa', 'Piekarnik i płyta indukcyjna', 'Komputery, konsole i telewizory'].map(
              (dev) => {
                const isSelected = selectedDeviceName === dev;
                return (
                    <Pressable
                    key={dev}
                    onPress={() => setSelectedDeviceName(dev)}
                    accessibilityRole="button"
                    style={[
                      styles.devicePill,
                      {
                        backgroundColor: isSelected
                          ? Palette.chartreuse
                          : isDark
                          ? '#252930'
                          : '#FFFFFF',
                        borderColor: isSelected
                          ? 'rgba(84, 84, 84, 0.25)'
                          : isDark
                          ? '#373C44'
                          : 'rgba(84, 84, 84, 0.18)',
                      },
                    ]}>
                    <AppText
                      style={[
                        styles.devicePillText,
                        {
                          color: isSelected
                            ? Palette.charcoal
                            : isDark
                            ? '#CBD5E1'
                            : Palette.charcoal,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}>
                      {dev}
                    </AppText>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {/* Hour Selectors (Senior-Friendly Large 44px Steppers) */}
          <View style={styles.stepperContainer}>
            {/* Original Hour Card */}
            <View
              style={[
                styles.hourBox,
                {
                  backgroundColor: isDark ? '#22252A' : '#FFFFFF',
                  borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.18)',
                },
              ]}>
              <AppText style={[styles.hourColLabel, { color: '#EF4444' }]}>
                🔴 Oryginalna (droga):
              </AppText>
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => setOrigHour((h) => Math.max(0, h - 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Zmniejsz godzinę startową"
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#F7F6ED', borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.2)', borderWidth: 1 }]}>
                  <AppText style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>-</AppText>
                </Pressable>
                <AppText style={[styles.origHourText, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                  {origHour < 10 ? `0${origHour}:00` : `${origHour}:00`}
                </AppText>
                <Pressable
                  onPress={() => setOrigHour((h) => Math.min(23, h + 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Zwiększ godzinę startową"
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#F7F6ED', borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.2)', borderWidth: 1 }]}>
                  <AppText style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>+</AppText>
                </Pressable>
              </View>
            </View>

            <View style={styles.arrowBox}>
              <Ionicons name="arrow-forward-circle" size={26} color={Palette.radioactiveGrass} />
            </View>

            {/* Target Hour Card */}
            <View
              style={[
                styles.hourBox,
                {
                  backgroundColor: isDark ? '#22252A' : '#FFFFFF',
                  borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.18)',
                },
              ]}>
              <AppText style={[styles.hourColLabel, { color: isDark ? Palette.chartreuse : '#1F5A17' }]}>
                🟢 Nowa (tania / PV):
              </AppText>
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => setTargetHour((h) => Math.max(0, h - 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Zmniejsz godzinę docelową"
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#F7F6ED', borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.2)', borderWidth: 1 }]}>
                  <AppText style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>-</AppText>
                </Pressable>
                <AppText style={[styles.targetHourText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                  {targetHour < 10 ? `0${targetHour}:00` : `${targetHour}:00`}
                </AppText>
                <Pressable
                  onPress={() => setTargetHour((h) => Math.min(23, h + 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Zwiększ godzinę docelową"
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#F7F6ED', borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.2)', borderWidth: 1 }]}>
                  <AppText style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>+</AppText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Simulation Output Card */}
          {isSimulating ? (
            <ActivityIndicator size="small" color={Palette.radioactiveGrass} style={{ marginVertical: 12 }} />
          ) : simResult ? (
            <View
              style={[
                styles.resultBox,
                {
                  borderColor: isDark ? '#373C44' : 'rgba(84, 84, 84, 0.18)',
                  backgroundColor: isDark ? '#1C1F24' : '#FFFFFF',
                },
              ]}>
              <View style={styles.resultMetricsRow}>
                <View style={{ flex: 1, minWidth: 130 }}>
                  <AppText style={[styles.resultMetricLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Zysk na cykl
                  </AppText>
                  <AppText style={[styles.resultCycleVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    +{safeToFixed(simResult.savings_per_cycle_eur, 3)} €
                  </AppText>
                  <AppText style={[styles.resultCostSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Koszt: {safeToFixed(simResult.target_cost_eur, 3)} € (było {safeToFixed(simResult.original_cost_eur, 3)} €)
                  </AppText>
                </View>

                <View style={{ flex: 1, minWidth: 130, alignItems: 'flex-start' }}>
                  <AppText style={[styles.resultMetricLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Szac. zysk roczny
                  </AppText>
                  <AppText style={[styles.resultYearVal, { color: Palette.radioactiveGrass }]}>
                    +{safeToFixed(simResult.estimated_annual_savings_eur, 2)} €
                  </AppText>
                  <AppText style={[styles.resultCostSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    cykli rocznie: {simResult.estimated_annual_cycles ?? 0}
                  </AppText>
                </View>
              </View>

              <AppText style={[styles.resultRecText, { color: isDark ? '#E2E8F0' : Palette.charcoal }]}>
                💡 {safeString(simResult.recommendation, 'Zalecane przesunięcie cyklu.')}
              </AppText>
            </View>
          ) : null}
        </Card>

        {/* ============================================================ */}
        {/* DEVICE GUIDANCE CARDS */}
        {/* ============================================================ */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="apps" size={18} color={Palette.sageGreen} />
          <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
            Karty sprzętów domowych (Przewodnik)
          </AppText>
        </View>

        {guidanceLoading && !guidanceData ? (
          <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
        ) : guidanceData ? (
          <View style={styles.guidanceList}>
            {guidanceData.devices.map((device, idx) => {
              const enriched = enrichDeviceGuidance(device);
              return (
                <Card key={idx} bordered style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceLeft}>
                      <View style={[styles.deviceIconBox, { backgroundColor: isDark ? '#2B3037' : '#EBF9E6' }]}>
                        <Ionicons
                          name={getDeviceIcon(device.device)}
                          size={22}
                          color={Palette.radioactiveGrass}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText style={[styles.deviceName, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                          {enriched.device}
                        </AppText>
                        <AppText style={[styles.deviceKwh, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                          {enriched.cycleOrAnnualText}
                        </AppText>
                      </View>
                    </View>
                    <StatusBadge variant="green" label={enriched.annualSavingsText} />
                  </View>

                  {/* Best Hours Tag */}
                  <View style={styles.hoursTagRow}>
                    <Ionicons name="time-outline" size={16} color={Palette.radioactiveGrass} />
                    <AppText style={[styles.hoursTagText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                      Najlepsze pory: {enriched.bestHours}
                    </AppText>
                  </View>

                  <AppText style={[styles.deviceTarget, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    Dla kogo: {enriched.targetGroup}
                  </AppText>

                  <AppText style={[styles.deviceTip, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    💡 {enriched.tip}
                  </AppText>

                  <Pressable
                    onPress={() => handleSelectGuidanceDevice(device)}
                    accessibilityRole="button"
                    style={styles.calcActionRow}>
                    <Ionicons name="calculator-outline" size={16} color={Palette.radioactiveGrass} />
                    <AppText style={[styles.calcActionText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                      Przelicz w kalkulatorze powyżej ➔
                    </AppText>
                  </Pressable>
                </Card>
              );
            })}
          </View>
        ) : (
          <ErrorStateCard
            error={guidanceError || { message: 'Brak danych przewodnika AGD z serwera backendu.' }}
            sourceUrl={sourceUrl}
            onRetry={handleRefresh}
            isRetrying={guidanceRefreshing}
            title="Brak połączenia z przewodnikiem urządzeń"
          />
        )}

        {/* ============================================================ */}
        {/* FLEXIBLE EVENTS */}
        {/* ============================================================ */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="sync" size={18} color={Palette.charcoal} />
          <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
            Zrealizowane cykle elastyczne (Historia)
          </AppText>
        </View>

        {/* Quick Filter Bar */}
        <View style={styles.filterWrap}>
          <TextInput
            value={eventDeviceFilter}
            onChangeText={setEventDeviceFilter}
            placeholder="Filtruj po urządzeniu (np. Pralka, Zmywarka)..."
            placeholderTextColor={Palette.slateGrey}
            style={[
              styles.filterInput,
              {
                borderColor: isDark ? '#373C44' : '#E2E8F0',
                color: isDark ? '#FFFFFF' : Palette.charcoal,
                backgroundColor: isDark ? '#22252A' : '#FFFFFF',
              },
            ]}
          />
          {eventDeviceFilter ? (
            <Pressable onPress={() => setEventDeviceFilter('')} accessibilityRole="button" style={styles.clearFilterBtn}>
              <Ionicons name="close-circle" size={18} color={Palette.slateGrey} />
            </Pressable>
          ) : null}
        </View>

        {eventsData ? (
          <View style={styles.eventsList}>
            <AppText style={[styles.eventsCountText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Liczba odnotowanych cykli:{' '}
              <AppText style={{ fontWeight: '800', color: isDark ? Palette.chartreuse : Palette.sageGreen }}>
                {eventsData.pagination?.total_items ?? eventsData.items?.length}
              </AppText>
            </AppText>

            {eventsData.items.map((evt, index) => (
              <Card key={index} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleGroup}>
                    <Ionicons name="calendar-outline" size={16} color={Palette.radioactiveGrass} />
                    <AppText style={[styles.eventDeviceName, { color: isDark ? '#FFFFFF' : Palette.charcoal }]}>
                      {evt.device}
                    </AppText>
                  </View>
                  <StatusBadge variant="green" label={`${evt.start_hour}:00`} />
                </View>

                <View style={styles.eventFooter}>
                  <AppText style={[styles.eventSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Dzień: {evt.day} • Czas: {evt.duration_h}h
                  </AppText>
                  <AppText style={[styles.eventEnergy, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    Zużycie: {safeToFixed(evt.energy_kwh, 2)} kWh
                  </AppText>
                </View>
              </Card>
            ))}
          </View>
        ) : null}
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
  calcCard: {
    gap: 14,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  calcTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 180,
  },
  calcTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  calcSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  devicePillsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  devicePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  devicePillText: {
    fontSize: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  hourBox: {
    flex: 1,
    minWidth: 130,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  hourColLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '900',
  },
  origHourText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF4444',
  },
  targetHourText: {
    fontSize: 18,
    fontWeight: '900',
  },
  arrowBox: {
    paddingHorizontal: 4,
    alignSelf: 'center',
  },
  resultBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  resultMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultMetricLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultCycleVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  resultYearVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  resultCostSub: {
    fontSize: 11,
  },
  resultRecText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
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
  guidanceList: {
    gap: 10,
  },
  deviceCard: {
    gap: 8,
    padding: 14,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 180,
  },
  deviceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '800',
  },
  deviceKwh: {
    fontSize: 12,
    marginTop: 1,
  },
  hoursTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deviceTarget: {
    fontSize: 12,
    fontWeight: '600',
  },
  deviceTip: {
    fontSize: 12,
    lineHeight: 17,
  },
  calcActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    minHeight: 40,
  },
  calcActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  filterWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  filterInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  clearFilterBtn: {
    position: 'absolute',
    right: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    gap: 8,
  },
  eventsCountText: {
    fontSize: 12,
    paddingVertical: 2,
  },
  eventCard: {
    gap: 6,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  eventTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDeviceName: {
    fontSize: 14,
    fontWeight: '800',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 2,
  },
  eventSub: {
    fontSize: 12,
  },
  eventEnergy: {
    fontSize: 12,
    fontWeight: '800',
  },
});