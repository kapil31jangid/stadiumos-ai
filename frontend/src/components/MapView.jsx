const DENSITY_COLOR = (pct) => {
  if (pct > 85) return '#ef4444';
  if (pct > 60) return '#f59e0b';
  return '#10b981';
};

export default function MapView({ zones }) {
  if (!zones || zones.length === 0) {
    return (
      <div className="glass-card p-5 text-center text-slate-500 text-sm">
        Loading zone data...
      </div>
    );
  }

  return (
    <section aria-label="Stadium zone density map">
      <h2
        className="text-lg font-bold mb-3 text-slate-200"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Live Zone Status
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {zones.map(zone => {
          const color = DENSITY_COLOR(zone.density_pct);
          const hasIncident = zone.incident_flags && zone.incident_flags.length > 0;

          return (
            <div
              key={zone.zone_id}
              className="glass-card p-3 relative overflow-hidden"
              role="region"
              aria-label={`${zone.name || zone.zone_id}: ${zone.density_pct}% crowd density`}
            >
              {hasIncident && (
                <span
                  className="absolute top-2 right-2 text-red-400 text-xs"
                  aria-label="Active incident"
                >⚠️</span>
              )}
              <p className="text-xs font-semibold text-slate-300 mb-1 truncate">
                {zone.zone_id}
              </p>
              <p className="text-xl font-bold mb-1.5" style={{ color }}>
                {zone.density_pct}%
              </p>
              <div className="density-bar-track">
                <div
                  className="density-bar-fill"
                  style={{ width: `${zone.density_pct}%`, background: color }}
                  role="progressbar"
                  aria-valuenow={zone.density_pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Crowd density: ${zone.density_pct}%`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{zone.gate_wait_minutes}m wait</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
