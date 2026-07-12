// Stadium Map Data — Separate from rendering logic
// Canonical SVG geometry + operational data for every zone

export type ZoneCategory =
  | "gate"
  | "concourse"
  | "food"
  | "vip"
  | "medical"
  | "restroom"
  | "parking"
  | "metro"
  | "pitch"
  | "seating"
  | "emergency"
  | "media";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface StadiumZoneConfig {
  id: string;
  name: string;
  shortName: string;
  category: ZoneCategory;
  capacity: number;
  svgType: "ellipse" | "rect" | "polygon";
  geometry: Record<string, number | string>;
  labelX: number;
  labelY: number;
  visibleTo: string[];
  facilities: string[];
  aiRecommendations: Record<string, string>;
  defaultVolunteers: number;
  medicalAccessSecs: number;
  transport: string[];
}

// ============================================================
// SVG CANVAS: 1000 x 700, stadium centred at 500, 350
// ============================================================

export const STADIUM_ZONES: StadiumZoneConfig[] = [
  // ─── PITCH ────────────────────────────────────────────────
  {
    id: "pitch",
    name: "Football Pitch",
    shortName: "Pitch",
    category: "pitch",
    capacity: 0,
    svgType: "rect",
    geometry: { x: 310, y: 238, width: 380, height: 224, rx: 8 },
    labelX: 500,
    labelY: 355,
    visibleTo: ["organizer", "venue_staff"],
    facilities: ["VAR Room", "Player Tunnel", "Ref Room"],
    aiRecommendations: {
      PRE_MATCH: "Pitch clear. Ground crew on standby.",
      FIRST_HALF: "Pitch active. No access permitted.",
      HALFTIME: "Pitch inspection in progress.",
      SECOND_HALF: "Pitch active. No access permitted.",
      POST_MATCH: "Post-match pitch recovery initiated.",
    },
    defaultVolunteers: 0,
    medicalAccessSecs: 30,
    transport: [],
  },
  // ─── SEATING BOWL ──────────────────────────────────────────
  {
    id: "seating_bowl",
    name: "Main Seating Bowl",
    shortName: "Seating",
    category: "seating",
    capacity: 68000,
    svgType: "ellipse",
    geometry: { cx: 500, cy: 350, rx: 230, ry: 158 },
    labelX: 500,
    labelY: 185,
    visibleTo: ["fan", "security", "organizer", "venue_staff", "volunteer"],
    facilities: ["Seats", "Section Signs", "LED Screens"],
    aiRecommendations: {
      PRE_MATCH: "Monitor fill rate. Direct latecomers via ushers.",
      FIRST_HALF: "Crowd settled. Maintain section patrols.",
      HALFTIME: "Expect 40% egress to concourse.",
      SECOND_HALF: "Crowd re-settled. Maintain patrols.",
      POST_MATCH: "Initiate controlled phased exit. Open all gates.",
    },
    defaultVolunteers: 120,
    medicalAccessSecs: 90,
    transport: [],
  },
  // ─── CONCOURSE RING ────────────────────────────────────────
  {
    id: "concourse_1",
    name: "Level 1 Concourse",
    shortName: "Concourse",
    category: "concourse",
    capacity: 8000,
    svgType: "ellipse",
    geometry: { cx: 500, cy: 350, rx: 280, ry: 207 },
    labelX: 500,
    labelY: 138,
    visibleTo: ["fan", "security", "organizer", "venue_staff", "volunteer"],
    facilities: ["Elevators", "Restrooms", "First Aid Station", "Info Kiosk"],
    aiRecommendations: {
      PRE_MATCH: "Concourse filling. Deploy 8 volunteers to manage flow.",
      FIRST_HALF: "Concourse clear. Normal operations.",
      HALFTIME: "High traffic surge expected. Open all concession windows.",
      SECOND_HALF: "Concourse normalising post-halftime.",
      POST_MATCH: "Concourse critical. Stagger exit via Gates A and D.",
    },
    defaultVolunteers: 40,
    medicalAccessSecs: 60,
    transport: ["Elevator to P2", "Escalator to L2"],
  },
  // ─── EAST GATE A ───────────────────────────────────────────
  {
    id: "gate_a",
    name: "East Gate A",
    shortName: "Gate A",
    category: "gate",
    capacity: 5000,
    svgType: "rect",
    geometry: { x: 792, y: 315, width: 72, height: 70, rx: 12 },
    labelX: 828,
    labelY: 353,
    visibleTo: ["fan", "security", "organizer", "volunteer"],
    facilities: ["Turnstiles x12", "Ticket Scanner", "Bag Check"],
    aiRecommendations: {
      PRE_MATCH: "Gate A congested. Open express lanes 3 and 4. Deploy 4 extra scanners.",
      FIRST_HALF: "Gate A traffic low. Reduce to 6 active lanes.",
      HALFTIME: "Minimal entry. Keep 2 lanes for latecomers.",
      SECOND_HALF: "Monitor for early departures.",
      POST_MATCH: "Gate A critical exit surge. Deploy crowd management team.",
    },
    defaultVolunteers: 12,
    medicalAccessSecs: 120,
    transport: ["Metro Line 2 (2 min)", "Bus Stop EA1"],
  },
  // ─── WEST GATE B ───────────────────────────────────────────
  {
    id: "gate_b",
    name: "West Gate B",
    shortName: "Gate B",
    category: "gate",
    capacity: 4000,
    svgType: "rect",
    geometry: { x: 136, y: 315, width: 72, height: 70, rx: 12 },
    labelX: 172,
    labelY: 353,
    visibleTo: ["fan", "security", "organizer", "volunteer"],
    facilities: ["Turnstiles x10", "Ticket Scanner", "Wheelchair Lane"],
    aiRecommendations: {
      PRE_MATCH: "Gate B at 88% capacity. Open overflow lane. Redirect overflow to Gate D.",
      FIRST_HALF: "Gate B clear. Standard monitoring.",
      HALFTIME: "Low activity. Reassign 3 volunteers to food court.",
      SECOND_HALF: "Normal operations.",
      POST_MATCH: "Gate B exit surge. Metro Line 1 at capacity — warn fans.",
    },
    defaultVolunteers: 10,
    medicalAccessSecs: 120,
    transport: ["Metro Line 1 (4 min)", "Parking P1 (1 min walk)"],
  },
  // ─── NORTH GATE C ──────────────────────────────────────────
  {
    id: "gate_c",
    name: "North Gate C",
    shortName: "Gate C",
    category: "gate",
    capacity: 4500,
    svgType: "rect",
    geometry: { x: 462, y: 80, width: 76, height: 56, rx: 12 },
    labelX: 500,
    labelY: 110,
    visibleTo: ["fan", "security", "organizer", "volunteer"],
    facilities: ["Turnstiles x11", "VIP Fast Track", "Press Entry"],
    aiRecommendations: {
      PRE_MATCH: "Gate C queue at 14 min. Activate fast-track lane 2.",
      FIRST_HALF: "Minimal activity.",
      HALFTIME: "Low traffic. Deploy staff to concourse.",
      SECOND_HALF: "Monitor.",
      POST_MATCH: "Gate C moderate exit. Recommend metro route.",
    },
    defaultVolunteers: 11,
    medicalAccessSecs: 90,
    transport: ["Shuttle Bus NC (6 min)", "Metro Line 3 (8 min)"],
  },
  // ─── SOUTH GATE D ──────────────────────────────────────────
  {
    id: "gate_d",
    name: "South Gate D",
    shortName: "Gate D",
    category: "gate",
    capacity: 4500,
    svgType: "rect",
    geometry: { x: 462, y: 564, width: 76, height: 56, rx: 12 },
    labelX: 500,
    labelY: 594,
    visibleTo: ["fan", "security", "organizer", "volunteer"],
    facilities: ["Turnstiles x11", "Accessibility Lane", "Medical Access"],
    aiRecommendations: {
      PRE_MATCH: "Gate D open. Redirect overflow from Gate B here.",
      FIRST_HALF: "Low activity.",
      HALFTIME: "Minor queue. 2 volunteers sufficient.",
      SECOND_HALF: "Monitor.",
      POST_MATCH: "Gate D: open all barriers for emergency dispersal.",
    },
    defaultVolunteers: 10,
    medicalAccessSecs: 45,
    transport: ["Tram Stop SD (3 min)", "Parking P3 (2 min walk)"],
  },
  // ─── FOOD COURT ────────────────────────────────────────────
  {
    id: "food_court",
    name: "Central Food Court",
    shortName: "Food Court",
    category: "food",
    capacity: 2000,
    svgType: "rect",
    geometry: { x: 654, y: 188, width: 112, height: 90, rx: 14 },
    labelX: 710,
    labelY: 236,
    visibleTo: ["fan", "organizer", "venue_staff", "volunteer"],
    facilities: ["12 Concession Stands", "Seating 400", "Quick Service Kiosk x4"],
    aiRecommendations: {
      PRE_MATCH: "Food court 35% full. Estimated surge at kick-off +10 min.",
      FIRST_HALF: "Low activity. Prepare for halftime surge.",
      HALFTIME: "CRITICAL: Food court at capacity. Stagger access by section.",
      SECOND_HALF: "Post-halftime clearing. Normal operations resuming.",
      POST_MATCH: "Food court winding down. Reduce staff to 4.",
    },
    defaultVolunteers: 8,
    medicalAccessSecs: 75,
    transport: [],
  },
  // ─── VIP LOUNGE ────────────────────────────────────────────
  {
    id: "vip_lounge",
    name: "Executive VIP Lounge",
    shortName: "VIP Lounge",
    category: "vip",
    capacity: 500,
    svgType: "rect",
    geometry: { x: 234, y: 188, width: 112, height: 90, rx: 14 },
    labelX: 290,
    labelY: 236,
    visibleTo: ["organizer", "security", "venue_staff"],
    facilities: ["Premium Dining", "VVIP Box x8", "Media Briefing Room"],
    aiRecommendations: {
      PRE_MATCH: "VIP pre-match reception in progress.",
      FIRST_HALF: "VIP lounge at 65%. Staff 2 dedicated concierge.",
      HALFTIME: "Recommend dedicated server deployment.",
      SECOND_HALF: "VIP 72% occupied. Normal.",
      POST_MATCH: "VIP exit: coordinate private transport.",
    },
    defaultVolunteers: 4,
    medicalAccessSecs: 30,
    transport: ["VIP Shuttle (On demand)"],
  },
  // ─── MEDICAL CENTER ────────────────────────────────────────
  {
    id: "medical",
    name: "Medical Centre",
    shortName: "Medical",
    category: "medical",
    capacity: 50,
    svgType: "rect",
    geometry: { x: 654, y: 422, width: 112, height: 90, rx: 14 },
    labelX: 710,
    labelY: 470,
    visibleTo: ["security", "organizer", "venue_staff", "volunteer"],
    facilities: ["8 Treatment Bays", "AED x4", "Trauma Team", "Ambulance Bay"],
    aiRecommendations: {
      PRE_MATCH: "Medical fully staffed. Pre-match checks complete.",
      FIRST_HALF: "No incidents. Staff on standby.",
      HALFTIME: "Expect minor heat/dehydration cases. Pre-position triage team.",
      SECOND_HALF: "Monitor crowd for heat stress in south sections.",
      POST_MATCH: "Medical on exit standby. Crush monitoring at gates.",
    },
    defaultVolunteers: 2,
    medicalAccessSecs: 0,
    transport: ["Ambulance Access Road (dedicated)"],
  },
  // ─── RESTROOMS NORTH ───────────────────────────────────────
  {
    id: "restroom_n",
    name: "Restrooms North",
    shortName: "WC North",
    category: "restroom",
    capacity: 200,
    svgType: "rect",
    geometry: { x: 420, y: 148, width: 160, height: 36, rx: 10 },
    labelX: 500,
    labelY: 168,
    visibleTo: ["fan", "volunteer", "venue_staff"],
    facilities: ["Men x16", "Women x20", "Accessible x4", "Baby Change"],
    aiRecommendations: {
      PRE_MATCH: "Restrooms clear. Normal.",
      FIRST_HALF: "Minimal use.",
      HALFTIME: "Expect 200% peak load. Deploy queue managers.",
      SECOND_HALF: "Clearing post-halftime.",
      POST_MATCH: "Monitor cleanliness.",
    },
    defaultVolunteers: 2,
    medicalAccessSecs: 120,
    transport: [],
  },
  // ─── RESTROOMS SOUTH ───────────────────────────────────────
  {
    id: "restroom_s",
    name: "Restrooms South",
    shortName: "WC South",
    category: "restroom",
    capacity: 200,
    svgType: "rect",
    geometry: { x: 420, y: 516, width: 160, height: 36, rx: 10 },
    labelX: 500,
    labelY: 536,
    visibleTo: ["fan", "volunteer", "venue_staff"],
    facilities: ["Men x16", "Women x20", "Accessible x4"],
    aiRecommendations: {
      PRE_MATCH: "Clear.",
      FIRST_HALF: "Minimal use.",
      HALFTIME: "High load expected. Open overflow block.",
      SECOND_HALF: "Post halftime clearing.",
      POST_MATCH: "Close and sanitize.",
    },
    defaultVolunteers: 2,
    medicalAccessSecs: 120,
    transport: [],
  },
  // ─── PARKING ───────────────────────────────────────────────
  {
    id: "parking",
    name: "Parking Zone P1/P2",
    shortName: "Parking",
    category: "parking",
    capacity: 3000,
    svgType: "rect",
    geometry: { x: 48, y: 500, width: 148, height: 116, rx: 14 },
    labelX: 122,
    labelY: 562,
    visibleTo: ["fan", "security", "organizer", "venue_staff"],
    facilities: ["3,000 Spaces", "EV Charging x40", "Attendant x6"],
    aiRecommendations: {
      PRE_MATCH: "Parking at 62%. Estimated full by KO-45 min.",
      FIRST_HALF: "Parking at 89%. Direct overflow to P3.",
      HALFTIME: "Parking full. Redirect to P3. Warn fans via app.",
      SECOND_HALF: "Parking full. No new entry allowed.",
      POST_MATCH: "Exit queue 45 min. Suggest metro alternative.",
    },
    defaultVolunteers: 6,
    medicalAccessSecs: 300,
    transport: ["Shuttle to Gates every 5 min"],
  },
  // ─── METRO ENTRANCE ────────────────────────────────────────
  {
    id: "metro",
    name: "Metro Entry",
    shortName: "Metro",
    category: "metro",
    capacity: 1000,
    svgType: "rect",
    geometry: { x: 804, y: 500, width: 148, height: 116, rx: 14 },
    labelX: 878,
    labelY: 562,
    visibleTo: ["fan", "organizer", "volunteer"],
    facilities: ["2 Lines", "Ticket Machines x8", "Real-time Display"],
    aiRecommendations: {
      PRE_MATCH: "Metro Line 2 on time. Recommend fans use metro.",
      FIRST_HALF: "Metro quiet during play.",
      HALFTIME: "Pre-position metro staff for post-match surge.",
      SECOND_HALF: "Monitor crowd flow towards metro station.",
      POST_MATCH: "Metro at full capacity. Deploy crowd marshals. Stagger exit.",
    },
    defaultVolunteers: 4,
    medicalAccessSecs: 240,
    transport: ["Metro Line 1", "Metro Line 2", "Express to City Centre (12 min)"],
  },
  // ─── EMERGENCY ASSEMBLY ────────────────────────────────────
  {
    id: "emergency_assembly",
    name: "Emergency Assembly Area",
    shortName: "Assembly",
    category: "emergency",
    capacity: 5000,
    svgType: "rect",
    geometry: { x: 804, y: 84, width: 148, height: 116, rx: 14 },
    labelX: 878,
    labelY: 147,
    visibleTo: ["security", "organizer", "venue_staff"],
    facilities: ["Muster Stations x4", "Emergency Command", "PA System"],
    aiRecommendations: {
      PRE_MATCH: "Assembly area clear. Emergency crew on standby.",
      FIRST_HALF: "No incidents. On standby.",
      HALFTIME: "Minor medical stand ready.",
      SECOND_HALF: "Maintain readiness.",
      POST_MATCH: "Emergency team deployed to all gates.",
    },
    defaultVolunteers: 8,
    medicalAccessSecs: 0,
    transport: ["Emergency Vehicle Lane (dedicated)"],
  },
  // ─── MEDIA ENTRANCE ─────────────────────────────────────────
  {
    id: "media",
    name: "Media Entrance",
    shortName: "Media",
    category: "media",
    capacity: 300,
    svgType: "rect",
    geometry: { x: 48, y: 84, width: 148, height: 116, rx: 14 },
    labelX: 122,
    labelY: 147,
    visibleTo: ["organizer", "security", "venue_staff"],
    facilities: ["Press Box", "Broadcast Gallery", "Mixed Zone"],
    aiRecommendations: {
      PRE_MATCH: "Media accreditation active. 142/300 checked in.",
      FIRST_HALF: "Media area active. Full staff.",
      HALFTIME: "Post-halftime pressers in 20 min. Clear mixed zone.",
      SECOND_HALF: "Media steady.",
      POST_MATCH: "Post-match press conference at 23:00. Clear path.",
    },
    defaultVolunteers: 3,
    medicalAccessSecs: 180,
    transport: ["VIP Shuttle (15 min loop)"],
  },
];

