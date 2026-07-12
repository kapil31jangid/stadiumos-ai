"use client";

import React from "react";
import { useDashboard } from "../shared/DashboardContext";
import { SharedWidget } from "../shared/SharedWidget";
import { 
  Users, 
  Clock, 
  Map, 
  Bell, 
  Bot, 
  Activity, 
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SVGChart } from "@/components/SVGChart";
import { MatchPhase } from "../shared/DashboardContext";

export const OrganizerDashboard: React.FC = () => {
  const {
    metrics,
    zones,
    announcementInputs,
    setAnnouncementInputs,
    handleGenerateAnnouncement,
    isGeneratingAnnouncement,
    generatedAnnouncement,
    theme,
    setActiveTab,
    matchPhase,
    setMatchPhase,
    chartHistory
  } = useDashboard();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 1. Operations Overview (Metrics Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Overall Occupancy", value: `${(metrics.avgOccupancy * 100).toFixed(0)}%`, status: "Optimal" },
          { label: "Reporting Zones", value: metrics.totalZones, status: "All active" },
          { label: "Critical Alerts", value: metrics.criticalZones, status: metrics.criticalZones > 0 ? "Action required" : "Clear" },
          { label: "Staff Status", value: `${Math.round(280 + metrics.avgOccupancy * 60)} On Duty`, status: "92% Attendance" },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">{item.label}</span>
            <div className={`text-2xl font-extrabold ${idx === 2 && metrics.criticalZones > 0 ? "text-red-400" : "text-white"}`}>
              {item.value}
            </div>
            <span className={`text-[9px] font-bold block mt-1.5 uppercase tracking-wide ${
              idx === 2 && metrics.criticalZones > 0 ? "text-red-500 animate-pulse" : "text-zinc-500"
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Simulator Phase Controller (Crucial for live feedback) */}
      <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-zinc-400">Stadium Operational Simulator Control</span>
          <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/20 text-[10px]">Deterministic Mode</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {[
            { id: "PRE_MATCH", label: "Pre-Match (Arrivals)" },
            { id: "FIRST_HALF", label: "1st Half" },
            { id: "HALFTIME", label: "Halftime Interval" },
            { id: "SECOND_HALF", label: "2nd Half" },
            { id: "POST_MATCH", label: "Post-Match (Exits)" }
          ].map((phaseItem) => (
            <button
              key={phaseItem.id}
              onClick={() => setMatchPhase(phaseItem.id as MatchPhase)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                matchPhase === phaseItem.id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-zinc-950 border border-zinc-850 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {phaseItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SVGChart
          title="Volunteer Deployment History Trend"
          data={chartHistory.volunteer}
          labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
          color="#a855f7"
          unit="%"
        />
        <SVGChart
          title="Overall Crowd Density Index Trend"
          data={chartHistory.occupancy}
          labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
          color="#3b82f6"
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 2. Crowd Analytics */}
        <SharedWidget title="Crowd Analytics" icon={Users} badge="Live telemetry">
          <div className="space-y-2 text-xs">
            {zones.map((z) => (
              <div key={z.id} className="flex justify-between items-center p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                <span className="font-bold text-zinc-300">{z.name}</span>
                <span className={`font-mono font-bold ${z.current_density > 0.8 ? "text-red-400" : "text-zinc-400"}`}>
                  {(z.current_density * 100).toFixed(0)}% Cap
                </span>
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 3. Volunteer Status */}
        <SharedWidget title="Volunteer Allocation" icon={Activity}>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Active Volunteers:</span>
              <span className="font-bold text-white">{Math.round(metrics.avgOccupancy * 320)} on field</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Standby / Idle:</span>
              <span className="font-bold text-zinc-400">{Math.round((1 - metrics.avgOccupancy) * 320)} in plaza</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850 flex">
              <div className="bg-purple-500 h-full" style={{ width: `${Math.round(metrics.avgOccupancy * 100)}%` }} />
              <div className="bg-zinc-850 h-full" style={{ width: `${Math.round((1 - metrics.avgOccupancy) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-zinc-500 italic">
              {Math.round(metrics.avgOccupancy * 100)}% volunteer capacity deployed. Shifts scheduled to rotate dynamically.
            </p>
          </div>
        </SharedWidget>

        {/* 4. Transport Status */}
        <SharedWidget title="Transport Logistics" icon={Clock}>
          {(() => {
            const exitDensity = zones.find(z => z.id === "gate_a")?.current_density || 0.3;
            const metroWait = Math.round(5 + exitDensity * 30);
            const shuttleWait = Math.round(2 + exitDensity * 12);
            return (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <span>🚇 Stadium Metro Station</span>
                  <span className={`font-bold ${metroWait > 20 ? "text-red-500" : "text-green-400"}`}>{metroWait}m Wait</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <span>🚌 Shuttle Line C</span>
                  <span className={`font-bold ${shuttleWait > 8 ? "text-yellow-500" : "text-green-400"}`}>{shuttleWait}m Wait</span>
                </div>
              </div>
            );
          })()}
        </SharedWidget>

        {/* 5. Announcements Feed */}
        <SharedWidget title="Public Broadcast Logs" icon={Bell} badge="Broadcasts active">
          <div className="space-y-2 text-[11px] max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
            {generatedAnnouncement ? (
              <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block">Generated Broadcast</span>
                <p className="text-zinc-300 leading-normal">{generatedAnnouncement.public_announcement}</p>
              </div>
            ) : (
              <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-500 text-center">
                No custom alerts broadcasted yet.
              </div>
            )}
          </div>
        </SharedWidget>

        {/* 6. Resource Allocation */}
        <SharedWidget title="Field Resource Distribution" icon={Map}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Gate A Security</span>
              <span className="font-mono font-bold text-zinc-300">45 Officers</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>Concourse B Medical</span>
              <span className="font-mono font-bold text-zinc-300">12 Medics</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>VIP Lounges Staff</span>
              <span className="font-mono font-bold text-zinc-300">18 Hosts</span>
            </div>
          </div>
        </SharedWidget>

        {/* 7. Venue Health */}
        <SharedWidget title="Facilities Utilities Health" icon={Wrench}>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">Power Load</span>
              <div className="text-sm font-bold text-white mt-0.5">380 kW</div>
              <span className="text-[9px] text-green-400 font-mono">NORMAL</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">Water Flow</span>
              <div className="text-sm font-bold text-white mt-0.5">42 L/m</div>
              <span className="text-[9px] text-green-400 font-mono">NORMAL</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">HVAC index</span>
              <div className="text-sm font-bold text-white mt-0.5">Load 68%</div>
              <span className="text-[9px] text-yellow-500 font-mono">HEAVY</span>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">Clean Score</span>
              <div className="text-sm font-bold text-white mt-0.5">Grade A</div>
              <span className="text-[9px] text-green-400 font-mono">OPTIMAL</span>
            </div>
          </div>
        </SharedWidget>

        {/* 8. Event Timeline */}
        <SharedWidget title="Match-Day Timeline" icon={Clock}>
          <div className="relative border-l border-zinc-800 ml-2 space-y-3 pb-1 text-xs">
            {[
              { time: "14:00", title: "Gates Open", desc: "Admission sweep complete." },
              { time: "15:30", title: "Warmups start", desc: "Teams on pitch." },
              { time: "17:00", title: "Kick-off Ceremonies", desc: "Live match start." },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-5">
                <span className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border border-zinc-950" />
                <div className="text-[9px] font-mono text-zinc-500">{item.time}</div>
                <div className="font-bold text-zinc-200">{item.title}</div>
                <div className="text-[9px] text-zinc-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 9. AI Decision Center */}
        <SharedWidget title="AI Decision Command" icon={Bot}>
          <div className="space-y-2 text-xs">
            {[
              { action: "Open Gate C Lanes", reason: "Gate A queue bottleneck warning.", priority: "HIGH" },
              { action: "Deploy Shuttle Service B", reason: "Metro wait times exceeded 18m.", priority: "MEDIUM" }
            ].map((rec, i) => (
              <div key={i} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-purple-400">{rec.action}</span>
                  <Badge variant="outline" className="border-red-500/20 text-red-400 text-[8px]">{rec.priority}</Badge>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">{rec.reason}</p>
              </div>
            ))}
            <button 
              onClick={() => setActiveTab("ai_assistant")}
              className={`w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${theme.text} text-[11px]`}
            >
              <Bot className="w-4 h-4" /> Consult operations command AI
            </button>
          </div>
        </SharedWidget>

        {/* 10. Generate Announcement */}
        <SharedWidget title="Generate Broadcast Alerts" icon={Bell} badge="Broadcasts">
          <form onSubmit={handleGenerateAnnouncement} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">Incident Type</label>
                <input 
                  type="text" 
                  value={announcementInputs.incident}
                  onChange={(e) => setAnnouncementInputs({ ...announcementInputs, incident: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl focus:outline-none"
                  placeholder="Lost Wallet"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">Location</label>
                <input 
                  type="text" 
                  value={announcementInputs.location}
                  onChange={(e) => setAnnouncementInputs({ ...announcementInputs, location: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl focus:outline-none"
                  placeholder="Gate 4"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isGeneratingAnnouncement}
              className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2 rounded-xl transition-all`}
            >
              {isGeneratingAnnouncement ? "Generating Broadcasts..." : "Generate Broadcast Alerts"}
            </button>
          </form>
        </SharedWidget>

      </div>
    </div>
  );
};
