import { useState } from 'react';
import FanApp from './pages/FanApp';
import OperatorDashboard from './pages/OperatorDashboard';
import './index.css';

export default function App() {
  const [view, setView] = useState('fan');

  return (
    <>
      {/* Top navigation bar */}
      <nav
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ background: 'rgba(10,15,30,0.92)', backdropFilter: 'blur(12px)' }}
        aria-label="Main navigation"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🏟️</span>
            <span
              className="font-bold text-sm gradient-text"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              StadiumSense AI
            </span>
          </div>

          <div
            className="flex gap-1 bg-white/5 rounded-xl p-1"
            role="tablist"
            aria-label="Application views"
          >
            <button
              role="tab"
              id="tab-fan"
              aria-controls="panel-fan"
              aria-selected={view === 'fan'}
              onClick={() => setView('fan')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'fan'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧭 Fan
            </button>
            <button
              role="tab"
              id="tab-operator"
              aria-controls="panel-operator"
              aria-selected={view === 'operator'}
              onClick={() => setView('operator')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === 'operator'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Operator
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>
        <div
          id="panel-fan"
          role="tabpanel"
          aria-labelledby="tab-fan"
          hidden={view !== 'fan'}
        >
          <FanApp />
        </div>
        <div
          id="panel-operator"
          role="tabpanel"
          aria-labelledby="tab-operator"
          hidden={view !== 'operator'}
        >
          <OperatorDashboard />
        </div>
      </main>
    </>
  );
}
