export default function RouteCard({ response }) {
  if (!response) return null;

  const { route_steps, eta, reasoning, audio_url, alerts } = response;

  return (
    <section
      className="glass-card p-5 fade-in mt-6"
      aria-label="Navigation recommendation"
      aria-live="polite"
    >
      {/* ETA header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-0.5">
            Your Route
          </p>
          <h2 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'var(--font-heading)' }}>
            {eta} min walk
          </h2>
        </div>
        <div className="text-4xl" aria-hidden="true">🏟️</div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="mb-4 flex flex-col gap-2" role="alert" aria-label="Active alerts">
          {alerts.map((alert, i) => (
            <div key={i} className="alert-pill">
              <span aria-hidden="true">⚠️</span>
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Route steps */}
      <ol aria-label="Navigation steps" className="mb-4">
        {route_steps.map((step, i) => (
          <li key={i} className="step-item">
            <span className="step-number" aria-hidden="true">{i + 1}</span>
            <span className="text-sm text-slate-200 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {/* AI reasoning */}
      {reasoning && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4">
          <p className="text-xs text-slate-400 font-medium mb-1">
            <span aria-hidden="true">🤖</span> AI Reasoning
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* Audio playback */}
      {audio_url && (
        <div className="mt-3">
          <p className="text-xs text-slate-400 mb-1.5">
            <span aria-hidden="true">🔊</span> Audio navigation available
          </p>
          <audio
            controls
            src={audio_url}
            aria-label="Spoken navigation instructions"
            className="w-full h-10 rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
