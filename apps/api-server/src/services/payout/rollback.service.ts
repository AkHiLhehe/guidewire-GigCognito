/**
 * Rollback logic: if Razorpay payout fails after 3 retries,
 * mark payout ROLLED_BACK, notify worker, and log for admin.
 */

import type { PayoutRecord } from "./payout.service";

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [60_000, 300_000, 900_000]; // 1min, 5min, 15min

export interface RetryState {
  attempts: number;
  nextRetryAt?: Date;
  rolledBack: boolean;
}

export function shouldRetry(state: RetryState): boolean {
  return state.attempts < MAX_RETRIES && !state.rolledBack;
}

export function nextRetryDelay(attempts: number): number {
  return RETRY_DELAYS_MS[attempts] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
}

export function markRolledBack(payout: PayoutRecord, reason: string): PayoutRecord {
  return {
    ...payout,
    status: "ROLLED_BACK",
    failReason: reason,
    completedAt: new Date(),
  };
}

export function workerRollbackMessage(amount: number): string {
  return `Payout of ₹${amount} is being processed — will reflect within 24 hours. We apologise for the delay.`;
}
