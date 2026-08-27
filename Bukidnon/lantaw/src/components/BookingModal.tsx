import React, { useState } from 'react';
import { TouristSpot, Booking } from '../types';
import { 
  X, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Sparkles,
  Info
} from 'lucide-react';

interface BookingModalProps {
  spot: TouristSpot | null;
  onClose: () => void;
  onSubmitBooking: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  spot,
  onClose,
  onSubmitBooking,
}) => {
  if (!spot) return null;

  const [visitDate, setVisitDate] = useState('2026-08-20');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 12:00 PM');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [touristName, setTouristName] = useState('Juan Dela Cruz');
  const [touristEmail, setTouristEmail] = useState('juan.delacruz@gmail.com');
  const [touristPhone, setTouristPhone] = useState('+63 917 555 1234');
  const [touristOrigin, setTouristOrigin] = useState('Manila (via CDO)');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRef, setCreatedRef] = useState('');

  // Calculate pricing
  const entranceTotal = 
    adults * spot.entranceFee.adult + 
    children * spot.entranceFee.child + 
    seniors * spot.entranceFee.seniorOrPwd;

  const totalVisitors = adults + children + seniors;

  const activitiesTotal = selectedActivities.reduce((sum, actName) => {
    const act = spot.activities.find((a) => a.name === actName);
    if (!act) return sum;
    // If priced per person vs per group
    if (act.unit.includes('person') || act.unit.includes('rider') || act.unit.includes('player')) {
      return sum + act.price * Math.max(1, adults + children);
    }
    return sum + act.price;
  }, 0);

  const grandTotal = entranceTotal + activitiesTotal;

  const toggleActivity = (actName: string) => {
    setSelectedActivities((prev) =>
      prev.includes(actName) ? prev.filter((a) => a !== actName) : [...prev, actName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refNum = `LANTAW-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      referenceNumber: refNum,
      spotId: spot.id,
      spotName: spot.name,
      spotMunicipality: spot.municipality,
      spotThumbnail: spot.thumbnail,
      touristName,
      touristEmail,
      touristPhone,
      touristOrigin,
      visitDate,
      timeSlot,
      visitors: {
        adults,
        children,
        seniors,
      },
      selectedActivities,
      totalAmount: grandTotal,
      status: 'pending',
      bookingDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: specialNotes,
      isPaidAtCounter: true,
    };

    onSubmitBooking(newBooking);
    setCreatedRef(refNum);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        id={`booking-modal-${spot.id}`}
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Book Visit: {spot.name}</h2>
              <p className="text-xs text-slate-500">Direct booking with registered spot owner • Pay on Arrival</p>
            </div>
          </div>
          <button
            id="btn-close-booking"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Booking Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-display">Booking Request Submitted!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your visit request has been transmitted directly to the verified owner of <strong className="text-emerald-700">{spot.name}</strong>.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference No:</span>
                <span className="font-mono font-bold text-amber-700">{createdRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visit Date:</span>
                <span className="font-semibold text-slate-900">{visitDate} ({timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guests:</span>
                <span className="font-semibold text-slate-900">{totalVisitors} Visitor(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Total:</span>
                <span className="font-bold text-emerald-700">₱{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold uppercase text-[10px] border border-amber-200">
                  Pending Owner Approval
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              You can check the approval status anytime under <strong className="text-slate-800">"My Bookings"</strong> in the top menu.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              Done & Return to Map
            </button>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Schedule Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Target Visit Date</label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  min="2026-08-15"
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Preferred Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                >
                  <option value="06:00 AM - 09:00 AM (Sunrise)">06:00 AM - 09:00 AM (Sunrise)</option>
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                  <option value="01:00 PM - 04:30 PM">01:00 PM - 04:30 PM (Afternoon)</option>
                  <option value="Full Day Pass (08:00 AM - 05:00 PM)">Full Day Pass (08:00 AM - 05:00 PM)</option>
                  <option value="Overnight Stay / Camping">Overnight Stay / Camping</option>
                </select>
              </div>
            </div>

            {/* Visitor Count Selector */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Number of Visitors</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] mb-1">Adults (₱{spot.entranceFee.adult})</div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900 shadow-2xs"
                  />
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] mb-1">Children (₱{spot.entranceFee.child})</div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900 shadow-2xs"
                  />
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] mb-1">Senior / PWD (₱{spot.entranceFee.seniorOrPwd})</div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={seniors}
                    onChange={(e) => setSeniors(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Activities Checkboxes */}
            {spot.activities && spot.activities.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Add-On Activities & Passes
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {spot.activities.map((act, i) => (
                    <label
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-slate-50 cursor-pointer text-xs border border-slate-200 transition shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(act.name)}
                          onChange={() => toggleActivity(act.name)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-800 font-medium">{act.name}</span>
                      </div>
                      <span className="font-bold text-emerald-700 shrink-0">
                        +₱{act.price} <span className="text-[10px] text-slate-500 font-normal">({act.unit})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Guest Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Primary Guest Name</label>
                <input
                  type="text"
                  required
                  value={touristName}
                  onChange={(e) => setTouristName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={touristPhone}
                  onChange={(e) => setTouristPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={touristEmail}
                  onChange={(e) => setTouristEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Origin / City</label>
                <input
                  type="text"
                  value={touristOrigin}
                  onChange={(e) => setTouristOrigin(e.target.value)}
                  placeholder="e.g. Manila, CDO, Davao"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Special Request */}
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Special Notes / Requests</label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Any special equipment, dietary requests, or flight arrival times..."
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              ></textarea>
            </div>

            {/* Price Estimation Bar */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-800 font-bold uppercase">Estimated Booking Payable</div>
                <div className="text-xs text-slate-600">Entrance (₱{entranceTotal}) + Activities (₱{activitiesTotal})</div>
              </div>
              <div className="text-xl font-extrabold text-emerald-800 font-display">
                ₱{grandTotal.toLocaleString()}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-booking-form"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Submit Booking Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
