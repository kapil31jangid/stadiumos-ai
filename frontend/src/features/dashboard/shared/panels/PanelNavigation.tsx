"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { MapPin, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ZONE_DIRECTORY = [
  { name: "Gate A — North Entry", section: "N-100", floor: "Ground", type: "Entry", notes: "Wheelchair accessible" },
  { name: "Gate B — East Entry", section: "E-100", floor: "Ground", type: "Entry", notes: "VIP fast-lane active" },
  { name: "Gate C — South Entry", section: "S-100", floor: "Ground", type: "Entry", notes: "Family zone nearby" },
  { name: "Gate D — West Entry", section: "W-100", floor: "Ground", type: "Entry", notes: "Press & media access" },
  { name: "Food Court Level 1", section: "FC-200", floor: "Level 1", type: "Concession", notes: "12 stalls, halal options" },
  { name: "Restrooms Block A", section: "R-204", floor: "Level 1", type: "Facility", notes: "Accessible, 1m wait" },
  { name: "Restrooms Block B", section: "R-208", floor: "Level 1", type: "Facility", notes: "7m wait — busy" },
  { name: "First Aid Station 1", section: "FA-102", floor: "Ground", type: "Medical", notes: "24hr staffed" },
  { name: "First Aid Station 2", section: "FA-305", floor: "Level 3", type: "Medical", notes: "24hr staffed" },
  { name: "VIP Executive Lounge", section: "VIP-500", floor: "Level 5", type: "VIP", notes: "Access badge required" },
  { name: "Family Fan Zone", section: "FFZ-101", floor: "Level 1", type: "Fan Zone", notes: "Kids activities, quiet area" },
  { name: "Lost & Found", section: "LF-101", floor: "Ground", type: "Service", notes: "Open 10:00–22:00" },
];

export const PanelNavigation: React.FC = () => {
  const { theme, setActiveTab } = useDashboard();
  const [zoneFilter, setZoneFilter] = useState("");

  const filteredZones = ZONE_DIRECTORY.filter(z =>
    z.name.toLowerCase().includes(zoneFilter.toLowerCase()) ||
    z.type.toLowerCase().includes(zoneFilter.toLowerCase()) ||
    z.section.toLowerCase().includes(zoneFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MapPin className={`w-6 h-6 ${theme.text}`} /> Live Stadium Navigation
      </h2>
      
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
        <div className="flex gap-3">
          <input 
            type="text"
            placeholder="Search zones, gates, facilities..."
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          <button
            onClick={() => setZoneFilter("")}
            className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
          >
            Clear
          </button>
        </div>

        {/* Zone Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredZones.length > 0 ? filteredZones.map((zone, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group cursor-pointer"
              onClick={() => setActiveTab("ai_assistant")}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                zone.type === "Entry" ? "bg-blue-950/40 text-blue-400" :
                zone.type === "Concession" ? "bg-amber-950/40 text-amber-400" :
                zone.type === "Medical" ? "bg-red-950/40 text-red-400" :
                zone.type === "VIP" ? "bg-purple-950/40 text-purple-400" :
                "bg-zinc-900 text-zinc-400"
              }`}>
                {zone.type.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">{zone.name}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{zone.section} · Floor: {zone.floor}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5 italic">{zone.notes}</div>
              </div>
              <Badge variant="outline" className="text-[9px] shrink-0 border-zinc-700 text-zinc-500">{zone.type}</Badge>
            </div>
          )) : (
            <div className="col-span-2 p-8 text-center text-zinc-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No zones match your search.</p>
            </div>
          )}
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
          <Bot className={`w-5 h-5 ${theme.text} shrink-0 mt-0.5`} />
          <div>
            <div className="text-xs font-bold text-zinc-300 mb-1">AI Navigation Tip</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Click any zone to ask the AI assistant for detailed directions, wait times, or accessibility routes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
