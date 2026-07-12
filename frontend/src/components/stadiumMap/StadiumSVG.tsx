"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  StadiumZoneConfig, 
  ZONE_CATEGORY_STYLES, 
  getDensityColor 
} from "./stadiumData";
import { AIOverlay } from "./AIOverlay";
import { Zone, MatchPhase } from "@/features/dashboard/shared/DashboardContext";

// ─── StadiumZone — individual SVG zone renderer ───────────────────────────────
interface StadiumZoneProps {
  config: StadiumZoneConfig;
  liveZone?: Zone;
  isSelected: boolean;
  isHighlighted: boolean; // from search
  isDimmed: boolean;     // filter active but zone doesn't match
  onClick: () => void;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
}

const StadiumZone: React.FC<StadiumZoneProps> = ({
  config, liveZone, isSelected, isHighlighted, isDimmed, onClick, onHover, hoveredId
}) => {
  const density = liveZone?.current_density ?? 0.3;
  const densityColor = getDensityColor(density);
  const catStyle = ZONE_CATEGORY_STYLES[config.category];
  const isHovered = hoveredId === config.id;
  const isActive = isSelected || isHovered;

  // Special handling for non-interactive zones
  const isDecorative = config.category === "pitch" || config.category === "seating";

  // Compute fill: blend category base with density overlay
  const fillOpacity = isDecorative ? 1 : isDimmed ? 0.15 : isActive ? 0.65 : 0.4;
  const strokeWidth = isSelected ? 2 : isHighlighted ? 1.5 : isActive ? 1.5 : 1;
  const strokeOpacity = isDimmed ? 0.2 : 1;

  const commonProps = {
    fill: isDecorative ? catStyle.baseFill : densityColor,
    fillOpacity,
    stroke: isHighlighted ? "#ffffff" : isSelected ? "#ffffff" : catStyle.stroke,
    strokeWidth,
    strokeOpacity,
    onClick: isDecorative ? undefined : onClick,
    onMouseEnter: isDecorative ? undefined : () => onHover(config.id),
    onMouseLeave: isDecorative ? undefined : () => onHover(null),
    style: { cursor: isDecorative ? "default" : "pointer", transition: "fill-opacity 0.3s, stroke-width 0.2s" },
    role: isDecorative ? undefined : "button",
    "aria-label": `${config.name} — ${(density * 100).toFixed(0)}% occupancy`,
    tabIndex: isDecorative ? undefined : 0,
    onKeyDown: isDecorative ? undefined : (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onClick(); },
  };

  const g = config.geometry;

  return (
    <g>
      {/* Selection glow */}
      {isSelected && !isDecorative && (
        <motion.circle
          cx={config.labelX}
          cy={config.labelY}
          r={50}
          fill={densityColor}
          fillOpacity={0.08}
          initial={{ r: 30, opacity: 0 }}
          animate={{ r: 50, opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Zone shape */}
      {config.svgType === "ellipse" && (
        <ellipse
          cx={g.cx as number}
          cy={g.cy as number}
          rx={g.rx as number}
          ry={g.ry as number}
          {...commonProps}
        />
      )}
      {config.svgType === "rect" && (
        <rect
          x={g.x as number}
          y={g.y as number}
          width={g.width as number}
          height={g.height as number}
          rx={g.rx as number}
          {...commonProps}
        />
      )}

      {/* Density heat overlay (not for decorative) */}
      {!isDecorative && (
        config.svgType === "rect" ? (
          <rect
            x={(g.x as number) + 2}
            y={(g.y as number) + 2}
            width={(g.width as number) - 4}
            height={(g.height as number) - 4}
            rx={(g.rx as number) - 2}
            fill={densityColor}
            fillOpacity={isDimmed ? 0 : density * 0.18}
            style={{ pointerEvents: "none", transition: "fill-opacity 0.4s" }}
          />
        ) : (
          <ellipse
            cx={g.cx as number}
            cy={g.cy as number}
            rx={(g.rx as number) - 4}
            ry={(g.ry as number) - 4}
            fill={densityColor}
            fillOpacity={isDimmed ? 0 : density * 0.12}
            style={{ pointerEvents: "none", transition: "fill-opacity 0.4s" }}
          />
        )
      )}

      {/* Zone icon */}
      {!isDecorative && (
        <text
          x={config.labelX}
          y={config.labelY - 4}
          textAnchor="middle"
          fontSize={isActive ? "13" : "11"}
          style={{ pointerEvents: "none", transition: "font-size 0.15s", userSelect: "none" }}
        >
          {catStyle.icon}
        </text>
      )}

      {/* Zone label */}
      {!isDecorative && (
        <text
          x={config.labelX}
          y={config.labelY + 12}
          textAnchor="middle"
          fill={isDimmed ? "#3f3f46" : isActive ? "#ffffff" : "#a1a1aa"}
          fontSize={isActive ? "8.5" : "7.5"}
          fontWeight={isActive ? "700" : "500"}
          style={{ pointerEvents: "none", transition: "fill 0.2s, font-size 0.15s", userSelect: "none" }}
        >
          {config.shortName}
        </text>
      )}

      {/* Pitch label */}
      {config.category === "pitch" && (
        <>
          {/* Center circle */}
          <circle cx={500} cy={350} r={40} fill="none" stroke="#166534" strokeWidth="1" strokeOpacity="0.5" />
          {/* Center spot */}
          <circle cx={500} cy={350} r={3} fill="#166534" fillOpacity="0.6" />
          {/* Halfway line */}
          <line x1={500} y1={242} x2={500} y2={458} stroke="#166534" strokeWidth="0.8" strokeOpacity="0.4" />
          {/* Goal areas */}
          <rect x={310} y={310} width={40} height={80} fill="none" stroke="#166534" strokeWidth="0.6" strokeOpacity="0.4" />
          <rect x={650} y={310} width={40} height={80} fill="none" stroke="#166534" strokeWidth="0.6" strokeOpacity="0.4" />
          <text x={500} y={357} textAnchor="middle" fill="#166534" fontSize="9" fontWeight="600" fillOpacity="0.6" style={{ userSelect: "none" }}>PITCH</text>
        </>
      )}

      {/* Density % badge (shown for active zones) */}
      {!isDecorative && isActive && (
        <g>
          <rect
            x={config.labelX - 15}
            y={config.labelY + 16}
            width={30}
            height={13}
            rx={4}
            fill={densityColor}
            fillOpacity={0.9}
          />
          <text
            x={config.labelX}
            y={config.labelY + 25.5}
            textAnchor="middle"
            fill="#000"
            fontSize="7"
            fontWeight="800"
            style={{ userSelect: "none" }}
          >
            {(density * 100).toFixed(0)}%
          </text>
        </g>
      )}
    </g>
  );
};

interface StadiumSVGProps {
  visibleZones: StadiumZoneConfig[];
  getLiveZone: (id: string) => Zone | undefined;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  hoveredZoneId: string | null;
  setHoveredZoneId: (id: string | null) => void;
  isHighlighted: (zone: StadiumZoneConfig) => boolean;
  isDimmed: (zone: StadiumZoneConfig) => boolean;
  showAIOverlay: boolean;
  matchPhase: MatchPhase;
  zones: Zone[];
}

export const StadiumSVG: React.FC<StadiumSVGProps> = ({
  visibleZones,
  getLiveZone,
  selectedZoneId,
  setSelectedZoneId,
  hoveredZoneId,
  setHoveredZoneId,
  isHighlighted,
  isDimmed,
  showAIOverlay,
  matchPhase,
  zones
}) => {
  return (
    <svg
      viewBox="0 0 1000 700"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Interactive Stadium Operations Map"
      role="application"
    >
      <defs>
        {/* Gradient definitions for outer ring */}
        <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e2030" stopOpacity="0" />
          <stop offset="100%" stopColor="#0d0f14" stopOpacity="1" />
        </radialGradient>

        {/* Clip path for map bounds */}
        <clipPath id="mapBounds">
          <rect x="0" y="0" width="1000" height="700" />
        </clipPath>

        {/* Glow filter for selected zones */}
        <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Outer stadium ring ── */}
      <ellipse
        cx={500} cy={350} rx={390} ry={285}
        fill="#0d0f14"
        stroke="#27272a"
        strokeWidth="2"
        strokeDasharray="12 6"
      />

      {/* ── Zones rendering — ordered: background first ── */}
      {/* 1. Concourse (largest ellipse, drawn before seating) */}
      {visibleZones
        .filter((z) => z.id === "concourse_1")
        .map((z) => (
          <StadiumZone
            key={z.id}
            config={z}
            liveZone={getLiveZone(z.id)}
            isSelected={selectedZoneId === z.id}
            isHighlighted={isHighlighted(z)}
            isDimmed={isDimmed(z)}
            onClick={() => setSelectedZoneId(z.id === selectedZoneId ? null : z.id)}
            onHover={setHoveredZoneId}
            hoveredId={hoveredZoneId}
          />
        ))}

      {/* 2. Seating bowl */}
      {visibleZones
        .filter((z) => z.id === "seating_bowl")
        .map((z) => (
          <StadiumZone
            key={z.id}
            config={z}
            liveZone={getLiveZone(z.id)}
            isSelected={selectedZoneId === z.id}
            isHighlighted={isHighlighted(z)}
            isDimmed={isDimmed(z)}
            onClick={() => setSelectedZoneId(z.id === selectedZoneId ? null : z.id)}
            onHover={setHoveredZoneId}
            hoveredId={hoveredZoneId}
          />
        ))}

      {/* 3. Pitch */}
      {visibleZones
        .filter((z) => z.id === "pitch")
        .map((z) => (
          <StadiumZone
            key={z.id}
            config={z}
            liveZone={undefined}
            isSelected={false}
            isHighlighted={false}
            isDimmed={false}
            onClick={() => {}}
            onHover={() => {}}
            hoveredId={null}
          />
        ))}

      {/* 4. All remaining zones */}
      {visibleZones
        .filter((z) => !["concourse_1", "seating_bowl", "pitch"].includes(z.id))
        .map((z) => (
          <StadiumZone
            key={z.id}
            config={z}
            liveZone={getLiveZone(z.id)}
            isSelected={selectedZoneId === z.id}
            isHighlighted={isHighlighted(z)}
            isDimmed={isDimmed(z)}
            onClick={() => setSelectedZoneId(z.id === selectedZoneId ? null : z.id)}
            onHover={setHoveredZoneId}
            hoveredId={hoveredZoneId}
          />
        ))}

      {/* ── AI Overlay ── */}
      <AnimatePresence>
        {showAIOverlay && (
          <AIOverlay
            matchPhase={matchPhase}
            zones={zones}
            visible={showAIOverlay}
          />
        )}
      </AnimatePresence>

      {/* ── Compass Rose ── */}
      <g transform="translate(950, 640)">
        <circle cx="0" cy="0" r="14" fill="#09090b" stroke="#27272a" strokeWidth="1" />
        <text x="0" y="-5" textAnchor="middle" fill="#52525b" fontSize="6" fontWeight="700">N</text>
        <text x="0" y="10" textAnchor="middle" fill="#52525b" fontSize="6">S</text>
        <text x="-8" y="3" textAnchor="middle" fill="#52525b" fontSize="6">W</text>
        <text x="8" y="3" textAnchor="middle" fill="#52525b" fontSize="6">E</text>
        <line x1="0" y1="-3" x2="0" y2="-10" stroke="#52525b" strokeWidth="1" />
      </g>

      {/* ── Phase label ── */}
      <g>
        <rect x="10" y="10" width={matchPhase.replace("_", " ").length * 7 + 20} height="20" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
        <text x="20" y="24" fill="#a1a1aa" fontSize="8" fontWeight="700">
          {matchPhase.replace("_", " ")}
        </text>
      </g>
    </svg>
  );
};
