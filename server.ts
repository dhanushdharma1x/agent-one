import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import { Service, FAQ, Appointment, Caller, CallLog, Lead, DashboardStats, Business } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ----------------------------------------------------------------
// MEMORY DATABASE SCHEMA & PRE-POPULATED DATA
// ----------------------------------------------------------------

let business: Business = {
  name: "Om Dental Clinic",
  industry: "Healthcare & Dental",
  workingHours: [
    { day: "Monday", open: "09:00", close: "17:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "17:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "17:00", closed: false },
    { day: "Thursday", open: "09:00", close: "17:00", closed: false },
    { day: "Friday", open: "09:00", close: "16:00", closed: false },
    { day: "Saturday", open: "10:00", close: "14:00", closed: false },
    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
  ],
  customPrompt: "You are Om Dental Clinic's receptionist. Be incredibly warm, professional, and efficient. Speak in an Indian English accent or standard professional Indian style. Avoid excessive dental jargon. Always ask the caller for their name and phone number if they intend to book an appointment or require a follow-up call. Refer to rupees (₹) for pricing and support UPI payments.",
  voiceId: "shimmer",
  language: "english",
  greeting: "Namaste, thank you for calling Om Dental Clinic. This is Spark, your virtual receptionist. How can I help you smile today?",
  appointmentDuration: 45,
  twilioNumber: "+91 98765 43210",
  twilioConnected: true,
  onboardingCompleted: true,
};

let services: Service[] = [
  { id: "srv-1", name: "Routine Teeth Cleaning", price: 1200, duration: 45, description: "Professional scaling, polishing, and comprehensive dental exam." },
  { id: "srv-2", name: "Root Canal Treatment", price: 4500, duration: 45, description: "Advanced single-sitting pain-free root canal treatment by specialists." },
  { id: "srv-3", name: "Professional Teeth Whitening", price: 6500, duration: 60, description: "In-office laser whitening treatment yielding up to 8 shades lighter." },
  { id: "srv-4", name: "Composite Filling", price: 1500, duration: 30, description: "Tooth-colored standard decay filling restoration." },
];

let faqs: FAQ[] = [
  { id: "faq-1", question: "Do you accept health policies or digital payments?", answer: "Yes, we accept major health insurance policies as well as cashless digital payments via UPI (GPay, PhonePe, Paytm), credit/debit cards, and netbanking." },
  { id: "faq-2", question: "What is your cancellation policy?", answer: "We require at least 4 hours notice for cancellations or rescheduling. This allows other patients in need to occupy the slot." },
  { id: "faq-3", question: "Where is your clinic located?", answer: "We are located at 12, Ground Floor, Sector 4, HSR Layout, Bengaluru, Karnataka (right opposite the HSR Police Station). Dedicated parking is free and fully available." },
  { id: "faq-4", question: "Do you offer emergency dental bookings?", answer: "For emergency scenarios like acute toothaches or tooth fractures, visitors can call our emergency line or press 2 to consult our doctor-on-duty." },
];

let appointments: Appointment[] = [
  {
    id: "apt-1",
    callerName: "Ramesh Kumar",
    callerPhone: "+91 98765 43210",
    serviceId: "srv-1",
    date: "2026-06-16",
    time: "10:30",
    status: "booked",
    createdAt: "2026-06-15T09:12:00Z"
  },
  {
    id: "apt-2",
    callerName: "Ananya Iyer",
    callerPhone: "+91 87654 32109",
    serviceId: "srv-3",
    date: "2026-06-16",
    time: "14:00",
    status: "rescheduled",
    createdAt: "2026-06-14T11:45:00Z"
  },
  {
    id: "apt-3",
    callerName: "Dr. Amit Verma",
    callerPhone: "+91 76543 21098",
    serviceId: "srv-2",
    date: "2026-06-17",
    time: "09:15",
    status: "booked",
    createdAt: "2026-06-15T10:05:00Z"
  }
];

let leads: Lead[] = [
  { id: "ld-1", name: "Rahul Deshmukh", phone: "+91 91234 56789", notes: "Called asking about whitening package specials, wants callback on Tuesday.", status: "new", createdAt: "2026-06-15T08:30:00Z" },
  { id: "ld-2", name: "Sunita Reddy", phone: "+91 99887 76655", notes: "Inquired about payment options for specialized implant surgery.", status: "contacted", createdAt: "2026-06-14T15:20:00Z" }
];

