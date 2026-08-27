import React, { useState } from 'react';
import { BudgetEstimate } from '../types';
import { 
  X, 
  Coins, 
  Users, 
  Calendar, 
  Car, 
  Home, 
  Utensils, 
  Ticket, 
  Sparkles,
  Info
} from 'lucide-react';

interface BudgetEstimatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetEstimator: React.FC<BudgetEstimatorProps> = ({ isOpen, onClose }) => {
  const [travelers, setTravelers] = useState<number>(2);
  const [days, setDays] = useState<number>(3);
  const [transportMode, setTransportMode] = useState<BudgetEstimate['transportMode']>('Private Car Rental');
  const [accommodationTier, setAccommodationTier] = useState<BudgetEstimate['accommodationTier']>('Mid-range Resort');

  if (!isOpen) return null;

  // Rate calculations
  let transportDaily = 0;
  if (transportMode === 'Public Bus / Van') transportDaily = 350 * travelers;
  else if (transportMode === 'Private Car Rental') transportDaily = 2500;
  else if (transportMode === 'Motorcycle / Habal-habal') transportDaily = 800 * Math.ceil(travelers / 2);
  else if (transportMode === 'Own Vehicle') transportDaily = 900; // fuel estimate

  const transportTotal = transportDaily * days;

  let lodgingPerNight = 0;
  if (accommodationTier === 'Budget / Homestay') lodgingPerNight = 1200 * Math.ceil(travelers / 2);
  else if (accommodationTier === 'Mid-range Resort') lodgingPerNight = 2800 * Math.ceil(travelers / 2);
  else if (accommodationTier === 'Glamping / Premium Lodge') lodgingPerNight = 4500 * Math.ceil(travelers / 2);

  const nights = Math.max(1, days - 1);
  const accommodationTotal = lodgingPerNight * nights;

  const foodDailyPerPerson = 600;
  const foodTotal = foodDailyPerPerson * travelers * days;

  const entranceAndActivitiesTotal = (400 + 600) * travelers * Math.min(days, 3);
  const emergencyFund = Math.round((transportTotal + accommodationTotal + foodTotal) * 0.1);
  const grandTotal = transportTotal + accommodationTotal + foodTotal + entranceAndActivitiesTotal + emergencyFund;
  const perPersonCost = Math.round(grandTotal / travelers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="budget-estimator-modal"
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Bukidnon Trip Budget Estimator</h2>
              <p className="text-xs text-slate-500">Realistic travel expense calculations based on local highland rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Sliders: Travelers & Days */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 flex items-center justify-between mb-1">
                <span>Number of Travelers</span>
                <span className="text-emerald-700 font-extrabold text-sm">{travelers} Pax</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 flex items-center justify-between mb-1">
                <span>Trip Duration</span>
                <span className="text-sky-700 font-extrabold text-sm">{days} Days</span>
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>

          {/* Transport & Lodging Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Transportation Option</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Private Car Rental">Private Car Rental (Self-Drive / Van)</option>
                <option value="Public Bus / Van">Public Bus & Rural Transit Vans</option>
                <option value="Motorcycle / Habal-habal">Motorcycle / Habal-habal</option>
                <option value="Own Vehicle">Own Vehicle (Fuel & Tolls)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Accommodation Tier</label>
              <select
                value={accommodationTier}
                onChange={(e) => setAccommodationTier(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Mid-range Resort">Mid-Range Mountain Resort (₱2,800/night)</option>
                <option value="Budget / Homestay">Budget Homestay / Hostel (₱1,200/night)</option>
                <option value="Glamping / Premium Lodge">Luxury Glamping / Dome (₱4,500/night)</option>
              </select>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Estimated Expense Breakdown</div>
            
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Car className="w-3.5 h-3.5 text-sky-600" />
                <span>Transportation ({transportMode})</span>
              </span>
              <span className="font-bold text-slate-900">₱{transportTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Home className="w-3.5 h-3.5 text-amber-600" />
                <span>Accommodation ({nights} Night/s)</span>
              </span>
              <span className="font-bold text-slate-900">₱{accommodationTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Utensils className="w-3.5 h-3.5 text-rose-600" />
                <span>Food & Highland Dining (Del Monte, local cafes)</span>
              </span>
              <span className="font-bold text-slate-900">₱{foodTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                <span>Attraction Entrances & Key Activities</span>
              </span>
              <span className="font-bold text-slate-900">₱{entranceAndActivitiesTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Emergency Buffer & Souvenirs (~10%)</span>
              </span>
              <span className="font-bold text-slate-700">₱{emergencyFund.toLocaleString()}</span>
            </div>
          </div>

          {/* Grand Total Highlight */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                Total Estimated Budget ({days}-Day Trip)
              </div>
              <div className="text-[11px] text-slate-600">
                Approx. <span className="font-bold text-slate-900">₱{perPersonCost.toLocaleString()}</span> per traveler
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-800 font-display">
              ₱{grandTotal.toLocaleString()}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Clearly labeled as a prototype estimation based on verified Bukidnon rates. Actual expenses may vary.</span>
          </p>

        </div>
      </div>
    </div>
  );
};
