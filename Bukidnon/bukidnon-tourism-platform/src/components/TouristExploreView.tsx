import React, { useState, useRef } from 'react';
import { TouristSpot, SpotCategory, OperatingStatus } from '../types';
import { BukidnonMap, START_GATEWAYS } from './BukidnonMap';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Navigation, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Grid, 
  Map as MapIcon, 
  Columns, 
  ChevronRight,
  CloudRain,
  Tag,
  DollarSign,
  Compass,
  ArrowRight,
  Layers,
  Star,
  SlidersHorizontal,
  Flame,
  Info
} from 'lucide-react';

interface TouristExploreViewProps {
  spots: TouristSpot[];
  activeRoute: {
    originName: string;
    destinationName: string;
    pathPoints: { x: number; y: number }[];
    distanceKm: number;
    durationMins: number;
    hasWarning?: boolean;
    warningText?: string;
  } | null;
  onClearRoute: () => void;
  onSelectSpotForDetail: (spot: TouristSpot) => void;
  onBookSpot: (spot: TouristSpot) => void;
  onGetDirections: (spot: TouristSpot) => void;
  onOpenBudget: () => void;
  onOpenTripPlanner: () => void;
}

const CATEGORIES: ('All' | SpotCategory)[] = [
  'All',
  'Adventure',
  'Mountain/Hiking',
  'Waterfalls',
  'Nature & Lakes',
  'Agro-Farms',
  'Cultural/Heritage',
  'Springs & Resorts',
  'Scenic Overlooks'
];

