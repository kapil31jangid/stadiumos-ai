"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { Zone, Queue, Incident, UserProfile, RoleTheme, AppNotification, MatchPhase } from "./contexts/dashboardTypes";
import { ROLE_THEMES, TRANSLATIONS } from "./contexts/dashboardConstants";
import { useDashboardSimulation } from "./contexts/dashboardSimulation";
import { getTranslation } from "./contexts/dashboardUtils";

export type { Zone, Queue, Incident, UserProfile, RoleTheme, AppNotification, MatchPhase };
export { ROLE_THEMES, TRANSLATIONS };

interface DashboardContextProps {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isRolePickerOpen: boolean;
  setIsRolePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  language: "en" | "es" | "fr" | "ar" | "hi" | "ja";
  setLanguage: (lang: "en" | "es" | "fr" | "ar" | "hi" | "ja") => void;
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  queues: Queue[];
  setQueues: React.Dispatch<React.SetStateAction<Queue[]>>;
  metrics: { avgOccupancy: number; criticalZones: number; totalZones: number };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAIOpen: boolean;
  setIsAIOpen: React.Dispatch<React.SetStateAction<boolean>>;
  joinedQueue: "burger" | "brews" | null;
  setJoinedQueue: React.Dispatch<React.SetStateAction<"burger" | "brews" | null>>;
  queuePosition: number;
  setQueuePosition: React.Dispatch<React.SetStateAction<number>>;
  queueWaitTime: number;
  setQueueWaitTime: React.Dispatch<React.SetStateAction<number>>;
  queueFilter: "all" | "food" | "restrooms" | "merch";
  setQueueFilter: React.Dispatch<React.SetStateAction<"all" | "food" | "restrooms" | "merch">>;
  activeMapMarker: "gate_4" | "burger_stand" | "restroom" | null;
  setActiveMapMarker: React.Dispatch<React.SetStateAction<"gate_4" | "burger_stand" | "restroom" | null>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  
  // Accessibility
  accessStairs: boolean;
  setAccessStairs: (val: boolean) => void;
  accessElevator: boolean;
  setAccessElevator: (val: boolean) => void;
  accessWheelchair: boolean;
  setAccessWheelchair: (val: boolean) => void;
  accessContrast: boolean;
  setAccessContrast: (val: boolean) => void;
  accessTextSize: "normal" | "large" | "huge";
  setAccessTextSize: (val: "normal" | "large" | "huge") => void;
  
  // Incidents
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  newIncident: { type: string; location: string; severity: string; description: string };
  setNewIncident: React.Dispatch<React.SetStateAction<{ type: string; location: string; severity: string; description: string }>>;
  recentIncidentAI: { summary: string; priority: string; suggested_response: string } | null;
  setRecentIncidentAI: React.Dispatch<React.SetStateAction<{ summary: string; priority: string; suggested_response: string } | null>>;
  isSubmittingIncident: boolean;
  handleSubmitIncident: (e: React.FormEvent) => Promise<void>;
  
  // Announcements
  announcementInputs: { incident: string; location: string; severity: string };
  setAnnouncementInputs: React.Dispatch<React.SetStateAction<{ incident: string; location: string; severity: string }>>;
  generatedAnnouncement: { public_announcement: string; volunteer_instructions: string; security_brief: string; translations: Record<string, string> } | null;
  setGeneratedAnnouncement: React.Dispatch<React.SetStateAction<{ public_announcement: string; volunteer_instructions: string; security_brief: string; translations: Record<string, string> } | null>>;
  isGeneratingAnnouncement: boolean;
  handleGenerateAnnouncement: (e: React.FormEvent) => Promise<void>;
  
  // Tips / Suggestions
  sustainabilityTips: string[];
  maintenanceTasks: string[];
  
