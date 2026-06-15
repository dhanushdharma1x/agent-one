import React, { useState } from "react";
import { 
  Phone, 
  Clock, 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  ChevronRight, 
  FileText, 
  PhoneOutgoing, 
  MessageSquare,
  HelpCircle,
  Sparkles,
  Award
} from "lucide-react";
import { CallLog } from "../types";

interface CallLogViewerProps {
  callLogs: CallLog[];
}

export default function CallLogViewer({ callLogs }: CallLogViewerProps) {
  const [selectedLogId, setSelectedLogId] = useState<string>(callLogs[0]?.id || "");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  
  const selectedLog = callLogs.find(log => log.id === selectedLogId) || callLogs[0];

  const togglePlayback = (id: string) => {
    if (isPlaying === id) {
      setIsPlaying(null);
    } else {
      setIsPlaying(id);
      // Automatically reset simulation audio after 4 seconds
      setTimeout(() => {
        setIsPlaying(current => current === id ? null : current);
      }, 4000);
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "booked":
        return {
          text: "Appointment Booked",
          class: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          icon: Award
        };
      case "lead_captured":
        return {
          text: "Lead Captured",
          class: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
          icon: Sparkles
        };
      case "faq_answered":
        return {
          text: "FAQ Resolved",
          class: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
          icon: HelpCircle
        };
      case "missed_call_prevented":
        return {
          text: "Call Prevented Loss",
          class: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
          icon: PhoneOutgoing
        };
      default:
        return {
          text: "General Inquiry",
          class: "bg-zinc-800 text-zinc-400 border border-zinc-700",
          icon: MessageSquare
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: Call Logs list */}
      <div className="lg:col-span-5 bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden flex flex-col h-[650px]">
        <div className="p-4 border-b border-zinc-900 bg-zinc-950/80 sticky top-0 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">AI Receptionist Call History</h3>
          <span className="text-[10px] text-zinc-500 font-mono text-right">{callLogs.length} interactions logged</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {callLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No recent inbound calls recorded. Try the live practice simulator below to ring the clinic lines!
            </div>
          ) : (
            callLogs.map((log) => {
              const Badge = getOutcomeBadge(log.outcome);
              const BadgeIcon = Badge.icon;
              const isSelected = selectedLogId === log.id;
              return (
                <button
                  id={`log-item-${log.id}`}
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full p-4 text-left flex items-start justify-between gap-3 transition-colors ${
                    isSelected ? "bg-zinc-900/60" : "hover:bg-zinc-900/20"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-100 truncate">{log.callerName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(log.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{log.callerPhone}</p>

                    <div className="flex items-center gap-2.5 mt-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${Badge.class}`}>
                        <BadgeIcon size={10} />
                        {Badge.text}
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock size={11} /> {log.durationSeconds}s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 self-center">
                    <ChevronRight size={16} className={isSelected ? "text-emerald-400" : "text-zinc-600"} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Full Transcript details */}
      <div className="lg:col-span-7 bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden flex flex-col h-[650px]">
        {selectedLog ? (
          <>
            {/* Top row: Caller status and Audio simulated player */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">{selectedLog.callerName}</h4>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1 font-mono">
                  Incoming line resolved • {new Date(selectedLog.dateTime).toLocaleString()}
                </p>
              </div>

              {/* Recording Audio controls simulation */}
              <div className="flex items-center gap-2.5 bg-zinc-900/80 border border-zinc-800 p-2 rounded-lg shrink-0 w-full sm:w-auto justify-between">
                <button
                  onClick={() => togglePlayback(selectedLog.id)}
                  className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  {isPlaying === selectedLog.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>

                <div className="min-w-[100px] flex-1">
                  <p className="text-[10px] font-bold text-zinc-300 font-mono">
                    {isPlaying === selectedLog.id ? "Streaming call..." : "Listen to audio"}
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    {isPlaying === selectedLog.id ? "0:04 / 1:52" : "1:52 duration"}
                  </p>
                </div>

                <Volume2 size={14} className="text-zinc-500" />
              </div>
            </div>

            {/* AI Summary Block */}
            <div className="p-5 bg-zinc-900/10 border-b border-zinc-900">
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 text-xs">
                <h5 className="font-bold text-zinc-200 mb-1.5 flex items-center gap-1.5 font-sans">
                  <FileText size={14} className="text-emerald-400" />
                  AI Receptionist Call Extracted Summary
                </h5>
                <p className="text-zinc-400 leading-relaxed font-sans">{selectedLog.summary}</p>
              </div>
            </div>

            {/* Bubble Transcript stream view */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-950/20">
              {selectedLog.transcript && selectedLog.transcript.length > 0 ? (
                selectedLog.transcript.map((msg, index) => {
                  const isRep = msg.speaker === "receptionist";
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col ${isRep ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] tracking-wide text-zinc-500 uppercase font-bold font-mono">
                        <span>{isRep ? "Spark (AI Agent)" : "Customer Caller"}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div 
                        className={`max-w-[85%] px-4 py-2.5 rounded-xl text-xs leading-relaxed whitespace-normal ${
                          isRep 
                            ? "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-850" 
                            : "bg-emerald-500/10 text-emerald-300 rounded-tr-none border border-emerald-500/10"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-12 text-zinc-500 text-xs">
                  Transcript extraction was omitted for this call outcome.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="m-auto text-center text-zinc-500 text-xs p-8">
            Select a call record to view transcripts, audit logging, and summary insights.
          </div>
        )}
      </div>
    </div>
  );
}