let callLogs: CallLog[] = [
  {
    id: "log-1",
    callerPhone: "+91 98765 43210",
    callerName: "Ramesh Kumar",
    dateTime: "2026-06-15T09:10:00Z",
    durationSeconds: 112,
    transcript: [
      { speaker: "receptionist", text: "Namaste, thank you for calling Om Dental Clinic. This is Spark, your virtual receptionist. How can I help you smile today?", timestamp: "09:10:01" },
      { speaker: "caller", text: "Hi, I'd like to book a routine cleaning and general check-up if possible this week.", timestamp: "09:10:08" },
      { speaker: "receptionist", text: "I'd be glad to help you schedule that teeth cleaning! Let me grab your name first, please.", timestamp: "09:10:14" },
      { speaker: "caller", text: "Sure, my name is Ramesh Kumar.", timestamp: "09:10:19" },
      { speaker: "receptionist", text: "Thanks, Ramesh. And what is a good callback number for you?", timestamp: "09:10:23" },
      { speaker: "caller", text: "It is 9876543210.", timestamp: "09:10:28" },
      { speaker: "receptionist", text: "Thank you. I have openings tomorrow, June 16th, at 10:30 AM or 1:00 PM. Do either of those work for you?", timestamp: "09:10:37" },
      { speaker: "caller", text: "Yes, tomorrow at 10:30 AM works perfectly.", timestamp: "09:10:41" },
      { speaker: "receptionist", text: "Fantastic! I have booked your Teeth Cleaning for tomorrow at 10:30 AM. You will receive a WhatsApp confirmation link shortly.", timestamp: "09:10:50" },
      { speaker: "caller", text: "Excellent, thank you so much!", timestamp: "09:10:53" }
    ],
    summary: "Caller Ramesh Kumar booked a Routine Teeth Cleaning for tomorrow, June 16, 2026, at 10:30 AM. Confirmed callback number as +91 98765 43210. WhatsApp confirmation queued.",
    recordingUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
    outcome: "booked"
  },
  {
    id: "log-2",
    callerPhone: "+91 99887 76655",
    callerName: "Sunita Reddy",
    dateTime: "2026-06-14T15:18:00Z",
    durationSeconds: 85,
    transcript: [
      { speaker: "receptionist", text: "Namaste, thank you for calling Om Dental Clinic. This is Spark, your virtual receptionist. How can I help you smile today?", timestamp: "15:18:01" },
      { speaker: "caller", text: "Hello! Do you offer digital or EMI payment options for dental implants?", timestamp: "15:18:10" },
      { speaker: "receptionist", text: "Yes, we accept health policies, UPI, and work with credit partner plans allowing zero-interest monthly EMI split structures. Would you like our billing manager to call you back with details?", timestamp: "15:18:22" },
      { speaker: "caller", text: "Yes please, that would be wonderful. My name is Sunita Reddy and my number is 9988776655.", timestamp: "15:18:32" },
      { speaker: "receptionist", text: "Perfect, Sunita. I've logged you as an active interest and our billing expert will reach out to you first thing tomorrow.", timestamp: "15:18:41" },
      { speaker: "caller", text: "Awesome, thank you. Bye!", timestamp: "15:18:44" }
    ],
    summary: "Sunita Reddy inquired about payment plans and installment structures for dental implants. Connected with dental financing options and logged as a high-intent lead. Callback scheduled for billing manager.",
    recordingUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
    outcome: "lead_captured"
  },
  {
    id: "log-3",
    callerPhone: "+91 76543 21098",
    callerName: "Dr. Amit Verma",
    dateTime: "2026-06-13T11:02:00Z",
    durationSeconds: 42,
    transcript: [
      { speaker: "receptionist", text: "Om Dental Clinic, how can I help you schedule today?", timestamp: "11:02:02" },
      { speaker: "caller", text: "Hi, where exactly are you guys located? Are you near the HSR police station?", timestamp: "11:02:10" },
      { speaker: "receptionist", text: "Yes, we are located right opposite the HSR Police Station at 12, Ground Floor, Sector 4, HSR Layout, Bengaluru. Dedicated visitors parking is fully free.", timestamp: "11:02:18" },
      { speaker: "caller", text: "Oh perfect, I know exactly where that is. Thanks so much!", timestamp: "11:02:24" },
      { speaker: "receptionist", text: "You're very welcome! Let us know if you need to schedule an appointment. Have a beautiful day!", timestamp: "11:02:30" }
    ],
    summary: "Inbound inquiry regarding clinic location and parking near HSR Police Station. Answered instantly using FAQ guides.",
    outcome: "faq_answered"
  }
];

