import axios from "axios";
import type { PremiumTier } from "@gigshield/shared-config";

const ML_BASE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

export interface MLPricingRequest {
  tier: PremiumTier;
  season: "normal" | "monsoon" | "delhi_aqi" | "heatwave";
  zone_risk: "LOW" | "MEDIUM" | "HIGH";
  tenure_months: number;
  claims_last_4_weeks: number;
  trigger_events_30d: number;
  avg_claim_ratio_90d: number;
}

export interface MLPricingResponse {
  recommended_premium: number;
  risk_score: number;
  confidence: number;
  breakdown: string;
}

export interface MLFraudRequest {
  worker_id: string;
  gps_in_zone: boolean;
  location_continuous: boolean;
  impossible_speed: boolean;
  ip_distance_km: number;
  fingerprint_consistent: boolean;
  platform_online: boolean;
  device_has_motion: boolean;
  account_age_days: number;
  claims_last_7d: number;
}

export interface MLFraudResponse {
  fraud_probability: number;
  decision: "AUTO_APPROVE" | "PROVISIONAL" | "MANUAL_REVIEW" | "AUTO_REJECT";
  payout_percent: number;
  rationale: string;
}

export async function recommendPricingML(payload: MLPricingRequest): Promise<MLPricingResponse> {
  const res = await axios.post<MLPricingResponse>(`${ML_BASE_URL}/ml/pricing/recommend`, payload, {
    timeout: 2500,
  });
  return res.data;
}

export async function scoreFraudML(payload: MLFraudRequest): Promise<MLFraudResponse> {
  const res = await axios.post<MLFraudResponse>(`${ML_BASE_URL}/ml/fraud/score`, payload, {
    timeout: 2500,
  });
  return res.data;
}
