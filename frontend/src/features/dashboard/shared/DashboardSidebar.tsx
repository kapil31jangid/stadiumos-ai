"use client";

import React from "react";
import { useDashboard } from "./DashboardContext";
import { DashboardHeader } from "./DashboardHeader";
import { 
  Languages, 
  Sliders, 
  LogOut, 
  Users, 
  Bot, 
  Clock, 
  MapPin, 
  Settings as SettingsIcon,
  Activity,
  Shield,
  Wrench,
  AlertTriangle,
  Leaf,
  Zap,
  MonitorPlay,
  BarChart3,
  Bell
} from "lucide-react";

interface DashboardSidebarProps {
  setShowNotifDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ setShowNotifDrawer }) => {
  const {
    user,
    theme,
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    handleSignOut,
    t
  } = useDashboard();

  if (!user) return null;

  const getSidebarLinks = (role: string) => {
    switch (role) {
      case "fan":
        return [
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "navigation", label: "Navigation", icon: MapPin },
          { id: "tickets", label: "Tickets", icon: Sliders },
          { id: "transport", label: "Transport", icon: Clock },
          { id: "ai_assistant", label: "AI Assistant", icon: Bot },
        ];
      case "volunteer":
        return [
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "tasks", label: "Tasks", icon: Sliders },
          { id: "incidents", label: "Incidents", icon: AlertTriangle },
          { id: "translation", label: "Translation", icon: Languages },
          { id: "ai_assistant", label: "AI Assistant", icon: Bot },
        ];
      case "security":
        return [
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "safety", label: "Safety", icon: Shield },
          { id: "cctv", label: "CCTV", icon: MonitorPlay },
          { id: "risks", label: "Risks", icon: AlertTriangle },
          { id: "ai_assistant", label: "AI Risks", icon: Bot },
        ];
      case "organizer":
        return [
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "operations", label: "Operations", icon: Sliders },
          { id: "announcements", label: "Announcements", icon: Bell },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "resources", label: "Resources", icon: Users },
          { id: "ai_assistant", label: "AI Command Center", icon: Bot },
        ];
      case "venue_staff":
        return [
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "maintenance", label: "Maintenance", icon: Wrench },
          { id: "facilities", label: "Facilities", icon: Zap },
          { id: "sustainability", label: "Sustainability", icon: Leaf },
          { id: "ai_assistant", label: "AI Suggestions", icon: Bot },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks(user.role);

  return (
    <aside 
      role="complementary" 
      className="w-64 md:w-72 bg-[#09090c] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30"
    >
      <div className="p-6 space-y-8 overflow-y-auto max-h-[85vh] scrollbar-none">
        
        {/* Composed Top Header Section */}
        <DashboardHeader setShowNotifDrawer={setShowNotifDrawer} />

        {/* User Details Profile Block */}
        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/40 relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">{user.name}</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.text.replace("text-", "bg-")}`} />
              {user.role ? user.role.replace("_", " ") : "Configuring"}
            </div>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-cyan-400" /> Language / Idioma
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "es" | "fr" | "ar" | "hi" | "ja")}
            className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            <option value="en">English (US)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
            <option value="ar">العربية (AR)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="ja">日本語 (JA)</option>
          </select>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1" aria-label="Sidebar Menu">
          {links.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? `${theme.text} ${theme.lightBg} border-l-2 ${theme.border.replace("border-", "border-l-")}` 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? theme.text : "text-zinc-500"}`} />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={() => setActiveTab("settings")}
            aria-current={activeTab === "settings" ? "page" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "settings"
                ? `${theme.text} ${theme.lightBg} border-l-2 ${theme.border.replace("border-", "border-l-")}`
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
            }`}
          >
            <SettingsIcon className={`w-4 h-4 ${activeTab === "settings" ? theme.text : "text-zinc-500"}`} />
            {t("settings")}
          </button>
        </nav>
      </div>

      {/* Footer Logout Button */}
      <div className="p-6 border-t border-zinc-900">
        <button 
          onClick={handleSignOut}
          aria-label="Sign out of StadiumOS"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-zinc-900/40 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
