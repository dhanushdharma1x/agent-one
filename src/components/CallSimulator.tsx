import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  PhoneIncoming, 
  PhoneOff, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  CalendarCheck,
  UserPlus, 
  MessageSquare,
  RefreshCw,
  Volume2,
  VolumeX,
  Phone,
  Smartphone,
  CheckCheck
} from "lucide-react";
import { Service, FAQ, Appointment } from "../types";

interface CallSimulatorProps {
  services: Service[];
  faqs: FAQ[];
  onRefreshData: () => void;
  businessName: string;
  whatsappLogs?: any[];
}

export default function CallSimulator({ services, faqs, onRefreshData, businessName, whatsappLogs = [] }: CallSimulatorProps) {
  const [isActive, setIsActive] = useState(false);
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<{ role: "receptionist" | "caller", text: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("grace");

  const bottomRef = useRef<HTMLDivElement>(null);
  const whatsappBottomRef = useRef<HTMLDivElement>(null);

  const presets = {
    grace: {
      name: "Ananya Iyer",
      phone: "+91 87654 32109",
      intro: "Hi, my name is Ananya Iyer (phone: +91 87654 32109) and I'd like to book a Routine Teeth Cleaning (srv-1) for Tuesday, June 16th at 2:00 PM please."
    },
    alex: {
      name: "Dr. Amit Verma",
      phone: "+91 76543 21098",
      intro: "Namaste, I was hoping to check if you accept digital UPI payments (like GPay, PhonePe, Paytm), and where exactly your HSR Layout branch is located?"
    },
    marcus: {
      name: "Ramesh Kumar",
      phone: "+91 98765 43210",
      intro: "Hello, my name is Ramesh Kumar (phone: +91 98765 43210). I'm calling about setting up a custom callback to discuss composite fillings or root canal treatment fees."
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    whatsappBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [whatsappLogs, callState]);

  // Pre-load synthesis voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = (text: string) => {
    if (isMuted) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Remove system diagnostics message parts before speaking
      const cleanText = text.replace(/\[SYSTEM WORKFLOW.*?\]/gi, "").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      // Look for custom professional english voice accents
      const voice = voices.find(v => v.lang.includes("en-IN")) || 
                    voices.find(v => v.lang.includes("en-GB")) || 
                    voices.find(v => v.lang.includes("en-US")) || 
                    voices.find(v => v.lang.startsWith("en"));
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRinging = () => {
    setCallState("ringing");
  };

  const answerCall = () => {
    setCallState("connected");
    setIsActive(true);
    const greetingMsg = `Hello, this is from ${businessName || "Om Dental Clinic"}. How can I help you today?`;
    setMessages([
      { 
        role: "receptionist", 
        text: greetingMsg
      }
    ]);
    // Speak immediately upon picking up!
    setTimeout(() => {
      speakText(greetingMsg);
    }, 200);
  };

  const declineCall = () => {
    setCallState("idle");
    setIsActive(false);
  };

  const endCall = () => {
    setIsActive(false);
    setCallState("idle");
    setMessages([]);
    setUserInput("");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onRefreshData(); // refresh parent dashboard stats
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim() || loading) return;

    if (!customText) setUserInput("");

    // Append caller's message
    const updatedMessages = [...messages, { role: "caller" as const, text: textToSend }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/simulator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages.slice(1, -1) // pass recent chat history
        })
      });

      const data = await response.json();
      
      // Check if action was triggered
      if (data.action) {
        // Appends a diagnostic system message
        setMessages(prev => [
          ...prev, 
          { role: "receptionist", text: data.text },
          { 
            role: "receptionist", 
            text: `[SYSTEM WORKFLOW ACTIVATED] Service parsed action: "${data.action.details}". Synchronizing calendar nodes and dispatching real-time WhatsApp confirmation...` 
          }
        ]);
        speakText(data.text);
        onRefreshData(); // triggers parents stats reload
      } else {
        setMessages(prev => [...prev, { role: "receptionist", text: data.text }]);
        speakText(data.text);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { role: "receptionist", text: "I apologize, but we seem to have a slight connection issue. Could you repeat that?" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter WhatsApp messages for the currently selected scenario phone number
  const activeScenarioPreset = presets[selectedScenario as keyof typeof presets];
  const activeScenarioPhone = activeScenarioPreset?.phone || "";
  const filteredWhatsAppLogs = whatsappLogs.filter((log: any) => {
    const cleanLogNum = log.recipient.replace(/[\s\(\)\-\+]/g, "");
    const cleanPresetNum = activeScenarioPhone.replace(/[\s\(\)\-\+]/g, "");
    return cleanLogNum.includes(cleanPresetNum) || cleanPresetNum.includes(cleanLogNum);
  });

  return (
    <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden flex flex-col md:flex-row h-[580px]">
      {/* LEFT PANEL: Scenario presets & settings */}
      <div className="md:w-72 border-r border-zinc-900 p-5 bg-zinc-950 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={15} className="text-emerald-400" />
              Practice Simulator
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-normal">
              Simulate customer callback, automated booking scenarios, and immediate answers.
            </p>
          </div>

          {(callState === "idle") && (
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Select Caller Preset</label>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedScenario("grace")}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedScenario === "grace" 
                      ? "bg-zinc-900 border-emerald-500/50 text-white" 
                      : "bg-zinc-900/30 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <p className="font-semibold">{presets.grace.name} (High Intent)</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 whitespace-normal leading-normal">wants routine teeth cleaning booking</p>
                </button>

                <button
                  onClick={() => setSelectedScenario("alex")}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedScenario === "alex" 
                      ? "bg-zinc-900 border-emerald-500/50 text-white" 
                      : "bg-zinc-900/30 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <p className="font-semibold">{presets.alex.name} (FAQ Inquiry)</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 whitespace-normal leading-normal">asks about UPI & clinic HSR branch location</p>
                </button>

                <button
                  onClick={() => setSelectedScenario("marcus")}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedScenario === "marcus" 
                      ? "bg-zinc-900 border-emerald-500/50 text-white" 
                      : "bg-zinc-900/30 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <p className="font-semibold">{presets.marcus.name} (New Lead)</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 whitespace-normal leading-normal">requires composite fillings callback</p>
                </button>
              </div>
            </div>
          )}

          {callState === "connected" && (
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">Simulator Devices</span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Speech synthesis:</span>
                  <button 
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (!isMuted && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className="p-1 px-2 hover:bg-zinc-800 rounded flex items-center gap-1.5 text-[10px] font-mono text-emerald-400"
                  >
                    {!isMuted ? <Volume2 size={12} /> : <VolumeX size={12} className="text-zinc-500" />}
                    {!isMuted ? "Speaking" : "Muted"}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Toggle voice engine. Unmuted voices read the virtual receptionist's words dynamically out loud!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trigger / Status Button */}
        <div>
          {callState === "idle" ? (
            <button
              onClick={startRinging}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer hover:bg-emerald-400 shadow-lg shadow-emerald-500/10"
            >
              <PhoneIncoming size={14} className="animate-bounce" /> Start Incoming Call Line
            </button>
          ) : callState === "ringing" ? (
            <div className="space-y-2">
              <button
                onClick={answerCall}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer hover:bg-emerald-400"
              >
                <Phone size={14} /> Accept & Pick Up
              </button>
              <button
                onClick={declineCall}
                className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold rounded-lg transition-all hover:text-white"
              >
                Decline Phone Call
              </button>
            </div>
          ) : (
            <button
              onClick={endCall}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer hover:bg-red-400 shadow-lg shadow-red-500/10"
            >
              <PhoneOff size={14} /> Disconnect / Hang Up
            </button>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Live simulation block split */}
      <div className="flex-1 flex flex-col bg-zinc-950/20 justify-between h-full overflow-hidden">
        {callState === "connected" ? (
          <div className="flex-1 flex flex-col lg:flex-row h-full divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
            {/* Live call banner & chat interface */}
            <div className="flex-1 flex flex-col justify-between h-full min-w-0">
              {/* Call active bar */}
              <div className="p-3 bg-emerald-500/10 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Om Dental Clinic Virtual Line LIVE</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <span>HD Stream</span>
                </div>
              </div>

              {/* Chat threads messages scroll */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((m, idx) => {
                  const isRep = m.role === "receptionist";
                  const isSys = m.text.includes("[SYSTEM WORKFLOW");
                  
                  if (isSys) {
                    return (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-mono text-emerald-400 leading-normal whitespace-normal">
                        {m.text}
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex flex-col ${isRep ? "items-start" : "items-end"}`}>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono mb-1">
                        {isRep ? "Spark AI Agent" : "Phone Caller"}
                      </span>
                      <div className={`max-w-[85%] px-3.5 py-2 rounded-xl text-xs whitespace-normal leading-relaxed ${
                        isRep 
                          ? "bg-zinc-900 border border-zinc-850 text-zinc-200" 
                          : "bg-emerald-500 text-zinc-950 font-medium"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono font-bold">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Spark is speaking...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Presets talking helpers & raw input boxes */}
              <div className="p-4 border-t border-zinc-900 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold font-mono tracking-wider shrink-0 mr-1">Preset speech:</span>
                  <button
                    onClick={() => handleSend(activeScenarioPreset?.intro)}
                    className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 font-mono text-[9px] shrink-0 cursor-pointer"
                  >
                    "Introduce scenario"
                  </button>
                  <button
                    onClick={() => handleSend("Do you accept digital payments or UPI?")}
                    className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 font-mono text-[9px] shrink-0 cursor-pointer"
                  >
                    "Ask about payment"
                  </button>
                  <button
                    onClick={() => handleSend("Thank you, that is everything. Bye!")}
                    className="px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 font-mono text-[9px] shrink-0 cursor-pointer"
                  >
                    "Hang up / Say goodbye"
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type anything to respond to Spark (receptionist)..."
                    className="flex-1 bg-zinc-900 border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleSend()}
                    className="p-2.5 bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-colors shrink-0 cursor-pointer text-xs"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live User Smartphone with WhatsApp feed */}
            <div className="lg:w-72 shrink-0 bg-zinc-950 flex flex-col justify-between h-full">
              {/* Phone Status bar */}
              <div className="p-3 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 font-mono flex items-center gap-1">
                  <Smartphone size={12} className="text-zinc-500" /> Caller's Phone
                </span>
                <span className="text-[9px] font-mono text-zinc-500">Live WhatsApp Sim</span>
              </div>

              {/* WhatsApp Interface Mockup */}
              <div className="flex-1 flex flex-col bg-zinc-900/20 text-zinc-100 overflow-hidden">
                {/* Simulated WhatsApp Header */}
                <div className="bg-[#0b141a] px-3 py-2.5 border-b border-zinc-850 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold leading-none select-none">
                    O
                  </div>
                  <div>
                    <h5 className="text-[11px] font-semibold text-zinc-200 tracking-tight">{businessName || "Om Dental Clinic"}</h5>
                    <p className="text-[9px] text-[#00a884] font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-[#00a884] inline-block animate-pulse" />
                      Online • Business Account
                    </p>
                  </div>
                </div>

                {/* WhatsApp Messages Content */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col bg-[#0b141a]">
                  <div className="self-center bg-[#182229] text-[9px] text-zinc-400 px-2 py-0.5 rounded shadow">
                    TODAY
                  </div>
                  <p className="self-center text-[8px] text-zinc-500 text-center font-serif py-1 leading-relaxed max-w-[90%]">
                    🔒 Messages and calls are simulated end-to-end. This device represents the caller's physical mobile screen.
                  </p>

                  {filteredWhatsAppLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-[10px] text-zinc-600 italic">No WhatsApp alerts received yet.</p>
                      <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed max-w-[150px]">
                        Trigger appointment bookings during the call to receive raw confirmations.
                      </p>
                    </div>
                  ) : (
                    // Display existing logs for caller
                    [...filteredWhatsAppLogs].reverse().map((log: any, idx) => (
                      <div key={log.id || idx} className="self-start max-w-[90%] bg-[#202c33] rounded-lg p-2.5 shadow text-[11px] leading-relaxed relative">
                        <p className="text-zinc-200">{log.message}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[8px] text-zinc-400 font-mono">
                          <span>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <CheckCheck size={11} className="text-[#53bdeb]" />
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={whatsappBottomRef} />
                </div>
              </div>
            </div>
          </div>
        ) : callState === "ringing" ? (
          /* RINGING SCREEN MOCKUP */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
            
            {/* Pulsing rings around bot avatar */}
            <div className="relative mb-6">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 border border-emerald-500/30 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                <Bot size={42} className="animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-lg font-bold text-white tracking-tight">Incoming Virtual Call...</h2>
              <p className="text-xs text-zinc-400 font-mono">{activeScenarioPreset?.phone || "+91 98765 43210"}</p>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                {activeScenarioPreset?.name || "Omni Channel Caller"} is dialing your dental receptionist desk. Select Accept to join line.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={declineCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-red-500/20 cursor-pointer"
                title="Decline Call"
              >
                <PhoneOff size={20} />
              </button>
              <button
                onClick={answerCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-emerald-500/30 cursor-pointer"
                title="Answer Call"
              >
                <Phone size={24} className="animate-bounce" />
              </button>
            </div>
          </div>
        ) : (
          /* IDLE PRE-CALL STATE SCREEN */
          <div className="m-auto text-center flex flex-col items-center justify-center p-8 max-w-xs md:max-w-md whitespace-normal">
            <div className="p-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 scale-110">
              <Bot size={28} />
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight">AI Receptionist Practice Sandbox</h4>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Experience the live automatic AI voice behavior using Gemini-3.5-Flash text and function bindings. Voice simulation reads the dialog aloud upon picking up the phone card line.
            </p>
            <button
              onClick={startRinging}
              className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-500/10"
            >
              Simulate Inbound Call Line
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