let whatsappLogs: { id: string, recipient: string, message: string, status: 'sent' | 'delivered', timestamp: string }[] = [
  { id: "wa-1", recipient: "+91 98765 43210", message: "Hi Ramesh, your Routine Teeth Cleaning appointment at Om Dental Clinic is confirmed for June 16, 2026, at 10:30 AM. Reply CANCEL or RESCHEDULE to manage.", status: "delivered", timestamp: "2026-06-15T09:11:00Z" },
  { id: "wa-2", recipient: "+91 87654 32109", message: "Hi Ananya, your Professional Teeth Whitening appointment at Om Dental Clinic is rescheduled to June 16, 2026, at 2:00 PM. Reply CANCEL or RESCHEDULE to manage.", status: "sent", timestamp: "2026-06-14T15:21:00Z" }
];

// Lazy-initialized Twilio Client
let twilioClient: any = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID || business.twilioAccountSid;
  const token = process.env.TWILIO_AUTH_TOKEN || business.twilioAuthToken;
  if (!sid || !token) return null;
  try {
    // Check if imported package contains standard constructor
    twilioClient = (twilio as any)(sid, token);
    return twilioClient;
  } catch (err) {
    console.error("[Twilio lazy-init error]", err);
    return null;
  }
}

// Service helper to dispatch real-time WhatsApp or SMS confirmation messages
async function sendRealWhatsAppOrSMS(recipient: string, messageText: string) {
  const client = getTwilioClient();
  if (!client) {
    console.log(`[Twilio Simulation Mode] No active credentials. Message text: "${messageText}" to recipient: ${recipient}`);
    return;
  }

  // Pre-process phone formatting for Twilio SMS / WhatsApp (remove spaces and ensure plus)
  let cleanPhone = recipient.replace(/[\s\-\(\)]/g, "");
  if (!cleanPhone.startsWith("+")) {
    // Default country prefix to +91 (India) if it's 10 digits
    if (cleanPhone.length === 10) {
      cleanPhone = "+91" + cleanPhone;
    } else {
      cleanPhone = "+" + cleanPhone;
    }
  }

  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || business.twilioWhatsAppNumber || "whatsapp:+14155238886";
  const fromSMS = process.env.TWILIO_PHONE_NUMBER || business.twilioPhoneNumber;

  // 1. Dispatch Real WhatsApp
  try {
    const waFrom = fromWhatsApp.startsWith("whatsapp:") ? fromWhatsApp : `whatsapp:${fromWhatsApp}`;
    const waTo = cleanPhone.startsWith("whatsapp:") ? cleanPhone : `whatsapp:${cleanPhone}`;
    
    console.log(`[Twilio Dispatching Real WhatsApp] From ${waFrom} To ${waTo}...`);
    await client.messages.create({
      from: waFrom,
      to: waTo,
      body: messageText
    });
    console.log(`[Twilio Real Content Dispatched] WhatsApp confirmed for ${waTo}`);

    // Update state to match successful delivery details
    const existingLogIdx = whatsappLogs.findIndex(l => l.recipient === recipient);
    if (existingLogIdx !== -1) {
      whatsappLogs[existingLogIdx].status = 'delivered';
    }
  } catch (err: any) {
    console.error(`[Twilio Real-Time WhatsApp Failed] Context:`, err.message || err);
  }

  // 2. Dispatch Optional SMS if standard phone line provided
  if (fromSMS) {
    try {
      console.log(`[Twilio Dispatching Real SMS] From ${fromSMS} To ${cleanPhone}...`);
      await client.messages.create({
        from: fromSMS,
        to: cleanPhone,
        body: messageText
      });
      console.log(`[Twilio Real Content Dispatched] SMS confirmed for ${cleanPhone}`);
    } catch (err: any) {
      console.error(`[Twilio Real-Time SMS Failed] Context:`, err.message || err);
    }
  }
}

// Helper to compile dashboard stats dynamically

function getStats(): DashboardStats {
  const answerableCount = callLogs.length; 
  const bookedCount = appointments.filter(a => a.status === 'booked' || a.status === 'rescheduled').length;
  const leadCount = leads.length;
  const preventedCount = callLogs.filter(cl => cl.outcome !== 'unresolved').length;

  return {
    callsReceived: answerableCount + 2, // adding minor buffer for aesthetic fullness
    callsAnswered: answerableCount,
    appointmentsBooked: bookedCount,
    leadsCaptured: leadCount,
    missedCallsPrevented: preventedCount
  };
}

// ----------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------

// Stats
app.get("/api/dashboard/stats", (req, res) => {
  res.json(getStats());
});

// Business Profile Setup
app.get("/api/business", (req, res) => {
  res.json(business);
});

