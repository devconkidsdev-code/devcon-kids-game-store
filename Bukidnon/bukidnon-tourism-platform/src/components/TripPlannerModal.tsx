import React, { useState } from 'react';
import { TouristSpot } from '../types';
import { 
  X, 
  CalendarDays, 
  Compass, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2,
  ArrowRight,
  Info
} from 'lucide-react';

interface TripPlannerModalProps {
  spots: TouristSpot[];
  onClose: () => void;
  onSelectSpotForDetail: (spot: TouristSpot) => void;
}

const PRESET_ITINERARIES = [
  {
    id: 'it-3day-adv',
    title: '3-Day High-Altitude Adrenaline & Nature Trail',
    durationDays: 3,
    description: 'Zip through pine forests in Manolo Fortich, cruise across Lake Apo, and experience the cowboy hills of Impasug-ong.',
    days: [
      {
        day: 1,
        title: 'Northern Adventure & Pines',
        stops: [
          { time: '08:30 AM', spotId: 1, activity: 'Dual Zipline & Razorback Coaster at Dahilayan' },
          { time: '01:00 PM', spotId: 8, activity: 'Roast beef lunch & scenic drive at Del Monte Clubhouse' },
          { time: '03:30 PM', spotId: 14, activity: 'Sky-Bike across river gorge at Kampo Juan' }
        ]
      },
      {
        day: 2,
        title: 'Highland Ranches & Waterfalls',
        stops: [
          { time: '07:30 AM', spotId: 4, activity: 'Horseback riding & sunrise photos at Communal Ranch' },
          { time: '11:00 AM', spotId: 7, activity: 'Gantungan Falls forest trek & cold spring dip at CEDAR' },
          { time: '02:30 PM', spotId: 5, activity: 'Viewing deck photo stop at Alalum Falls' }
        ]
      },
      {
        day: 3,
        title: 'Sacred Architecture & Crater Lake',
        stops: [
          { time: '09:00 AM', spotId: 6, activity: 'Monks’ Blend Coffee tasting at Monastery of Transfiguration' },
          { time: '01:30 PM', spotId: 3, activity: 'Floating bamboo cottage picnic & kayaking at Lake Apo' },
          { time: '04:30 PM', spotId: 11, activity: 'Turquoise natural spring swim at Nasuli Spring' }
        ]
      }
    ]
  },
  {
    id: 'it-2day-nature',
    title: '2-Day Relaxing Escapes & Glamping',
    durationDays: 2,
    description: 'Perfect weekend getaway featuring strawberries, sea of clouds, and mountain serenity.',
    days: [
      {
        day: 1,
        title: 'Sea of Clouds & Cultural Pine Park',
        stops: [
          { time: '06:00 AM', spotId: 9, activity: 'Sea of Clouds viewing at RotyPeaks Ridge Camp' },
          { time: '10:30 AM', spotId: 16, activity: 'Explore 7 Tribal Houses at Kaamulan Park' },
          { time: '02:00 PM', spotId: 6, activity: 'Architectural tour at Monastery of Transfiguration' }
        ]
      },
      {
        day: 2,
        title: 'Strawberries & Volcanic Vista',
        stops: [
          { time: '08:30 AM', spotId: 10, activity: 'Fresh strawberry harvesting at Taglucop Strawberry Hills' },
          { time: '01:00 PM', spotId: 13, activity: 'Panoramic hike at Mt. Musuan Peak & CMU fresh milk' },
          { time: '04:00 PM', spotId: 12, activity: 'Sunset mountain vistas at Overview Nature Park' }
        ]
      }
    ]
  }
];

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  spots,
  onClose,
  onSelectSpotForDetail
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('it-3day-adv');

  const activeItinerary =
    PRESET_ITINERARIES.find((it) => it.id === selectedPresetId) || PRESET_ITINERARIES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Bukidnon Itinerary Planner</h2>
              <p className="text-xs text-emerald-300/80">
                Optimized multi-day routes taking opening hours, weather & transit time into account
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

        {/* Preset Tabs */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {PRESET_ITINERARIES.map((it) => (
            <button
              key={it.id}
              onClick={() => setSelectedPresetId(it.id)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                selectedPresetId === it.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {it.title.split(' ')[0]} ({it.durationDays} Days)
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200 text-xs">
          <div>
            <h3 className="text-base font-bold text-white">{activeItinerary.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{activeItinerary.description}</p>
          </div>

          {/* Days Loop */}
          <div className="space-y-6">
            {activeItinerary.days.map((d) => (
              <div key={d.day} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      D{d.day}
                    </span>
                    <h4 className="font-bold text-white text-sm">Day {d.day}: {d.title}</h4>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">{d.stops.length} Planned Stops</span>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-3 pl-2">
                  {d.stops.map((stop, sIdx) => {
                    const spot = spots.find((s) => s.id === stop.spotId);
                    if (!spot) return null;

                    const isClosed = spot.operatingStatus === 'closed';
                    const hasWeatherRisk = spot.weather.rainProbability > 60;

                    return (
                      <div
                        key={sIdx}
                        className="relative pl-6 pb-2 border-l-2 border-slate-800 last:border-l-0 last:pb-0"
                      >
                        {/* Timeline Pin Dot */}
                        <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />

                        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {stop.time}
                              </span>
                              <span className="font-bold text-white text-sm truncate">{spot.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  spot.operatingStatus === 'open'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    : spot.operatingStatus === 'limited'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                    : 'bg-red-950 text-red-300 border border-red-500/40'
                                }`}
                              >
                                {spot.operatingStatus}
                              </span>
                            </div>

                            <p className="text-slate-300 text-xs">{stop.activity}</p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span>📍 {spot.municipality}</span>
                              <span>🎟️ {spot.entranceFee === 0 ? 'Free' : `₱${spot.entranceFee}`}</span>
                              <span>⛅ {spot.weather.temp}°C {spot.weather.condition}</span>
                            </div>

                            {/* Operational Warning if any */}
                            {isClosed && (
                              <div className="p-1.5 rounded bg-red-950/60 text-red-300 text-[10px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                <span>Note: Spot is currently closed. Owner reason: {spot.operatingStatusReason}</span>
                              </div>
                            )}

                            {hasWeatherRisk && (
                              <div className="p-1.5 rounded bg-amber-950/60 text-amber-300 text-[10px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>High rain probability ({spot.weather.rainProbability}%). Pack rain gear.</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              onSelectSpotForDetail(spot);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                          >
                            View Spot
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              All attractions are linked with real-time Bukidnon province operational schedules and live weather sensors.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg"
          >
            Close Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};