  // Lost & Found
  lostItems: { name: string; desc: string; loc: string }[];
  lostItemInput: { name: string; desc: string; loc: string };
  setLostItemInput: React.Dispatch<React.SetStateAction<{ name: string; desc: string; loc: string }>>;
  foundItems: { name: string; loc: string; matched: boolean }[];
  setFoundItems: React.Dispatch<React.SetStateAction<{ name: string; loc: string; matched: boolean }[]>>;
  handleReportLostItem: (e: React.FormEvent) => void;
  
  // Auth Helpers
  handleRoleSelection: (selectedRole: string) => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleJudgeAutoLogin: (demoRole: string) => void;
  t: (key: string) => string;
  theme: RoleTheme;

  // Real-time operations extension
  matchPhase: MatchPhase;
  setMatchPhase: (phase: MatchPhase) => void;
  weather: "Sunny" | "Rainy" | "Windy" | "Clear";
  setWeather: (weather: "Sunny" | "Rainy" | "Windy" | "Clear") => void;
  notifications: AppNotification[];
  clearNotification: (id: number) => void;
  chartHistory: {
    occupancy: number[];
    queues: number[];
    incidents: number[];
    energy: number[];
    volunteer: number[];
  };
  addNotification: (message: string, role?: AppNotification["role"], type?: AppNotification["type"]) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [language, setLanguageState] = useState<"en" | "es" | "fr" | "ar" | "hi" | "ja">("en");
  const [zones, setZones] = useState<Zone[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [metrics, setMetrics] = useState({ avgOccupancy: 0, criticalZones: 0, totalZones: 0 });
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  const [joinedQueue, setJoinedQueue] = useState<"burger" | "brews" | null>(null);
  const [queuePosition, setQueuePosition] = useState(42);
  const [queueWaitTime, setQueueWaitTime] = useState(24);
  const [queueFilter, setQueueFilter] = useState<"all" | "food" | "restrooms" | "merch">("all");
  const [activeMapMarker, setActiveMapMarker] = useState<"gate_4" | "burger_stand" | "restroom" | null>("gate_4");
  const [searchQuery, setSearchQuery] = useState("");

  // Accessibility
  const [accessStairs, setAccessStairsState] = useState(false);
  const [accessElevator, setAccessElevatorState] = useState(false);
  const [accessWheelchair, setAccessWheelchairState] = useState(false);
  const [accessContrast, setAccessContrastState] = useState(false);
  const [accessTextSize, setAccessTextSizeState] = useState<"normal" | "large" | "huge">("normal");

  // Incidents
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [newIncident, setNewIncident] = useState({ type: "Crowd Overflow", location: "Concourse B", severity: "High", description: "" });
  const [recentIncidentAI, setRecentIncidentAI] = useState<{ summary: string; priority: string; suggested_response: string } | null>(null);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  // Announcements
  const [announcementInputs, setAnnouncementInputs] = useState({ incident: "Lost Child", location: "Section 204", severity: "Medium" });
  const [generatedAnnouncement, setGeneratedAnnouncement] = useState<{ public_announcement: string; volunteer_instructions: string; security_brief: string; translations: Record<string, string> } | null>(null);
  const [isGeneratingAnnouncement, setIsGeneratingAnnouncement] = useState(false);

  // Suggestions
  const [sustainabilityTips, setSustainabilityTips] = useState<string[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<string[]>([]);

  // Lost & Found
  const [lostItems, setLostItems] = useState<{ name: string; desc: string; loc: string }[]>([]);
  const [lostItemInput, setLostItemInput] = useState({ name: "", desc: "", loc: "" });
  const [foundItems, setFoundItems] = useState([
    { name: "Black leather wallet", loc: "Gate 4", matched: false },
    { name: "iPhone 15 pro max", loc: "Concourse A", matched: false },
    { name: "Blue World Cup cap", loc: "Section 203", matched: false }
  ]);

  // Real-Time Simulator Extension States
  const [matchPhase, setMatchPhaseState] = useState<MatchPhase>("PRE_MATCH");
  const [weather, setWeatherState] = useState<"Sunny" | "Rainy" | "Windy" | "Clear">("Clear");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chartHistory, setChartHistory] = useState({
    occupancy: [15, 20, 24, 30, 42, 51, 58],
    queues: [12, 14, 15, 18, 22, 25, 24],
    incidents: [0, 1, 1, 2, 2, 3, 2],
    energy: [180, 195, 210, 230, 280, 310, 340],
    volunteer: [20, 28, 35, 45, 52, 68, 72]
  });

  const t = useCallback((key: string): string => {
    return getTranslation(language, key);
  }, [language]);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined" && window.location.port === "3000") {
      return `http://localhost:8080${path}`;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${backendUrl}${path}`;
  };

  // Language & Pref sync
  const setLanguage = useCallback(async (lang: "en" | "es" | "fr" | "ar" | "hi" | "ja") => {
    setLanguageState(lang);
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from("profiles").update({ language: lang }).eq("id", user.uid);
      } catch (e) {
        console.error("Failed to update language:", e);
      }
    }
  }, [user]);

  const syncPreference = useCallback(async (key: string, value: boolean | string) => {
    if (user && isSupabaseConfigured) {
      try {
        const newPrefs = {
          accessStairs,
          accessElevator,
          accessWheelchair,
          accessContrast,
          accessTextSize,
          [key]: value
        };
        await supabase.from("profiles").update({ preferences: newPrefs }).eq("id", user.uid);
      } catch (e) {
        console.error(`Failed to update pref ${key}:`, e);
      }
    }
  }, [user, accessStairs, accessElevator, accessWheelchair, accessContrast, accessTextSize]);

  const setAccessStairs = useCallback((val: boolean) => { setAccessStairsState(val); void syncPreference("accessStairs", val); }, [syncPreference]);
  const setAccessElevator = useCallback((val: boolean) => { setAccessElevatorState(val); void syncPreference("accessElevator", val); }, [syncPreference]);
  const setAccessWheelchair = useCallback((val: boolean) => { setAccessWheelchairState(val); void syncPreference("accessWheelchair", val); }, [syncPreference]);
  const setAccessContrast = useCallback((val: boolean) => { setAccessContrastState(val); void syncPreference("accessContrast", val); }, [syncPreference]);
  const setAccessTextSize = useCallback((val: "normal" | "large" | "huge") => { setAccessTextSizeState(val); void syncPreference("accessTextSize", val); }, [syncPreference]);

  const syncProfile = async (sbUser: { id: string; email?: string }) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", sbUser.id).single();
      if (data) {
        setUser({
          uid: data.id,
          email: data.email || "",
          name: data.name || sbUser.email?.split('@')[0] || "Spectator",
          role: data.role || ""
        });
        if (data.language) setLanguageState(data.language as "en" | "es" | "fr" | "ar" | "hi" | "ja");

        if (data.preferences) {
          const prefs = data.preferences;
          if (prefs.accessStairs !== undefined) setAccessStairsState(prefs.accessStairs);
          if (prefs.accessElevator !== undefined) setAccessElevatorState(prefs.accessElevator);
          if (prefs.accessWheelchair !== undefined) setAccessWheelchairState(prefs.accessWheelchair);
          if (prefs.accessContrast !== undefined) setAccessContrastState(prefs.accessContrast);
          if (prefs.accessTextSize !== undefined) setAccessTextSizeState(prefs.accessTextSize);
        }
        setIsRolePickerOpen(!data.role);
      } else {
        setUser({
          uid: sbUser.id,
          email: sbUser.email || "",
          name: sbUser.email?.split('@')[0] || "Spectator",
          role: ""
        });
        setIsRolePickerOpen(true);
      }
    } catch (err) {
      console.error("Sync profile error:", err);
    }
  };

  // Notification helper
  const addNotification = useCallback((message: string, role: AppNotification["role"] = "all", type: AppNotification["type"] = "info") => {
    const newNotif: AppNotification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      role,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    
    // Trigger web notification toast if user role matches or it's public
    if (user && (role === "all" || role === user.role)) {
      if (type === "warning") toast.warning(message);
      else if (type === "error") toast.error(message);
      else if (type === "success") toast.success(message);
      else toast.info(message);
    }
  }, [user]);


  const clearNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // WEATHER SIMULATOR
  const setWeather = useCallback((newWeather: "Sunny" | "Rainy" | "Windy" | "Clear") => {
    setWeatherState(newWeather);
    addNotification(`Stadium weather update: now ${newWeather}.`, "all", "info");
  }, [addNotification]);

  // MATCH PHASE CONTROLLER (Drives deterministic simulation changes)
  const setMatchPhase = useCallback((phase: MatchPhase) => {
    setMatchPhaseState(phase);
    
    let initZones: Zone[] = [];
    let initQueues: Queue[] = [];
    let msg = "";

    switch (phase) {
      case "PRE_MATCH":
        initZones = [
          { id: "gate_a", name: "East Gate A (Entry)", current_density: 0.82, max_capacity: 5000, status: "Congested" },
          { id: "gate_b", name: "West Gate B (Entry)", current_density: 0.88, max_capacity: 4000, status: "Congested" },
          { id: "concourse_1", name: "Level 1 Concourse", current_density: 0.45, max_capacity: 8000, status: "Normal" },
          { id: "food_court", name: "Central Plaza Food Court", current_density: 0.35, max_capacity: 2000, status: "Normal" },
          { id: "vip_lounge", name: "Executive VIP Lounge", current_density: 0.15, max_capacity: 500, status: "Normal" },
        ];
        initQueues = [
          { id: "main_food", name: "Gate C Turnstiles", wait_time: 14, length: 110 },
          { id: "burger", name: "Burger Prime (Sec 201)", wait_time: 8, length: 15 },
          { id: "pretzel", name: "Pretzel Stand (Sec 203)", wait_time: 3, length: 5 },
        ];
        msg = "Match Phase: Pre-Match gates open. Crowd arriving at Gate entrances.";
        break;
      case "FIRST_HALF":
        initZones = [
          { id: "gate_a", name: "East Gate A (Entry)", current_density: 0.12, max_capacity: 5000, status: "Normal" },
          { id: "gate_b", name: "West Gate B (Entry)", current_density: 0.08, max_capacity: 4000, status: "Normal" },
          { id: "concourse_1", name: "Level 1 Concourse", current_density: 0.22, max_capacity: 8000, status: "Normal" },
          { id: "food_court", name: "Central Plaza Food Court", current_density: 0.18, max_capacity: 2000, status: "Normal" },
          { id: "vip_lounge", name: "Executive VIP Lounge", current_density: 0.65, max_capacity: 500, status: "Normal" },
        ];
        initQueues = [
          { id: "main_food", name: "Gate C Turnstiles", wait_time: 1, length: 4 },
          { id: "burger", name: "Burger Prime (Sec 201)", wait_time: 4, length: 7 },
          { id: "pretzel", name: "Pretzel Stand (Sec 203)", wait_time: 2, length: 3 },
        ];
        msg = "Match Phase: Game In-Progress (1st Half). Crowd settled in stands.";
        break;
      case "HALFTIME":
        initZones = [
          { id: "gate_a", name: "East Gate A (Entry)", current_density: 0.08, max_capacity: 5000, status: "Normal" },
          { id: "gate_b", name: "West Gate B (Entry)", current_density: 0.05, max_capacity: 4000, status: "Normal" },
          { id: "concourse_1", name: "Level 1 Concourse", current_density: 0.85, max_capacity: 8000, status: "Congested" },
          { id: "food_court", name: "Central Plaza Food Court", current_density: 0.94, max_capacity: 2000, status: "Critical" },
          { id: "vip_lounge", name: "Executive VIP Lounge", current_density: 0.45, max_capacity: 500, status: "Normal" },
        ];
        initQueues = [
          { id: "main_food", name: "Gate C Turnstiles", wait_time: 2, length: 8 },
          { id: "burger", name: "Burger Prime (Sec 201)", wait_time: 26, length: 145 },
          { id: "pretzel", name: "Pretzel Stand (Sec 203)", wait_time: 12, length: 45 },
        ];
        msg = "Match Phase: Halftime Interval. High concourse congestion & concessions queue spike.";
        break;
      case "SECOND_HALF":
        initZones = [
          { id: "gate_a", name: "East Gate A (Entry)", current_density: 0.10, max_capacity: 5000, status: "Normal" },
          { id: "gate_b", name: "West Gate B (Entry)", current_density: 0.05, max_capacity: 4000, status: "Normal" },
          { id: "concourse_1", name: "Level 1 Concourse", current_density: 0.18, max_capacity: 8000, status: "Normal" },
          { id: "food_court", name: "Central Plaza Food Court", current_density: 0.15, max_capacity: 2000, status: "Normal" },
          { id: "vip_lounge", name: "Executive VIP Lounge", current_density: 0.72, max_capacity: 500, status: "Normal" },
        ];
        initQueues = [
          { id: "main_food", name: "Gate C Turnstiles", wait_time: 1, length: 2 },
          { id: "burger", name: "Burger Prime (Sec 201)", wait_time: 3, length: 5 },
          { id: "pretzel", name: "Pretzel Stand (Sec 203)", wait_time: 1, length: 2 },
        ];
        msg = "Match Phase: Game In-Progress (2nd Half). Crowd in seats.";
        break;
      case "POST_MATCH":
        initZones = [
          { id: "gate_a", name: "East Gate A (Exit)", current_density: 0.94, max_capacity: 5000, status: "Critical" },
          { id: "gate_b", name: "West Gate B (Exit)", current_density: 0.96, max_capacity: 4000, status: "Critical" },
          { id: "concourse_1", name: "Level 1 Concourse", current_density: 0.74, max_capacity: 8000, status: "Congested" },
          { id: "food_court", name: "Central Plaza Food Court", current_density: 0.10, max_capacity: 2000, status: "Normal" },
          { id: "vip_lounge", name: "Executive VIP Lounge", current_density: 0.32, max_capacity: 500, status: "Normal" },
        ];
        initQueues = [
          { id: "main_food", name: "Gate C Turnstiles", wait_time: 32, length: 280 },
          { id: "burger", name: "Burger Prime (Sec 201)", wait_time: 2, length: 2 },
          { id: "pretzel", name: "Pretzel Stand (Sec 203)", wait_time: 1, length: 1 },
        ];
        msg = "Match Phase: Post-Match. Exit flow initialized. Transport lines heavily congested.";
        break;
    }

    setZones(initZones);
    setQueues(initQueues);
    addNotification(msg, "all", "success");

    // Fetch new AI recommendations matching the shifted phase context
    if (user?.role === "venue_staff" || user?.role === "organizer") {
      fetch(getApiUrl("/api/sustainability/recommendations"))
        .then(res => res.json())
        .then(data => setSustainabilityTips(data.recommendations || []))
        .catch(err => console.error(err));

      fetch(getApiUrl("/api/venue/maintenance"))
        .then(res => res.json())
        .then(data => setMaintenanceTasks(data.suggestions || []))
        .catch(err => console.error(err));
    }
  }, [user, addNotification]);

  // Auth sync
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) syncProfile(session.user);
      else setUser(null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) syncProfile(session.user);
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Listen for Incidents (Live Supabase Sync or initial mock seeding)
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIncidents([
        { type: "HVAC Outage", location: "Concourse B", severity: "Medium", description: "AC system shut down in corridor B." },
        { type: "Gate Congestion", location: "East Gate A", severity: "High", description: "High ticket scanning delays." }
      ]);
      return;
    }

    supabase.from("incidents").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) {
        const mapped = data.map(inc => ({
          id: inc.id,
          type: inc.type,
          location: inc.location,
          severity: inc.severity,
          description: inc.description,
          status: inc.status,
          aiSummary: inc.ai_summary || inc.summary || "",
          aiPriority: inc.ai_priority || inc.severity || "MEDIUM",
          aiResponse: inc.ai_response || "Deploy security dispatcher.",
          timestamp: inc.created_at
        }));
        setIncidents(mapped);
      }
    });

    const channel = supabase
      .channel("incidents-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const inc = payload.new;
          const mappedInc = {
            id: inc.id,
            type: inc.type,
            location: inc.location,
            severity: inc.severity,
            description: inc.description,
            status: inc.status,
            aiSummary: inc.ai_summary || inc.summary || "",
            aiPriority: inc.ai_priority || inc.severity || "MEDIUM",
            aiResponse: inc.ai_response || "Deploy security dispatcher.",
            timestamp: inc.created_at
          };
          setIncidents(prev => [mappedInc, ...prev]);
          addNotification(`🚨 New incident reported: ${inc.type} at ${inc.location}.`, "security", "warning");
          addNotification(`🚨 Incident reported: ${inc.type} at ${inc.location}.`, "organizer", "warning");
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [addNotification]);



  // REAL-TIME SMART STADIUM SIMULATION LOOP
  useDashboardSimulation({
    matchPhase,
    weather,
    incidents,
    zones,
    setZones,
    setMetrics,
    setChartHistory,
    addNotification,
    setMatchPhase
  });

  // Auth selection
  const handleRoleSelection = useCallback(async (selectedRole: string) => {
    if (!user) return;
    const updated = { ...user, role: selectedRole };
    setUser(updated);
    setIsRolePickerOpen(false);
    setActiveTab("dashboard");
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from("profiles").update({ role: selectedRole }).eq("id", user.uid);
      } catch (e) {
        console.error("Failed to update role:", e);
      }
    }
    toast.success(`Role configured as ${selectedRole.replace("_", " ").toUpperCase()}`);
    addNotification(`Logged in as ${selectedRole.replace("_", " ").toUpperCase()}. Mode Active.`, selectedRole as AppNotification["role"], "info");
  }, [user, addNotification]);

  const handleSignOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem("stadiumos_mock_user");
      toast.success("Logged out");
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out");
  }, []);

  const handleJudgeAutoLogin = useCallback((demoRole: string) => {
    const profile: UserProfile = { 
      uid: `demo_judge_${demoRole}`, 
      email: `${demoRole}@stadiumos.org`, 
      name: `Demo ${demoRole.replace("_", " ").toUpperCase()}`, 
      role: demoRole
    };
    setUser(profile);
    toast.success(`Logged in as Demo ${demoRole.replace("_", " ").toUpperCase()}!`);
    
    // Seed initial notification
    addNotification(`Operations profile initialized: Demo ${demoRole.replace("_", " ").toUpperCase()}`, demoRole as AppNotification["role"], "success");
    setMatchPhase("PRE_MATCH");
  }, [addNotification, setMatchPhase]);

  const handleGenerateAnnouncement = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAnnouncement(true);
    try {
      const res = await fetch(getApiUrl("/api/announcements/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcementInputs)
      });
      const data = await res.json();
      setGeneratedAnnouncement(data);
      toast.success("Announcement written successfully!");
      addNotification(`📢 Public broadcast alert generated for ${announcementInputs.location}.`, "organizer", "success");
    } catch {
      toast.error("Failed to generate announcement.");
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  }, [announcementInputs, addNotification]);

  const handleSubmitIncident = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIncident(true);
    try {
      const res = await fetch(getApiUrl("/api/incidents"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident)
      });
      const data = await res.json();
      setRecentIncidentAI(data);
      
      const newIncObj: Incident = {
        type: newIncident.type,
        location: newIncident.location,
        severity: newIncident.severity,
        description: newIncident.description,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiSummary: data.summary,
        aiPriority: data.priority,
        aiResponse: data.suggested_response
      };

      setIncidents(prev => [newIncObj, ...prev]);
      
      // Update charts & trigger notifications
      addNotification(`🚨 New Incident reported: ${newIncident.type} at ${newIncident.location}!`, "security", "error");
      addNotification(`🚨 Incident registered: ${newIncident.type} at ${newIncident.location}. Dispatch sent.`, "organizer", "warning");

      toast.success("Incident registered & processed by AI.");
      setNewIncident({ type: "Crowd Overflow", location: "Concourse B", severity: "High", description: "" });
    } catch {
      toast.error("Failed to log incident.");
    } finally {
      setIsSubmittingIncident(false);
    }
  }, [newIncident, addNotification]);

  const handleReportLostItem = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!lostItemInput.name || !lostItemInput.loc) return;
    
    const isMatched = foundItems.some(item => 
      item.name.toLowerCase().includes(lostItemInput.name.toLowerCase()) ||
      lostItemInput.desc.toLowerCase().includes(item.name.toLowerCase())
    );
    
    if (isMatched) {
      toast.success("Match Found! Proceed to Central Security Office.", { duration: 6000 });
      addNotification(`📦 Lost item matched: ${lostItemInput.name} located at Security Office.`, "fan", "success");
    } else {
      toast.info("Item registered. We will alert you if matches appear.");
    }
    setLostItems(prev => [lostItemInput, ...prev]);
    setLostItemInput({ name: "", desc: "", loc: "" });
  }, [lostItemInput, foundItems, addNotification]);

  const theme = ROLE_THEMES[user?.role || "fan"] || ROLE_THEMES.fan;

  const contextValue = useMemo(() => ({
    user, setUser, isRolePickerOpen, setIsRolePickerOpen, language, setLanguage,
    zones, setZones, queues, setQueues, metrics, activeTab, setActiveTab,
    isAIOpen, setIsAIOpen, joinedQueue, setJoinedQueue,
    queuePosition, setQueuePosition, queueWaitTime, setQueueWaitTime, queueFilter, setQueueFilter,
    activeMapMarker, setActiveMapMarker, searchQuery, setSearchQuery,
    accessStairs, setAccessStairs, accessElevator, setAccessElevator,
    accessWheelchair, setAccessWheelchair, accessContrast, setAccessContrast,
    accessTextSize, setAccessTextSize,
    incidents, setIncidents, newIncident, setNewIncident, recentIncidentAI, setRecentIncidentAI,
    isSubmittingIncident, handleSubmitIncident,
    announcementInputs, setAnnouncementInputs, generatedAnnouncement, setGeneratedAnnouncement,
    isGeneratingAnnouncement, handleGenerateAnnouncement,
    sustainabilityTips, maintenanceTasks,
    lostItems, lostItemInput, setLostItemInput, foundItems, setFoundItems, handleReportLostItem,
    handleRoleSelection, handleSignOut, handleJudgeAutoLogin, t, theme,
    matchPhase, setMatchPhase, weather, setWeather, notifications, clearNotification, chartHistory, addNotification
  }), [
    user, isRolePickerOpen, language, zones, queues, metrics, activeTab, isAIOpen, joinedQueue,
    queuePosition, queueWaitTime, queueFilter, activeMapMarker, searchQuery,
    accessStairs, setAccessStairs, accessElevator, setAccessElevator,
    accessWheelchair, setAccessWheelchair, accessContrast, setAccessContrast,
    accessTextSize, setAccessTextSize, setLanguage,
    incidents, newIncident, recentIncidentAI, isSubmittingIncident, handleSubmitIncident,
    announcementInputs, generatedAnnouncement, isGeneratingAnnouncement, handleGenerateAnnouncement,
    sustainabilityTips, maintenanceTasks, lostItems, lostItemInput, foundItems, handleReportLostItem,
    handleRoleSelection, handleSignOut, handleJudgeAutoLogin, t, theme,
    matchPhase, setMatchPhase, weather, setWeather, notifications, clearNotification, chartHistory, addNotification
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
