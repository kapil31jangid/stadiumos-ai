"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Zap, Maximize2, Minimize2 } from "lucide-react";

import {
  STADIUM_ZONES,
  ZONE_CATEGORY_STYLES,
  StadiumZoneConfig,
  getDensityColor,
  ZoneCategory,
} from "./stadiumData";
import { ZoneDetails } from "./ZoneDetails";
import { MapLegend } from "./MapLegend";
import { MapControls, MapFilter } from "./MapControls";
import { StadiumSVG } from "./StadiumSVG";

import { useDashboard, Zone } from "@/features/dashboard/shared/DashboardContext";

// Mapping from category to filter key
const CATEGORY_TO_FILTER: Record<ZoneCategory, MapFilter> = {
  gate:      "crowd",
  concourse: "crowd",
  seating:   "crowd",
  food:      "facilities",
  vip:       "facilities",
  restroom:  "facilities",
  medical:   "medical",
  parking:   "transport",
  metro:     "transport",
  emergency: "incidents",
  media:     "facilities",
  pitch:     "all",
};

// ─── Main StadiumMap component ─────────────────────────────────────────────────
interface StadiumMapProps {
  compact?: boolean;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({ compact = false }) => {
  const {
    user, zones, incidents, matchPhase, setActiveTab, weather
  } = useDashboard();

  const role = user?.role || "fan";

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<MapFilter>("all");
  const [showAIOverlay, setShowAIOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter zones by role
  const visibleZones = useMemo(
    () => STADIUM_ZONES.filter((z) => z.visibleTo.includes(role) || role === "organizer"),
    [role]
  );

  // Live data lookup
  const getLiveZone = useCallback(
    (id: string): Zone | undefined => zones.find((z) => z.id === id),
    [zones]
  );

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return visibleZones
      .filter((z) =>
        z.name.toLowerCase().includes(q) ||
        z.shortName.toLowerCase().includes(q) ||
        z.category.toLowerCase().includes(q) ||
        z.facilities.some((f) => f.toLowerCase().includes(q))
      )
      .map((z) => ({
        id: z.id,
        name: z.name,
        icon: ZONE_CATEGORY_STYLES[z.category].icon,
      }));
  }, [search, visibleZones]);

  const handleSelectResult = (id: string) => {
    setSelectedZoneId(id);
    setSearch("");
  };

  const handleClearSearch = () => {
    setSearch("");
    setSelectedZoneId(null);
  };

  const isDimmed = (zone: StadiumZoneConfig): boolean => {
    if (activeFilter === "all") return false;
    return CATEGORY_TO_FILTER[zone.category] !== activeFilter;
  };

  const isHighlighted = (zone: StadiumZoneConfig): boolean => {
    if (!search) return false;
    return searchResults.some((r) => r.id === zone.id);
  };

  const selectedZoneConfig = selectedZoneId
    ? STADIUM_ZONES.find((z) => z.id === selectedZoneId) ?? null
    : null;

  // Weather indicator overlay
  const weatherInfo: Record<string, { icon: string; color: string }> = {
    Sunny: { icon: "☀️", color: "#fbbf24" },
    Rainy: { icon: "🌧", color: "#60a5fa" },
    Windy: { icon: "💨", color: "#a1a1aa" },
    Clear: { icon: "🌙", color: "#818cf8" },
  };
  const weatherDisplay = weatherInfo[weather] || weatherInfo.Clear;

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? "fixed inset-0 z-50 p-6 bg-zinc-950/98 backdrop-blur-xl" : ""}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <span className="text-lg">🏟</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Stadium Operations Map</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Live zone intelligence · {matchPhase.replace("_", " ")} &nbsp;·&nbsp;
              <span style={{ color: weatherDisplay.color }}>{weatherDisplay.icon} {weather}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI overlay toggle */}
          <button
            onClick={() => setShowAIOverlay((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
              showAIOverlay
                ? "bg-purple-900/30 border-purple-500/30 text-purple-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Zap className="w-3 h-3" />
            AI Overlay
          </button>
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <MapControls
        search={search}
        onSearch={setSearch}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        searchResults={searchResults}
        onSelectResult={handleSelectResult}
        onClearSearch={handleClearSearch}
      />

      {/* ── Map + Details ── */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* SVG Map Container */}
        <div className={`relative flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden ${isFullscreen ? "flex-1" : ""}`}
          style={{ minHeight: compact ? 360 : 480 }}
        >
          {/* Grid background */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Main Stadium SVG */}
          <StadiumSVG
            visibleZones={visibleZones}
            getLiveZone={getLiveZone}
            selectedZoneId={selectedZoneId}
            setSelectedZoneId={setSelectedZoneId}
            hoveredZoneId={hoveredZoneId}
            setHoveredZoneId={setHoveredZoneId}
            isHighlighted={isHighlighted}
            isDimmed={isDimmed}
            showAIOverlay={showAIOverlay}
            matchPhase={matchPhase}
            zones={zones}
          />

          {/* Zone Details panel (inside map container) */}
          <AnimatePresence>
            {selectedZoneConfig && (
              <ZoneDetails
                zone={selectedZoneConfig}
                liveZone={getLiveZone(selectedZoneConfig.id)}
                role={role}
                matchPhase={matchPhase}
                incidents={incidents}
                onClose={() => setSelectedZoneId(null)}
                onAIChat={() => setActiveTab("ai_assistant")}
              />
            )}
          </AnimatePresence>

          {/* Click-outside close helper */}
          {selectedZoneId && (
            <div
              className="absolute inset-0 z-10"
              style={{ pointerEvents: "none" }}
            />
          )}
        </div>

        {/* ── Legend (sidebar on desktop, below on mobile) ── */}
        <div className="lg:w-48 flex-shrink-0">
          <MapLegend className="w-full" />

          {/* Quick stats */}
          <div className="mt-3 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Quick Stats</div>
            {zones.slice(0, 4).map((z) => {
              const config = STADIUM_ZONES.find((s) => s.id === z.id);
              const color = getDensityColor(z.current_density);
              return (
                <div key={z.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[9px] text-zinc-500 flex-1 truncate">{config?.shortName || z.name}</span>
                  <span className="text-[9px] font-mono" style={{ color }}>{(z.current_density * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Role-specific hint bar ── */}
      <div className="text-[10px] text-zinc-600 text-center">
        {role === "fan" && "Tap a zone to see wait times, facilities and navigation help."}
        {role === "volunteer" && "Your assigned zones are highlighted. Tap to view help requests and tasks."}
        {role === "security" && "Crowd alerts and restricted zones are shown. Tap for incident details."}
        {role === "organizer" && "Full stadium overview with AI recommendations. All zones are visible."}
        {role === "venue_staff" && "Tap zones to view maintenance requests and utility status."}
      </div>
    </div>
  );
};
