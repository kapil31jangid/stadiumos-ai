import React, { useState } from "react";
import { useDashboard } from "../shared/DashboardContext";
import { SharedWidget } from "../shared/SharedWidget";
import { SVGChart } from "@/components/SVGChart";
import { 
  ClipboardList, 
  MapPin, 
  AlertTriangle, 
  Languages, 
  Users, 
  MessageSquare, 
  Phone, 
  Clock, 
  Bot,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VOLUNTEER_TASKS = [
  { id: 1, text: "Verify ramp clearance at Section 202.", priority: "high" },
  { id: 2, text: "Distribute translation guide cards to Concourse A entrances.", priority: "medium" },
  { id: 3, text: "Coordinate with security at Gate 4 during player entries.", priority: "high" },
  { id: 4, text: "Check restroom cleanliness status in Sections 204–208.", priority: "low" },
  { id: 5, text: "Assist fans with seating directions in Block 7.", priority: "medium" },
];



export const VolunteerDashboard: React.FC = () => {
  const [
    completedTasks,
    setCompletedTasks
  ] = useState<Set<number>>(new Set());

  const toggleTask = (id: number) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const {
    newIncident,
    setNewIncident,
    handleSubmitIncident,
    isSubmittingIncident,
    zones,
    theme,
    setActiveTab,
    chartHistory
  } = useDashboard();

  // Find Section 202 or Concourse 1 details for Assigned Zone widget
  const myZone = zones.find(z => z.id === "concourse_1") || { name: "Level 1 Concourse", current_density: 0.45, status: "Normal" };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Welcome Alert */}
      <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex gap-3 items-start">
        <ClipboardList className={`w-5 h-5 ${theme.text} shrink-0 mt-0.5`} />
        <div>
          <div className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 text-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            Volunteer Shift Active
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Report any crowd bottlenecks or maintenance issues immediately via the Incident Report widget. Use translation aids below for non-English speakers.
          </p>
        </div>
      </div>

      {/* SVG Volunteer Workload trend chart */}
      <div className="grid grid-cols-1 gap-6">
        <SVGChart
          title="Volunteer Activity & Shift Workload Index"
          data={chartHistory.volunteer}
          labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
          color="#22c55e"
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Assigned Zone */}
        <SharedWidget title="Assigned Zone" icon={MapPin} badge="Active Assignment">
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-850 rounded-xl">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Location</span>
                <div className="text-sm font-bold text-white mt-0.5">{myZone.name}</div>
              </div>
              <Badge variant="outline" className="border-green-500/20 text-green-400 font-mono">
                {myZone.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Live Zone Density:</span>
              <span className="font-bold text-white">{(myZone.current_density * 100).toFixed(0)}% Capacity</span>
            </div>
          </div>
        </SharedWidget>

        <SharedWidget title="Today's Tasks" icon={ClipboardList} badge={`${completedTasks.size}/${VOLUNTEER_TASKS.length} done`}>
          <div className="space-y-2 text-xs">
            {VOLUNTEER_TASKS.map((task) => {
              const done = completedTasks.has(task.id);
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-2.5 p-2.5 border rounded-xl text-left transition-all ${
                    done
                      ? "bg-green-950/20 border-green-500/20 text-green-400/60"
                      : "bg-zinc-950/60 border-zinc-850 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    : <Circle className={`w-4 h-4 shrink-0 ${
                        task.priority === "high" ? "text-red-400" :
                        task.priority === "medium" ? "text-yellow-400" : "text-zinc-500"
                      }`} />}
                  <span className={done ? "line-through opacity-60" : ""}>{task.text}</span>
                </button>
              );
            })}
          </div>
        </SharedWidget>

        {/* 3. Incident Report */}
        <SharedWidget title="Incident Report" icon={AlertTriangle} badge="AI Assisted">
          <form onSubmit={handleSubmitIncident} className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={newIncident.type}
                onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-zinc-300"
              >
                <option>Crowd Overflow</option>
                <option>Medical Emergency</option>
                <option>Maintenance Issue</option>
                <option>Security Threat</option>
              </select>
              <select 
                value={newIncident.severity}
                onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-zinc-300"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <input 
              type="text" 
              placeholder="Specific Location"
              value={newIncident.location}
              onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl"
              required
            />
            <textarea 
              placeholder="Describe the incident details..."
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl h-16"
              required
            />
            <button 
              type="submit" 
              disabled={isSubmittingIncident}
              className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2 rounded-xl transition-all`}
            >
              {isSubmittingIncident ? "Processing AI..." : "Submit Incident"}
            </button>
          </form>
        </SharedWidget>

        {/* 4. Translation Assistant */}
        <SharedWidget title="Translation Assistant" icon={Languages}>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
              <strong className="text-zinc-400 block">English:</strong>
              <span>&quot;Please move to Concourse B, elevator access is on the right.&quot;</span>
            </div>
            <div className="p-2.5 bg-zinc-950/60 border border-zinc-850 rounded-xl">
              <strong className={`${theme.text} block`}>Spanish:</strong>
              <span>&quot;Por favor diríjase al Concourse B, el ascensor está a la derecha.&quot;</span>
            </div>
          </div>
        </SharedWidget>

        {/* 5. Emergency Contacts */}
        <SharedWidget title="Emergency Contacts" icon={Phone}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>🚨 Security Dispatch</span>
              <Badge variant="outline" className="border-red-500/20 text-red-400 font-mono">CH-04</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>🩺 Medical Response</span>
              <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 font-mono">CH-08</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-zinc-950 border border-zinc-850 rounded-xl">
              <span>🧹 Maintenance core</span>
              <Badge variant="outline" className="border-blue-500/20 text-blue-400 font-mono">CH-12</Badge>
            </div>
          </div>
        </SharedWidget>

        {/* 6. Volunteer Chat */}
        <SharedWidget title="Volunteer Team Chat" icon={MessageSquare} badge="3 Active">
          <div className="space-y-2 text-[11px] max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
            <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850">
              <strong className="text-green-400">Shift Lead:</strong> Concourse B is filling up quickly, please deploy translation aids there.
            </div>
            <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-850">
              <strong className="text-zinc-400">Vol_42:</strong> Restroom A at Sec 204 has been cleared.
            </div>
          </div>
        </SharedWidget>

        {/* 7. People Needing Help */}
        <SharedWidget title="People Needing Help" icon={Users} badge="2 Alerts">
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl flex justify-between items-start">
              <div>
                <strong className="text-red-400 font-bold block">Wheelchair Bottleneck</strong>
                <span className="text-[10px] text-zinc-400">Section 204 Corridor</span>
              </div>
              <Badge className="bg-red-600 text-white text-[8px]">Active</Badge>
            </div>
            <div className="p-2.5 bg-yellow-950/20 border border-yellow-500/20 rounded-xl flex justify-between items-start">
              <div>
                <strong className="text-yellow-400 font-bold block">Assistance Requested</strong>
                <span className="text-[10px] text-zinc-400">Gate 4 Ticket scanning</span>
              </div>
              <Badge className="bg-yellow-600 text-white text-[8px]">Assigned</Badge>
            </div>
          </div>
        </SharedWidget>

        {/* 8. Task Timeline */}
        <SharedWidget title="Task Shift Timeline" icon={Clock}>
          <div className="relative border-l border-zinc-800 ml-2 space-y-3 pb-1 text-xs">
            {[
              { time: "14:00", title: "Shift Check-in", desc: "Equip radio, badges." },
              { time: "15:30", title: "Concourse Patrol", desc: "Check Section 202 ramps." },
              { time: "17:00", title: "Gate Entry Duty", desc: "Deploy to Gate 4 scanning." },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-5">
                <span className="absolute -left-1 top-1 w-2.5 h-2.5 rounded-full bg-green-500 border border-zinc-950" />
                <div className="text-[10px] font-mono text-zinc-500">{item.time}</div>
                <div className="font-bold text-zinc-200">{item.title}</div>
                <div className="text-[10px] text-zinc-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </SharedWidget>

        <SharedWidget title="AI Task Priority Advisor" icon={Bot}>
          <div className="space-y-3">
            <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl text-[11px] text-zinc-400 leading-relaxed">
              <strong className={`${theme.text} block mb-0.5`}>Gemini Task Suggestion:</strong>
              Prioritize checking Section 202 ramp clearance immediately. Concourse B telemetry is showing a 20% crowd increase, meaning wheel-chair bottlenecking is highly probable in 10 minutes.
            </div>
            <button 
              onClick={() => setActiveTab("ai_assistant")}
              className={`w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${theme.text} text-xs`}
            >
              <Bot className="w-4 h-4" /> Ask for next task recommendations
            </button>
          </div>
        </SharedWidget>

      </div>
    </div>
  );
};
