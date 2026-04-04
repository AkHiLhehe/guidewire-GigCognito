import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ZONES = [
  { id: "BLR_KOR_01", city: "Bengaluru",  lat: 12.9279, lng: 77.6271, riskLevel: "HIGH"   },
  { id: "DEL_DWK_01", city: "Delhi",       lat: 28.5921, lng: 77.0460, riskLevel: "HIGH"   },
  { id: "MUM_ANH_01", city: "Mumbai",      lat: 19.1136, lng: 72.8697, riskLevel: "MEDIUM" },
  { id: "PNE_KSB_01", city: "Pune",        lat: 18.5204, lng: 73.8567, riskLevel: "MEDIUM" },
];

// 4 weeks of hypothetical weekly trigger events per zone
const WEEKLY_TRIGGER_HISTORY = [
  { week: "W1", BLR: 2, DEL: 0, MUM: 1, PNE: 0 },
  { week: "W2", BLR: 3, DEL: 4, MUM: 0, PNE: 1 },
  { week: "W3", BLR: 1, DEL: 5, MUM: 2, PNE: 0 },
  { week: "W4", BLR: 4, DEL: 3, MUM: 1, PNE: 2 },
];

async function main() {
  console.log("Seeding zones...");
  for (const z of ZONES) {
    await prisma.zone.upsert({
      where: { id: z.id },
      update: {},
      create: z,
    });
  }

  console.log("Seeding mock workers...");
  const workers = [
    { phone: "+919900000001", name: "Rajan Kumar",  city: "Bengaluru", zoneId: "BLR_KOR_01", upiId: "rajan@phonepe",  tenureMonths: 14 },
    { phone: "+919900000002", name: "Priya Devi",   city: "Delhi",     zoneId: "DEL_DWK_01", upiId: "priya@gpay",     tenureMonths:  6 },
    { phone: "+919900000003", name: "Ahmed Shaikh", city: "Mumbai",    zoneId: "MUM_ANH_01", upiId: "ahmed@upi",      tenureMonths:  9 },
    { phone: "+919900000004", name: "Suresh Patil", city: "Pune",      zoneId: "PNE_KSB_01", upiId: "suresh@paytm",  tenureMonths: 20 },
  ];
  for (const w of workers) {
    await prisma.worker.upsert({
      where: { phone: w.phone },
      update: {},
      create: w,
    });
  }

  console.log("Seeding historical trigger events (4 weeks)...");
  const triggerTypes = ["T1_RAINFALL","T2_AQI","T4_HEATWAVE"];
  const zoneKeys = ["BLR","DEL","MUM","PNE"];
  const zoneMap: Record = {
    BLR: "BLR_KOR_01", DEL: "DEL_DWK_01", MUM: "MUM_ANH_01", PNE: "PNE_KSB_01"
  };

  for (const week of WEEKLY_TRIGGER_HISTORY) {
    for (const zk of zoneKeys) {
      const count = (week as Record)[zk];
      for (let i = 0; i < count; i++) {
        await prisma.triggerEvent.create({
          data: {
            type:       triggerTypes[i % triggerTypes.length],
            zoneId:     zoneMap[zk],
            confidence: 75 + Math.floor(Math.random() * 20),
            action:     "AUTO_TRIGGER",
            source1Val: 68 + Math.random() * 20,
            source2Val: 65 + Math.random() * 20,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
