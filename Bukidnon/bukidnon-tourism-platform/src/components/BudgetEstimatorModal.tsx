import React, { useState } from 'react';
import { TouristSpot } from '../types';
import { 
  X, 
  Calculator, 
  Users, 
  Calendar, 
  Car, 
  Home, 
  Utensils, 
  Ticket, 
  Sparkles, 
  Check, 
  Info,
  DollarSign
} from 'lucide-react';

interface BudgetEstimatorModalProps {
  spots: TouristSpot[];
  onClose: () => void;
}

export const BudgetEstimatorModal: React.FC<BudgetEstimatorModalProps> = ({
  spots,
  onClose
}) => {
  const [travelers, setTravelers] = useState<number>(2);
  const [days, setDays] = useState<number>(3);
  const [transportType, setTransportType] = useState<'public' | 'motorcycle' | 'rental' | 'van'>('rental');
  const [stayTier, setStayTier] = useState<'budget' | 'mid' | 'glamping'>('mid');
  const [diningTier, setDiningTier] = useState<'eatery' | 'mid' | 'gourmet'>('mid');
  const [selectedSpotIds, setSelectedSpotIds] = useState<number[]>([1, 3, 4, 6]); // Dahilayan, Lake Apo, Communal Ranch, Monastery

  // Transportation daily rates
  const transportDailyRate = {
    public: 250, // Per person / day
    motorcycle: 600, // Per vehicle / day
    rental: 2200, // Per car / day
    van: 4000 // Per chartered van / day
  }[transportType];

  const totalTransport =
    transportType === 'public'
      ? transportDailyRate * travelers * days
      : transportType === 'motorcycle'
      ? transportDailyRate * Math.ceil(travelers / 2) * days
      : transportDailyRate * days;

  // Accommodation nightly rates (assumes 2 persons per room/tent)
  const stayNightRate = {
    budget: 800, // Homestay / camping
    mid: 2200, // Standard resort / hotel
    glamping: 4500 // Luxury glamping dome
  }[stayTier];

  const totalAccommodation = stayNightRate * Math.ceil(travelers / 2) * Math.max(1, days - 1);

  // Food rates per person per day
  const foodDailyRate = {
    eatery: 400,
    mid: 800,
    gourmet: 1500
  }[diningTier];

  const totalFood = foodDailyRate * travelers * days;

  // Selected Tourist Spots Entrance & Base Activities
  const selectedSpotsList = spots.filter((s) => selectedSpotIds.includes(s.id));
  const totalEntrance = selectedSpotsList.reduce((sum, s) => sum + s.entranceFee * travelers, 0);
  const estimatedActivitiesCost = selectedSpotsList.reduce((sum, s) => {
    // Average first 2 activity fees if any
    const avgActivity = s.activityFees.length > 0 ? s.activityFees[0].price : 0;
    return sum + avgActivity * travelers;
  }, 0);

  const grandTotal = totalTransport + totalAccommodation + totalFood + totalEntrance + estimatedActivitiesCost;
  const perPersonCost = Math.round(grandTotal / travelers);

  const toggleSpot = (id: number) => {
    setSelectedSpotIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Bukidnon Trip Budget Estimator</h2>
              <p className="text-xs text-emerald-300/80">
                Calculated using actual entrance fees, transport models & local living costs
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200 text-xs">
          
          {/* Trip Duration & Group Size Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Travelers:
                </label>
                <span className="text-sm font-bold text-emerald-400">{travelers} {travelers === 1 ? 'Person' : 'Persons'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Trip Length:
                </label>
                <span className="text-sm font-bold text-teal-400">{days} {days === 1 ? 'Day' : 'Days'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Transport, Stay & Dining Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Transport */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                Transportation
              </label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="rental">Self-Drive SUV / Sedan (₱2.2k/day)</option>
                <option value="van">Chartered Van + Driver (₱4.0k/day)</option>
                <option value="motorcycle">Motorcycle / Habal-habal (₱600/day)</option>
                <option value="public">Commuter Bus & Public Van (₱250/pax)</option>
              </select>
            </div>

            {/* Accommodation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-indigo-400" />
                Accommodation
              </label>
              <select
                value={stayTier}
                onChange={(e) => setStayTier(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="mid">Mid-Range Mountain Resort (₱2,200/nt)</option>
                <option value="glamping">Luxury Glamping Dome (₱4,500/nt)</option>
                <option value="budget">Homestay / Campsite (₱800/nt)</option>
              </select>
            </div>

            {/* Dining */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                Dining Style
              </label>
              <select
                value={diningTier}
                onChange={(e) => setDiningTier(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="mid">Casual Cafes & Delicacies (₱800/pax/day)</option>
                <option value="gourmet">Clubhouse Steaks & Gourmet (₱1,500/pax)</option>
                <option value="eatery">Local Carinderia / Street Food (₱400/pax)</option>
              </select>
            </div>
          </div>

          {/* Attraction Selection Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                Select Tourist Spots to Visit ({selectedSpotIds.length} chosen)
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold">
                ₱{totalEntrance.toLocaleString()} Base Fees
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {spots.map((spot) => {
                const isSelected = selectedSpotIds.includes(spot.id);
                return (
                  <div
                    key={spot.id}
                    onClick={() => toggleSpot(spot.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-900' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate text-[11px] font-medium">{spot.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0 ml-1">
                      {spot.entranceFee === 0 ? 'FREE' : `₱${spot.entranceFee}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Itemized Budget Breakdown Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Itemized {days}-Day Cost Breakdown ({travelers} Travelers)
              </h4>
              <span className="text-[10px] text-amber-300 font-medium">Estimated Pricing in PHP (₱)</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 border-y border-slate-800/80 py-3">
              <div className="flex justify-between">
                <span>🚗 Transportation ({transportType.toUpperCase()}):</span>
                <span className="font-semibold text-white">₱{totalTransport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>🏨 Accommodation ({days - 1} nights):</span>
                <span className="font-semibold text-white">₱{totalAccommodation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>🍽️ Food & Dining:</span>
                <span className="font-semibold text-white">₱{totalFood.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>🎟️ Entrance & Environmental Fees:</span>
                <span className="font-semibold text-white">₱{totalEntrance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>⚡ Estimated Activity Passes (Zipline, Coaster, Guides):</span>
                <span className="font-semibold text-white">₱{estimatedActivitiesCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                  Estimated Total Trip Cost
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  ₱{grandTotal.toLocaleString()}
                </span>
              </div>

              <div className="bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/50 text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Cost per Traveler</span>
                <span className="text-base font-black text-emerald-300">
                  ₱{perPersonCost.toLocaleString()} <span className="text-xs font-normal">/ pax</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 italic pt-1">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                These amounts reflect current database prices and standard local estimates. Souvenirs and discretionary personal expenses not included.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
