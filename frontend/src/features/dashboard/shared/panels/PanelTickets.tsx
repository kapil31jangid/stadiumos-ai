"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Sliders } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PanelTickets: React.FC = () => {
  const { theme } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Sliders className={`w-6 h-6 ${theme.text}`} /> My Match Tickets & Digital Pass
      </h2>
      
      {/* Primary ticket card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-700/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">Digital Pass</span>
              <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> VALID
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">Argentina vs France</div>
              <div className="text-sm text-zinc-400 mt-1">FIFA World Cup 2026 · Group Stage · Match 42</div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { label: "Section", value: "204" },
                { label: "Row", value: "G" },
                { label: "Seat", value: "14" },
              ].map((f, i) => (
                <div key={i}>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">{f.label}</div>
                  <div className="text-lg font-extrabold text-white">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="border-purple-500/20 text-purple-400 text-[10px]">VIP Access</Badge>
              <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-[10px]">Wheelchair Zone</Badge>
              <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 text-[10px]">Entry: Gate C</Badge>
            </div>
          </div>
          {/* SVG QR Code */}
          <div className="shrink-0">
            <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-xl">
              <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="21" height="21" fill="white"/>
                {/* QR finder patterns */}
                <rect x="0" y="0" width="7" height="7" fill="black"/>
                <rect x="1" y="1" width="5" height="5" fill="white"/>
                <rect x="2" y="2" width="3" height="3" fill="black"/>
                <rect x="14" y="0" width="7" height="7" fill="black"/>
                <rect x="15" y="1" width="5" height="5" fill="white"/>
                <rect x="16" y="2" width="3" height="3" fill="black"/>
                <rect x="0" y="14" width="7" height="7" fill="black"/>
                <rect x="1" y="15" width="5" height="5" fill="white"/>
                <rect x="2" y="16" width="3" height="3" fill="black"/>
                {/* Data modules */}
                {[
                  [8,0],[9,0],[10,0],[11,0],[12,0],
                  [8,2],[10,2],[12,2],
                  [9,4],[11,4],
                  [8,6],[10,6],[11,6],
                  [0,8],[2,8],[4,8],[6,8],[8,8],[9,8],[11,8],[13,8],[14,8],[16,8],[18,8],[20,8],
                  [9,10],[10,10],[12,10],[14,10],[16,10],[18,10],
                  [8,12],[11,12],[13,12],[15,12],[17,12],[19,12],
                  [9,14],[10,14],[12,14],[14,14],[16,14],[18,14],[20,14],
                  [8,16],[9,16],[11,16],[13,16],[15,16],[17,16],[19,16],
                  [9,18],[11,18],[12,18],[14,18],[16,18],[18,18],[20,18],
                  [8,20],[10,20],[11,20],[13,20],[15,20],[17,20],[19,20],
                ].map(([cx, cy], i) => (
                  <rect key={i} x={cx} y={cy} width="1" height="1" fill="black"/>
                ))}
              </svg>
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">SCAN TO ENTER</p>
          </div>
        </div>
      </div>

      {/* Match info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Kick-off", value: "19:00 UTC", icon: "⏱️" },
          { label: "Stadium", value: "MetLife Stadium", icon: "🏟️" },
          { label: "Gate Opens", value: "16:00 UTC", icon: "🚪" },
          { label: "Parking", value: "Lot C — Zone 4", icon: "🅿️" },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
            <div className="text-sm font-bold text-white mt-0.5">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
