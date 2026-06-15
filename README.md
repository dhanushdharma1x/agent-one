# AI Receptionist Practice Sandbox & Telecom Gateway (Spark Assistant)

A highly responsive, full-stack virtual clinic receptionist powered by **Gemini 3.5 Flash** and **Twilio API**. It automates inbound telephone lines and sends real-time confirmation alerts via WhatsApp and SMS for dental and healthcare clinics.

---

## 🚀 Key Capabilities & Modules

1. **AI Speech Agent Sandbox**: A simulated telephone controller utilizing browser-synthesized voice channels. It lets users practice with patient caller presets (High Intent, FAQ, Lead captures) or custom inputs.
2. **Dynamic Dashboard Metrics**: Tracks daily call loads, conversion rates, patient leads, and real-time appointment grids that synchronize instantly.
3. **Real-time Live Caller Smartphone Graphic**: Displays a live, animated visual smartphone representing the caller's device with synchronized WhatsApp messaging threads.
4. **Live Twilio Webhook Receiver**: Implements server-side webhook endpoints (`/api/twilio/voice` and `/api/twilio/voice/gather`) to route live spoken telephone calls directly to Gemini's natural language processing.
5. **Configurable Interface Manager**: Easily save Twilio Account Credentials, SMS senders, WhatsApp sandbox names, and personalized clinic answers straight from the UI.

---

## 🛠️ Getting Started (Local Development)

### 1. Repository Setup & Installations

Clone the project down to your local directory and install the necessary Node modules:

```bash
# Clone the repository (or extract details) & enter directory
npm install
```

### 2. Configure Environment Variables (`.env`)

Create a `.env` file in the root directory. Avoid committing this file to GitHub!

```env
# Gemini API Access token
GEMINI_API_KEY="AIzaSy..."

# Host Server config
PORT=3000

# Optional: Live Twilio Integration Credentials 
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
TWILIO_PHONE_NUMBER=""
```

### 3. Run the Development Server

Start the local server backed by `tsx` (TypeScript Execute-On-The-Fly):

```bash
npm run dev
```
Open your browser to `http://localhost:3000` to interact with the dashboard.

---

## 📡 Live Inbound Telephone Integration

To connect real phone numbers to your Spark virtual receptionist:

1. **Deploy to a Public URL**: Deploy the code or use a localhost proxy (such as `ngrok`) to get a public URL (e.g. `https://my-clinic-spark.up.railway.app`).
2. **Update the Twilio Configuration**:
   - Go to your **Twilio Console** > **Active Numbers**.
   - select your active phone number.
   - Scroll down to the **A Voice Call Comes In** configuration field under **Voice & Fax**.
   - Set the action type to **Webhook**.
   - Paste your public app webhook endpoint: `https://YOUR_DOMAIN.com/api/twilio/voice`.
   - Set the HTTP method parameter to **HTTP POST** and click Save.
3. **Dial In**: Calling your Twilio phone line will now route speech dynamically to your Gemini AI clinic receptionist, talking back into your physical telephone handset!

---

## 📁 Repository Structure

```text
├── server.ts               # Full-stack Express server with Vite middleware & Twilio/Gemini webhooks
├── src/
│   ├── App.tsx             # Main dashboard view shell and navigation coordinator
│   ├── types.ts            # Core TypeScript model interfaces (Services, FAQs, Logs, Credentials)
│   ├── index.css           # Global stylesheet with modern font families and Tailwind triggers
│   └── components/
│       ├── DashboardStats.tsx # Diagnostic widgets & messaging dispatch logs
│       ├── CallSimulator.tsx  # Interactive practicing terminal & mobile device mockup
│       ├── ConfigPanel.tsx    # Clinic customization profile values & credential binds
│       ├── AppointmentList.tsx# Grid view of schedules, rescheduling modal, & new manual insertions
│       └── LeadList.tsx       # Tracked patient query contacts
└── package.json            # Deployment dependencies and build scripts
```

---

## 🛡️ License

This codebase is open-source. Feel free to tweak, scale up, or deploy to help secure appointment bookings for your clinic!
