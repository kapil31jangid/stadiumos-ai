import { useState } from 'react';
import LanguageSelector from '../components/LanguageSelector';
import AccessibilityToggle from '../components/AccessibilityToggle';
import RouteCard from '../components/RouteCard';

const ZONES = ['Zone_1','Zone_2','Zone_3','Zone_4','Zone_5','Zone_6','Zone_7','Zone_8'];
const GATES = ['Gate_A','Gate_B','Gate_C','Gate_D','Gate_E','Gate_F'];

export default function FanApp() {
  const [form, setForm] = useState({
    fan_id: `fan_${Math.floor(Math.random() * 90000) + 10000}`,
    current_zone: 'Zone_1',
    destination_gate: 'Gate_A',
    ticket_category: 'Cat 1',
    mobility_needs: 'none',
    preferred_language: 'en',
    time_to_kickoff_minutes: 45,
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNavigate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch('/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, time_to_kickoff_minutes: Number(form.time_to_kickoff_minutes) }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, id, children) => (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="text-5xl mb-3" aria-hidden="true">🏟️</div>
        <h1
          className="text-3xl font-extrabold gradient-text mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          StadiumSense AI
        </h1>
        <p className="text-slate-400 text-sm">FIFA World Cup 2026 · Fan Navigator</p>
      </header>

      {/* Context form */}
      <form
        className="glass-card p-6 space-y-4"
        onSubmit={handleNavigate}
        aria-label="Navigation request form"
      >
        <div className="grid grid-cols-2 gap-3">
          {field('Current Zone', 'current-zone',
            <select id="current-zone" className="field-input" value={form.current_zone}
              onChange={e => setForm(f => ({ ...f, current_zone: e.target.value }))}
              aria-label="Current zone">
              {ZONES.map(z => <option key={z}>{z}</option>)}
            </select>
          )}
          {field('Destination Gate', 'dest-gate',
            <select id="dest-gate" className="field-input" value={form.destination_gate}
              onChange={e => setForm(f => ({ ...f, destination_gate: e.target.value }))}
              aria-label="Destination gate">
              {GATES.map(g => <option key={g}>{g}</option>)}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field('Ticket Category', 'ticket-cat',
            <select id="ticket-cat" className="field-input" value={form.ticket_category}
              onChange={e => setForm(f => ({ ...f, ticket_category: e.target.value }))}
              aria-label="Ticket category">
              {['Cat 1','Cat 2','Cat 3','VIP','Family'].map(c => <option key={c}>{c}</option>)}
            </select>
          )}
          {field('Minutes to Kickoff', 'kickoff-mins',
            <input id="kickoff-mins" type="number" min="0" max="180" className="field-input"
              value={form.time_to_kickoff_minutes}
              onChange={e => setForm(f => ({ ...f, time_to_kickoff_minutes: e.target.value }))}
              aria-label="Minutes to kickoff" />
          )}
        </div>

        <LanguageSelector
          value={form.preferred_language}
          onChange={val => setForm(f => ({ ...f, preferred_language: val }))}
        />

        <AccessibilityToggle
          value={form.mobility_needs}
          onChange={val => setForm(f => ({ ...f, mobility_needs: val }))}
        />

        <button
          type="submit"
          id="navigate-btn"
          className="btn-primary w-full justify-center text-base"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="pulse-dot bg-slate-900 mr-1" aria-hidden="true" />
              Finding your route…
            </>
          ) : (
            <><span aria-hidden="true">🧭</span> Get My Route</>
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div
          className="glass-card p-4 mt-4 border-red-500/30 text-red-300 text-sm fade-in"
          role="alert"
          aria-live="assertive"
        >
          <strong>⚠️ Navigation error:</strong> {error}
        </div>
      )}

      {/* Result */}
      <RouteCard response={response} />
    </div>
  );
}
