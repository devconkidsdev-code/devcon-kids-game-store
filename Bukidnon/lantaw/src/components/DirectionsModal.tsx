import React, { useState } from 'react';
import { TouristSpot, CalculatedRoute } from '../types';
import { BUKIDNON_HUBS } from '../data/mockData';
import { 
  X, 
  Navigation, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  Fuel, 
  ShieldAlert,
  Car,
  Milestone
} from 'lucide-react';

interface DirectionsModalProps {
  spot: TouristSpot | null;
  onClose: () => void;
  onApplyRouteToMap: (route: CalculatedRoute) => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  spot,
  onClose,
  onApplyRouteToMap,
}) => {
  if (!spot) return null;

  const [originId, setOriginId] = useState<string>('malaybalay-capitol');
  const [routeType, setRouteType] = useState<'fastest' | 'shortest'>('fastest');

  const selectedOrigin = BUKIDNON_HUBS.find((h) => h.id === originId) || BUKIDNON_HUBS[4];

  // Calculate simulated distance and duration based on coordinate distances
  const dx = Math.abs(spot.mapCoordinates.x - selectedOrigin.x);
  const dy = Math.abs(spot.mapCoordinates.y - selectedOrigin.y);
  const baseDistanceKm = Math.round(Math.sqrt(dx * dx + dy * dy) * 1.8 + 12);
  const isShortest = routeType === 'shortest';
  const finalDistanceKm = isShortest ? Math.max(10, baseDistanceKm - 6) : baseDistanceKm;
  
  // Speed factor: Bukidnon mountain highways avg 45-55 km/h
  const avgSpeedKmh = isShortest ? 38 : 52; // Shortest takes narrower mountain roads
  const totalMinutes = Math.round((finalDistanceKm / avgSpeedKmh) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationFormatted = hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} mins`;
  const estimatedFuelPhp = Math.round((finalDistanceKm / 10) * 68); // ~10km/L @ 68/L

  // Road advisory check
  const hasRoadWarning = spot.accessibilityStatus !== 'accessible';
  const warningDetails = spot.accessibilityReason;

  // Generate simulated waypoints along Sayre Highway
  const waypoints = [
    { name: selectedOrigin.name, timeFromStart: '0 min', distanceKm: 0, note: 'Departure point' },
    { name: 'Sayre National Highway Corridor', timeFromStart: `${Math.round(totalMinutes * 0.35)} min`, distanceKm: Math.round(finalDistanceKm * 0.4), note: 'Main provincial highland artery' },
    { name: `${spot.municipality} Junction`, timeFromStart: `${Math.round(totalMinutes * 0.75)} min`, distanceKm: Math.round(finalDistanceKm * 0.8), note: 'Turn towards tourist corridor' },
    { name: spot.name, timeFromStart: durationFormatted, distanceKm: finalDistanceKm, note: 'Arrival at destination' }
  ];

  // SVG path points for the map
  const pathPoints = [
    { x: selectedOrigin.x, y: selectedOrigin.y },
    { x: (selectedOrigin.x + spot.mapCoordinates.x) / 2 + (isShortest ? -2 : 3), y: (selectedOrigin.y + spot.mapCoordinates.y) / 2 },
    { x: spot.mapCoordinates.x, y: spot.mapCoordinates.y }
  ];

  const currentRoute: CalculatedRoute = {
    origin: selectedOrigin.name,
    destination: spot,
    type: routeType,
    distanceKm: finalDistanceKm,
    durationFormatted,
    estimatedFuelPhp,
    hasRoadWarning,
    warningDetails,
    waypoints,
    pathPoints
  };

  const handleDisplayOnMap = () => {
    onApplyRouteToMap(currentRoute);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="directions-modal-content"
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl border border-sky-200">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Bukidnon Highway Directions</h2>
              <p className="text-xs text-slate-500">Calculated route across Sayre Highway & mountain corridors</p>
            </div>
          </div>
          <button
            id="btn-close-directions"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Origin & Destination Selector */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Select Your Starting Point (Origin)</span>
              </label>
              <select
                id="select-route-origin"
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              >
                {BUKIDNON_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} ({hub.municipality})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="text-[11px] uppercase font-bold text-slate-600 flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Destination Attraction</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl text-sm font-bold text-slate-900 flex items-center justify-between border border-slate-200 shadow-2xs">
                <span>{spot.name}</span>
                <span className="text-xs text-emerald-700 font-semibold">{spot.municipality}</span>
              </div>
            </div>
          </div>

          {/* Route Mode Toggles: Fastest vs Shortest */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRouteType('fastest')}
              className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-start border text-left ${
                routeType === 'fastest'
                  ? 'bg-sky-50 border-sky-400 text-sky-900 ring-2 ring-sky-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span>🚀 Fastest Route</span>
                {routeType === 'fastest' && <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-full">Selected</span>}
              </div>
              <div className="text-base font-extrabold text-slate-900">{durationFormatted}</div>
              <div className="text-[11px] text-slate-500">Via Sayre National Highway ({finalDistanceKm} km)</div>
            </button>

            <button
              onClick={() => setRouteType('shortest')}
              className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-start border text-left ${
                routeType === 'shortest'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span>🌿 Shortest Distance</span>
                {routeType === 'shortest' && <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full">Selected</span>}
              </div>
              <div className="text-base font-extrabold text-slate-900">{durationFormatted}</div>
              <div className="text-[11px] text-slate-500">Via Mountain Bypass Road ({finalDistanceKm} km)</div>
            </button>
          </div>

          {/* Road Warning Banner if applicable */}
          {hasRoadWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠️ Route Advisory: {spot.accessibilityStatus.toUpperCase()} ACCESS</span>
              </div>
              <p className="leading-relaxed">{warningDetails}</p>
              <p className="mt-1 text-[11px] text-slate-600">Vehicle requirement: <span className="font-semibold text-slate-900">{spot.vehicleRequirement || '4x4 / Guide'}</span></p>
            </div>
          )}

          {/* Quick Stats: Distance, Duration, Est. Fuel */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Total Distance</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">{finalDistanceKm} km</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Est. Drive Time</div>
              <div className="text-base font-extrabold text-sky-700 mt-0.5">{durationFormatted}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Estimated Fuel</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">₱{estimatedFuelPhp}</div>
            </div>
          </div>

          {/* Step-by-Step Waypoints */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <Milestone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Turn Guidance & Landmarks</span>
            </h3>
            <div className="space-y-2 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {waypoints.map((wp, i) => (
                <div key={i} className="flex items-start gap-3 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    i === 0 ? 'bg-emerald-600 text-white' : i === waypoints.length - 1 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{wp.name}</span>
                      <span className="text-[11px] text-sky-700 font-semibold">{wp.timeFromStart}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{wp.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedOrigin.name} → {spot.name}
          </span>
          <button
            id="btn-apply-route-to-map"
            onClick={handleDisplayOnMap}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Show Route on Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
