import React, { useState } from "react";
import { 
  Bot, 
  Settings, 
  BookOpen, 
  Scissors, 
  PhoneCall, 
  MessageSquare, 
  Save, 
  Trash2, 
  Plus, 
  Check, 
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders
} from "lucide-react";
import { Service, FAQ, Business } from "../types";

interface ConfigPanelProps {
  business: Business;
  services: Service[];
  faqs: FAQ[];
  onSaveBusiness: (updated: Partial<Business>) => void;
  onAddService: (name: string, price: number, duration: number, description: string) => void;
  onDeleteService: (id: string) => void;
  onAddFaq: (question: string, answer: string) => void;
  onDeleteFaq: (id: string) => void;
}

export default function ConfigPanel({
  business,
  services,
  faqs,
  onSaveBusiness,
  onAddService,
  onDeleteService,
  onAddFaq,
  onDeleteFaq
}: ConfigPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ai" | "faqs" | "services" | "twilio">("ai");

  // Profile states
  const [name, setName] = useState(business.name);
  const [customPrompt, setCustomPrompt] = useState(business.customPrompt);
  const [voiceId, setVoiceId] = useState(business.voiceId);
  const [language, setLanguage] = useState(business.language);
  const [greeting, setGreeting] = useState(business.greeting);
  const [duration, setDuration] = useState(business.appointmentDuration);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // FAQ input states
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Service input states
  const [newSName, setNewSName] = useState("");
  const [newSPrice, setNewSPrice] = useState(1500);
  const [newSDuration, setNewSDuration] = useState(45);
  const [newSDesc, setNewSDesc] = useState("");

  // Twilio integration state
  const [twilioNumber, setTwilioNumber] = useState(business.twilioNumber);
  const [twilioAccountSid, setTwilioAccountSid] = useState(business.twilioAccountSid || "");
  const [twilioAuthToken, setTwilioAuthToken] = useState(business.twilioAuthToken || "");
  const [twilioWhatsAppNumber, setTwilioWhatsAppNumber] = useState(business.twilioWhatsAppNumber || "");
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState(business.twilioPhoneNumber || "");

  const handleSaveProfile = () => {
    onSaveBusiness({
      name,
      customPrompt,
      voiceId,
      language,
      greeting,
      appointmentDuration: Number(duration),
      twilioNumber,
      twilioAccountSid,
      twilioAuthToken,
      twilioWhatsAppNumber,
      twilioPhoneNumber
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    onAddFaq(newQuestion, newAnswer);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName) return;
    onAddService(newSName, newSPrice, newSDuration, newSDesc);
    setNewSName("");
    setNewSDesc("");
  };

  return (
    <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Sub tabs list left side rail */}
      <div className="md:w-56 border-r border-zinc-900 bg-zinc-950 p-4 space-y-1.5 shrink-0">
        <button
          onClick={() => setActiveSubTab("ai")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
            activeSubTab === "ai" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-900/30 text-zinc-400"
          }`}
        >
          <Bot size={14} /> AI Voice & Persona
        </button>
        
        <button
          onClick={() => setActiveSubTab("faqs")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
            activeSubTab === "faqs" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-900/30 text-zinc-400"
          }`}
        >
          <BookOpen size={14} /> FAQ Knowledge Base
        </button>

        <button
          onClick={() => setActiveSubTab("services")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
            activeSubTab === "services" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-900/30 text-zinc-400"
          }`}
        >
          <Sliders size={14} /> Services Directory
        </button>

        <button
          onClick={() => setActiveSubTab("twilio")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
            activeSubTab === "twilio" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-900/30 text-zinc-400"
          }`}
        >
          <PhoneCall size={14} /> Twilio & WhatsApp Setup
        </button>
      </div>

      {/* Main configuration settings box */}
      <div className="flex-1 p-6 md:p-8">
        
        {/* SUBTAB 1: AI Prompt instructions */}
        {activeSubTab === "ai" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                AI Agent Voice Persona Config
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Configure how your receptionist greets, answers, and matches scheduling rules.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Business Brand Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Base Booking Interval (Mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Spoken Inbound Greeting template</label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">AI Receptionist Gender Accent (Voice Model)</label>
                  <select
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="shimmer">Shimmer - Warm Female Accent</option>
                    <option value="alloy">Alloy - Neutral Conversational Voice</option>
                    <option value="onyx">Onyx - Crisp Professional Male</option>
                    <option value="fable">Fable - Energetic Modern Accent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Conversational Primary Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="english">English (Indian Accent / Standard)</option>
                    <option value="spanish">Spanish (Latin America)</option>
                    <option value="french">French (Standard)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Custom System AI Prompt Guide Instructions</label>
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g. Be incredibly friendly. Never offer wisdom diagnostic answers, always suggest scheduling an clinical dental cleaning."
                  className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  id="btn-save-receptionist-config"
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Save size={14} /> Commit Changes
                </button>
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <Check size={14} /> Receptionist profile updated!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: FAQs setup */}
        {activeSubTab === "faqs" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                FAQ Knowledge Database
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Provide custom FAQ details so Spark can answer common questions synchronously during voice calls.</p>
            </div>

            {/* List current faqs */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {faqs.map((f) => (
                <div key={f.id} className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-900 flex items-start justify-between gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <p className="text-xs font-bold text-zinc-200 truncate">{f.question}</p>
                    <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2 pr-2">{f.answer}</p>
                  </div>
                  <button
                    onClick={() => onDeleteFaq(f.id)}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 shrink-0 transition-colors cursor-pointer"
                  >
                    <Trash2 id={`delete-faq-${f.id}`} size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Create FAQ Form */}
            <form onSubmit={handleCreateFaq} className="pt-4 border-t border-zinc-900 space-y-3.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Add New Knowledge Article</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 font-mono">Question / Inquiry Title</label>
                <input
                  type="text"
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Do you accept walk-ins?"
                  className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 font-mono">Intelligent Spoken Answer</label>
                <textarea
                  rows={2}
                  required
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Yes, we support walk-in services based on doctor availability, however we recommend scheduling."
                  className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="btn-add-faq"
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} /> Include FAQ Article
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 3: Services panel */}
        {activeSubTab === "services" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                Dental Clinic Services Directory
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Configure service names, durations, and pricing. These values are used to guide Gemini booking operations.</p>
            </div>

            {/* List services */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {services.map((s) => (
                <div key={s.id} className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-900 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-250">{s.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">₹{s.price}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate max-w-sm">{s.description || "No description provided."}</p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock size={11} /> {s.duration} minutes slot size
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteService(s.id)}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 shrink-0 transition-colors cursor-pointer"
                  >
                    <Trash2 id={`delete-service-${s.id}`} size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Create Service Form */}
            <form onSubmit={handleCreateService} className="pt-4 border-t border-zinc-900 space-y-3.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Create Clinic Treatment Offering</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 font-mono">Service Name</label>
                <input
                  type="text"
                  required
                  value={newSName}
                  onChange={(e) => setNewSName(e.target.value)}
                  placeholder="Porcelain Veneers"
                  className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 font-mono">Treatment Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newSPrice}
                    onChange={(e) => setNewSPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 font-mono">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={newSDuration}
                    onChange={(e) => setNewSDuration(Number(e.target.value))}
                    className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 font-mono">Short Description</label>
                <input
                  type="text"
                  value={newSDesc}
                  onChange={(e) => setNewSDesc(e.target.value)}
                  placeholder="Custom veneer placement and cosmetic dental styling."
                  className="w-full bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="btn-add-service"
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} /> Include Treatment Service
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 4: Twilio Setup */}
        {activeSubTab === "twilio" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                Twilio Telecom & WhatsApp Integration
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Bind your real Twilio API credentials to trigger real outbound telephone responses and dynamic WhatsApp SMS confirmations instantly.</p>
            </div>

            <div className="p-4 rounded-xl bg-orange-600/15 border border-orange-500/20 space-y-1.5 whitespace-normal">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <HelpCircle size={14} /> Live Custom Telecom Webhooks Active
              </span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                By inserting credentials below, your live clinic reception is fully operational. Any incoming call on your configured phone line will ring directly to your tailored Indian English Voice Agent!
              </p>
            </div>

            <div className="space-y-4">
              {/* Credentials Section */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-3.5 whitespace-normal">
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 font-mono">
                  <Sliders size={13} className="text-emerald-400" />
                  API KEY CREDENTIALS & SENDER ENTITIES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Twilio Account SID</label>
                    <input
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      className="w-full bg-zinc-950 text-xs p-2.5 rounded border border-zinc-850 focus:outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Twilio Auth Token</label>
                    <input
                      type="password"
                      placeholder="Your Twilio Authentication Token"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      className="w-full bg-zinc-950 text-xs p-2.5 rounded border border-zinc-850 focus:outline-none focus:border-emerald-500 text-zinc-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">WhatsApp Sender (From)</label>
                    <input
                      type="text"
                      placeholder="whatsapp:+14155238886 (SANDBOX DEFAULTS)"
                      value={twilioWhatsAppNumber}
                      onChange={(e) => setTwilioWhatsAppNumber(e.target.value)}
                      className="w-full bg-zinc-950 text-xs p-2.5 rounded border border-zinc-850 focus:outline-none focus:border-emerald-500 text-zinc-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Twilio SMS Phone line</label>
                    <input
                      type="text"
                      placeholder="e.g. +15550199221"
                      value={twilioPhoneNumber}
                      onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                      className="w-full bg-zinc-950 text-xs p-2.5 rounded border border-zinc-850 focus:outline-none focus:border-emerald-500 text-zinc-300"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                  * Note: When using the Twilio Sandbox for WhatsApp, make sure your recipients opt-in first (e.g., sending <strong>join sandbox-keyword</strong> to your sandbox number) before attempting live triggers!
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Assigned Clinic Hotline Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={twilioNumber}
                    onChange={(e) => setTwilioNumber(e.target.value)}
                    placeholder="e.g. +91 98765 01234"
                    className="flex-1 bg-zinc-900 text-xs p-2.5 rounded-lg text-zinc-200 border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="px-3.5 py-2 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                    CONNECTED
                  </div>
                </div>
              </div>

              {/* Console instructions guide */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-2.5 whitespace-normal text-left">
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                  <HelpCircle size={14} className="text-cyan-400" />
                  Hook Up Incoming Calls to Live Assistant
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  To answer calls and talk to them live, copy your webhook link below and paste it into the <strong>"Webhook"</strong> option of your Twilio console's active phone number configurations under the <strong>"A Call Comes In"</strong> section:
                </p>
                <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850 flex items-center justify-between gap-2 overflow-hidden">
                  <code className="text-emerald-400 text-[10px] select-all font-mono truncate max-w-full">
                    {window.location.origin === "null" || !window.location.origin 
                      ? "https://your-preview-url-or-host/api/twilio/voice" 
                      : `${window.location.origin}/api/twilio/voice`}
                  </code>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Ensure the HTTP request method is configured as <strong>HTTP POST</strong> in the select menu on Twilio.
                </p>
              </div>

              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-3 whitespace-normal">
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-emerald-400" />
                  SMS & WhatsApp Booking Confirmations
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Send dynamic reminders after a call. Use tags like <code className="text-emerald-400">{"{{caller}}"}</code>, <code className="text-emerald-400">{"{{service}}"}</code>, and <code className="text-emerald-400">{"{{time}}"}</code> to customize the template.
                </p>
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-850 text-[11px] font-mono text-zinc-500">
                  <span className="text-zinc-400">"Hi {"{{caller}}"}, your appointment at {name || "Om Dental Clinic"} is confirmed on {"{{date}}"} at {"{{time}}"}."</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  id="btn-save-twilio-setup"
                  onClick={handleSaveProfile}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Save size={14} /> Update Telecom Bindings
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
