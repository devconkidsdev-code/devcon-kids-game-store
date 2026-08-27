import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  CloudSun, 
  Route, 
  Sparkles, 
  Compass, 
  X, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { soundscape } from '../utils/soundscape';

interface HeaderNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTripPlanner: () => void;
  onOpenPassport: () => void;
  savedItineraryCount: number;
}

export function HeaderNav({
  searchQuery,
  onSearchChange,
  onOpenTripPlanner,
  onOpenPassport,
  savedItineraryCount,
}: HeaderNavProps) {
  const [selectedWeatherCity, setSelectedWeatherCity] = useState<'malaybalay' | 'dahilayan' | 'valencia'>('malaybalay');

  const weatherData = {
    malaybalay: { temp: '21°C', condition: 'Cool Pine Breeze', elevation: '622m' },
    dahilayan: { temp: '17°C', condition: 'Misty Alpine Chill', elevation: '1,400m' },
    valencia: { temp: '24°C', condition: 'Golden Sunlight', elevation: '373m' },
  };

  const currentW = weatherData[selectedWeatherCity];

  return (
    <header className="h-[4.5rem] bg-white/90 border-b border-[#799F0C]/15 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 text-[#2D3436] z-40 relative shadow-xs">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#799F0C] flex items-center justify-center text-white shadow-md shadow-[#799F0C]/25 text-xl">
          <span>🍍</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-[#1E392A] uppercase">
              BUKIDNON<span className="text-[#799F0C]">EXPLORER</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#799F0C] bg-[#F5F9E8] px-2 py-0.5 rounded-full border border-[#799F0C]/20 hidden sm:inline-block">
              Highlands
            </span>
          </div>
          <p className="text-[11px] text-[#4A5A40] hidden md:block">Illustrated Tourism & Adventure Map</p>
        </div>
      </div>

      {/* Center Search Input with Instant Filtering */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#799F0C] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Dahilayan, Lake Apo, Kitanglad, Monk's coffee..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#F5F9E8] hover:bg-white focus:bg-white border border-[#799F0C]/25 rounded-2xl pl-10 pr-9 py-2 text-xs text-[#1E392A] placeholder-[#636E72] focus:outline-none focus:border-[#799F0C] transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-[#636E72] hover:text-[#1E392A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Side Tools & Controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Highland Weather Widget Popover */}
        <div
          onClick={() => {
            const nextCity = selectedWeatherCity === 'malaybalay' ? 'dahilayan' : selectedWeatherCity === 'dahilayan' ? 'valencia' : 'malaybalay';
            setSelectedWeatherCity(nextCity);
          }}
          className="hidden md:flex items-center gap-2.5 bg-[#F5F9E8] hover:bg-white px-3.5 py-1.5 rounded-xl border border-[#799F0C]/20 cursor-pointer transition-colors shadow-xs"
          title="Click to cycle Bukidnon weather stations (Malaybalay / Dahilayan / Valencia)"
        >
          <CloudSun className="w-4 h-4 text-[#F5B041]" />
          <div className="text-left leading-none">
            <div className="text-[11px] font-bold text-[#1E392A] flex items-center gap-1">
              <span>{selectedWeatherCity.toUpperCase()}</span>
              <span className="text-[#799F0C] font-extrabold">{currentW.temp}</span>
            </div>
            <span className="text-[9px] text-[#4A5A40]">{currentW.condition}</span>
          </div>
        </div>

        {/* Trip Planner Drawer Toggle */}
        <button
          id="open-trip-planner-nav-btn"
          onClick={onOpenTripPlanner}
          className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2D3436] hover:bg-[#1E392A] text-white text-xs font-semibold shadow-md shadow-[#2D3436]/20 transition-all active:scale-95"
        >
          <Route className="w-4 h-4 text-[#A7C957]" />
          <span className="hidden sm:inline">Trip Planner</span>
          {savedItineraryCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#799F0C] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {savedItineraryCount}
            </span>
          )}
        </button>

        {/* 7 Tribes Cultural Passport Trigger */}
        <button
          id="open-passport-nav-btn"
          onClick={onOpenPassport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#799F0C] hover:bg-[#688a09] text-white text-xs font-semibold shadow-md shadow-[#799F0C]/20 transition-transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FDFCF0]" />
          <span className="hidden sm:inline">7 Tribes</span>
        </button>
      </div>
    </header>
  );
}
