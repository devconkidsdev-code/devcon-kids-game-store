import React, { useState } from 'react';
import { TouristSpot, Booking } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  QrCode, 
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  spot: TouristSpot;
  onClose: () => void;
  onSubmitBooking: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  spot,
  onClose,
  onSubmitBooking
}) => {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [visitDate, setVisitDate] = useState<string>('2026-08-20');
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM – 12:00 PM');
  const [visitorsCount, setVisitorsCount] = useState<number>(2);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [touristName, setTouristName] = useState<string>('Alex Johnson');
  const [touristEmail, setTouristEmail] = useState<string>('alex.johnson@example.com');
  const [touristPhone, setTouristPhone] = useState<string>('+63 917 882 3344');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Price Calculation
  const entranceTotal = spot.entranceFee * visitorsCount;
  const selectedActivitiesList = spot.activityFees.filter((a) => selectedActivityIds.includes(a.id));
  const activitiesTotal = selectedActivitiesList.reduce((sum, a) => sum + a.price * visitorsCount, 0);
  const grandTotal = entranceTotal + activitiesTotal;

  const toggleActivity = (id: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const code = `BUK-${spot.name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `BK-${Date.now()}`,
      bookingCode: code,
      spotId: spot.id,
      spotName: spot.name,
      spotImage: spot.images[0],
      touristName,
      touristEmail,
      touristPhone,
      visitDate,
      timeSlot,
      visitorsCount,
      selectedActivities: selectedActivitiesList.map((a) => a.name),
      specialRequests: specialRequests.trim() || undefined,
      totalAmount: grandTotal,
      status: 'pending',
      createdAt: 'Just now',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${code}`
    };

    setConfirmedBooking(newBooking);
    onSubmitBooking(newBooking);
    setStep('confirmation');

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {step === 'form' ? `Book Visit: ${spot.name}` : 'Booking Request Submitted!'}
              </h2>
              <p className="text-xs text-emerald-300/80">
                {step === 'form' ? 'Official reservation request sent directly to spot owner' : 'Reference code generated'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-200 text-xs">
            
            {/* Spot Quick Summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <img src={spot.images[0]} alt={spot.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{spot.name}</h4>
                <p className="text-slate-400 text-xs">{spot.municipality} • Operating: {spot.operatingHours}</p>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                  Base Entrance: {spot.entranceFee === 0 ? 'FREE' : `₱${spot.entranceFee} / person`}
                </div>
              </div>
            </div>

            {/* Visit Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Visit Date
                </label>
                <input
                  type="date"
                  required
                  min="2026-08-15"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Preferred Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="08:00 AM – 11:00 AM">Morning Session (08:00 AM – 11:00 AM)</option>
                  <option value="11:00 AM – 02:00 PM">Midday Session (11:00 AM – 02:00 PM)</option>
                  <option value="02:00 PM – 05:00 PM">Afternoon Session (02:00 PM – 05:00 PM)</option>
                  <option value="Full Day Pass">Full Day Pass (08:00 AM – 05:00 PM)</option>
                  <option value="Overnight Stay (if available)">Overnight / Camping Stay</option>
                </select>
              </div>
            </div>

            {/* Number of Visitors */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Number of Visitors (Pax)
                </label>
                <span className="text-emerald-400 font-bold text-sm">{visitorsCount} Persons</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={visitorsCount}
                onChange={(e) => setVisitorsCount(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 Person</span>
                <span>10 Persons</span>
                <span>25+ Group</span>
              </div>
            </div>

            {/* Optional Add-on Activities */}
            {spot.activityFees.length > 0 && (
              <div className="space-y-2">
                <label className="font-bold text-slate-400 uppercase tracking-wider block">
                  Select Add-On Activities (Optional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {spot.activityFees.map((act) => {
                    const isSelected = selectedActivityIds.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleActivity(act.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-900' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="font-semibold text-xs">{act.name}</div>
                            <div className="text-[10px] text-slate-400">{act.description}</div>
                          </div>
                        </div>
                        <div className="font-bold text-emerald-400 text-xs">
                          +₱{act.price} <span className="text-[10px] text-slate-400 font-normal">/ pax</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tourist Contact Information */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="font-bold text-slate-400 uppercase tracking-wider block">
                Primary Contact Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={touristName}
                    onChange={(e) => setTouristName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={touristEmail}
                    onChange={(e) => setTouristEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={touristPhone}
                    onChange={(e) => setTouristPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Special Requests / Notes (Optional)</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., senior citizen in group, dietary requests, early arrival"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Real-Time Price Breakdown Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2">
              <div className="flex justify-between text-slate-300 text-xs">
                <span>General Entrance ({visitorsCount} pax × ₱{spot.entranceFee}):</span>
                <span>₱{entranceTotal.toLocaleString()}</span>
              </div>
              {activitiesTotal > 0 && (
                <div className="flex justify-between text-slate-300 text-xs">
                  <span>Selected Activities ({visitorsCount} pax):</span>
                  <span>+₱{activitiesTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Estimated Amount</span>
                  <span className="text-xl font-black text-emerald-400">₱{grandTotal.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-slate-400 italic bg-slate-900 px-2 py-1 rounded">
                  Pay upon arrival or via owner confirmation
                </span>
              </div>
            </div>

            {/* Modal Submit Footer */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Submit Reservation Request</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center text-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-bold border border-amber-500/40 uppercase">
                Status: Pending Owner Approval
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                Booking Reference: {confirmedBooking?.bookingCode}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your reservation request for <strong>{spot.name}</strong> on <strong>{visitDate}</strong> has been transmitted directly to the tourist spot operator ({spot.ownerName}).
              </p>
            </div>

            {/* QR Voucher Preview */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 max-w-sm mx-auto shadow-inner flex flex-col items-center gap-3">
              <div className="bg-white p-2 rounded-xl">
                <img
                  src={confirmedBooking?.qrCodeUrl}
                  alt="Booking QR Code"
                  className="w-36 h-36"
                />
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">
                  {confirmedBooking?.bookingCode}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {visitorsCount} Visitors • Total ₱{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl max-w-md mx-auto text-left flex items-start gap-2 border border-slate-700">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                You can monitor live status changes in the <strong>"My Bookings"</strong> dashboard. You will see an update once the owner approves.
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
              >
                Done & Return to Explorer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
