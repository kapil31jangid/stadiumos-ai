"use client";

import React from "react";
import { useDashboard } from "../../shared/DashboardContext";
import { SharedWidget } from "../../shared/SharedWidget";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CrowdWidget: React.FC = () => {
  const { metrics } = useDashboard();

  return (
    <SharedWidget title="Current Crowd" icon={Users} badge="Live telemetry">
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Average Stadium Occupancy</span>
            <div className="text-3xl font-extrabold text-white mt-1">{(metrics.avgOccupancy * 100).toFixed(0)}%</div>
          </div>
          <Badge variant="outline" className={`${
            metrics.avgOccupancy > 0.8 ? "border-red-500/20 text-red-400" :
            metrics.avgOccupancy > 0.5 ? "border-yellow-500/20 text-yellow-400" :
            "border-emerald-500/20 text-emerald-400"
          } font-mono`}>
            {metrics.avgOccupancy > 0.8 ? "Critical Peak" : metrics.avgOccupancy > 0.5 ? "Heavy Flow" : "Normal Flow"}
          </Badge>
        </div>
        <div className="text-[11px] text-zinc-400 leading-relaxed">
          Crowd densities are active. Total of {metrics.totalZones} zones reporting real-time ticket flow rates.
        </div>
      </div>
    </SharedWidget>
  );
};
