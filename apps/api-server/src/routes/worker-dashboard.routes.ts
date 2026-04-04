import express from "express";
import { getWorkerDashboard } from "../services/worker/worker-dashboard.service";
import { authenticateWorker } from "../middlewares/authenticateWorker";

const router = express.Router();

// GET /api/worker-dashboard/overview
router.get("/overview", authenticateWorker, async (req, res) => {
  const workerId = req.user.id;
  // fallback for demo: use a default zone if not present
  const zoneId = req.user.zoneId || "BLR_KOR_01";
  try {
    // Provide mock data if backend services are not implemented
    const dashboard = await getWorkerDashboard(workerId, zoneId);
    // If dashboard is empty or undefined, return mock data
    if (!dashboard || !dashboard.zone) {
      res.json({
        zone: "Koramangala",
        payoutPool: 1200000,
        riskSignals: ["Heavy Rainfall Alert", "AQI approaching threshold"],
        activeTriggers: ["Rainfall", "AQI"],
        lastPayout: "Today, 11:02 AM"
      });
    } else {
      res.json(dashboard);
    }
  } catch (err) {
    // Always return mock data for demo if error
    res.json({
      zone: "Koramangala",
      payoutPool: 1200000,
      riskSignals: ["Heavy Rainfall Alert", "AQI approaching threshold"],
      activeTriggers: ["Rainfall", "AQI"],
      lastPayout: "Today, 11:02 AM"
    });
  }
});

export default router;
