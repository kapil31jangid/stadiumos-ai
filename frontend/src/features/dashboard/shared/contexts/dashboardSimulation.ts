import { useEffect } from "react";
import { Zone, Incident, AppNotification, MatchPhase } from "./dashboardTypes";

export const useDashboardSimulation = ({
  matchPhase,
  weather,
  incidents,
  zones,
  setZones,
  setMetrics,
  setChartHistory,
  addNotification,
  setMatchPhase
}: {
  matchPhase: MatchPhase;
  weather: string;
  incidents: Incident[];
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  setMetrics: React.Dispatch<React.SetStateAction<{ avgOccupancy: number; criticalZones: number; totalZones: number }>>;
  setChartHistory: React.Dispatch<React.SetStateAction<{
    occupancy: number[];
    queues: number[];
    incidents: number[];
    energy: number[];
    volunteer: number[];
  }>>;
  addNotification: (message: string, role?: AppNotification["role"], type?: AppNotification["type"]) => void;
  setMatchPhase: (phase: MatchPhase) => void;
}) => {
  useEffect(() => {
    // Initialise simulation values if zones is empty
    if (zones.length === 0) {
      setMatchPhase("PRE_MATCH");
    }

    const interval = setInterval(() => {
      // 1. Tick zones crowd density with minor realistic fluctuations (+/- 3%)
      setZones((prevZones) => {
        const nextZones = prevZones.map((z) => {
          const drift = (Math.random() - 0.5) * 0.05;
          
          // Phase-based constraint bounds
          let minDen = 0.05;
          const maxDen = 0.99;
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
          addNotification(choice.msg, choice.role as AppNotification["role"], choice.type as AppNotification["type"]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchPhase, weather, incidents.length, zones.length, addNotification, setMatchPhase]);
};
