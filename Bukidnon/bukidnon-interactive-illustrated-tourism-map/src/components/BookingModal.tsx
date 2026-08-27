import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Landmark } from '../types';
import { 
  X, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Printer, 
  QrCode, 
  MapPin,
  Clock,
  Share2,
  DollarSign
} from 'lucide-react';
import { soundscape } from '../utils/soundscape';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  landmark: Landmark | null;
  customTitle?: string;
  customLandmarks?: Landmark[];
}

export function BookingModal({
  isOpen,
  onClose,
  landmark,
  customTitle,
  customLandmarks,
}: BookingModalProps) {
  const [leadName, setLeadName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('2026-09-15');
  const [guests, setGuests] = useState(2);
  const [serviceType, setServiceType] = useState<'Standard Park Pass' | 'Guided Eco-Trek' | 'VIP Highland Tour'>('Guided Eco-Trek');
  const [includeCoffeeTasting, setIncludeCoffeeTasting] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen) return null;

  const targetTitle = customTitle || landmark?.title || 'Bukidnon Highland Experience';
  const targetLocation = landmark ? `${landmark.municipalityName}, Bukidnon` : 'Highland Province of Bukidnon';

  const basePricePerPerson = serviceType === 'VIP Highland Tour' ? 1800 : serviceType === 'Guided Eco-Trek' ? 950 : 350;
  const coffeeAddonPrice = includeCoffeeTasting ? 200 * guests : 0;
  const totalPrice = basePricePerPerson * guests + coffeeAddonPrice;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!leadName || !email) return;

    const randomRef = `BUK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(randomRef);
    setIsSuccess(true);
    soundscape.playInteractivePop();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#f59e0b', '#38bdf8', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/65 backdrop-blur-sm">
        {/* Backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          id="booking-reservation-modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-xl bg-[#FDFCF0] border border-[#799F0C]/20 rounded-3xl shadow-2xl overflow-hidden text-[#2D3436] z-10 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#799F0C]/20 bg-[#1E392A] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#799F0C] flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A7C957]">
                  Direct Eco-Tourism Booking
                </span>
                <h2 className="text-base font-extrabold text-white leading-tight">
                  {isSuccess ? 'Reservation Confirmed!' : 'Book Travel Permit & Guide'}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Destination Summary Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#799F0C]/20 shadow-xs flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#799F0C] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {targetLocation}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#1E392A] mt-0.5">{targetTitle}</h3>
                    {landmark?.entryFee && (
                      <p className="text-xs text-[#4A5A40] mt-1">Official Fee: <span className="font-semibold text-[#1E392A]">{landmark.entryFee}</span></p>
                    )}
                  </div>
                </div>

                {/* Service Package Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E392A]">Select Tour / Permit Package</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Standard Park Pass', label: 'Standard Pass', price: '₱350' },
                      { id: 'Guided Eco-Trek', label: 'Guided Trek', price: '₱950' },
                      { id: 'VIP Highland Tour', label: 'VIP Expedition', price: '₱1,800' },
                    ].map((pkg) => (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setServiceType(pkg.id as unknown as 'Standard Park Pass' | 'Guided Eco-Trek' | 'VIP Highland Tour')}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          serviceType === pkg.id
                            ? 'bg-[#1E392A] border-[#1E392A] text-white font-bold shadow-xs'
                            : 'bg-white border-[#799F0C]/20 text-[#4A5A40] hover:text-[#1E392A] hover:bg-[#F5F9E8]'
                        }`}
                      >
                        <div className="text-[11px] leading-tight">{pkg.label}</div>
                        <div className={`text-xs font-extrabold mt-1 ${serviceType === pkg.id ? 'text-[#A7C957]' : 'text-[#799F0C]'}`}>{pkg.price}/pax</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Guests */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1E392A] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#799F0C]" />
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#F5F9E8] border border-[#799F0C]/25 rounded-xl px-3 py-2 text-xs text-[#1E392A] focus:outline-none focus:border-[#799F0C] focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1E392A] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#3498DB]" />
                      Number of Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full bg-[#F5F9E8] border border-[#799F0C]/25 rounded-xl px-3 py-2 text-xs text-[#1E392A] focus:outline-none focus:border-[#799F0C] focus:bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 15].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lead Contact Info */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1E392A]">Lead Traveler Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Maria Santos"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-[#F5F9E8] border border-[#799F0C]/25 rounded-xl px-3.5 py-2 text-xs text-[#1E392A] placeholder-[#636E72] focus:outline-none focus:border-[#799F0C] focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1E392A]">Email Address</label>
                      <input
                        type="email"
                        placeholder="maria@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#F5F9E8] border border-[#799F0C]/25 rounded-xl px-3.5 py-2 text-xs text-[#1E392A] placeholder-[#636E72] focus:outline-none focus:border-[#799F0C] focus:bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1E392A]">Mobile Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+63 917 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F5F9E8] border border-[#799F0C]/25 rounded-xl px-3.5 py-2 text-xs text-[#1E392A] placeholder-[#636E72] focus:outline-none focus:border-[#799F0C] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Highland Add-on Checkbox */}
                <div className="bg-[#FFF9EB] p-3.5 rounded-2xl border border-[#FF9F1C]/25 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="coffee-addon"
                      checked={includeCoffeeTasting}
                      onChange={(e) => setIncludeCoffeeTasting(e.target.checked)}
                      className="w-4 h-4 rounded text-[#799F0C] focus:ring-[#799F0C]"
                    />
                    <label htmlFor="coffee-addon" className="text-xs text-[#2D3436] font-medium cursor-pointer">
                      Add Fresh Monk's Blend Coffee & Hot Native Binaki (+₱200/pax)
                    </label>
                  </div>
                </div>

                {/* Price Total Bar */}
                <div className="pt-3 border-t border-[#799F0C]/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#4A5A40]">Estimated Total</span>
                    <div className="text-lg font-extrabold text-[#799F0C]">
                      ₱{totalPrice.toLocaleString()} PHP
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#799F0C] hover:bg-[#688a09] text-white font-bold text-xs shadow-md shadow-[#799F0C]/25 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span>Confirm Reservation</span>
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            ) : (
              /* SUCCESS DIGITAL TRAVEL VOUCHER */
              <div className="space-y-5 print:p-0">
                <div className="text-center py-4 bg-[#F5F9E8] rounded-2xl border border-[#799F0C]/25">
                  <div className="w-12 h-12 rounded-full bg-[#799F0C] text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1E392A]">Your Bukidnon Permit is Ready!</h3>
                  <p className="text-xs text-[#4A5A40] mt-0.5">Booking Reference: <span className="font-mono font-bold text-[#799F0C]">{bookingRef}</span></p>
                </div>

                {/* Digital Voucher Ticket */}
                <div className="p-5 rounded-3xl bg-white border border-[#799F0C]/25 shadow-md space-y-4">
                  <div className="flex items-start justify-between border-b border-[#799F0C]/15 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#799F0C] tracking-wider">
                        Province of Bukidnon Tourism Board
                      </span>
                      <h4 className="text-sm font-extrabold text-[#1E392A] mt-0.5">{targetTitle}</h4>
                      <p className="text-xs text-[#4A5A40]">{targetLocation}</p>
                    </div>
                    <div className="p-2 bg-[#F5F9E8] rounded-xl text-[#1E392A] border border-[#799F0C]/20">
                      <QrCode className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#4A5A40]">Lead Traveler</span>
                      <p className="font-bold text-[#1E392A] truncate">{leadName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#4A5A40]">Travel Date</span>
                      <p className="font-bold text-[#799F0C]">{date}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#4A5A40]">Guests</span>
                      <p className="font-bold text-[#1E392A]">{guests} Persons</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#4A5A40]">Package</span>
                      <p className="font-bold text-[#FF9F1C] truncate">{serviceType}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#799F0C]/15 flex items-center justify-between text-xs">
                    <span className="text-[#4A5A40]">Total Confirmed Fee</span>
                    <span className="text-sm font-extrabold text-[#799F0C]">₱{totalPrice.toLocaleString()} PHP</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 rounded-2xl bg-white hover:bg-[#F5F9E8] text-[#1E392A] text-xs font-bold border border-[#799F0C]/25 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-[#799F0C]" />
                    <span>Print / Save Voucher</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-2xl bg-[#1E392A] hover:bg-[#2D3436] text-white text-xs font-bold shadow-md shadow-[#1E392A]/20"
                  >
                    Done & Return to Map
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
