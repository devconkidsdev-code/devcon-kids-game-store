import React, { useState } from 'react';
import { TouristSpot } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Tag, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  CloudRain, 
  Sun, 
  ShieldCheck, 
  Share2, 
  Flag, 
  Users, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface SpotDetailModalProps {
  spot: TouristSpot | null;
  onClose: () => void;
  onBookNow: (spot: TouristSpot) => void;
  onGetDirections: (spot: TouristSpot) => void;
  onReportInaccuracy: (spot: TouristSpot) => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  onBookNow,
  onGetDirections,
  onReportInaccuracy
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!spot) return null;

  const getStatusBadge = () => {
    switch (spot.operatingStatus) {
      case 'open':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-xs tracking-wider uppercase">🟢 OPERATIONAL (OPEN)</span>
          </div>
        );
      case 'limited':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold text-xs tracking-wider uppercase">🟡 LIMITED OPERATIONS</span>
          </div>
        );
      case 'closed':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/90 text-red-300 border border-red-500/60 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="font-bold text-xs tracking-wider uppercase">🔴 TEMPORARILY CLOSED</span>
          </div>
        );
    }
  };

  const getAccessibilityBadge = () => {
    switch (spot.accessibilityStatus) {
      case 'accessible':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-900/50 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fully Accessible</span>
          </span>
        );
      case 'limited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-900/50 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Limited / Caution</span>
          </span>
        );
      case 'inaccessible':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-900/50 text-red-300 border border-red-500/40">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Inaccessible / Blocked</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Hero Image & Controls */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950 shrink-0">
          <img
            src={spot.images[activeImageIdx] || spot.images[0]}
            alt={spot.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/60" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Report Inaccuracy Button */}
          <button
            onClick={() => onReportInaccuracy(spot)}
            className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-amber-950/80 text-amber-300 flex items-center gap-1.5 text-xs border border-amber-500/40 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Info Issue</span>
          </button>

          {/* Hero Bottom Bar Info */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {getStatusBadge()}
                {spot.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/50 text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>LGU Verified</span>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 text-[11px] font-medium border border-slate-700">
                  {spot.category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {spot.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{spot.address}</span>
              </div>
            </div>

            {/* Quick Price Display */}
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-emerald-500/40 shrink-0 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Entrance Fee</span>
              <span className="text-xl font-black text-emerald-400">
                {spot.entranceFee === 0 ? 'FREE' : `₱${spot.entranceFee.toLocaleString()}`}
              </span>
              <span className="text-[10px] text-slate-400 block">per person</span>
            </div>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200">
          
          {/* THE SOURCE OF TRUTH: Real-Time Operational & Trust Callout Box */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Live Operational Status */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Live Operational Status
              </span>
              <div className="font-semibold text-sm text-white">
                {spot.operatingStatus === 'open' && '🟢 Open for Visitors'}
                {spot.operatingStatus === 'limited' && '🟡 Limited Capacity / Specific Rides Only'}
                {spot.operatingStatus === 'closed' && '🔴 Currently Closed'}
              </div>
              <p className="text-xs text-slate-300">
                {spot.operatingStatusReason || 'Operating according to standard schedule.'}
              </p>
            </div>

            {/* Road & Trail Accessibility */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                Road & Trail Condition
              </span>
              <div>{getAccessibilityBadge()}</div>
              <p className="text-xs text-slate-300 mt-1">
                {spot.accessibilityReason || 'Main access roads are clear and passable.'}
              </p>
            </div>

            {/* Live Local Weather */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                Current Weather & Rain Risk
              </span>
              <div className="flex items-center gap-2 font-semibold text-sm text-white">
                <span>{spot.weather.condition}</span>
                <span>•</span>
                <span className="text-emerald-400">{spot.weather.temp}°C</span>
                <span className="text-xs font-normal text-blue-300">({spot.weather.rainProbability}% Rain)</span>
              </div>
              {spot.weather.warning ? (
                <p className="text-xs text-amber-300 font-medium">{spot.weather.warning}</p>
              ) : (
                <p className="text-xs text-slate-400">Pleasant highland breeze, good visibility.</p>
              )}
            </div>

            {/* Verification & Timestamp Signature */}
            <div className="col-span-1 md:col-span-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                <span className="text-slate-400">Last Verified & Updated: </span>
                <strong className="text-emerald-300">{spot.lastUpdated}</strong>
                <span className="mx-1.5">•</span>
                <span>By: <strong className="text-slate-200">{spot.updatedBy}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500">Today's Visitors:</span>
                <strong className="text-slate-300">{spot.currentVisitorsToday} / {spot.maxDailyCapacity} max</strong>
              </div>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white tracking-wide">About {spot.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{spot.description}</p>
            {spot.history && (
              <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-950/40 p-3 rounded-lg border-l-2 border-emerald-500">
                "{spot.history}"
              </p>
            )}
          </div>

          {/* Activity & Fee Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-wide">Activities & Fee Schedule</h3>
              <span className="text-xs text-emerald-400 font-medium">Owner Verified Pricing</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3.5">Activity / Feature</th>
                    <th className="py-2.5 px-3.5">Duration</th>
                    <th className="py-2.5 px-3.5">Details</th>
                    <th className="py-2.5 px-3.5 text-right">Fee (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* General Entrance */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3.5 font-semibold text-white">General Environmental Entrance</td>
                    <td className="py-2.5 px-3.5 text-slate-400">All Day</td>
                    <td className="py-2.5 px-3.5 text-slate-400">Access to grounds, viewpoints, amenities</td>
                    <td className="py-2.5 px-3.5 font-bold text-emerald-400 text-right">
                      {spot.entranceFee === 0 ? 'FREE' : `₱${spot.entranceFee}`}
                    </td>
                  </tr>

                  {/* Child / Senior discounts */}
                  {spot.childFee !== undefined && spot.childFee > 0 && (
                    <tr className="hover:bg-slate-800/30 text-slate-400">
                      <td className="py-2 px-3.5 pl-6 text-slate-300">└ Children Discount (below 4ft)</td>
                      <td className="py-2 px-3.5">All Day</td>
                      <td className="py-2 px-3.5">Discounted youth rate</td>
                      <td className="py-2 px-3.5 font-semibold text-emerald-400 text-right">₱{spot.childFee}</td>
                    </tr>
                  )}

                  {/* Add-on Activities */}
                  {spot.activityFees.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-200">{act.name}</td>
                      <td className="py-2.5 px-3.5 text-slate-400">{act.duration || 'Session'}</td>
                      <td className="py-2.5 px-3.5 text-slate-400">{act.description || 'Guided activity'}</td>
                      <td className="py-2.5 px-3.5 font-bold text-emerald-400 text-right">
                        ₱{act.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Hours, Amenities & Practical Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Practical Details */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-white text-sm">Visitor Schedule & Essentials</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Hours:</strong> {spot.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                  <span><strong>Duration:</strong> Recommended {spot.estimatedVisitDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Best Time:</strong> {spot.bestTimeToVisit}</span>
                </div>
              </div>
            </div>

            {/* Contact & Host */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-white text-sm">Contact & Registered Operator</h4>
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Phone:</strong> {spot.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="truncate"><strong>Email:</strong> {spot.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span><strong>Managed by:</strong> {spot.ownerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights / Amenities Chips */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Amenities & Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {spot.amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700"
                >
                  ✓ {item}
                </span>
              ))}
              {spot.tags.map((tag, idx) => (
                <span
                  key={`tag-${idx}`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs border border-emerald-800/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            Need directions or advance reservation?
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Get Directions Button */}
            <button
              onClick={() => onGetDirections(spot)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition shadow"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Get Directions</span>
            </button>

            {/* Book Now Button */}
            <button
              onClick={() => onBookNow(spot)}
              disabled={spot.operatingStatus === 'closed'}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                spot.operatingStatus === 'closed'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>{spot.operatingStatus === 'closed' ? 'Closed for Booking' : 'Book Visit / Reserve'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
