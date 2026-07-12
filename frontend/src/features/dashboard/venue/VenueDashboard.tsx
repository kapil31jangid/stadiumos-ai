"use client";

import React from "react";
import { useDashboard } from "../shared/DashboardContext";
import { SharedWidget } from "../shared/SharedWidget";
import { 
  Wrench, 
  Flame, 
  Bot, 
  Activity, 
  Clock, 
  Map, 
  Users 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SVGChart } from "@/components/SVGChart";

export const VenueDashboard: React.FC = () => {
  const {
    sustainabilityTips,
    maintenanceTasks,
    theme,
    setActiveTab,
    metrics,
    chartHistory
  } = useDashboard();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Facilities Quick Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: "Facilities Health Index", 
            value: `${(99.2 - metrics.criticalZones * 1.5).toFixed(1)}%`, 
            status: metrics.criticalZones > 0 ? "Advisory Action Needed" : "Optimal Health" 
          },
          { 
            label: "Water Flow Rate", 
            value: `${Math.round(20 + metrics.avgOccupancy * 32)} L/m`, 
            status: "Normal Range" 
          },
          { 
            label: "Power Usage Status", 
            value: `${chartHistory.energy[chartHistory.energy.length - 1]} kW`, 
            status: "Power Save mode active" 
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">{item.label}</span>
            <div className="text-2xl font-extrabold text-white">
              {item.value}
            </div>
            <span className={`text-[9px] font-bold block mt-1.5 uppercase tracking-wide ${
              idx === 0 && metrics.criticalZones > 0 ? "text-yellow-400" : "text-green-400"
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* SVG Energy Grid Load trend chart */}
      <div className="grid grid-cols-1 gap-6">
        <SVGChart
          title="Stadium Power Grid Load & Solar Intake Trend"
          data={chartHistory.energy}
          labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
          color="#f97316"
          unit=" kW"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Maintenance Requests */}
        <SharedWidget title="Active Maintenance Requests" icon={Wrench} badge="2 Active">
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
              <div className="flex justify-between items-center font-bold">
                <span>Broken Chair Section 204</span>
                <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px]">CRITICAL</Badge>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Reported by Vol_14 • Assigned to Crew A</p>
            </div>
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
              <div className="flex justify-between items-center font-bold">
                <span>Water Leak Restroom Sec 108</span>
                <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 text-[8px]">MEDIUM</Badge>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Reported by Security Officer • Crew B dispatched</p>
            </div>
          </div>
        </SharedWidget>

        {/* 2. Cleaning Status */}
        <SharedWidget title="Cleanliness Index" icon={Activity}>
          <div className="space-y-2.5 text-xs">
            {[
              { zone: "Level 1 Concourse", grade: "Grade A", status: "Optimal" },
              { zone: "Central Food Court", grade: "Grade B+", status: "Heavy traffic" },
              { zone: "Plaza Entrances", grade: "Grade A", status: "Swept 15m ago" },
            ].map((z, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                <span>{z.zone}</span>
                <div className="text-right">
                  <span className="font-bold text-white block">{z.grade}</span>
                  <span className="text-[8px] text-zinc-500 uppercase">{z.status}</span>
                </div>
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 3. Water Usage */}
        <SharedWidget title="Water System Status" icon={Flame} badge="Utilities">
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Main Line Water Flow</span>
              <span className="font-mono font-bold text-green-400">42 L/m (Normal)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Restrooms Pressure</span>
              <span className="font-mono font-bold text-green-400">3.2 Bar (Stable)</span>
            </div>
          </div>
        </SharedWidget>

        {/* 4. Power Usage */}
        <SharedWidget title="Energy Power Grid" icon={Flame}>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Primary Stadium Load</span>
              <span className="font-mono font-bold text-zinc-300">380 kW (Save Mode)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Pitch Lighting Load</span>
              <span className="font-mono font-bold text-zinc-300">120 kW (Eco-led)</span>
            </div>
          </div>
        </SharedWidget>

        {/* 5. HVAC Status */}
        <SharedWidget title="HVAC Cooling grid" icon={Flame}>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Overall Compressor load</span>
              <span className="font-mono font-bold text-yellow-500">68% Capacity</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Zone B Air Exchange</span>
              <span className="font-mono font-bold text-red-400">Peak cooling active</span>
            </div>
          </div>
        </SharedWidget>

        {/* 6. Facility Health */}
        <SharedWidget title="Structural System Health" icon={Activity} badge="98% score">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Access Turnstiles:</span>
              <span className="font-bold text-green-400">96.4% Operational</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Passenger Elevators:</span>
              <span className="font-bold text-green-400">100% Operational</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Concourse Escalators:</span>
              <span className="font-bold text-yellow-500">98% Operational</span>
            </div>
          </div>
        </SharedWidget>

        {/* 7. Repair Queue */}
        <SharedWidget title="Maintenance Repair Queue" icon={Clock}>
          <div className="space-y-2 text-xs">
            {[
              "Service Gate B turnstile bearings (Priority High - Halftime schedule).",
              "Calibrate water pressure regulators restroom section 204.",
              "Inspect elevator cabin vibration profiles in Section 102."
            ].map((task, idx) => (
              <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300">
                🔧 {task}
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 8. Equipment Status */}
        <SharedWidget title="Equipment Load Grades" icon={Wrench}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Elevator VIP Cabin A</span>
              <Badge variant="outline" className="border-green-500/20 text-green-400 font-mono">NORMAL</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Escalator West Gate</span>
              <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 font-mono">VIBRATION</Badge>
            </div>
          </div>
        </SharedWidget>

        {/* 9. AI Maintenance Suggestions */}
        <SharedWidget title="AI Preventative Maintenance" icon={Bot}>
          <div className="space-y-3">
            <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-2xl text-[11px] text-zinc-400 leading-relaxed space-y-2">
              <strong className={`${theme.text} block mb-0.5`}>Gemini Maintenance Alert:</strong>
              {maintenanceTasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-[10px] text-zinc-300 mt-0.5">•</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab("ai_assistant")}
              className={`w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${theme.text} text-[11px]`}
            >
              <Bot className="w-4 h-4" /> Recommend maintenance actions
            </button>
          </div>
        </SharedWidget>

      </div>
    </div>
  );
};
