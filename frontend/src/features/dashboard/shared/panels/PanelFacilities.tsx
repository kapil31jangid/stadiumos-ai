"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Zap, Droplets, Wind, Activity } from "lucide-react";

const SYSTEMS = [
  { name: "Passenger Elevators (12 units)", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Concourse Escalators (24 units)", status: "MOSTLY OK", pct: 98, color: "text-green-400" },
  { name: "Entry Turnstiles (180 units)", status: "DEGRADED", pct: 96, color: "text-yellow-400" },
  { name: "HVAC Cooling Grid", status: "HEAVY LOAD", pct: 68, color: "text-yellow-400" },
  { name: "Emergency Lighting", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Public PA System", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Water Distribution", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Surveillance Cameras", status: "MOSTLY OK", pct: 97, color: "text-green-400" },
];

export const PanelFacilities: React.FC = () => {
  const { theme } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Zap className={`w-6 h-6 ${theme.text}`} /> Facilities System Health Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SYSTEMS.map((sys, i) => (
          <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-300">{sys.name}</div>
                <div className={`text-[10px] font-bold uppercase mt-1 ${sys.color}`}>{sys.status}</div>
              </div>
              <span className={`text-lg font-extrabold ${sys.color}`}>{sys.pct}%</span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                sys.pct >= 99 ? "bg-green-500" : sys.pct >= 90 ? "bg-yellow-500" : "bg-red-500"
              }`} style={{ width: `${sys.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Zap, label: "Power Load", value: "380 kW", sub: "Save Mode", color: "text-yellow-400" },
          { icon: Droplets, label: "Water Flow", value: "42 L/m", sub: "Normal", color: "text-blue-400" },
          { icon: Wind, label: "HVAC Load", value: "68%", sub: "Peak Cooling", color: "text-orange-400" },
          { icon: Activity, label: "Clean Score", value: "Grade A", sub: "Optimal", color: "text-green-400" },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
            <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
            <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
            <div className={`text-sm font-extrabold ${item.color} mt-0.5`}>{item.value}</div>
            <div className="text-[9px] text-zinc-600 mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
