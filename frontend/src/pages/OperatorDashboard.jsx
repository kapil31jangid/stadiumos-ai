import { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';

const DENSITY_COLOR = (pct) => {
  if (pct > 85) return 'text-red-400';
  if (pct > 60) return 'text-amber-400';
  return 'text-emerald-400';
};

export default function OperatorDashboard() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/operator/crowd-summary');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setZones(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const incidents = zones.filter(z => z.incident_flags?.length > 0);
  const highDensity = zones.filter(z => z.density_pct > 85);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-extrabold gradient-text"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Operator Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">FIFA World Cup 2026 · StadiumSense AI</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          {lastUpdated ? (
            <>
              <span className="pulse-dot bg-emerald-400 mr-1" aria-hidden="true" />
              Updated {lastUpdated}
            </>
          ) : 'Connecting…'}
        </div>
      </header>

      {/* KPI row */}
      <div
        className="grid grid-cols-3 gap-3 mb-6"
        role="region"
        aria-label="Key performance indicators"
      >
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-extrabold text-cyan-400">{zones.length}</p>
          <p className="text-xs text-slate-400 mt-1">Active Zones</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className={`text-3xl font-extrabold ${highDensity.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {highDensity.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">High Density</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className={`text-3xl font-extrabold ${incidents.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {incidents.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Active Incidents</p>
        </div>
      </div>

      {/* Live map view */}
      {loading ? (
        <div className="glass-card p-8 text-center text-slate-500">Loading crowd data…</div>
      ) : (
        <MapView zones={zones} />
      )}

      {/* Incidents table */}
      {incidents.length > 0 && (
        <section className="glass-card p-5 mt-6" aria-label="Active incidents">
          <h2
            className="text-base font-bold text-red-400 mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ⚠️ Active Incidents
          </h2>
          <div className="space-y-2">
            {incidents.map(zone => (
              <div
                key={zone.zone_id}
                className="flex items-center justify-between rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3"
                role="alert"
                aria-label={`Incident in ${zone.zone_id}`}
              >
                <div>
                  <span className="font-semibold text-sm text-slate-200">{zone.zone_id}</span>
                  <span className="text-slate-400 text-xs ml-2">{zone.name}</span>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {zone.incident_flags.map((flag, i) => (
                    <span key={i} className="alert-pill text-xs">{flag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full zone table */}
      <section className="glass-card mt-6 overflow-hidden" aria-label="Full zone data table">
        <h2
          className="text-base font-bold text-slate-200 px-5 pt-5 pb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          All Zones
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Zone crowd density data">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                <th scope="col" className="text-left px-5 py-3">Zone</th>
                <th scope="col" className="text-left px-5 py-3">Name</th>
                <th scope="col" className="text-center px-5 py-3">Density</th>
                <th scope="col" className="text-center px-5 py-3">Wait</th>
                <th scope="col" className="text-center px-5 py-3">Access</th>
                <th scope="col" className="text-left px-5 py-3">Incidents</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr
                  key={zone.zone_id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs text-slate-300">{zone.zone_id}</td>
                  <td className="px-5 py-3 text-slate-300">{zone.name}</td>
                  <td className={`px-5 py-3 text-center font-bold ${DENSITY_COLOR(zone.density_pct)}`}>
                    {zone.density_pct}%
                  </td>
                  <td className="px-5 py-3 text-center text-slate-400">{zone.gate_wait_minutes}m</td>
                  <td className="px-5 py-3 text-center">
                    {zone.accessible
                      ? <span className="text-emerald-400" aria-label="Accessible">♿</span>
                      : <span className="text-slate-600" aria-label="Not accessible">—</span>}
                  </td>
                  <td className="px-5 py-3 text-xs text-red-400">
                    {zone.incident_flags?.join(', ') || <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
