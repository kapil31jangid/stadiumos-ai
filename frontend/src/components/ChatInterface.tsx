"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/features/dashboard/shared/DashboardContext";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "assistant" | "user";
  content: string;
  status?: string;
}

const ROLE_CONFIG: Record<string, { greeting: string; placeholder: string; chips: string[] }> = {
  fan: {
    greeting: "Hello! I'm StadiumOS AI — your match-day navigator. Ask me about gates, food stalls, transport, accessible routes, or anything happening at the stadium.",
    placeholder: "Ask about gates, food, seating, or transport...",
    chips: [
      "What's the fastest exit from Section 204?",
      "Which food stall has the shortest queue?",
      "How do I get to my seat from Gate C?",
      "When does the next shuttle leave?",
    ],
  },
  volunteer: {
    greeting: "Volunteer Assistant active. I can help you prioritize tasks, report incidents, translate instructions, or navigate to your assigned zone.",
    placeholder: "Ask about tasks, incidents, or translations...",
    chips: [
      "What tasks should I prioritize right now?",
      "Translate: 'Please follow me to the elevator' to Spanish",
      "Which zones are critically understaffed?",
      "What's the escalation procedure for a medical emergency?",
    ],
  },
  security: {
    greeting: "Security Command AI initialized. I can summarize active incidents, assess crowd risk levels, recommend crowd control actions, or brief you on threat status.",
    placeholder: "Query about incidents, threats, or crowd control...",
    chips: [
      "Summarize all active incidents",
      "Which zones are at highest density risk?",
      "What should I do if Gate C becomes critically congested?",
      "Recommend crowd control actions for Concourse B",
    ],
  },
  organizer: {
    greeting: "Operations AI initialized. I can recommend operational actions, assist with announcement generation, provide resource allocation advice, or give a full event status briefing.",
    placeholder: "Query operations, resources, or announcements...",
    chips: [
      "Give me a full operational status briefing",
      "Where should I redeploy reserves right now?",
      "Generate an evacuation announcement for Gate C",
      "What's the transport bottleneck risk for post-match?",
    ],
  },
  venue_staff: {
    greeting: "Facilities AI online. I can recommend preventative repairs, flag energy efficiency opportunities, assess equipment health, or suggest HVAC optimizations.",
    placeholder: "Ask about maintenance, facilities, or sustainability...",
    chips: [
      "What are the top 3 maintenance priorities right now?",
      "How can we reduce HVAC load during halftime?",
      "Which equipment is at risk of failure today?",
      "Sustainability tips for post-match energy wind-down",
    ],
  },
};

export const ChatInterface: React.FC = () => {
  let userRole = "fan";
  try {
    const context = useDashboard();
    if (context?.user?.role) {
      userRole = context.user.role;
    }
  } catch {
    // fallback if context is not present
  }

  const config = ROLE_CONFIG[userRole] ?? ROLE_CONFIG.fan;

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: config.greeting }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: config.greeting }]);
  }, [userRole, config.greeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const getApiUrl = (path: string) => {
        if (typeof window !== "undefined" && window.location.port === "3000") {
          return `http://localhost:8080${path}`;
        }
        return path;
      };

      let token = "";
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          token = sessionData.session.access_token;
        }
      } catch {
        // fallback
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl(`/api/recommend`), {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          user_location: "current location", 
          destination: messageText,
          role: userRole
        }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.recommendation,
        status: data.status
      }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting to my operational brain right now. Please try again shortly.",
        status: "Error"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
      <CardHeader className="border-b border-zinc-800 py-4 px-6 flex flex-row items-center gap-2">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold text-white">StadiumOS AI Assistant</CardTitle>
          <p className="text-[10px] text-zinc-500 capitalize">{userRole.replace("_", " ")} Mode · Gemini Powered</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea 
          className="flex-1 p-5"
          role="log" 
          aria-live="polite" 
          aria-relevant="additions"
          aria-label="Chat messages"
        >
          <div ref={scrollRef} className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-zinc-700" : "bg-cyan-600"
                    }`}>
                      {msg.role === "user" 
                        ? <User className="w-3.5 h-3.5 text-white" aria-hidden /> 
                        : <Bot className="w-3.5 h-3.5 text-white" aria-hidden />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                        : "bg-zinc-800/80 border border-zinc-700 text-zinc-200 rounded-tl-none"
                    }`}>
                      {msg.content}
                      {msg.role === "assistant" && msg.status && msg.status !== "Success" && (
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-40 block mt-1">
                          {msg.status} Mode
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-zinc-800/50 border border-zinc-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span className="text-xs text-zinc-500">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Quick prompt chips — shown only when no user messages yet */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Quick prompts</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {config.chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(chip)}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-zinc-800 flex gap-2 bg-zinc-900/40" role="form" aria-label="Send message to AI">
          <Input
            placeholder={config.placeholder}
            aria-label="Message to AI assistant"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 text-sm"
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={isLoading || !input.trim()} 
            size="icon" 
            className="bg-cyan-600 hover:bg-cyan-700 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