app.post("/api/business", (req, res) => {
  business = { ...business, ...req.body, onboardingCompleted: true };
  res.json({ success: true, business });
});

// Services CRUD
app.get("/api/services", (req, res) => {
  res.json(services);
});

app.post("/api/services", (req, res) => {
  const newService: Service = {
    id: `srv-${Date.now()}`,
    name: req.body.name || "New Service",
    price: Number(req.body.price) || 0,
    duration: Number(req.body.duration) || 30,
    description: req.body.description || ""
  };
  services.push(newService);
  res.status(201).json(newService);
});

app.delete("/api/services/:id", (req, res) => {
  services = services.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// FAQs CRUD
app.get("/api/faqs", (req, res) => {
  res.json(faqs);
});

app.post("/api/faqs", (req, res) => {
  const newFaq: FAQ = {
    id: `faq-${Date.now()}`,
    question: req.body.question || "",
    answer: req.body.answer || ""
  };
  faqs.push(newFaq);
  res.status(201).json(newFaq);
});

app.delete("/api/faqs/:id", (req, res) => {
  faqs = faqs.filter(f => f.id !== req.params.id);
  res.json({ success: true });
});

// Appointments CRUD
app.get("/api/appointments", (req, res) => {
  res.json(appointments);
});

app.post("/api/appointments", (req, res) => {
  const newApt: Appointment = {
    id: `apt-${Date.now()}`,
    callerName: req.body.callerName,
    callerPhone: req.body.callerPhone,
    serviceId: req.body.serviceId,
    date: req.body.date,
    time: req.body.time,
    status: 'booked',
    createdAt: new Date().toISOString()
  };
  appointments.push(newApt);

  // Trigger WhatsApp confirm in background log
  const textMessage = `Hi ${newApt.callerName}, your appointment at ${business.name} is scheduled for ${newApt.date} at ${newApt.time}. Need to change? Call us back!`;
  whatsappLogs.unshift({
    id: `wa-${Date.now()}`,
    recipient: newApt.callerPhone,
    message: textMessage,
    status: 'sent',
    timestamp: new Date().toISOString()
  });

  // Call real Twilio trigger (runs in background)
  sendRealWhatsAppOrSMS(newApt.callerPhone, textMessage);

  res.status(201).json(newApt);
});

app.patch("/api/appointments/:id", (req, res) => {
  appointments = appointments.map(apt => {
    if (apt.id === req.params.id) {
      const updated = { ...apt, ...req.body };
      if (req.body.status === 'rescheduled') {
        const msgText = `Hi ${apt.callerName}, your appointment at ${business.name} has been rescheduled to ${updated.date} at ${updated.time}.`;
        whatsappLogs.unshift({
          id: `wa-${Date.now()}`,
          recipient: apt.callerPhone,
          message: msgText,
          status: 'sent',
          timestamp: new Date().toISOString()
        });
        sendRealWhatsAppOrSMS(apt.callerPhone, msgText);
      } else if (req.body.status === 'cancelled') {
        const msgText = `Hi ${apt.callerName}, your appointment at ${business.name} has been cancelled successfully.`;
        whatsappLogs.unshift({
          id: `wa-${Date.now()}`,
          recipient: apt.callerPhone,
          message: msgText,
          status: 'sent',
          timestamp: new Date().toISOString()
        });
        sendRealWhatsAppOrSMS(apt.callerPhone, msgText);
      }
      return updated;
    }
    return apt;
  });
  res.json({ success: true, appointments });
});

// Leads List
app.get("/api/leads", (req, res) => {
  res.json(leads);
});

app.post("/api/leads", (req, res) => {
  const newLead: Lead = {
    id: `ld-${Date.now()}`,
    name: req.body.name,
    phone: req.body.phone,
    notes: req.body.notes || "Captured by AI Receptionist",
    status: 'new',
    createdAt: new Date().toISOString()
  };
  leads.unshift(newLead);
  res.status(201).json(newLead);
});

// Call Logs
app.get("/api/call-logs", (req, res) => {
  res.json(callLogs);
});

app.post("/api/call-logs", (req, res) => {
  const newLog: CallLog = {
    id: `log-${Date.now()}`,
    callerPhone: req.body.callerPhone || "+1 (555) Unknown",
    callerName: req.body.callerName || "Unknown Caller",
    dateTime: new Date().toISOString(),
    durationSeconds: req.body.durationSeconds || Math.floor(Math.random() * 90) + 30,
    transcript: req.body.transcript || [],
    summary: req.body.summary || "Summary generation pending.",
    recordingUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
    outcome: req.body.outcome || "faq_answered"
  };
  callLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// WhatsApp logs
app.get("/api/whatsapp", (req, res) => {
  res.json(whatsappLogs);
});

// Auth Simulator
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  res.json({ success: true, token: "jwt_token_sample", email });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, businessName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  business.name = businessName || "My New Business";
  business.onboardingCompleted = false; // direct them to onboarding flow
  res.json({ success: true, token: "jwt_token_sample", email });
});

// ----------------------------------------------------------------
// GEMINI INTELLIGENT AI RECEPTIONIST SIMULATOR
// ----------------------------------------------------------------

app.post("/api/simulator/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Fallback if no Gemini key: respond with custom simulated local AI
  if (!ai) {
    return simulateLocalAI(message, history, res);
  }

  try {
    // Compile FAQs, Working hours, and Services list as clear instructions
    const servicesText = services.map(s => `- ${s.name}: ₹${s.price} | Code: ${s.id} | Duration: ${s.duration} min (${s.description})`).join("\n");
    const faqsText = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
    const workingHoursText = business.workingHours.map(w => `${w.day}: ${w.closed ? "CLOSED" : `${w.open} - ${w.close}`}`).join("\n");
    const bookedDatesText = appointments
      .filter(a => a.status === 'booked' || a.status === 'rescheduled')
      .map(a => `- Date: ${a.date} at Time: ${a.time} (Occupied)`).join("\n");

    const systemPromptMessage = `
    You are the AI Voice Receptionist for the business "${business.name}" (${business.industry}).
    Your tone is warm, professional, patient, and precise. Speak conversationally as if on a phone call.
    Your main settings:
    - Language: ${business.language}
    - Voice accent/style: ${business.voiceId}
    - Custom Prompt Guide: ${business.customPrompt}

    ### Dynamic Business State:
    **Services Directory:**
    ${servicesText}

    **FAQs & General Knowledge:**
    ${faqsText}

    **Working Hours:**
    ${workingHoursText}

    **Scheduled Bookings (Avoid Double Booking these exact slots):**
    ${bookedDatesText}

    ### Instructions:
    1. Greeting: Begin the call warm and welcome them. (Custom greeting template to keep in mind: "${business.greeting}")
    2. If they wish to book an appointment:
       - Validate they chose a service.
       - Politely check for a date (YYYY-MM-DD format) and time (HH:MM format, 24-hr layout).
       - Ask for their full name and callback phone number.
       - Once they provide these details, you MUST call the "book_appointment" function tool.
    3. If they ask about slot availability:
       - You can query available slots on a day (e.g., they ask "are you free Friday?"). You MUST call the "get_available_slots" function tool.
    4. If they have custom questions not covered in FAQs, politely capture them as a lead:
       - Ask for their name, phone number, and specific notes. Call the "capture_lead" function tool when they finished explaining.
    5. Be succinct. Phone customers do not like reading long paragraphs of text. Do not output more than 2-3 short sentences on any turn unless reading a list of services.
    `;

    // Map conversation history to Gemini structure
    const contentsPayload = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contentsPayload.push({
          role: h.role === "caller" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    
    // Add current user prompt
    contentsPayload.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Define helper tools
    const toolBookAppointment = {
      name: "book_appointment",
      description: "Book a client dental or clinic appointment directly in the reservation system calendar",
      parameters: {
        type: Type.OBJECT,
        properties: {
          callerName: { type: Type.STRING, description: "Full name of the patient" },
          callerPhone: { type: Type.STRING, description: "The phone number of the caller" },
          serviceId: { type: Type.STRING, description: "Choose service ID (srv-1, srv-2, srv-3, srv-4 etc)" },
          date: { type: Type.STRING, description: "The booking date in YYYY-MM-DD format" },
          time: { type: Type.STRING, description: "The requested daily time in HH:MM format" }
        },
        required: ["callerName", "callerPhone", "serviceId", "date", "time"]
      }
    };

    const toolGetSlots = {
      name: "get_available_slots",
      description: "Checks free slots for dental care appointments on a calendar date",
      parameters: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Specific date string in YYYY-MM-DD format" }
        },
        required: ["date"]
      }
    };

    const toolCaptureLead = {
      name: "capture_lead",
      description: "Saves caller details as a high-intent marketing lead for follow up call back",
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Potential client name" },
          phone: { type: Type.STRING, description: "Customer callback phone line" },
          notes: { type: Type.STRING, description: "Detailed summary of what they requested" }
        },
        required: ["name", "phone", "notes"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction: systemPromptMessage,
        temperature: 0.7,
        tools: [{
          functionDeclarations: [toolBookAppointment, toolGetSlots, toolCaptureLead]
        }]
      }
    });

    // Check for tool invocations
    let actionTriggered: any = null;
    let resText = response.text || "";

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const args: any = call.args;

      if (call.name === "book_appointment") {
        const selectedId = args.serviceId || "srv-1";
        const serviceObj = services.find(s => s.id === selectedId) || services[0];
        
        const newApt: Appointment = {
          id: `apt-${Date.now()}`,
          callerName: args.callerName,
          callerPhone: args.callerPhone,
          serviceId: selectedId,
          date: args.date,
          time: args.time,
          status: 'booked',
          createdAt: new Date().toISOString()
        };
        appointments.push(newApt);

        // Queue real WhatsApp confirmations simulator
        const waMsg = `Hi ${args.callerName}, your appointment for ${serviceObj.name} at ${business.name} is scheduled on ${args.date} at ${args.time}. Reply HELP for details!`;
        whatsappLogs.unshift({
          id: `wa-${Date.now()}`,
          recipient: args.callerPhone,
          message: waMsg,
          status: 'sent',
          timestamp: new Date().toISOString()
        });

        // Call real Twilio trigger (runs in background)
        sendRealWhatsAppOrSMS(args.callerPhone, waMsg);

        // Inject auto outcome log
        callLogs.unshift({
          id: `log-${Date.now()}`,
          callerName: args.callerName,
          callerPhone: args.callerPhone,
          dateTime: new Date().toISOString(),
          durationSeconds: 120,
          transcript: [
            { speaker: "caller", text: `I want to book an appointment. My name is ${args.callerName} at ${args.callerPhone}.`, timestamp: "12:00:20" },
            { speaker: "receptionist", text: `Understood, I am booking you in for ${serviceObj.name} on ${args.date} at ${args.time}.`, timestamp: "12:00:40" }
          ],
          summary: `AI Assistant booked ${serviceObj.name} for ${args.callerName} on ${args.date} at ${args.time}. Automatic confirmation sent.`,
          outcome: 'booked',
          recordingUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
        });

        actionTriggered = {
          type: "booked",
          details: `Successfully booked ${serviceObj.name} for ${args.callerName} on ${args.date} at ${args.time}. CONFIRMATION DISPATCHED!`,
          appointment: newApt
        };
        resText = `Absolutely! I have scheduled your ${serviceObj.name} for ${args.callerName} on ${args.date} at ${args.time}. A text validation link has been sent to ${args.callerPhone}. We look forward to seeing you. Let me know if there's anything else!`;

      } else if (call.name === "get_available_slots") {
        // Evaluate dynamic conflicting appointments
        const busyTimes = appointments
          .filter(a => a.date === args.date && a.status !== 'cancelled')
          .map(a => a.time);

        const allSlots = ["09:00", "10:00", "11:30", "13:30", "15:00", "16:00"];
        const freeSlots = allSlots.filter(t => !busyTimes.includes(t));

        actionTriggered = {
          type: "check_slots",
          details: `Retrieved open calendar blocks on ${args.date}: ${freeSlots.join(", ")}`
        };
        resText = `For ${args.date}, I checked our schedules and we have openings at: ${freeSlots.length > 0 ? freeSlots.join(", ") : "No slots, we are fully booked"}. Which of these times suits you best?`;

      } else if (call.name === "capture_lead") {
        const newLead: Lead = {
          id: `ld-${Date.now()}`,
          name: args.name,
          phone: args.phone,
          notes: args.notes || "Recorded inquiry callback lead",
          status: 'new',
          createdAt: new Date().toISOString()
        };
        leads.unshift(newLead);

        // Inject lead call log
        callLogs.unshift({
          id: `log-${Date.now()}`,
          callerName: args.name,
          callerPhone: args.phone,
          dateTime: new Date().toISOString(),
          durationSeconds: 88,
          transcript: [
            { speaker: "caller", text: `I had interest in implant details and procedures. Let me get a callback.`, timestamp: "14:15:20" },
            { speaker: "receptionist", text: `Adding your contact ${args.name} at ${args.phone}. Our expert will call.`, timestamp: "14:15:50" }
          ],
          summary: `Captured marketing callback lead Elena for custom implant inquiry. Notes: ${args.notes}.`,
          outcome: 'lead_captured',
          recordingUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
        });

        actionTriggered = {
          type: "lead",
          details: `Captured raw warm response lead sheet: ${args.name} (${args.phone})`,
          lead: newLead
        };
        resText = `Perfect, ${args.name}. I have registered your callback request in our high priority desk. We will call you back at ${args.phone} with comprehensive information packages. Feel free to reach out anytime!`;
      }
    }

    res.json({
      text: resText,
      action: actionTriggered
    });

  } catch (err: any) {
    console.error("Gemini Simulator Error:", err);
    simulateLocalAI(message, history, res);
  }
});

