/**
 * Bull job handler — processes a single payout from the queue.
 * Retry logic handled by Bull + rollback.service on exhaustion.
 */
import { initiateUPIPayout }               from "../services/payout/razorpay.service.js";
import { markRolledBack, workerRollbackMessage } from "../services/payout/rollback.service.js";

export interface PayoutJobData {
  payoutId:  string;
  workerId:  string;
  claimId:   string;
  amount:    number;
  upiId:     string;
  fundAccountId?: string;
}

export async function processPayoutJob(data: PayoutJobData) {
  console.log(`[PayoutJob] Processing ${data.payoutId} — ₹${data.amount} → ${data.upiId}`);

  try {
    const result = await initiateUPIPayout({
      amount:        data.amount,
      upiId:         data.upiId,
      claimId:       data.claimId,
      fundAccountId: data.fundAccountId,
    });
    console.log(`[PayoutJob] SUCCESS ${data.payoutId} | rzp_id=${result.id} utr=${result.utr}`);
    return { success: true, rzpId: result.id, utr: result.utr };
  } catch (err) {
    console.error(`[PayoutJob] FAILED ${data.payoutId}`, err);
    throw err;
  }
}
