/**
 * HackoWatt Typed API Endpoints Service
 * Strongly typed bindings for all 12 live API routes.
 * Directly communicates with the backend server endpoints via Bearer token.
 */

import {
    ApiResponse,
    ConsumptionForecastResponse,
    ConsumptionHistoryParams,
    ConsumptionHistoryResponse,
    DashboardSummaryResponse,
    DeviceGuidanceResponse,
    DeviceShiftRequest,
    DeviceShiftResponse,
    FlexibleEventsParams,
    FlexibleEventsResponse,
    ForecastHorizon,
    PvSimulationParams,
    PvSimulationResponse,
    PvVariantsResponse,
    ScenarioMetadata,
    ScenariosListResponse,
    SmartScheduleTodayResponse,
    SystemAssumptionsResponse,
    SystemMetricsResponse,
    TariffInfoResponse,
} from '@/types/api';
import { apiClient } from './client';

export const hackoWattApi = {
  /**
   * 1. GET /api/v1/smart-schedule/today/
   * Główny harmonogram dnia: 24 godziny z osiami czasu, poradami pokoleniowymi i oknami efektywności.
   */
  getSmartScheduleToday: (): Promise<ApiResponse<SmartScheduleTodayResponse>> => {
    return apiClient.get<SmartScheduleTodayResponse>('/api/v1/smart-schedule/today/');
  },

  /**
   * 2. GET /api/v1/devices/guidance/
   * Przewodnik po urządzeniach: Zmywarka, Pralka, Suszarka, Piekarnik, Elektronika.
   */
  getDeviceGuidance: (): Promise<ApiResponse<DeviceGuidanceResponse>> => {
    return apiClient.get<DeviceGuidanceResponse>('/api/v1/devices/guidance/');
  },

  /**
   * 3. GET /api/v1/dashboard/summary/
   * Ekran główny aplikacji mobilnej: bieżąca stawka i ocena, ostatni odczyt, dominant kategorii, sumy 24h, najbliższy szczyt.
   */
  getDashboardSummary: (): Promise<ApiResponse<DashboardSummaryResponse>> => {
    return apiClient.get<DashboardSummaryResponse>('/api/v1/dashboard/summary/');
  },

  /**
   * 4. GET /api/v1/devices/shift-simulation/
   * Kalkulator przesunięcia pracy urządzenia (szybki GET z parametrami query).
   */
  simulateDeviceShift: (params: DeviceShiftRequest): Promise<ApiResponse<DeviceShiftResponse>> => {
    return apiClient.get<DeviceShiftResponse>('/api/v1/devices/shift-simulation/', {
      device: params.device,
      original_hour: params.original_hour,
      target_hour: params.target_hour,
      cycles_per_week: params.cycles_per_week,
    });
  },

  /**
   * 5. GET /api/v1/tariffs/
   * Pełna informacja o strefach taryfowych (€/kWh), dolinie nocnej i szczycie popołudniowym.
   */
  getTariffs: (): Promise<ApiResponse<TariffInfoResponse>> => {
    return apiClient.get<TariffInfoResponse>('/api/v1/tariffs/');
  },

  /**
   * 6. GET /api/v1/consumption/history/
   * Historia zużycia z podziałem na kategorie, paginacją i filtrem dat.
   */
  getConsumptionHistory: (
    params?: ConsumptionHistoryParams
  ): Promise<ApiResponse<ConsumptionHistoryResponse>> => {
    return apiClient.get<ConsumptionHistoryResponse>('/api/v1/consumption/history/', {
      page: params?.page,
      page_size: params?.page_size,
      start: params?.start,
      end: params?.end,
      category: params?.category,
    });
  },

  /**
   * 7. GET /api/v1/consumption/forecast/
   * Prognoza zapotrzebowania na horyzont 24, 72 lub 168 godzin z wyjaśnieniem szczytów.
   */
  getConsumptionForecast: (
    horizon: ForecastHorizon = 24
  ): Promise<ApiResponse<ConsumptionForecastResponse>> => {
    return apiClient.get<ConsumptionForecastResponse>('/api/v1/consumption/forecast/', {
      horizon,
    });
  },

  /**
   * 8. GET /api/v1/pv/simulate/
   * Symulator instalacji PV i autokonsumpcji (szybki GET z parametrami query).
   */
  simulatePv: (params?: PvSimulationParams): Promise<ApiResponse<PvSimulationResponse>> => {
    return apiClient.get<PvSimulationResponse>(
      '/api/v1/pv/simulate/',
      params
        ? {
            kwp: params.kwp ?? params.variantA_pvKwp,
            month: params.month,
            magazyn_kwh: params.magazyn_kwh ?? params.variantA_batteryKwh,
            magazyn_moc_kw: params.magazyn_moc_kw,
            magazyn_koszt_eur: params.magazyn_koszt_eur,
            include_week_profile: params.include_week_profile,
          }
        : undefined
    );
  },

  /**
   * 9. GET /api/v1/pv/variants/
   * Tabela porównawcza mocy instalacji PV (2–10 kWp).
   */
  getPvVariants: (): Promise<ApiResponse<PvVariantsResponse>> => {
    return apiClient.get<PvVariantsResponse>('/api/v1/pv/variants/');
  },

  /**
   * 10. GET /api/v1/devices/flexible-events/
   * Paginowana lista cykli pracy elastycznych urządzeń (filtr po device).
   */
  getFlexibleEvents: (
    params?: FlexibleEventsParams
  ): Promise<ApiResponse<FlexibleEventsResponse>> => {
    return apiClient.get<FlexibleEventsResponse>('/api/v1/devices/flexible-events/', {
      page: params?.page,
      page_size: params?.page_size,
      device: params?.device,
      status: params?.status,
    });
  },

  /**
   * 11. GET /api/v1/system/assumptions/
   * Parametry urządzeń, domu oraz stawki kosztowe.
   */
  getSystemAssumptions: (): Promise<ApiResponse<SystemAssumptionsResponse>> => {
    return apiClient.get<SystemAssumptionsResponse>('/api/v1/system/assumptions/');
  },

  /**
   * 12. GET /api/v1/system/metrics/
   * Metryki dokładności modelu prognostycznego (MAE, MAPE).
   */
  getSystemMetrics: (): Promise<ApiResponse<SystemMetricsResponse>> => {
    return apiClient.get<SystemMetricsResponse>('/api/v1/system/metrics/');
  },

  /**
   * 13. GET /api/v1/scenarios/
   * Lista 5 scenariuszy symulacji z flagami krajów.
   */
  getScenarios: (): Promise<ApiResponse<ScenariosListResponse>> => {
    return apiClient.get<ScenariosListResponse>('/api/v1/scenarios/');
  },

  /**
   * 14. POST /api/v1/scenarios/active/
   * Zmienia aktywny scenariusz symulacji na serwerze.
   */
  switchScenario: (scenarioId: number): Promise<ApiResponse<ScenarioMetadata>> => {
    return apiClient.post<ScenarioMetadata>('/api/v1/scenarios/active/', { scenario_id: scenarioId });
  },
};
