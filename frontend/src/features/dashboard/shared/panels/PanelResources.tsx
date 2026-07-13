"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Users } from "lucide-react";

const STAFF_ALLOCATION = [
  { zone: "Gate A — Entry", security: 45, volunteers: 12, medical: 2 },
  { zone: "Gate B — Entry", security: 38, volunteers: 10, medical: 1 },
  { zone: "Gate C — Entry", security: 52, volunteers: 14, medical: 3 },
  { zone: "Concourse Level 1", security: 28, volunteers: 55, medical: 4 },
  { zone: "VIP Lounge", security: 22, volunteers: 18, medical: 2 },
  { zone: "Media Centre", security: 15, volunteers: 8, medical: 1 },
  { zone: "First Aid Stations", security: 0, volunteers: 5, medical: 12 },
];

export const PanelResources: React.FC = () => {
  const { theme } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className={`w-6 h-6 ${theme.text}`} /> Resource Allocation Centre
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Security Officers", total: 240, deployed: 215, color: "bg-red-500" },
          { label: "Volunteers", total: 320, deployed: 285, color: "bg-green-500" },
          { label: "Medical Staff", total: 60, deployed: 55, color: "bg-blue-500" },
        ].map((item, i) => (
          <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-3xl">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
            <div className="text-2xl font-extrabold text-white mt-1">{item.deployed}<span className="text-sm text-zinc-600">/{item.total}</span></div>
            <div className="mt-2 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full rounded-full ${item.color}" style={{ width: `${(item.deployed / item.total) * 100}%` }} />
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">{Math.round((item.deployed / item.total) * 100)}% deployed</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-200">Zone-by-Zone Staff Allocation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Zone</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Security</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Volunteers</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Medical</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {STAFF_ALLOCATION.map((row, i) => (
                <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-all">
                  <td className="px-5 py-3 font-bold text-zinc-200">{row.zone}</td>
                  <td className="px-5 py-3 text-red-400 font-mono">{row.security}</td>
                  <td className="px-5 py-3 text-green-400 font-mono">{row.volunteers}</td>
                  <td className="px-5 py-3 text-blue-400 font-mono">{row.medical}</td>
                  <td className="px-5 py-3 text-zinc-300 font-mono font-bold">{row.security + row.volunteers + row.medical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
