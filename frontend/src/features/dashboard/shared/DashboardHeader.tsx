"use client";

import React from "react";
import { useDashboard } from "./DashboardContext";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  setShowNotifDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ setShowNotifDrawer }) => {
  const {
    notifications,
    weather,
    setWeather,
    matchPhase,
    setMatchPhase
  } = useDashboard();

  return (
    <div className="space-y-8">
      {/* Brand Logo & Notification Bell */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold italic tracking-wider text-cyan-400 font-sans">STADIUMOS</h1>
          <Badge variant="outline" className="border-cyan-500/20 text-[9px] text-cyan-400 uppercase tracking-widest font-mono">V2</Badge>
        </div>
        <button 
          onClick={() => setShowNotifDrawer(prev => !prev)}
          className="relative p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          title="Operational Alerts Feed"
        >
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white animate-pulse">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Real-time Simulator Widgets */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>Simulation State</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Weather Cycler */}
          <button
            onClick={() => {
              const weathers: ("Sunny" | "Rainy" | "Windy" | "Clear")[] = ["Sunny", "Rainy", "Windy", "Clear"];
              const nextIndex = (weathers.indexOf(weather) + 1) % weathers.length;
              setWeather(weathers[nextIndex]);
            }}
            className="flex items-center gap-1.5 p-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-left transition-colors"
            title="Click to cycle weather"
          >
            <span className="text-sm">
              {weather === "Sunny" ? "☀️" : weather === "Rainy" ? "🌧️" : weather === "Windy" ? "💨" : "🌙"}
            </span>
            <span className="text-[10px] text-zinc-300 font-semibold truncate">{weather}</span>
          </button>

          {/* Match Phase Cycler */}
          <button
            onClick={() => {
              const phases: ("PRE_MATCH" | "FIRST_HALF" | "HALFTIME" | "SECOND_HALF" | "POST_MATCH")[] = [
                "PRE_MATCH", "FIRST_HALF", "HALFTIME", "SECOND_HALF", "POST_MATCH"
              ];
              const nextIndex = (phases.indexOf(matchPhase) + 1) % phases.length;
              setMatchPhase(phases[nextIndex]);
            }}
            className="flex items-center gap-1.5 p-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-left transition-colors font-sans"
            title="Click to cycle match phase"
          >
            <span className="text-xs">🕒</span>
            <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider truncate">
              {matchPhase === "PRE_MATCH" ? "Pre-Match" :
               matchPhase === "FIRST_HALF" ? "1st Half" :
               matchPhase === "HALFTIME" ? "Halftime" :
               matchPhase === "SECOND_HALF" ? "2nd Half" : "Post-Match"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
