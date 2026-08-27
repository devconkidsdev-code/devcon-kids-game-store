import React, { useState } from 'react';
import { TouristSpot, ItineraryDay } from '../types';
import { 
  X, 
  Map, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  ChevronRight,
  Sun,
  CloudRain
} from 'lucide-react';

interface TripPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  spots: TouristSpot[];
  onSelectSpot: (spot: TouristSpot) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  isOpen,
  onClose,
  spots,
  onSelectSpot,
}) => {
  const [tripPace, setTripPace] = useState<'moderate' | 'packed' | 'relaxed'>('moderate');
  const [selectedInterest, setSelectedInterest] = useState<'All-Around' | 'Adventure' | 'Nature & Relaxation' | 'Culture & Farm'>('All-Around');

  if (!isOpen) return null;

  // Generate 3-Day Plan considering live operational status & geographic corridor (North -> Central -> South)
  const itineraryDays: ItineraryDay[] = [
    {
      dayNumber: 1,
      title: 'Northern Gateway & High-Altitude Adventure (Manolo Fortich & Sumilao)',
      items: [
        {
          id: 'it-1',
          spotId: 'del-monte-pineapple-plantation',
          spotName: 'Del Monte Pineapple Plantation & Giant Pineapple',
          time: '08:30 AM - 10:30 AM',
          duration: '2 Hours',
          notes: 'Scenic photo-stop at giant pineapple statue and plantation drive.',
          cost: 0,
          status: spots.find(s => s.id === 'del-monte-pineapple-plantation')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Sunny (27°C)',
        },
        {
          id: 'it-2',
          spotId: 'dahilayan-adventure-park',
          spotName: 'Dahilayan Adventure Park',
          time: '11:00 AM - 03:30 PM',
          duration: '4.5 Hours',
          notes: 'Ride Asia’s longest dual zipline and Razorback alpine coaster. Enjoy pine forest cool air.',
          cost: 950,
          status: spots.find(s => s.id === 'dahilayan-adventure-park')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Partly Cloudy (21°C)',
        },
        {
          id: 'it-3',
          spotId: 'alalum-falls-sumilao',
          spotName: 'Alalum Falls View Deck',
          time: '04:15 PM - 05:15 PM',
          duration: '1 Hour',
          notes: 'Roadside waterfall stop along Sayre Highway with fresh Bukidnon binaki snack.',
          cost: 30,
          status: spots.find(s => s.id === 'alalum-falls-sumilao')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Light Rain (22°C)',
        }
      ]
    },
    {
      dayNumber: 2,
      title: 'Cowboy Country & Malaybalay Heritage (Impasug-ong & Malaybalay)',
      items: [
        {
          id: 'it-4',
          spotId: 'communal-ranch-impasugong',
          spotName: 'Impasug-ong Communal Ranch',
          time: '06:00 AM - 09:30 AM',
          duration: '3.5 Hours',
          notes: 'Sunrise over rolling golden hills, horseback riding with local wranglers.',
          cost: 300,
          status: spots.find(s => s.id === 'communal-ranch-impasugong')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Sunny (24°C)',
        },
        {
          id: 'it-5',
          spotId: 'kaamulan-park-malaybalay',
          spotName: 'Kaamulan Grounds & Tribal Museum',
          time: '11:00 AM - 01:30 PM',
          duration: '2.5 Hours',
          notes: 'Explore 7 indigenous tribes cultural longhouses and ethnic artisan crafts.',
          cost: 20,
          status: spots.find(s => s.id === 'kaamulan-park-malaybalay')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Sunny (24°C)',
        },
        {
          id: 'it-6',
          spotId: 'monastery-transfiguration-malaybalay',
          spotName: 'Monastery of the Transfiguration',
          time: '02:30 PM - 04:30 PM',
          duration: '2 Hours',
          notes: 'Leandro Locsin pyramid architecture and authentic Monk’s Blend coffee tasting.',
          cost: 50,
          status: spots.find(s => s.id === 'monastery-transfiguration-malaybalay')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Partly Cloudy (23°C)',
        }
      ]
    },
    {
      dayNumber: 3,
      title: 'Southern Volcanic Lakes & Mountain Pass Panoramas (Valencia & Quezon)',
      items: [
        {
          id: 'it-7',
          spotId: 'lake-apo-valencia',
          spotName: 'Lake Apo Nature Park',
          time: '08:00 AM - 12:00 PM',
          duration: '4 Hours',
          notes: 'Floating bamboo raft cottage lunch, calm lake kayaking, and fresh tilapia grill.',
          cost: 400,
          status: spots.find(s => s.id === 'lake-apo-valencia')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Partly Cloudy (26°C)',
        },
        {
          id: 'it-8',
          spotId: 'overview-nature-park-quezon',
          spotName: 'Overview Nature & Culture Park (BuDa Highway)',
          time: '02:00 PM - 04:30 PM',
          duration: '2.5 Hours',
          notes: 'Highland observation deck, tribal monument statues, and sweeping valley views.',
          cost: 50,
          status: spots.find(s => s.id === 'overview-nature-park-quezon')?.operatingStatus || 'open',
          accessibility: 'accessible',
          weather: 'Foggy / Overcast (19°C)',
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="trip-planner-modal"
        className="relative w-full max-w-3xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl text-stone-100 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Curated 3-Day Bukidnon Itinerary</h2>
              <p className="text-xs text-stone-400">Optimized along Sayre Highway corridor with live operational verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {itineraryDays.map((day) => (
            <div key={day.dayNumber} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-xl">
                  DAY {day.dayNumber}
                </span>
                <h3 className="text-sm font-bold text-stone-200">{day.title}</h3>
              </div>

              <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-emerald-700/50">
                {day.items.map((item) => {
                  const spotObj = spots.find(s => s.id === item.spotId);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-stone-800/70 hover:bg-stone-800 border border-stone-700/80 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{item.spotName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.status === 'open'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/40'
                              : 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-300">{item.notes}</div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sky-400" />
                            {item.time}
                          </span>
                          <span className="flex items-center gap-1">
                            {item.weather.includes('Rain') ? <CloudRain className="w-3 h-3 text-sky-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
                            {item.weather}
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            Est. Cost: {item.cost > 0 ? `₱${item.cost}` : 'Free'}
                          </span>
                        </div>
                      </div>

                      {spotObj && (
                        <button
                          onClick={() => {
                            onSelectSpot(spotObj);
                            onClose();
                          }}
                          className="self-end sm:self-auto px-3 py-1.5 bg-stone-700 hover:bg-emerald-600 text-stone-200 hover:text-white rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1"
                        >
                          <span>View on Map</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>All times factor in Bukidnon mountain highway speed limits (~45-55 km/h)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
          >
            Close Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};
