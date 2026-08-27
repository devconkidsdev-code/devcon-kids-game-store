import React from 'react';
import { UserRole } from '../types';
import { 
  Compass, 
  Bot, 
  Coins, 
  Map, 
  Ticket, 
  Building2, 
  ShieldCheck, 
  User, 
  AlertTriangle,
  CloudRain,
  ChevronDown,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeView: 'map' | 'bookings' | 'owner' | 'admin';
  onChangeView: (view: 'map' | 'bookings' | 'owner' | 'admin') => void;
  onOpenChatbot: () => void;
  onOpenBudgetEstimator: () => void;
  onOpenTripPlanner: () => void;
  bookingsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  activeView,
  onChangeView,
  onOpenChatbot,
  onOpenBudgetEstimator,
  onOpenTripPlanner,
  bookingsCount,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      
      {/* Top Province Weather & Advisory Live Ticker with Deep Geometric Forest Green */}
      <div className="bg-[#16281D] py-1.5 px-4 text-[11px] text-emerald-100/90 border-b border-[#233F2E] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>LIVE BUKIDNON ADVISORY</span>
          </span>
          <span className="truncate text-slate-200 text-[11px] font-medium">
            🌧️ Rain showers over Mt. Kitanglad ridge (Lantapan road slippery) • Sayre National Highway clear and passable from Manolo Fortich to Maramag • Dahilayan open (21°C)
          </span>
        </div>

        {/* Role Switcher in Top Bar */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="text-slate-300 text-[10px] uppercase font-bold hidden sm:inline tracking-wider">Active Mode:</span>
          <div className="flex items-center bg-[#0D1812] rounded-lg p-0.5 border border-[#233F2E]">
            <button
              id="role-btn-tourist"
              onClick={() => {
                onChangeRole('tourist');
                onChangeView('map');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                currentRole === 'tourist' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-2.5 h-2.5" />
              <span>Tourist</span>
            </button>
            <button
              id="role-btn-owner"
              onClick={() => {
                onChangeRole('owner');
                onChangeView('owner');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                currentRole === 'owner' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-2.5 h-2.5" />
              <span>Spot Owner</span>
            </button>
            <button
              id="role-btn-admin"
              onClick={() => {
                onChangeRole('admin');
                onChangeView('admin');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                currentRole === 'admin' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onChangeView('map')}
          >
            {/* Lantaw Custom Geometric Logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B3022] to-emerald-700 flex items-center justify-center text-white shadow-sm border border-emerald-600/30">
              <Compass className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">LANTAW</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-200">
                  Bukidnon
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-tight font-medium">Verified Highland Tourism & Discovery Platform</p>
            </div>
          </div>

          {/* Mobile Search / Chat Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenChatbot}
              className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs"
              title="Lantaw AI Assistant"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input on Desktop */}
        <div className="relative flex-1 max-w-sm hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search attractions, municipalities (e.g. Dahilayan)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-slate-400 text-xs hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Primary Action Buttons & Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold no-scrollbar">
          
          <button
            id="nav-btn-explore-map"
            onClick={() => onChangeView('map')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeView === 'map'
                ? 'bg-[#1B3022] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>

          <button
            id="nav-btn-trip-planner"
            onClick={onOpenTripPlanner}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" />
            <span>3-Day Itinerary</span>
          </button>

          <button
            id="nav-btn-budget-tool"
            onClick={onOpenBudgetEstimator}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>Budget Planner</span>
          </button>

          <button
            id="nav-btn-my-bookings"
            onClick={() => onChangeView('bookings')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeView === 'bookings'
                ? 'bg-[#1B3022] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
            <span>My Bookings</span>
            {bookingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                {bookingsCount}
              </span>
            )}
          </button>

          {/* AI Assistant Chat Button */}
          <button
            id="nav-btn-open-chatbot"
            onClick={onOpenChatbot}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0 font-bold"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Lantaw AI Guide</span>
          </button>

        </div>
      </div>
    </header>
  );
};
