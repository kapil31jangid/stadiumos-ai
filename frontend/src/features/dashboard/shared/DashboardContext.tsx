"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

// ================= TYPES & INTERFACES =================
export interface Zone {
  id: string;
  name: string;
  current_density: number;
  max_capacity: number;
  status: string;
}

export interface Queue {
  id: string;
  name: string;
  wait_time: number;
  length: number;
}

export interface Incident {
  id?: string;
  type: string;
  location: string;
  severity: string;
  description: string;
  timestamp?: string;
  aiSummary?: string;
  aiPriority?: string;
  aiResponse?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
}

export interface RoleTheme {
  accent: string;
  text: string;
  bg: string;
  border: string;
  hoverBg: string;
  lightBg: string;
  shadow: string;
}

export interface AppNotification {
  id: number;
  message: string;
  role: "all" | "fan" | "volunteer" | "security" | "organizer" | "venue_staff";
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
}

export const ROLE_THEMES: Record<string, RoleTheme> = {
  fan: {
    accent: "blue",
    text: "text-blue-400",
    bg: "bg-blue-600",
    border: "border-blue-500/20",
    hoverBg: "hover:bg-blue-700",
    lightBg: "bg-blue-950/20",
    shadow: "shadow-blue-600/10",
  },
  volunteer: {
    accent: "green",
    text: "text-green-400",
    bg: "bg-green-600",
    border: "border-green-500/20",
    hoverBg: "hover:bg-green-700",
    lightBg: "bg-green-950/20",
    shadow: "shadow-green-600/10",
  },
  security: {
    accent: "red",
    text: "text-red-400",
    bg: "bg-red-600",
    border: "border-red-500/20",
    hoverBg: "hover:bg-red-700",
    lightBg: "bg-red-950/20",
    shadow: "shadow-red-600/10",
  },
  organizer: {
    accent: "purple",
    text: "text-purple-400",
    bg: "bg-purple-600",
    border: "border-purple-500/20",
    hoverBg: "hover:bg-purple-700",
    lightBg: "bg-purple-950/20",
    shadow: "shadow-purple-600/10",
  },
  venue_staff: {
    accent: "orange",
    text: "text-orange-400",
    bg: "bg-orange-600",
    border: "border-orange-500/20",
    hoverBg: "hover:bg-orange-700",
    lightBg: "bg-orange-950/20",
    shadow: "shadow-orange-600/10",
  },
};

