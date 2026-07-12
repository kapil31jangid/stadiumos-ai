"use client";

import React from "react";


interface MapLegendProps {
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ className = "" }) => {
  const occupancyLevels = [
    { label: "Low", color: "#22c55e", range: "< 45%" },
    { label: "Moderate", color: "#eab308", range: "45–70%" },
    { label: "Busy", color: "#f97316", range: "70–90%" },
    { label: "Critical", color: "#ef4444", range: "> 90%" },
  ];

  const mapSymbols = [
    { icon: "🚪", label: "Gate" },
    { icon: "🍔", label: "Food Court" },
    { icon: "⭐", label: "VIP Area" },
    { icon: "🏥", label: "Medical" },
    { icon: "🚻", label: "Restroom" },
    { icon: "🅿️", label: "Parking" },
    { icon: "🚇", label: "Metro" },
    { icon: "⚡", label: "Emergency" },
  ];

  return (
    <div className={`bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm ${className}`}>
      {/* Occupancy */}
      <div className="mb-4">
        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Crowd Occupancy</div>
        <div className="space-y-1.5">
          {occupancyLevels.map((lvl) => (
            <div key={lvl.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: lvl.color + "99", border: `1px solid ${lvl.color}` }}
              />
              <span className="text-[10px] text-zinc-400 flex-1">{lvl.label}</span>
              <span className="text-[9px] font-mono text-zinc-600">{lvl.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Symbols */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Zone Types</div>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
          {mapSymbols.map((sym) => (
            <div key={sym.label} className="flex items-center gap-1.5">
              <span className="text-[11px]">{sym.icon}</span>
              <span className="text-[9px] text-zinc-500">{sym.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pulse = AI Recommendation */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="relative w-3 h-3 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-50" />
            <div className="w-3 h-3 rounded-full bg-purple-500" />
          </div>
          <span className="text-[9px] text-zinc-500">AI Recommendation active</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-[9px] text-zinc-500">Active incident</span>
        </div>
      </div>
    </div>
  );
};
