"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../../shared/DashboardContext";

export const MatchCountdownCard: React.FC = () => {
  const { theme, matchPhase } = useDashboard();
  const [timeLeft, setTimeLeft] = useState({ hrs: 2, min: 42, sec: 15 });

  // Reset timer on match phase changes
  useEffect(() => {
    let timeObj = { hrs: 2, min: 42, sec: 15 };
    switch (matchPhase) {
      case "PRE_MATCH":   timeObj = { hrs: 2, min: 42, sec: 15 }; break;
      case "FIRST_HALF":  timeObj = { hrs: 0, min: 25, sec: 0 }; break;
      case "HALFTIME":    timeObj = { hrs: 0, min: 15, sec: 0 }; break;
      case "SECOND_HALF": timeObj = { hrs: 0, min: 72, sec: 0 }; break;
      case "POST_MATCH":  timeObj = { hrs: 0, min: 45, sec: 0 }; break;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(timeObj);
  }, [matchPhase]);

  // Countdown timer tick
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

  return (
    <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800/60 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
      <div className="space-y-2">
        <span className={`bg-blue-500/10 ${theme.text} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
          Up Next
        </span>
        <span className="text-zinc-500 text-xs ml-2">Main Stage</span>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
          Championship Kick-off
        </h2>
        <p className="text-xs text-zinc-400">Today&apos;s Match: Argentina vs France</p>
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
              <div className={`bg-zinc-950 border border-zinc-800/80 px-4 py-3 rounded-xl text-xl font-mono font-bold ${theme.text} shadow-inner`}>
                {item.val}
              </div>
              <span className="text-[9px] font-bold text-zinc-500 mt-1.5 tracking-wider">{item.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
