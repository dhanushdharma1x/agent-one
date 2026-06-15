import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  PhoneCall, 
  Settings, 
  Users, 
  LogOut, 
  Bot, 
  TrendingUp, 
  Sparkles,
  RefreshCw 
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  onLogout: () => void;
  businessName: string;
}

export default function Sidebar({ currentTab, onChangeTab, onLogout, businessName }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", name: "Overview", icon: LayoutDashboard },
    { id: "calendar", name: "Appointment Calendar", icon: Calendar },
    { id: "logs", name: "AI Call Logs & Transcripts", icon: PhoneCall },
    { id: "analytics", name: "Analytics & Outcomes", icon: TrendingUp },
    { id: "settings", name: "Receptionist Config", icon: Settings },
  ];

  return (
    <aside id="sidebar-container" className="w-68 bg-zinc-950 border-r border-zinc-900 text-zinc-400 flex flex-col h-screen overflow-hidden">
      {/* Brand logo */}
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              AgentOne
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">v1.2 MVP</p>
          </div>
        </div>
      </div>

      {/* Connected Business Switcher */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/50">
        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-zinc-950 capitalize">
            {businessName.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-zinc-200 truncate">{businessName}</p>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              AI Receptionist Ready
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-zinc-900 text-white border-l-2 border-emerald-500" 
                  : "hover:bg-zinc-900/40 hover:text-zinc-200"
              }`}
            >
              <IconComponent size={18} className={isActive ? "text-emerald-400" : "text-zinc-500"} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status / User Footer */}
      <div className="p-4 border-t border-zinc-900 space-y-3.5 bg-zinc-950">
        <div className="text-xs bg-zinc-900/80 rounded-lg p-3 border border-zinc-800 text-zinc-400 whitespace-normal space-y-1">
          <div className="font-medium text-zinc-200 flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" />
            Twilio & Vapi Connected
          </div>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Your virtual line answers incoming calls automatically.
          </p>
        </div>

        <button 
          id="logout-button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span>Exit Business Space</span>
        </button>
      </div>
    </aside>
  );
}
