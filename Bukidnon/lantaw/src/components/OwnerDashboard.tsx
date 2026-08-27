import React, { useState } from 'react';
import { TouristSpot, Booking, OperatingStatus, ClosureReason, AccessibilityStatus } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  Car, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  AlertTriangle,
  FileEdit,
  Save,
  RotateCcw
} from 'lucide-react';

interface OwnerDashboardProps {
  spots: TouristSpot[];
  bookings: Booking[];
  onUpdateSpot: (updatedSpot: TouristSpot) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status'], reason?: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  spots,
  bookings,
  onUpdateSpot,
  onUpdateBookingStatus,
}) => {
  // Let owner switch between their attractions (e.g. Dahilayan, Communal Ranch, Kitanglad, Lake Apo, etc.)
  const [selectedSpotId, setSelectedSpotId] = useState<string>(spots[0]?.id || 'dahilayan-adventure-park');
  const activeSpot = spots.find((s) => s.id === selectedSpotId) || spots[0];

  // Editable Form State
  const [status, setStatus] = useState<OperatingStatus>(activeSpot.operatingStatus);
  const [closureReason, setClosureReason] = useState<ClosureReason>(activeSpot.closureReason || 'Maintenance');
  const [accessibility, setAccessibility] = useState<AccessibilityStatus>(activeSpot.accessibilityStatus);
  const [accessibilityReason, setAccessibilityReason] = useState(activeSpot.accessibilityReason || '');
  const [adultFee, setAdultFee] = useState(activeSpot.entranceFee.adult);
  const [childFee, setChildFee] = useState(activeSpot.entranceFee.child);
  const [openTime, setOpenTime] = useState(activeSpot.operatingHours.openTime);
  const [closeTime, setCloseTime] = useState(activeSpot.operatingHours.closeTime);
  const [operatingDays, setOperatingDays] = useState(activeSpot.operatingHours.days);
  const [rejectionModalBooking, setRejectionModalBooking] = useState<Booking | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('Schedule is unavailable on selected date due to capacity limits.');
  const [savedNotification, setSavedNotification] = useState(false);

  // Sync state when switching spot
  const handleSelectSpot = (id: string) => {
    setSelectedSpotId(id);
    const target = spots.find((s) => s.id === id);
    if (target) {
      setStatus(target.operatingStatus);
      setClosureReason(target.closureReason || 'Maintenance');
      setAccessibility(target.accessibilityStatus);
      setAccessibilityReason(target.accessibilityReason || '');
      setAdultFee(target.entranceFee.adult);
      setChildFee(target.entranceFee.child);
      setOpenTime(target.operatingHours.openTime);
      setCloseTime(target.operatingHours.closeTime);
      setOperatingDays(target.operatingHours.days);
    }
  };

  const handleSaveOperationalUpdate = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedTimestamp = `Today at ${timeStr}`;

    const updated: TouristSpot = {
      ...activeSpot,
      operatingStatus: status,
      closureReason: status !== 'open' ? closureReason : undefined,
      accessibilityStatus: accessibility,
      accessibilityReason,
      entranceFee: {
        ...activeSpot.entranceFee,
        adult: adultFee,
        child: childFee,
      },
      operatingHours: {
        ...activeSpot.operatingHours,
        openTime,
        closeTime,
        days: operatingDays,
      },
      lastUpdated: formattedTimestamp,
      updatedBy: 'Tourist Spot Owner',
    };

    onUpdateSpot(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  // Filter bookings for this spot
  const spotBookings = bookings.filter((b) => b.spotId === activeSpot.id);
  const pendingBookings = spotBookings.filter((b) => b.status === 'pending');
  const upcomingBookings = spotBookings.filter((b) => b.status === 'approved');

  const handleConfirmReject = () => {
    if (!rejectionModalBooking) return;
    onUpdateBookingStatus(rejectionModalBooking.id, 'rejected', rejectionReasonText);
    setRejectionModalBooking(null);
  };

  return (
    <div id="owner-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Spot Selector */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Owner Operational Management Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Verified Owner Mode
              </span>
            </div>
            <p className="text-xs text-stone-400">Direct control of operational statuses, road accessibility, pricing, and bookings</p>
          </div>
        </div>

        {/* Spot Switcher dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-400">Managing Spot:</label>
          <select
            id="select-managed-spot"
            value={selectedSpotId}
            onChange={(e) => handleSelectSpot(e.target.value)}
            className="p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.municipality})
              </option>
            ))}
          </select>
        </div>
      </div>

      {savedNotification && (
        <div className="p-4 bg-emerald-950 border border-emerald-500 rounded-2xl text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Success! Operational status and prices published to tourists. "Last Updated" timestamp has been refreshed.</span>
          </div>
          <span className="text-[11px] text-emerald-300">Live on Public Map</span>
        </div>
      )}

      {/* Main Grid: Left = Live Controls / Right = Booking Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LIVE OPERATIONAL & ACCESSIBILITY CONTROLS (7 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Operating Status Card */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>1. Operating Status (Instant Live Update)</span>
              </h2>
              <span className="text-[11px] text-stone-400">
                Current: <strong className="text-emerald-400 uppercase">{activeSpot.operatingStatus}</strong>
              </span>
            </div>

            {/* 3 Status Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                id="btn-owner-status-open"
                onClick={() => setStatus('open')}
                className={`p-3.5 rounded-2xl font-bold text-xs transition flex flex-col items-center gap-1.5 border ${
                  status === 'open'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>🟢 OPEN</span>
                <span className="text-[10px] font-normal text-stone-400">Standard Ops</span>
              </button>

              <button
                type="button"
                id="btn-owner-status-limited"
                onClick={() => setStatus('limited')}
                className={`p-3.5 rounded-2xl font-bold text-xs transition flex flex-col items-center gap-1.5 border ${
                  status === 'limited'
                    ? 'bg-amber-950 border-amber-500 text-amber-200 ring-2 ring-amber-500/40'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>🟡 LIMITED</span>
                <span className="text-[10px] font-normal text-stone-400">Partial Access</span>
              </button>

              <button
                type="button"
                id="btn-owner-status-closed"
                onClick={() => setStatus('closed')}
                className={`p-3.5 rounded-2xl font-bold text-xs transition flex flex-col items-center gap-1.5 border ${
                  status === 'closed'
                    ? 'bg-rose-950 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>🔴 CLOSED</span>
                <span className="text-[10px] font-normal text-stone-400">Temporary</span>
              </button>
            </div>

            {/* Closure / Limited Reason Selector */}
            {status !== 'open' && (
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 animate-in fade-in">
                <label className="text-[11px] uppercase font-bold text-amber-300 block">
                  Select Reason for {status === 'closed' ? 'Closure' : 'Limited Operations'}
                </label>
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
                >
                  <option value="Heavy rain">Heavy rain & weather hazard</option>
                  <option value="Road conditions">Road conditions / impassable trail</option>
                  <option value="Maintenance">Maintenance & repairs</option>
                  <option value="Safety concerns">Safety concerns & river surge</option>
                  <option value="Holiday">Holiday / Scheduled rest day</option>
                  <option value="Fully booked">Fully booked (Daily capacity reached)</option>
                  <option value="Off-season">Off-season agricultural restoration</option>
                  <option value="Other">Other temporary advisory</option>
                </select>
              </div>
            )}
          </div>

          {/* Road Accessibility Controls */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-lg space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-400" />
              <span>2. Road & Accessibility Status</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAccessibility('accessible')}
                className={`p-3 rounded-xl text-xs font-bold transition border text-center ${
                  accessibility === 'accessible'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                    : 'bg-stone-800 border-stone-700 text-stone-400'
                }`}
              >
                🟢 Accessible (All Cars)
              </button>
              <button
                type="button"
                onClick={() => setAccessibility('limited')}
                className={`p-3 rounded-xl text-xs font-bold transition border text-center ${
                  accessibility === 'limited'
                    ? 'bg-amber-950 border-amber-500 text-amber-200'
                    : 'bg-stone-800 border-stone-700 text-stone-400'
                }`}
              >
                🟡 Limited (4x4 / Guide)
              </button>
              <button
                type="button"
                onClick={() => setAccessibility('inaccessible')}
                className={`p-3 rounded-xl text-xs font-bold transition border text-center ${
                  accessibility === 'inaccessible'
                    ? 'bg-rose-950 border-rose-500 text-rose-200'
                    : 'bg-stone-800 border-stone-700 text-stone-400'
                }`}
              >
                🔴 Inaccessible
              </button>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">
                Road Condition Description (Shown directly to tourists)
              </label>
              <input
                type="text"
                value={accessibilityReason}
                onChange={(e) => setAccessibilityReason(e.target.value)}
                placeholder="e.g. Clear paved road / Heavy rainfall causing slippery trail..."
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Hours Management */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-lg space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>3. Entrance Fees & Operating Schedules</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">Adult Entrance Fee (₱)</label>
                <input
                  type="number"
                  value={adultFee}
                  onChange={(e) => setAdultFee(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">Child Entrance Fee (₱)</label>
                <input
                  type="number"
                  value={childFee}
                  onChange={(e) => setChildFee(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">Opening Time</label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">Closing Time</label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-stone-400 block mb-1">Operating Days</label>
              <input
                type="text"
                value={operatingDays}
                onChange={(e) => setOperatingDays(e.target.value)}
                placeholder="e.g. Monday - Sunday (Daily)"
                className="w-full p-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="btn-save-owner-changes"
                onClick={handleSaveOperationalUpdate}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Live Operational Updates</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: BOOKING WORKFLOW (Pending approvals & upcoming visitors) (5 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pending Bookings Section */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Pending Booking Requests</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                {pendingBookings.length} Pending
              </span>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 bg-stone-950 rounded-2xl border border-stone-800">
                No pending booking requests at this time.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{b.touristName}</div>
                        <div className="text-[11px] text-stone-400">{b.touristOrigin} • {b.touristPhone}</div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-600/30">
                        {b.referenceNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-stone-900 rounded-xl">
                      <div>
                        <span className="text-stone-400">Date:</span> <strong className="text-white">{b.visitDate}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400">Slot:</span> <strong className="text-white">{b.timeSlot.split(' ')[0]}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400">Visitors:</span> <strong className="text-white">{b.visitors.adults + b.visitors.children + b.visitors.seniors} Pax</strong>
                      </div>
                      <div>
                        <span className="text-stone-400">Total:</span> <strong className="text-emerald-400 font-bold">₱{b.totalAmount}</strong>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-[11px] text-stone-300 italic bg-stone-900/60 p-2 rounded-lg">
                        "{b.notes}"
                      </p>
                    )}

                    {/* Action Buttons: Approve / Reject */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onUpdateBookingStatus(b.id, 'approved')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setRejectionModalBooking(b)}
                        className="flex-1 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Approved Visitors List */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-lg space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Approved Visitors ({upcomingBookings.length})</span>
            </h2>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {upcomingBookings.map((b) => (
                <div key={b.id} className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{b.touristName} ({b.visitors.adults + b.visitors.children + b.visitors.seniors} pax)</div>
                    <div className="text-[10px] text-stone-400">{b.visitDate} • {b.timeSlot}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-600/40">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Rejection Modal with Reason */}
      {rejectionModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 max-w-md w-full text-stone-100 space-y-4">
            <h3 className="text-base font-bold text-white">Decline Booking: {rejectionModalBooking.referenceNumber}</h3>
            <p className="text-xs text-stone-300">
              Please specify a clear reason for the tourist (e.g. Schedule unavailable, fully booked, weather maintenance):
            </p>
            <textarea
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectionModalBooking(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
