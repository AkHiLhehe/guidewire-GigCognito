import { evaluateFraud, type FraudSignals } from "../fraud/fraud-score.service";
import { detectRing, type ZoneClaimBurst }  from "../fraud/ring-detection.service";
import { calcPayoutAmount, buildPayoutRecord } from "../payout/payout.service";
import { initiateUPIPayout }                from "../payout/razorpay.service";
import { shouldRetry, nextRetryDelay, markRolledBack } from "../payout/rollback.service";
import { sendClaimNotification }            from "../notification/push.service";
import type { PremiumTier }                 from "@gigshield/shared-config";

export interface ClaimRequest {
  workerId:    string;
  policyId:    string;
  zoneId:      string;
  triggerType: string;
  confidence:  number;
  payoutHours: number;
  tier:        PremiumTier;
  upiId:       string;
  workerName:  string;
  signals:     FraudSignals;
  zoneBurst:   ZoneClaimBurst;
}

export interface ClaimResult {
  claimId:       string;
  status:        string;
  payoutAmount:  number;
  immediateAmt:  number;
  heldAmt:       number;
  fraudAction:   string;
  fraudSignals:  number;
  message:       string;
  rzpPayoutId?:  string;
  utr?:          string;
}

export async function processClaim(req: ClaimRequest): Promise {
  const claimId = `CLM_${Date.now()}`;

  const ring = detectRing(req.zoneBurst);
  if (ring.action === "CIRCUIT_BREAK") {
    return {
      claimId, status: "CIRCUIT_BREAK",
      payoutAmount: 0, immediateAmt: 0, heldAmt: 0,
      fraudAction: "CIRCUIT_BREAK",
      fraudSignals: 0,
      message: `Zone circuit breaker tripped: ${ring.flags.join("; ")}`,
    };
  }

  const fraud = evaluateFraud(req.signals);

  if (fraud.action === "REJECT") {
    return {
      claimId, status: "REJECTED",
      payoutAmount: 0, immediateAmt: 0, heldAmt: 0,
      fraudAction: fraud.action,
      fraudSignals: fraud.consistent,
      message: fraud.message,
    };
  }

  if (fraud.action === "HUMAN_REVIEW") {
    return {
      claimId, status: "UNDER_REVIEW",
      payoutAmount: 0, immediateAmt: 0, heldAmt: 0,
      fraudAction: fraud.action,
      fraudSignals: fraud.consistent,
      message: fraud.message,
    };
  }

  const totalPayout   = calcPayoutAmount(req.tier, req.payoutHours);
  const immediateAmt  = Math.round(totalPayout * (fraud.payoutPct / 100));
  const heldAmt       = totalPayout - immediateAmt;

  const payoutRecord = buildPayoutRecord({
    workerId: req.workerId,
    claimId,
    amount:   immediateAmt,
    upiId:    req.upiId,
  });

  let rzpPayoutId: string | undefined;
  let utr: string | undefined;
  let retryState = { attempts: 0, rolledBack: false };

  while (shouldRetry(retryState)) {
    try {
      const result = await initiateUPIPayout({
        amount:  immediateAmt,
        upiId:   req.upiId,
        claimId,
      });
      rzpPayoutId = result.id;
      utr         = result.utr;
      break;
    } catch (err) {
      retryState.attempts++;
      if (!shouldRetry(retryState)) {
        markRolledBack(payoutRecord, String(err));
        await sendClaimNotification({
          workerName: req.workerName,
          amount:     immediateAmt,
          upiId:      req.upiId,
          status:     "ROLLBACK",
          claimId,
        });
        return {
          claimId, status: "PAYOUT_FAILED",
          payoutAmount: totalPayout, immediateAmt, heldAmt,
          fraudAction: fraud.action,
          fraudSignals: fraud.consistent,
          message: `Payout of ₹${immediateAmt} is being processed — will reflect within 24 hours.`,
        };
      }
      await new Promise(r => setTimeout(r, nextRetryDelay(retryState.attempts - 1)));
    }
  }

  await sendClaimNotification({
    workerName: req.workerName,
    amount:     immediateAmt,
    upiId:      req.upiId,
    status:     fraud.action === "PROVISIONAL" ? "PROVISIONAL" : "APPROVED",
    claimId,
    heldAmt:    heldAmt > 0 ? heldAmt : undefined,
  });

  return {
    claimId,
    status:       fraud.action === "PROVISIONAL" ? "PROVISIONAL" : "APPROVED",
    payoutAmount: totalPayout,
    immediateAmt,
    heldAmt,
    fraudAction:  fraud.action,
    fraudSignals: fraud.consistent,
    message:      fraud.message,
    rzpPayoutId,
    utr,
  };
}