export const ZONE_CATEGORY_STYLES: Record<ZoneCategory, {
  baseFill: string;
  stroke: string;
  icon: string;
  label: string;
}> = {
  gate:      { baseFill: "#0d1f3c", stroke: "#3b82f6", icon: "🚪", label: "Gate" },
  concourse: { baseFill: "#0d1f0d", stroke: "#22c55e", icon: "🏟",  label: "Concourse" },
  food:      { baseFill: "#2a1500", stroke: "#f59e0b", icon: "🍔", label: "Food" },
  vip:       { baseFill: "#150a2e", stroke: "#a855f7", icon: "⭐", label: "VIP" },
  medical:   { baseFill: "#0a0f1e", stroke: "#ef4444", icon: "🏥", label: "Medical" },
  restroom:  { baseFill: "#071520", stroke: "#06b6d4", icon: "🚻", label: "Restroom" },
  parking:   { baseFill: "#131a07", stroke: "#84cc16", icon: "🅿️", label: "Parking" },
  metro:     { baseFill: "#071818", stroke: "#14b8a6", icon: "🚇", label: "Metro" },
  pitch:     { baseFill: "#071a07", stroke: "#166534", icon: "⚽", label: "Pitch" },
  seating:   { baseFill: "#080f08", stroke: "#16a34a", icon: "💺", label: "Seating" },
  emergency: { baseFill: "#1a0808", stroke: "#f97316", icon: "⚡", label: "Emergency" },
  media:     { baseFill: "#1a1807", stroke: "#eab308", icon: "📡", label: "Media" },
};

export const getDensityColor = (density: number): string => {
  if (density >= 0.9) return "#ef4444";
  if (density >= 0.7) return "#f97316";
  if (density >= 0.45) return "#eab308";
  return "#22c55e";
};

export const getDensityLabel = (density: number): string => {
  if (density >= 0.9) return "Critical";
  if (density >= 0.7) return "Busy";
  if (density >= 0.45) return "Moderate";
  return "Low";
};

export const getRiskLevel = (density: number): RiskLevel => {
  if (density >= 0.9) return "critical";
  if (density >= 0.7) return "high";
  if (density >= 0.45) return "moderate";
  return "low";
};
