"use client";

import React from "react";
import { useDashboard } from "../shared/DashboardContext";
import { SharedWidget } from "../shared/SharedWidget";
import { Heatmap } from "@/components/Heatmap";
import { 
  Shield, 
  Map, 
  AlertOctagon, 
  Clock, 
  Users, 
  Eye, 
  AlertTriangle, 
  Bot 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SVGChart } from "@/components/SVGChart";

export const SecurityDashboard: React.FC = () => {
  const {
    zones,
    incidents,
    theme,
    setActiveTab,
    chartHistory
  } = useDashboard();

  // Filter out critical / congested zones
  const criticalZonesList = zones.filter(z => z.current_density > 0.6);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Security Threat Banner */}
      <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-start">
        <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <div className="text-xs font-bold text-red-500 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            Security Alert Status: Elevated Monitor
          </div>
          <p className="text-xs text-red-200 mt-1 leading-relaxed">
            Gate 4 scanning delays are building. Increase physical presence at Section 202 to guide overflow crowds.
          </p>
        </div>
      </div>

      {/* Grid containing heatmap and widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap takes full row width on large screen */}
        <div className="lg:col-span-3">
          <Heatmap zones={zones} />
        </div>

        {/* Live Security Trend Charts */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SVGChart
            title="Live Crowd Occupancy Trend"
            data={chartHistory.occupancy}
            labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
            color="#ef4444"
            unit="%"
          />
          <SVGChart
            title="Active Incidents Timeline Trend"
            data={chartHistory.incidents}
            labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
            color="#f97316"
            unit=" active"
          />
        </div>

        {/* 1. Critical Zones */}
        <SharedWidget title="Critical Zones" icon={Users} badge={`${criticalZonesList.length} alert`}>
          <div className="space-y-2">
            {criticalZonesList.length > 0 ? (
              criticalZonesList.map((z) => (
                <div key={z.id} className="flex justify-between items-center bg-zinc-950 p-2.5 border border-zinc-850 rounded-xl">
                  <span className="text-xs text-zinc-300 font-bold">{z.name}</span>
                  <Badge variant="outline" className="border-red-500/20 text-red-400 font-mono text-[10px]">
                    {(z.current_density * 100).toFixed(0)}% full
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-zinc-500 text-xs py-2 text-center">No critical zones reporting.</div>
            )}
          </div>
        </SharedWidget>

        {/* 2. Incident Feed */}
        <SharedWidget title="Active Incident Feed" icon={AlertTriangle}>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-none">
            {incidents.map((incident, i) => (
              <div key={i} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-200">{incident.type}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{incident.severity}</span>
                </div>
                <div className="text-zinc-500 text-[10px]">{incident.location}</div>
                <p className="text-zinc-400 text-[11px] mt-1">{incident.description}</p>
                {incident.aiSummary && (
                  <div className="border-t border-zinc-900 pt-1.5 mt-1.5 text-[9px] text-cyan-400 leading-tight">
                    <strong>AI Action:</strong> {incident.aiResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 4. Emergency Alerts */}
        <SharedWidget title="Emergency Broadcasts" icon={AlertOctagon}>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl">
              <strong className="text-red-400 font-bold block mb-1">Weather Delay Alert</strong>
              <p className="text-zinc-300 text-[11px]">General public directed to concourse shelter zones 1 & 2.</p>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
              <strong className="text-zinc-400 font-bold block mb-1">Gate A Congestion Info</strong>
              <p className="text-zinc-500 text-[11px]">Crowds diverted to Gates B and C. Clearance code active.</p>
            </div>
          </div>
        </SharedWidget>

        {/* 5. Gate Status */}
        <SharedWidget title="Gate Flow Status" icon={Map} badge="Live gates">
          <div className="space-y-2.5 text-xs">
            {zones.filter(z => z.id.startsWith("gate_")).map((z) => (
              <div key={z.id} className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
                <span>{z.name}</span>
                <span className={`font-bold font-mono ${z.current_density > 0.8 ? "text-red-400" : "text-green-400"}`}>
                  {(z.current_density * 100).toFixed(0)}% Rate
                </span>
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 6. Live CCTV Placeholder */}
        <SharedWidget title="Live CCTV Feeds" icon={Eye}>
          <div className="space-y-2.5">
            <div className="aspect-video bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center relative">
              <span className="text-[10px] text-zinc-600 font-mono">FEED // SECTION 202 CAMERA</span>
              <span className="absolute top-2 left-2 flex items-center gap-1 text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
              </span>
            </div>
          </div>
        </SharedWidget>

        {/* 7. Risk Analysis */}
        <SharedWidget title="Risk Index Analysis" icon={Shield}>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Crowd Bottlenecks:</span>
              <span className="font-bold text-yellow-500 font-mono">MODERATE</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Emergency Channels:</span>
              <span className="font-bold text-green-400 font-mono">SECURE</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Gate scanning load:</span>
              <span className="font-bold text-red-500 font-mono">HIGH</span>
            </div>
          </div>
        </SharedWidget>

        {/* 8. Security Timeline */}
        <SharedWidget title="Patrol & Event Log" icon={Clock}>
          <div className="relative border-l border-zinc-800 ml-2 space-y-3 pb-1 text-xs">
            {[
              { time: "16:45", title: "Gate A sweep completed", desc: "No debris or blocks." },
              { time: "17:15", title: "VIP Escalator check", desc: "Cleared by officer #12." },
              { time: "17:30", title: "Concourse B patrol", desc: "Redirecting traffic flow." },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-5">
                <span className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-zinc-950" />
                <div className="text-[9px] font-mono text-zinc-500">{item.time}</div>
                <div className="font-bold text-zinc-200">{item.title}</div>
                <div className="text-[9px] text-zinc-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 9. AI Risk Summary */}
        <SharedWidget title="AI Threat Risk Level Summary" icon={Bot}>
          <div className="space-y-3">
            <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Overall threat level</span>
                <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 font-mono text-[10px]">MEDIUM RISK</Badge>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Risk is mitigated by normal crowd distributions. However, HVAC reporting issues in Concourse B and minor bottlenecks in Gate 4 suggest standard surveillance loops be increased in the North Concourse.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab("ai_assistant")}
              className={`w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${theme.text} text-xs`}
            >
              <Bot className="w-4 h-4" /> Ask for active incident summaries
            </button>
          </div>
        </SharedWidget>

      </div>
    </div>
  );
};
