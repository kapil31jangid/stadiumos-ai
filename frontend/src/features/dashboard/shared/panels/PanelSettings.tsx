"use client";

import React from "react";
import { useDashboard, MatchPhase } from "../DashboardContext";
import { PanelAccessibility } from "./PanelAccessibility";
import { 
  Settings as SettingsIcon,
  UserCheck,
  Languages,
  Sliders,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PanelSettings: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    t,
    theme,
    matchPhase,
    setMatchPhase,
    weather,
    setWeather
  } = useDashboard();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <SettingsIcon className={`w-6 h-6 ${theme.text}`} />
        {t("settings")}
      </h2>

      {/* Profile */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-zinc-400" /> Profile
        </h3>
        <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{user.name}</div>
            <div className="text-xs text-zinc-400">{user.email}</div>
            <Badge variant="outline" className={`mt-1 ${theme.border} ${theme.text} text-[10px] uppercase`}>
              {user.role.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Languages className="w-4 h-4 text-zinc-400" /> Language & Region
        </h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "es" | "fr" | "ar" | "hi" | "ja")}
          className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors w-full max-w-xs"
        >
          <option value="en">English (US)</option>
          <option value="es">Español (ES)</option>
          <option value="fr">Français (FR)</option>
          <option value="ar">العربية (AR)</option>
          <option value="hi">हिन्दी (HI)</option>
          <option value="ja">日本語 (JA)</option>
        </select>
      </div>

      {/* Accessibility */}
      <PanelAccessibility />

      {/* Stadium Simulator Controls */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400" /> Stadium Simulation Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Match Day Phase</label>
            <select 
              value={matchPhase} 
              onChange={(e) => setMatchPhase(e.target.value as MatchPhase)}
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="PRE_MATCH">Pre-Match (Crowd arriving, Gate queues rising)</option>
              <option value="FIRST_HALF">First Half (Crowd in seats, concession queues low)</option>
              <option value="HALFTIME">Halftime Break (Spikes at concessions & restrooms)</option>
              <option value="SECOND_HALF">Second Half (Intense gameplay, high energy load)</option>
              <option value="POST_MATCH">Post-Match (Exits busy, transport demand surging)</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Simulated Weather Mode</label>
            <select 
              value={weather} 
              onChange={(e) => setWeather(e.target.value as "Sunny" | "Rainy" | "Windy" | "Clear")}
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="Sunny">Sunny ☀️ (Standard operations)</option>
              <option value="Clear">Clear Night 🌙 (Standard operations)</option>
              <option value="Rainy">Rainy 🌧️ (Slippery walkways, delayed transport)</option>
              <option value="Windy">Windy 💨 (Turbulence warnings, security alerts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-400" /> About StadiumOS
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: "Version", value: "v2.0.0" },
            { label: "Platform", value: "FIFA World Cup 2026" },
            { label: "AI Model", value: "Gemini 2.5 Flash" },
            { label: "Backend", value: "FastAPI + Neon DB" },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
              <div className="text-zinc-200 font-bold mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
