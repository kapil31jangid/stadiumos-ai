"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useDashboard } from "./DashboardContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { PanelOperations } from "./panels/PanelOperations";
import { PanelFacilities } from "./panels/PanelFacilities";
import { PanelEmergency } from "./panels/PanelEmergency";
import { PanelSustainability } from "./panels/PanelSustainability";
import { PanelSettings } from "./panels/PanelSettings";
import { PanelVolTasks } from "./panels/PanelVolTasks";
import { PanelIncidents } from "./panels/PanelIncidents";
import { PanelTranslation } from "./panels/PanelTranslation";
import { PanelSafety } from "./panels/PanelSafety";
import { PanelCCTV } from "./panels/PanelCCTV";
import { PanelRisks } from "./panels/PanelRisks";
import { PanelResources } from "./panels/PanelResources";
import { PanelMaintenance } from "./panels/PanelMaintenance";
import { PanelNavigation } from "./panels/PanelNavigation";
import { PanelTickets } from "./panels/PanelTickets";
import { PanelTransport } from "./panels/PanelTransport";

const ChatInterface = dynamic(() => import("@/components/ChatInterface").then((mod) => mod.ChatInterface), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-xs text-zinc-500">
      Loading AI Assistant...
    </div>
  ),
});

const Heatmap = dynamic(() => import("@/components/Heatmap").then((mod) => mod.Heatmap), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-zinc-950/20 border border-zinc-800 rounded-3xl animate-pulse flex items-center justify-center text-xs text-zinc-500">
      Loading Stadium Map telemetry...
    </div>
  ),
});

import { 
  Bell,
  BarChart3,
  Bot
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    user,
    activeTab,
    theme,
    accessContrast,
    notifications,
    clearNotification,
    zones,
    language,
    t
  } = useDashboard();

  // Local states
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-[#07070a] text-zinc-100 font-sans flex selection:bg-cyan-500/30 overflow-x-hidden ${accessContrast ? "high-contrast" : ""}`}>
      
      {/* ================= LEFT SIDEBAR ================= */}
      <DashboardSidebar setShowNotifDrawer={setShowNotifDrawer} />

      {/* ================= MAIN CONTENT ================= */}
      <main id="main-content" className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto h-screen relative">
        {activeTab === "dashboard" ? (
          children
        ) : activeTab === "settings" ? (
          /* =================== SETTINGS PAGE =================== */
          <PanelSettings />
        ) : (
          /* =================== DYNAMIC SUB-TABS =================== */
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ===== FAN: NAVIGATION ===== */}
            {activeTab === "navigation" && <PanelNavigation />}

            {/* ===== FAN: TICKETS ===== */}
            {activeTab === "tickets" && <PanelTickets />}

            {/* ===== FAN: TRANSPORT ===== */}
            {activeTab === "transport" && <PanelTransport />}

            {/* ===== VOLUNTEER: TASKS ===== */}
            {activeTab === "tasks" && <PanelVolTasks />}

            {/* ===== VOLUNTEER: INCIDENTS ===== */}
            {activeTab === "incidents" && <PanelIncidents />}

            {/* ===== VOLUNTEER: TRANSLATION ===== */}
            {activeTab === "translation" && <PanelTranslation />}

            {/* ===== SECURITY: SAFETY ===== */}
            {activeTab === "safety" && <PanelSafety />}

            {/* ===== SECURITY: CCTV ===== */}
            {activeTab === "cctv" && <PanelCCTV />}

            {/* ===== SECURITY: RISKS ===== */}
            {activeTab === "risks" && <PanelRisks />}

            {/* ===== ORGANIZER: OPERATIONS ===== */}
            {activeTab === "operations" && <PanelOperations />}

            {/* ===== ORGANIZER: ANNOUNCEMENTS ===== */}
            {activeTab === "announcements" && <PanelEmergency />}

            {/* ===== ORGANIZER: ANALYTICS ===== */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className={`w-6 h-6 ${theme.text}`} /> Crowd Density Analytics
                </h2>
                <Heatmap zones={zones} />
              </div>
            )}

            {/* ===== ORGANIZER: RESOURCES ===== */}
            {activeTab === "resources" && <PanelResources />}

            {/* ===== VENUE: MAINTENANCE ===== */}
            {activeTab === "maintenance" && <PanelMaintenance />}

            {/* ===== VENUE: FACILITIES ===== */}
            {activeTab === "facilities" && <PanelFacilities />}

            {/* ===== VENUE: SUSTAINABILITY ===== */}
            {activeTab === "sustainability" && <PanelSustainability />}

            {/* ===== AI ASSISTANT ===== */}
            {activeTab === "ai_assistant" && (
              <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Bot className={`w-6 h-6 ${theme.text}`} /> {t("aiAssistant")}
                </h2>
                <div className="flex-1 bg-zinc-900/20 border border-zinc-850 p-6 rounded-3xl overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                    <div>
                      <p className="text-[10px] text-zinc-500">Language mode: {language.toUpperCase()} · Role: {user.role?.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden py-4">
                    <ChatInterface />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ================= RIGHT NOTIFICATION DRAWER ================= */}
      {showNotifDrawer && (
        <aside className="w-80 bg-[#09090c] border-l border-zinc-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 transition-all duration-300">
          <div className="p-5 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Bell className={`w-4 h-4 ${theme.text}`} /> Live Operations Feed
              </h3>
              <button 
                onClick={() => setShowNotifDrawer(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-900"
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 text-xs">
                  No active alerts. System status nominal.
                </div>
              ) : (
                notifications.slice().reverse().map((notif) => (
                  <div key={notif.id} className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-xl relative group">
                    <button 
                      onClick={() => clearNotification(notif.id)}
                      className="absolute top-2 right-2 text-xs text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        notif.type === "error" ? "bg-red-500" :
                        notif.type === "warning" ? "bg-yellow-500" :
                        notif.type === "success" ? "bg-green-500" : "bg-blue-550"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-300 leading-normal">{notif.message}</p>
                        <div className="flex items-center justify-between mt-2 text-[9px] text-zinc-500 font-medium">
                          <span className="uppercase tracking-wider">For: {notif.role}</span>
                          <span>{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <button 
                onClick={() => notifications.forEach(n => clearNotification(n.id))}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors mt-2"
              >
                Clear All Notifications
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
