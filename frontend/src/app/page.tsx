"use client";

import React, { useEffect, useState } from "react";
import { db, auth, isFirebaseConfigured } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ChatInterface } from "@/components/ChatInterface";
import { 
  Activity, 
  Map, 
  Hourglass, 
  Shield, 
  AlertOctagon, 
  Settings, 
  Bell, 
  User, 
  Bot, 
  QrCode, 
  Utensils, 
  Zap, 
  Share2, 
  Send, 
  Trash2, 
  Compass, 
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  Coffee,
  Check,
  Languages,
  LogOut,
  Users,
  AlertTriangle,
  FolderOpen,
  FileText,
  Wrench,
  Droplet,
  Flame,
  LineChart,
  ClipboardList,
  Eye,
  Sliders,
  RefreshCw,
  Plus
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";

// ================= LANGUAGES DICTIONARY =================
const TRANSLATIONS: Record<string, Record<string, string>> = {
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
    lostFound: "खोया और पाया",
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
    quickestConcession: "近隣の最速オプション",
    waitEst: "予想待ち時間",
    walkup: "直接並ぶのみ",
    savedEvents: "保存されたイベント",
    itinerary: "本日の日程",
  }
};

interface Zone {
  id: string;
  name: string;
  current_density: number;
  max_capacity: number;
  status: string;
}

interface Queue {
  id: string;
  name: string;
  wait_time: number;
  length: number;
}

interface Incident {
  id?: string;
  type: string;
  location: string;
  severity: string;
  description: string;
  timestamp?: any;
  aiSummary?: string;
  aiPriority?: string;
  aiResponse?: string;
}

