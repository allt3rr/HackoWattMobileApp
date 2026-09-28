/**
 * HackoWatt Energy Management API - Strong TypeScript Contracts
 * Fully typed against live Django REST endpoints.
 */

// ==========================================
// 1. Primitive Types & Basic Enums
// ==========================================

export type ScheduleZone = 'green' | 'yellow' | 'red';
export type RateRating = 'cheap' | 'moderate' | 'expensive';
export type ForecastHorizon = 24 | 72 | 168;

export interface ScenarioMetadata {
  id: number;
  name: string;
  title?: string;
  city: string;
  city_short?: string;
  country_code?: string;
  flag?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  household?: {
    residents_count?: number;
    profile?: string;
    heating_type?: string;
    [key: string]: unknown;
  };
  is_active?: boolean;
}

// ==========================================
// 2. Dashboard Summary (GET /api/v1/dashboard/summary/)
// ==========================================

export interface DashboardLastReading {
  timestamp: string;
  total_kwh: number;
  temperature_c: number | null;
  dominant_category: {
    key: string;
    label: string;
    kwh: number;
  };
  events: string;
}

export interface DashboardTariff {
  current_hour: number;
  price_eur: number;
  period_label: string;
  period_color: ScheduleZone;
  period_advice?: string;
  currency: string;
}

export interface DashboardNextPeak {
  timestamp: string;
  total_kwh: number;
  explanation: string;
}

export interface DashboardPvPreview {
  reference_kwp: number;
  typical_annual_coverage_percent: number;
  optimized_annual_coverage_percent: number;
}

export interface DashboardSummaryResponse {
  scenario?: ScenarioMetadata;
  last_reading: DashboardLastReading;
  tariff: DashboardTariff;
  history_last_24h_kwh: number;
  forecast_next_24h_kwh: number;
  next_peak: DashboardNextPeak | null;
  pv_preview: DashboardPvPreview;
}

// ==========================================
// 3. Smart Schedule Today (GET /api/v1/smart-schedule/today/)
// ==========================================

export interface CurrentHourStatus {
  hour: number;
  status_code: ScheduleZone;
  status_title: string;
  price_per_kwh: number;
  currency: string;
}

export interface ScheduleTimelineSlot {
  hour: number;
  hour_label: string;
  status_code: ScheduleZone;
  badge: string;
  price_per_kwh: number;
  is_current: boolean;
  recommended_action?: string;
}

export interface ScheduleWindowItem {
  hours: string;
  label: string;
  for_who?: string;
  recommended_devices?: string[];
  advice?: string;
}

export interface SmartScheduleTodayResponse {
  scenario?: ScenarioMetadata;
  current_hour: number | CurrentHourStatus;
  lowest_tariff_hours?: number[];
  highest_tariff_hours?: number[];
  timeline: ScheduleTimelineSlot[];
  best_windows?: {
    day_solar_window: ScheduleWindowItem;
    night_valley_window: ScheduleWindowItem;
    peak_avoid_window: ScheduleWindowItem;
  };
  tips_by_generation?: {
    dla_dziadkow: string;
    dla_mlodziezy: string;
    dla_rodzicow: string;
  };
}

// ==========================================
// 4. Device Guidance & Shift Simulation
// ==========================================

export interface DeviceGuidanceItem {
  device: string;
  annual_events?: number | null;
  annual_energy_kwh: number;
  energy_per_cycle_kwh?: number | null;
  energy_started_outside_pv_window_kwh?: number | null;
  // UI enrichment fallbacks
  icon?: string;
  best_hours?: string;
  worst_hours?: string;
  annual_savings_potential_eur?: number | null;
  tip_pl?: string;
  target_group?: string;
}

export interface DeviceGuidanceResponse {
  scenario?: ScenarioMetadata;
  currency?: string;
  devices: DeviceGuidanceItem[];
  pv_window?: string;
}

export interface DeviceShiftRequest {
  device: string;
  original_hour: number;
  target_hour: number;
  energy_kwh?: number;
  cycles_per_week?: number;
}

export interface DeviceShiftResponse {
  scenario?: ScenarioMetadata;
  device: string;
  energy_kwh: number;
  original_hour: number;
  original_price_eur: number;
  original_cost_eur: number;
  target_hour: number;
  target_price_eur: number;
  target_cost_eur: number;
  savings_per_cycle_eur: number;
  estimated_annual_cycles: number;
  estimated_annual_savings_eur: number;
  annual_cycles_source?: string;
  in_night_valley: boolean;
  in_pv_window: boolean;
  recommendation: string;
}

// ==========================================
// 5. Tariffs Info (GET /api/v1/tariffs/)
// ==========================================

export interface TariffPeriod {
  start_hour: number;
  end_hour: number;
  price_per_kwh: number;
  label: string;
}

export interface TariffRecommendationWindow {
  start_hour: number;
  end_hour: number;
  price_per_kwh: number;
  tip?: string;
}

export interface TariffInfoResponse {
  scenario?: ScenarioMetadata;
  currency: string;
  current_hour: number;
  current_price_eur: number;
  periods: TariffPeriod[];
  recommendations: {
    cheapest_window: TariffRecommendationWindow;
    pv_window: TariffRecommendationWindow;
    peak_window: TariffRecommendationWindow;
  };
}

// ==========================================
// 6. Consumption History & Forecast
// ==========================================

export interface ConsumptionHistoryRecord {
  timestamp: string;
  total_kwh: number;
  categories: Partial<Record<string, number>>;
  temperature_c: number | null;
  events: string;
}

