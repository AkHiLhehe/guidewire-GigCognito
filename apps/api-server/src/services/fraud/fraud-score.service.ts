export interface FraudSignals {
  gpsInZone:             boolean;
  locationContinuous:    boolean;
  fingerprintConsistent: boolean;
  ipLocationMatch:       boolean;
  platformWasOnline:     boolean;
  deviceHasMotion:       boolean;
  noActiveDeliveries:    boolean;
  accountOlderThan7Days: boolean;
}

export type FraudAction = "AUTO_APPROVE" | "PROVISIONAL" | "HUMAN_REVIEW" | "REJECT";

export interface FraudDecision {
  score:       number;
  signals:     FraudSignals;
  consistent:  number;
  action:      FraudAction;
  payoutPct:   number;
  message:     string;
}

export function evaluateFraud(signals: FraudSignals): FraudDecision {
  const keys   = Object.keys(signals) as (keyof FraudSignals)[];
  const consistent = keys.filter(k => signals[k]).length;
  const score  = Math.round((consistent / keys.length) * 100);

  let action: FraudAction;
  let payoutPct: number;
  let message: string;

  // Hard block: was offline before trigger
  if (!signals.platformWasOnline) {
    action   = "REJECT";
    payoutPct = 0;
    message  = "Worker was offline before trigger activated. Not eligible.";
  } else if (consistent >= 4) {
    action   = "AUTO_APPROVE";
    payoutPct = 100;
    message  = "Claim verified. Payout dispatched.";
  } else if (consistent >= 2) {
    action   = "PROVISIONAL";
    payoutPct = 80;
    message  = "80% payout now. Verifying one more signal — remaining 20% by tomorrow morning.";
  } else if (consistent >= 1) {
    action   = "HUMAN_REVIEW";
    payoutPct = 0;
    message  = "Your claim is being reviewed. We'll update you within 2 hours.";
  } else {
    action   = "REJECT";
    payoutPct = 0;
    message  = "Unable to verify your location. Tap here to appeal.";
  }

  return { score, signals, consistent, action, payoutPct, message };
}
