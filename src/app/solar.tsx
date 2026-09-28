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
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Spacing,
} from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApi';
import { formatPaybackYears, safeToFixed } from '@/utils/formatters';

export default function SolarScreen() {
  const isDark = useColorScheme() === 'dark';

  // PV Simulation parameter: capacity in kWp (2 to 10 kWp)
  const [selectedKwp, setSelectedKwp] = useState(5.0);

  // 1. PV Simulation Query (GET /api/v1/pv/simulate/?kwp=...)
  const {
    data: simResult,
    isLoading: isSimulating,
    error: simError,
    refetch: refetchPvSimulation,
  } = useApiQuery(
    () => hackoWattApi.simulatePv({ kwp: selectedKwp }),
    selectedKwp
  );

  // 2. PV Variants Table Query (GET /api/v1/pv/variants/)
  const {
    data: variantsData,
    isLoading: variantsLoading,
    isRefreshing: variantsRefreshing,
    error: variantsError,
    sourceUrl,
    refetch: refetchVariants,
  } = useApiQuery(hackoWattApi.getPvVariants);

  // 3. System Assumptions Query (GET /api/v1/system/assumptions/)
  const {
    data: assumptionsData,
    refetch: refetchAssumptions,
  } = useApiQuery(hackoWattApi.getSystemAssumptions);

  const handleRefresh = async () => {
    await Promise.all([
      refetchPvSimulation(),
      refetchVariants(),
      refetchAssumptions(),
    ]);
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
            refreshing={variantsRefreshing}
            onRefresh={handleRefresh}
            tintColor={Palette.radioactiveGrass}
          />
        }>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.screenTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
              Fotowoltaika & Magazyn
            </Text>
            <Text style={[styles.screenSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              Symulator wariantów, autokonsumpcja i założenia systemowe
            </Text>
          </View>
          <ApiStatusIndicator sourceUrl={sourceUrl} onRefresh={handleRefresh} />
        </View>

        {/* ============================================================ */}
        {/* PV & STORAGE SIMULATOR */}
        {/* ============================================================ */}
        <Card highlightZone="green" style={styles.simCard}>
          <View style={styles.simHeader}>
            <View style={styles.simTitleGroup}>
              <Ionicons name="sunny" size={22} color="#EAB308" />
              <View>
                <Text style={[styles.simTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Symulator Instalacji PV ({selectedKwp} kWp)
                </Text>
                <Text style={[styles.simSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Porównaj Wariant A (Baza) vs Wariant B (Elastyczność)
                </Text>
              </View>
            </View>
            <StatusBadge variant="green" label="Wariant A vs B" />
          </View>

          {/* Stepper for kWp */}
          <View style={styles.stepperWrap}>
            <Text style={[styles.stepperLabel, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
              Wybierz moc instalacji fotowoltaicznej:
            </Text>
            <View style={[styles.stepperBox, { borderColor: isDark ? '#373C44' : '#CBD5E1', backgroundColor: isDark ? '#1C1F24' : '#F8FAFC' }]}>
              <Pressable
                onPress={() => setSelectedKwp((k) => Math.max(2, k - 1))}
                style={styles.stepBtn}>
                <Text style={[styles.stepBtnText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>-</Text>
              </Pressable>
              <Text style={[styles.stepValText, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                {selectedKwp} kWp
              </Text>
              <Pressable
                onPress={() => setSelectedKwp((k) => Math.min(10, k + 1))}
                style={styles.stepBtn}>
                <Text style={[styles.stepBtnText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>+</Text>
              </Pressable>
            </View>
          </View>

          {isSimulating ? (
            <ActivityIndicator size="small" color={Palette.radioactiveGrass} style={{ marginVertical: 16 }} />
          ) : simError ? (
            <Text style={{ color: '#EF4444', fontSize: 12 }}>{simError.message}</Text>
          ) : simResult ? (
            <>
              {/* Production & Consumption Overview */}
              <View style={styles.metricsRow}>
                <MetricTile
                  label="Roczna produkcja PV"
                  value={safeToFixed(simResult.annual_production_kwh, 0)}
                  unit="kWh"
                  accentColor="#EAB308"
                />
                <MetricTile
                  label="Roczne zużycie domu"
                  value={safeToFixed(simResult.annual_consumption_kwh, 0)}
                  unit="kWh"
                  accentColor={Palette.radioactiveGrass}
                />
              </View>

              {/* Variant Cards Comparison */}
              <View style={styles.variantsRow}>
                {/* Variant A */}
                <Card bordered style={styles.variantCard}>
                  <View style={styles.variantHeader}>
                    <Text style={[styles.variantName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      {simResult.variant_a.name}
                    </Text>
                    <StatusBadge variant="yellow" label="Wariant A" />
                  </View>

                  <View style={styles.variantStats}>
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Autokonsumpcja:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen, fontWeight: '800' }]}>
                        {safeToFixed(simResult.variant_a.coverage_percent, 0)}%
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Użyte ze słońca:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_a.self_consumption_kwh, 0)} kWh
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Eksport do sieci:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_a.exported_kwh, 0)} kWh
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Oszczędność roczna:
                      </Text>
                      <Text style={[styles.statVal, { color: Palette.radioactiveGrass, fontWeight: '800' }]}>
                        +{safeToFixed(simResult.variant_a.savings_eur, 0)} €
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Czas zwrotu:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {formatPaybackYears(simResult.variant_a.payback_years)}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Variant B */}
                <Card bordered style={[styles.variantCard, styles.variantBHighlight]}>
                  <View style={styles.variantHeader}>
                    <Text style={[styles.variantName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      {simResult.variant_b.name}
                    </Text>
                    <StatusBadge variant="green" label="Rekomendowany" />
                  </View>

                  <View style={styles.variantStats}>
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Autokonsumpcja:
                      </Text>
                      <Text style={[styles.statVal, { color: Palette.radioactiveGrass, fontWeight: '900' }]}>
                        {safeToFixed(simResult.variant_b.coverage_percent, 0)}%
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Użyte ze słońca:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_b.self_consumption_kwh, 0)} kWh
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Eksport do sieci:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_b.exported_kwh, 0)} kWh
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Oszczędność roczna:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen, fontWeight: '900' }]}>
                        +{safeToFixed(simResult.variant_b.savings_eur, 0)} €
                      </Text>
                    </View>

                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Czas zwrotu:
                      </Text>
                      <Text style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {formatPaybackYears(simResult.variant_b.payback_years)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>

              {/* Optimization Gain Banner */}
              <View
                style={[
                  styles.gainBanner,
                  {
                    backgroundColor: isDark ? 'rgba(132, 221, 99, 0.14)' : '#EBF9E6',
                    borderColor: Palette.radioactiveGrass,
                  },
                ]}>
                <Ionicons name="sparkles" size={18} color={Palette.radioactiveGrass} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.gainTitle, { color: isDark ? Palette.chartreuse : '#1F5A17' }]}>
                    Zysk z optymalizacji harmonogramu:
                  </Text>
                  <Text style={[styles.gainSubtitle, { color: isDark ? '#E2E8F0' : '#2A5A20' }]}>
                    +{safeToFixed(simResult.optimization_gain.additional_self_kwh, 1)} kWh autokonsumpcji • +{safeToFixed(simResult.optimization_gain.additional_savings_eur, 2)} € dodatkowych oszczędności/rok
                  </Text>
                </View>
              </View>

              {/* Device shift breakdown */}
              {simResult.device_recommendations && simResult.device_recommendations.length > 0 ? (
                <View style={styles.recSection}>
                  <Text style={[styles.recTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Rekomendowane urządzenia do przesunięcia w okno PV:
                  </Text>
                  {simResult.device_recommendations.map((d, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.recCard,
                        {
                          backgroundColor: isDark ? '#1C1F24' : '#F8FAFC',
                          borderColor: isDark ? '#373C44' : '#E2E8F0',
                        },
                      ]}>
                      <View style={styles.recHeader}>
                        <Ionicons name="checkmark-circle" size={16} color={Palette.radioactiveGrass} />
                        <Text style={[styles.recDeviceName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                          {d.device}
                        </Text>
                      </View>
                      <Text style={[styles.recDeviceSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Przesunięto: {safeToFixed(d.moved_kwh, 1)} kWh • Zaoszczędzono z sieci: {safeToFixed(d.grid_saved_kwh, 1)} kWh
                      </Text>
                      <Text style={[styles.recMoneySaved, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                        +{safeToFixed(d.money_saved_eur, 2)} €/rok
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </Card>

        {/* ============================================================ */}
        {/* PV VARIANTS COMPARISON TABLE */}
        {/* ============================================================ */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="grid" size={18} color={Palette.sageGreen} />
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
            Tabela porównawcza mocy PV (2 – 10 kWp)
          </Text>
        </View>

        {variantsLoading && !variantsData ? (
          <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
        ) : variantsData ? (
          <Card style={styles.tableCard}>
            <View style={[styles.tableHeader, { borderBottomColor: isDark ? '#373C44' : '#CBD5E1' }]}>
              <Text style={[styles.th, { flex: 1.1, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Moc PV
              </Text>
              <Text style={[styles.th, { flex: 1.4, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Produkcja
              </Text>
              <Text style={[styles.th, { flex: 1.4, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Pokrycie A/B
              </Text>
              <Text style={[styles.th, { flex: 1.4, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Zysk (Wariant B)
              </Text>
              <Text style={[styles.th, { flex: 1.1, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Zwrot
              </Text>
            </View>

            {variantsData.variants.map((v) => (
              <View
                key={v.kwp}
                style={[
                  styles.tableRow,
                  { borderBottomColor: isDark ? '#2E333A' : '#F1F5F9' },
                ]}>
                <View style={{ flex: 1.1 }}>
                  <Text style={[styles.tdBold, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    {v.kwp} kWp
                  </Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={[styles.tdText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                    {safeToFixed(v.annual_production_kwh, 0)} kWh
                  </Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={[styles.tdText, { color: Palette.radioactiveGrass, fontWeight: '700' }]}>
                    {safeToFixed(v.coverage_a_percent, 0)}% / {safeToFixed(v.coverage_b_percent, 0)}%
                  </Text>
                </View>

                <View style={{ flex: 1.4 }}>
                  <Text style={[styles.tdText, { color: isDark ? Palette.chartreuse : Palette.sageGreen, fontWeight: '700' }]}>
                    +{safeToFixed(v.savings_b_eur, 0)} €
                  </Text>
                </View>

                <View style={{ flex: 1.1 }}>
                  <Text style={[styles.tdText, { color: isDark ? '#FFFFFF' : '#1C2024', fontWeight: '700' }]}>
                    {formatPaybackYears(v.payback_b_years)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <ErrorStateCard
            error={variantsError || { message: 'Brak danych wariantów PV z serwera backendu.' }}
            sourceUrl={sourceUrl}
            onRetry={handleRefresh}
            isRetrying={variantsRefreshing}
            title="Błąd ładowania wariantów PV"
          />
        )}

        {/* ============================================================ */}
        {/* SYSTEM ASSUMPTIONS */}
        {/* ============================================================ */}
        {assumptionsData ? (
          <>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="settings-outline" size={18} color={Palette.charcoal} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                Założenia Systemowe & Parametry Domu
              </Text>
            </View>

            <Card style={styles.assumpCard}>
              <View style={styles.assumpHeader}>
                <Text style={[styles.assumpLocation, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Lokalizacja: {assumptionsData.location}
                </Text>
                <Text style={[styles.assumpWindow, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                  Okno PV: {assumptionsData.pv_assumptions?.recommended_window ?? '9:00 - 15:00'}
                </Text>
              </View>

              <View style={styles.metricsRow}>
                <MetricTile
                  label="Mieszkańcy"
                  value={assumptionsData.household?.residents_count ?? 6}
                  unit="os."
                  subtitle={assumptionsData.household?.profile}
                />
                <MetricTile
                  label="Ogrzewanie"
                  value={assumptionsData.household?.heating_type ?? 'Pompa ciepła'}
                  subtitle="Typ instalacji"
                />
                <MetricTile
                  label="Odkup energii"
                  value={safeToFixed(assumptionsData.pv_assumptions?.export_price_per_kwh_eur, 2)}
                  unit="€/kWh"
                  subtitle={`Koszt: ${safeToFixed(assumptionsData.pv_assumptions?.installation_cost_per_kwp_eur, 0)} €/kWp`}
                  accentColor={Palette.radioactiveGrass}
                />
              </View>

              {assumptionsData.device_profiles ? (
                <View style={styles.profilesBox}>
                  <Text style={[styles.profilesHeader, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Profile energetyczne urządzeń:
                  </Text>
                  {Object.entries(assumptionsData.device_profiles).map(([name, prof]) => (
                    <View key={name} style={styles.profileRow}>
                      <View style={styles.profileLeft}>
                        <Ionicons name="checkmark-done" size={16} color={Palette.radioactiveGrass} />
                        <Text style={[styles.profileName, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
                          {name}
                        </Text>
                      </View>
                      <Text style={[styles.profileRight, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        {prof.energy_range_kwh[0]}–{prof.energy_range_kwh[1]} kWh • {prof.duration_range_h[0]}–{prof.duration_range_h[1]}h
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Card>
          </>
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
  simCard: {
    gap: 14,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  simTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  simSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  stepperWrap: {
    gap: 6,
    marginVertical: 4,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'space-between',
    maxWidth: 240,
  },
  stepBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '800',
  },
  stepValText: {
    fontSize: 14,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  variantsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  variantCard: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  variantBHighlight: {
    borderColor: Palette.radioactiveGrass,
    borderWidth: 1.5,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantName: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  variantStats: {
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
  },
  statVal: {
    fontSize: 12,
  },
  gainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  gainTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  gainSubtitle: {
    fontSize: 11,
  },
  recSection: {
    marginTop: 8,
    gap: 6,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  recCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recDeviceName: {
    fontSize: 12,
    fontWeight: '800',
  },
  recDeviceSub: {
    fontSize: 11,
  },
  recMoneySaved: {
    fontSize: 12,
    fontWeight: '900',
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
  tableCard: {
    padding: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tdBold: {
    fontSize: 12,
    fontWeight: '800',
  },
  tdText: {
    fontSize: 12,
  },
  assumpCard: {
    padding: 14,
    gap: 12,
  },
  assumpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assumpLocation: {
    fontSize: 13,
    fontWeight: '800',
  },
  assumpWindow: {
    fontSize: 11,
    fontWeight: '700',
  },
  profilesBox: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  profilesHeader: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileRight: {
    fontSize: 11,
  },
});
