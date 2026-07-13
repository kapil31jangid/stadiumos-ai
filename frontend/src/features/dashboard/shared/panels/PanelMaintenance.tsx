"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Wrench, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const PanelMaintenance: React.FC = () => {
  const { maintenanceTasks, theme } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Wrench className={`w-6 h-6 ${theme.text}`} /> Maintenance Logs & Queue
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI suggestions */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Bot className={`w-4 h-4 ${theme.text}`} /> AI Preventative Tasks
          </h3>
          {maintenanceTasks.length === 0 ? (
            <div className="py-6 text-center">
              <Wrench className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Loading AI recommendations...</p>
            </div>
          ) : (
            maintenanceTasks.map((task, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                <Wrench className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>{task}</span>
              </div>
            ))
          )}
        </div>

        {/* Static repair queue */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-zinc-200">Active Repair Queue</h3>
          {[
            { task: "Broken Chair Section 204", priority: "CRITICAL", assignee: "Crew A" },
            { task: "Water Leak Restroom Sec 108", priority: "HIGH", assignee: "Crew B" },
            { task: "Turnstile Gate B bearing worn", priority: "HIGH", assignee: "Pending" },
            { task: "Escalator vibration West Gate", priority: "MEDIUM", assignee: "Crew C" },
            { task: "LED panel flicker Section 302", priority: "LOW", assignee: "Pending" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs">
              <div>
                <div className="font-bold text-zinc-200">{item.task}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Assigned: {item.assignee}</div>
              </div>
              <Badge variant="outline" className={`text-[9px] uppercase shrink-0 ${
                item.priority === "CRITICAL" ? "border-red-500/30 text-red-400" :
                item.priority === "HIGH" ? "border-orange-500/30 text-orange-400" :
                item.priority === "MEDIUM" ? "border-yellow-500/30 text-yellow-400" :
                "border-zinc-700 text-zinc-500"
              }`}>{item.priority}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
