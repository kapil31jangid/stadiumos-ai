"use client";

import React, { useState } from "react";
import { useDashboard, MatchPhase } from "./DashboardContext";
import { ChatInterface } from "@/components/ChatInterface";
import { 
  Languages, 
  Sliders, 
  LogOut, 
  Users, 
  Bot, 
  Clock, 
  MapPin, 
  Settings as SettingsIcon,
  Bell,
  Activity,
  Shield,
  Wrench,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  Circle,
  RefreshCw,
  Zap,
  Droplets,
  Wind,
  MonitorPlay,
  BarChart3,
  UserCheck,
  Info,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";


import { Heatmap } from "@/components/Heatmap";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ===================== VOLUNTEER TASK DATA =====================
const VOL_TASKS = [
  { id: 1, text: "Verify ramp clearance at Section 202.", priority: "high" },
  { id: 2, text: "Distribute translation guide cards to Concourse A entrances.", priority: "medium" },
  { id: 3, text: "Coordinate with security at Gate 4 during player entries.", priority: "high" },
  { id: 4, text: "Check restroom cleanliness status in Sections 204–208.", priority: "low" },
  { id: 5, text: "Assist fans with seating directions in Block 7.", priority: "medium" },
  { id: 6, text: "Confirm elevator operational status in VIP concourse.", priority: "high" },
];

// ===================== PHRASE BANK =====================
const PHRASE_BANK: Record<string, Record<string, string>> = {
  "Please move to Concourse B, elevator access is on the right.": {
    es: "Por favor diríjase al Concourse B, el ascensor está a la derecha.",
    fr: "Veuillez vous diriger vers le Concours B, l'ascenseur est à droite.",
    ar: "يرجى التوجه إلى المجمع B، المصعد على اليمين.",
    hi: "कृपया Concourse B की ओर जाएं, लिफ्ट दाईं ओर है।",
    ja: "コンコースBに向かってください。エレベーターは右手にあります。",
  },
  "Emergency exits are located at Gates A, B, and C.": {
    es: "Las salidas de emergencia están en las Puertas A, B y C.",
    fr: "Les sorties de secours se trouvent aux portes A, B et C.",
    ar: "مخارج الطوارئ موجودة عند البوابات A وB وC.",
    hi: "आपातकालीन निकास गेट A, B और C पर स्थित हैं।",
    ja: "緊急出口はゲートA、B、Cにあります。",
  },
  "Your seat is in Section 204, Row G, Seat 14.": {
    es: "Su asiento está en la Sección 204, Fila G, Asiento 14.",
    fr: "Votre siège est dans la section 204, rangée G, siège 14.",
    ar: "مقعدك في القسم 204، الصف G، المقعد 14.",
    hi: "आपकी सीट सेक्शन 204, पंक्ति G, सीट 14 में है।",
    ja: "お席はセクション204、列G、シート14です。",
  },
};

// ===================== SECURITY RISK DATA =====================
const RISK_MATRIX = [
  { zone: "Gate A (North)", density: 0.72, threats: 2, risk: "MEDIUM", trend: "↑" },
  { zone: "Gate B (East)", density: 0.45, threats: 0, risk: "LOW", trend: "→" },
  { zone: "Gate C (South)", density: 0.88, threats: 4, risk: "HIGH", trend: "↑" },
  { zone: "Gate D (West)", density: 0.31, threats: 0, risk: "LOW", trend: "↓" },
  { zone: "Level 1 Concourse", density: 0.65, threats: 1, risk: "MEDIUM", trend: "→" },
  { zone: "VIP Lounge", density: 0.12, threats: 0, risk: "LOW", trend: "↓" },
  { zone: "Press Area", density: 0.55, threats: 0, risk: "LOW", trend: "→" },
  { zone: "Medical Bay", density: 0.20, threats: 0, risk: "LOW", trend: "→" },
];

// ===================== STAFF ALLOCATION DATA =====================
const STAFF_ALLOCATION = [
  { zone: "Gate A — Entry", security: 45, volunteers: 12, medical: 2 },
  { zone: "Gate B — Entry", security: 38, volunteers: 10, medical: 1 },
  { zone: "Gate C — Entry", security: 52, volunteers: 14, medical: 3 },
  { zone: "Concourse Level 1", security: 28, volunteers: 55, medical: 4 },
  { zone: "VIP Lounge", security: 22, volunteers: 18, medical: 2 },
  { zone: "Media Centre", security: 15, volunteers: 8, medical: 1 },
  { zone: "First Aid Stations", security: 0, volunteers: 5, medical: 12 },
];

// ===================== SYSTEM STATUS DATA =====================
const SYSTEMS = [
  { name: "Passenger Elevators (12 units)", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Concourse Escalators (24 units)", status: "MOSTLY OK", pct: 98, color: "text-green-400" },
  { name: "Entry Turnstiles (180 units)", status: "DEGRADED", pct: 96, color: "text-yellow-400" },
  { name: "HVAC Cooling Grid", status: "HEAVY LOAD", pct: 68, color: "text-yellow-400" },
  { name: "Emergency Lighting", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Public PA System", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Water Distribution", status: "OPERATIONAL", pct: 100, color: "text-green-400" },
  { name: "Surveillance Cameras", status: "MOSTLY OK", pct: 97, color: "text-green-400" },
];

// ===================== ZONE DIRECTORY =====================
const ZONE_DIRECTORY = [
  { name: "Gate A — North Entry", section: "N-100", floor: "Ground", type: "Entry", notes: "Wheelchair accessible" },
  { name: "Gate B — East Entry", section: "E-100", floor: "Ground", type: "Entry", notes: "VIP fast-lane active" },
  { name: "Gate C — South Entry", section: "S-100", floor: "Ground", type: "Entry", notes: "Family zone nearby" },
  { name: "Gate D — West Entry", section: "W-100", floor: "Ground", type: "Entry", notes: "Press & media access" },
  { name: "Food Court Level 1", section: "FC-200", floor: "Level 1", type: "Concession", notes: "12 stalls, halal options" },
  { name: "Restrooms Block A", section: "R-204", floor: "Level 1", type: "Facility", notes: "Accessible, 1m wait" },
  { name: "Restrooms Block B", section: "R-208", floor: "Level 1", type: "Facility", notes: "7m wait — busy" },
  { name: "First Aid Station 1", section: "FA-102", floor: "Ground", type: "Medical", notes: "24hr staffed" },
  { name: "First Aid Station 2", section: "FA-305", floor: "Level 3", type: "Medical", notes: "24hr staffed" },
  { name: "VIP Executive Lounge", section: "VIP-500", floor: "Level 5", type: "VIP", notes: "Access badge required" },
  { name: "Family Fan Zone", section: "FFZ-101", floor: "Level 1", type: "Fan Zone", notes: "Kids activities, quiet area" },
  { name: "Lost & Found", section: "LF-101", floor: "Ground", type: "Service", notes: "Open 10:00–22:00" },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    user,
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    t,
    theme,
    zones,
    accessWheelchair,
    setAccessWheelchair,
    accessElevator,
    setAccessElevator,
    accessContrast,
    setAccessContrast,
    accessTextSize,
    setAccessTextSize,
    handleSignOut,
    incidents,
    newIncident,
    setNewIncident,
    handleSubmitIncident,
    isSubmittingIncident,
    announcementInputs,
    setAnnouncementInputs,
    handleGenerateAnnouncement,
    isGeneratingAnnouncement,
    generatedAnnouncement,
    sustainabilityTips,
    maintenanceTasks,
    notifications,
    clearNotification,
    matchPhase,
    setMatchPhase,
    weather,
    setWeather
  } = useDashboard();

  // Local states
  const [volTasks, setVolTasks] = useState<Set<number>>(new Set());
  const [zoneFilter, setZoneFilter] = useState("");
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState(Object.keys(PHRASE_BANK)[0]);
  const [safetyForm, setSafetyForm] = useState({ type: "Evacuation Notice", location: "", message: "", severity: "High" });
  const [safetySent, setSafetySent] = useState(false);

  const [broadcastHistory, setBroadcastHistory] = useState<string[]>([]);

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
  const filteredZones = ZONE_DIRECTORY.filter(z =>
    z.name.toLowerCase().includes(zoneFilter.toLowerCase()) ||
    z.type.toLowerCase().includes(zoneFilter.toLowerCase()) ||
    z.section.toLowerCase().includes(zoneFilter.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[#07070a] text-zinc-100 font-sans flex selection:bg-cyan-500/30 overflow-x-hidden ${accessContrast ? "high-contrast" : ""}`}>
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside 
        role="complementary" 
        className="w-64 md:w-72 bg-[#09090c] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30"
      >
        <div className="p-6 space-y-8 overflow-y-auto max-h-[85vh] scrollbar-none">
          
          {/* Brand Logo & Notification Bell */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold italic tracking-wider text-cyan-400 font-sans">STADIUMOS</h1>
              <Badge variant="outline" className="border-cyan-500/20 text-[9px] text-cyan-400 uppercase tracking-widest font-mono">V2</Badge>
            </div>
            <button 
              onClick={() => setShowNotifDrawer(prev => !prev)}
              className="relative p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
              title="Operational Alerts Feed"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Real-time Simulator Widgets */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>Simulation State</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Weather Cycler */}
              <button
                onClick={() => {
                  const weathers: ("Sunny" | "Rainy" | "Windy" | "Clear")[] = ["Sunny", "Rainy", "Windy", "Clear"];
                  const nextIndex = (weathers.indexOf(weather) + 1) % weathers.length;
                  setWeather(weathers[nextIndex]);
                }}
                className="flex items-center gap-1.5 p-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-left transition-colors"
                title="Click to cycle weather"
              >
                <span className="text-sm">
                  {weather === "Sunny" ? "☀️" : weather === "Rainy" ? "🌧️" : weather === "Windy" ? "💨" : "🌙"}
                </span>
                <span className="text-[10px] text-zinc-300 font-semibold truncate">{weather}</span>
              </button>

              {/* Match Phase Cycler */}
              <button
                onClick={() => {
                  const phases: ("PRE_MATCH" | "FIRST_HALF" | "HALFTIME" | "SECOND_HALF" | "POST_MATCH")[] = [
                    "PRE_MATCH", "FIRST_HALF", "HALFTIME", "SECOND_HALF", "POST_MATCH"
                  ];
                  const nextIndex = (phases.indexOf(matchPhase) + 1) % phases.length;
                  setMatchPhase(phases[nextIndex]);
                }}
                className="flex items-center gap-1.5 p-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-left transition-colors font-sans"
                title="Click to cycle match phase"
              >
                <span className="text-xs">🕒</span>
                <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider truncate">
                  {matchPhase === "PRE_MATCH" ? "Pre-Match" :
                   matchPhase === "FIRST_HALF" ? "1st Half" :
                   matchPhase === "HALFTIME" ? "Halftime" :
                   matchPhase === "SECOND_HALF" ? "2nd Half" : "Post-Match"}
                </span>
              </button>
            </div>
          </div>

          {/* User details */}
          <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/40 relative">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md`}>
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

          {/* Language Selector */}
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

          {/* Navigation links */}
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

        {/* Footer logout */}
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

      {/* ================= MAIN CONTENT ================= */}
      <main id="main-content" className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto h-screen relative">
        {activeTab === "dashboard" ? (
          children
        ) : activeTab === "settings" ? (
          /* =================== SETTINGS PAGE =================== */
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SettingsIcon className={`w-6 h-6 ${theme.text}`} />
              {t("settings")}
            </h2>

            {/* Profile */}
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-zinc-400" /> Profile
              </h3>
              <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-zinc-400">{user.email}</div>
                  <Badge variant="outline" className={`mt-1 ${theme.border} ${theme.text} text-[10px] uppercase`}>
                    {user.role.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Languages className="w-4 h-4 text-zinc-400" /> Language & Region
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "es" | "fr" | "ar" | "hi" | "ja")}
                className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors w-full max-w-xs"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="ar">العربية (AR)</option>
                <option value="hi">हिन्दी (HI)</option>
                <option value="ja">日本語 (JA)</option>
              </select>
            </div>

            {/* Accessibility */}
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" /> {t("accessibility")} Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setAccessContrast(!accessContrast)}
                  aria-pressed={accessContrast}
                  className={`p-4 border rounded-xl font-bold transition-all text-left flex justify-between items-center text-sm ${
                    accessContrast ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <span>👁️ High Contrast Mode</span>
                  <span className="text-xs">{accessContrast ? "ON" : "OFF"}</span>
                </button>
                <button 
                  onClick={() => setAccessWheelchair(!accessWheelchair)}
                  aria-pressed={accessWheelchair}
                  className={`p-4 border rounded-xl font-bold transition-all text-left flex justify-between items-center text-sm ${
                    accessWheelchair ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <span>♿ Wheelchair Routing</span>
                  <span className="text-xs">{accessWheelchair ? "ON" : "OFF"}</span>
                </button>
                <div className="p-4 flex items-center justify-between border border-zinc-800 rounded-xl bg-zinc-950/50">
                  <span className="text-xs text-zinc-400 font-bold uppercase">Text Scaling</span>
                  <select 
                    value={accessTextSize} 
                    onChange={(e) => setAccessTextSize(e.target.value as "normal" | "large" | "huge")}
                    className={`bg-transparent ${theme.text} font-bold outline-none text-sm`}
                  >
                    <option value="normal">Normal (A)</option>
                    <option value="large">Large (A+)</option>
                    <option value="huge">Extra Large (A++)</option>
                  </select>
                </div>
                <button 
                  onClick={() => setAccessElevator(!accessElevator)}
                  aria-pressed={accessElevator}
                  className={`p-4 border rounded-xl font-bold transition-all text-left flex justify-between items-center text-sm ${
                    accessElevator ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <span>🛗 Elevator-only Routes</span>
                  <span className="text-xs">{accessElevator ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>

            {/* Stadium Simulator Controls */}
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-400" /> Stadium Simulation Controls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Match Day Phase</label>
                  <select 
                    value={matchPhase} 
                    onChange={(e) => setMatchPhase(e.target.value as MatchPhase)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="PRE_MATCH">Pre-Match (Crowd arriving, Gate queues rising)</option>
                    <option value="FIRST_HALF">First Half (Crowd in seats, concession queues low)</option>
                    <option value="HALFTIME">Halftime Break (Spikes at concessions & restrooms)</option>
                    <option value="SECOND_HALF">Second Half (Intense gameplay, high energy load)</option>
                    <option value="POST_MATCH">Post-Match (Exits busy, transport demand surging)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Simulated Weather Mode</label>
                  <select 
                    value={weather} 
                    onChange={(e) => setWeather(e.target.value as "Sunny" | "Rainy" | "Windy" | "Clear")}
                    className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-305 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="Sunny">Sunny ☀️ (Standard operations)</option>
                    <option value="Clear">Clear Night 🌙 (Standard operations)</option>
                    <option value="Rainy">Rainy 🌧️ (Slippery walkways, delayed transport)</option>
                    <option value="Windy">Windy 💨 (Turbulence warnings, security alerts)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-400" /> About StadiumOS
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Version", value: "v2.0.0" },
                  { label: "Platform", value: "FIFA World Cup 2026" },
                  { label: "AI Model", value: "Gemini 2.5 Flash" },
                  { label: "Backend", value: "FastAPI + Neon DB" },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
                    <div className="text-zinc-200 font-bold mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : (
          /* =================== DYNAMIC SUB-TABS =================== */
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ===== FAN: NAVIGATION ===== */}
            {activeTab === "navigation" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className={`w-6 h-6 ${theme.text}`} /> Live Stadium Navigation
                </h2>
                
                <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      placeholder="Search zones, gates, facilities..."
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                    <button
                      onClick={() => setZoneFilter("")}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Zone Directory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredZones.length > 0 ? filteredZones.map((zone, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group cursor-pointer"
                        onClick={() => setActiveTab("ai_assistant")}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          zone.type === "Entry" ? "bg-blue-950/40 text-blue-400" :
                          zone.type === "Concession" ? "bg-amber-950/40 text-amber-400" :
                          zone.type === "Medical" ? "bg-red-950/40 text-red-400" :
                          zone.type === "VIP" ? "bg-purple-950/40 text-purple-400" :
                          "bg-zinc-900 text-zinc-400"
                        }`}>
                          {zone.type.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">{zone.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{zone.section} · Floor: {zone.floor}</div>
                          <div className="text-[10px] text-zinc-600 mt-0.5 italic">{zone.notes}</div>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0 border-zinc-700 text-zinc-500">{zone.type}</Badge>
                      </div>
                    )) : (
                      <div className="col-span-2 p-8 text-center text-zinc-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No zones match your search.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
                    <Bot className={`w-5 h-5 ${theme.text} shrink-0 mt-0.5`} />
                    <div>
                      <div className="text-xs font-bold text-zinc-300 mb-1">AI Navigation Tip</div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">Click any zone to ask the AI assistant for detailed directions, wait times, or accessibility routes.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== FAN: TICKETS ===== */}
            {activeTab === "tickets" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sliders className={`w-6 h-6 ${theme.text}`} /> My Match Tickets & Digital Pass
                </h2>
                
                {/* Primary ticket card */}
                <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-700/60 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">Digital Pass</span>
                        <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> VALID
                        </span>
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white">Argentina vs France</div>
                        <div className="text-sm text-zinc-400 mt-1">FIFA World Cup 2026 · Group Stage · Match 42</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        {[
                          { label: "Section", value: "204" },
                          { label: "Row", value: "G" },
                          { label: "Seat", value: "14" },
                        ].map((f, i) => (
                          <div key={i}>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase">{f.label}</div>
                            <div className="text-lg font-extrabold text-white">{f.value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="outline" className="border-purple-500/20 text-purple-400 text-[10px]">VIP Access</Badge>
                        <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-[10px]">Wheelchair Zone</Badge>
                        <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 text-[10px]">Entry: Gate C</Badge>
                      </div>
                    </div>
                    {/* SVG QR Code */}
                    <div className="shrink-0">
                      <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-xl">
                        <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                          <rect width="21" height="21" fill="white"/>
                          {/* QR finder patterns */}
                          <rect x="0" y="0" width="7" height="7" fill="black"/>
                          <rect x="1" y="1" width="5" height="5" fill="white"/>
                          <rect x="2" y="2" width="3" height="3" fill="black"/>
                          <rect x="14" y="0" width="7" height="7" fill="black"/>
                          <rect x="15" y="1" width="5" height="5" fill="white"/>
                          <rect x="16" y="2" width="3" height="3" fill="black"/>
                          <rect x="0" y="14" width="7" height="7" fill="black"/>
                          <rect x="1" y="15" width="5" height="5" fill="white"/>
                          <rect x="2" y="16" width="3" height="3" fill="black"/>
                          {/* Data modules */}
                          {[
                            [8,0],[9,0],[10,0],[11,0],[12,0],
                            [8,2],[10,2],[12,2],
                            [9,4],[11,4],
                            [8,6],[10,6],[11,6],
                            [0,8],[2,8],[4,8],[6,8],[8,8],[9,8],[11,8],[13,8],[14,8],[16,8],[18,8],[20,8],
                            [9,10],[10,10],[12,10],[14,10],[16,10],[18,10],
                            [8,12],[11,12],[13,12],[15,12],[17,12],[19,12],
                            [9,14],[10,14],[12,14],[14,14],[16,14],[18,14],[20,14],
                            [8,16],[9,16],[11,16],[13,16],[15,16],[17,16],[19,16],
                            [9,18],[11,18],[12,18],[14,18],[16,18],[18,18],[20,18],
                            [8,20],[10,20],[11,20],[13,20],[15,20],[17,20],[19,20],
                          ].map(([cx, cy], i) => (
                            <rect key={i} x={cx} y={cy} width="1" height="1" fill="black"/>
                          ))}
                        </svg>
                      </div>
                      <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">SCAN TO ENTER</p>
                    </div>
                  </div>
                </div>

                {/* Match info cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Kick-off", value: "19:00 UTC", icon: "⏱️" },
                    { label: "Stadium", value: "MetLife Stadium", icon: "🏟️" },
                    { label: "Gate Opens", value: "16:00 UTC", icon: "🚪" },
                    { label: "Parking", value: "Lot C — Zone 4", icon: "🅿️" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
                      <div className="text-lg mb-1">{item.icon}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
                      <div className="text-sm font-bold text-white mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== FAN: TRANSPORT ===== */}
            {activeTab === "transport" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className={`w-6 h-6 ${theme.text}`} /> Exit Transport Logistics
                  </h2>
                  <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all border border-zinc-800 px-3 py-1.5 rounded-lg">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
                
                {/* Departure board */}
                <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
                  <h3 className="text-sm font-bold text-zinc-300 mb-4">Live Departure Board</h3>
                  <div className="space-y-2">
                    {[
                      { name: "🚇 Stadium Metro Line", stop: "Platform 1", wait: "18 min", status: "CROWDED", color: "text-red-400" },
                      { name: "🚌 Shuttle Service — Gate C", stop: "Bay C4", wait: "2 min", status: "CLEAR", color: "text-green-400" },
                      { name: "🚌 Shuttle Service — Gate A", stop: "Bay A1", wait: "5 min", status: "LOADING", color: "text-yellow-400" },
                      { name: "🚕 Rideshare Pickup", stop: "Drop-off Zone East", wait: "8 min", status: "SURGE PRICING", color: "text-orange-400" },
                      { name: "🅿️ Parking Lot A Exit", stop: "Exit 1 & 3", wait: "25 min", status: "CONGESTED", color: "text-red-400" },
                      { name: "🅿️ Parking Lot C Exit", stop: "Exit 2", wait: "6 min", status: "CLEAR", color: "text-green-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <div>
                          <div className="text-xs font-bold text-zinc-200">{item.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{item.stop}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-sm font-bold ${item.color}`}>{item.wait}</div>
                          <div className={`text-[9px] font-bold uppercase ${item.color} opacity-70`}>{item.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Travel Tip */}
                <div className="bg-zinc-950 border border-zinc-800/60 p-5 rounded-3xl flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${theme.lightBg} border ${theme.border} flex items-center justify-center shrink-0`}>
                    <Bot className={`w-5 h-5 ${theme.text}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${theme.text} mb-1`}>AI Travel Recommendation</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Based on current crowd density, Gate C Shuttle Bus is your fastest option with only a 2 min wait. 
                      Avoid the Metro — 18 min wait with peak-hour surge. Exit toward Gate C via the South Concourse corridor (currently 31% density).
                    </p>
                    <button
                      onClick={() => setActiveTab("ai_assistant")}
                      className={`mt-3 text-[11px] font-bold ${theme.text} flex items-center gap-1 hover:opacity-80 transition-all`}
                    >
                      <Bot className="w-3.5 h-3.5" /> Ask for personalized exit plan →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== VOLUNTEER: TASKS ===== */}
            {activeTab === "tasks" && (
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
            )}

            {/* ===== VOLUNTEER: INCIDENTS ===== */}
            {activeTab === "incidents" && (
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
            )}

            {/* ===== VOLUNTEER: TRANSLATION ===== */}
            {activeTab === "translation" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Languages className={`w-6 h-6 ${theme.text}`} /> Multilingual Translation Assistant
                </h2>
                
                <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 block mb-2">Select a common phrase to translate:</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {Object.keys(PHRASE_BANK).map((phrase, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhrase(phrase)}
                          className={`p-3 text-left text-[11px] rounded-xl border transition-all ${
                            selectedPhrase === phrase
                              ? `${theme.lightBg} ${theme.border} ${theme.text} font-bold`
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">🇬🇧 English (Source)</div>
                       <p className="text-sm text-zinc-200">&quot;{selectedPhrase}&quot;</p>
                    </div>
                    
                    {selectedPhrase && PHRASE_BANK[selectedPhrase] && Object.entries(PHRASE_BANK[selectedPhrase]).map(([lang, text]) => (
                      <div key={lang} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">
                          {lang === "es" ? "🇪🇸 Spanish" : lang === "fr" ? "🇫🇷 French" : lang === "ar" ? "🇸🇦 Arabic" : lang === "hi" ? "🇮🇳 Hindi" : "🇯🇵 Japanese"}
                        </div>
                         <p className={`text-sm ${theme.text}`}>&quot;{text}&quot;</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
                    <Bot className={`w-5 h-5 ${theme.text} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">Need to translate a custom phrase? Use the AI Assistant to get real-time translations for any stadium communication.</p>
                      <button
                        onClick={() => setActiveTab("ai_assistant")}
                        className={`mt-2 text-[11px] font-bold ${theme.text} flex items-center gap-1 hover:opacity-80`}
                      >
                        Open AI Assistant for custom translation →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SECURITY: SAFETY ===== */}
            {activeTab === "safety" && (
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
            )}

            {/* ===== SECURITY: CCTV ===== */}
            {activeTab === "cctv" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MonitorPlay className={`w-6 h-6 ${theme.text}`} /> CCTV Visual Command Centre
                  </h2>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 font-bold">8 Feeds Active</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 1, zone: "Gate A — North Entry", status: "CLEAR", density: "32%", alert: false },
                    { id: 2, zone: "Gate C — South Entry", status: "BUSY", density: "88%", alert: true },
                    { id: 3, zone: "Level 1 Concourse", status: "MODERATE", density: "65%", alert: false },
                    { id: 4, zone: "VIP Executive Lounge", status: "CLEAR", density: "12%", alert: false },
                  ].map((cam) => (
                    <div key={cam.id} className={`aspect-video bg-zinc-950 border rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:border-zinc-600 ${
                      cam.alert ? "border-red-500/40" : "border-zinc-800"
                    }`}>
                      {/* Simulated camera grid overlay */}
                      <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "30px 30px" }}
                      />
                      {cam.alert && (
                        <div className="absolute inset-0 bg-red-900/10 animate-pulse" />
                      )}
                      
                      {/* Zone silhouette indicator */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center opacity-20">
                          <Users className="w-12 h-12 mx-auto mb-2 text-zinc-400" />
                          <div className="text-[10px] text-zinc-400 font-mono">{cam.zone}</div>
                        </div>
                      </div>
                      
                      {/* Overlays */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] uppercase font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                      </div>
                      <div className="absolute top-3 right-3 text-[9px] text-zinc-500 font-mono bg-black/50 px-2 py-0.5 rounded">
                        CAM-{String(cam.id).padStart(2, "0")}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-zinc-200">{cam.zone}</div>
                            <div className="text-[9px] text-zinc-500 font-mono">Density: {cam.density}</div>
                          </div>
                          <Badge variant="outline" className={`text-[9px] uppercase ${
                            cam.alert ? "border-red-500/40 text-red-400" :
                            cam.status === "MODERATE" ? "border-yellow-500/40 text-yellow-400" :
                            "border-green-500/40 text-green-400"
                          }`}>{cam.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["East Stairwell", "West Exit Ramp", "Medical Bay", "Press Area"].map((label, i) => (
                    <div key={i} className="aspect-video bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] text-zinc-600 font-mono text-center">{label}</span>
                      </div>
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[8px] text-green-400 bg-green-500/10 px-1 py-0.5 rounded">
                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> LIVE
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== SECURITY: RISKS ===== */}
            {activeTab === "risks" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className={`w-6 h-6 ${theme.text}`} /> Active Threat Assessment Matrix
                </h2>

                {/* Summary bars */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "High Risk Zones", value: RISK_MATRIX.filter(r => r.risk === "HIGH").length, color: "text-red-400", bg: "bg-red-950/20 border-red-500/20" },
                    { label: "Medium Risk Zones", value: RISK_MATRIX.filter(r => r.risk === "MEDIUM").length, color: "text-yellow-400", bg: "bg-yellow-950/20 border-yellow-500/20" },
                    { label: "Low Risk Zones", value: RISK_MATRIX.filter(r => r.risk === "LOW").length, color: "text-green-400", bg: "bg-green-950/20 border-green-500/20" },
                  ].map((item, i) => (
                    <div key={i} className={`p-4 border rounded-2xl ${item.bg}`}>
                      <div className={`text-2xl font-extrabold ${item.color}`}>{item.value}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60">
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Zone</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Density</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Threats</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Risk Level</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RISK_MATRIX.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-all">
                          <td className="px-4 py-3 font-bold text-zinc-200">{row.zone}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  row.density > 0.8 ? "bg-red-500" : row.density > 0.6 ? "bg-yellow-500" : "bg-green-500"
                                }`} style={{ width: `${row.density * 100}%` }} />
                              </div>
                              <span className="text-zinc-400 font-mono">{(row.density * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-300 font-mono">{row.threats}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-[9px] uppercase font-bold ${
                              row.risk === "HIGH" ? "border-red-500/30 text-red-400" :
                              row.risk === "MEDIUM" ? "border-yellow-500/30 text-yellow-400" :
                              "border-green-500/30 text-green-400"
                            }`}>{row.risk}</Badge>
                          </td>
                          <td className={`px-4 py-3 font-bold ${
                            row.trend === "↑" ? "text-red-400" : row.trend === "↓" ? "text-green-400" : "text-zinc-400"
                          }`}>{row.trend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl flex items-start gap-4">
                  <Bot className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-red-400 mb-1">AI Threat Assessment</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">Gate C (South) is the highest risk zone with 88% density and 4 reported incidents. Deploy additional security officers to Gate C immediately and activate overflow routing to Gates A and B.</p>
                    <button
                      onClick={() => setActiveTab("ai_assistant")}
                      className="mt-2 text-[11px] font-bold text-red-400 flex items-center gap-1 hover:opacity-80"
                    >
                      <Bot className="w-3.5 h-3.5" /> Ask AI for mitigation recommendations →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ORGANIZER: OPERATIONS ===== */}
            {activeTab === "operations" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sliders className={`w-6 h-6 ${theme.text}`} /> Operations Command Overview
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Tickets Scanned", value: "62,400", sub: "98.6% of capacity", delta: "+1,200 last 30m", color: "text-green-400" },
                    { label: "Active Staff", value: "740", sub: "92% attendance", delta: "28 in reserve", color: "text-blue-400" },
                    { label: "Open Incidents", value: "3", sub: "2 high priority", delta: "↑1 last hour", color: "text-orange-400" },
                    { label: "Avg Concourse Wait", value: "7.2m", sub: "Target: <10m", delta: "↓0.5m vs pre-match", color: "text-purple-400" },
                  ].map((item, i) => (
                    <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</span>
                      <div className={`text-2xl font-extrabold ${item.color} mt-1`}>{item.value}</div>
                      <span className="text-[10px] text-zinc-500 block mt-1">{item.sub}</span>
                      <span className="text-[9px] text-zinc-600 block mt-0.5">{item.delta}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Zone Occupancy Summary */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
                    <h3 className="text-sm font-bold text-zinc-200">Zone Occupancy</h3>
                    {zones.map((z) => (
                      <div key={z.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">{z.name}</span>
                          <span className={`font-mono font-bold ${z.current_density > 0.8 ? "text-red-400" : z.current_density > 0.6 ? "text-yellow-400" : "text-green-400"}`}>
                            {(z.current_density * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            z.current_density > 0.8 ? "bg-red-500" : z.current_density > 0.6 ? "bg-yellow-500" : "bg-green-500"
                          }`} style={{ width: `${z.current_density * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Event Timeline */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200">Match-Day Event Log</h3>
                    <div className="relative border-l border-zinc-800 ml-2 space-y-4 text-xs">
                      {[
                        { time: "14:00", title: "Gates Open — All Entries", desc: "62,400 admission check-in started." },
                        { time: "16:30", title: "Warm-ups Commence", desc: "Teams on pitch; media protocol active." },
                        { time: "17:00", title: "VIP Pre-match Reception", desc: "Executive lounge at 12% occupancy." },
                        { time: "19:00", title: "Kick-off Ceremonies Begin", desc: "Fan experience + AI alerts scheduled." },
                        { time: "19:45", title: "Halftime Surge Expected", desc: "Concourse traffic 300% normal rate." },
                        { time: "21:15", title: "Exit Protocol Activation", desc: "Transport routing AI engaged." },
                      ].map((ev, i) => (
                        <div key={i} className="relative pl-5">
                          <span className={`absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full border border-zinc-950 ${theme.bg}`} />
                          <div className="text-[9px] font-mono text-zinc-500">{ev.time}</div>
                          <div className="font-bold text-zinc-200">{ev.title}</div>
                          <div className="text-[10px] text-zinc-500">{ev.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ORGANIZER: ANNOUNCEMENTS ===== */}
            {activeTab === "announcements" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className={`w-6 h-6 ${theme.text}`} /> Broadcast Announcements Panel
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200">AI Alert Generator</h3>
                    <form onSubmit={(e) => {
                      handleGenerateAnnouncement(e);
                    }} className="space-y-3 text-xs">
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
            )}

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
            {activeTab === "resources" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className={`w-6 h-6 ${theme.text}`} /> Resource Allocation Centre
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Security Officers", total: 240, deployed: 215, color: "bg-red-500" },
                    { label: "Volunteers", total: 320, deployed: 285, color: "bg-green-500" },
                    { label: "Medical Staff", total: 60, deployed: 55, color: "bg-blue-500" },
                  ].map((item, i) => (
                    <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-3xl">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
                      <div className="text-2xl font-extrabold text-white mt-1">{item.deployed}<span className="text-sm text-zinc-600">/{item.total}</span></div>
                      <div className="mt-2 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.deployed / item.total) * 100}%` }} />
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">{Math.round((item.deployed / item.total) * 100)}% deployed</div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-200">Zone-by-Zone Staff Allocation</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/40">
                          <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Zone</th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Security</th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Volunteers</th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Medical</th>
                          <th className="px-5 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STAFF_ALLOCATION.map((row, i) => (
                          <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-all">
                            <td className="px-5 py-3 font-bold text-zinc-200">{row.zone}</td>
                            <td className="px-5 py-3 text-red-400 font-mono">{row.security}</td>
                            <td className="px-5 py-3 text-green-400 font-mono">{row.volunteers}</td>
                            <td className="px-5 py-3 text-blue-400 font-mono">{row.medical}</td>
                            <td className="px-5 py-3 text-zinc-300 font-mono font-bold">{row.security + row.volunteers + row.medical}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== VENUE: MAINTENANCE ===== */}
            {activeTab === "maintenance" && (
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
                    ) : maintenanceTasks.map((task, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                        <Wrench className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </div>
                    ))}
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
            )}

            {/* ===== VENUE: FACILITIES ===== */}
            {activeTab === "facilities" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className={`w-6 h-6 ${theme.text}`} /> Facilities System Health Dashboard
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYSTEMS.map((sys, i) => (
                    <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-zinc-300">{sys.name}</div>
                          <div className={`text-[10px] font-bold uppercase mt-1 ${sys.color}`}>{sys.status}</div>
                        </div>
                        <span className={`text-lg font-extrabold ${sys.color}`}>{sys.pct}%</span>
                      </div>
                      <div className="mt-3 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          sys.pct >= 99 ? "bg-green-500" : sys.pct >= 90 ? "bg-yellow-500" : "bg-red-500"
                        }`} style={{ width: `${sys.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Zap, label: "Power Load", value: "380 kW", sub: "Save Mode", color: "text-yellow-400" },
                    { icon: Droplets, label: "Water Flow", value: "42 L/m", sub: "Normal", color: "text-blue-400" },
                    { icon: Wind, label: "HVAC Load", value: "68%", sub: "Peak Cooling", color: "text-orange-400" },
                    { icon: Activity, label: "Clean Score", value: "Grade A", sub: "Optimal", color: "text-green-400" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center">
                      <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
                      <div className={`text-sm font-extrabold ${item.color} mt-0.5`}>{item.value}</div>
                      <div className="text-[9px] text-zinc-600 mt-0.5">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== VENUE: SUSTAINABILITY ===== */}
            {activeTab === "sustainability" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Leaf className={`w-6 h-6 ${theme.text}`} /> Sustainability Centre
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Carbon Offset", value: "42 tons", sub: "This match day", icon: "🌱" },
                    { label: "Solar Power Used", value: "28%", sub: "of total load", icon: "☀️" },
                    { label: "Water Saved", value: "1,240 L", sub: "vs baseline", icon: "💧" },
                  ].map((item, i) => (
                    <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-3xl text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">{item.label}</div>
                      <div className="text-xl font-extrabold text-white mt-1">{item.value}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{item.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-3">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Bot className={`w-4 h-4 ${theme.text}`} /> AI Green Recommendations
                  </h3>
                  {sustainabilityTips.length === 0 ? (
                    <div className="py-6 text-center">
                      <Leaf className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">Loading sustainability recommendations...</p>
                    </div>
                  ) : sustainabilityTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300">
                      <Leaf className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
