"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Leaf, Bot } from "lucide-react";

export const PanelSustainability: React.FC = () => {
  const { theme, sustainabilityTips } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Leaf className={`w-6 h-6 ${theme.text}`} /> Sustainability Centre
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Carbon Offset", value: "42 tons", sub: "This match day", icon: "🌱" },
          { label: "Solar Power Used", value: "28%", sub: "of total load", icon: "☀️" },
          { label: "Water Saved", value: "1,240 L", sub: "vs baseline", icon: "💧" },
        ].map((item, i) => (
          <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-3xl text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
            <div className="text-xl font-extrabold text-white mt-1">{item.value}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Bot className={`w-4 h-4 ${theme.text}`} /> AI Green Recommendations
        </h3>
        {sustainabilityTips.length === 0 ? (
          <div className="py-6 text-center">
            <Leaf className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Loading sustainability recommendations...</p>
          </div>
        ) : sustainabilityTips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300">
            <Leaf className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
