import React from 'react';
import { TouristSpot } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Navigation, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  CloudRain, 
  Sun, 
  Car, 
  Users, 
  Info, 
  Flag,
  DollarSign
} from 'lucide-react';

interface SpotDetailModalProps {
  spot: TouristSpot | null;
  onClose: () => void;
  onBookNow: (spot: TouristSpot) => void;
  onGetDirections: (spot: TouristSpot) => void;
  onReportInfo: (spot: TouristSpot) => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  onBookNow,
  onGetDirections,
  onReportInfo,
}) => {
  if (!spot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        id={`spot-details-modal-${spot.id}`}
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          id="btn-close-spot-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 backdrop-blur-md transition shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image & Headline Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
          <img
            src={spot.images[0] || spot.thumbnail}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-xs">
              {spot.category}
            </span>
            {spot.isVerified && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md text-sky-700 text-xs font-semibold rounded-xl border border-sky-200 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Verified Attraction</span>
              </span>
            )}
          </div>

          {/* Bottom Headline Over Image */}
          <div className="absolute bottom-4 left-6 right-6 z-10">
            <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
              {spot.municipality}, Bukidnon
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {spot.name}
            </h1>
            <p className="text-sm text-slate-200 line-clamp-1 mt-0.5">{spot.tagline}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* ========================================================================= */}
          {/* CRITICAL OPERATIONAL STATUS BANNER (Owner-Updated Live Status) */}
          {/* ========================================================================= */}
          <div className={`p-4 rounded-2xl border ${
            spot.operatingStatus === 'open'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : spot.operatingStatus === 'limited'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  spot.operatingStatus === 'open'
                    ? 'bg-emerald-100 text-emerald-700'
                    : spot.operatingStatus === 'limited'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {spot.operatingStatus === 'open' && <CheckCircle2 className="w-6 h-6" />}
                  {spot.operatingStatus === 'limited' && <AlertCircle className="w-6 h-6" />}
                  {spot.operatingStatus === 'closed' && <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-extrabold tracking-wider uppercase font-display ${
                      spot.operatingStatus === 'open'
                        ? 'text-emerald-800'
                        : spot.operatingStatus === 'limited'
                        ? 'text-amber-800'
                        : 'text-rose-800'
                    }`}>
                      {spot.operatingStatus === 'open' && '🟢 CURRENTLY OPEN'}
                      {spot.operatingStatus === 'limited' && `🟡 LIMITED OPERATIONS (${spot.closureReason || 'Advisory'})`}
                      {spot.operatingStatus === 'closed' && `🔴 CURRENTLY CLOSED (${spot.closureReason || 'Temporary Closure'})`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5">
                    Operating Hours: <span className="font-bold text-slate-900">{spot.operatingHours.openTime} - {spot.operatingHours.closeTime}</span> ({spot.operatingHours.days})
                  </div>
                </div>
              </div>

              {/* Timestamp tag */}
              <div className="text-right text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                <div>Last updated: <span className="font-semibold text-slate-800">{spot.lastUpdated}</span></div>
                <div className="text-slate-500">Updated by: <span className="text-emerald-700 font-semibold">{spot.updatedBy}</span></div>
              </div>
            </div>

            {spot.operatingHours.notes && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-xs text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{spot.operatingHours.notes}</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACCESSIBILITY & WEATHER DUAL CARDS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Road & Accessibility Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Car className="w-4 h-4 text-sky-600" />
                  <span>Road & Accessibility</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  spot.accessibilityStatus === 'accessible'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : spot.accessibilityStatus === 'limited'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {spot.accessibilityStatus}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{spot.accessibilityReason}</p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Vehicle Requirement:</span>
                <span className="font-semibold text-slate-900">{spot.vehicleRequirement || 'All standard vehicles'}</span>
              </div>
            </div>

            {/* Weather Condition Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  {spot.weather.condition.includes('Rain') ? (
                    <CloudRain className="w-4 h-4 text-sky-600" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-600" />
                  )}
                  <span>Weather Condition</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {spot.weather.tempC}°C
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>{spot.weather.condition}</span>
                <span className="text-sky-700 font-semibold">Rain Prob: {spot.weather.rainProb}%</span>
              </div>
              {spot.weather.warning ? (
                <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{spot.weather.warning}</span>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Favorable outdoor sightseeing conditions</span>
                </div>
              )}
            </div>
          </div>

          {/* Description & Overview */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-display">Overview</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{spot.description}</p>
          </div>

          {/* Pricing & Available Activities */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 font-display">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Entrance Fees & Activity Rates</span>
              </h2>
              <div className="text-xs text-emerald-700 font-bold">
                Adult Entrance: ₱{spot.entranceFee.adult}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-xl mb-3 text-center text-xs border border-slate-200 shadow-2xs">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Adult</div>
                <div className="font-bold text-slate-900">₱{spot.entranceFee.adult}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Child / Student</div>
                <div className="font-bold text-slate-900">₱{spot.entranceFee.child}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Senior / PWD</div>
                <div className="font-bold text-slate-900">₱{spot.entranceFee.seniorOrPwd}</div>
              </div>
            </div>

            {spot.activities && spot.activities.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-600 mb-1">Available Attractions & Rides:</div>
                {spot.activities.map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 text-xs">
                    <span className="text-slate-800 font-medium">{act.name}</span>
                    <span className="font-bold text-emerald-700">
                      ₱{act.price} <span className="text-[10px] text-slate-500 font-normal">({act.unit})</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visitor Capacity & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Today's Visitor Capacity</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-600 font-medium">Slots Occupied:</span>
                <span className="font-bold text-slate-900">{spot.capacity.currentBookingsToday} / {spot.capacity.maxDaily} max</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    spot.capacity.currentBookingsToday / spot.capacity.maxDaily > 0.85
                      ? 'bg-rose-500'
                      : spot.capacity.currentBookingsToday / spot.capacity.maxDaily > 0.6
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (spot.capacity.currentBookingsToday / spot.capacity.maxDaily) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-slate-600 font-bold uppercase tracking-wider mb-1">Official Contact & Inquiry</div>
              <div className="text-slate-800 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-medium">{spot.contact.phone}</span>
              </div>
              <div className="text-slate-800 flex items-center gap-1.5 mt-1 truncate">
                <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate font-medium">{spot.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Tourist Requirements */}
          {spot.requirements && spot.requirements.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="font-bold text-slate-700 uppercase tracking-wider mb-1">Visitor Guidelines & Requirements</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                {spot.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            id={`btn-report-info-${spot.id}`}
            onClick={() => onReportInfo(spot)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-700 transition font-medium"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Incorrect Information</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id={`btn-modal-directions-${spot.id}`}
              onClick={() => onGetDirections(spot)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 shadow-2xs"
            >
              <Navigation className="w-4 h-4 text-sky-600" />
              <span>Get Directions</span>
            </button>

            <button
              id={`btn-modal-book-${spot.id}`}
              onClick={() => onBookNow(spot)}
              disabled={spot.operatingStatus === 'closed'}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                spot.operatingStatus === 'closed'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Attraction Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