// ================= LANGUAGES DICTIONARY =================
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    liveTicker: "Live Ticker",
    gateInfo: "Gate Info",
    queues: "Queues",
    safety: "Safety",
    emergency: "Emergency",
    settings: "Settings",
    switchRole: "Switch Role",
    roleOnboarding: "Choose Your Role",
    announcements: "Announcements",
    transport: "Transport Status",
    sustainability: "Sustainability Center",
    incidentReport: "Incident Reporting",
    lostFound: "Lost & Found",
    accessibility: "Accessibility",
    aiAssistant: "StadiumOS AI Assistant",
    aiCommandCenter: "AI Operations Command",
    incidentType: "Incident Type",
    location: "Location",
    severity: "Severity",
    description: "Description",
    submit: "Submit",
    clearance: "Cleared",
    quickestConcession: "Quickest Option Nearby",
    waitEst: "Est. Wait",
    walkup: "Walk Up Only",
    savedEvents: "Saved Events",
    itinerary: "Today's Itinerary",
  },
  es: {
    dashboard: "Tablero",
    liveTicker: "Canal en Vivo",
    gateInfo: "Información de Puertas",
    queues: "Colas",
    safety: "Seguridad",
    emergency: "Emergencia",
    settings: "Configuración",
    switchRole: "Cambiar Rol",
    roleOnboarding: "Elige tu Rol",
    announcements: "Anuncios",
    transport: "Estado de Transporte",
    sustainability: "Centro de Sostenibilidad",
    incidentReport: "Reportar Incidente",
    lostFound: "Objetos Perdidos",
    accessibility: "Accesibilidad",
    aiAssistant: "Asistente AI StadiumOS",
    aiCommandCenter: "Comando de Operaciones AI",
    incidentType: "Tipo de Incidente",
    location: "Ubicación",
    severity: "Severidad",
    description: "Descripción",
    submit: "Enviar",
    clearance: "Despejado",
    quickestConcession: "Opción Más Rápida Cercana",
    waitEst: "Espera Est.",
    walkup: "Solo Caminar",
    savedEvents: "Eventos Guardados",
    itinerary: "Itinerario de Hoy",
  },
  fr: {
    dashboard: "Tableau de Bord",
    liveTicker: "Flux en Direct",
    gateInfo: "Infos Portes",
    queues: "Files d'Attente",
    safety: "Sécurité",
    emergency: "Urgence",
    settings: "Paramètres",
    switchRole: "Changer de Rôle",
    roleOnboarding: "Choisissez votre rôle",
    announcements: "Annonces",
    transport: "Statut des Transports",
    sustainability: "Centre de Durabilité",
    incidentReport: "Rapport d'Incident",
    lostFound: "Objets Trouvés",
    accessibility: "Accessibilité",
    aiAssistant: "Assistant IA StadiumOS",
    aiCommandCenter: "Commandement des Opérations IA",
    incidentType: "Type d'Incident",
    location: "Lieu",
    severity: "Gravité",
    description: "Description",
    submit: "Soumettre",
    clearance: "Résolu",
    quickestConcession: "Option la Plus Rapide à Proximité",
    waitEst: "Attente Est.",
    walkup: "Accès Libre",
    savedEvents: "Événements Sauvegardés",
    itinerary: "Itinéraire du Jour",
  },
  ar: {
    dashboard: "لوحة القيادة",
    liveTicker: "البث المباشر",
    gateInfo: "معلومات البوابة",
    queues: "الطوابير",
    safety: "الأمان",
    emergency: "الطوارئ",
    settings: "الإعدادات",
    switchRole: "تغيير الدور",
    roleOnboarding: "اختر دورك",
    announcements: "الإعلانات",
    transport: "حالة النقل",
    sustainability: "مركز الاستدامة",
    incidentReport: "الإبلاغ عن الحوادث",
    lostFound: "المفقودات والمعثورات",
    accessibility: "سهولة الوصول",
    aiAssistant: "مساعد الذكاء الاصطناعي StadiumOS",
    aiCommandCenter: "مركز عمليات الذكاء الاصطناعي",
    incidentType: "نوع الحادث",
    location: "الموقع",
    severity: "الخطورة",
    description: "الوصف",
    submit: "إرسال",
    clearance: "تمت التسوية",
    quickestConcession: "أسرع خيار قريب",
    waitEst: "الانتظار المتوقع",
    walkup: "دخول مباشر فقط",
    savedEvents: "الفعاليات المحفوظة",
    itinerary: "جدول اليوم",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    liveTicker: "लाइव टिकर",
    gateInfo: "गेट जानकारी",
    queues: "कतारें",
    safety: "सुरक्षा",
    emergency: "आपातकालीन",
    settings: "सेटिंग्स",
    switchRole: "भूमिका बदलें",
    roleOnboarding: "अपनी भूमिका चुनें",
    announcements: "घोषणाएँ",
    transport: "परिवहन स्थिति",
    sustainability: "स्थिरता केंद्र",
    incidentReport: "घटना की रिपोर्ट",
    lostFound: "खोया and पाया",
    accessibility: "सुगम्यता",
    aiAssistant: "StadiumOS एआई सहायक",
    aiCommandCenter: "एआई संचालन कमान",
    incidentType: "घटना का प्रकार",
    location: "स्थान",
    severity: "तीव्रता",
    description: "विवरण",
    submit: "जमा करें",
    clearance: "सुलझाया गया",
    quickestConcession: "पास का सबसे तेज़ विकल्प",
    waitEst: "अनुमानित प्रतीक्षा",
    walkup: "केवल वॉक अप",
    savedEvents: "सहेजे गए कार्यक्रम",
    itinerary: "आज की समय-सारिणी",
  },
  ja: {
    dashboard: "ダッシュボード",
    liveTicker: "ライブティッカー",
    gateInfo: "ゲート情報",
    queues: "行列情報",
    safety: "安全対策",
    emergency: "緊急事態",
    settings: "設定",
    switchRole: "ロール切り替え",
    roleOnboarding: "ロールを選択してください",
    announcements: "アナウンス",
    transport: "交通状況",
    sustainability: "サステナビリティセンター",
    incidentReport: "インシデント報告",
    lostFound: "落とし物・忘れ物",
    accessibility: "アクセシビリティ",
    aiAssistant: "StadiumOS AIアシスタント",
    aiCommandCenter: "AI運用指令センター",
    incidentType: "インシデント種別",
    location: "発生場所",
    severity: "深刻度",
    description: "詳細説明",
    submit: "送信",
    clearance: "解決済み",
    quickestConcession: "近隣 of 最速オプション",
    waitEst: "予想待ち時間",
    walkup: "直接並ぶのみ",
    savedEvents: "保存されたイベント",
    itinerary: "本日の日程",
  }
};

