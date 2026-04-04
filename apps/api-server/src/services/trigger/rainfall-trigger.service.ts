import axios from "axios";
import { TRIGGER_THRESHOLDS } from "@gigshield/shared-config";
import { evaluateTrigger } from "./trigger-engine.service";

const OWM_KEY = process.env.OPENWEATHER_API_KEY ?? "MOCK";

export async function checkRainfallTrigger(zone: { id: string; lat: number; lng: number }) {
  try {
    let rainMm = 0;
    let imdAdvisory = false;

    if (OWM_KEY !== "MOCK") {
      const res = await axios.get("https://api.openweathermap.org/data/3.0/onecall", {
        params: { lat: zone.lat, lon: zone.lng, exclude: "minutely,daily", appid: OWM_KEY, units: "metric" },
      });
      rainMm = res.data?.current?.rain?.["1h"] ?? 0;
      imdAdvisory = res.data?.alerts?.some((a: { event: string }) =>
        a.event.toLowerCase().includes("rain")) ?? false;
    } else {
      rainMm   = Math.random() > 0.85 ? 70 : 10;
      imdAdvisory = rainMm > 60;
    }

    const decision = evaluateTrigger({
      type: "T1_RAINFALL",
      zoneId: zone.id,
      source1Value: rainMm,
      source2Value: rainMm * 0.9,
      officialAdvisory: imdAdvisory,
      historicalPattern: rainMm > TRIGGER_THRESHOLDS.T1_RAINFALL_MM_3HR ? 0.8 : 0.2,
    });

    console.log(`[Rainfall] Zone ${zone.id} | rain=${rainMm}mm | ${decision.action} (${decision.confidence})`);
    return decision;
  } catch (err) {
    console.error("[Rainfall] API error", err);
    return null;
  }
}