export interface ConsumptionHistoryPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ConsumptionHistoryResponse {
  scenario?: ScenarioMetadata;
  summary: {
    start: string;
    end: string;
    total_kwh: number;
    categories_totals: Record<string, number>;
  };
  pagination: ConsumptionHistoryPagination;
  items: ConsumptionHistoryRecord[];
}

export interface ConsumptionHistoryParams {
  page?: number;
  page_size?: number;
  start?: string;
  end?: string;
  category?: string;
}

export interface ForecastPeak {
  timestamp: string;
  total_kwh: number;
  explanation: string;
}

export interface ForecastItem {
  timestamp: string;
  total_kwh: number;
  categories: Partial<Record<string, number>>;
  weather: {
    temperature_c: number | null;
    cloud_cover_percent: number | null;
    radiation_w_m2: number | null;
  };
  tariff_price_eur: number;
}

export interface ConsumptionForecastResponse {
  scenario?: ScenarioMetadata;
  categories_totals: Record<string, number>;
  horizon_hours: number;
  total_kwh: number;
  peaks: ForecastPeak[];
  items: ForecastItem[];
}

// ==========================================
// 7. PV Simulate & Variants (GET /api/v1/pv/simulate/, variants/)
// ==========================================

export interface PvVariantResult {
  name: string;
  self_consumption_kwh: number;
  exported_kwh: number;
  grid_kwh: number;
  coverage_percent: number;
  savings_eur: number;
  payback_years: number | null;
}

export interface PvDeviceRecommendation {
  device: string;
  moved_kwh: number;
  grid_saved_kwh: number;
  money_saved_eur: number;
}

export interface PvSimulationParams {
  kwp?: number;
  month?: number;
  magazyn_kwh?: number;
  magazyn_moc_kw?: number;
  magazyn_koszt_eur?: number;
  include_week_profile?: boolean;
  variantA_pvKwp?: number;
  variantA_batteryKwh?: number;
  variantB_pvKwp?: number;
  variantB_batteryKwh?: number;
  annualConsumptionKwh?: number;
}

export interface PvSimulationResponse {
  scenario?: ScenarioMetadata;
  kwp: number;
  currency: string;
  storage_capacity_kwh?: number;
  storage_power_kw?: number;
  investment_eur?: number;
  annual_consumption_kwh: number;
  annual_production_kwh: number;
  variant_a: PvVariantResult;
  variant_b: PvVariantResult;
  optimization_gain: {
    additional_self_kwh: number;
    additional_savings_eur: number;
    payback_shortened_years: number | null;
  };
  device_recommendations?: PvDeviceRecommendation[];
  week_profile?: unknown;
}

export interface PvVariantTableItem {
  kwp: number;
  annual_production_kwh: number;
  coverage_a_percent: number;
  coverage_b_percent: number;
  savings_a_eur: number;
  savings_b_eur: number;
  payback_a_years: number | null;
  payback_b_years: number | null;
  grid_a_kwh: number;
  grid_b_kwh: number;
}

export interface PvVariantsResponse {
  scenario?: ScenarioMetadata;
  currency: string;
  variants: PvVariantTableItem[];
}

// ==========================================
// 8. Flexible Events (GET /api/v1/devices/flexible-events/)
// ==========================================

export interface FlexibleEventRecord {
  device: string;
  day: string;
  start_hour: number;
  duration_h: number;
  energy_kwh: number;
}

export interface FlexibleEventsParams {
  page?: number;
  page_size?: number;
  device?: string;
  status?: string;
}

export interface FlexibleEventsResponse {
  scenario?: ScenarioMetadata;
  pagination: ConsumptionHistoryPagination;
  items: FlexibleEventRecord[];
  device_filter?: string | null;
}

// ==========================================
// 9. System Assumptions & Metrics
// ==========================================

export interface SystemAssumptionsResponse {
  scenario?: ScenarioMetadata;
  location: string;
  household: {
    residents_count: number;
    profile: string;
    heating_type: string;
  };
  device_profiles: Record<
    string,
    {
      energy_range_kwh: [number, number];
      duration_range_h: [number, number];
    }
  >;
  pv_assumptions: {
    installation_cost_per_kwp_eur: number;
    export_price_per_kwh_eur: number;
    annual_opex_rate: number;
    performance_ratio: number;
    recommended_window: string;
  };
  spans: {
    history_hours: number;
    history_start: string;
    history_end: string;
    forecast_hours: number;
    forecast_start: string;
    forecast_end: string;
    annual_hours: number;
  };
}

export interface SystemMetricsResponse {
  scenario?: ScenarioMetadata;
  godzin: number;
  mae_baseline: number;
  mae_model: number;
  mape_baseline: number;
  mape_model: number;
  okres_do: string;
  okres_od: string;
  wygenerowano: string;
}

// ==========================================
// 10. Scenarios List (GET /api/v1/scenarios/)
// ==========================================

export interface ScenariosListResponse {
  active_scenario_id: number;
  scenarios: ScenarioMetadata[];
}

// ==========================================
// 11. API Client Response and Error Wrappers
// ==========================================

export type ApiResponse<T> =
  | {
      readonly success: true;
      readonly data: T;
      readonly isMock: false;
      readonly timestamp: number;
      readonly sourceUrl: string;
    }
  | {
      readonly success: false;
      readonly error: ApiErrorDetail;
      readonly isMock: false;
      readonly timestamp: number;
      readonly sourceUrl: string;
    };

export interface ApiErrorDetail {
  readonly message: string;
  readonly statusCode?: number;
  readonly code?: string;
  readonly details?: unknown;
}
