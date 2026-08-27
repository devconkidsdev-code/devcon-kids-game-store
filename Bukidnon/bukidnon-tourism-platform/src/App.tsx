import React, { useState } from 'react';
import { UserRole, TouristSpot, Booking, InaccuracyReport } from './types';
import { INITIAL_SPOTS, INITIAL_BOOKINGS, INITIAL_REPORTS } from './data/bukidnonData';
import { Navbar } from './components/Navbar';
import { TouristExploreView } from './components/TouristExploreView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SpotDetailModal } from './components/SpotDetailModal';
import { DirectionsModal } from './components/DirectionsModal';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { ReportInaccuracyModal } from './components/ReportInaccuracyModal';
import { BudgetEstimatorModal } from './components/BudgetEstimatorModal';
import { TripPlannerModal } from './components/TripPlannerModal';
import { BukidnonChatbot } from './components/BukidnonChatbot';
import { 
  Compass, 
  Store, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  CheckCircle2, 
  Sparkles,
  CloudRain
} from 'lucide-react';

export default function App() {
  // Master Application State
  const [currentRole, setCurrentRole] = useState<UserRole>('tourist');
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [spots, setSpots] = useState<TouristSpot[]>(INITIAL_SPOTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reports, setReports] = useState<InaccuracyReport[]>(INITIAL_REPORTS);
  const [hasWeatherAlert, setHasWeatherAlert] = useState<boolean>(true);

  // Active Map Route line
  const [activeRoute, setActiveRoute] = useState<{
    originName: string;
    destinationName: string;
    pathPoints: { x: number; y: number }[];
    distanceKm: number;
    durationMins: number;
    hasWarning?: boolean;
    warningText?: string;
  } | null>(null);

  // Modals visibility state
  const [detailModalSpot, setDetailModalSpot] = useState<TouristSpot | null>(null);
  const [bookingModalSpot, setBookingModalSpot] = useState<TouristSpot | null>(null);
  const [directionsModalSpot, setDirectionsModalSpot] = useState<TouristSpot | null>(null);
  const [reportModalSpot, setReportModalSpot] = useState<TouristSpot | null>(null);
  
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState<boolean>(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // SPOT UPDATE HANDLER (Single Source of Truth across Tourist, Owner, Admin)
  const handleUpdateSpot = (updatedSpot: TouristSpot) => {
    setSpots((prev) =>
      prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s))
    );
    // Also sync detail modal if currently looking at this spot
    if (detailModalSpot && detailModalSpot.id === updatedSpot.id) {
      setDetailModalSpot(updatedSpot);
    }
  };

  // BOOKING HANDLERS
  const handleNewBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: Booking['status'],
    rejectionReason?: string
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status,
              rejectionReason: rejectionReason || b.rejectionReason
            }
          : b
      )
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  // REPORT HANDLERS
  const handleNewReport = (newReport: InaccuracyReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleResolveReport = (
    reportId: string,
    resolutionAction: 'resolved' | 'dismissed'
  ) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: resolutionAction === 'resolved' ? 'resolved' : 'rejected',
              resolvedAt: 'Just now'
            }
          : r
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={(role) => setCurrentRole(role)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        bookingsCount={bookings.filter((b) => b.status === 'approved' || b.status === 'pending').length}
        onOpenBookings={() => setIsMyBookingsOpen(true)}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenTripPlanner={() => setIsTripPlannerOpen(true)}
        onToggleChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
        isChatbotOpen={isChatbotOpen}
        hasWeatherAlert={hasWeatherAlert}
      />

      {/* Main Content Area Based on Current Selected Role */}
      <main className="flex-1">
        {currentRole === 'tourist' && (
          <TouristExploreView
            spots={spots}
            activeRoute={activeRoute}
            onClearRoute={() => setActiveRoute(null)}
            onSelectSpotForDetail={(spot) => setDetailModalSpot(spot)}
            onBookSpot={(spot) => setBookingModalSpot(spot)}
            onGetDirections={(spot) => setDirectionsModalSpot(spot)}
            onOpenBudget={() => setIsBudgetOpen(true)}
            onOpenTripPlanner={() => setIsTripPlannerOpen(true)}
          />
        )}

        {currentRole === 'owner' && (
          <OwnerDashboard
            spots={spots}
            bookings={bookings}
            onUpdateSpot={handleUpdateSpot}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onViewSpotAsTourist={(spot) => setDetailModalSpot(spot)}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            spots={spots}
            reports={reports}
            bookings={bookings}
            hasWeatherAlert={hasWeatherAlert}
            onToggleWeatherAlert={() => setHasWeatherAlert(!hasWeatherAlert)}
            onUpdateSpot={handleUpdateSpot}
            onResolveReport={handleResolveReport}
            onViewSpot={(spot) => setDetailModalSpot(spot)}
          />
        )}
      </main>

      {/* Modals Container */}
      {detailModalSpot && (
        <SpotDetailModal
          spot={detailModalSpot}
          onClose={() => setDetailModalSpot(null)}
          onBookNow={(spot) => {
            setDetailModalSpot(null);
            setBookingModalSpot(spot);
          }}
          onGetDirections={(spot) => {
            setDetailModalSpot(null);
            setDirectionsModalSpot(spot);
          }}
          onReportInaccuracy={(spot) => {
            setReportModalSpot(spot);
          }}
        />
      )}

      {directionsModalSpot && (
        <DirectionsModal
          spot={directionsModalSpot}
          onClose={() => setDirectionsModalSpot(null)}
          onApplyRouteToMap={(routeData) => {
            setActiveRoute(routeData);
            setCurrentRole('tourist');
          }}
        />
      )}

      {bookingModalSpot && (
        <BookingModal
          spot={bookingModalSpot}
          onClose={() => setBookingModalSpot(null)}
          onSubmitBooking={handleNewBooking}
        />
      )}

      {isMyBookingsOpen && (
        <MyBookingsModal
          bookings={bookings}
          onClose={() => setIsMyBookingsOpen(false)}
          onCancelBooking={handleCancelBooking}
        />
      )}

      {reportModalSpot && (
        <ReportInaccuracyModal
          spot={reportModalSpot}
          onClose={() => setReportModalSpot(null)}
          onSubmitReport={handleNewReport}
        />
      )}

      {isBudgetOpen && (
        <BudgetEstimatorModal
          spots={spots}
          onClose={() => setIsBudgetOpen(false)}
        />
      )}

      {isTripPlannerOpen && (
        <TripPlannerModal
          spots={spots}
          onClose={() => setIsTripPlannerOpen(false)}
          onSelectSpotForDetail={(spot) => setDetailModalSpot(spot)}
        />
      )}

      {/* Bukidnon Tourism Strict Domain AI Chatbot */}
      <BukidnonChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        spots={spots}
        onSelectSpot={(spot) => setDetailModalSpot(spot)}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenTripPlanner={() => setIsTripPlannerOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span>🏔️</span>
              <span>Province of Bukidnon Tourism Portal</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official real-time provincial tourism verification, map navigation, and verified booking network connecting travelers, spot operators, and the LGU.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Provincial Gateways</h4>
            <ul className="space-y-1 text-[11px]">
              <li>• Northern Hub: Manolo Fortich (Sayre Highway)</li>
              <li>• Central Capital: Malaybalay City (Capitol)</li>
              <li>• Commercial Hub: Valencia City</li>
              <li>• Southern Border: BuDa Highway (Davao Road)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Emergency & Assistance</h4>
            <ul className="space-y-1 text-[11px]">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Phone className="w-3.5 h-3.5" />
                <span>Tourism Hotline: (088) 813-5500</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5" />
                <span>tourism@bukidnon.gov.ph</span>
              </li>
              <li>• PNP Provincial Tourism Police Assistance Desk</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Portal Role Views</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setCurrentRole('tourist')}
                className="text-left text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                → Tourist Explorer & Interactive Map
              </button>
              <button
                onClick={() => setCurrentRole('owner')}
                className="text-left text-[11px] text-teal-400 hover:text-teal-300"
              >
                → Spot Owner Dashboard (Status & Bookings)
              </button>
              <button
                onClick={() => setCurrentRole('admin')}
                className="text-left text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                → Provincial Admin Governance Desk
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © 2026 Provincial Government of Bukidnon Tourism Information & Discovery System. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for the Highland Paradise of the Philippines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
