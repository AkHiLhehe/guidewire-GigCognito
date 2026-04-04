import { Router } from "express";
import { runClaimPipeline }  from "../services/claim/claim-pipeline.service";
import { evaluateTrigger }   from "../services/trigger/trigger-engine.service";
import { checkEligibility }  from "../services/claim/eligibility.service";

const router = Router();

/**
 * POST /claims/trigger
 * Demo endpoint — fires a synthetic trigger and runs full pipeline.
 * Body: { triggerType, zoneId, source1Value, source2Value, officialAdvisory }
 */
router.post("/trigger", async (req, res) => {
  const {
    triggerType  = "T1_RAINFALL",
    zoneId       = "BLR_KOR_01",
    source1Value = 70,
    source2Value = 68,
    officialAdvisory = true,
  } = req.body;

  const trigger = evaluateTrigger({
    type: triggerType,
    zoneId,
    source1Value,
    source2Value,
    officialAdvisory,
    historicalPattern: 0.8,
  });

  if (trigger.action !== "AUTO_TRIGGER") {
    return res.json({
      triggered: false,
      confidence: trigger.confidence,
      action: trigger.action,
      message: `Confidence ${trigger.confidence} — below auto-trigger threshold.`,
    });
  }

  const result = await runClaimPipeline(trigger, {
    workerId:        "mock_rajan_001",
    workerName:      "Rajan Kumar",
    policyId:        "POL_MOCK_001",
    policyStatus:    "ACTIVE",
    policyZoneId:    zoneId,
    tier:            "standard",
    upiId:           "rajan@phonepe",
    accountCreatedAt: new Date(Date.now() - 14 * 86400_000),
    waitingUntil:    new Date(Date.now() - 7  * 86400_000),
    claimsThisWeek:  0,
  });

  res.json({ triggered: true, trigger, pipeline: result });
});

/**
 * POST /claims/eligibility-check
 * Standalone eligibility gate test.
 */
router.post("/eligibility-check", (req, res) => {
  const result = checkEligibility({
    policyStatus:     req.body.policyStatus    ?? "ACTIVE",
    policyZoneId:     req.body.policyZoneId    ?? "BLR_KOR_01",
    triggerZoneId:    req.body.triggerZoneId   ?? "BLR_KOR_01",
    workerWasOnline:  req.body.workerWasOnline ?? true,
    accountCreatedAt: new Date(Date.now() - 14 * 86400_000),
    waitingUntil:     new Date(Date.now() - 7  * 86400_000),
    claimsThisWeek:   req.body.claimsThisWeek  ?? 0,
    maxClaimsPerWeek: 3,
  });
  res.json(result);
});

export default router;
