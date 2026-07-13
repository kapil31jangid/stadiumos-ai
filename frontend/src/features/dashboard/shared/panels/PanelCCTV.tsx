"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { MonitorPlay, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PanelCCTV: React.FC = () => {
  const { theme } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MonitorPlay className={`w-6 h-6 ${theme.text}`} /> CCTV Visual Command Centre
        </h2>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold">8 Feeds Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 1, zone: "Gate A — North Entry", status: "CLEAR", density: "32%", alert: false },
          { id: 2, zone: "Gate C — South Entry", status: "BUSY", density: "88%", alert: true },
          { id: 3, zone: "Level 1 Concourse", status: "MODERATE", density: "65%", alert: false },
          { id: 4, zone: "VIP Executive Lounge", status: "CLEAR", density: "12%", alert: false },
        ].map((cam) => (
          <div key={cam.id} className={`aspect-video bg-zinc-950 border rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:border-zinc-600 ${
            cam.alert ? "border-red-500/40" : "border-zinc-800"
          }`}>
            {/* Simulated camera grid overlay */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "30px 30px" }}
            />
            {cam.alert && (
              <div className="absolute inset-0 bg-red-900/10 animate-pulse" />
            )}
            
            {/* Zone silhouette indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center opacity-20">
                <Users className="w-12 h-12 mx-auto mb-2 text-zinc-400" />
                <div className="text-[10px] text-zinc-400 font-mono">{cam.zone}</div>
              </div>
            </div>
            
            {/* Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] uppercase font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
            </div>
            <div className="absolute top-3 right-3 text-[9px] text-zinc-500 font-mono bg-black/50 px-2 py-0.5 rounded">
              CAM-{String(cam.id).padStart(2, "0")}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-zinc-200">{cam.zone}</div>
                  <div className="text-[9px] text-zinc-500 font-mono">Density: {cam.density}</div>
                </div>
                <Badge variant="outline" className={`text-[9px] uppercase ${
                  cam.alert ? "border-red-500/40 text-red-400" :
                  cam.status === "MODERATE" ? "border-yellow-500/40 text-yellow-400" :
                  "border-green-500/40 text-green-400"
                }`}>{cam.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["East Stairwell", "West Exit Ramp", "Medical Bay", "Press Area"].map((label, i) => (
          <div key={i} className="aspect-video bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] text-zinc-600 font-mono text-center">{label}</span>
            </div>
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[8px] text-green-400 bg-green-500/10 px-1 py-0.5 rounded">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> LIVE
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
