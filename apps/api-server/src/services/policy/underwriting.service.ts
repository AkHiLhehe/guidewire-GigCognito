/**
 * Actuarial helpers
 * BCR (Burning Cost Rate) = total claims paid / total premiums collected
 * Target BCR: 0.55 – 0.70
 * If loss ratio > 0.85 → suspend new enrolments for zone
 */

export interface ActuarialSnapshot {
  totalPremiumCollected: number;
  totalClaimsPaid: number;
}

export function calcBCR(snap: ActuarialSnapshot): number {
  if (snap.totalPremiumCollected === 0) return 0;
  return snap.totalClaimsPaid / snap.totalPremiumCollected;
}

export function isSuspendEnrolments(snap: ActuarialSnapshot): boolean {
  return calcBCR(snap) > 0.85;
}

/**
 * Stress scenario: 14-day monsoon
 * Simulates worst-case payout pool drain
 */
export function stressMonsoon14Day(params: {
  coveredWorkers: number;
  avgDailyPayout: number;
  exposureRate: number;
  avgWeeklyPremium: number;
}): {
  totalPayouts: number;
  totalPremiums2Weeks: number;
  bcr: number;
  solvent: boolean;
} {
  const { coveredWorkers, avgDailyPayout, exposureRate, avgWeeklyPremium } = params;
  const totalPayouts = coveredWorkers * avgDailyPayout * exposureRate * 14;
  const totalPremiums2Weeks = coveredWorkers * avgWeeklyPremium * 2;
  const bcr = totalPremiums2Weeks > 0 ? totalPayouts / totalPremiums2Weeks : 0;
  return {
    totalPayouts: Math.round(totalPayouts),
    totalPremiums2Weeks: Math.round(totalPremiums2Weeks),
    bcr: Math.round(bcr * 100) / 100,
    solvent: bcr <= 0.85,
  };
}
