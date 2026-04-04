import React, { useEffect, useState } from "react";

interface DashboardData {
  zone: string;
  payoutPool: number;
  riskSignals: string[];
  activeTriggers: string[];
  lastPayout: string;
}

const TransparencyDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/worker-dashboard/overview")
      .then(res => res.json())
      .then(setData)
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-blue-700 animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">No data available</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">👁️</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800 tracking-tight">Transparency Dashboard</h2>
      </div>
      <div className="bg-white/90 p-6 rounded-2xl shadow-lg border border-blue-100 mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-700 text-xl">📍</span>
          <span className="font-semibold">Zone:</span> <span className="text-blue-900">{data.zone}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-700 text-xl">💰</span>
          <span className="font-semibold">Payout Pool:</span> <span className="text-blue-900">₹{data.payoutPool.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-700 text-xl">⏰</span>
          <span className="font-semibold">Last Payout:</span> <span className="text-blue-900">{data.lastPayout}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-700 text-xl">⚡</span>
          <span className="font-semibold">Active Triggers:</span> <span className="text-blue-900">{data.activeTriggers.length ? data.activeTriggers.join(", ") : "None"}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-700 text-xl">🚨</span>
          <span className="font-semibold">Risk Signals:</span>
        </div>
        <ul className="list-disc ml-8 text-blue-700">
          {data.riskSignals.length ? data.riskSignals.map((r, i) => <li key={i}>{r}</li>) : <li>None</li>}
        </ul>
      </div>
    </div>
  );
};

export default TransparencyDashboardPage;
