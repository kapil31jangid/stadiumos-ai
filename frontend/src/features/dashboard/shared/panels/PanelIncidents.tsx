"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { AlertTriangle, CheckCircle2, RefreshCw, Send } from "lucide-react";

export const PanelIncidents: React.FC = () => {
  const {
    incidents,
    newIncident,
    setNewIncident,
    handleSubmitIncident,
    isSubmittingIncident,
    theme
  } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className={`w-6 h-6 ${theme.text}`} /> Incident Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Submit New Incident</h3>
          <form onSubmit={handleSubmitIncident} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Type</label>
                <select 
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-300"
                >
                  <option>Crowd Overflow</option>
                  <option>Medical Emergency</option>
                  <option>Maintenance Issue</option>
                  <option>Security Threat</option>
                  <option>Lost Person</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Severity</label>
                <select 
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-300"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Specific Location (e.g. Gate C, Section 204)"
              value={newIncident.location}
              onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-zinc-300 focus:outline-none focus:border-cyan-500/50"
              required
            />
            <textarea 
              placeholder="Describe the incident in detail..."
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl h-24 text-zinc-300 focus:outline-none focus:border-cyan-500/50 resize-none"
              required
            />
            <button 
              type="submit" 
              disabled={isSubmittingIncident}
              className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2`}
            >
              {isSubmittingIncident ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting via AI...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Incident Report</>
              )}
            </button>
          </form>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Active Incident Feed</h3>
          {incidents.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-500/40 mx-auto" />
              <p className="text-sm text-zinc-500">No incidents reported.</p>
              <p className="text-[11px] text-zinc-600">Use the form to log a new incident.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
              {incidents.map((inc, i) => (
                <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-200">{inc.type}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                      inc.severity === "Critical" ? "bg-red-500/20 text-red-400" :
                      inc.severity === "High" ? "bg-orange-500/20 text-orange-400" :
                      "bg-zinc-700/50 text-zinc-400"
                    }`}>{inc.severity}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">{inc.location}</p>
                  <p className="text-[11px] text-zinc-400">{inc.description}</p>
                  {inc.aiSummary && (
                    <div className="border-t border-zinc-900 pt-1.5 mt-1.5 text-[9px] text-cyan-400">
                      <strong>AI:</strong> {inc.aiResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
