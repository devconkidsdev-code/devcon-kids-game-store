import React, { useState } from 'react';
import { TouristSpot, RouteOption } from '../types';
import { 
  X, 
  Navigation, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Car, 
  Bike, 
  Bus,
  ShieldCheck
} from 'lucide-react';

interface DirectionsModalProps {
  spot: TouristSpot;
  onClose: () => void;
  onApplyRouteToMap: (route: {
    originName: string;
    destinationName: string;
    pathPoints: { x: number; y: number }[];
    distanceKm: number;
    durationMins: number;
    hasWarning?: boolean;
    warningText?: string;
  }) => void;
}

const START_LOCATIONS = [
  { id: 'cdo', name: 'Cagayan de Oro City / Laguindingan Airport', coords: { x: 180, y: 45 } },
  { id: 'malaybalay', name: 'Malaybalay City Center (Capitol Grounds)', coords: { x: 265, y: 320 } },
  { id: 'valencia', name: 'Valencia City Center', coords: { x: 290, y: 420 } },
  { id: 'manolo', name: 'Manolo Fortich Poblacion', coords: { x: 210, y: 110 } },
  { id: 'davao', name: 'Davao City / BuDa Highway Border', coords: { x: 345, y: 555 } }
];

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  spot,
  onClose,
  onApplyRouteToMap
}) => {
  const [selectedOriginId, setSelectedOriginId] = useState<string>('malaybalay');
  const [selectedTransport, setSelectedTransport] = useState<'car' | 'bus' | 'motorcycle'>('car');
  const [selectedRouteType, setSelectedRouteType] = useState<'fastest' | 'scenic'>('fastest');

  const origin = START_LOCATIONS.find((loc) => loc.id === selectedOriginId) || START_LOCATIONS[1];

  // Calculate simulated distance based on coordinates
  const dx = spot.coords.x - origin.coords.x;
  const dy = spot.coords.y - origin.coords.y;
  const baseDistanceKm = Math.max(12, Math.round(Math.sqrt(dx * dx + dy * dy) * 0.45));
  
  // Calculate duration based on vehicle and road accessibility
  const speedMultiplier = selectedTransport === 'motorcycle' ? 1.15 : selectedTransport === 'bus' ? 0.75 : 1.0;
  const roadPenalty = spot.accessibilityStatus === 'limited' ? 1.3 : spot.accessibilityStatus === 'inaccessible' ? 2.0 : 1.0;
  const baseDurationMins = Math.round((baseDistanceKm / 45) * 60 / speedMultiplier * roadPenalty);

  // Generate intermediate waypoint line points for SVG rendering
  const generatePathPoints = () => {
    const pts = [{ x: origin.coords.x, y: origin.coords.y }];
    
    // Intermediate point on Sayre highway corridor
    const midY = (origin.coords.y + spot.coords.y) / 2;
    const midX = 250; // Central corridor
    pts.push({ x: midX, y: midY });
    pts.push({ x: spot.coords.x, y: spot.coords.y });
    return pts;
  };

  const handleApply = () => {
    const hasWarning = spot.accessibilityStatus !== 'accessible' || spot.weather.rainProbability > 60;
    const warningText = spot.accessibilityReason || (spot.weather.rainProbability > 60 ? 'Heavy rain detected on mountain route.' : undefined);

    onApplyRouteToMap({
      originName: origin.name.split('/')[0].trim(),
      destinationName: spot.name,
      pathPoints: generatePathPoints(),
      distanceKm: baseDistanceKm,
      durationMins: baseDurationMins,
      hasWarning,
      warningText
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Bukidnon Highway & Trail Router</h2>
              <p className="text-xs text-emerald-300/80">Real-time distance, transit times & road condition verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200">
          
          {/* Origin and Destination Pickers */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                Departure Point (Origin)
              </label>
              <select
                value={selectedOriginId}
                onChange={(e) => setSelectedOriginId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              >
                {START_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Destination Tourist Attraction
              </label>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-sm font-semibold text-emerald-300 flex items-center justify-between">
                <span>{spot.name} ({spot.municipality})</span>
                <span className="text-xs text-slate-400 font-normal">Target Spot</span>
              </div>
            </div>
          </div>

          {/* Mode of Transport Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Transport Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTransport('car')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                  selectedTransport === 'car'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Car className="w-4 h-4 text-emerald-400" />
                <span>Car / Van / SUV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTransport('bus')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                  selectedTransport === 'bus'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bus className="w-4 h-4 text-teal-400" />
                <span>Bus / Public Van</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTransport('motorcycle')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                  selectedTransport === 'motorcycle'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-400" />
                <span>Habal-Habal / Bike</span>
              </button>
            </div>
          </div>

          {/* Route Calculation Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Recommended Route via Sayre Highway
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
                FASTEST ROUTE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Estimated Distance</span>
                <span className="text-2xl font-black text-white">{baseDistanceKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Estimated Transit Time</span>
                <span className="text-2xl font-black text-emerald-400">
                  {Math.floor(baseDurationMins / 60) > 0 ? `${Math.floor(baseDurationMins / 60)}h ` : ''}
                  {baseDurationMins % 60} mins
                </span>
              </div>
            </div>

            {/* Road Alert Notice if any */}
            {spot.accessibilityStatus !== 'accessible' && (
              <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Road Condition Advisory:</strong>
                  <span>{spot.accessibilityReason || 'Trail conditions affected by recent weather. Proceed with caution.'}</span>
                </div>
              </div>
            )}

            {/* Turn-by-Turn Simulated Instructions Preview */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="font-semibold text-slate-300 text-[11px] block">Driving Waypoints:</span>
              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>Depart from {origin.name.split('/')[0]} heading along Sayre Highway (Route 10 / AH26).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Follow municipality signage toward {spot.municipality} provincial intersection.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span>Arrive at {spot.name} entrance reception area ({spot.address}).</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Draw Route on Interactive Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
