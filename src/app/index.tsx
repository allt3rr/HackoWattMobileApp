import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
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
    if (zone === 'green') return isDark ? '#CBFF4D' : '#84DD63'; // Palette.chartreuse : Palette.radioactiveGrass
    if (zone === 'yellow') return '#EAB308';
    return '#EF4444';
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F6ED] dark:bg-[#1A1C1E]"
      edges={['top']}>
      <ScrollView
        contentContainerClassName="px-4 pt-2 self-center w-full gap-3.5"
        contentContainerStyle={{
          paddingBottom: BottomTabInset + Spacing.six,
          maxWidth: MaxContentWidth,
        }}
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
          <View className="items-center justify-center min-h-[280px] gap-3">
            <ActivityIndicator size="large" color={Palette.radioactiveGrass} />
            <AppText className="text-sm text-[#69747C] dark:text-[#9AA4AF]">
              Ładowanie danych z serwera backendu...
            </AppText>
          </View>
        ) : summary ? (
          <>
            {/* Location Hero Header matching Web App */}
            {summary?.scenario ? (
              <View className="py-1.5 gap-1">
                <AppText className="text-[11px] font-extrabold tracking-[1.2px] uppercase text-[#69747C] dark:text-[#9AA4AF]">
                  LOKALIZACJA · {summary.scenario.city?.toUpperCase()}
                </AppText>
                <AppText className="text-[26px] font-black tracking-[-0.8px] leading-[30px] text-[#545454] dark:text-[#EDEDED]">
                  Energia w domu <AppText className="text-[#545454] bg-[#CBFF4D] px-1 rounded">{summary.scenario.city_short || summary.scenario.city?.split(',')[0]}</AppText>
                </AppText>
                <AppText className="text-[13px] leading-[18px] mt-0.5 text-[#69747C] dark:text-[#9AA4AF]">
                  Symulacja zużycia na realnej pogodzie i prognoza XGBoost
                </AppText>
              </View>
            ) : null}

            {/* Simulation Range Control (.range-options matching web) */}
            <View className="flex-row items-center justify-between flex-wrap gap-2.5 p-2.5 rounded-2xl border bg-white border-[#545454]/20 dark:bg-[#24272A] dark:border-white/10">
              <AppText className="text-xs font-extrabold text-[#545454] dark:text-[#EDEDED]">
                Symulacja · ostatnie
              </AppText>
              <View className="flex-row items-center gap-[3px] p-[3px] rounded-lg border bg-white border-[#545454]/20 dark:bg-[#1A1C1E] dark:border-white/10">
                {[1, 3, 5, 7, 14, 31].map((d) => {
                  const isSelected = selectedDays === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setSelectedDays(d)}
                      className={`px-2 py-1 rounded-md ${isSelected ? 'bg-[#CBFF4D]' : ''}`}>
                      <AppText
                        className={`text-xs ${
                          isSelected
                            ? 'text-[#545454] font-extrabold'
                            : 'text-[#545454] dark:text-[#9AA4AF] font-semibold'
                        }`}>
                        {d}d
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Simulation KPI Summary Card matching web app */}
            <Card bordered className="p-4">
              <View className="flex-row justify-between items-center gap-3">
                <View className="flex-1 gap-[3px]">
                  <AppText className="text-[11px] font-bold uppercase tracking-wide text-[#69747C] dark:text-[#9AA4AF]">
                    Symulacja · {selectedDays * 24} h
                  </AppText>
                  <AppText className="text-[26px] font-black tracking-[-0.8px] text-[#545454] dark:text-[#EDEDED]">
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
                    <AppText className="text-[13px] font-semibold text-[#69747C] dark:text-[#9AA4AF]">
                      kWh
                    </AppText>
                  </AppText>
                  <AppText className="text-[10px] mt-0.5 text-[#69747C] dark:text-[#9AA4AF]">
                    2026-09-22 – 2026-09-29
                  </AppText>
                </View>

                <View className="flex-1 gap-[3px] items-end border-l border-[#545454]/15 pl-3">
                  <AppText className="text-[11px] font-bold uppercase tracking-wide text-[#69747C] dark:text-[#9AA4AF]">
                    Prognoza · 24 h
                  </AppText>
                  <AppText className="text-[26px] font-black tracking-[-0.8px] text-[#545454] dark:text-[#CBFF4D]">
                    {safeToFixed(summary.forecast_next_24h_kwh, 1)}{' '}
                    <AppText className="text-[13px] font-semibold text-[#69747C] dark:text-[#9AA4AF]">
                      kWh
                    </AppText>
                  </AppText>
                  <AppText className="text-[10px] mt-0.5 text-[#69747C] dark:text-[#9AA4AF]">
                    Oczekiwane zużycie
                  </AppText>
                </View>
              </View>
            </Card>

            {/* Main Rate Hero Card */}
            <Card highlightZone={currentZone} className="gap-3.5">
              <View className="flex-row justify-between items-center flex-wrap gap-2">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <StatusBadge
                    zone={currentZone}
                    label={tariff?.period_label || 'Strefa dzienna'}
                    size="medium"
                  />
                  <AppText className="text-xs font-bold text-[#545454] dark:text-[#CBD5E1]">
                    Godzina: {tariff?.current_hour ?? 12}:00
                  </AppText>
                </View>
                <Pressable
                  onPress={() => router.push('/schedule')}
                  accessibilityRole="button"
                  className="py-1.5 px-2 min-h-[44px] justify-center">
                  <AppText className="text-[13px] font-extrabold text-[#1F5A17] dark:text-[#CBFF4D]">
                    Harmonogram 24h →
                  </AppText>
                </Pressable>
              </View>

              <View className="flex-row justify-between items-end flex-wrap gap-3">
                <View className="flex-1 min-w-[140px]">
                  <AppText className="text-[11px] font-bold tracking-wide text-[#69747C] dark:text-[#9AA4AF]">
                    BIEŻĄCA STAWKA ENERGII
                  </AppText>
                  <View className="flex-row items-baseline gap-1.5 mt-1 flex-wrap">
                    <AppText
                      className="text-[40px] font-black tracking-tighter leading-[44px]"
                      style={{ color: getPriceColor(currentZone) }}>
                      {safeToFixed(currentPrice, 3)}
                    </AppText>
                    <AppText className="text-sm font-bold text-[#545454] dark:text-[#CBD5E1]">
                      € / kWh
                    </AppText>
                  </View>
                </View>

                {/* Instant Power Reading */}
                {lastReading ? (
                  <View className="border rounded-2xl py-2 px-3 items-start gap-0.5 min-w-[120px] bg-[#F7F6ED] border-[#545454]/20 dark:bg-[#1C1F24] dark:border-[#373C44]">
                    <AppText className="text-[10px] font-semibold text-[#69747C] dark:text-[#9AA4AF]">
                      Pobór chwilowy
                    </AppText>
                    <AppText className="text-lg font-black text-[#1F5A17] dark:text-[#CBFF4D]">
                      {safeToFixed(lastReading.total_kwh, 2)} kWh
                    </AppText>
                    {lastReading.temperature_c != null ? (
                      <AppText className="text-[11px] font-bold text-[#84DD63] dark:text-[#CBFF4D]">
                        Temp: {safeToFixed(lastReading.temperature_c, 1)} °C
                      </AppText>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <View className="flex-row items-center gap-2 p-2.5 rounded-xl border bg-[#EBF9E6] border-[#84DD63] dark:bg-[#6BAA75]/12 dark:border-[#545454]">
                <Ionicons name="sparkles" size={18} color={Palette.radioactiveGrass} />
                <AppText className="text-[13px] font-semibold flex-1 leading-[18px] text-[#1F5A17] dark:text-[#E2E8F0]">
                  {tariff?.period_advice || 'Uruchamiaj elastyczne urządzenia w optymalnych oknach cenowych!'}
                </AppText>
              </View>
            </Card>

            {/* Nearest Peak Alert Banner */}
            {nextPeak ? (
              <Card bordered className="gap-2">
                <View className="flex-row justify-between items-center flex-wrap gap-2">
                  <View className="flex-row items-center gap-2 flex-1 min-w-[180px]">
                    <Ionicons name="warning-outline" size={20} color="#EAB308" />
                    <AppText className="text-sm font-extrabold text-[#545454] dark:text-white">
                      Najbliższy szczyt zapotrzebowania
                    </AppText>
                  </View>
                  <StatusBadge
                    variant="yellow"
                    label={`${nextPeak.timestamp ? nextPeak.timestamp.slice(11, 16) : ''} (~${safeToFixed(nextPeak.total_kwh, 2)} kWh)`}
                  />
                </View>
                <AppText className="text-[13px] leading-[18px] text-[#545454] dark:text-[#CBD5E1]">
                  {safeString(nextPeak.explanation, 'Wykryto szczyt obciążenia.')}
                </AppText>
                <View className="flex-row justify-end pt-1">
                  <Pressable onPress={() => router.push('/devices')} accessibilityRole="button" className="justify-center min-h-[44px]">
                    <AppText className="text-[13px] font-extrabold text-[#1F5A17] dark:text-[#CBFF4D]">
                      Przesuń AGD na południe ➔
                    </AppText>
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* Dominant Category & 24h Metrics */}
            <View className="mt-1">
              <AppText className="text-base font-black tracking-[-0.3px] text-[#545454] dark:text-white">
                Podsumowanie bilansu 24h
              </AppText>
            </View>

            <View className="flex-row flex-wrap gap-2">
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
              <Card className="gap-3 mt-64">
                <View className="flex-row justify-between items-center flex-wrap gap-2">
                  <View className="flex-row items-center gap-2.5 flex-1 min-w-[180px]">
                    <View className="w-9 h-9 rounded-full bg-red-100 justify-center items-center">
                      <Ionicons name="flame" size={18} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                      <AppText className="text-[10px] font-bold tracking-wide text-[#69747C] dark:text-[#9AA4AF]">
                        DOMINUJĄCA KATEGORIA ZUŻYCIA
                      </AppText>
                      <AppText className="text-[15px] font-extrabold mt-0.5 text-[#545454] dark:text-white">
                        {dominant.label}
                      </AppText>
                    </View>
                  </View>
                  <View className="bg-red-100 px-2.5 py-1.5 rounded-xl">
                    <AppText className="text-red-500 text-xs font-black">
                      {safeToFixed(dominant.kwh, 2)} kWh
                    </AppText>
                  </View>
                </View>

                <View className="flex-row justify-between items-center flex-wrap gap-2 pt-1">
                  <AppText className="text-[11px] text-[#69747C] dark:text-[#9AA4AF]">
                    Klucz: {dominant.label}
                  </AppText>
                  <Pressable onPress={() => router.push('/analytics')} accessibilityRole="button" className="justify-center min-h-[44px]">
                    <AppText className="text-[13px] font-extrabold text-[#1F5A17] dark:text-[#CBFF4D]">
                      Pełna analityka 6 kategorii →
                    </AppText>
                  </Pressable>
                </View>
              </Card>
            ) : null}

            {/* Quick Navigation Cards - Styled with NativeWind */}
            <View className="w-full mb-3 mt-4">
              <View className="flex-row items-center justify-between mb-3 px-0.5">
                <View className="flex-row items-center gap-2">
                  <View className="w-1.5 h-4 rounded-full bg-[#84DD63] dark:bg-[#CBFF4D]" />
                  <AppText className="text-base font-extrabold text-[#545454] dark:text-white">
                    Szybkie moduły
                  </AppText>
                </View>
                <View className="px-2.5 py-0.5 rounded-full bg-[#84DD63]/15 border border-[#84DD63]/30 dark:bg-[#CBFF4D]/20 dark:border-[#CBFF4D]/30">
                  <AppText className="text-[10px] font-bold text-[#1F5A17] tracking-wider uppercase dark:text-[#CBFF4D]">
                    Skróty
                  </AppText>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2.5 w-full">
                {/* Harmonogram 24h */}
                <Pressable
                  onPress={() => router.push('/schedule')}
                  accessibilityRole="button"
                  accessibilityLabel="Przejdź do Harmonogram 24h"
                  className="flex-1 min-w-[47%] p-3.5 rounded-2xl border bg-white border-slate-200/80 shadow-sm dark:bg-[#24272A] dark:border-white/10 active:opacity-75 active:scale-[0.98]">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-[#84DD63]/15 dark:bg-[#2B3037]">
                      <Ionicons name="time" size={20} color={Palette.radioactiveGrass} />
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                  <AppText className="text-sm font-extrabold text-[#545454] dark:text-white">
                    Harmonogram 24h
                  </AppText>
                  <AppText className="text-xs text-[#69747C] dark:text-[#9AA4AF] leading-4 mt-0.5">
                    Strefy zielona/żółta/czerwona i porady dla pokoleń.
                  </AppText>
                </Pressable>

                {/* Kalkulator AGD */}
                <Pressable
                  onPress={() => router.push('/devices')}
                  accessibilityRole="button"
                  accessibilityLabel="Przejdź do Kalkulator AGD"
                  className="flex-1 min-w-[47%] p-3.5 rounded-2xl border bg-white border-slate-200/80 shadow-sm dark:bg-[#24272A] dark:border-white/10 active:opacity-75 active:scale-[0.98]">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-[#6BAA75]/15 dark:bg-[#2B3037]">
                      <Ionicons name="calculator" size={20} color={Palette.sageGreen} />
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                  <AppText className="text-sm font-extrabold text-[#545454] dark:text-white">
                    Kalkulator AGD
                  </AppText>
                  <AppText className="text-xs text-[#69747C] dark:text-[#9AA4AF] leading-4 mt-0.5">
                    Przelicz zysk z przesunięcia pralki na 12:00.
                  </AppText>
                </Pressable>

                {/* Fotowoltaika & Bateria */}
                <Pressable
                  onPress={() => router.push('/solar')}
                  accessibilityRole="button"
                  accessibilityLabel="Przejdź do Fotowoltaika & Bateria"
                  className="flex-1 min-w-[47%] p-3.5 rounded-2xl border bg-white border-slate-200/80 shadow-sm dark:bg-[#24272A] dark:border-white/10 active:opacity-75 active:scale-[0.98]">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-yellow-100 dark:bg-[#2B3037]">
                      <Ionicons name="sunny" size={20} color="#EAB308" />
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                  <AppText className="text-sm font-extrabold text-[#545454] dark:text-white">
                    Fotowoltaika & Bateria
                  </AppText>
                  <AppText className="text-xs text-[#69747C] dark:text-[#9AA4AF] leading-4 mt-0.5">
                    Symulacja wariantu A vs B i autokonsumpcja.
                  </AppText>
                </Pressable>

                {/* Prognoza & Metryki */}
                <Pressable
                  onPress={() => router.push('/analytics')}
                  accessibilityRole="button"
                  accessibilityLabel="Przejdź do Prognoza & Metryki"
                  className="flex-1 min-w-[47%] p-3.5 rounded-2xl border bg-white border-slate-200/80 shadow-sm dark:bg-[#24272A] dark:border-white/10 active:opacity-75 active:scale-[0.98]">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl items-center justify-center bg-slate-100 dark:bg-[#2B3037]">
                      <Ionicons name="stats-chart" size={20} color={isDark ? '#CBFF4D' : Palette.charcoal} />
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                  <AppText className="text-sm font-extrabold text-[#545454] dark:text-white">
                    Prognoza & Metryki
                  </AppText>
                  <AppText className="text-xs text-[#69747C] dark:text-[#9AA4AF] leading-4 mt-0.5">
                    Dokładność modelu MAE i prognozy do 168h.
                  </AppText>
                </Pressable>
              </View>
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