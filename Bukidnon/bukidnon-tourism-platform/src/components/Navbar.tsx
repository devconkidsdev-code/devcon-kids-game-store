import React from 'react';
import { UserRole, Booking } from '../types';
import { 
  Compass, 
  Store, 
  ShieldCheck, 
  CalendarDays, 
  Calculator, 
  Map as MapIcon, 
  MessageSquareText, 
  CloudRain, 
  Sparkles,
  Search,
  Bell
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  bookingsCount: number;
  onOpenBookings: () => void;
  onOpenBudget: () => void;
  onOpenTripPlanner: () => void;
  onToggleChatbot: () => void;
  isChatbotOpen: boolean;
  hasWeatherAlert?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  bookingsCount,
  onOpenBookings,
  onOpenBudget,
  onOpenTripPlanner,
  onToggleChatbot,
  isChatbotOpen,
  hasWeatherAlert
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/30 text-white shadow-xl">
      {/* Top Weather Alert Ribbon (if active) */}
      {hasWeatherAlert && (
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b border-amber-500/30 px-4 py-1 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CloudRain className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-semibold text-amber-300">Live Weather & Road Advisory:</span>
            <span className="truncate">
              Monsoon showers affecting high-elevation trails in Lantapan (Mt. Kitanglad) & river basin in San Fernando. Check real-time road accessibility before departure.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('explore')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/40">
            <span className="text-xl">🏔️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
                BUKIDNON TOURISM
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                PROVINCIAL PORTAL
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 hidden md:block">
              Verified Real-Time Operating Status, Map Navigation & Booking
            </p>
          </div>
        </div>

        {/* Center Role Switcher (Tourist vs Owner vs Admin) */}
        <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 flex items-center shadow-inner">
          <button
            onClick={() => onSelectRole('tourist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentRole === 'tourist'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tourist</span>
          </button>

          <button
            onClick={() => onSelectRole('owner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentRole === 'owner'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Manage Dahilayan Adventure Park or your registered spot"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spot Owner</span>
            <span className="sm:hidden">Owner</span>
          </button>

          <button
            onClick={() => onSelectRole('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
            title="Provincial Tourism Admin Verification & Control"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Right Action Tools for Tourists / Quick Navigation */}
        <div className="flex items-center gap-2">
          {currentRole === 'tourist' && (
            <>
              {/* Trip Planner Tool Button */}
              <button
                onClick={onOpenTripPlanner}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trip Planner</span>
              </button>

              {/* Budget Estimator Tool Button */}
              <button
                onClick={onOpenBudget}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Budget Estimator</span>
              </button>

              {/* My Bookings Pill */}
              <button
                onClick={onOpenBookings}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-xs font-semibold text-emerald-200 border border-emerald-600/40 transition shadow-sm"
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">My Bookings</span>
                {bookingsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 font-bold text-[10px] flex items-center justify-center shadow">
                    {bookingsCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* AI Tourism Chatbot Trigger Pill */}
          <button
            onClick={onToggleChatbot}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition shadow-lg ${
              isChatbotOpen
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI Guide</span>
            <span className="sm:hidden">AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
