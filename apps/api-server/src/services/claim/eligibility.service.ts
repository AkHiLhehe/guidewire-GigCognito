/**
 * Eligibility gates — checked before fraud scoring.
 * Any failure here = hard reject, no payout.
 */

export interface EligibilityInput {
  policyStatus:       string;
  policyZoneId:       string;
  triggerZoneId:      string;
  workerWasOnline:    boolean;
  accountCreatedAt:   Date;
  waitingUntil:       Date;
  claimsThisWeek:     number;
  maxClaimsPerWeek:   number;
}

export interface EligibilityResult {
  eligible:  boolean;
  reason?:   string;
}

const WAITING_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  if (input.policyStatus !== "ACTIVE")
    return { eligible: false, reason: "Policy is not active." };

  if (input.policyZoneId !== input.triggerZoneId)
    return { eligible: false, reason: `Trigger zone ${input.triggerZoneId} does not match policy zone ${input.policyZoneId}.` };

  if (!input.workerWasOnline)
    return { eligible: false, reason: "Worker was offline before trigger activated." };

  const now = Date.now();
  if (now < input.waitingUntil.getTime())
    return { eligible: false, reason: "Account is within the 7-day waiting period." };

  if (input.claimsThisWeek >= input.maxClaimsPerWeek)
    return { eligible: false, reason: `Weekly claim limit of ${input.maxClaimsPerWeek} reached.` };

  return { eligible: true };
}
