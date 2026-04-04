export const TRIGGER_THRESHOLDS = {
  T1_RAINFALL_MM_3HR:       65,
  T2_AQI_SEVERE:            400,
  T2_AQI_MIN_HOURS:         4,
  T3_FLOOD_CONFIRM_HOURS:   1,
  T4_HEATWAVE_TEMP_C:       44,
  T4_HEATWAVE_MIN_DAYS:     2,
  T5_NLP_CONFIDENCE:        0.92,
  T6_FESTIVAL_MIN_HOURS:    2,
  T7_OUTAGE_MIN_MINUTES:    90,
} as const;

export const CONFIDENCE_THRESHOLDS = {
  AUTO_TRIGGER: 75,
  ADMIN_REVIEW: 50,
  IGNORE:        0,
} as const;

export type TriggerType = "T1_RAINFALL" | "T2_AQI" | "T3_FLOOD"
  | "T4_HEATWAVE" | "T5_CURFEW" | "T6_FESTIVAL" | "T7_OUTAGE";
