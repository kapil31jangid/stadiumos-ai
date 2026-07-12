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

export type MatchPhase = "PRE_MATCH" | "FIRST_HALF" | "HALFTIME" | "SECOND_HALF" | "POST_MATCH";
