import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  X,
  User,
  Phone,
  Bookmark
} from "lucide-react";
import { Appointment, Service } from "../types";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  onAddAppointment: (apt: Partial<Appointment>) => void;
  onUpdateStatus: (id: string, status: 'booked' | 'rescheduled' | 'cancelled') => void;
  onReschedule: (id: string, date: string, time: string) => void;
}

export default function AppointmentCalendar({ 
  appointments, 
  services, 
  onAddAppointment, 
  onUpdateStatus, 
  onReschedule 
}: AppointmentCalendarProps) {
  
  // Date selection states starting around 2026-06-15 (meta local time)
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-16");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState<string | null>(null);

  // Form input states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newService, setNewService] = useState(services[0]?.id || "");
  const [newTime, setNewTime] = useState("10:00");
  const [newDate, setNewDate] = useState("2026-06-16");

  // Reschedule form input states
  const [reschedDate, setReschedDate] = useState("2026-06-16");
  const [reschedTime, setReschedTime] = useState("10:00");

  const datesToDisplay = [
    { label: "Mon, Jun 15", val: "2026-06-15" },
    { label: "Tue, Jun 16", val: "2026-06-16" },
    { label: "Wed, Jun 17", val: "2026-06-17" },
    { label: "Thu, Jun 18", val: "2026-06-18" },
    { label: "Fri, Jun 19", val: "2026-06-19" },
    { label: "Sat, Jun 20", val: "2026-06-20" },
  ];

  const timesToSuggest = [
    "09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15", "16:00"
  ];

  const filteredAppointments = appointments.filter(apt => apt.date === selectedDate);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    onAddAppointment({
      callerName: newName,
      callerPhone: newPhone,
      serviceId: newService,
      date: newDate,
      time: newTime,
    });
    setNewName("");
    setNewPhone("");
    setIsAddOpen(false);
  };

  const handleRescheduleSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    onReschedule(id, reschedDate, reschedTime);
    setIsRescheduleOpen(null);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Date Selection Header bar */}
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {datesToDisplay.map((d) => (
            <button
              id={`date-pill-${d.val}`}
              key={d.val}
              onClick={() => setSelectedDate(d.val)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold tracking-tight shrink-0 transition-all ${
                selectedDate === d.val 
                  ? "bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/10" 
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              }`}
            >
              {d.label}
              <span className="block text-[9px] opacity-70 mt-0.5 font-mono">
                {appointments.filter(a => a.date === d.val && a.status !== 'cancelled').length} scheduled
              </span>
            </button>
          ))}
        </div>

        <button
          id="btn-add-appointment-manual"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={15} /> Request Manual Booking
        </button>
      </div>

      {/* Main Day Appointments list */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden">
        {/* Day info top row */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-950/80 flex items-center gap-2">
          <CalendarIcon size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Schedule for {datesToDisplay.find(d => d.val === selectedDate)?.label || selectedDate}
          </h3>
        </div>

        {/* Content list */}
        <div className="divide-y divide-zinc-900">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs whitespace-normal">
              No appointments are booked for this day yet. 
              <br />Try interacting with the AI Receptionist Simulator below to book one!
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const matchedService = services.find(s => s.id === apt.serviceId);
              return (
                <div key={apt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-zinc-900/10">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex flex-col items-center shrink-0 w-14">
                      <Clock size={15} className="text-emerald-400 mb-1" />
                      <span className="text-xs font-mono font-bold">{apt.time}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100">{apt.callerName}</span>
                        <div className="flex items-center gap-1.5">
                          {apt.status === 'booked' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                              Confirmed
                            </span>
                          )}
                          {apt.status === 'rescheduled' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/10">
                              Rescheduled
                            </span>
                          )}
                          {apt.status === 'cancelled' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-3.5 mt-1.5 text-xs text-zinc-400 font-medium whitespace-normal">
                        <span className="text-zinc-200">{matchedService?.name || "General Checkup"} ({matchedService?.duration || 30} mins)</span>
                        <span className="text-zinc-500 hidden sm:inline">•</span>
                        <span className="font-mono">{apt.callerPhone}</span>
                        <span className="text-zinc-500 hidden sm:inline">•</span>
                        <span className="text-zinc-500">Scheduled {new Date(apt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational status adjustment buttons */}
                  {apt.status !== 'cancelled' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setReschedDate(apt.date);
                          setReschedTime(apt.time);
                          setIsRescheduleOpen(apt.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Reschedule
                      </button>
                      
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-red-500/10 border border-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={13} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'booked')}
                      className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Restore Booking
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FLYOUT MODAL: Request Manual Booking */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl max-w-md w-full overflow-hidden p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-1.5">
              <Bookmark size={18} className="text-emerald-400" />
              Manual Calendar Entry
            </h3>
            <p className="text-xs text-zinc-500 mb-5">Adds an appointment directly. Confirms matching WhatsApp alerts instantly.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Patient / Client Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="w-full bg-zinc-900 text-sm py-2.5 pl-9 pr-4 rounded-lg text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Mobile Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-900 text-sm py-2.5 pl-9 pr-4 rounded-lg text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-zinc-900 text-sm p-2.5 rounded-lg text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Preferred Time Slot</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-zinc-900 text-sm p-2.5 rounded-lg text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                  >
                    {timesToSuggest.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Selected Treatment / Service</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full bg-zinc-900 text-sm p-2.5 rounded-lg text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>{srv.name} (₹{srv.price})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3.5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-semibold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLYOUT MODAL: Reschedule Entry */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsRescheduleOpen(null)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-1.5">
              <CalendarIcon size={18} className="text-amber-400" />
              Adjust Scheduled Calendar Slot
            </h3>
            <p className="text-xs text-zinc-500 mb-5">Change time and date. Automatically dispatches rescheduled notifications.</p>

            <form onSubmit={(e) => handleRescheduleSubmit(e, isRescheduleOpen)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">New Booking Date</label>
                <input
                  type="date"
                  required
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="w-full bg-zinc-900 text-sm p-2.5 rounded-lg text-white border border-zinc-850 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Select Available Time Block</label>
                <select
                  value={reschedTime}
                  onChange={(e) => setReschedTime(e.target.value)}
                  className="w-full bg-zinc-900 text-sm p-2.5 rounded-lg text-white border border-zinc-850 focus:outline-none"
                >
                  {timesToSuggest.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3.5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(null)}
                  className="px-4 py-2.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-semibold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
