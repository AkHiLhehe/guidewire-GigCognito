// Worker Transparency Dashboard Service
// Returns worker profile, recent payouts, and zone alerts from the database
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map premium tiers to max payout amounts
const TIER_PAYOUT_MAP: Record<string, number> = {
  basic: 280,
  standard: 416,
  premium: 560,
};

// Map trigger types to emoji and severity
const TRIGGER_MAP: Record<string, { icon: string; title: string; severity: string }> = {
  rainfall: { icon: "🌧️", title: "Heavy Rainfall Alert", severity: "high" },
  aqi: { icon: "😷", title: "AQI Advisory", severity: "medium" },
  heatwave: { icon: "🌡️", title: "Heatwave Alert", severity: "high" },
  curfew: { icon: "🚨", title: "Curfew Alert", severity: "medium" },
  "fraud-check": { icon: "⚠️", title: "Fraud Detection", severity: "high" },
};

export async function getWorkerDashboard(workerId: string, zoneId: string) {
  // Query worker profile from database
  const workerRecord = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      policies: {
        where: { status: "ACTIVE" },
        orderBy: { activatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!workerRecord) {
    throw new Error(`Worker ${workerId} not found`);
  }

  const activePolicy = workerRecord.policies[0];
  if (!activePolicy) {
    throw new Error(`No active policy for worker ${workerId}`);
  }

  // Build worker profile
  const maxPayout = TIER_PAYOUT_MAP[activePolicy.tier.toLowerCase()] || 416;
  const worker = {
    name: workerRecord.name || "Gig Worker",
    zone: zoneId,
    zoneId,
    tier: activePolicy.tier,
    premium: activePolicy.weeklyPremium,
    maxPayout,
    policyStatus: activePolicy.status,
    policyExpiry: activePolicy.expiresAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    earningsProtected: maxPayout * 2,
    claimsThisWeek: 0,
  };

  // Query recent payouts from database (last 30 days)
  const payoutRecords = await prisma.payout.findMany({
    where: {
      workerId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 86400000),
      },
    },
    include: {
      claim: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const payouts = payoutRecords.map((p) => ({
    id: p.id,
    date: p.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    amount: p.amount,
    reason: `${p.claim?.triggerType || "Claim"} — ${zoneId}`,
    status: p.status.toUpperCase(),
  }));

  // Query recent trigger events for this zone (last 7 days) as alerts
  const triggerRecords = await prisma.triggerEvent.findMany({
    where: {
      zoneId,
      firedAt: {
        gte: new Date(Date.now() - 7 * 86400000),
      },
    },
    orderBy: { firedAt: "desc" },
    take: 5,
  });

  const alerts = triggerRecords.map((t, i) => {
    const triggerInfo = TRIGGER_MAP[t.type] || {
      icon: "⚠️",
      title: t.type,
      severity: "medium",
    };

    return {
      id: t.id,
      type: t.type,
      icon: triggerInfo.icon,
      title: triggerInfo.title,
      desc: `${t.type} detected (confidence: ${t.confidence}%)`,
      time: t.firedAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      severity: triggerInfo.severity,
      payout: triggerInfo.severity === "high" ? maxPayout : null,
    };
  });

  // Count claims this week
  const claimsThisWeek = await prisma.claim.count({
    where: {
      workerId,
      createdAt: {
        gte: new Date(Date.now() - 7 * 86400000),
      },
    },
  });

  worker.claimsThisWeek = claimsThisWeek;

  return {
    worker,
    alerts,
    payouts,
  };
}
