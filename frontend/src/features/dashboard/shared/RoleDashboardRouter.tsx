"use client";

import React from "react";
import { useDashboard } from "./DashboardContext";
import { FanDashboard } from "../fan/FanDashboard";
import { VolunteerDashboard } from "../volunteer/VolunteerDashboard";
import { SecurityDashboard } from "../security/SecurityDashboard";
import { OrganizerDashboard } from "../organizer/OrganizerDashboard";
import { VenueDashboard } from "../venue/VenueDashboard";

export const RoleDashboardRouter: React.FC = () => {
  const { user } = useDashboard();

  if (!user) return null;

  switch (user.role) {
    case "fan":
      return <FanDashboard />;
    case "volunteer":
      return <VolunteerDashboard />;
    case "security":
      return <SecurityDashboard />;
    case "organizer":
      return <OrganizerDashboard />;
    case "venue_staff":
      return <VenueDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center p-12 text-zinc-400 bg-zinc-950/40 border border-zinc-800 rounded-3xl">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-cyan-400 animate-spin mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider">
            Initializing Core Operating Core for {user.role || "unknown"}...
          </p>
        </div>
      );
  }
};
