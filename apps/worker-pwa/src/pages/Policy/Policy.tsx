import { useNavigate } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
  * { box-sizing: border-box; }
  .fade-in { animation: fadeUp 0.35s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .nav-btn { background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 16px; border-radius: 8px; transition: background 0.15s; }
  .gs-btn { width: 100%; padding: 14px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', system-ui, sans-serif; transition: opacity 0.15s; }
  .gs-btn-primary { background: #378ADD; color: #fff; }
  .gs-btn-ghost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.1); margin-top: 10px; }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }
`;

const TRIGGERS = [
  { icon: "🌧️", label: "Extreme Rainfall",    desc: "> 65mm/3hrs",               active: true  },
  { icon: "😷", label: "Severe AQI",           desc: "AQI > 400 for 4+ hrs",      active: true  },
  { icon: "🌊", label: "Flooding",             desc: "Zone waterlogging alert",    active: true  },
  { icon: "🌡️", label: "Heatwave",             desc: "Temp > 44°C + IMD advisory", active: false },
  { icon: "🚫", label: "Curfew / Section 144", desc: "Official gazette only",      active: false },
  { icon: "🎉", label: "Festival Blockage",    desc: "Municipal calendar",         active: false },
];

export default function Policy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", fontFamily: "'DM Sans', system-ui, sans-serif", paddingBottom: 80 }}>
      <style>{STYLES}</style>

      <div style={{ padding: "28px 20px 0", maxWidth: 420, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", color: "#378ADD", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>GIGSHIELD</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 20, padding: "6px 12px" }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75" }} />
            <span style={{ fontSize: 12, color: "#1D9E75", fontWeight: 600 }}>ACTIVE</span>
          </div>
        </div>

        <p style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Your Policy</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 24px" }}>Week of Apr 4 – Apr 11, 2026</p>

        {/* Policy Card */}
        <div className="fade-in" style={{ background: "linear-gradient(135deg, rgba(55,138,221,0.15), rgba(29,158,117,0.1))", border: "1px solid rgba(55,138,221,0.25)", borderRadius: 16, padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Plan</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#fff" }}>Standard</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Weekly Premium</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: "#378ADD", fontFamily: "'Space Mono', monospace" }}>₹111</p>
            </div>
          </div>

          {[
            ["Zone",              "Koramangala, BLR"],
            ["Max daily payout",  "₹416/day"],
            ["Max weekly payout", "₹1,664/week"],
            ["Policy valid till", "Apr 11, 2026"],
            ["Claim eligibility", "Active"],
            ["Payout method",     "UPI — rajan@phonepe"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{k}</span>
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* What's covered */}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 10px", letterSpacing: "0.03em" }}>COVERED TRIGGERS</p>
        {TRIGGERS.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${t.active ? "rgba(29,158,117,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, color: t.active ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 500 }}>{t.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{t.desc}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.active ? "#1D9E75" : "rgba(255,255,255,0.15)" }} />
          </div>
        ))}

        {/* Not covered */}
        <div style={{ marginTop: 16, padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>NOT COVERED</p>
          {["Health, accidents, hospitalisation", "Vehicle damage or repair", "Low order demand (no trigger)", "Voluntary time off"].map(item => (
            <p key={item} style={{ margin: "4px 0", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>✕ {item}</p>
          ))}
        </div>

        {/* Renew */}
        <div style={{ marginTop: 24 }}>
          <button className="gs-btn gs-btn-primary">Renew for next week — ₹111</button>
          <button className="gs-btn gs-btn-ghost" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,14,26,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-around", padding: "8px 0 12px" }}>
        {[
          { id: "home",   icon: "⊞", label: "Home",   path: "/dashboard" },
          { id: "policy", icon: "🛡", label: "Policy",  path: "/policy"    },
          { id: "claims", icon: "💸", label: "Claims",  path: "/claims"    },
        ].map(n => (
          <button key={n.id} className="nav-btn" onClick={() => navigate(n.path)}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 11, color: n.id === "policy" ? "#378ADD" : "rgba(255,255,255,0.35)", fontWeight: n.id === "policy" ? 600 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}