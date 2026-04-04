import { Router } from "express";
import { createPolicy }           from "../services/policy/policy.service.js";
import { calculateWeeklyPremium } from "../services/policy/pricing.service.js";
import { stressMonsoon14Day }     from "../services/policy/underwriting.service.js";

const router = Router();

router.post("/quote", (req, res) => {
  const result = calculateWeeklyPremium(req.body);
  res.json(result);
});

router.post("/create", (req, res) => {
  const result = createPolicy(req.body);
  if ("error" in result) return res.status(400).json(result);
  res.json(result);
});

router.post("/stress-test", (_req, res) => {
  const result = stressMonsoon14Day({
    coveredWorkers:   5000,
    avgDailyPayout:   280,
    exposureRate:     0.22,
    avgWeeklyPremium: 35,
  });
  res.json(result);
});

export default router;
