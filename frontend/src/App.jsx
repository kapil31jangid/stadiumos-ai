import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-400 mb-2 tracking-tight">StadiumSense AI</h1>
        <p className="text-slate-400 mb-6">
          FIFA World Cup 2026 Fan Navigation & Crowd Management System
        </p>
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mb-6 text-left text-sm text-slate-300">
          <p className="font-semibold text-slate-200 mb-2">Scaffolded Components:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>FastAPI backend skeleton (running)</li>
            <li>Vite + React + JS + Tailwind CSS frontend</li>
            <li>Pydantic schemas validated</li>
          </ul>
        </div>
        <div className="text-xs text-slate-500">
          Ready for Phase 2: Guardrails + Firestore
        </div>
      </div>
    </div>
  )
}

export default App