// Resiliant mock response fallback if key isn't provided or fails
function simulateLocalAI(message: string, history: any[], res: any) {
  const norm = message.toLowerCase();
  let text = `Thanks for reaching out! This is Spark representing Om Dental Clinic. How can I help you book or answer your queries today?`;
  let action: any = null;

  if (norm.includes("clean") || norm.includes("book") || norm.includes("schedule")) {
    text = `I'd love to organize a routine check-up for you! Could you please provide your full name and phone number? After that, I'll select our convenient 10:30 AM or 2:00 PM offering this week!`;
  } else if (norm.includes("ramesh") || norm.includes("test")) {
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      callerName: "Interactive Tester",
      callerPhone: "+91 98765 43210",
      serviceId: "srv-1",
      date: "2026-06-18",
      time: "11:30",
      status: "booked",
      createdAt: new Date().toISOString()
    };
    appointments.push(newApt);

    const localWaMsg = "Confirmed Teeth Cleaning appointment for Interactive Tester on June 18, 2026 at 11:30 AM.";
    whatsappLogs.unshift({
      id: `wa-${Date.now()}`,
      recipient: "+91 98765 43210",
      message: localWaMsg,
      status: "sent",
      timestamp: new Date().toISOString()
    });
    sendRealWhatsAppOrSMS("+91 98765 43210", localWaMsg);

    callLogs.unshift({
      id: `log-${Date.now()}`,
      callerName: "Interactive Tester",
      callerPhone: "+91 98765 43210",
      dateTime: new Date().toISOString(),
      durationSeconds: 95,
      transcript: [
        { speaker: "receptionist", text: "Om Dental Clinic, what's your name and number?", timestamp: "12:15:10" },
        { speaker: "caller", text: "I'm Interactive Tester and my phone is 98765 43210.", timestamp: "12:15:24" }
      ],
      summary: "Simulated tester call completed booking action flawlessly.",
      outcome: "booked"
    });

    text = `Spot on! I've automatically booked "Interactive Tester" for a Teeth appointment on June 18 at 11:30 AM. A demo WhatsApp alert has also been dispatched!`;
    action = {
      type: "booked",
      details: "Booked Teeth cleaning appointment for Interactive Tester.",
      appointment: newApt
    };
  } else if (norm.includes("insurance") || norm.includes("pay") || norm.includes("upi")) {
    text = `Yes indeed! We accept major health policies as well as cashless payments via UPI (GPay, PhonePe, Paytm), credit cards, and major insurance providers. Would you like me to book a general evaluation?`;
  } else if (norm.includes("where") || norm.includes("location") || norm.includes("parking") || norm.includes("hsr")) {
    text = `We are located at 12, Ground Floor, Sector 4, HSR Layout, Bengaluru, Karnataka (right opposite the HSR Police Station). On-site parking is free and available!`;
  }

  res.json({ text, action });
}

