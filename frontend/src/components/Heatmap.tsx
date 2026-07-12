"use client";

/**
 * Heatmap.tsx — Re-exports the new StadiumMap component.
 * 
 * The previous implementation (simple colored dots) has been replaced by the 
 * full interactive Stadium Operations Map. This file maintains the existing 
 * import path <@/components/Heatmap> used in DashboardLayout.
 */

import React from "react";
import { StadiumMap } from "./stadiumMap/StadiumMap";
import { Zone } from "@/features/dashboard/shared/DashboardContext";

// Legacy props interface kept for backward compat (zones not used by new map)
interface HeatmapProps {
  zones?: Zone[];
}

export const Heatmap: React.FC<HeatmapProps> = () => {
  return <StadiumMap />;
};
