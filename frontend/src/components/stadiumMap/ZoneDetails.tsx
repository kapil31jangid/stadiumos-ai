"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, Clock, Zap, MapPin,
  Heart, Train, Bot, ChevronRight, Shield, Wrench
} from "lucide-react";
import { StadiumZoneConfig, getDensityColor, getDensityLabel, getRiskLevel, ZONE_CATEGORY_STYLES } from "./stadiumData";
import { Zone, MatchPhase } from "@/features/dashboard/shared/DashboardContext";

interface ZoneDetailsProps {
  zone: StadiumZoneConfig | null;
  liveZone: Zone | undefined;
  role: string;
  matchPhase: MatchPhase;
  incidents: { type: string; location: string; severity: string }[];
  onClose: () => void;
  onAIChat: () => void;
}

const RISK_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  low:      { bg: "bg-green-950/60 border-green-500/30",  text: "text-green-400",  label: "Low Risk" },
  moderate: { bg: "bg-yellow-950/60 border-yellow-500/30", text: "text-yellow-400", label: "Moderate" },
  high:     { bg: "bg-orange-950/60 border-orange-500/30", text: "text-orange-400", label: "High Risk" },
  critical: { bg: "bg-red-950/60 border-red-500/30",       text: "text-red-400",    label: "Critical" },
};

const SEV_COLORS: Record<string, string> = {
  Low: "text-green-400", Medium: "text-yellow-400", High: "text-orange-400", Critical: "text-red-400"
};

export const ZoneDetails: React.FC<ZoneDetailsProps> = ({
  zone, liveZone, role, matchPhase, incidents, onClose, onAIChat
}) => {
  if (!zone) return null;

  const density = liveZone?.current_density ?? 0.3;
  const occupancy = Math.round(density * zone.capacity);
  const riskLevel = getRiskLevel(density);
  const riskStyle = RISK_BADGE[riskLevel];
  const densityColor = getDensityColor(density);
  const catStyle = ZONE_CATEGORY_STYLES[zone.category];
  const aiRec = zone.aiRecommendations[matchPhase] ?? "No recommendation available.";

  // Zone-specific incidents
  const zoneIncidents = incidents.filter(inc =>
    inc.location.toLowerCase().includes(zone.shortName.toLowerCase()) ||
    inc.location.toLowerCase().includes(zone.name.toLowerCase().split(" ")[0])
  );

  // Estimate queue time from density (rough heuristic)
  const queueMin = zone.category === "gate"
    ? Math.round(density * 20)
    : zone.category === "food"
    ? Math.round(density * 30)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        key={zone.id}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-0 right-0 h-full w-[320px] bg-zinc-950/95 border-l border-zinc-800 flex flex-col z-20 overflow-y-auto rounded-r-3xl"
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-start justify-between flex-shrink-0"
          style={{ borderTopColor: densityColor, borderTopWidth: 2 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ background: catStyle.baseFill, border: `1px solid ${catStyle.stroke}40` }}
            >
              {catStyle.icon}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{catStyle.label}</div>
              <div className="text-sm font-bold text-white leading-tight">{zone.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors ml-2 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">

          {/* ── Occupancy Block ── */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Live Occupancy</div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold" style={{ color: densityColor }}>
                  {(density * 100).toFixed(0)}
                </span>
                <span className="text-sm text-zinc-500 ml-1">%</span>
              </div>
              <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${riskStyle.bg} ${riskStyle.text}`}>
                {riskStyle.label}
              </div>
            </div>
            {/* Bar */}
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: densityColor, width: `${density * 100}%` }}
                layout
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>{occupancy.toLocaleString()} / {zone.capacity.toLocaleString()} pax</span>
              <span>{getDensityLabel(density)}</span>
            </div>
          </div>

          {/* ── Queue Time ── */}
          {(zone.category === "gate" || zone.category === "food") && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                <div className="text-[9px] font-bold uppercase text-zinc-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Queue Time
                </div>
                <div className="text-lg font-extrabold text-white mt-1">{queueMin}<span className="text-xs text-zinc-500 ml-1">min</span></div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                <div className="text-[9px] font-bold uppercase text-zinc-600 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Volunteers
                </div>
                <div className="text-lg font-extrabold text-white mt-1">{zone.defaultVolunteers}</div>
              </div>
            </div>
          )}

          {/* ── AI Recommendation ── */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">AI Recommendation</span>
              <span className="text-[8px] font-mono text-zinc-600 ml-auto">{matchPhase.replace("_", " ")}</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">{aiRec}</p>
            <button
              onClick={onAIChat}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/20 rounded-xl text-[10px] font-bold text-purple-400 transition-colors"
            >
              <Bot className="w-3 h-3" /> Ask AI for more details <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
          </div>

          {/* ── Facilities ── */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> Facilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {zone.facilities.map((f, i) => (
                <span key={i} className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* ── Transport ── */}
          {zone.transport.length > 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                <Train className="w-3 h-3" /> Transport Access
              </div>
              {zone.transport.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400 py-1">
                  <div className="w-1 h-1 rounded-full bg-teal-400" />
                  {t}
                </div>
              ))}
            </div>
          )}

          {/* ── Medical ── */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" /> Nearest Medical Team
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-300">Medical Centre</span>
              <span className="text-[10px] font-bold text-red-400">
                {zone.medicalAccessSecs === 0 ? "On-site" : `~${Math.ceil(zone.medicalAccessSecs / 60)} min walk`}
              </span>
            </div>
          </div>

          {/* ── Incidents (security/organizer only) ── */}
          {(role === "security" || role === "organizer") && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-400" /> Active Incidents
              </div>
              {zoneIncidents.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">No active incidents in this zone.</p>
              ) : (
                <div className="space-y-1.5">
                  {zoneIncidents.map((inc, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1.5">
                      <span className="text-zinc-300">{inc.type}</span>
                      <span className={`font-bold ${SEV_COLORS[inc.severity] || "text-zinc-400"}`}>{inc.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Navigate CTA (fan only) ── */}
          {role === "fan" && (
            <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Navigation
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">Get directions to this location from your current position.</p>
              <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl transition-colors flex items-center justify-center gap-1.5">
                <MapPin className="w-3 h-3" /> Navigate Here
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
