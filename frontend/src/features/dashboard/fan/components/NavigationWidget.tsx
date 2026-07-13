"use client";

import React from "react";
import { useDashboard } from "../../shared/DashboardContext";
import { SharedWidget } from "../../shared/SharedWidget";
import { MapPin } from "lucide-react";

export const NavigationWidget: React.FC = () => {
  const { searchQuery, setSearchQuery, setActiveTab, theme } = useDashboard();

  return (
    <SharedWidget title="Live Navigation" icon={MapPin}>
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Search sections, gates, concessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50"
        />
        <button 
          onClick={() => setActiveTab("navigation")}
          className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5`}
        >
          Open Pathfinder Map →
        </button>
      </div>
    </SharedWidget>
  );
};
