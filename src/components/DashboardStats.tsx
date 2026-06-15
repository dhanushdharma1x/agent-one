import React from "react";
import { 
  PhoneCall, 
  CheckCircle, 
  CalendarCheck, 
  UserPlus, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { DashboardStats as StatsType, Lead, Appointment } from "../types";

interface DashboardStatsProps {
  stats: StatsType;
  leads: Lead[];
  appointments: Appointment[];
  whatsappCount: number;
  whatsappLogs?: any[];
  onNavigateToCalendar: () => void;
  onNavigateToLogs: () => void;
}

export default function DashboardStats({ 
  stats, 
  leads, 
  appointments, 
  whatsappCount,
  whatsappLogs = [],
  onNavigateToCalendar,
  onNavigateToLogs 
}: DashboardStatsProps) {

  const statCards = [
    {
      id: "stats-received",
      title: "Calls Received",
      value: stats.callsReceived,
      description: "Total incoming customer ring cycles processed",
      icon: PhoneCall,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/10"
    },
    {
      id: "stats-answered",
      title: "Calls Answered",
      value: stats.callsAnswered,
      description: "Successfully resolved and guided immediately by AI",
      icon: CheckCircle,
      color: "text-teal-400",
      bg: "bg-teal-500/10 border-teal-500/10"
    },
    {
      id: "stats-booked",
      title: "Appointments Scheduled",
      value: stats.appointmentsBooked,
      description: "Confirmed appointment dates put into the reservation system",
      icon: CalendarCheck,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/10"
    },
    {
      id: "stats-leads",
      title: "Warm Leads Captured",
      value: stats.leadsCaptured,
      description: "Unplanned client inquiries collected for conversion",
      icon: UserPlus,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/10"
    },
    {
      id: "stats-prevented",
      title: "Missed Calls Prevented",
      value: stats.missedCallsPrevented,
      description: "Potential lost customers captured 24/7 after hours",
      icon: ShieldAlert,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/10"
    }
  ];

  const recentLeads = leads.slice(0, 3);
  const upcomingBookings = appointments
    .filter(a => a.status === 'booked' || a.status === 'rescheduled')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header Splash banner */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[40%] h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <Sparkles size={12} className="animate-pulse" />
            Automatic Customer Answering Active
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight leading-tight">
            How is your AI Receptionist performing today?
          </h2>
          <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
            Spark is picking up after-hours calls, answering complex dental plans & location questions, booking patients directly on your schedule, and capturing contact information details instantly.
          </p>
        </div>
      </div>

      {/* Grid of operational stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              id={stat.id}
              key={stat.id}
              className={`p-5 rounded-xl border bg-zinc-950/20 border-zinc-900 flex flex-col justify-between transition-all hover:border-zinc-800`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <span className="text-xs font-medium text-zinc-400 tracking-tight">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bg} border`}>
                  <Icon size={16} className={stat.color} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold font-sans text-white tracking-tight">{stat.value}</span>
                <p className="mt-1 text-[11px] text-zinc-500 leading-normal">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split overview grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments card */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Active Upcoming Bookings</h3>
              <p className="text-xs text-zinc-500 mt-1">Direct bookings on your calendar verified by AI receptionist</p>
            </div>
            <button 
              onClick={onNavigateToCalendar}
              className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Calendar View <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3.5">
            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-900 rounded-lg">
                No active bookings today. Simulate a call to schedule.
              </div>
            ) : (
              upcomingBookings.map((apt) => (
                <div 
                  key={apt.id} 
                  className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-900/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 truncate">{apt.callerName}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{apt.callerPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-emerald-400 font-mono">
                      {new Date(apt.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{apt.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead panel card */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Recent Captured Leads</h3>
              <p className="text-xs text-zinc-500 mt-1">High-intent customers scheduled for callback follow-up</p>
            </div>
            <button 
              onClick={onNavigateToLogs}
              className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Analyze Call Logs <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-900 rounded-lg">
                No new leads. Practice calls below will instantly fill this.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200 truncate">{lead.name}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] uppercase font-semibold">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-1 truncate">{lead.notes}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-xs font-semibold text-zinc-300 font-mono">{lead.phone}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                      {new Date(lead.createdAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Integration and WhatsApp Logs notification tracker */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              Automated WhatsApp Confirmation Alerts
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Real-time dispatcher logs showcasing messaging confirmations sent to booked callers</p>
          </div>
          <div className="text-xs text-zinc-400 flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg shrink-0">
            <span className="inline-block w-2 bg-emerald-500 h-2 rounded-full animate-ping" />
            <span>{whatsappCount} Dispatcher Logs Processed</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/20 border border-zinc-900 text-xs font-mono leading-relaxed overflow-x-auto max-h-56 overflow-y-auto space-y-3">
          <div className="text-zinc-500 border-b border-zinc-900/85 pb-2 mb-2">
            <p className="text-zinc-400 mb-1">$ agentone message-dispatcher service daemon (v1.0.5)</p>
            <p className="text-zinc-400">[API GATEWAY] Listening on port 3000 callback queue...</p>
          </div>
          <div className="space-y-2">
            {whatsappLogs && whatsappLogs.length > 0 ? (
              whatsappLogs.map((log: any) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-2.5 rounded-md bg-zinc-950/40 border border-zinc-900/50">
                  <div className="space-y-1">
                    <p className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                      [DISPATCH] Client: {log.recipient} &bull; Status: {log.status === 'delivered' ? 'DELIVERED' : 'SENT'}
                    </p>
                    <p className="text-zinc-300 leading-relaxed font-sans text-xs">{log.message}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono self-end sm:self-start shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 italic">No messages dispatched yet. Trigger a booking to see raw logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
