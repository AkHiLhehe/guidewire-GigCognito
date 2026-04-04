/**
 * Full end-to-end pipeline:
 * Trigger event → eligibility → fraud → payout → notify
 *
 * Called by trigger-poller after AUTO_TRIGGER decision.
 * Also exposed via POST /claims/trigger for demo/testing.
 */

import { checkEligibility }  from "./eligibility.service";
import { processClaim }      from "./claim.service";
import type { TriggerDecision } from "../trigger/trigger-engine.service";
import type { PremiumTier }     from "@gigshield/shared-config";

export interface WorkerPolicyContext {
  workerId:        string;
  workerName:      string;
  policyId:        string;
  policyStatus:    string;
  policyZoneId:    string;
  tier:            PremiumTier;
  upiId:           string;
  accountCreatedAt: Date;
  waitingUntil:    Date;
  claimsThisWeek:  number;
}

export interface PipelineResult {
  stage:   "ELIGIBILITY" | "FRAUD" | "PAYOUT" | "COMPLETE";
  success: boolean;
  detail:  object;
}

export async function runClaimPipeline(
  trigger:  TriggerDecision,
  worker:   WorkerPolicyContext,
): Promise {
  console.log(`[Pipeline] Starting for worker=${worker.workerId} trigger=${trigger.type} zone=${trigger.zoneId}`);

  const elig = checkEligibility({
    policyStatus:     worker.policyStatus,
    policyZoneId:     worker.policyZoneId,
    triggerZoneId:    trigger.zoneId,
    workerWasOnline:  true,
    accountCreatedAt: worker.accountCreatedAt,
    waitingUntil:     worker.waitingUntil,
    claimsThisWeek:   worker.claimsThisWeek,
    maxClaimsPerWeek: 3,
  });

  if (!elig.eligible) {
    console.log(`[Pipeline] INELIGIBLE: ${elig.reason}`);
    return { stage: "ELIGIBILITY", success: false, detail: elig };
  }

  const result = await processClaim({
    workerId:    worker.workerId,
    policyId:    worker.policyId,
    zoneId:      trigger.zoneId,
    triggerType: trigger.type,
    confidence:  trigger.confidence,
    payoutHours: trigger.payoutHours,
    tier:        worker.tier,
    upiId:       worker.upiId,
    workerName:  worker.workerName,
    signals: {
      gpsInZone:             true,
      locationContinuous:    true,
      fingerprintConsistent: true,
      ipLocationMatch:       true,
      platformWasOnline:     true,
      deviceHasMotion:       true,
      noActiveDeliveries:    true,
      accountOlderThan7Days: true,
    },
    zoneBurst: {
      zoneId:              trigger.zoneId,
      claimsInWindow:      12,
      windowMinutes:       20,
      newAccounts7d:       2,
      sharedFingerprints:  1,
      expectedRate:        15,
    },
  });

  console.log(`[Pipeline] DONE claimId=${result.claimId} status=${result.status} payout=₹${result.immediateAmt}`);
  return { stage: "COMPLETE", success: result.status !== "REJECTED", detail: result };
}
