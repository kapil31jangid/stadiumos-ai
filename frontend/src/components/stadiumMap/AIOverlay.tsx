"use client";

import React from "react";
import { motion } from "framer-motion";
import { MatchPhase, Zone } from "@/features/dashboard/shared/DashboardContext";

interface AIOverlayProps {
  matchPhase: MatchPhase;
  zones: Zone[];
  visible: boolean;
}

interface AIMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  pulse: boolean;
  icon: string;
}

// Generate AI recommendation markers based on match phase and live zone data
const getAIMarkers = (matchPhase: MatchPhase, zones: Zone[]): AIMarker[] => {
  const markers: AIMarker[] = [];

  // Zone-density-driven markers
  zones.forEach((z) => {
    if (z.current_density > 0.85) {
      const positions: Record<string, { x: number; y: number }> = {
        gate_a: { x: 820, y: 300 },
        gate_b: { x: 155, y: 300 },
        gate_c: { x: 500, y: 68 },
        gate_d: { x: 500, y: 616 },
        food_court: { x: 700, y: 178 },
        concourse_1: { x: 720, y: 350 },
        vip_lounge: { x: 275, y: 178 },
      };
      const pos = positions[z.id];
      if (pos) {
        markers.push({
          id: `crowd_${z.id}`,
          x: pos.x,
          y: pos.y,
          label: `Crowd Alert`,
          color: "#ef4444",
          pulse: true,
          icon: "⚠️",
        });
      }
    }
  });

  // Phase-specific AI advisories
  const phaseMarkers: Record<MatchPhase, AIMarker[]> = {
    PRE_MATCH: [
      { id: "ai_gate_redirect", x: 155, y: 295, label: "Open overflow →  Gate D", color: "#f97316", pulse: true, icon: "→" },
      { id: "ai_metro",         x: 878, y: 530, label: "Metro On-Time ✓", color: "#22c55e", pulse: false, icon: "🚇" },
    ],
    FIRST_HALF: [
      { id: "ai_food_prep",     x: 700, y: 178, label: "Prepare for Halftime", color: "#eab308", pulse: false, icon: "🍔" },
      { id: "ai_security_ok",   x: 500, y: 190, label: "All Zones Clear",       color: "#22c55e", pulse: false, icon: "✓" },
    ],
    HALFTIME: [
      { id: "ai_food_critical", x: 700, y: 175, label: "Food Court Critical!",  color: "#ef4444", pulse: true, icon: "🚨" },
      { id: "ai_restroom_surge",x: 500, y: 140, label: "WC Queue Surge",        color: "#f97316", pulse: true, icon: "⚠️" },
      { id: "ai_vol_deploy",    x: 500, y: 350, label: "Deploy 6 Volunteers",   color: "#a855f7", pulse: false, icon: "🙋" },
    ],
    SECOND_HALF: [
      { id: "ai_normalising",   x: 500, y: 350, label: "Normalising",           color: "#22c55e", pulse: false, icon: "✓" },
      { id: "ai_parking_full",  x: 120, y: 545, label: "Parking Full",          color: "#ef4444", pulse: true, icon: "🅿️" },
    ],
    POST_MATCH: [
      { id: "ai_exit_surge_a",  x: 820, y: 338, label: "Exit Surge!",           color: "#ef4444", pulse: true, icon: "🚨" },
      { id: "ai_exit_surge_b",  x: 155, y: 338, label: "Exit Surge!",           color: "#ef4444", pulse: true, icon: "🚨" },
      { id: "ai_metro_rec",     x: 878, y: 510, label: "Use Metro ↑",           color: "#14b8a6", pulse: true, icon: "🚇" },
      { id: "ai_med_standby",   x: 700, y: 430, label: "Medical Standby",       color: "#f97316", pulse: false, icon: "🏥" },
    ],
  };

  // Deduplicate markers by id (zone-based vs phase-based might overlap)
  const allMarkers = [...markers, ...(phaseMarkers[matchPhase] || [])];
  const seen = new Set<string>();
  return allMarkers.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
};

export const AIOverlay: React.FC<AIOverlayProps> = ({ matchPhase, zones, visible }) => {
  if (!visible) return null;

  const markers = getAIMarkers(matchPhase, zones);

  return (
    <g aria-label="AI recommendation overlay">
      {markers.map((marker, i) => (
        <motion.g
          key={marker.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          {/* Pulse ring */}
          {marker.pulse && (
            <>
              <circle cx={marker.x} cy={marker.y} r="14" fill={marker.color} opacity="0.12">
                <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.12;0;0.12" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={marker.x} cy={marker.y} r="9" fill={marker.color} opacity="0.25">
                <animate attributeName="r" values="9;14;9" dur="2s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite" begin="0.5s" />
              </circle>
            </>
          )}
          {/* Icon dot */}
          <circle cx={marker.x} cy={marker.y} r="7" fill={marker.color} />
          {/* Label pill */}
          <rect
            x={marker.x + 10}
            y={marker.y - 10}
            width={marker.label.length * 6.2 + 10}
            height="18"
            rx="5"
            fill="#09090b"
            stroke={marker.color}
            strokeWidth="0.8"
            opacity="0.9"
          />
          <text
            x={marker.x + 15}
            y={marker.y + 3}
            fill={marker.color}
            fontSize="8"
            fontWeight="700"
            fontFamily="monospace"
          >
            {marker.label}
          </text>
        </motion.g>
      ))}
    </g>
  );
};
