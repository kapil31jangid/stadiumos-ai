"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Shield, Bell } from "lucide-react";

export const PanelSafety: React.FC = () => {
  const { theme } = useDashboard();
  
  const [safetyForm, setSafetyForm] = useState({ type: "Evacuation Notice", location: "", message: "", severity: "High" });
  const [safetySent, setSafetySent] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Shield className={`w-6 h-6 ${theme.text}`} /> Safety Broadcast Controls
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Send Emergency Broadcast</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">Alert Type</label>
              <select 
                value={safetyForm.type}
                onChange={(e) => setSafetyForm({ ...safetyForm, type: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-300"
              >
                <option>Evacuation Notice</option>
                <option>Crowd Control Alert</option>
                <option>Medical Emergency</option>
                <option>Security Threat Level Change</option>
                <option>General Safety Advisory</option>
                <option>Weather Warning</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">Affected Location</label>
              <input 
                type="text"
                placeholder="e.g. Gate C, Concourse B, All Zones"
                value={safetyForm.location}
                onChange={(e) => setSafetyForm({ ...safetyForm, location: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-300 focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["High", "Critical", "Extreme"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSafetyForm({ ...safetyForm, severity: level })}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      safetyForm.severity === level
                        ? level === "Extreme" ? "bg-red-600 text-white" : "bg-red-950/40 border border-red-500/40 text-red-400"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-500"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">Broadcast Message</label>
              <textarea
                placeholder="Enter the emergency announcement text..."
                value={safetyForm.message}
                onChange={(e) => setSafetyForm({ ...safetyForm, message: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-300 h-20 resize-none focus:outline-none focus:border-red-500/50"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (safetyForm.location && safetyForm.message) {
                  setBroadcastHistory(prev => [
                    `[${safetyForm.severity}] ${safetyForm.type} at ${safetyForm.location}: ${safetyForm.message}`,
                    ...prev
                  ]);
                  setSafetySent(true);
                  setSafetyForm({ type: "Evacuation Notice", location: "", message: "", severity: "High" });
                  setTimeout(() => setSafetySent(false), 3000);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {safetySent ? "✓ Broadcast Sent!" : "Send Safety Broadcast"}
            </button>
          </div>
        </div>
        
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Broadcast History</h3>
          {broadcastHistory.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">No broadcasts sent this session.</p>
              <p className="text-[11px] text-zinc-600">Use the form to send a safety broadcast.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
              {broadcastHistory.map((msg, i) => (
                <div key={i} className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-[11px] text-red-300">{msg}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
