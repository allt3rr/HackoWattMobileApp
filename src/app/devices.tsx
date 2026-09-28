import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { hackoWattApi } from '@/api/endpoints';
import { ApiStatusIndicator } from '@/components/ui/ApiStatusIndicator';
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
        device: selectedDeviceName,
        original_hour: origHour,
        target_hour: targetHour,
      }),
    `${selectedDeviceName}-${origHour}-${targetHour}`
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
            refreshing={guidanceRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
              Urządzenia & Kalkulator
            </Text>
            <Text style={[styles.screenSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Przewodnik po AGD, symulator przesunięcia i harmonogram elastyczny
            </Text>
          </View>
          <ApiStatusIndicator sourceUrl={sourceUrl} onRefresh={handleRefresh} />
        </View>

        {/* ============================================================ */}
        {/* SHIFT SIMULATOR CALCULATOR */}
        {/* ============================================================ */}
        <Card highlightZone="green" style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <View style={styles.calcTitleGroup}>
              <Ionicons name="calculator" size={22} color={Palette.radioactiveGrass} />
              <View>
                <Text style={[styles.calcTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Kalkulator przesunięcia pracy AGD
                </Text>
                <Text style={[styles.calcSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Przelicz zysk w EUR z przesunięcia cyklu (np. 19:00 ➔ 12:00)
                </Text>
              </View>
            </View>
            <StatusBadge variant="green" label="Oszczędzaj €" />
          </View>

          {/* Device Picker Buttons */}
          <Text style={[styles.pickerLabel, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
            Wybierz urządzenie do kalkulacji:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.devicePillsRow}>
            {['Pralka', 'Zmywarka', 'Suszarka bębnowa', 'Piekarnik i płyta indukcyjna', 'Komputery, konsole i telewizory'].map(
              (dev) => {
                const isSelected = selectedDeviceName === dev;
                return (
                  <Pressable
                    key={dev}
                    onPress={() => setSelectedDeviceName(dev)}
                    style={[
                      styles.devicePill,
                      {
                        backgroundColor: isSelected
                          ? Palette.chartreuse
                          : isDark
                          ? '#252930'
                          : '#EDF1EE',
                        borderColor: isSelected
                          ? Palette.radioactiveGrass
                          : isDark
                          ? '#373C44'
                          : '#E0E5E2',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.devicePillText,
                        {
                          color: isSelected
                            ? '#0F172A'
                            : isDark
                            ? '#CBD5E1'
                            : Palette.charcoal,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}>
                      {dev}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {/* Hour Selectors */}
          <View style={styles.stepperContainer}>
            <View style={styles.hourCol}>
              <Text style={[styles.hourColLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Godzina oryginalna (droga):
              </Text>
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => setOrigHour((h) => Math.max(0, h - 1))}
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#EDF1EE' }]}>
                  <Text style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>-</Text>
                </Pressable>
                <Text style={styles.origHourText}>
                  {origHour < 10 ? `0${origHour}:00` : `${origHour}:00`}
                </Text>
                <Pressable
                  onPress={() => setOrigHour((h) => Math.min(23, h + 1))}
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#EDF1EE' }]}>
                  <Text style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.arrowBox}>
              <Ionicons name="arrow-forward" size={20} color={Palette.radioactiveGrass} />
            </View>

            <View style={styles.hourCol}>
              <Text style={[styles.hourColLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Nowa godzina (tania / PV):
              </Text>
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => setTargetHour((h) => Math.max(0, h - 1))}
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#EDF1EE' }]}>
                  <Text style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>-</Text>
                </Pressable>
                <Text style={[styles.targetHourText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                  {targetHour < 10 ? `0${targetHour}:00` : `${targetHour}:00`}
                </Text>
                <Pressable
                  onPress={() => setTargetHour((h) => Math.min(23, h + 1))}
                  style={[styles.stepperBtn, { backgroundColor: isDark ? '#2B3037' : '#EDF1EE' }]}>
                  <Text style={[styles.stepperBtnText, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>+</Text>
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
                  borderColor: isDark ? '#373C44' : '#E0E5E2',
                  backgroundColor: isDark ? '#1C1F24' : '#F8FAFC',
                },
              ]}>
              <View style={styles.resultMetricsRow}>
                <View style={{ gap: 2 }}>
                  <Text style={[styles.resultMetricLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Zysk na cykl
                  </Text>
                  <Text style={[styles.resultCycleVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    +{simResult.savings_per_cycle_eur?.toFixed(3)} €
                  </Text>
                  <Text style={[styles.resultCostSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Koszt: {simResult.target_cost_eur?.toFixed(3)} € (było {simResult.original_cost_eur?.toFixed(3)} €)
                  </Text>
                </View>

                <View style={{ gap: 2, alignItems: 'flex-end' }}>
                  <Text style={[styles.resultMetricLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Szac. zysk roczny
                  </Text>
                  <Text style={[styles.resultYearVal, { color: Palette.radioactiveGrass }]}>
                    +{simResult.estimated_annual_savings_eur?.toFixed(2)} €
                  </Text>
                  <Text style={[styles.resultCostSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    cykli rocznie: {simResult.estimated_annual_cycles}
                  </Text>
                </View>
              </View>

              <Text style={[styles.resultRecText, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
                💡 {simResult.recommendation}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* ============================================================ */}
        {/* DEVICE GUIDANCE CARDS */}
        {/* ============================================================ */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="apps" size={18} color={Palette.sageGreen} />
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
            Karty sprzętów domowych (Przewodnik)
          </Text>
        </View>

        {guidanceLoading && !guidanceData ? (
          <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
        ) : guidanceData ? (
          <View style={styles.guidanceList}>
            {guidanceData.devices.map((device, idx) => (
              <Card key={idx} bordered style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceLeft}>
                    <View style={[styles.deviceIconBox, { backgroundColor: isDark ? '#2B3037' : '#EBF9E6' }]}>
                      <Ionicons
                        name={getDeviceIcon(device.device)}
                        size={20}
                        color={Palette.radioactiveGrass}
                      />
                    </View>
                    <View>
                      <Text style={[styles.deviceName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {device.device}
                      </Text>
                      <Text style={[styles.deviceKwh, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        {device.energy_per_cycle_kwh} kWh / cykl
                      </Text>
                    </View>
                  </View>
                  <StatusBadge variant="green" label={`+${device.annual_savings_potential_eur} €/rok`} />
                </View>

                {/* Best Hours Tag */}
                <View style={styles.hoursTagRow}>
                  <Ionicons name="time-outline" size={15} color={Palette.radioactiveGrass} />
                  <Text style={[styles.hoursTagText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    Najlepsze pory: {device.best_hours}
                  </Text>
                </View>

                <Text style={[styles.deviceTarget, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                  Dla kogo: {device.target_group}
                </Text>

                <Text style={[styles.deviceTip, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  💡 {device.tip_pl}
                </Text>

                <Pressable
                  onPress={() => handleSelectGuidanceDevice(device)}
                  style={styles.calcActionRow}>
                  <Ionicons name="calculator-outline" size={14} color={Palette.radioactiveGrass} />
                  <Text style={[styles.calcActionText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    Przelicz w kalkulatorze powyżej ➔
                  </Text>
                </Pressable>
              </Card>
            ))}
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
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
            Zrealizowane cykle elastyczne (Historia)
          </Text>
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
                color: isDark ? '#FFFFFF' : '#1C2024',
                backgroundColor: isDark ? '#22252A' : '#FFFFFF',
              },
            ]}
          />
          {eventDeviceFilter ? (
            <Pressable onPress={() => setEventDeviceFilter('')} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle" size={18} color={Palette.slateGrey} />
            </Pressable>
          ) : null}
        </View>

        {eventsData ? (
          <View style={styles.eventsList}>
            <Text style={[styles.eventsCountText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Liczba odnotowanych cykli:{' '}
              <Text style={{ fontWeight: '800', color: isDark ? Palette.chartreuse : Palette.sageGreen }}>
                {eventsData.pagination?.total_items ?? eventsData.items?.length}
              </Text>
            </Text>

            {eventsData.items.map((evt, index) => (
              <Card key={index} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleGroup}>
                    <Ionicons name="calendar-outline" size={16} color={Palette.radioactiveGrass} />
                    <Text style={[styles.eventDeviceName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      {evt.device}
                    </Text>
                  </View>
                  <StatusBadge variant="green" label={`${evt.start_hour}:00`} />
                </View>

                <View style={styles.eventFooter}>
                  <Text style={[styles.eventSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Dzień: {evt.day} • Czas trwania: {evt.duration_h}h
                  </Text>
                  <Text style={[styles.eventEnergy, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                    Zużycie: {evt.energy_kwh} kWh
                  </Text>
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
  calcCard: {
    gap: 14,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  devicePillText: {
    fontSize: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  hourCol: {
    flex: 1,
    gap: 4,
  },
  hourColLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
  origHourText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EF4444',
  },
  targetHourText: {
    fontSize: 16,
    fontWeight: '900',
  },
  arrowBox: {
    paddingHorizontal: 8,
  },
  resultBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  resultMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultCycleVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  resultYearVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  resultCostSub: {
    fontSize: 10,
  },
  resultRecText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
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
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '800',
  },
  deviceKwh: {
    fontSize: 11,
    marginTop: 1,
  },
  hoursTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hoursTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deviceTarget: {
    fontSize: 11,
    fontWeight: '600',
  },
  deviceTip: {
    fontSize: 11,
    lineHeight: 15,
  },
  calcActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  calcActionText: {
    fontSize: 11,
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
    paddingVertical: 8,
    fontSize: 12,
  },
  clearFilterBtn: {
    position: 'absolute',
    right: 12,
  },
  eventsList: {
    gap: 8,
  },
  eventsCountText: {
    fontSize: 12,
    paddingVertical: 2,
  },
  eventCard: {
    gap: 4,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDeviceName: {
    fontSize: 13,
    fontWeight: '700',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  eventSub: {
    fontSize: 11,
  },
  eventEnergy: {
    fontSize: 11,
    fontWeight: '700',
  },
});