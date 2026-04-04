import { TRIGGER_THRESHOLDS, CONFIDENCE_THRESHOLDS, type TriggerType } from "@gigshield/shared-config";

export interface TriggerSignal {
  type: TriggerType;
  zoneId: string;
  source1Value: number;
  source2Value: number;
  officialAdvisory: boolean;
  historicalPattern: number;
}

export interface TriggerDecision {
  type: TriggerType;
  zoneId: string;
  confidence: number;
  action: "AUTO_TRIGGER" | "ADMIN_REVIEW" | "IGNORE";
  payoutHours: number;
}

export function evaluateTrigger(signal: TriggerSignal): TriggerDecision {
  const weights = { source1: 40, source2: 20, official: 30, historical: 10 };

  const s1Score  = signal.source1Value >= getThreshold(signal.type) ? weights.source1 : 0;
  const s2Score  = signal.source2Value >= getThreshold(signal.type) ? weights.source2 : 0;
  const offScore = signal.officialAdvisory ? weights.official : 0;
  const histScore = Math.min(signal.historicalPattern * weights.historical, weights.historical);

  const confidence = Math.round(s1Score + s2Score + offScore + histScore);

  const action =
    confidence >= CONFIDENCE_THRESHOLDS.AUTO_TRIGGER ? "AUTO_TRIGGER" :
    confidence >= CONFIDENCE_THRESHOLDS.ADMIN_REVIEW  ? "ADMIN_REVIEW"  : "IGNORE";

  return {
    type: signal.type,
    zoneId: signal.zoneId,
    confidence,
    action,
    payoutHours: action === "AUTO_TRIGGER" ? getPayoutHours(signal.type) : 0,
  };
}

function getThreshold(type: TriggerType): number {
  switch (type) {
    case "T1_RAINFALL": return TRIGGER_THRESHOLDS.T1_RAINFALL_MM_3HR;
    case "T2_AQI":      return TRIGGER_THRESHOLDS.T2_AQI_SEVERE;
    case "T4_HEATWAVE": return TRIGGER_THRESHOLDS.T4_HEATWAVE_TEMP_C;
    default:            return 1;
  }
}

function getPayoutHours(type: TriggerType): number {
  switch (type) {
    case "T1_RAINFALL": return 8;
    case "T2_AQI":      return 4;
    case "T3_FLOOD":    return 8;
    case "T4_HEATWAVE": return 4;
    case "T5_CURFEW":   return 6;
    case "T6_FESTIVAL": return 3;
    case "T7_OUTAGE":   return 2;
    default:            return 4;
  }
}
