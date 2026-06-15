import React, { useState, useEffect } from "react";
import { 
  Bot, 
  User, 
  Mail, 
  Lock, 
  Compass, 
  Sliders, 
  Check, 
  CheckCircle, 
  PhoneOutgoing, 
  ShieldAlert, 
  MapPin, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  HelpCircle,
  Clock,
  ArrowUpRight
} from "lucide-react";

// Import custom modular subcomponents
import Sidebar from "./components/Sidebar.js";
import DashboardStats from "./components/DashboardStats.js";
import AppointmentCalendar from "./components/AppointmentCalendar.js";
import CallLogViewer from "./components/CallLogViewer.js";
import CallSimulator from "./components/CallSimulator.js";
import ConfigPanel from "./components/ConfigPanel.js";
import LandingPage from "./components/LandingPage.js";

import { Service, FAQ, Business, Appointment, CallLog, Lead, DashboardStats as StatsType } from "./types.js";

type RouteState = "landing" | "login" | "register" | "onboarding" | "portal";
type TabState = "dashboard" | "calendar" | "logs" | "analytics" | "settings";

export default function App() {
  const [route, setRoute] = useState<RouteState>("landing");
  const [activeTab, setActiveTab] = useState<TabState>("dashboard");
  const [userEmail, setUserEmail] = useState<string>("dhanushdharma11@gmail.com");

  // Authentication Fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [signupBizName, setSignupBizName] = useState("");

  // Business / Operations State
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);
  const [whatsappCount, setWhatsappCount] = useState(2);
  const [stats, setStats] = useState<StatsType>({
    callsReceived: 0,
    callsAnswered: 0,
    appointmentsBooked: 0,
    leadsCaptured: 0,
    missedCallsPrevented: 0
  });

  // Loading States
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // -------------------------------------------------------------

  const fetchAllData = async () => {
    try {
      const [resBiz, resSrv, resFaq, resApt, resLds, resLogs, resStats, resWA] = await Promise.all([
        fetch("/api/business").then(r => r.json()),
        fetch("/api/services").then(r => r.json()),
        fetch("/api/faqs").then(r => r.json()),
        fetch("/api/appointments").then(r => r.json()),
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/call-logs").then(r => r.json()),
        fetch("/api/dashboard/stats").then(r => r.json()),
        fetch("/api/whatsapp").then(r => r.json())
      ]);

      setBusiness(resBiz);
      setServices(resSrv);
      setFaqs(resFaq);
      setAppointments(resApt);
      setLeads(resLds);
      setCallLogs(resLogs);
      setStats(resStats);
      setWhatsappLogs(resWA);
      setWhatsappCount(resWA.length);
    } catch (err) {
      console.error("Error standardizing loaded states:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // -------------------------------------------------------------
  // OPERATIONS ACTIONS (REST CALLS)
  // -------------------------------------------------------------

  const handleUpdateBusiness = async (updated: Partial<Business>) => {
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setBusiness(data.business);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async (name: string, price: number, duration: number, description: string) => {
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, duration, description })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFaq = async (question: string, answer: string) => {
    try {
      await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAppointment = async (apt: Partial<Appointment>) => {
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apt)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'booked' | 'rescheduled' | 'cancelled') => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReschedule = async (id: string, date: string, time: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, status: 'rescheduled' })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // AUTHS & ONBOARDING ACTIONS
  // -------------------------------------------------------------

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setUserEmail(authEmail);
    
    // Check if business is onboarded
    if (business && business.onboardingCompleted) {
      setRoute("portal");
    } else {
      setRoute("onboarding");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !signupBizName) return;
    setUserEmail(authEmail);
    handleUpdateBusiness({ name: signupBizName, onboardingCompleted: false });
    setRoute("onboarding");
  };

  const handleCompleteOnboarding = () => {
    handleUpdateBusiness({ onboardingCompleted: true });
    setRoute("portal");
  };

  // Onboarding local state variables
  const [onbStep, setOnbStep] = useState(1);
  const [onbIndustry, setOnbIndustry] = useState("Healthcare & Dental");
  const [onbGreeting, setOnbGreeting] = useState("Hi, thank you for dialing in! This is Spark. How can I assist you?");

  // -------------------------------------------------------------
  // RENDER INTERFACE SELECTORS
  // -------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 text-center">
        <div className="space-y-3">
          <Bot size={36} className="text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm text-zinc-400 font-mono tracking-tight font-bold">STARTING AGENTONE SYSTEM SERVICES...</p>
        </div>
      </div>
    );
  }

  // 1. Landing Screen Route
  if (route === "landing") {
    return <LandingPage onStartAuth={(mode) => setRoute(mode)} />;
  }

  // 2. Authentication Login/Register Screens
  if (route === "login" || route === "register") {
    const isLogin = route === "login";
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 select-text whitespace-normal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.05),transparent_40%)] pointer-events-none" />
        
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl relative">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 justify-center mb-6">
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20 shrink-0">
              <Bot size={20} />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-white">AgentOne</span>
          </div>

          <div className="text-center mb-6 space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isLogin ? "Welcome back" : "Create business workspace"}
            </h2>
            <p className="text-xs text-zinc-500">
              {isLogin ? "Sign in to manage your AI call receptionist." : "Launch your virtual employee line in 2 minutes."}
            </p>
          </div>

          <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3.5 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@myclinic.com"
                  className="w-full bg-zinc-90 w bg-zinc-900 px-9 py-3 rounded-lg text-xs text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1 font-sans">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Business Brand Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3.5 text-zinc-600" />
                  <input
                    type="text"
                    required
                    value={signupBizName}
                    onChange={(e) => setSignupBizName(e.target.value)}
                    placeholder="Om Dental Clinic"
                    className="w-full bg-zinc-900 px-9 py-3 rounded-lg text-xs text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Secure Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3.5 text-zinc-600" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 px-9 py-3 rounded-lg text-xs text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors cursor-pointer mt-4"
            >
              {isLogin ? "Access Workspace" : "Provision Setup Space"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setRoute(isLogin ? "register" : "login");
                setAuthEmail("");
                setAuthPassword("");
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors decoration-dashed decoration-zinc-700 cursor-pointer"
            >
              {isLogin ? "No account? Provision a new clinic workspace" : "Already registered? Log in with password"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Business Onboarding Flow Screen
  if (route === "onboarding") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative select-text whitespace-normal overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.06),transparent_40%)] pointer-events-none" />
        
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl relative space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-zinc-500">Business Setup Onboarding</span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 font-mono">Step {onbStep} of 3</span>
          </div>

          {/* STEP 1: Industry setup */}
          {onbStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Tell us about your industry</h3>
                <p className="text-xs text-zinc-500 mt-1">This helps Spark customize speaking styles and clinical dentistry presets.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setOnbIndustry("Healthcare & Dental")}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    onbIndustry === "Healthcare & Dental" 
                      ? "bg-zinc-900 border-emerald-500/50 text-white" 
                      : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-850"
                  }`}
                >
                  <div>
                    <p className="font-bold">Healthcare & Dental</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Teeth cleaning, fillings, general dentist clinic setup</p>
                  </div>
                  {onbIndustry === "Healthcare & Dental" && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                </button>

                <button
                  onClick={() => setOnbIndustry("Saloons, Spas & Wellness")}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    onbIndustry === "Saloons, Spas & Wellness" 
                      ? "bg-zinc-900 border-emerald-500/50 text-white" 
                      : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-850"
                  }`}
                >
                  <div>
                    <p className="font-bold">Saloons, Spas & Wellness</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Haircuts, massages, skincare consult bookings</p>
                  </div>
                  {onbIndustry === "Saloons, Spas & Wellness" && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                </button>
              </div>

              <button
                onClick={() => setOnbStep(2)}
                className="w-full flex items-center justify-center gap-1 py-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer mt-4"
              >
                Continue Setup <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* STEP 2: Configure welcoming greeting */}
          {onbStep === 2 && (
            <div className="space-y-4 font-sans">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Define Spokesperson Welcome</h3>
                <p className="text-xs text-zinc-500 mt-1">This is the exact spoken greeting Spark will verbalize when picking up incoming dials.</p>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Incoming Call Spoken Greeting</label>
                <textarea
                  rows={4}
                  value={onbGreeting}
                  onChange={(e) => setOnbGreeting(e.target.value)}
                  className="w-full bg-zinc-900 text-xs p-3 rounded-xl text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setOnbStep(1)}
                  className="w-1/3 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setOnbStep(3)}
                  className="w-2/3 flex items-center justify-center gap-1 py-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm active status */}
          {onbStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-1.5 py-6">
                <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Spark Receptionist Ready!</h3>
                <p className="text-[11px] text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  We compiled your profile and activated direct AI-guided appointment matching bindings.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-500 font-mono">
                <p>• Assigned Twilio Line: +91 98765 43210</p>
                <p>• Linked Database Schemas: Active</p>
                <p>• SLA Guarantee: 24/7/365 Answering</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setOnbStep(2)}
                  className="w-1/3 py-3 bg-zinc-900 hover:bg-zinc-850 text-emerald-450 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    handleUpdateBusiness({
                      industry: onbIndustry,
                      greeting: onbGreeting,
                      onboardingCompleted: true
                    });
                    setRoute("portal");
                  }}
                  className="w-2/3 flex items-center justify-center gap-1.5 py-3 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Launch AI Dashboard <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // 4. Authenticated Portal Hub Layout Router
  return (
    <div id="portal-root" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row select-text whitespace-normal font-sans">
      
      {/* LEFT SIDEBAR navigation */}
      <Sidebar
        currentTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab as TabState)}
        onLogout={() => {
          setRoute("landing");
          setAuthEmail("");
          setAuthPassword("");
        }}
        businessName={business?.name || "My Business"}
      />

      {/* RIGHT SIDE Panel Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950">
        
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/40 px-6 md:px-8 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 capitalize tracking-tight">{activeTab} panel</h2>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="text-xs text-zinc-500 hidden sm:inline-block font-mono">Connected: {userEmail}</span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-300 font-bold shrink-0">
              U
            </div>
          </div>
        </header>

        {/* Dashboard Main Scrollable workspace */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Overview Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <DashboardStats
                stats={stats}
                leads={leads}
                appointments={appointments}
                whatsappCount={whatsappCount}
                whatsappLogs={whatsappLogs}
                onNavigateToCalendar={() => setActiveTab("calendar")}
                onNavigateToLogs={() => setActiveTab("logs")}
              />
              
              {/* Simulator is coupled with Overview dashboard for extremely seamless testing */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Active AI Test Environment</h3>
                  <p className="text-xs text-zinc-500 mt-1">Dial the virtual line in real time to simulate phone bookings immediately.</p>
                </div>
                <CallSimulator
                  services={services}
                  faqs={faqs}
                  onRefreshData={fetchAllData}
                  businessName={business?.name || "Om Dental Clinic"}
                  whatsappLogs={whatsappLogs}
                />
              </div>
            </div>
          )}

          {/* Calendar Management Tab */}
          {activeTab === "calendar" && (
            <AppointmentCalendar
              appointments={appointments}
              services={services}
              onAddAppointment={handleAddAppointment}
              onUpdateStatus={handleUpdateStatus}
              onReschedule={handleReschedule}
            />
          )}

          {/* Logs & Transcripts Tab */}
          {activeTab === "logs" && (
            <CallLogViewer callLogs={callLogs} />
          )}

          {/* Analytics Analytics / Outcome metrics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">AI Pick-up Rate</span>
                  <div className="text-2xl font-bold font-sans text-white mt-1.5 flex items-baseline gap-1">
                    100% 
                    <span className="text-[11px] font-mono text-emerald-400 font-normal">+0.0% vs yesterday</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">Appointment Conversion</span>
                  <div className="text-2xl font-bold font-sans text-white mt-1.5 flex items-baseline gap-1">
                    48.5%
                    <span className="text-[11px] font-mono text-emerald-400 font-normal">+5.3%</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">Average Call Duration</span>
                  <div className="text-2xl font-bold font-sans text-white mt-1.5 flex items-baseline gap-1">
                    1m 45s
                    <span className="text-[11px] font-mono text-zinc-500 font-normal">-12s</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">Twilio Trunk SLA</span>
                  <div className="text-2xl font-bold font-sans text-white mt-1.5 flex items-baseline gap-1">
                    99.98%
                    <span className="text-[11px] font-mono text-emerald-400 font-normal">Active</span>
                  </div>
                </div>
              </div>

              {/* Graphical Chart mockup using styled Divs representing outcome partitions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Outbound conversion rates */}
                <div className="lg:col-span-8 bg-zinc-950 rounded-xl border border-zinc-900 p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-emerald-400" />
                      Weekly Incoming Call Analytics
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Comparing total incoming dials answered by Spark vs outcomes achieved over 7 days.</p>
                  </div>

                  {/* Visual blocks */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-zinc-400">📅 Appointment Conversions (Booked)</span>
                        <span className="text-zinc-250">62%</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-900 rounded-lg overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-lg" style={{ width: "62%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-zinc-400">🔥 Inquired Queries (Lead Capture)</span>
                        <span className="text-zinc-250">24%</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-900 rounded-lg overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-lg" style={{ width: "24%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-zinc-400">💬 General FAQ answers provided</span>
                        <span className="text-zinc-250">12%</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-900 rounded-lg overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-lg" style={{ width: "12%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-zinc-400">❌ Unresolved inquiry transfers</span>
                        <span className="text-zinc-250">2%</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-900 rounded-lg overflow-hidden">
                        <div className="bg-zinc-700 h-full rounded-lg" style={{ width: "2%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return rate details */}
                <div className="lg:col-span-4 bg-zinc-950 rounded-xl border border-zinc-900 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white tracking-tight">Active Analytics insights</h4>
                    
                    <div className="space-y-3.5 pt-1 whitespace-normal">
                      <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 text-xs">
                        <span className="font-bold text-zinc-200 block">Peak Hours</span>
                        <p className="text-zinc-400 mt-1 leading-normal">
                          Peak incoming ring activity happens Monday mornings (09:00 - 11:30 AM). Spark answers multiple parallel lines flawlessly during these times.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 text-xs">
                        <span className="font-bold text-zinc-200 block">SLA Protection</span>
                        <p className="text-zinc-400 mt-1 leading-normal">
                          By resolving FAQ details immediately pre-call, average support ticket time decreases by up to 2.5 minutes!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>Last analyzed 1 hour ago</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      Live synch <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* AI Settings Config Panel */}
          {activeTab === "settings" && (
            <ConfigPanel
              business={business!}
              services={services}
              faqs={faqs}
              onSaveBusiness={handleUpdateBusiness}
              onAddService={handleAddService}
              onDeleteService={handleDeleteService}
              onAddFaq={handleAddFaq}
              onDeleteFaq={handleDeleteFaq}
            />
          )}

        </div>
      </main>
    </div>
  );
}
