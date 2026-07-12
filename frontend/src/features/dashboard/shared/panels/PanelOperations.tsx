"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Sliders } from "lucide-react";

export const PanelOperations: React.FC = () => {
  const { theme, zones } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Sliders className={`w-6 h-6 ${theme.text}`} /> Operations Command Overview
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tickets Scanned", value: "62,400", sub: "98.6% of capacity", delta: "+1,200 last 30m", color: "text-green-400" },
          { label: "Active Staff", value: "740", sub: "92% attendance", delta: "28 in reserve", color: "text-blue-400" },
          { label: "Open Incidents", value: "3", sub: "2 high priority", delta: "↑1 last hour", color: "text-orange-400" },
          { label: "Avg Concourse Wait", value: "7.2m", sub: "Target: <10m", delta: "↓0.5m vs pre-match", color: "text-purple-400" },
        ].map((item, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</span>
            <div className={`text-2xl font-extrabold ${item.color} mt-1`}>{item.value}</div>
            <span className="text-[10px] text-zinc-500 block mt-1">{item.sub}</span>
            <span className="text-[9px] text-zinc-600 block mt-0.5">{item.delta}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zone Occupancy Summary */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-zinc-200">Zone Occupancy</h3>
          {zones.map((z) => (
            <div key={z.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{z.name}</span>
                <span className={`font-mono font-bold ${z.current_density > 0.8 ? "text-red-400" : z.current_density > 0.6 ? "text-yellow-400" : "text-green-400"}`}>
                  {(z.current_density * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  z.current_density > 0.8 ? "bg-red-500" : z.current_density > 0.6 ? "bg-yellow-500" : "bg-green-500"
                }`} style={{ width: `${z.current_density * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Event Timeline */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Match-Day Event Log</h3>
          <div className="relative border-l border-zinc-800 ml-2 space-y-4 text-xs">
            {[
              { time: "14:00", title: "Gates Open — All Entries", desc: "62,400 admission check-in started." },
              { time: "16:30", title: "Warm-ups Commence", desc: "Teams on pitch; media protocol active." },
              { time: "17:00", title: "VIP Pre-match Reception", desc: "Executive lounge at 12% occupancy." },
              { time: "19:00", title: "Kick-off Ceremonies Begin", desc: "Fan experience + AI alerts scheduled." },
              { time: "19:45", title: "Halftime Surge Expected", desc: "Concourse traffic 300% normal rate." },
              { time: "21:15", title: "Exit Protocol Activation", desc: "Transport routing AI engaged." },
            ].map((ev, i) => (
              <div key={i} className="relative pl-5">
                <span className={`absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full border border-zinc-950 ${theme.bg}`} />
                <div className="text-[9px] font-mono text-zinc-500">{ev.time}</div>
                <div className="font-bold text-zinc-200">{ev.title}</div>
                <div className="text-[10px] text-zinc-500">{ev.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
