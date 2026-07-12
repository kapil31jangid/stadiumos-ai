"use client";

import React from "react";
import { useDashboard } from "./DashboardContext";

interface SharedWidgetProps {
  title: string;
  icon: React.ComponentType<any>;
  badge?: string;
  className?: string;
  children: React.ReactNode;
}

export const SharedWidget: React.FC<SharedWidgetProps> = ({ 
  title, 
  icon: Icon, 
  badge, 
  className = "", 
  children 
}) => {
  const { theme } = useDashboard();

  return (
    <div className={`bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4 hover:border-zinc-700 transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${theme.text}`} aria-hidden="true" />
          {title}
        </h3>
        {badge && (
          <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded border font-mono ${theme.lightBg} ${theme.text} ${theme.border}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-zinc-300 text-xs">
        {children}
      </div>
    </div>
  );
};
