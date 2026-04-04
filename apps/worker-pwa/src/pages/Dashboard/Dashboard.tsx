import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; }
  .fade-in { animation: fadeUp 0.35s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .nav-btn { background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 16px; border-radius: 8px; transition: background 0.15s; }
  .nav-btn:hover { background: rgba(255,255,255,0.05); }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }
  .alert-card { animation: slideIn 0.4s ease both; }
  @keyframes slideIn { from{ opacity:0; transform:translateX(-10px); } to{ opacity:1; transform:translateX(0); } }
`;

interface WorkerProfile {
  name: string;
  zone: string;
  zoneId: string;
  tier: string;
  premium: number;
  maxPayout: number;
  policyStatus: string;
  policyExpiry: string;
  earningsProtected: number;
  claimsThisWeek: number;
}

interface Alert {
  id: number;
  type: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  severity: string;
  payout: number | null;
}

interface Payout {
  id: number;
  date: string;
  amount: number;
  reason: string;
  status: string;
}

const RISK_LEVEL = { label: "HIGH", color: "#f87171", bg: "rgba(248,113,113,0.12)", bar: 78 };

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"home"|"policy"|"claims">("home");
  const [triggerDemo, setTriggerDemo] = useState(false);
  const [demoStage, setDemoStage] = useState(0);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on mount
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_BASE}/api/worker/dashboard`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        
        // Map API data to component state
        if (data.worker) setWorker(data.worker);
        if (data.alerts) setAlerts(data.alerts);
        if (data.payouts) setPayouts(data.payouts);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        // Fallback to mock data if API fails
        setWorker({
          name: "Rajan Kumar",
          zone: "Koramangala",
          zoneId: "BLR_KOR_01",
          tier: "Standard",
          premium: 111,
          maxPayout: 416,
          policyStatus: "ACTIVE",
          policyExpiry: "Apr 11, 2026",
          earningsProtected: 832,
          claimsThisWeek: 2,
        });
        setAlerts([
          { id: 1, type: "rain", icon: "🌧️", title: "Heavy Rainfall Alert", desc: "65mm/3hrs detected in Koramangala", time: "11:02 AM", severity: "high", payout: 416 },
          { id: 2, type: "aqi",  icon: "😷", title: "AQI Advisory",         desc: "AQI 380 — approaching threshold",  time: "Yesterday", severity: "medium", payout: null },
        ]);
        setPayouts([
          { id: 1, date: "Today",      amount: 416, reason: "Heavy Rain — Koramangala",  status: "PAID" },
          { id: 2, date: "Apr 1",     amount: 416, reason: "Heavy Rain — Koramangala",  status: "PAID" },
          { id: 3, date: "Mar 28",    amount: 280, reason: "AQI Severe — BLR zone",     status: "PAID" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Demo: simulate a live trigger firing
  function runTriggerDemo() {
    setTriggerDemo(true);
    setDemoStage(1);
    setTimeout(() => setDemoStage(2), 1500);
    setTimeout(() => setDemoStage(3), 3000);
    setTimeout(() => setDemoStage(4), 5000);
    setTimeout(() => { setTriggerDemo(false); setDemoStage(0); }, 8000);
  }

  useEffect(() => {
    if (activeTab === "policy") navigate("/policy");
    if (activeTab === "claims") navigate("/claims");
  }, [activeTab]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <p style={{ color: "#f87171" }}>Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "'DM Sans', system-ui, sans-serif", paddingBottom: 80 }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ padding: "28px 20px 0", maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: "'Space Mono', monospace", color: "#378ADD", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>GIGSHIELD</span>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Hi, {worker.name.split(" ")[0]} 👋</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 20, padding: "6px 12px" }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75" }} />
            <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>ACTIVE</span>
          </div>
        </div>

        {/* Zone Risk Card */}
        <div className="fade-in" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Zone Risk Today</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 600, color: "#fff" }}>{worker.zone}</p>
            </div>
            <div style={{ background: RISK_LEVEL.bg, border: `1px solid ${RISK_LEVEL.color}33`, borderRadius: 8, padding: "5px 12px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: RISK_LEVEL.color }}>{RISK_LEVEL.label} RISK</span>
            </div>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, marginBottom: 8 }}>
            <div style={{ height: 5, width: `${RISK_LEVEL.bar}%`, background: `linear-gradient(90deg, #378ADD, ${RISK_LEVEL.color})`, borderRadius: 3, transition: "width 1s ease" }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Monsoon season · Triggers checked every 15 min</p>
        </div>

        {/* Stats Row */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Earned back this week", value: `₹${worker.earningsProtected}`, color: "#1D9E75", mono: true },
            { label: "Claims this week",      value: `${worker.claimsThisWeek} auto-paid`, color: "#378ADD", mono: false },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: s.color, fontFamily: s.mono ? "'Space Mono', monospace" : "inherit" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Live Alerts */}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 10px", letterSpacing: "0.03em" }}>LIVE ZONE ALERTS</p>
        {alerts.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>No active alerts for your zone</p>
        ) : (
          alerts.map((a, i) => (
          <div key={a.id} className="alert-card" style={{ background: a.severity === "high" ? "rgba(248,113,113,0.07)" : "rgba(255,200,80,0.07)", border: `1px solid ${a.severity === "high" ? "rgba(248,113,113,0.25)" : "rgba(255,200,80,0.2)"}`, borderRadius: 12, padding: "14px", marginBottom: 10, animationDelay: `${i * 0.1}s` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{a.title}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a.time}</span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{a.desc}</p>
                {a.payout && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>₹{a.payout} auto-credited to your UPI ✓</p>}
              </div>
            </div>
          </div>
        ))
        )}

        {/* Demo Trigger Button */}
        <div style={{ marginTop: 20, marginBottom: 8 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: "0 0 8px", textAlign: "center" }}>DEMO MODE</p>
          <button onClick={runTriggerDemo} disabled={triggerDemo}
            style={{ width: "100%", padding: "13px", borderRadius: 10, border: "1px dashed rgba(55,138,221,0.4)", background: "rgba(55,138,221,0.06)", color: triggerDemo ? "rgba(255,255,255,0.3)" : "#378ADD", fontSize: 14, fontWeight: 600, cursor: triggerDemo ? "not-allowed" : "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {triggerDemo ? "🔄 Trigger firing..." : "⚡ Simulate Live Trigger"}
          </button>
        </div>

        {/* Demo Trigger Animation */}
        {triggerDemo && (
          <div style={{ background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.25)", borderRadius: 12, padding: "16px", marginTop: 10 }}>
            {[
              { stage: 1, icon: "🌧️", text: "OpenWeatherMap: 68mm/3hrs in BLR_KOR_01" },
              { stage: 2, icon: "✅", text: "IMD district alert confirmed — dual source validated" },
              { stage: 3, icon: "🔍", text: "Fraud check: 6/8 signals clean — auto-approved" },
              { stage: 4, icon: "💸", text: "₹416 sent to your UPI! Surakshit rahein 🙏" },
            ].map(s => (
              demoStage >= s.stage && (
                <div key={s.stage} className="fade-in" style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <p style={{ margin: 0, fontSize: 13, color: s.stage === 4 ? "#1D9E75" : "rgba(255,255,255,0.7)", fontWeight: s.stage === 4 ? 600 : 400 }}>{s.text}</p>
                </div>
              )
            ))}
          </div>
        )}

        {/* Recent Payouts */}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "24px 0 10px", letterSpacing: "0.03em" }}>RECENT PAYOUTS</p>
        {payouts.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>No recent payouts</p>
        ) : (
          payouts.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: "#fff", fontWeight: 500 }}>{p.reason}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{p.date}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1D9E75", fontFamily: "'Space Mono', monospace" }}>+₹{p.amount}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#1D9E75" }}>{p.status}</p>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,14,26,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[
          { id: "home",   icon: "⊞", label: "Home" },
          { id: "policy", icon: "🛡", label: "Policy" },
          { id: "claims", icon: "💸", label: "Claims" },
        ].map(n => (
          <button key={n.id} className="nav-btn" onClick={() => setActiveTab(n.id as any)}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 11, color: activeTab === n.id ? "#378ADD" : "rgba(255,255,255,0.35)", fontWeight: activeTab === n.id ? 600 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}