export const TouristExploreView: React.FC<TouristExploreViewProps> = ({
  spots,
  activeRoute,
  onClearRoute,
  onSelectSpotForDetail,
  onBookSpot,
  onGetDirections,
  onOpenBudget,
  onOpenTripPlanner
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | SpotCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'free'>('all');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('All');
  const [viewLayout, setViewLayout] = useState<'hero-map' | 'split' | 'grid'>('hero-map');
  
  // Focused spot on the map
  const [focusedSpot, setFocusedSpot] = useState<TouristSpot | null>(null);
  const [internalActiveRoute, setInternalActiveRoute] = useState<{
    originName: string;
    destinationName: string;
    pathPoints: { x: number; y: number }[];
    distanceKm: number;
    durationMins: number;
    hasWarning?: boolean;
    warningText?: string;
  } | null>(activeRoute);

  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Extract unique municipalities
  const municipalities = ['All', ...Array.from(new Set(spots.map((s) => s.municipality)))].sort();

  // Filtering Logic
  const filteredSpots = spots.filter((spot) => {
    const matchesSearch =
      spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || spot.category === selectedCategory;
    const matchesMuni = selectedMunicipality === 'All' || spot.municipality === selectedMunicipality;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
        ? spot.operatingStatus === 'open'
        : spot.entranceFee === 0;

    return matchesSearch && matchesCategory && matchesMuni && matchesStatus;
  });

  // Direct Click-to-Navigate Handler:
  // Automatically scrolls to map, centers on spot, computes active route, and opens detail popup
  const handleDirectNavigate = (spot: TouristSpot, originId: string = 'malaybalay') => {
    setFocusedSpot(spot);

    // Find origin gateway
    const origin = START_GATEWAYS.find((g) => g.id === originId) || START_GATEWAYS[1];

    // Compute route parameters
    const dx = spot.coords.x - origin.coords.x;
    const dy = spot.coords.y - origin.coords.y;
    const baseDistanceKm = Math.max(12, Math.round(Math.sqrt(dx * dx + dy * dy) * 0.45));
    const speedMult = 1.0;
    const roadPenalty = spot.accessibilityStatus === 'limited' ? 1.3 : spot.accessibilityStatus === 'inaccessible' ? 2.0 : 1.0;
    const durationMins = Math.round((baseDistanceKm / 45) * 60 / speedMult * roadPenalty);

    // Intermediate midpoint along Sayre corridor
    const midX = 265;
    const midY = (origin.coords.y + spot.coords.y) / 2;

    const routeData = {
      originName: origin.name.split('(')[0].trim(),
      destinationName: spot.name,
      pathPoints: [
        { x: origin.coords.x, y: origin.coords.y },
        { x: midX, y: midY },
        { x: spot.coords.x, y: spot.coords.y }
      ],
      distanceKm: baseDistanceKm,
      durationMins: durationMins,
      hasWarning: spot.accessibilityStatus !== 'accessible' || spot.weather.rainProbability > 50,
      warningText: spot.accessibilityReason || (spot.weather.rainProbability > 50 ? 'Heavy rain detected on mountain route.' : undefined)
    };

    setInternalActiveRoute(routeData);

    // If on grid view, switch to hero-map or split view so the user immediately sees the map animation
    if (viewLayout === 'grid') {
      setViewLayout('hero-map');
    }

    // Scroll smoothly to map container
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleClearRoute = () => {
    setInternalActiveRoute(null);
    setFocusedSpot(null);
    onClearRoute();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6 animate-in fade-in duration-300">
      
      {/* Map Highlight Banner & Quick Navigation Stats */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Bukidnon 2D & 3D Cartoon Adventure Atlas
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Interactive 2D & 3D Isometric Tourism Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Explore 20+ municipalities with cartoon mountain peaks (Mt. Kitanglad, Mt. Kalatungan), floating clouds, Del Monte pineapple landmarks, Sayre highway live status, and instant click-to-fly navigation. Toggle between <strong className="text-emerald-400">3D Isometric</strong> and <strong className="text-teal-400">2D Illustrated</strong> view!
            </p>
          </div>

          {/* Quick Stats Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl text-center min-w-[90px]">
              <div className="text-emerald-400 text-base sm:text-lg font-black">{spots.length}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Destinations</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl text-center min-w-[90px]">
              <div className="text-emerald-400 text-base sm:text-lg font-black">22</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Municipalities</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl text-center min-w-[90px]">
              <div className="text-emerald-400 text-base sm:text-lg font-black">
                {spots.filter((s) => s.operatingStatus === 'open').length}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Open Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY HIGHLIGHT: THE INTERACTIVE BUKIDNON MAP */}
      <div ref={mapSectionRef} className="space-y-3">
        <BukidnonMap
          spots={filteredSpots}
          selectedSpot={focusedSpot}
          onSelectSpot={(spot) => setFocusedSpot(spot)}
          onSelectSpotForDetail={onSelectSpotForDetail}
          onBookSpot={onBookSpot}
          activeRoute={internalActiveRoute || activeRoute}
          onClearRoute={handleClearRoute}
          onNavigateToSpot={(spot, originId) => handleDirectNavigate(spot, originId)}
          highlightCategory={selectedCategory}
        />
      </div>

      {/* Filter, Search & Layout Switcher Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by spot name, activities (zipline, rafting, caving), municipality..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Municipality Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {municipalities.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? '📍 All Municipalities' : `📍 ${m}`}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">⚡ All Statuses</option>
              <option value="open">🟢 Open Today Only</option>
              <option value="free">🎟️ Free Entrance Only</option>
            </select>

            {/* Layout Switcher */}
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center">
              <button
                onClick={() => setViewLayout('hero-map')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewLayout === 'hero-map'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Hero Map with Bottom Spot Cards"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map Centric</span>
              </button>
              <button
                onClick={() => setViewLayout('split')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewLayout === 'split'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Split List & Side Map"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewLayout('grid')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewLayout === 'grid'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Cards Grid Only"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Horizontal Scroll Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <div>
          Showing <strong className="text-white">{filteredSpots.length}</strong> verified tourist spots in Bukidnon
          {selectedCategory !== 'All' && <span> under <strong className="text-emerald-400">{selectedCategory}</strong></span>}
          {selectedMunicipality !== 'All' && <span> in <strong className="text-emerald-400">{selectedMunicipality}</strong></span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Open Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Limited Ops
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span> Temporarily Closed
          </span>
        </div>
      </div>

      {/* Spot Cards Presentation Based on Active Layout */}
      {viewLayout === 'hero-map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📍</span> Explore All Bukidnon Tourist Destinations ({filteredSpots.length})
            </h2>
            <span className="text-xs text-slate-400">
              Click <Navigation className="w-3 h-3 inline text-emerald-400" /> on any card to fly on map
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isSelected={focusedSpot?.id === spot.id}
                onSelectDetail={() => onSelectSpotForDetail(spot)}
                onBook={() => onBookSpot(spot)}
                onGetDirections={() => handleDirectNavigate(spot)}
              />
            ))}
          </div>
        </div>
      )}

      {viewLayout === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Cards List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredSpots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                isSelected={focusedSpot?.id === spot.id}
                onSelectDetail={() => onSelectSpotForDetail(spot)}
                onBook={() => onBookSpot(spot)}
                onGetDirections={() => handleDirectNavigate(spot)}
              />
            ))}
          </div>

          {/* Right Sticky Summary & Map Card (5 Cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Selected Destination Tracker</span>
              </h3>
              {focusedSpot ? (
                <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={focusedSpot.images[0]}
                      alt={focusedSpot.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{focusedSpot.name}</div>
                      <div className="text-[11px] text-emerald-400">{focusedSpot.municipality}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {focusedSpot.entranceFee === 0 ? 'FREE Entrance' : `₱${focusedSpot.entranceFee} Entrance`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectSpotForDetail(focusedSpot)}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onBookSpot(focusedSpot)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                    >
                      Book Pass
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Select any pin on the map or click the navigation icon on a card to view live metrics.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {viewLayout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              isSelected={focusedSpot?.id === spot.id}
              onSelectDetail={() => onSelectSpotForDetail(spot)}
              onBook={() => onBookSpot(spot)}
              onGetDirections={() => handleDirectNavigate(spot)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Reusable Spot Card Component with Direct Navigation Action
interface SpotCardProps {
  spot: TouristSpot;
  isSelected?: boolean;
  onSelectDetail: () => void;
  onBook: () => void;
  onGetDirections: () => void;
}

const SpotCard: React.FC<SpotCardProps> = ({
  spot,
  isSelected,
  onSelectDetail,
  onBook,
  onGetDirections
}) => {
  return (
    <div
      className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col group ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
          : 'border-slate-800 hover:border-emerald-500/50'
      }`}
    >
      {/* Spot Photo Container */}
      <div
        className="relative w-full h-48 overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
        onClick={onSelectDetail}
      >
        <img
          src={spot.images[0]}
          alt={spot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

        {/* Operating Status Floating Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md uppercase border ${
              spot.operatingStatus === 'open'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                : spot.operatingStatus === 'limited'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                : 'bg-red-950/90 text-red-300 border-red-500/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                spot.operatingStatus === 'open'
                  ? 'bg-emerald-400 animate-pulse'
                  : spot.operatingStatus === 'limited'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
              }`}
            />
            {spot.operatingStatus === 'open' ? 'Open Today' : spot.operatingStatus}
          </span>
        </div>

        {/* LGU Verified Seal & Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700 text-[11px] text-amber-300 font-bold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{spot.rating}</span>
        </div>

        {/* Category Pill on Image Bottom */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-200 bg-slate-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
            {spot.category}
          </span>
          {spot.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-500/40 text-[10px] font-semibold">
              <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
              LGU
            </span>
          )}
        </div>
      </div>

      {/* Spot Card Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {spot.municipality}, Bukidnon
            </span>
            <span className="font-bold text-amber-300 text-xs font-mono">
              {spot.entranceFee === 0 ? 'FREE Entry' : `₱${spot.entranceFee} Entry`}
            </span>
          </div>

          <h3
            onClick={onSelectDetail}
            className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer tracking-tight line-clamp-1"
          >
            {spot.name}
          </h3>

          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            {spot.description}
          </p>

          {/* Specs Strip */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              ⛅ {spot.weather.temp}°C ({spot.weather.rainProbability}% Rain)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {spot.operatingHours.split('(')[0]}
            </span>
          </div>
        </div>

        {/* Bottom Actions: Click Navigation Icon to Fly on Map */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={onSelectDetail}
            className="text-xs font-semibold text-slate-300 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>Full Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Direct Navigation Button */}
            <button
              onClick={onGetDirections}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition flex items-center gap-1 text-xs font-bold border border-slate-700 shadow"
              title="Navigate & Fly on Map"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
              <span>Map & Route</span>
            </button>

            <button
              onClick={onBook}
              disabled={spot.operatingStatus === 'closed'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow ${
                spot.operatingStatus === 'closed'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/30'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-950" />
              <span>Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
