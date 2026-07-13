"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Sliders, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VOL_TASKS = [
  { id: 1, text: "Verify ramp clearance at Section 202.", priority: "high" },
  { id: 2, text: "Distribute translation guide cards to Concourse A entrances.", priority: "medium" },
  { id: 3, text: "Coordinate with security at Gate 4 during player entries.", priority: "high" },
  { id: 4, text: "Check restroom cleanliness status in Sections 204–208.", priority: "low" },
  { id: 5, text: "Assist fans with seating directions in Block 7.", priority: "medium" },
  { id: 6, text: "Confirm elevator operational status in VIP concourse.", priority: "high" },
];

export const PanelVolTasks: React.FC = () => {
  const { theme } = useDashboard();
  const [volTasks, setVolTasks] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Sliders className={`w-6 h-6 ${theme.text}`} /> My Daily Task Operations
      </h2>
      
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300 font-bold">Shift Tasks — Match Day</p>
            <p className="text-xs text-zinc-500 mt-0.5">{volTasks.size} of {VOL_TASKS.length} completed</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(volTasks.size / VOL_TASKS.length) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-green-400">{Math.round((volTasks.size / VOL_TASKS.length) * 100)}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {VOL_TASKS.map((task) => {
            const done = volTasks.has(task.id);
            return (
              <button
                key={task.id}
                onClick={() => {
                  setVolTasks(prev => {
                    const next = new Set(prev);
                    if (next.has(task.id)) next.delete(task.id); else next.add(task.id);
                    return next;
                  });
                }}
                className={`w-full flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all ${
                  done
                    ? "bg-green-950/20 border-green-500/20 text-green-400/60"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {done
                  ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  : <Circle className={`w-5 h-5 shrink-0 ${
                      task.priority === "high" ? "text-red-400" :
                      task.priority === "medium" ? "text-yellow-400" : "text-zinc-500"
                    }`} />
                }
                <span className={`text-sm ${done ? "line-through opacity-60" : ""}`}>{task.text}</span>
                <Badge variant="outline" className={`ml-auto shrink-0 text-[9px] uppercase ${
                  task.priority === "high" ? "border-red-500/20 text-red-400" :
                  task.priority === "medium" ? "border-yellow-500/20 text-yellow-400" : "border-zinc-700 text-zinc-500"
                }`}>{task.priority}</Badge>
              </button>
            );
          })}
        </div>
        
        {volTasks.size === VOL_TASKS.length && (
          <div className="p-4 bg-green-950/20 border border-green-500/20 rounded-xl text-center">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-400">All tasks complete! Excellent shift performance.</p>
          </div>
        )}
      </div>
    </div>
  );
};
