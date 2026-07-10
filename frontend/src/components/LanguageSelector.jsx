import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'ja', label: '🇯🇵 日本語' },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div>
      <label htmlFor="language-select" className="block text-xs font-medium text-slate-400 mb-1">
        Language
      </label>
      <select
        id="language-select"
        className="field-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Select preferred language"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
