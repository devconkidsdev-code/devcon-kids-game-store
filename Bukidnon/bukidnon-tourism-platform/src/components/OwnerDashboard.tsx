import React, { useState } from 'react';
import { TouristSpot, Booking } from '../types';
import { 
  Store, 
  Settings, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Plus, 
  DollarSign, 
  Eye, 
  ShieldCheck, 
  Send,
  Navigation,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OwnerDashboardProps {
  spots: TouristSpot[];
  bookings: Booking[];
  onUpdateSpot: (updatedSpot: TouristSpot) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status'], reason?: string) => void;
  onViewSpotAsTourist: (spot: TouristSpot) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  spots,
  bookings,
  onUpdateSpot,
  onUpdateBookingStatus,
  onViewSpotAsTourist
}) => {
  // Default to Dahilayan Adventure Park (Spot ID 1)
  const [selectedSpotId, setSelectedSpotId] = useState<number>(1);
  const currentSpot = spots.find((s) => s.id === selectedSpotId) || spots[0];

  // Editable local states
  const [operatingStatus, setOperatingStatus] = useState<TouristSpot['operatingStatus']>(currentSpot.operatingStatus);
  const [operatingStatusReason, setOperatingStatusReason] = useState<string>(currentSpot.operatingStatusReason);
  const [accessibilityStatus, setAccessibilityStatus] = useState<TouristSpot['accessibilityStatus']>(currentSpot.accessibilityStatus);
  const [accessibilityReason, setAccessibilityReason] = useState<string>(currentSpot.accessibilityReason);
  const [entranceFee, setEntranceFee] = useState<number>(currentSpot.entranceFee);
  const [operatingHours, setOperatingHours] = useState<string>(currentSpot.operatingHours);
  const [currentVisitors, setCurrentVisitors] = useState<number>(currentSpot.currentVisitorsToday);
  const [maxCapacity, setMaxCapacity] = useState<number>(currentSpot.maxDailyCapacity);
  
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  const [isSavedAlert, setIsSavedAlert] = useState<boolean>(false);

  // Sync state when spot selector changes
  const handleSelectSpot = (id: number) => {
    setSelectedSpotId(id);
    const spot = spots.find((s) => s.id === id) || spots[0];
    setOperatingStatus(spot.operatingStatus);
    setOperatingStatusReason(spot.operatingStatusReason);
    setAccessibilityStatus(spot.accessibilityStatus);
    setAccessibilityReason(spot.accessibilityReason);
    setEntranceFee(spot.entranceFee);
    setOperatingHours(spot.operatingHours);
    setCurrentVisitors(spot.currentVisitorsToday);
    setMaxCapacity(spot.maxDailyCapacity);
  };

  const handleSaveOperationalUpdates = () => {
    const updated: TouristSpot = {
      ...currentSpot,
      operatingStatus,
      operatingStatusReason,
      accessibilityStatus,
      accessibilityReason,
      entranceFee,
      operatingHours,
      currentVisitorsToday: currentVisitors,
      maxDailyCapacity: maxCapacity,
      lastUpdated: 'Just now (Live)',
      updatedBy: `Owner: ${currentSpot.ownerName}`
    };

    onUpdateSpot(updated);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  // Filter bookings for this spot
  const spotBookings = bookings.filter((b) => b.spotId === currentSpot.id);
  const pendingBookings = spotBookings.filter((b) => b.status === 'pending');
  const approvedBookings = spotBookings.filter((b) => b.status === 'approved');

  const handleApprove = (bookingId: string) => {
    onUpdateBookingStatus(bookingId, 'approved');
  };

  const handleConfirmReject = (bookingId: string) => {
    onUpdateBookingStatus(bookingId, 'rejected', rejectionReasonText || 'Slot capacity reached or maintenance window.');
    setRejectingBookingId(null);
    setRejectionReasonText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Spot Picker */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-2xl shadow-lg">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-500/40 uppercase">
                Registered Operator Control Panel
              </span>
              <span className="text-xs text-slate-400">Owner: {currentSpot.ownerName}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              {currentSpot.name}
            </h1>
            <p className="text-xs text-teal-300/80">
              {currentSpot.municipality} • Verified LGU Partner
            </p>
          </div>
        </div>

        {/* Spot Switcher for demo */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="text-xs text-slate-300 font-medium whitespace-nowrap">Manage Spot:</div>
          <select
            value={selectedSpotId}
            onChange={(e) => handleSelectSpot(parseInt(e.target.value))}
            className="bg-slate-800 border border-teal-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
          >
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.municipality})
              </option>
            ))}
          </select>

          <button
            onClick={() => onViewSpotAsTourist(currentSpot)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {isSavedAlert && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Status, pricing & road accessibility updated across the entire Bukidnon network!</span>
          </div>
          <span className="text-[10px] text-emerald-400 uppercase">Live Broadcast Active</span>
        </div>
      )}

      {/* Main Grid: Left = Operations & Pricing Controls, Right = Incoming Bookings Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Real-Time Operational Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Real-time Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-white text-sm">Live Operating Status & Reason</h3>
              </div>
              <span className="text-[11px] text-slate-400">Single Source of Truth</span>
            </div>

            {/* Operating Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Select Current Operational State
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOperatingStatus('open')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition ${
                    operatingStatus === 'open'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">🟢</span>
                  <span>OPEN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperatingStatus('limited')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition ${
                    operatingStatus === 'limited'
                      ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">🟡</span>
                  <span>LIMITED</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOperatingStatus('closed')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition ${
                    operatingStatus === 'closed'
                      ? 'bg-red-950 border-red-500 text-red-300 shadow-md ring-1 ring-red-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">🔴</span>
                  <span>CLOSED</span>
                </button>
              </div>
            </div>

            {/* Operating Reason Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">
                Operational Note / Closure Reason (Broadcasted to Tourists & AI)
              </label>
              <input
                type="text"
                value={operatingStatusReason}
                onChange={(e) => setOperatingStatusReason(e.target.value)}
                placeholder="e.g., All attractions and rides operating normally under clear skies."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Road & Trail Accessibility Control */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                Access Road & Trail Passability
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessibilityStatus('accessible')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                    accessibilityStatus === 'accessible'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  🟢 Passable
                </button>
                <button
                  type="button"
                  onClick={() => setAccessibilityStatus('limited')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                    accessibilityStatus === 'limited'
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  🟡 Caution / 4WD
                </button>
                <button
                  type="button"
                  onClick={() => setAccessibilityStatus('inaccessible')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                    accessibilityStatus === 'inaccessible'
                      ? 'bg-red-950 border-red-500 text-red-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  🔴 Blocked / Closed
                </button>
              </div>

              <input
                type="text"
                value={accessibilityReason}
                onChange={(e) => setAccessibilityReason(e.target.value)}
                placeholder="e.g., Highway is paved and smooth. All vehicle types welcome."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mt-2"
              />
            </div>

            {/* Capacity & Price Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">General Entrance Fee (PHP)</label>
                <input
                  type="number"
                  value={entranceFee}
                  onChange={(e) => setEntranceFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-slate-400 font-bold block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Live Headcount Counter */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Today's Checked-In Visitors
                </span>
                <span className="text-lg font-black text-teal-300">
                  {currentVisitors} / {maxCapacity} Pax
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentVisitors((prev) => Math.max(0, prev - 5))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentVisitors((prev) => Math.min(maxCapacity, prev + 5))}
                  className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveOperationalUpdates}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Broadcast Live Operational Updates</span>
            </button>
          </div>
        </div>

        {/* Right Column: Incoming Bookings & Reservations Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-white text-sm">Visitor Reservations Queue</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                {pendingBookings.length} Pending
              </span>
            </div>

            {/* List of Bookings */}
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {spotBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No reservations logged for this spot yet.
                </div>
              ) : (
                spotBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-sm">{b.touristName}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.touristPhone} • {b.touristEmail}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : b.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-red-950 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded-lg text-[11px] text-slate-300">
                      <div>📅 {b.visitDate}</div>
                      <div>⏰ {b.timeSlot}</div>
                      <div>👥 {b.visitorsCount} Visitors</div>
                      <div className="font-bold text-teal-400">₱{b.totalAmount.toLocaleString()}</div>
                    </div>

                    {b.selectedActivities.length > 0 && (
                      <div className="text-[11px] text-slate-400">
                        <strong>Activities:</strong> {b.selectedActivities.join(', ')}
                      </div>
                    )}

                    {b.specialRequests && (
                      <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
                        <strong>Request:</strong> {b.specialRequests}
                      </div>
                    )}

                    {/* Pending Action Buttons */}
                    {b.status === 'pending' && (
                      <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                        {rejectingBookingId === b.id ? (
                          <div className="w-full space-y-2">
                            <input
                              type="text"
                              value={rejectionReasonText}
                              onChange={(e) => setRejectionReasonText(e.target.value)}
                              placeholder="Reason for declining (e.g., slot fully booked)..."
                              className="w-full bg-slate-800 border border-red-500/50 rounded-lg p-2 text-xs text-white"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setRejectingBookingId(null)}
                                className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleConfirmReject(b.id)}
                                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                              >
                                Confirm Decline
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Issue Pass</span>
                            </button>
                            <button
                              onClick={() => setRejectingBookingId(b.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 font-medium text-xs border border-slate-700"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
