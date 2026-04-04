import {
  PREMIUM_TIERS,
  SEASONAL_MULTIPLIERS,
  ZONE_RISK_ADJUSTMENT,
  NO_CLAIM_BONUS_PCT,
  TENURE_DISCOUNT_MONTHS,
  TENURE_DISCOUNT_AMOUNT,
  MIN_WEEKLY_PREMIUM,
  MAX_WEEKLY_PREMIUM,
  type PremiumTier,
} from "@gigshield/shared-config";
import { recommendPricingML } from "../ml/ml-client.service";

export interface PricingInput {
  tier: PremiumTier;
  season: string;
  zoneRisk: "HIGH" | "MEDIUM" | "LOW";
  tenureMonths: number;
  claimsLast4Weeks: number;
  triggerEvents30d?: number;
  avgClaimRatio90d?: number;
}

export interface PricingOutput {
  basePremium: number;
  seasonalAdj: number;
  zoneAdj: number;
  tenureDiscount: number;
  noClaimDiscount: number;
  finalPremium: number;
  breakdown: string;
}

function calculateWeeklyPremiumFallback(input: PricingInput): PricingOutput {
  const base = PREMIUM_TIERS[input.tier].weeklyBase;
  const seasonMul = SEASONAL_MULTIPLIERS[input.season] ?? 1.0;
  const seasonalAdj = Math.round(base * (seasonMul - 1));
  const zoneAdj = ZONE_RISK_ADJUSTMENT[input.zoneRisk];
  const tenureDiscount = input.tenureMonths >= TENURE_DISCOUNT_MONTHS ? TENURE_DISCOUNT_AMOUNT : 0;
  const noClaimDiscount = input.claimsLast4Weeks === 0
    ? Math.round(base * NO_CLAIM_BONUS_PCT)
    : 0;

  const raw = base + seasonalAdj + zoneAdj - tenureDiscount - noClaimDiscount;
  const finalPremium = Math.max(MIN_WEEKLY_PREMIUM, Math.min(MAX_WEEKLY_PREMIUM, raw));

  return {
    basePremium: base,
    seasonalAdj,
    zoneAdj,
    tenureDiscount,
    noClaimDiscount,
    finalPremium,
    breakdown: `base ₹${base} + season ₹${seasonalAdj} + zone ₹${zoneAdj} - tenure ₹${tenureDiscount} - ncb ₹${noClaimDiscount} = ₹${finalPremium}`,
  };
}

export async function calculateWeeklyPremium(input: PricingInput): Promise<PricingOutput> {
  try {
    const season = ["normal", "monsoon", "delhi_aqi", "heatwave"].includes(input.season)
      ? (input.season as "normal" | "monsoon" | "delhi_aqi" | "heatwave")
      : "normal";

    const ml = await recommendPricingML({
      tier: input.tier,
      season,
      zone_risk: input.zoneRisk,
      tenure_months: input.tenureMonths,
      claims_last_4_weeks: input.claimsLast4Weeks,
      trigger_events_30d: input.triggerEvents30d ?? 0,
      avg_claim_ratio_90d: input.avgClaimRatio90d ?? 0,
    });

    const base = PREMIUM_TIERS[input.tier].weeklyBase;
    return {
      basePremium: base,
      seasonalAdj: 0,
      zoneAdj: 0,
      tenureDiscount: 0,
      noClaimDiscount: 0,
      finalPremium: ml.recommended_premium,
      breakdown: `ml-risk=${ml.risk_score}, ml-confidence=${ml.confidence}, ${ml.breakdown}`,
    };
  } catch {
    return calculateWeeklyPremiumFallback(input);
  }
}