export default function Dashboard() {
  // Authentication State
  const [user, setUser] = useState<{ uid: string; email: string; name: string; role: string } | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);

  // Localization / Language State
  const [language, setLanguage] = useState<"en" | "es" | "fr" | "ar" | "hi" | "ja">("en");

  // Telemetry Lists
  const [zones, setZones] = useState<Zone[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [metrics, setMetrics] = useState({
    avgOccupancy: 0,
    criticalZones: 0,
    totalZones: 0
  });

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"ticker" | "gates" | "queues" | "safety" | "emergency" | "settings">("ticker");
  
  // Floating AI Chat
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, min: 42, sec: 15 });

  // Concessions / Digital Queues
  const [joinedQueue, setJoinedQueue] = useState<"burger" | "brews" | null>(null);
  const [queuePosition, setQueuePosition] = useState(42);
  const [queueWaitTime, setQueueWaitTime] = useState(24);
  const [queueFilter, setQueueFilter] = useState<"all" | "food" | "restrooms" | "merch">("all");

  // Interactive SVG Map marker
  const [activeMapMarker, setActiveMapMarker] = useState<"gate_4" | "burger_stand" | "restroom" | null>("gate_4");
  const [searchQuery, setSearchQuery] = useState("");

  // Accessibility State
  const [accessStairs, setAccessStairs] = useState(false);
  const [accessElevator, setAccessElevator] = useState(false);
  const [accessWheelchair, setAccessWheelchair] = useState(false);
  const [accessContrast, setAccessContrast] = useState(false);
  const [accessTextSize, setAccessTextSize] = useState<"normal" | "large" | "huge">("normal");

  // V2 AI Modules State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [newIncident, setNewIncident] = useState({ type: "Crowd Overflow", location: "Concourse B", severity: "High", description: "" });
  const [recentIncidentAI, setRecentIncidentAI] = useState<{ summary: string; priority: string; suggested_response: string } | null>(null);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const [announcementInputs, setAnnouncementInputs] = useState({ incident: "Lost Child", location: "Section 204", severity: "Medium" });
  const [generatedAnnouncement, setGeneratedAnnouncement] = useState<{ public_announcement: string; volunteer_instructions: string; security_brief: string; translations: Record<string, string> } | null>(null);
  const [isGeneratingAnnouncement, setIsGeneratingAnnouncement] = useState(false);

  const [sustainabilityTips, setSustainabilityTips] = useState<string[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<string[]>([]);

  // Lost & Found State
  const [lostItems, setLostItems] = useState<{ name: string; desc: string; loc: string }[]>([]);
  const [lostItemInput, setLostItemInput] = useState({ name: "", desc: "", loc: "" });
  const [foundItems, setFoundItems] = useState([
    { name: "Black leather wallet", loc: "Gate 4", matched: false },
    { name: "iPhone 15 pro max", loc: "Concourse A", matched: false },
    { name: "Blue World Cup cap", loc: "Section 203", matched: false }
  ]);

  // Translate helper
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  // Get API Base URL helper for dev/prod environments
  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined" && window.location.port === "3000") {
      return `http://localhost:8080${path}`;
    }
    return path;
  };

  // Listen to Auth State
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const mockUser = localStorage.getItem("stadiumos_mock_user");
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const docRef = doc(db, "users", fbUser.uid);
        const docSnap = await getDoc(docRef);
        let role = "";
        let name = fbUser.displayName || "Spectator";
        if (docSnap.exists()) {
          const data = docSnap.data();
          role = data.role || "";
          name = data.name || name;
        }
        setUser({ uid: fbUser.uid, email: fbUser.email || "", name, role });
        if (!role) {
          setIsRolePickerOpen(true);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase/Mock Listeners for incidents and crowd data
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Mock Incidents List
      setIncidents([
        { type: "HVAC Outage", location: "Concourse B", severity: "Medium", description: "AC system shut down in corridor B." },
        { type: "Gate Congestion", location: "East Gate A", severity: "High", description: "High ticket scanning delays." }
      ]);
      return;
    }
    const qIncidents = query(collection(db, "incidents"));
    const unsubscribeIncidents = onSnapshot(qIncidents, (snapshot) => {
      const list: Incident[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() as Incident });
      });
      setIncidents(list);
    });
    return () => unsubscribeIncidents();
  }, []);

  // Fetch Sustainability & Maintenance Suggestions on active tabs
  useEffect(() => {
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
  }, [user?.role]);

  // Running countdown timer
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

  // Firestore / Mock Simulation Effect
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const mockZones: Zone[] = [
        { id: "gate_a", name: "East Gate A", current_density: 0.25, max_capacity: 5000, status: "Normal" },
        { id: "gate_b", name: "West Gate B", current_density: 0.18, max_capacity: 4000, status: "Normal" },
        { id: "concourse_1", name: "Level 1 Concourse", current_density: 0.45, max_capacity: 8000, status: "Normal" },
        { id: "food_court", name: "Central Plaza Food Court", current_density: 0.65, max_capacity: 2000, status: "Normal" },
        { id: "vip_lounge", name: "Executive VIP Lounge", current_density: 0.12, max_capacity: 500, status: "Normal" },
      ];

      const mockQueues: Queue[] = [
        { id: "main_food", name: "Central Food Court", wait_time: 15, length: 30 }
      ];

      setZones(mockZones);
      setQueues(mockQueues);
      
      const updateMockMetrics = (currentZones: Zone[]) => {
        let totalDensity = 0;
        let critical = 0;
        currentZones.forEach((z) => {
          totalDensity += z.current_density;
          if (z.status === "Critical") {
            critical++;
          }
        });
        setMetrics({
          avgOccupancy: currentZones.length > 0 ? totalDensity / currentZones.length : 0,
          criticalZones: critical,
          totalZones: currentZones.length
        });
      };

      updateMockMetrics(mockZones);

      const interval = setInterval(() => {
        setZones((prevZones) => {
          const updated = prevZones.map((z) => {
            const fluctuation = (Math.random() - 0.5) * 0.1;
            const current_density = Math.max(0, Math.min(1.0, z.current_density + fluctuation));
            
            let status = "Normal";
            if (current_density > 0.8) {
              status = "Congested";
            }
            if (current_density > 0.95) {
              status = "Critical";
            }

            return { ...z, current_density, status };
          });
          
          updateMockMetrics(updated);
          
          const foodCourtZone = updated.find(z => z.id === "food_court");
          if (foodCourtZone) {
            setQueues((prevQueues) => 
              prevQueues.map((q) => {
                if (q.id === "main_food") {
                  return {
                    ...q,
                    wait_time: Math.round(foodCourtZone.current_density * 45),
                    length: Math.round(foodCourtZone.current_density * 100)
                  };
                }
                return q;
              })
            );
          }

          return updated;
        });
      }, 5000);

      return () => clearInterval(interval);
    }

    const qZones = query(collection(db, "zones"));
    const unsubscribeZones = onSnapshot(qZones, (snapshot) => {
      const zonesData: Zone[] = [];
      let totalDensity = 0;
      let critical = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Record<string, any>;
        const current_density = data.current_density ?? data.density ?? 0;
        
        zonesData.push({ 
          id: doc.id, 
          name: data.name,
          current_density,
          max_capacity: data.max_capacity ?? data.capacity ?? 0,
          status: data.status ?? "Normal"
        });
        
        totalDensity += current_density;
        if (data.status === "Critical") {
          critical++;
        }
      });

      setZones(zonesData);
      setMetrics({
        avgOccupancy: zonesData.length > 0 ? totalDensity / zonesData.length : 0,
        criticalZones: critical,
        totalZones: zonesData.length
      });
    });

    const qQueues = query(collection(db, "queues"));
    const unsubscribeQueues = onSnapshot(qQueues, (snapshot) => {
      const queuesData: Queue[] = [];
      snapshot.forEach((doc) => {
        queuesData.push({ id: doc.id, ...doc.data() as Omit<Queue, 'id'> });
      });
      setQueues(queuesData);
    });

    return () => {
      unsubscribeZones();
      unsubscribeQueues();
    };
  }, []);

  // Firebase Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!isFirebaseConfigured) {
      // Mock Auth Success
      const profile = { uid: "mock_user_123", email: authEmail, name: authName || "User", role: "" };
      setUser(profile);
      setIsRolePickerOpen(true);
      toast.success("Mock Sign-in Successful!");
      return;
    }
    try {
      if (authMode === "signin") {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        toast.success("Successfully logged in!");
      } else {
        const result = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        // save initial user doc
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: authName || "Explorer",
          email: authEmail,
          role: "",
          createdAt: serverTimestamp()
        });
        toast.success("Account created successfully!");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      const profile = { uid: "mock_google_123", email: "fan@worldcup.com", name: "G-Explorer", role: "" };
      setUser(profile);
      setIsRolePickerOpen(true);
      toast.success("Mock Google Login Successful!");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({ uid: result.user.uid, email: result.user.email || "", name: result.user.displayName || "Explorer", role: data.role || "" });
      } else {
        await setDoc(docRef, {
          uid: result.user.uid,
          name: result.user.displayName || "Explorer",
          email: result.user.email || "",
          role: "",
          createdAt: serverTimestamp()
        });
        setUser({ uid: result.user.uid, email: result.user.email || "", name: result.user.displayName || "Explorer", role: "" });
        setIsRolePickerOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRoleSelection = async (selectedRole: string) => {
    if (!user) return;
    const updated = { ...user, role: selectedRole };
    setUser(updated);
    setIsRolePickerOpen(false);
    
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", user.uid), { role: selectedRole }, { merge: true });
      } catch (e) {
        console.error("Failed to update role in firestore:", e);
      }
    } else {
      localStorage.setItem("stadiumos_mock_user", JSON.stringify(updated));
    }
    toast.success(`Role configured as ${selectedRole.toUpperCase()}`);
  };

  const handleSignOut = async () => {
    if (!isFirebaseConfigured) {
      setUser(null);
      localStorage.removeItem("stadiumos_mock_user");
      toast.success("Logged out");
      return;
    }
    await signOut(auth);
    setUser(null);
    toast.success("Logged out");
  };

  // AI Announcement Generation
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
    } catch (err) {
      toast.error("Failed to generate announcement.");
    } finally {
      setIsGeneratingAnnouncement(false);
    }
  };

  // AI Incident Submission
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
      
      const logItem: Incident = {
        type: newIncident.type,
        location: newIncident.location,
        severity: newIncident.severity,
        description: newIncident.description,
        aiSummary: data.summary,
        aiPriority: data.priority,
        aiResponse: data.suggested_response
      };
      
      setIncidents(prev => [logItem, ...prev]);
      toast.success("Incident registered & processed by AI.");
      setNewIncident({ type: "Crowd Overflow", location: "Concourse B", severity: "High", description: "" });
    } catch (err) {
      toast.error("Failed to log incident.");
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  // Lost & Found report handler
  const handleReportLostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostItemInput.name || !lostItemInput.loc) return;
    
    // Call AI match simulator
    const isMatched = foundItems.some(item => 
      item.name.toLowerCase().includes(lostItemInput.name.toLowerCase()) ||
      lostItemInput.desc.toLowerCase().includes(item.name.toLowerCase())
    );
    
    if (isMatched) {
      toast.success("Match Found! Proceed to Central Security Office.", { duration: 6000 });
    } else {
      toast.info("Item registered. We will alert you if matches appear.");
    }
    setLostItems(prev => [lostItemInput, ...prev]);
    setLostItemInput({ name: "", desc: "", loc: "" });
  };

  // Quick auto login trigger for PromptWars judges
  const handleJudgeAutoLogin = (demoRole: string) => {
    const profile = { 
      uid: `demo_judge_${demoRole}`, 
      email: `${demoRole}@stadiumos.org`, 
      name: `Demo ${demoRole.toUpperCase()}`, 
      role: demoRole 
    };
    setUser(profile);
    localStorage.setItem("stadiumos_mock_user", JSON.stringify(profile));
    toast.success(`Logged in as Demo ${demoRole.toUpperCase()}!`);
  };

  return (
    <div className={`min-h-screen bg-[#07070a] text-zinc-100 font-sans flex selection:bg-cyan-500/30 overflow-x-hidden ${accessContrast ? "high-contrast" : ""}`}>
      
      {/* ================= AUTHENTICATION OVERLAY ================= */}
      {!user && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09090c] border border-zinc-800 w-full max-w-md p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
            
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold italic tracking-wider text-cyan-400">STADIUMOS</h1>
              <p className="text-xs text-zinc-400">GenAI Operating System for FIFA World Cup 2026</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="Enter password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/10 mt-2">
                {authMode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-900"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Or Continue With</span>
              <div className="flex-grow border-t border-zinc-900"></div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              Sign In with Google
            </button>

            {/* Quick access trigger for judge panel */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-2 mt-4">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">PromptWars Judge Quick Access</div>
              <div className="grid grid-cols-2 gap-2">
                {["organizer", "fan", "volunteer", "security", "venue_staff"].map(role => (
                  <button 
                    key={role}
                    onClick={() => handleJudgeAutoLogin(role)}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] py-1.5 rounded-lg text-zinc-300 capitalize transition-all"
                  >
                    {role.replace("_", " ")} Mode
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <button 
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                className="text-xs text-cyan-400 hover:underline"
              >
                {authMode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ROLE PICKER OVERLAY ================= */}
      {user && isRolePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09090c] border border-zinc-800 w-full max-w-2xl p-8 rounded-3xl space-y-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-center text-white flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              {t("roleOnboarding")}
            </h2>
            <p className="text-xs text-zinc-500 text-center max-w-md mx-auto">
              Welcome to the FIFA World Cup 2026 operating core. Select your operational role below:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {[
                { role: "fan", label: "Spectator / Fan", desc: "Access SVG pathfinding, concessions queue radar, lost & found." },
                { role: "volunteer", label: "Field Volunteer", desc: "Zone status logs, tasks checklists, and translation services." },
                { role: "security", label: "Venue Security", desc: "Live heatmap metrics, emergency broadcast panels, incident log timeline." },
                { role: "organizer", label: "Event Organizer", desc: "Operational command dashboard, AI alert generator, transport status." },
                { role: "venue_staff", label: "Venue Staff", desc: "Maintenance status logging, HVAC green settings, facilities tracking." }
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSelection(item.role)}
                  className="bg-zinc-900/50 hover:bg-cyan-950/20 border border-zinc-850 hover:border-cyan-500/30 p-5 rounded-2xl text-left transition-all space-y-2 group"
                >
                  <div className="font-bold text-sm text-zinc-200 group-hover:text-cyan-400 transition-colors capitalize">{item.label}</div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      {user && (
        <aside 
          role="complementary" 
          className="w-64 md:w-72 bg-[#09090c] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0"
        >
          <div className="p-6 space-y-8 overflow-y-auto max-h-[85vh] scrollbar-none">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold italic tracking-wider text-cyan-400 font-sans">
                STADIUMOS
              </h1>
              <Badge variant="outline" className="border-cyan-500/20 text-[9px] text-cyan-400 uppercase tracking-widest font-mono">V2</Badge>
            </div>

            {/* User details */}
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/40 relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-200 truncate">{user.name}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
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
                onChange={(e) => setLanguage(e.target.value as any)}
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
              {[
                { id: "ticker", label: t("liveTicker"), icon: Activity },
                { id: "gates", label: t("gateInfo"), icon: Map },
                { id: "queues", label: t("queues"), icon: Hourglass },
                { id: "safety", label: t("safety"), icon: Shield },
                { id: "emergency", label: t("emergency"), icon: AlertOctagon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "text-cyan-400 bg-cyan-950/20 border-l-2 border-cyan-400" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer switch role & logout */}
          <div className="p-6 border-t border-zinc-900 space-y-2">
            <button 
              onClick={() => setIsRolePickerOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-cyan-400 hover:bg-cyan-950/20 transition-all border border-cyan-500/10"
            >
              <Sliders className="w-3.5 h-3.5" />
              {t("switchRole")}
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-zinc-900/40 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {user && (
        <main id="main-content" className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto h-screen relative">
          
          {/* ================ VIEW 1: LIVE TICKER ================ */}
          {activeTab === "ticker" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* Top alert & pass row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-red-950/20 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-start">
                  <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-red-500 tracking-wider uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      Critical Update
                    </div>
                    <p className="text-xs text-red-200 mt-1 leading-relaxed">
                      Weather delay initiated. Secure areas open in concourse levels 1 and 2. Follow stadium personnel instructions.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Digital Pass</div>
                    <div className="text-sm font-bold text-zinc-100 mt-1">Sec 204 • Row G</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3 text-cyan-400" /> VIP Access Granted
                    </div>
                  </div>
                  <QrCode className="w-10 h-10 text-cyan-400 opacity-80" />
                </div>
              </div>

              {/* Countdown card */}
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800/60 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="space-y-2">
                  <span className="bg-lime-500/10 text-lime-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Up Next
                  </span>
                  <span className="text-zinc-500 text-xs ml-2">Main Stage</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
                    Championship Kick-off
                  </h2>
                  <p className="text-xs text-zinc-400">The final showdown begins.</p>
                </div>

                {/* Counter block */}
                <div className="flex gap-4 items-center self-start md:self-auto">
                  {[
                    { label: "HRS", val: String(timeLeft.hrs).padStart(2, "0") },
                    { label: "MIN", val: String(timeLeft.min).padStart(2, "0") },
                    { label: "SEC", val: String(timeLeft.sec).padStart(2, "0") },
                  ].map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-xl font-bold text-zinc-600">:</span>}
                      <div className="flex flex-col items-center">
                        <div className="bg-zinc-950 border border-zinc-800/80 px-4 py-3 rounded-xl text-xl font-mono font-bold text-cyan-400 shadow-inner">
                          {item.val}
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500 mt-1.5 tracking-wider">{item.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* ========================================================= */}
              {/*                     ROLE SPECIFIC PANELS                  */}
              {/* ========================================================= */}

              {/* ----------------- FAN DASHBOARD ----------------- */}
              {user.role === "fan" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Concession Radar */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-cyan-400" />
                      Food Queue Radar
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                        <div>
                          <div className="text-xs font-bold text-zinc-200">Burger Prime (Sec 201)</div>
                          <div className="text-[10px] text-red-400 mt-0.5">High Demand</div>
                        </div>
                        <Badge variant="outline" className="border-red-500/20 text-red-400">24m Wait</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                        <div>
                          <div className="text-xs font-bold text-zinc-200">Pretzel Stand (Sec 203)</div>
                          <div className="text-[10px] text-green-400 mt-0.5">Quick Walk-up</div>
                        </div>
                        <Badge variant="outline" className="border-green-500/20 text-green-400">4m Wait</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Assistant */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      {t("accessibility")} Assistant
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button 
                        onClick={() => setAccessWheelchair(!accessWheelchair)}
                        className={`p-3 border rounded-xl font-bold transition-all text-left ${
                          accessWheelchair ? "bg-cyan-950/20 border-cyan-500 text-cyan-400" : "bg-zinc-950/50 border-zinc-850 text-zinc-400"
                        }`}
                      >
                        ♿ Wheelchair Friendly
                      </button>
                      <button 
                        onClick={() => setAccessElevator(!accessElevator)}
                        className={`p-3 border rounded-xl font-bold transition-all text-left ${
                          accessElevator ? "bg-cyan-950/20 border-cyan-500 text-cyan-400" : "bg-zinc-950/50 border-zinc-850 text-zinc-400"
                        }`}
                      >
                        🛗 Prefer Elevators
                      </button>
                      <button 
                        onClick={() => setAccessContrast(!accessContrast)}
                        className={`p-3 border rounded-xl font-bold transition-all text-left ${
                          accessContrast ? "bg-cyan-950/20 border-cyan-500 text-cyan-400" : "bg-zinc-950/50 border-zinc-850 text-zinc-400"
                        }`}
                      >
                        👁️ High Contrast
                      </button>
                      <div className="p-1 flex items-center justify-between border border-zinc-850 rounded-xl bg-zinc-950/50 px-3">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Text Size</span>
                        <select 
                          value={accessTextSize} 
                          onChange={(e) => setAccessTextSize(e.target.value as any)}
                          className="bg-transparent text-cyan-400 font-bold outline-none"
                        >
                          <option value="normal">A</option>
                          <option value="large">A+</option>
                          <option value="huge">A++</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Transportation Intelligence */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-cyan-400" />
                      {t("transport")}
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>🚇 Stadium Metro Station</span>
                        <span className="font-bold text-red-500">18m Wait (Crowded)</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>🚌 Shuttle Line C</span>
                        <span className="font-bold text-green-400">2m Wait (Clear)</span>
                      </div>
                      <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-xl mt-2 text-[11px] text-zinc-400">
                        <strong className="text-cyan-400 block mb-0.5">AI exit recommendation:</strong>
                        Proceed to Exit Gate 4; boarding Bus Line B will save approximately 15 minutes of wait time.
                      </div>
                    </div>
                  </div>

                  {/* Lost & Found */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-cyan-400" />
                      {t("lostFound")}
                    </h3>
                    <form onSubmit={handleReportLostItem} className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Item name (e.g., iPhone, Black Wallet)" 
                        value={lostItemInput.name}
                        onChange={(e) => setLostItemInput({ ...lostItemInput, name: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500/50"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Estimated Location Lost" 
                        value={lostItemInput.loc}
                        onChange={(e) => setLostItemInput({ ...lostItemInput, loc: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500/50"
                        required
                      />
                      <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-xl text-xs transition-all">
                        Report Lost Item
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ----------------- VOLUNTEER DASHBOARD ----------------- */}
              {user.role === "volunteer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Active checklist */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-cyan-400" />
                      Volunteer Open Tasks
                    </h3>
                    <div className="space-y-2 text-xs">
                      {[
                        "Verify ramp clearance at Section 202.",
                        "Distribute translation guide cards to Concourse A entrances.",
                        "Coordinate with security at Gate 4 during player entries."
                      ].map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl text-zinc-300">
                          <input type="checkbox" className="w-4 h-4 accent-cyan-500" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Incident Submission */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-cyan-400" />
                      Submit Incident Report
                    </h3>
                    <form onSubmit={handleSubmitIncident} className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={newIncident.type}
                          onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                          className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl"
                        >
                          <option>Crowd Overflow</option>
                          <option>Medical Emergency</option>
                          <option>Maintenance Issue</option>
                          <option>Security Threat</option>
                        </select>
                        <select 
                          value={newIncident.severity}
                          onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                          className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Specific Location (e.g. Concourse A near Gate 4)"
                        value={newIncident.location}
                        onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl"
                        required
                      />
                      <textarea 
                        placeholder="Describe the incident detail..."
                        value={newIncident.description}
                        onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl h-16"
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={isSubmittingIncident}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-xl transition-all"
                      >
                        {isSubmittingIncident ? "Processing AI summary..." : "Submit Incident"}
                      </button>
                    </form>
                  </div>

                  {/* AI Volunteer Advisor suggestions */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      AI Task Priority Advisor
                    </h3>
                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-xs space-y-2 text-zinc-400">
                      <span className="text-cyan-400 font-bold block">Gemini Task Suggestion:</span>
                      <p>Prioritize checking Section 202 ramp clearance immediately. Concourse B telemetry is showing a 20% crowd increase, meaning wheel-chair bottlenecking is highly probable in 10 minutes.</p>
                    </div>
                  </div>

                  {/* Translation utility helper */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-cyan-400" />
                      Quick translation help
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                        <strong className="text-zinc-300 block">English:</strong>
                        <span>"Please move to Concourse B, elevator access is on the right."</span>
                      </div>
                      <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                        <strong className="text-cyan-400 block">Spanish:</strong>
                        <span>"Por favor diríjase al Concourse B, el ascensor está a la derecha."</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- SECURITY DASHBOARD ----------------- */}
              {user.role === "security" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Heatmap overlay */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Map className="w-5 h-5 text-cyan-400" />
                      Active Incident Timeline
                    </h3>
                    <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                      {incidents.map((incident, i) => (
                        <div key={i} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-200">{incident.type}</span>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{incident.severity}</span>
                          </div>
                          <div className="text-zinc-500 text-[10px]">{incident.location}</div>
                          <p className="text-zinc-400 text-[11px] mt-1">{incident.description}</p>
                          {incident.aiSummary && (
                            <div className="border-t border-zinc-900 pt-1.5 mt-1.5 text-[10px] text-cyan-400">
                              <strong>AI Action:</strong> {incident.aiResponse}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Risk assessment summary */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      AI Threat Risk Level Summary
                    </h3>
                    <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500 uppercase font-bold">Overall threat level</span>
                        <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 font-mono">MEDIUM RISK</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Risk is mitigated by normal crowd distributions. However, HVAC reporting issues in Concourse B and minor bottlenecks in Gate 4 suggest standard surveillance loops be increased in the North Concourse.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- ORGANIZER DASHBOARD ----------------- */}
              {user.role === "organizer" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Announcement Generator */}
                    <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                      <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-cyan-400" />
                        AI Announcement Generator
                      </h3>
                      <form onSubmit={handleGenerateAnnouncement} className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-500 block mb-1">Incident Type</label>
                            <input 
                              type="text" 
                              value={announcementInputs.incident}
                              onChange={(e) => setAnnouncementInputs({ ...announcementInputs, incident: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl focus:outline-none"
                              placeholder="e.g. Lost Wallet"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-500 block mb-1">Incident Location</label>
                            <input 
                              type="text" 
                              value={announcementInputs.location}
                              onChange={(e) => setAnnouncementInputs({ ...announcementInputs, location: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl focus:outline-none"
                              placeholder="e.g. Gate 4"
                              required
                            />
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          disabled={isGeneratingAnnouncement}
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-xl transition-all"
                        >
                          {isGeneratingAnnouncement ? "Generating Broadcasts..." : "Generate Broadcast Alerts"}
                        </button>
                      </form>

                      {/* Display Alert Output */}
                      {generatedAnnouncement && (
                        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-xs space-y-3 mt-3">
                          <div>
                            <span className="text-cyan-400 font-bold block mb-1">Public Broadcast Alert:</span>
                            <p className="text-zinc-300">{generatedAnnouncement.public_announcement}</p>
                          </div>
                          <div>
                            <span className="text-cyan-400 font-bold block mb-1">Volunteer Action Details:</span>
                            <p className="text-zinc-400">{generatedAnnouncement.volunteer_instructions}</p>
                          </div>
                          <div>
                            <span className="text-cyan-400 font-bold block mb-1">Security Brief Details:</span>
                            <p className="text-zinc-400">{generatedAnnouncement.security_brief}</p>
                          </div>
                          {generatedAnnouncement.translations && (
                            <div className="border-t border-zinc-900 pt-2 space-y-1">
                              <span className="text-zinc-500 font-bold block text-[10px] uppercase">Spanish Translation (es)</span>
                              <p className="text-zinc-400 italic text-[11px]">{generatedAnnouncement.translations.es}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Operations Command */}
                    <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                      <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        AI Operations Command
                      </h3>
                      <div className="space-y-3 text-xs">
                        {[
                          { action: "Open Gate C Additional Lanes", impact: "Reduce Gate A density by 20%", reason: "Gate A is 85% full with queue lines increasing.", confidence: "94%", priority: "HIGH" },
                          { action: "Deploy Shuttle Service B", impact: "Reduce Metro Station crowd queue", reason: "Metro wait time estimates reached 18m.", confidence: "88%", priority: "MEDIUM" }
                        ].map((rec, i) => (
                          <div key={i} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-cyan-400 text-sm">{rec.action}</span>
                              <Badge variant="outline" className="border-red-500/20 text-red-400 font-mono text-[9px]">{rec.priority}</Badge>
                            </div>
                            <p className="text-zinc-400 text-[11px] leading-relaxed">{rec.reason}</p>
                            <div className="flex justify-between text-[10px] text-zinc-500 border-t border-zinc-900 pt-1.5">
                              <span>Impact: <strong className="text-zinc-300">{rec.impact}</strong></span>
                              <span>Confidence: <strong className="text-zinc-300">{rec.confidence}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- VENUE STAFF DASHBOARD ----------------- */}
              {user.role === "venue_staff" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Facilities tracker */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-cyan-400" />
                      Facilities Health & Utility Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <div className="text-zinc-500 font-bold uppercase text-[9px]">Power Usage</div>
                        <div className="text-lg font-bold text-white mt-1">380 kW</div>
                        <span className="text-[10px] text-green-400">Normal Range</span>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <div className="text-zinc-500 font-bold uppercase text-[9px]">Water Flow</div>
                        <div className="text-lg font-bold text-white mt-1">42 L/m</div>
                        <span className="text-[10px] text-green-400">Normal Range</span>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <div className="text-zinc-500 font-bold uppercase text-[9px]">HVAC Status</div>
                        <div className="text-lg font-bold text-white mt-1">Load: 68%</div>
                        <span className="text-[10px] text-yellow-500">Peak Demand</span>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                        <div className="text-zinc-500 font-bold uppercase text-[9px]">Cleaning Index</div>
                        <div className="text-lg font-bold text-white mt-1">Grade A</div>
                        <span className="text-[10px] text-green-400">Optimal</span>
                      </div>
                    </div>
                  </div>

                  {/* Sustainability Center */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-cyan-400" />
                      Sustainability & Energy Command
                    </h3>
                    <div className="space-y-2 text-xs">
                      {sustainabilityTips.map((tip, idx) => (
                        <div key={idx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-400 inline mr-2" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preventative maintenance suggestions */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4 col-span-1 md:col-span-2">
                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      AI Preventative Maintenance Suggestions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {maintenanceTasks.map((task, idx) => (
                        <div key={idx} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between">
                          <span>{task}</span>
                          <Badge variant="outline" className="border-cyan-500/20 text-cyan-400">Active Suggestion</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Today's timeline itinerary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Itinerary */}
                <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    {t("itinerary")}
                  </h3>
                  
                  <div className="relative border-l border-zinc-800/80 ml-3 space-y-6 pb-2">
                    {[
                      { time: "14:00", badge: "Gates Open", title: "General Admission Entry", desc: "Access through all primary gates.", live: false },
                      { time: "15:30", badge: "Pre-Show", title: "Player Warm-ups", desc: "Field level access required for front row seating.", live: false },
                      { time: "17:00", badge: "Live Now", title: "Opening Ceremonies", desc: "National anthem and tournament team introductions.", location: "Main Pitch", live: true },
                      { time: "18:00", badge: "Main Event", title: "Kick-off", desc: "Championship match begins.", live: false },
                    ].map((item, i) => (
                      <div key={i} className="relative pl-6">
                        <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border ${
                          item.live 
                            ? "bg-red-500 border-red-400 ring-4 ring-red-500/20" 
                            : "bg-zinc-900 border-zinc-700"
                        }`} />
                        
                        <div className={`p-4 rounded-xl border transition-all ${
                          item.live 
                            ? "bg-zinc-900/60 border-cyan-500/20 shadow-md" 
                            : "bg-zinc-900/10 border-transparent hover:bg-zinc-900/35 hover:border-zinc-800/50"
                        }`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-zinc-500">{item.time}</span>
                            <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                              item.live 
                                ? "bg-red-500/10 text-red-400" 
                                : "bg-zinc-800 text-zinc-400"
                            }`}>
                              {item.badge}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-zinc-100 mt-2">{item.title}</h4>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                          {item.location && (
                            <div className="text-[10px] text-cyan-400 mt-2 flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5" /> {item.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side Cards */}
                <div className="space-y-6">
                  
                  {/* Merch Drop */}
                  <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                    <span className="bg-lime-500/10 text-lime-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Exclusive
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">Halftime Merch Drop</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Limited edition championship jerseys available for pickup at Gate C.
                    </p>
                    <button className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 py-2.5 rounded-xl text-xs font-bold transition-all mt-2">
                      Pre-order Now →
                    </button>
                  </div>

                  {/* Saved Events */}
                  <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-200">{t("savedEvents")}</h3>
                      <span className="text-[10px] font-bold text-zinc-500 hover:text-cyan-400 cursor-pointer">+ Add</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: "Meetup at Section 204", time: "19:30 • Halftime" },
                        { title: "Post-game Autographs", time: "21:00 • North Tunnel" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-zinc-900/40 border border-zinc-800/40 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-zinc-200">{item.title}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{item.time}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-600" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ================ VIEW 2: GATE INFO ================ */}
          {activeTab === "gates" && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input 
                    type="text" 
                    placeholder="Search sections, gates, concessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {["Amenities", "Restrooms", "Food & Bev", "Merch"].map((pill, idx) => (
                    <button 
                      key={idx}
                      className={`text-xs font-bold px-3.5 py-2 rounded-lg border transition-all shrink-0 ${
                        idx === 0 
                          ? "bg-lime-400 border-lime-400 text-black shadow-lg shadow-lime-400/10" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {pill.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stadium Map */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-850 p-6 rounded-3xl flex items-center justify-center min-h-[400px] relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                  
                  <svg viewBox="0 0 500 500" className="w-full max-w-[400px] z-10">
                    <ellipse cx="250" cy="250" rx="220" ry="180" className="fill-none stroke-zinc-800 stroke-[4] stroke-dasharray-[6]" />
                    <ellipse cx="250" cy="250" rx="170" ry="130" className="fill-none stroke-zinc-900 stroke-[8]" />
                    <ellipse cx="250" cy="250" rx="170" ry="130" className="fill-none stroke-zinc-800/40 stroke-[2] stroke-dasharray-[3]" />
                    <ellipse cx="250" cy="250" rx="120" ry="85" className="fill-none stroke-zinc-850 stroke-[6]" />
                    
                    <rect x="180" y="200" width="140" height="100" rx="6" className="fill-green-950/20 stroke-green-500/20 stroke-[1.5]" />
                    <ellipse cx="250" cy="250" rx="25" ry="25" className="fill-none stroke-green-500/10 stroke-[1.5]" />
                    <line x1="250" y1="200" x2="250" y2="300" className="stroke-green-500/10 stroke-[1.5]" />

                    {/* Interactive Gates & Pins */}
                    <g className="cursor-pointer group" onClick={() => setActiveMapMarker("gate_4")}>
                      {activeMapMarker === "gate_4" && (
                        <circle cx="260" cy="400" r="16" className="fill-cyan-400/20 animate-ping" />
                      )}
                      <circle cx="260" cy="400" r="10" className={`transition-all ${
                        activeMapMarker === "gate_4" ? "fill-cyan-400 stroke-cyan-200 stroke-2" : "fill-zinc-800 stroke-zinc-600 group-hover:fill-zinc-700"
                      }`} />
                      <text x="260" y="403" textAnchor="middle" className={`text-[8px] font-sans font-extrabold select-none pointer-events-none ${
                        activeMapMarker === "gate_4" ? "fill-black" : "fill-zinc-400"
                      }`}>G</text>
                      <text x="260" y="425" textAnchor="middle" className="text-[9px] font-sans font-bold fill-zinc-500 select-none pointer-events-none">Gate 4</text>
                    </g>

                    <g className="cursor-pointer group" onClick={() => setActiveMapMarker("burger_stand")}>
                      {activeMapMarker === "burger_stand" && (
                        <circle cx="150" cy="180" r="16" className="fill-orange-400/20 animate-ping" />
                      )}
                      <circle cx="150" cy="180" r="10" className={`transition-all ${
                        activeMapMarker === "burger_stand" ? "fill-orange-400 stroke-orange-200 stroke-2" : "fill-zinc-800 stroke-zinc-600 group-hover:fill-zinc-700"
                      }`} />
                      <text x="150" y="183" textAnchor="middle" className={`text-[8px] font-sans font-extrabold select-none pointer-events-none ${
                        activeMapMarker === "burger_stand" ? "fill-black" : "fill-zinc-400"
                      }`}>F</text>
                      <text x="150" y="165" textAnchor="middle" className="text-[9px] font-sans font-bold fill-zinc-500 select-none pointer-events-none">Burger Stand</text>
                    </g>

                    <g className="cursor-pointer group" onClick={() => setActiveMapMarker("restroom")}>
                      {activeMapMarker === "restroom" && (
                        <circle cx="340" cy="220" r="16" className="fill-lime-400/20 animate-ping" />
                      )}
                      <circle cx="340" cy="220" r="10" className={`transition-all ${
                        activeMapMarker === "restroom" ? "fill-lime-400 stroke-lime-200 stroke-2" : "fill-zinc-800 stroke-zinc-600 group-hover:fill-zinc-700"
                      }`} />
                      <text x="340" y="223" textAnchor="middle" className={`text-[8px] font-sans font-extrabold select-none pointer-events-none ${
                        activeMapMarker === "restroom" ? "fill-black" : "fill-zinc-400"
                      }`}>R</text>
                      <text x="340" y="205" textAnchor="middle" className="text-[9px] font-sans font-bold fill-zinc-500 select-none pointer-events-none">Restroom A</text>
                    </g>
                  </svg>
                </div>

                {/* Right detail panel */}
                <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-3xl space-y-6">
                  {activeMapMarker === "gate_4" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Gate 4</h3>
                        <p className="text-xs text-zinc-500 mt-1">North Concourse • Section 112</p>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Current Wait</div>
                          <div className="text-3xl font-extrabold text-white mt-1">5m</div>
                        </div>
                        <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded">Live</span>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                          <Compass className="w-4 h-4" /> Navigate
                        </button>
                      </div>
                    </div>
                  )}

                  {activeMapMarker === "burger_stand" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Burger Prime</h3>
                        <p className="text-xs text-zinc-500 mt-1">Concourse B • Section 201</p>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Current Wait</div>
                          <div className="text-3xl font-extrabold text-white mt-1">24m</div>
                        </div>
                        <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-1 rounded">Busy</span>
                      </div>

                      <button 
                        onClick={() => {
                          setJoinedQueue("burger");
                          toast.success("Joined Burger Prime queue!");
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                      >
                        Join Digital Queue
                      </button>
                    </div>
                  )}

                  {activeMapMarker === "restroom" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Restroom A</h3>
                        <p className="text-xs text-zinc-500 mt-1">East Concourse • Section 202</p>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Current Wait</div>
                          <div className="text-3xl font-extrabold text-white mt-1">2m</div>
                        </div>
                        <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded">Optimal</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ================ VIEW 3: QUEUES ================ */}
          {activeTab === "queues" && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-red-500">Live Status</span>
                <h2 className="text-3xl font-extrabold text-white mt-1">Queue Radar</h2>
                <p className="text-xs text-zinc-500 mt-1">Section 204 • Real-time wait estimates</p>
              </div>

              {/* Recommendation */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t("quickestConcession")}</div>
                    <h4 className="text-base font-extrabold text-white mt-1">Stadium Dogs - Cart 4</h4>
                    <p className="text-xs text-zinc-400">Concourse B • 2 min walk</p>
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800/80 px-4 py-2.5 rounded-xl text-right">
                  <div className="text-[9px] uppercase font-bold text-zinc-500">{t("waitEst")}</div>
                  <div className="text-lg font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-4 h-4" /> 3 min
                  </div>
                </div>
              </div>

              {/* Concession grids */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/20 border-l-2 border-red-500 border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-extrabold text-white">Burger Prime</h4>
                            <p className="text-xs text-zinc-500">Section 201</p>
                          </div>
                          <span className="text-base font-bold text-red-500">24 min</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-4 overflow-hidden">
                          <div className="bg-red-500 h-full w-[85%]" />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setJoinedQueue("burger");
                          toast.success("Joined Burger Prime queue!");
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl text-xs font-bold transition-all mt-4"
                      >
                        Join Digital Queue
                      </button>
                    </div>

                    <div className="bg-zinc-900/20 border-l-2 border-cyan-500 border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-base font-extrabold text-white">Craft Brews</h4>
                            <p className="text-xs text-zinc-500">Section 206</p>
                          </div>
                          <span className="text-base font-bold text-cyan-400">12 min</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-4 overflow-hidden">
                          <div className="bg-cyan-500 h-full w-[45%]" />
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setJoinedQueue("brews");
                          toast.success("Joined Craft Brews queue!");
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl text-xs font-bold transition-all mt-4"
                      >
                        Join Digital Queue
                      </button>
                    </div>
                  </div>
                </div>

                {/* Restrooms */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Restrooms Nearby</h3>
                  <div className="space-y-2">
                    {[
                      { name: "Restroom A (Men/Women)", location: "Sec 202 - 100ft away", wait: "2 min", color: "text-lime-400" },
                      { name: "Restroom B (Family)", location: "Sec 205 - 300ft away", wait: "5 min", color: "text-cyan-400" },
                    ].map((r, i) => (
                      <div key={i} className="p-3.5 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-zinc-200">{r.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{r.location}</div>
                        </div>
                        <span className={r.color}>{r.wait}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================ VIEW 4: SAFETY ================ */}
          {activeTab === "safety" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Safety Center</h2>
                <p className="text-xs text-zinc-500">Live updates and safety guidelines for World Cup spectators.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Security Guidelines
                  </h3>
                  <ul className="space-y-2 list-disc pl-5 text-zinc-400 leading-relaxed">
                    <li>Locate security officers in blue tournament vests.</li>
                    <li>Verify bag dimensions conform to regulations.</li>
                    <li>Avoid dynamic bottlenecks during peak hours.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ================ VIEW 5: EMERGENCY ================ */}
          {activeTab === "emergency" && (
            <div className="max-w-3xl mx-auto bg-red-950/10 border border-red-500/20 p-8 rounded-3xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500 shadow-lg">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">Emergency Services</h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Call emergency dispatch immediately if experiencing security threats or medical crisis.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <a href="tel:911" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all">
                  Call 911
                </a>
              </div>
            </div>
          )}

          {/* ================ VIEW 6: SETTINGS ================ */}
          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white">{t("settings")}</h2>
                <p className="text-xs text-zinc-500">Configure app accessibility and visual overrides.</p>
              </div>
              
              <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-3xl space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                  <div>
                    <div className="font-bold text-zinc-200">High Contrast Palette</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Increases text clarity for visibility assistance.</div>
                  </div>
                  <button 
                    onClick={() => setAccessContrast(!accessContrast)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    {accessContrast ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= FLOATING ACTIVE QUEUE WIDGET ================= */}
          {joinedQueue && (
            <div className="fixed bottom-6 right-24 bg-[#09090c] border border-zinc-800/80 p-4 rounded-2xl shadow-2xl z-40 w-72 backdrop-blur-xl flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-cyan-400">My Queue</span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {joinedQueue === "burger" ? "Burger Prime" : "Craft Brews"}
                  </h4>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    <span>Position: <strong>#{queuePosition}</strong></span>
                    <span className="block">Est. Turn: <strong>{queueWaitTime} min</strong></span>
                  </div>
                </div>
                <button 
                  onClick={() => setJoinedQueue(null)}
                  className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= FLOATING AI ASSISTANT BUBBLE ================= */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsAIOpen(!isAIOpen)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-all relative ${
                isAIOpen ? "bg-zinc-800 border border-zinc-700" : "bg-cyan-600 hover:bg-cyan-500"
              }`}
            >
              {isAIOpen ? (
                <span className="text-xs font-bold">Close</span>
              ) : (
                <>
                  <Bot className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </>
              )}
            </button>
          </div>

          {/* ================= SLIDING AI ASSISTANT DRAWER ================= */}
          <div className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-zinc-950/95 border-l border-zinc-850 shadow-2xl z-40 transition-transform duration-300 transform ${
            isAIOpen ? "translate-x-0" : "translate-x-full"
          }`}>
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    {t("aiAssistant")}
                  </h3>
                  <p className="text-[10px] text-zinc-500">Language mode: {language.toUpperCase()}</p>
                </div>
                <button onClick={() => setIsAIOpen(false)} className="text-zinc-500 hover:text-white text-xs font-bold">
                  CLOSE
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden py-4">
                <ChatInterface />
              </div>
            </div>
          </div>

        </main>
      )}
      
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
