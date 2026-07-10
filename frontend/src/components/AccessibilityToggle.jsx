const MOBILITY_OPTIONS = [
  { value: 'none', label: '🚶 No special requirements', desc: 'Standard route' },
  { value: 'wheelchair', label: '♿ Wheelchair user', desc: 'Accessible routes only' },
  { value: 'limited_mobility', label: '🦯 Limited mobility', desc: 'Accessible routes only' },
  { value: 'sensory_sensitive', label: '🎧 Sensory sensitivity', desc: 'Low-crowd, quiet paths + audio' },
];

export default function AccessibilityToggle({ value, onChange }) {
  return (
    <fieldset>
      <legend className="block text-xs font-medium text-slate-400 mb-2">Accessibility Needs</legend>
      <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Accessibility options">
        {MOBILITY_OPTIONS.map(opt => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              value === opt.value
                ? 'border-cyan-400/60 bg-cyan-400/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              name="mobility"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
              aria-label={opt.label}
            />
            <span className="text-base">{opt.label.split(' ')[0]}</span>
            <span className="flex-1">
              <span className="text-sm font-medium text-slate-200 block">
                {opt.label.split(' ').slice(1).join(' ')}
              </span>
              <span className="text-xs text-slate-500">{opt.desc}</span>
            </span>
            {value === opt.value && (
              <span className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-xs text-slate-900 font-bold" aria-hidden="true">✓</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
