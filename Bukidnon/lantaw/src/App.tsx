import React, { useState } from 'react';
import { TouristSpot, Booking, SpotReport, UserRole, CalculatedRoute, SpotCategory } from './types';
import { 
  INITIAL_TOURIST_SPOTS, 
  INITIAL_BOOKINGS, 
  INITIAL_REPORTS, 
  MUNICIPALITIES_LIST 
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { IllustratedMap } from './components/IllustratedMap';
import { SpotDetailModal } from './components/SpotDetailModal';
import { DirectionsModal } from './components/DirectionsModal';
import { BookingModal } from './components/BookingModal';
import { ReportModal } from './components/ReportModal';
import { LantawChatbot } from './components/LantawChatbot';
import { BudgetEstimator } from './components/BudgetEstimator';
import { TripPlanner } from './components/TripPlanner';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TouristBookingsView } from './components/TouristBookingsView';
import { 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ShieldCheck, 
  CloudRain, 
  Sun, 
  Car, 
  Filter, 
  Compass,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORIES_LIST: (SpotCategory | 'All')[] = [
  'All',
  'Adventure',
  'Agro-Tourism & Farms',
  'Mountains & Trekking',
  'Waterfalls & Springs',
  'Nature & Eco-parks',
  'Culture & Heritage',
  'Camping & Viewpoints',
];

export default function App() {
  // Core Platform State
  const [spots, setSpots] = useState<TouristSpot[]>(INITIAL_TOURIST_SPOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reports, setReports] = useState<SpotReport[]>(INITIAL_REPORTS);
  
  // Navigation & Role State
  const [role, setRole] = useState<UserRole>('tourist');
  const [activeView, setActiveView] = useState<'map' | 'bookings' | 'owner' | 'admin'>('map');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('All Municipalities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'limited' | 'closed'>('all');

  // Map Layer States
  const [showWeatherLayer, setShowWeatherLayer] = useState<boolean>(false);
  const [showRoadLayer, setShowRoadLayer] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<CalculatedRoute | null>(null);

  // Modal Dialog States
  const [selectedSpotForDetails, setSelectedSpotForDetails] = useState<TouristSpot | null>(null);
  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState<TouristSpot | null>(null);
  const [selectedSpotForDirections, setSelectedSpotForDirections] = useState<TouristSpot | null>(null);
  const [selectedSpotForReport, setSelectedSpotForReport] = useState<TouristSpot | null>(null);
  const [selectedMapSpot, setSelectedMapSpot] = useState<TouristSpot | null>(null);

  // Tool Modals
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isBudgetEstimatorOpen, setIsBudgetEstimatorOpen] = useState<boolean>(false);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState<boolean>(false);

  // Handlers for Tourist Spot Owner actions
  const handleUpdateSpot = (updatedSpot: TouristSpot) => {
    setSpots((prev) => prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s)));
    // If selected on map or modal, keep in sync
    if (selectedMapSpot?.id === updatedSpot.id) setSelectedMapSpot(updatedSpot);
    if (selectedSpotForDetails?.id === updatedSpot.id) setSelectedSpotForDetails(updatedSpot);
  };

  // Handlers for Bookings
  const handleSubmitBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status'], reason?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status,
              rejectionReason: reason,
            }
          : b
      )
    );
  };

  // Handlers for Reports
  const handleSubmitReport = (newReport: SpotReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleResolveReport = (reportId: string, resolution: 'resolved' | 'rejected', notes: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: resolution,
              adminNotes: notes,
              resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            }
          : r
      )
    );
  };

  const handleToggleVerification = (spotId: string) => {
    setSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, isVerified: !s.isVerified } : s))
    );
  };

  // Filtered spots for the lower exploration directory
  const directorySpots = spots.filter((spot) => {
    const matchesCat = selectedCategory === 'All' || spot.category === selectedCategory;
    const matchesMun = selectedMunicipality === 'All Municipalities' || spot.municipality.toLowerCase().includes(selectedMunicipality.toLowerCase());
    const matchesStat = statusFilter === 'all' || spot.operatingStatus === statusFilter;
    const matchesSearch =
      !searchQuery ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesMun && matchesStat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navbar with Role Switcher & Weather Advisory */}
      <Navbar
        currentRole={role}
        onChangeRole={setRole}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenBudgetEstimator={() => setIsBudgetEstimatorOpen(true)}
        onOpenTripPlanner={() => setIsTripPlannerOpen(true)}
        bookingsCount={bookings.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-8">
        
        {/* ========================================================================= */}
        {/* VIEW 1: OWNER DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {activeView === 'owner' && (
          <OwnerDashboard
            spots={spots}
            bookings={bookings}
            onUpdateSpot={handleUpdateSpot}
            onUpdateBookingStatus={handleUpdateBookingStatus}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ADMIN DASHBOARD VIEW */}
        {/* ========================================================================= */}
        {activeView === 'admin' && (
          <AdminDashboard
            spots={spots}
            reports={reports}
            bookings={bookings}
            onToggleVerification={handleToggleVerification}
            onResolveReport={handleResolveReport}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: TOURIST MY BOOKINGS VIEW */}
        {/* ========================================================================= */}
        {activeView === 'bookings' && (
          <TouristBookingsView
            bookings={bookings}
            spots={spots}
            onOpenDirections={(s) => setSelectedSpotForDirections(s)}
            onOpenSpotDetails={(s) => setSelectedSpotForDetails(s)}
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: MAIN INTERACTIVE MAP & ATTRACTIONS DIRECTORY */}
        {/* ========================================================================= */}
        {activeView === 'map' && (
          <div className="space-y-6">
            
            {/* Map Header & Controls Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                    Lantaw Illustrated Tourism Map
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    Bukidnon Highlands
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Explore 3D highland landmarks, live operating statuses, weather radar, and Sayre Highway navigation.
                </p>
              </div>

              {/* Active Route Dismiss Button if a route is displayed */}
              {activeRoute && (
                <div className="flex items-center gap-2 p-2.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 self-start md:self-auto shadow-xs">
                  <Navigation className="w-4 h-4 text-sky-600 animate-pulse" />
                  <span>
                    Route to <strong>{activeRoute.destination.name}</strong> ({activeRoute.durationFormatted})
                  </span>
                  <button
                    onClick={() => setActiveRoute(null)}
                    className="ml-2 text-slate-600 hover:text-slate-900 bg-white border border-sky-200 px-2 py-0.5 rounded-lg font-bold"
                  >
                    Clear Route
                  </button>
                </div>
              )}
            </div>

            {/* THE ILLUSTRATED MAP COMPONENT */}
            <IllustratedMap
              spots={spots}
              selectedSpot={selectedMapSpot}
              onSelectSpot={(spot) => setSelectedMapSpot(spot)}
              onOpenDetails={(spot) => setSelectedSpotForDetails(spot)}
              onOpenBooking={(spot) => setSelectedSpotForBooking(spot)}
              onOpenDirections={(spot) => setSelectedSpotForDirections(spot)}
              activeRoute={activeRoute}
              showWeatherLayer={showWeatherLayer}
              onToggleWeatherLayer={() => setShowWeatherLayer(!showWeatherLayer)}
              showRoadLayer={showRoadLayer}
              onToggleRoadLayer={() => setShowRoadLayer(!showRoadLayer)}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />

            {/* Category Filter Chips & Status Filters */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Filter className="w-4 h-4 text-emerald-700" />
                  <span>Filter Attractions by Category</span>
                </div>

                {/* Status Quick Filter (Open / Limited / Closed) */}
                <div className="flex items-center gap-1.5 text-xs bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold pl-2">Status:</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      statusFilter === 'all' ? 'bg-[#1B3022] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    All ({spots.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('open')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      statusFilter === 'open' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    🟢 Open ({spots.filter(s => s.operatingStatus === 'open').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('limited')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      statusFilter === 'limited' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    🟡 Limited ({spots.filter(s => s.operatingStatus === 'limited').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('closed')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      statusFilter === 'closed' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    🔴 Closed ({spots.filter(s => s.operatingStatus === 'closed').length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CATEGORIES_LIST.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition border ${
                      selectedCategory === cat
                        ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Municipality Selector Dropdown */}
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-bold text-slate-700 shrink-0">Municipality / Corridor:</span>
              <select
                id="select-municipality-filter"
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {MUNICIPALITIES_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Showing {directorySpots.length} matching verified attractions
              </span>
            </div>

            {/* ========================================================================= */}
            {/* ATTRACTIONS DIRECTORY GRID */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-800 font-display">
                  Verified Bukidnon Attractions Directory ({directorySpots.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {directorySpots.map((spot) => (
                  <div
                    key={spot.id}
                    id={`spot-card-${spot.id}`}
                    className="bg-white border border-slate-200 hover:border-emerald-600/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                  >
                    {/* Thumbnail & Badges */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={spot.thumbnail}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                          spot.operatingStatus === 'open'
                            ? 'bg-emerald-600 text-white'
                            : spot.operatingStatus === 'limited'
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {spot.operatingStatus === 'open' && '🟢 OPEN'}
                          {spot.operatingStatus === 'limited' && '🟡 LIMITED'}
                          {spot.operatingStatus === 'closed' && '🔴 CLOSED'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold rounded-full border border-slate-200/80 shadow-xs">
                          {spot.category}
                        </span>
                      </div>

                      {/* Verification Badge */}
                      {spot.isVerified && (
                        <div className="absolute top-3 right-3 p-1.5 bg-white/95 backdrop-blur-md text-sky-600 rounded-full border border-sky-200 shadow-xs" title="Verified Attraction">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}

                      {/* Location Name Over Banner */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{spot.municipality}</span>
                        </span>
                        <span className="font-bold text-slate-900 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                          {spot.entranceFee.adult > 0 ? `₱${spot.entranceFee.adult} Entrance` : 'Free Entrance'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition font-display">
                          {spot.name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {spot.description}
                        </p>
                      </div>

                      {/* Weather & Road Condition Quick Tag */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="text-slate-400 font-bold uppercase text-[9px]">Weather</div>
                          <div className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                            <span>{spot.weather.condition.includes('Rain') ? '🌧️' : '☀️'}</span>
                            <span className="truncate">{spot.weather.condition} ({spot.weather.tempC}°C)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 font-bold uppercase text-[9px]">Accessibility</div>
                          <div className={`font-semibold truncate mt-0.5 ${
                            spot.accessibilityStatus === 'accessible'
                              ? 'text-emerald-700'
                              : spot.accessibilityStatus === 'limited'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}>
                            {spot.accessibilityStatus === 'accessible' ? '🟢 Clear' : spot.accessibilityStatus === 'limited' ? '🟡 4x4 Trail' : '🔴 Restricted'}
                          </div>
                        </div>
                      </div>

                      {/* Last Updated Timestamp by Owner */}
                      <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{spot.lastUpdated}</span>
                        </span>
                        <span className="text-emerald-700 font-semibold">By {spot.updatedBy}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          id={`btn-card-details-${spot.id}`}
                          onClick={() => setSelectedSpotForDetails(spot)}
                          className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition text-center border border-slate-200"
                        >
                          Details
                        </button>
                        <button
                          id={`btn-card-directions-${spot.id}`}
                          onClick={() => setSelectedSpotForDirections(spot)}
                          className="px-2 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Route</span>
                        </button>
                        <button
                          id={`btn-card-book-${spot.id}`}
                          onClick={() => setSelectedSpotForBooking(spot)}
                          disabled={spot.operatingStatus === 'closed'}
                          className={`px-2 py-2 rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1 ${
                            spot.operatingStatus === 'closed'
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Book</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-800 tracking-wider font-display">LANTAW BUKIDNON</span>
            <span>• Verified Provincial Tourism & Discovery Platform</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Operating Statuses and Accessibility Conditions are directly owner-verified and updated in real time.
          </p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS */}
      {/* ========================================================================= */}
      
      {/* 1. Tourist Spot Details Modal */}
      {selectedSpotForDetails && (
        <SpotDetailModal
          spot={selectedSpotForDetails}
          onClose={() => setSelectedSpotForDetails(null)}
          onBookNow={(s) => {
            setSelectedSpotForDetails(null);
            setSelectedSpotForBooking(s);
          }}
          onGetDirections={(s) => {
            setSelectedSpotForDetails(null);
            setSelectedSpotForDirections(s);
          }}
          onReportInfo={(s) => {
            setSelectedSpotForDetails(null);
            setSelectedSpotForReport(s);
          }}
        />
      )}

      {/* 2. Google Maps-style Directions Modal */}
      {selectedSpotForDirections && (
        <DirectionsModal
          spot={selectedSpotForDirections}
          onClose={() => setSelectedSpotForDirections(null)}
          onApplyRouteToMap={(r) => {
            setActiveRoute(r);
            setActiveView('map');
          }}
        />
      )}

      {/* 3. Booking Modal */}
      {selectedSpotForBooking && (
        <BookingModal
          spot={selectedSpotForBooking}
          onClose={() => setSelectedSpotForBooking(null)}
          onSubmitBooking={handleSubmitBooking}
        />
      )}

      {/* 4. Inaccurate Information Report Modal */}
      {selectedSpotForReport && (
        <ReportModal
          spot={selectedSpotForReport}
          onClose={() => setSelectedSpotForReport(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* 5. Lantaw Chatbot (Strict Bukidnon Scope & Anti-Hallucination) */}
      <LantawChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        spots={spots}
        onSelectSpot={(s) => {
          setSelectedMapSpot(s);
          setSelectedSpotForDetails(s);
          setActiveView('map');
        }}
      />

      {/* 6. Budget Estimator Modal */}
      <BudgetEstimator
        isOpen={isBudgetEstimatorOpen}
        onClose={() => setIsBudgetEstimatorOpen(false)}
      />

      {/* 7. Trip Planner Modal */}
      <TripPlanner
        isOpen={isTripPlannerOpen}
        onClose={() => setIsTripPlannerOpen(false)}
        spots={spots}
        onSelectSpot={(s) => {
          setSelectedMapSpot(s);
          setSelectedSpotForDetails(s);
          setActiveView('map');
        }}
      />

    </div>
  );
}
