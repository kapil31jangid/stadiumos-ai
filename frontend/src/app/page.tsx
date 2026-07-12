"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import { Users } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/features/dashboard/shared/DashboardContext";
import { DashboardLayout } from "@/features/dashboard/shared/DashboardLayout";
import { RoleDashboardRouter } from "@/features/dashboard/shared/RoleDashboardRouter";

function DashboardCore() {
  const {
    user,
    setUser,
    isRolePickerOpen,
    setIsRolePickerOpen,
    handleRoleSelection,
    handleJudgeAutoLogin,
    t,
    accessContrast
  } = useDashboard();

  // Local Form States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Always clear any stale mock session on mount so login page is always shown first
  useEffect(() => {
    localStorage.removeItem("stadiumos_mock_user");
  }, []);

  // Supabase Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!isSupabaseConfigured) {
      const profile = { uid: "mock_user_123", email: authEmail, name: authName || "User", role: "" };
      setUser(profile);
      setIsRolePickerOpen(true);
      toast.success("Mock Sign-in Successful!");
      return;
    }
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        toast.success("Successfully logged in!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              name: authName || "Explorer"
            }
          }
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
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
                    className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 text-white"
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
                  className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 text-white"
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
                  className="w-full bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 text-white"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/10 mt-2">
                {authMode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>
            {/* Demo Accounts Quick Access */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 space-y-2 mt-4">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Demo Accounts Quick Access</div>
              <div className="grid grid-cols-2 gap-2">
                {["organizer", "fan", "volunteer", "security", "venue_staff"].map(role => (
                  <button 
                    key={role}
                    type="button"
                    onClick={() => {
                      setAuthEmail(`${role}@stadiumos.org`);
                      setAuthPassword("stadiumos123");
                      setAuthMode("signin");
                      toast.info(`Filled credentials for Demo ${role.replace("_", " ").toUpperCase()}. Click 'Sign In' to log in.`);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] py-1.5 rounded-lg text-zinc-300 capitalize transition-all"
                  >
                    {role.replace("_", " ")}
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
      {user && (isRolePickerOpen || !user.role) && (
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

      {/* ================= CORE CONTENT WRAPPED IN LAYOUT ================= */}
      {user && user.role && (
        <DashboardLayout>
          <RoleDashboardRouter />
        </DashboardLayout>
      )}

      <Toaster position="top-right" theme="dark" />
    </>
  );
}

export default function Page() {
  return (
    <DashboardProvider>
      <DashboardCore />
    </DashboardProvider>
  );
}