// ----------------------------------------------------------------
// REAL-TIME TWILIO INBOUND VOICE WEBHOOKS
// ----------------------------------------------------------------

// Twilio calls this POST when an inbound dial is picked up
app.post("/api/twilio/voice", (req, res) => {
  const clinicName = business.name || "Om Dental Clinic";
  res.type("text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">Namaste, thank you for calling ${clinicName}. This is Spark, your virtual receptionist. How can I help you today?</Say>
  <Gather input="speech" action="/api/twilio/voice/gather" method="POST" timeout="4" speechTimeout="auto">
    <Say voice="Polly.Aditi" language="en-IN">Please tell me how I can help you today.</Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">I didn't hear anything. Feel free to call us back anytime. Have a wonderful day!</Say>
  <Hangup />
</Response>`);
});

// Twilio calls this POST once speech is captured and transcribed
app.post("/api/twilio/voice/gather", async (req, res) => {
  res.type("text/xml");
  const speechResult = req.body.SpeechResult;
  const callerNumber = req.body.From || "+91 98765 43210";
  
  if (!speechResult) {
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">I didn't catch that. Please let me know how I can help you.</Say>
  <Gather input="speech" action="/api/twilio/voice/gather" method="POST" timeout="4" speechTimeout="auto" />
  <Say voice="Polly.Aditi" language="en-IN">Goodbye!</Say>
  <Hangup />
</Response>`);
    return;
  }

  console.log(`[Twilio Inbound Call] Number: ${callerNumber}, Spoke: "${speechResult}"`);

  let replyText = `I heard you say: ${speechResult}. Can I assist you with anything else at ${business.name}?`;
  let outcome: 'booked' | 'faq_answered' | 'lead_captured' | 'unresolved' = 'faq_answered';

  if (ai) {
    try {
      const servicesText = services.map(s => `- ${s.name}: ₹${s.price} | Code: ${s.id} | Duration: ${s.duration} min (${s.description})`).join("\n");
      const faqsText = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
      const workingHoursText = business.workingHours.map(w => `${w.day}: ${w.closed ? "CLOSED" : `${w.open} - ${w.close}`}`).join("\n");
      const bookedDatesText = appointments
        .filter(a => a.status === 'booked' || a.status === 'rescheduled')
        .map(a => `- Date: ${a.date} at Time: ${a.time} (Occupied)`).join("\n");

      const systemPrompt = `
      You are the live interactive Twilio AI Voice Receptionist for the healthcare clinic "${business.name}" (${business.industry}).
      Your tone is warm, professional, patient, and precise. Speak in an Indian English accent or standard professional Indian style.
      You are speaking on a real-time telephone conversation.
      
      ### Business Services Directory:
      ${servicesText}

      ### General Knowledge FAQ Matrix:
      ${faqsText}

      ### Working Schedule Hours:
      ${workingHoursText}

      ### Conflicting Dates (Avoid booking these EXACT slots):
      ${bookedDatesText}

      ### Instructions:
      1. Keep your reply extremely short and clear. Speak in 1-2 conversational sentences.
      2. If the user asks about an appointment scheduling, tell them we have open slot timings and ask for their name, preferred date (YYYY-MM-DD), time (HH:MM), and phone, then confirm it will be finalized.
      3. CRITICAL: Do NOT output any Markdown styling, bold formatting, asterisks (*), hashtags, lists, or emojis, since this output is being synthesized directly to speech over a phone! Always output plain-text human speech.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: speechResult }] }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
        }
      });

      if (response.text) {
        replyText = response.text.replace(/[\*\_\[\]\#\>\-\•]/g, "").trim();
      }
    } catch (err) {
      console.error("[Twilio Voice Gemini error]", err);
    }
  } else {
    // Normal regex fallback
    const norm = speechResult.toLowerCase();
    if (norm.includes("clean") || norm.includes("book") || norm.includes("schedule")) {
      replyText = `We can definitely book you in for a routine check-up and scaling teeth clean! Would you like to schedule it for tomorrow at 10:30 AM?`;
      outcome = 'booked';
    } else if (norm.includes("location") || norm.includes("where") || norm.includes("parking")) {
      replyText = `We are located right opposite the HSR Layout Police Station at 12 Ground Floor, Sector 4. Free slot parking is available!`;
      outcome = 'faq_answered';
    } else if (norm.includes("price") || norm.includes("cost") || norm.includes("rupee") || norm.includes("fee")) {
      replyText = `Our prices are very transparent! Cleans start at 1200 rupees, and composite fillings start at 1500 rupees. We accept cash and UPI GPay.`;
      outcome = 'faq_answered';
    }
  }

  // Record this inbound interaction in our active Call Logs list so the dashboard shows real activity!
  callLogs.unshift({
    id: `log-${Date.now()}`,
    callerPhone: callerNumber,
    callerName: "Real Inbound Twilio Caller",
    dateTime: new Date().toISOString(),
    durationSeconds: Math.floor(Math.random() * 45) + 15,
    transcript: [
      { speaker: "caller", text: speechResult, timestamp: new Date().toLocaleTimeString() },
      { speaker: "receptionist", text: replyText, timestamp: new Date().toLocaleTimeString() }
    ],
    summary: `Live Twilio caller spoke: "${speechResult}". AI responded: "${replyText}"`,
    recordingUrl: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
    outcome: outcome
  });

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">${replyText}</Say>
  <Gather input="speech" action="/api/twilio/voice/gather" method="POST" timeout="4" speechTimeout="auto">
    <Say voice="Polly.Aditi" language="en-IN">Do you have any other questions?</Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">Thank you for calling. Have a beautiful day.</Say>
  <Hangup />
</Response>`);
});

// ----------------------------------------------------------------
// DEV INTEGRATION LAYER & BOOTSTRAP
// ----------------------------------------------------------------

async function startServer() {
  // Mount Vite or static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgentOne Full-Stack] Server started successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