export type MatchPhase = "PRE_MATCH" | "FIRST_HALF" | "HALFTIME" | "SECOND_HALF" | "POST_MATCH";

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
  timeLeft: { hrs: number; min: number; sec: number };
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
  
  // Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hrs: 2, min: 42, sec: 15 });
  
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

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined" && window.location.port === "3000") {
      return `http://localhost:8080${path}`;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${backendUrl}${path}`;
  };

  // Language & Pref sync
  const setLanguage = async (lang: "en" | "es" | "fr" | "ar" | "hi" | "ja") => {
    setLanguageState(lang);
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from("profiles").update({ language: lang }).eq("id", user.uid);
      } catch (e) {
        console.error("Failed to update language:", e);
      }
    }
  };

  const syncPreference = async (key: string, value: any) => {
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
  };

  const setAccessStairs = (val: boolean) => { setAccessStairsState(val); syncPreference("accessStairs", val); };
  const setAccessElevator = (val: boolean) => { setAccessElevatorState(val); syncPreference("accessElevator", val); };
  const setAccessWheelchair = (val: boolean) => { setAccessWheelchairState(val); syncPreference("accessWheelchair", val); };
  const setAccessContrast = (val: boolean) => { setAccessContrastState(val); syncPreference("accessContrast", val); };
  const setAccessTextSize = (val: "normal" | "large" | "huge") => { setAccessTextSizeState(val); syncPreference("accessTextSize", val); };

  const syncProfile = async (sbUser: any) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", sbUser.id).single();
      if (data) {
        setUser({
          uid: data.id,
          email: data.email,
          name: data.name || sbUser.email?.split('@')[0] || "Spectator",
          role: data.role || ""
        });
        if (data.language) setLanguageState(data.language as any);
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
  const addNotification = (message: string, role: AppNotification["role"] = "all", type: AppNotification["type"] = "info") => {
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
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // WEATHER SIMULATOR
  const setWeather = (newWeather: "Sunny" | "Rainy" | "Windy" | "Clear") => {
    setWeatherState(newWeather);
    addNotification(`Stadium weather update: now ${newWeather}.`, "all", "info");
  };

  // MATCH PHASE CONTROLLER (Drives deterministic simulation changes)
  const setMatchPhase = (phase: MatchPhase) => {
    setMatchPhaseState(phase);
    
    let timeObj = { hrs: 0, min: 0, sec: 0 };
    let initZones: Zone[] = [];
    let initQueues: Queue[] = [];
    let msg = "";

    switch (phase) {
      case "PRE_MATCH":
        timeObj = { hrs: 2, min: 42, sec: 15 };
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
        timeObj = { hrs: 0, min: 25, sec: 0 };
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
        timeObj = { hrs: 0, min: 15, sec: 0 };
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
        timeObj = { hrs: 0, min: 72, sec: 0 };
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
        timeObj = { hrs: 0, min: 45, sec: 0 };
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

    setTimeLeft(timeObj);
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
  };

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
  }, []);

  // Countdown clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // REAL-TIME SMART STADIUM SIMULATION LOOP
  // Simulates realistic crowd fluctuations, updates charts, spawns random events/notifications
  useEffect(() => {
    // Initialise simulation values if zones is empty
    if (zones.length === 0) {
      setMatchPhase("PRE_MATCH");
    }

    const interval = setInterval(() => {
      // 1. Tick zones crowd density with minor realistic fluctuations (+/- 3%)
      setZones((prevZones) => {
        const nextZones = prevZones.map((z) => {
          let drift = (Math.random() - 0.5) * 0.05;
          
          // Phase-based constraint bounds
          let minDen = 0.05;
          let maxDen = 0.99;
          if (matchPhase === "PRE_MATCH" && (z.id === "gate_a" || z.id === "gate_b")) {
            minDen = 0.70;
          } else if (matchPhase === "HALFTIME" && z.id === "food_court") {
            minDen = 0.85;
          } else if (matchPhase === "POST_MATCH" && (z.id === "gate_a" || z.id === "gate_b")) {
            minDen = 0.80;
          }

          const current_density = Math.max(minDen, Math.min(maxDen, z.current_density + drift));
          let status = "Normal";
          if (current_density > 0.8) status = "Congested";
          if (current_density > 0.95) status = "Critical";

          return { ...z, current_density, status };
        });

        // Update global Metrics
        let totalDensity = 0;
        let criticalCount = 0;
        nextZones.forEach((z) => {
          totalDensity += z.current_density;
          if (z.status === "Critical" || z.status === "Congested") {
            criticalCount++;
          }
        });
        setMetrics({
          avgOccupancy: nextZones.length > 0 ? totalDensity / nextZones.length : 0.45,
          criticalZones: criticalCount,
          totalZones: nextZones.length
        });

        // 2. Roll for Random Stadium Event (10% chance per 6 seconds)
        if (Math.random() < 0.10) {
          const events = [
            { msg: "Gate C Entry queue approaching wait-limit of 30 min.", role: "security", type: "warning" },
            { msg: "Medical alert dispatched to Section 204.", role: "organizer", type: "error" },
            { msg: "Solar Grid generation optimized: solar now meeting 35% load.", role: "venue_staff", type: "success" },
            { msg: "Metro departures delayed due to line maintenance.", role: "fan", type: "warning" },
            { msg: "Cleaning priority request raised at Central Food Court.", role: "venue_staff", type: "info" },
            { msg: "Turnstile Gate B scanner back online.", role: "security", type: "success" },
            { msg: "High traffic detected at Block B Restrooms.", role: "volunteer", type: "info" },
            { msg: "A child has been reunited with family at Security Central.", role: "volunteer", type: "success" }
          ];
          const choice = events[Math.floor(Math.random() * events.length)];
          addNotification(choice.msg, choice.role as any, choice.type as any);
        }

        // 3. Update Chart Histories with new live simulation points
        setChartHistory((prevHistory) => {
          const avgD = nextZones.length > 0 ? totalDensity / nextZones.length : 0.5;
          const currentOccupancyPct = Math.round(avgD * 100);
          
          // Compute derived energy & volunteer values
          const activeIncidentsCount = incidents.filter(i => i.severity === "High" || i.severity === "Critical").length;
          const calculatedEnergy = Math.round(200 + avgD * 200 + (weather === "Rainy" ? 50 : 0));
          const calculatedVolunteer = Math.round(30 + activeIncidentsCount * 15 + avgD * 40);

          return {
            occupancy: [...prevHistory.occupancy.slice(1), currentOccupancyPct],
            queues: [...prevHistory.queues.slice(1), Math.round(20 + Math.random() * 8)],
            incidents: [...prevHistory.incidents.slice(1), incidents.length],
            energy: [...prevHistory.energy.slice(1), calculatedEnergy],
            volunteer: [...prevHistory.volunteer.slice(1), Math.min(100, calculatedVolunteer)]
          };
        });

        return nextZones;
      });

    }, 6000);

    return () => clearInterval(interval);
  }, [matchPhase, weather, incidents.length]);

  // Auth selection
  const handleRoleSelection = async (selectedRole: string) => {
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
    addNotification(`Logged in as ${selectedRole.replace("_", " ").toUpperCase()}. Mode Active.`, selectedRole as any, "info");
  };

  const handleSignOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem("stadiumos_mock_user");
      toast.success("Logged out");
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out");
  };

  const handleJudgeAutoLogin = (demoRole: string) => {
    const profile = { 
      uid: `demo_judge_${demoRole}`, 
      email: `${demoRole}@stadiumos.org`, 
      name: `Demo ${demoRole.replace("_", " ").toUpperCase()}`, 
      role: demoRole,
      language: "en"
    };
    setUser(profile as any);
    toast.success(`Logged in as Demo ${demoRole.replace("_", " ").toUpperCase()}!`);
    
    // Seed initial notification
    addNotification(`Operations profile initialized: Demo ${demoRole.replace("_", " ").toUpperCase()}`, demoRole as any, "success");
    setMatchPhase("PRE_MATCH");
  };

  const handleGenerateAnnouncement = async (e: React.FormEvent) => {
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
    } catch (err) {
      toast.error("Failed to generate announcement.");
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
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
    } catch (err) {
      toast.error("Failed to log incident.");
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleReportLostItem = (e: React.FormEvent) => {
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
  };

  const theme = ROLE_THEMES[user?.role || "fan"] || ROLE_THEMES.fan;

  return (
    <DashboardContext.Provider value={{
      user, setUser, isRolePickerOpen, setIsRolePickerOpen, language, setLanguage,
      zones, setZones, queues, setQueues, metrics, activeTab, setActiveTab,
      isAIOpen, setIsAIOpen, timeLeft, joinedQueue, setJoinedQueue,
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

      // Extensions
      matchPhase, setMatchPhase, weather, setWeather, notifications, clearNotification, chartHistory, addNotification
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
