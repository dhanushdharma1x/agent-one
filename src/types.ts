export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface WorkingHour {
  day: string;
  open: string; // "09:00"
  close: string; // "17:00"
  closed: boolean;
}

export interface Business {
  name: string;
  industry: string;
  workingHours: WorkingHour[];
  customPrompt: string;
  voiceId: string; // "alloy" | "echo" | "shimmer" | "fable" | "onyx"
  language: string; // "english" | "spanish" | "french" | "multilingual"
  greeting: string;
  appointmentDuration: number; // e.g. 30, 45, 60 minutes
  twilioNumber: string;
  twilioConnected: boolean;
  onboardingCompleted: boolean;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioWhatsAppNumber?: string;
  twilioPhoneNumber?: string;
}

export interface Appointment {
  id: string;
  callerName: string;
  callerPhone: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  status: 'booked' | 'rescheduled' | 'cancelled';
  createdAt: string;
}

export interface Caller {
  id: string;
  name: string;
  phone: string;
  lastCallDate: string;
  totalCalls: number;
  isLead: boolean;
}

export interface TranscriptMessage {
  speaker: 'caller' | 'receptionist';
  text: string;
  timestamp: string;
}

export interface CallLog {
  id: string;
  callerPhone: string;
  callerName: string;
  dateTime: string;
  durationSeconds: number;
  transcript: TranscriptMessage[];
  summary: string;
  recordingUrl?: string;
  outcome: 'booked' | 'faq_answered' | 'lead_captured' | 'missed_call_prevented' | 'unresolved';
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  notes: string;
  status: 'new' | 'contacted' | 'converted';
  createdAt: string;
}

export interface DashboardStats {
  callsReceived: number;
  callsAnswered: number;
  appointmentsBooked: number;
  leadsCaptured: number;
  missedCallsPrevented: number;
}
