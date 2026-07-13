"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { AlertTriangle, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const RISK_MATRIX = [
  { zone: "Gate A (North)", density: 0.72, threats: 2, risk: "MEDIUM", trend: "↑" },
  { zone: "Gate B (East)", density: 0.45, threats: 0, risk: "LOW", trend: "→" },
  { zone: "Gate C (South)", density: 0.88, threats: 4, risk: "HIGH", trend: "↑" },
  { zone: "Gate D (West)", density: 0.31, threats: 0, risk: "LOW", trend: "↓" },
  { zone: "Level 1 Concourse", density: 0.65, threats: 1, risk: "MEDIUM", trend: "→" },
  { zone: "VIP Lounge", density: 0.12, threats: 0, risk: "LOW", trend: "↓" },
  { zone: "Press Area", density: 0.55, threats: 0, risk: "LOW", trend: "→" },
  { zone: "Medical Bay", density: 0.20, threats: 0, risk: "LOW", trend: "→" },
];

export const PanelRisks: React.FC = () => {
  const { theme, setActiveTab } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className={`w-6 h-6 ${theme.text}`} /> Active Threat Assessment Matrix
      </h2>

      {/* Summary bars */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "High Risk Zones", value: RISK_MATRIX.filter(r => r.risk === "HIGH").length, color: "text-red-400", bg: "bg-red-950/20 border-red-500/20" },
          { label: "Medium Risk Zones", value: RISK_MATRIX.filter(r => r.risk === "MEDIUM").length, color: "text-yellow-400", bg: "bg-yellow-950/20 border-yellow-500/20" },
          { label: "Low Risk Zones", value: RISK_MATRIX.filter(r => r.risk === "LOW").length, color: "text-green-400", bg: "bg-green-950/20 border-green-500/20" },
        ].map((item, i) => (
          <div key={i} className={`p-4 border rounded-2xl ${item.bg}`}>
            <div className={`text-2xl font-extrabold ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Zone</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Density</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Threats</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Risk Level</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody>
            {RISK_MATRIX.map((row, i) => (
              <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-all">
                <td className="px-4 py-3 font-bold text-zinc-200">{row.zone}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        row.density > 0.8 ? "bg-red-500" : row.density > 0.6 ? "bg-yellow-500" : "bg-green-500"
                      }`} style={{ width: `${row.density * 100}%` }} />
                    </div>
                    <span className="text-zinc-400 font-mono">{(row.density * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-300 font-mono">{row.threats}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-[9px] uppercase font-bold ${
                    row.risk === "HIGH" ? "border-red-500/30 text-red-400" :
                    row.risk === "MEDIUM" ? "border-yellow-500/30 text-yellow-400" :
                    "border-green-500/30 text-green-400"
                  }`}>{row.risk}</Badge>
                </td>
                <td className={`px-4 py-3 font-bold ${
                  row.trend === "↑" ? "text-red-400" : row.trend === "↓" ? "text-green-400" : "text-zinc-400"
                }`}>{row.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl flex items-start gap-4">
        <Bot className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-red-400 mb-1">AI Threat Assessment</div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">Gate C (South) is the highest risk zone with 88% density and 4 reported incidents. Deploy additional security officers to Gate C immediately and activate overflow routing to Gates A and B.</p>
          <button
            onClick={() => setActiveTab("ai_assistant")}
            className="mt-2 text-[11px] font-bold text-red-400 flex items-center gap-1 hover:opacity-80 transition-all"
          >
            <Bot className="w-3.5 h-3.5" /> Ask AI for mitigation recommendations →
          </button>
        </div>
      </div>
    </div>
  );
};
