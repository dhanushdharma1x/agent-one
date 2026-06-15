import React from "react";
import { 
  Bot, 
  Calendar, 
  PhoneCall, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  PhoneOutgoing, 
  Target,
  FileSpreadsheet
} from "lucide-react";

interface LandingPageProps {
  onStartAuth: (mode: "login" | "register") => void;
}

export default function LandingPage({ onStartAuth }: LandingPageProps) {
  const coreFeatures = [
    {
      title: "24/7 Voice Answering",
      description: "Never miss another call. Spark picks up instantly after hours and answers multiple inquiries in parallel.",
      icon: PhoneCall,
    },
    {
      title: "Self-Serve Appointments",
      description: "Directly books, reschedules, or cancels client dates on your calendar. Completely double-booking proof.",
      icon: Calendar,
    },
    {
      title: "Intelligent FAQ Knowledge",
      description: "Instant, friendly answers about directions, pricing, insurance plans, and policies tailored to your business.",
      icon: Bot,
    },
    {
      title: "Instant WhatsApp Confirmations",
      description: "Queues confirmation prompts, notifications, and rescheduling options to the patient right after they hang up.",
      icon: MessageSquare,
    },
    {
      title: "Transcripts & AI Summaries",
      description: "Get full verbatim transcripts, audio playback tracks, and high-quality bullet point summaries of every interaction.",
      icon: FileSpreadsheet,
    },
    {
      title: "Lead Capture & Conversion",
      description: "Automatically log caller details, requirements, and callback preferences straight to your dashboard.",
      icon: Target,
    }
  ];

  return (
    <div id="landing-root" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans whitespace-normal selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
              <Bot size={20} />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-white">AgentOne</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="landing-btn-login"
              onClick={() => onStartAuth("login")}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              id="landing-btn-register"
              onClick={() => onStartAuth("register")}
              className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Area */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto space-y-6 relative">
          <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight text-white leading-tight">
            Your AI Employee for <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Customer Calls</span>.
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base text-zinc-400 leading-relaxed">
            Om Dental Clinic and 1,200+ local operations use AgentOne to answer calls automatically, book appointments directly, capture leads, and send instant WhatsApp confirmations.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="hero-btn-register"
              onClick={() => onStartAuth("register")}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Free Trial <ArrowRight size={16} />
            </button>
            
            <button
              id="hero-btn-login"
              onClick={() => onStartAuth("login")}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-850 text-white font-semibold text-sm rounded-lg border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Demo Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">Full-Stack AI Customer Reception</h2>
            <p className="text-zinc-400 text-xs md:text-sm">Everything you need to replace expensive phone desks and never drop a lead again.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div 
                  key={i} 
                  className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 relative transition-all hover:border-zinc-800 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 shrink-0">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-2.5">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust banner inspired by Notion */}
      <section className="py-20 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono">Trusted by local clinics</p>
          <div className="text-lg md:text-xl font-sans font-medium text-zinc-300 italic whitespace-normal">
            "AgentOne rescued our small clinical dental service. Spark answers up to 15 concurrent dental queries during busy teeth scaling blocks and booked 24 patients in our first week!"
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Dr. Sarah Verma, MDS</p>
            <p className="text-xs text-zinc-500 mt-0.5">Clinic Director, Om Dental Clinic</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20">
              <Bot size={16} />
            </div>
            <span className="font-sans font-bold text-sm tracking-tight text-white">AgentOne</span>
          </div>

          <p className="text-xs text-zinc-600">
            © 2026 AgentOne Technologies Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
