"use client";

import React from "react";
import { Search, X } from "lucide-react";

export type MapFilter = "all" | "crowd" | "incidents" | "facilities" | "transport" | "medical" | "volunteers";

interface MapControlsProps {
  search: string;
  onSearch: (q: string) => void;
  activeFilter: MapFilter;
  onFilter: (f: MapFilter) => void;
  searchResults: { id: string; name: string; icon: string }[];
  onSelectResult: (id: string) => void;
  onClearSearch: () => void;
}

const FILTERS: { key: MapFilter; label: string; emoji: string }[] = [
  { key: "all",        label: "All",        emoji: "🗺" },
  { key: "crowd",      label: "Crowd",      emoji: "👥" },
  { key: "incidents",  label: "Incidents",  emoji: "⚠️" },
  { key: "facilities", label: "Facilities", emoji: "🏗" },
  { key: "transport",  label: "Transport",  emoji: "🚇" },
  { key: "medical",    label: "Medical",    emoji: "🏥" },
  { key: "volunteers", label: "Volunteers", emoji: "🙋" },
];

export const MapControls: React.FC<MapControlsProps> = ({
  search, onSearch, activeFilter, onFilter, searchResults, onSelectResult, onClearSearch
}) => {
  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search zones, gates, facilities..."
          className="w-full bg-zinc-900/80 border border-zinc-800 text-zinc-200 text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-zinc-600 placeholder-zinc-600 transition-colors"
        />
        {search && (
          <button
            onClick={onClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {/* Search Dropdown */}
        {searchResults.length > 0 && search.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden z-30 shadow-2xl">
            {searchResults.map((res) => (
              <button
                key={res.id}
                onClick={() => onSelectResult(res.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800/60 text-left transition-colors"
              >
                <span className="text-sm">{res.icon}</span>
                <span className="text-xs text-zinc-200">{res.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
              activeFilter === f.key
                ? "bg-zinc-700 text-white border border-zinc-600"
                : "bg-zinc-900/60 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};
