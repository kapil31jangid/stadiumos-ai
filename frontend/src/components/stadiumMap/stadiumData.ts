// Stadium Map Data — Separate from rendering logic
// Canonical SVG geometry + operational data for every zone

export type ZoneCategory =
  | "gate"
  | "concourse"
  | "food"
  | "vip"
  | "medical"
  | "restroom"
  | "parking"
  | "metro"
  | "pitch"
  | "seating"
  | "emergency"
  | "media";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface StadiumZoneConfig {
  id: string;
  name: string;
  shortName: string;
  category: ZoneCategory;
  capacity: number;
  svgType: "ellipse" | "rect" | "polygon";
  geometry: Record<string, number | string>;
  labelX: number;
  labelY: number;
  visibleTo: string[];
  facilities: string[];
  aiRecommendations: Record<string, string>;
  defaultVolunteers: number;
  medicalAccessSecs: number;
  transport: string[];
}

import { STADIUM_ZONES } from "./mapCoordinates";

export { STADIUM_ZONES };

export const ZONE_CATEGORY_STYLES: Record<ZoneCategory, {
  baseFill: string;
  stroke: string;
  icon: string;
  label: string;
}> = {
  gate:      { baseFill: "#0d1f3c", stroke: "#3b82f6", icon: "🚪", label: "Gate" },
  concourse: { baseFill: "#0d1f0d", stroke: "#22c55e", icon: "🏟",  label: "Concourse" },
  food:      { baseFill: "#2a1500", stroke: "#f59e0b", icon: "🍔", label: "Food" },
  vip:       { baseFill: "#150a2e", stroke: "#a855f7", icon: "⭐", label: "VIP" },
  medical:   { baseFill: "#0a0f1e", stroke: "#ef4444", icon: "🏥", label: "Medical" },
  restroom:  { baseFill: "#071520", stroke: "#06b6d4", icon: "🚻", label: "Restroom" },
  parking:   { baseFill: "#131a07", stroke: "#84cc16", icon: "🅿️", label: "Parking" },
  metro:     { baseFill: "#071818", stroke: "#14b8a6", icon: "🚇", label: "Metro" },
  pitch:     { baseFill: "#071a07", stroke: "#166534", icon: "⚽", label: "Pitch" },
  seating:   { baseFill: "#080f08", stroke: "#16a34a", icon: "💺", label: "Seating" },
  emergency: { baseFill: "#1a0808", stroke: "#f97316", icon: "⚡", label: "Emergency" },
  media:     { baseFill: "#1a1807", stroke: "#eab308", icon: "📡", label: "Media" },
};

export const getDensityColor = (density: number): string => {
  if (density >= 0.9) return "#ef4444";
  if (density >= 0.7) return "#f97316";
  if (density >= 0.45) return "#eab308";
  return "#22c55e";
};

export const getDensityLabel = (density: number): string => {
  if (density >= 0.9) return "Critical";
  if (density >= 0.7) return "Busy";
  if (density >= 0.45) return "Moderate";
  return "Low";
};

export const getRiskLevel = (density: number): RiskLevel => {
  if (density >= 0.9) return "critical";
  if (density >= 0.7) return "high";
  if (density >= 0.45) return "moderate";
  return "low";
};
