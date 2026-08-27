import React from 'react';
import { Booking, TouristSpot } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  QrCode, 
  Navigation, 
  Ticket,
  ChevronRight,
  Info
} from 'lucide-react';

interface TouristBookingsViewProps {
  bookings: Booking[];
  spots: TouristSpot[];
  onOpenDirections: (spot: TouristSpot) => void;
  onOpenSpotDetails: (spot: TouristSpot) => void;
  onBackToMap: () => void;
}

export const TouristBookingsView: React.FC<TouristBookingsViewProps> = ({
  bookings,
  spots,
  onOpenDirections,
  onOpenSpotDetails,
  onBackToMap,
}) => {
  return (
    <div id="tourist-bookings-view" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-display">My Bukidnon Bookings & Passes</h1>
            <p className="text-xs text-slate-500">Direct owner-confirmed reservations and access permits</p>
          </div>
        </div>

        <button
          onClick={onBackToMap}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition self-start sm:self-auto shadow-xs flex items-center gap-1.5"
        >
          <span>Explore Interactive Map</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-bold text-slate-700">No Reservations Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our illustrated map to discover Bukidnon attractions and submit your direct booking requests.
          </p>
          <button
            onClick={onBackToMap}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            Explore Map Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const spotObj = spots.find((s) => s.id === b.spotId);

            return (
              <div
                key={b.id}
                className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.spotThumbnail}
                      alt={b.spotName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base font-display">{b.spotName}</h3>
                      <div className="text-xs text-emerald-700 font-semibold">{b.spotMunicipality}, Bukidnon</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {b.referenceNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
                      b.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : b.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : b.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {b.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      {b.status === 'pending' && <AlertCircle className="w-3.5 h-3.5 text-amber-700" />}
                      {b.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                      <span>{b.status === 'approved' ? 'CONFIRMED' : b.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl text-xs border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Visit Date</div>
                    <div className="font-bold text-slate-900 mt-0.5">{b.visitDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Time Window</div>
                    <div className="font-bold text-slate-900 mt-0.5">{b.timeSlot}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Guests</div>
                    <div className="font-bold text-slate-900 mt-0.5">{b.visitors.adults + b.visitors.children + b.visitors.seniors} Visitor(s)</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Estimated</div>
                    <div className="font-bold text-emerald-700 mt-0.5">₱{b.totalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Selected Activities */}
                {b.selectedActivities && b.selectedActivities.length > 0 && (
                  <div className="text-xs text-slate-700">
                    <span className="text-slate-500 font-semibold">Included Experiences:</span>{' '}
                    {b.selectedActivities.join(' • ')}
                  </div>
                )}

                {/* Rejection Notice if rejected */}
                {b.status === 'rejected' && b.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-800">
                      <XCircle className="w-4 h-4" />
                      <span>Owner Notice: Booking Not Confirmed</span>
                    </div>
                    <p className="text-slate-600 pl-5">Reason: {b.rejectionReason}</p>
                  </div>
                )}

                {/* Action Shortcuts */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Payment Mode: <strong className="text-slate-800 font-semibold">Pay upon Arrival at Counter</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {spotObj && (
                      <button
                        onClick={() => onOpenDirections(spotObj)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-sky-700 font-bold rounded-xl transition flex items-center gap-1 border border-slate-200 shadow-2xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </button>
                    )}
                    {spotObj && (
                      <button
                        onClick={() => onOpenSpotDetails(spotObj)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition border border-slate-200 shadow-2xs"
                      >
                        Spot Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
