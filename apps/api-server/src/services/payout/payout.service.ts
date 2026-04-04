import { PREMIUM_TIERS, type PremiumTier } from "@gigshield/shared-config";

export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "ROLLED_BACK";

export interface PayoutRecord {
  id:          string;
  workerId:    string;
  claimId:     string;
  amount:      number;
  upiId:       string;
  status:      PayoutStatus;
  createdAt:   Date;
  completedAt?: Date;
  failReason?:  string;
}

export function calcPayoutAmount(tier: PremiumTier, triggerHours: number): number {
  const { hourlyPayout, maxDailyPayout } = PREMIUM_TIERS[tier];
  return Math.min(hourlyPayout * triggerHours, maxDailyPayout);
}

export function buildPayoutRecord(params: {
  workerId: string;
  claimId:  string;
  amount:   number;
  upiId:    string;
}): PayoutRecord {
  return {
    id:        `PAY_${Date.now()}`,
    workerId:  params.workerId,
    claimId:   params.claimId,
    amount:    params.amount,
    upiId:     params.upiId,
    status:    "PENDING",
    createdAt: new Date(),
  };
}
