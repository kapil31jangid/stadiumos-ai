"use client";

import React, { useState } from "react";
import { useDashboard } from "../DashboardContext";
import { Languages, Bot } from "lucide-react";

const PHRASE_BANK: Record<string, Record<string, string>> = {
  "Please move to Concourse B, elevator access is on the right.": {
    es: "Por favor diríjase al Concourse B, el ascensor está a la derecha.",
    fr: "Veuillez vous diriger vers le Concours B, l'ascenseur est à droite.",
    ar: "يرجى التوجه إلى المجمع B، المصعد على اليمين.",
    hi: "कृपया Concourse B की ओर जाएं, लिफ्ट दाईं ओर है।",
    ja: "コンコースBに向かってください。エレベーターは右手にあります。",
  },
  "Emergency exits are located at Gates A, B, and C.": {
    es: "Las salidas de emergencia están en las Puertas A, B y C.",
    fr: "Les sorties de secours se trouvent aux portes A, B et C.",
    ar: "مخارج الطوارئ موجودة عند البوابات A وB وC.",
    hi: "आपातकालीन निकास गेट A, B और C पर स्थित हैं।",
    ja: "緊急出口はゲートA、B、Cにあります。",
  },
  "Your seat is in Section 204, Row G, Seat 14.": {
    es: "Su asiento está en la Sección 204, Fila G, Asiento 14.",
    fr: "Votre siège est dans la section 204, rangée G, siège 14.",
    ar: "مقعدك في القسم 204، الصف G، المقعد 14.",
    hi: "आपकी सीट सेक्शन 204, पंक्ति G, सीट 14 में है।",
    ja: "お席はセクション204、列G、シート14です。",
  },
};

export const PanelTranslation: React.FC = () => {
  const { theme, setActiveTab } = useDashboard();
  const [selectedPhrase, setSelectedPhrase] = useState(Object.keys(PHRASE_BANK)[0]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Languages className={`w-6 h-6 ${theme.text}`} /> Multilingual Translation Assistant
      </h2>
      
      <div className="bg-zinc-900/20 border border-zinc-800/60 p-6 rounded-3xl space-y-4">
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-2">Select a common phrase to translate:</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Object.keys(PHRASE_BANK).map((phrase, i) => (
              <button
                key={i}
                onClick={() => setSelectedPhrase(phrase)}
                className={`p-3 text-left text-[11px] rounded-xl border transition-all ${
                  selectedPhrase === phrase
                    ? `${theme.lightBg} ${theme.border} ${theme.text} font-bold`
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">🇬🇧 English (Source)</div>
             <p className="text-sm text-zinc-200">&quot;{selectedPhrase}&quot;</p>
          </div>
          
          {selectedPhrase && PHRASE_BANK[selectedPhrase] && Object.entries(PHRASE_BANK[selectedPhrase]).map(([lang, text]) => (
            <div key={lang} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">
                {lang === "es" ? "🇪🇸 Spanish" : lang === "fr" ? "🇫🇷 French" : lang === "ar" ? "🇸🇦 Arabic" : lang === "hi" ? "🇮🇳 Hindi" : "🇯🇵 Japanese"}
              </div>
               <p className={`text-sm ${theme.text}`}>&quot;{text}&quot;</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Bot className={`w-5 h-5 ${theme.text} shrink-0 mt-0.5`} />
          <div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Need to translate a custom phrase? Use the AI Assistant to get real-time translations for any stadium communication.</p>
            <button
              onClick={() => setActiveTab("ai_assistant")}
              className={`mt-2 text-[11px] font-bold ${theme.text} flex items-center gap-1 hover:opacity-80`}
            >
              Open AI Assistant for custom translation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
