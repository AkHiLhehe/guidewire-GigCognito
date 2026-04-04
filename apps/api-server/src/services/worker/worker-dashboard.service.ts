// Worker Transparency Dashboard Service
// Returns real-time trigger data, payout pool status, and worker risk signals
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getWorkerDashboard(workerId: string, zoneId: string) {
  // Fetch worker and zone info
  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return null;
  const zone = worker.zoneId
    ? await prisma.zone.findUnique({ where: { id: worker.zoneId } })
    : null;

  // Fetch recent payouts (last 3)
  const payouts = await prisma.payout.findMany({
    where: { workerId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Fetch recent claims (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const claims = await prisma.claim.findMany({
    where: { workerId, createdAt: { gte: weekAgo } },
    orderBy: { createdAt: "desc" },
  });

  // Example: risk signals and triggers (stub, can be made dynamic)
  const riskSignals = [
    ...(zone?.riskLevel === "HIGH" ? ["Heavy Rainfall Alert"] : []),
    "AQI approaching threshold"
  ];
  const activeTriggers = ["Rainfall", "AQI"];

  // Last payout info
  const lastPayout = payouts[0]
    ? `${payouts[0].createdAt.toLocaleDateString()} ${payouts[0].amount}`
    : null;

  return {
    zone: zone?.city || worker.city || "Unknown",
    zoneRisk: zone?.riskLevel || "MEDIUM",
    payoutPool: 1200000, // TODO: make dynamic
    riskSignals,
    activeTriggers,
    lastPayout,
    earnedThisWeek: payouts
      .filter(p => p.createdAt >= weekAgo)
      .reduce((sum, p) => sum + p.amount, 0),
    claimsThisWeek: claims.length,
    recentPayouts: payouts.map(p => ({
      amount: p.amount,
      status: p.status,
      trigger: p.claimId,
      date: p.createdAt,
    })),
  };
}
