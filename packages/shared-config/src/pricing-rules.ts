export const PREMIUM_TIERS = {
  basic:    { weeklyBase: 20, hourlyPayout: 25, maxDailyPayout: 200, maxWeeklyPayout: 800  },
  standard: { weeklyBase: 35, hourlyPayout: 38, maxDailyPayout: 304, maxWeeklyPayout: 1216 },
  premium:  { weeklyBase: 50, hourlyPayout: 52, maxDailyPayout: 416, maxWeeklyPayout: 1664 },
} as const;

export type PremiumTier = keyof typeof PREMIUM_TIERS;

export const SEASONAL_MULTIPLIERS: Record = {
  monsoon:     1.30,
  delhi_aqi:   1.20,
  heatwave:    1.15,
  normal:      1.00,
};

export const ZONE_RISK_ADJUSTMENT: Record = {
  HIGH:   10,
  MEDIUM:  5,
  LOW:     0,
};

export const NO_CLAIM_BONUS_PCT = 0.05;
export const TENURE_DISCOUNT_MONTHS = 12;
export const TENURE_DISCOUNT_AMOUNT = 5;
export const MIN_WEEKLY_PREMIUM = 20;
export const MAX_WEEKLY_PREMIUM = 50;
