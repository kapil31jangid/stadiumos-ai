"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Clock, RefreshCw, Bot } from "lucide-react";

export const PanelTransport: React.FC = () => {
  const { theme, setActiveTab } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className={`w-6 h-6 ${theme.text}`} /> Exit Transport Logistics
        </h2>
        <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all border border-zinc-800 px-3 py-1.5 rounded-lg">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
      
      {/* Departure board */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-zinc-300 mb-4">Live Departure Board</h3>
        <div className="space-y-2">
          {[
            { name: "🚇 Stadium Metro Line", stop: "Platform 1", wait: "18 min", status: "CROWDED", color: "text-red-400" },
            { name: "🚌 Shuttle Service — Gate C", stop: "Bay C4", wait: "2 min", status: "CLEAR", color: "text-green-400" },
            { name: "🚌 Shuttle Service — Gate A", stop: "Bay A1", wait: "5 min", status: "LOADING", color: "text-yellow-400" },
            { name: "🚕 Rideshare Pickup", stop: "Drop-off Zone East", wait: "8 min", status: "SURGE PRICING", color: "text-orange-400" },
            { name: "🅿️ Parking Lot A Exit", stop: "Exit 1 & 3", wait: "25 min", status: "CONGESTED", color: "text-red-400" },
            { name: "🅿️ Parking Lot C Exit", stop: "Exit 2", wait: "6 min", status: "CLEAR", color: "text-green-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <div className="text-xs font-bold text-zinc-200">{item.name}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{item.stop}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm font-bold ${item.color}`}>{item.wait}</div>
                <div className={`text-[9px] font-bold uppercase ${item.color} opacity-70`}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Travel Tip */}
      <div className="bg-zinc-950 border border-zinc-800/60 p-5 rounded-3xl flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl ${theme.lightBg} border ${theme.border} flex items-center justify-center shrink-0`}>
          <Bot className={`w-5 h-5 ${theme.text}`} />
        </div>
        <div>
          <div className={`text-xs font-bold ${theme.text} mb-1`}>AI Travel Recommendation</div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Based on current crowd density, Gate C Shuttle Bus is your fastest option with only a 2 min wait. 
            Avoid the Metro — 18 min wait with peak-hour surge. Exit toward Gate C via the South Concourse corridor (currently 31% density).
          </p>
          <button
            onClick={() => setActiveTab("ai_assistant")}
            className={`mt-3 text-[11px] font-bold ${theme.text} flex items-center gap-1 hover:opacity-80 transition-all`}
          >
            <Bot className="w-3.5 h-3.5" /> Ask for personalized exit plan →
          </button>
        </div>
      </div>
    </div>
  );
};
