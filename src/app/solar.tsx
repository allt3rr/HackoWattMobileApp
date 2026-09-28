import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
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
        {/* Header with EkoDzik Mobile Logo & Accessibility Bar */}
        <AppHeader
          title="EkoDzik Mobile"
          subtitle="Fotowoltaika, Magazyn & Oszczędności"
          sourceUrl={sourceUrl}
          onRefresh={handleRefresh}
        />

        {/* ============================================================ */}
        {/* PV & STORAGE SIMULATOR */}
        {/* ============================================================ */}
        <Card highlightZone="green" style={styles.simCard}>
          <View style={styles.simHeader}>
            <View style={styles.simTitleGroup}>
              <Ionicons name="sunny" size={24} color="#EAB308" />
              <View style={{ flex: 1 }}>
                <AppText style={[styles.simTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Symulator Instalacji PV ({selectedKwp} kWp)
                </AppText>
                <AppText style={[styles.simSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                  Porównaj Wariant A (Baza) vs Wariant B (Elastyczność)
                </AppText>
              </View>
            </View>
            <StatusBadge variant="green" label="Wariant A vs B" />
          </View>

          {/* Stepper for kWp (Senior-Friendly 44px buttons) */}
          <View style={styles.stepperWrap}>
            <AppText style={[styles.stepperLabel, { color: isDark ? '#E2E8F0' : '#1C2024' }]}>
              Wybierz moc instalacji fotowoltaicznej:
            </AppText>
            <View style={[styles.stepperBox, { borderColor: isDark ? '#373C44' : '#CBD5E1', backgroundColor: isDark ? '#1C1F24' : '#F8FAFC' }]}>
              <Pressable
                onPress={() => setSelectedKwp((k) => Math.max(2, k - 1))}
                accessibilityRole="button"
                accessibilityLabel="Zmniejsz moc instalacji"
                style={styles.stepBtn}>
                <AppText style={[styles.stepBtnText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>-</AppText>
              </Pressable>
              <AppText style={[styles.stepValText, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                {selectedKwp} kWp
              </AppText>
              <Pressable
                onPress={() => setSelectedKwp((k) => Math.min(10, k + 1))}
                accessibilityRole="button"
                accessibilityLabel="Zwiększ moc instalacji"
                style={styles.stepBtn}>
                <AppText style={[styles.stepBtnText, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>+</AppText>
              </Pressable>
            </View>
          </View>

          {isSimulating ? (
            <ActivityIndicator size="small" color={Palette.radioactiveGrass} style={{ marginVertical: 16 }} />
          ) : simError ? (
            <AppText style={{ color: '#EF4444', fontSize: 13 }}>{simError.message}</AppText>
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

              {/* Variant Cards Comparison - Stacked Responsively for Phones */}
              <View style={styles.variantsRow}>
                {/* Variant A */}
                <Card bordered style={styles.variantCard}>
                  <View style={styles.variantHeader}>
                    <AppText style={[styles.variantName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      {simResult.variant_a.name}
                    </AppText>
                    <StatusBadge variant="yellow" label="Wariant A" />
                  </View>

                  <View style={styles.variantStats}>
                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Autokonsumpcja:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen, fontWeight: '800' }]}>
                        {safeToFixed(simResult.variant_a.coverage_percent, 0)}%
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Użyte ze słońca:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_a.self_consumption_kwh, 0)} kWh
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Eksport do sieci:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_a.exported_kwh, 0)} kWh
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Oszczędność roczna:
                      </AppText>
                      <AppText style={[styles.statVal, { color: Palette.radioactiveGrass, fontWeight: '800' }]}>
                        +{safeToFixed(simResult.variant_a.savings_eur, 0)} €
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Czas zwrotu:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {formatPaybackYears(simResult.variant_a.payback_years)}
                      </AppText>
                    </View>
                  </View>
                </Card>

                {/* Variant B */}
                <Card bordered style={[styles.variantCard, styles.variantBHighlight]}>
                  <View style={styles.variantHeader}>
                    <AppText style={[styles.variantName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                      {simResult.variant_b.name}
                    </AppText>
                    <StatusBadge variant="green" label="Rekomendowany" />
                  </View>

                  <View style={styles.variantStats}>
                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Autokonsumpcja:
                      </AppText>
                      <AppText style={[styles.statVal, { color: Palette.radioactiveGrass, fontWeight: '900' }]}>
                        {safeToFixed(simResult.variant_b.coverage_percent, 0)}%
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Użyte ze słońca:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_b.self_consumption_kwh, 0)} kWh
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Eksport do sieci:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {safeToFixed(simResult.variant_b.exported_kwh, 0)} kWh
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Oszczędność roczna:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? Palette.chartreuse : Palette.sageGreen, fontWeight: '900' }]}>
                        +{safeToFixed(simResult.variant_b.savings_eur, 0)} €
                      </AppText>
                    </View>

                    <View style={styles.statRow}>
                      <AppText style={[styles.statLabel, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Czas zwrotu:
                      </AppText>
                      <AppText style={[styles.statVal, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {formatPaybackYears(simResult.variant_b.payback_years)}
                      </AppText>
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
                <Ionicons name="sparkles" size={20} color={Palette.radioactiveGrass} />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText style={[styles.gainTitle, { color: isDark ? Palette.chartreuse : '#1F5A17' }]}>
                    Zysk z optymalizacji harmonogramu:
                  </AppText>
                  <AppText style={[styles.gainSubtitle, { color: isDark ? '#E2E8F0' : '#2A5A20' }]}>
                    +{safeToFixed(simResult.optimization_gain.additional_self_kwh, 1)} kWh autokonsumpcji • +{safeToFixed(simResult.optimization_gain.additional_savings_eur, 2)} € dodatkowych oszczędności/rok
                  </AppText>
                </View>
              </View>

              {/* Shifting recommendations for PV */}
              {simResult.device_recommendations && simResult.device_recommendations.length > 0 ? (
                <View style={styles.recSection}>
                  <AppText style={[styles.recTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                    Rekomendacje przesunięć pod profil PV:
                  </AppText>
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
                        <Ionicons name="checkmark-circle" size={18} color={Palette.radioactiveGrass} />
                        <AppText style={[styles.recDeviceName, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                          {d.device}
                        </AppText>
                      </View>
                      <AppText style={[styles.recDeviceSub, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        Przesunięto: {safeToFixed(d.moved_kwh, 1)} kWh • Zaoszczędzono z sieci: {safeToFixed(d.grid_saved_kwh, 1)} kWh
                      </AppText>
                      <AppText style={[styles.recMoneySaved, { color: isDark ? Palette.chartreuse : Palette.sageGreen }]}>
                        +{safeToFixed(d.money_saved_eur, 2)} €/rok
                      </AppText>
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
          <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
            Tabela porównawcza mocy PV (2 – 10 kWp)
          </AppText>
        </View>

        {variantsLoading && !variantsData ? (
          <ActivityIndicator size="small" color={Palette.radioactiveGrass} />
        ) : variantsData ? (
          <Card style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.tableInner}>
                <View style={[styles.tableHeader, { borderBottomColor: isDark ? '#373C44' : '#CBD5E1' }]}>
                  <AppText style={[styles.th, { width: 90, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Moc PV
                  </AppText>
                  <AppText style={[styles.th, { width: 110, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Produkcja
                  </AppText>
                  <AppText style={[styles.th, { width: 110, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Pokrycie A/B
                  </AppText>
                  <AppText style={[styles.th, { width: 130, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Zysk (Wariant B)
                  </AppText>
                  <AppText style={[styles.th, { width: 90, color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    Zwrot
                  </AppText>
                </View>

                {variantsData.variants.map((v) => (
                  <View
                    key={v.kwp}
                    style={[
                      styles.tableRow,
                      { borderBottomColor: isDark ? '#2E333A' : '#F1F5F9' },
                    ]}>
                    <View style={{ width: 90 }}>
                      <AppText style={[styles.tdBold, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                        {v.kwp} kWp
                      </AppText>
                    </View>

                    <View style={{ width: 110 }}>
                      <AppText style={[styles.tdText, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                        {safeToFixed(v.annual_production_kwh, 0)} kWh
                      </AppText>
                    </View>

                    <View style={{ width: 110 }}>
                      <AppText style={[styles.tdText, { color: isDark ? Palette.chartreuse : Palette.sageGreen, fontWeight: '700' }]}>
                        {safeToFixed(v.coverage_a_percent, 0)}% / {safeToFixed(v.coverage_b_percent, 0)}%
                      </AppText>
                    </View>

                    <View style={{ width: 130 }}>
                      <AppText style={[styles.tdBold, { color: Palette.radioactiveGrass }]}>
                        +{safeToFixed(v.savings_b_eur, 0)} €/rok
                      </AppText>
                    </View>

                    <View style={{ width: 90 }}>
                      <AppText style={[styles.tdText, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                        {formatPaybackYears(v.payback_b_years)}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Card>
        ) : (
          <ErrorStateCard
            error={variantsError || { message: 'Błąd pobierania wariantów PV.' }}
            sourceUrl={sourceUrl}
            onRetry={handleRefresh}
            isRetrying={variantsRefreshing}
            title="Brak wariantów PV"
          />
        )}

        {/* ============================================================ */}
        {/* SECTION 3: SYSTEM ASSUMPTIONS */}
        {/* ============================================================ */}
        {assumptionsData ? (
          <>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="information-circle" size={18} color={Palette.slateGrey} />
              <AppText style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                Założenia modelowe systemu
              </AppText>
            </View>

            <Card style={styles.assumpCard}>
              <View style={styles.assumpHeader}>
                <AppText style={[styles.assumpLocation, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  📍 Lokalizacja: {assumptionsData.location}
                </AppText>
                <StatusBadge variant="neutral" label={`Okno PV: ${assumptionsData.pv_assumptions?.recommended_window || '10:00 – 15:00'}`} />
              </View>

              <View style={styles.profilesBox}>
                <AppText style={[styles.profilesHeader, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                  Parametry gospodarstwa domowego:
                </AppText>
                <View style={styles.profileRow}>
                  <View style={styles.profileLeft}>
                    <Ionicons name="home-outline" size={16} color={Palette.radioactiveGrass} />
                    <AppText style={[styles.profileName, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Profil mieszkańców
                    </AppText>
                  </View>
                  <AppText style={[styles.profileRight, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    {assumptionsData.household?.profile} ({assumptionsData.household?.residents_count} os.)
                  </AppText>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileLeft}>
                    <Ionicons name="flame-outline" size={16} color="#EF4444" />
                    <AppText style={[styles.profileName, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Ogrzewanie
                    </AppText>
                  </View>
                  <AppText style={[styles.profileRight, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    {assumptionsData.household?.heating_type}
                  </AppText>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileLeft}>
                    <Ionicons name="cash-outline" size={16} color="#EAB308" />
                    <AppText style={[styles.profileName, { color: isDark ? '#CBD5E1' : Palette.charcoal }]}>
                      Koszt instalacji PV
                    </AppText>
                  </View>
                  <AppText style={[styles.profileRight, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                    {assumptionsData.pv_assumptions?.installation_cost_per_kwp_eur} € / kWp
                  </AppText>
                </View>
              </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
  },
  simCard: {
    gap: 14,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  simTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 180,
  },
  simTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  simSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  stepperWrap: {
    gap: 6,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    maxWidth: 240,
  },
  stepBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '900',
  },
  stepValText: {
    fontSize: 15,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  variantsRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 6,
  },
  variantCard: {
    padding: 14,
    gap: 10,
  },
  variantBHighlight: {
    borderColor: Palette.radioactiveGrass,
    borderWidth: 1.5,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  variantName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    minWidth: 140,
  },
  variantStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
  },
  statVal: {
    fontSize: 13,
  },
  gainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  gainTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  gainSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  recSection: {
    marginTop: 8,
    gap: 8,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  recCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recDeviceName: {
    fontSize: 13,
    fontWeight: '800',
  },
  recDeviceSub: {
    fontSize: 12,
  },
  recMoneySaved: {
    fontSize: 13,
    fontWeight: '900',
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
  tableCard: {
    padding: 10,
  },
  tableInner: {
    minWidth: 540,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 12,
    fontWeight: '800',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tdBold: {
    fontSize: 13,
    fontWeight: '800',
  },
  tdText: {
    fontSize: 13,
  },
  assumpCard: {
    padding: 14,
    gap: 12,
  },
  assumpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  assumpLocation: {
    fontSize: 14,
    fontWeight: '800',
  },
  profilesBox: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  profilesHeader: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 3,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '700',
  },
  profileRight: {
    fontSize: 12,
  },
});
