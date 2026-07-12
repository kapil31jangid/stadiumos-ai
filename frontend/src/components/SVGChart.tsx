"use client";

import React from "react";
import { motion } from "framer-motion";

interface SVGChartProps {
  title: string;
  data: number[];
  labels: string[];
  type?: "line" | "bar";
  color?: string;
  unit?: string;
}

export const SVGChart: React.FC<SVGChartProps> = ({
  title,
  data,
  labels,
  type = "line",
  color = "#22d3ee", // cyan-400
  unit = "",
}) => {
  const maxVal = Math.max(...data, 10);
  const minVal = 0;
  const range = maxVal - minVal;

  const chartHeight = 120;
  const chartWidth = 500;
  const padding = 20;

  // Generate points for line/area chart
  const points = data.map((val, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (data.length - 1 || 1);
    const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - padding * 2);
    return { x, y, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : "";

  return (
    <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{title}</span>
        <span className="text-[11px] font-bold font-mono text-zinc-300">
          {data[data.length - 1]}
          {unit}
        </span>
      </div>

      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = padding + pct * (chartHeight - padding * 2);
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#27272a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {type === "line" ? (
            <>
              {/* Fill Area under the line */}
              <motion.path
                d={areaD}
                fill={`url(#gradient-${title})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Line stroke */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx} className="group/point">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#09090b"
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill={color}
                    className="opacity-0 group-hover/point:opacity-20 transition-opacity cursor-pointer"
                  />
                </g>
              ))}
            </>
          ) : (
            /* Bar Chart */
            points.map((p, idx) => {
              const barWidth = Math.max(10, (chartWidth - padding * 2) / data.length - 12);
              const barHeight = chartHeight - padding - p.y;
              return (
                <g key={idx}>
                  <motion.rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    rx="3"
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    opacity={0.85}
                  />
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-wider mt-2 px-1">
        {labels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
    </div>
  );
};
