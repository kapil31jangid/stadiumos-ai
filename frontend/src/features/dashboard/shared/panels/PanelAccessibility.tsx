"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Activity } from "lucide-react";

export const PanelAccessibility: React.FC = () => {
  const {
    t,
    theme,
    accessContrast,
    setAccessContrast,
    accessWheelchair,
    setAccessWheelchair,
    accessTextSize,
    setAccessTextSize,
    accessElevator,
    setAccessElevator
  } = useDashboard();

  return (
    <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
      <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
        <Activity className="w-4 h-4 text-zinc-400" /> {t("accessibility")} Preferences
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setAccessContrast(!accessContrast)}
          aria-pressed={accessContrast}
          className={`p-4 border rounded-xl font-bold transition-all text-left flex justify-between items-center text-sm ${
            accessContrast ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-800 text-zinc-400"
          }`}
        >
          <span>👁️ High Contrast Mode</span>
          <span className="text-xs">{accessContrast ? "ON" : "OFF"}</span>
        </button>
        <button 
          onClick={() => setAccessWheelchair(!accessWheelchair)}
          aria-pressed={accessWheelchair}
          className={`p-4 border rounded-xl font-bold transition-all text-left flex justify-between items-center text-sm ${
            accessWheelchair ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-800 text-zinc-400"
          }`}
        >
          <span>♿ Wheelchair Routing</span>
          <span className="text-xs">{accessWheelchair ? "ON" : "OFF"}</span>
        </button>
        <div className="p-4 flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950/50">
          <span className="text-xs text-zinc-400 font-bold uppercase">Text Scaling</span>
          <select 
            value={accessTextSize} 
            onChange={(e) => setAccessTextSize(e.target.value as "normal" | "large" | "huge")}
            className={`bg-transparent ${theme.text} font-bold outline-none text-sm`}
          >
            <option value="normal">Normal (A)</option>
            <option value="large">Large (A+)</option>
            <option value="huge">Extra Large (A++)</option>
          </select>
        </div>
        <button 
          onClick={() => setAccessElevator(!accessElevator)}
          aria-pressed={accessElevator}
          className={`p-4 border rounded-xl font-bold transition-all text-left flex justify-between items-center text-sm ${
            accessElevator ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-800 text-zinc-400"
          }`}
        >
          <span>🛗 Elevator-only Routes</span>
          <span className="text-xs">{accessElevator ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
};
