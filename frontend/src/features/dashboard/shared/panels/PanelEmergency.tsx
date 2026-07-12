"use client";

import React from "react";
import { useDashboard } from "../DashboardContext";
import { Bell, RefreshCw } from "lucide-react";

export const PanelEmergency: React.FC = () => {
  const {
    theme,
    announcementInputs,
    setAnnouncementInputs,
    handleGenerateAnnouncement,
    isGeneratingAnnouncement,
    generatedAnnouncement
  } = useDashboard();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Bell className={`w-6 h-6 ${theme.text}`} /> Broadcast Announcements Panel
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">AI Alert Generator</h3>
          <form onSubmit={handleGenerateAnnouncement} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">Incident Type</label>
              <input 
                type="text" 
                value={announcementInputs.incident}
                onChange={(e) => setAnnouncementInputs({ ...announcementInputs, incident: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl focus:outline-none focus:border-purple-500/50 text-zinc-300"
                placeholder="e.g. Crowd overflow, Lost child"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 block mb-1">Location</label>
              <input 
                type="text" 
                value={announcementInputs.location}
                onChange={(e) => setAnnouncementInputs({ ...announcementInputs, location: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl focus:outline-none focus:border-purple-500/50 text-zinc-300"
                placeholder="e.g. Gate C, Section 202"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isGeneratingAnnouncement}
              className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2`}
            >
              {isGeneratingAnnouncement ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Generating via Gemini...</>
              ) : (
                <><Bell className="w-4 h-4" /> Generate Broadcast Alerts</>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Generated Broadcast</h3>
          {generatedAnnouncement ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">📢 Public Announcement</span>
                <p className="text-zinc-200 leading-relaxed">{generatedAnnouncement.public_announcement}</p>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-green-400 uppercase">👷 Volunteer Instructions</span>
                <p className="text-zinc-400">{generatedAnnouncement.volunteer_instructions}</p>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-red-400 uppercase">🚨 Security Brief</span>
                <p className="text-zinc-400">{generatedAnnouncement.security_brief}</p>
              </div>
              {generatedAnnouncement.translations && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase">🌐 Translations</span>
                  {Object.entries(generatedAnnouncement.translations).filter(([k]) => k !== "en").map(([lang, text]) => (
                    <p key={lang} className="text-zinc-500 text-[10px]"><strong className="text-zinc-400">{lang.toUpperCase()}:</strong> {String(text)}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-500">No broadcast generated yet.</p>
              <p className="text-[11px] text-zinc-600">Use the AI Alert Generator to create a multilingual broadcast.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
