"use client";

import React from "react";
import { useDashboard } from "../shared/DashboardContext";
import { SharedWidget } from "../shared/SharedWidget";
import { 
  Users, 
  MapPin, 
  Clock, 
  Coffee, 
  Compass, 
  FolderOpen, 
  Eye, 
  QrCode, 
  Bot, 
  Flame,
  Check,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SVGChart } from "@/components/SVGChart";

export const FanDashboard: React.FC = () => {
  const {
    metrics,
    timeLeft,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    queues,
    joinedQueue,
    setJoinedQueue,
    queuePosition,
    setQueuePosition,
    queueWaitTime,
    setQueueWaitTime,
    accessWheelchair,
    setAccessWheelchair,
    accessElevator,
    setAccessElevator,
    accessContrast,
    setAccessContrast,
    accessTextSize,
    setAccessTextSize,
    lostItems,
    lostItemInput,
    setLostItemInput,
    handleReportLostItem,
    theme,
    chartHistory,
    zones
  } = useDashboard();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 1. Today's Match (Championship Countdown Card) */}
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
          <p className="text-xs text-zinc-400">Today's Match: Argentina vs France</p>
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

      {/* SVG Queue trend chart */}
      <div className="grid grid-cols-1 gap-6">
        <SVGChart
          title="Concourse Queue Wait Time Trend (Last 45 mins)"
          data={chartHistory.queues}
          labels={["-40m", "-30m", "-20m", "-10m", "Now"]}
          color="#3b82f6"
          unit=" min"
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 2. Current Crowd */}
        <SharedWidget title="Current Crowd" icon={Users} badge="Live telemetry">
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500">Average Stadium Occupancy</span>
                <div className="text-3xl font-extrabold text-white mt-1">{(metrics.avgOccupancy * 100).toFixed(0)}%</div>
              </div>
              <Badge variant="outline" className={`${
                metrics.avgOccupancy > 0.8 ? "border-red-500/20 text-red-400" :
                metrics.avgOccupancy > 0.5 ? "border-yellow-500/20 text-yellow-400" :
                "border-emerald-500/20 text-emerald-400"
              } font-mono`}>
                {metrics.avgOccupancy > 0.8 ? "Critical Peak" : metrics.avgOccupancy > 0.5 ? "Heavy Flow" : "Normal Flow"}
              </Badge>
            </div>
            <div className="text-[11px] text-zinc-400 leading-relaxed">
              Crowd densities are active. Total of {metrics.totalZones} zones reporting real-time ticket flow rates.
            </div>
          </div>
        </SharedWidget>

        {/* 3. Live Navigation */}
        <SharedWidget title="Live Navigation" icon={MapPin}>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Search sections, gates, concessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50"
            />
            <button 
              onClick={() => setActiveTab("navigation")}
              className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5`}
            >
              Open Pathfinder Map →
            </button>
          </div>
        </SharedWidget>

        {/* 4. Queue Times */}
        <SharedWidget title="Concourse Queue Times" icon={Clock} badge="Live Wait Times">
          <div className="space-y-2.5">
            {queues.map((q) => (
              <div key={q.id} className="flex justify-between items-center bg-zinc-950/60 p-2.5 border border-zinc-850 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-zinc-200">{q.name}</div>
                  <div className="text-[9px] text-zinc-500">{q.length} people in line</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${theme.text}`}>{q.wait_time} min</div>
                </div>
              </div>
            ))}
          </div>
        </SharedWidget>

        {/* 5. Food & Beverage (Queue Radar) */}
        <SharedWidget title="Food & Beverage" icon={Coffee}>
          <div className="space-y-3">
            {(() => {
              const fcDensity = zones.find(z => z.id === "food_court")?.current_density || 0.45;
              const burgerWait = Math.round(fcDensity * 35);
              const pretzelWait = Math.round(fcDensity * 12);
              return (
                <>
                  <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Burger Prime (Sec 201)</div>
                      <div className={`text-[10px] ${burgerWait > 20 ? "text-red-400" : "text-green-400"} mt-0.5`}>
                        {burgerWait > 20 ? "High Demand" : "Moderate Demand"}
                      </div>
                    </div>
                    <Badge variant="outline" className={burgerWait > 20 ? "border-red-500/20 text-red-400" : "border-green-500/20 text-green-400"}>
                      {burgerWait}m Wait
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Pretzel Stand (Sec 203)</div>
                      <div className={`text-[10px] ${pretzelWait > 10 ? "text-yellow-400" : "text-green-400"} mt-0.5`}>
                        {pretzelWait > 10 ? "Steady Lines" : "Quick Walk-up"}
                      </div>
                    </div>
                    <Badge variant="outline" className={pretzelWait > 10 ? "border-yellow-500/20 text-yellow-400" : "border-green-500/20 text-green-400"}>
                      {pretzelWait}m Wait
                    </Badge>
                  </div>
                </>
              );
            })()}
            
            {joinedQueue ? (
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Joined Queue</span>
                <p className="text-xs font-bold">Position: #{queuePosition} • Est. Wait: {queueWaitTime} min</p>
                <button 
                  onClick={() => setJoinedQueue(null)}
                  className="text-[10px] text-red-400 font-bold hover:underline mt-1"
                >
                  Leave Queue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    const fcDensity = zones.find(z => z.id === "food_court")?.current_density || 0.45;
                    setJoinedQueue("burger");
                    setQueuePosition(Math.round(fcDensity * 120));
                    setQueueWaitTime(Math.round(fcDensity * 35));
                  }}
                  className="bg-zinc-900 border border-zinc-850 text-[10px] py-1.5 rounded-lg text-zinc-300 font-bold hover:bg-zinc-850 transition-colors"
                >
                  Queue Burger Sec 201
                </button>
                <button 
                  onClick={() => {
                    const fcDensity = zones.find(z => z.id === "food_court")?.current_density || 0.45;
                    setJoinedQueue("brews");
                    setQueuePosition(Math.round(fcDensity * 45));
                    setQueueWaitTime(Math.round(fcDensity * 12));
                  }}
                  className="bg-zinc-900 border border-zinc-850 text-[10px] py-1.5 rounded-lg text-zinc-300 font-bold hover:bg-zinc-850 transition-colors"
                >
                  Queue Pretzel Sec 203
                </button>
              </div>
            )}
          </div>
        </SharedWidget>

        {/* 6. Nearest Washroom */}
        <SharedWidget title="Nearest Washrooms" icon={Flame} badge="Sec 204/208">
          <div className="space-y-2.5">
            {(() => {
              const fcDensity = zones.find(z => z.id === "food_court")?.current_density || 0.45;
              const wA = Math.round(fcDensity * 4);
              const wB = Math.round(fcDensity * 12);
              return (
                <>
                  <div className="flex justify-between items-center text-xs p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <span>🚻 Restroom A (Sec 204)</span>
                    <span className={`${wA > 5 ? "text-yellow-500" : "text-green-400"} font-bold`}>
                      {wA}m wait ({wA > 5 ? "Busy" : "Clear"})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                    <span>🚻 Restroom B (Sec 208)</span>
                    <span className={`${wB > 8 ? "text-red-400" : "text-yellow-500"} font-bold`}>
                      {wB}m wait ({wB > 8 ? "Congested" : "Steady"})
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </SharedWidget>

        {/* 7. Lost & Found */}
        <SharedWidget title="Lost & Found" icon={FolderOpen}>

          <form onSubmit={handleReportLostItem} className="space-y-2">
            <input 
              type="text" 
              placeholder="Item name (e.g., iPhone, Black Wallet)" 
              value={lostItemInput.name}
              onChange={(e) => setLostItemInput({ ...lostItemInput, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs focus:outline-none"
              required
            />
            <input 
              type="text" 
              placeholder="Estimated Location Lost" 
              value={lostItemInput.loc}
              onChange={(e) => setLostItemInput({ ...lostItemInput, loc: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-xl text-xs focus:outline-none"
              required
            />
            <button type="submit" className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-bold py-2 rounded-xl text-xs transition-all`}>
              Report Lost Item
            </button>
          </form>
        </SharedWidget>

        {/* 8. Accessibility */}
        <SharedWidget title="Accessibility" icon={Eye}>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button 
              onClick={() => setAccessWheelchair(!accessWheelchair)}
              className={`p-2.5 border rounded-xl font-bold transition-all text-left ${
                accessWheelchair ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-850 text-zinc-400"
              }`}
            >
              ♿ Wheelchair Accessible
            </button>
            <button 
              onClick={() => setAccessElevator(!accessElevator)}
              className={`p-2.5 border rounded-xl font-bold transition-all text-left ${
                accessElevator ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-850 text-zinc-400"
              }`}
            >
              🛗 Elevators Only
            </button>
            <button 
              onClick={() => setAccessContrast(!accessContrast)}
              className={`p-2.5 border rounded-xl font-bold transition-all text-left ${
                accessContrast ? `${theme.lightBg} ${theme.border} ${theme.text}` : "bg-zinc-950/50 border-zinc-850 text-zinc-400"
              }`}
            >
              👁️ High Contrast
            </button>
            <div className="p-1 flex items-center justify-between border border-zinc-850 rounded-xl bg-zinc-950/50 px-2.5">
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Size</span>
              <select 
                value={accessTextSize} 
                onChange={(e) => setAccessTextSize(e.target.value as any)}
                className={`bg-transparent ${theme.text} font-bold outline-none`}
              >
                <option value="normal">A</option>
                <option value="large">A+</option>
                <option value="huge">A++</option>
              </select>
            </div>
          </div>
        </SharedWidget>

        {/* 9. Transport Home */}
        <SharedWidget title="Transport Home" icon={Compass}>
          {(() => {
            const exitDensity = zones.find(z => z.id === "gate_a")?.current_density || 0.3;
            const metroWait = Math.round(5 + exitDensity * 30);
            const shuttleWait = Math.round(2 + exitDensity * 12);
            return (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>🚇 Stadium Metro Station</span>
                  <span className={`font-bold ${metroWait > 20 ? "text-red-500" : "text-green-400"}`}>
                    {metroWait}m Wait ({metroWait > 20 ? "Crowded" : "Clear"})
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>🚌 Shuttles (Gate C)</span>
                  <span className={`font-bold ${shuttleWait > 8 ? "text-yellow-500" : "text-green-400"}`}>
                    {shuttleWait}m Wait ({shuttleWait > 8 ? "Steady" : "Clear"})
                  </span>
                </div>
                <div className="bg-zinc-950/80 p-2.5 border border-zinc-850 rounded-xl text-[11px] text-zinc-400">
                  <strong className={`${theme.text} block mb-0.5`}>AI Travel Tip:</strong>
                  Proceed to Exit Gate C; boarding Shuttles saves approximately {Math.max(1, metroWait - shuttleWait)} mins wait.
                </div>
              </div>
            );
          })()}
        </SharedWidget>

        {/* 10. AI Travel Assistant */}
        <SharedWidget title="AI Travel Assistant" icon={Bot}>
          <div className="space-y-2 text-xs">
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Ask about gates, food, and accessible navigation.
            </p>
            <button 
              onClick={() => setActiveTab("ai_assistant")}
              className={`w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${theme.text}`}
            >
              <Bot className="w-4 h-4" /> Suggest Fastest Route Home
            </button>
            <button 
              onClick={() => setActiveTab("ai_assistant")}
              className={`w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${theme.text}`}
            >
              <Bot className="w-4 h-4" /> Find Nearest Food Options
            </button>
          </div>
        </SharedWidget>

      </div>
    </div>
  );
};
