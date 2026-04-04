export const PREMIUM_TIERS = {
  basic:    { weeklyBase: 49,  hourlyPayout: 35, maxDailyPayout: 280,  maxWeeklyPayout: 1120 },
  standard: { weeklyBase: 89,  hourlyPayout: 52, maxDailyPayout: 416,  maxWeeklyPayout: 1664 },
  premium:  { weeklyBase: 149, hourlyPayout: 70, maxDailyPayout: 560,  maxWeeklyPayout: 2240 },
} as const;

export type PremiumTier = keyof typeof PREMIUM_TIERS;

export const SEASONAL_MULTIPLIERS: Record<string, number> = {
  monsoon:   1.30,
  delhi_aqi: 1.20,
  heatwave:  1.15,
  normal:    1.00,
};

export const ZONE_RISK_ADJUSTMENT: Record<string, number> = {
  HIGH:   18,
  MEDIUM: 10,
  LOW:     0,
};

export const NO_CLAIM_BONUS_PCT      = 0.05;
export const TENURE_DISCOUNT_MONTHS  = 12;
export const TENURE_DISCOUNT_AMOUNT  = 8;
export const MIN_WEEKLY_PREMIUM      = 49;
export const MAX_WEEKLY_PREMIUM      = 149;