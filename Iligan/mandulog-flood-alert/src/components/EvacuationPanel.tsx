import React from 'react';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { UserProfile } from '../types';
import { EVACUATION_CENTERS } from '../data';

interface EvacuationPanelProps {
  userProfile: UserProfile;
}

export function EvacuationPanel({ userProfile }: EvacuationPanelProps) {
  const centers = EVACUATION_CENTERS[userProfile.barangay] || [];

  if (centers.length === 0) {
    return null;
  }

  const center = centers[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200 shadow-xl overflow-hidden relative mb-6">
      <div className="relative z-10">
        <h3 className="text-xs font-bold text-blue-400 uppercase mb-4 tracking-widest flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Evacuation Guide
        </h3>
        
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-tight">Active Center</p>
          <p className="text-lg font-bold leading-tight">{center.name}</p>
          <p className="text-xs text-blue-300 mt-1">Distance: {center.distance} km</p>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">{center.lat.toFixed(6)}, {center.lng.toFixed(6)}</p>
        </div>

        <div className="w-full h-40 rounded-lg overflow-hidden mb-6 border border-slate-700 bg-slate-800">
          <iframe
            title="Evacuation Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.01}%2C${center.lat - 0.01}%2C${center.lng + 0.01}%2C${center.lat + 0.01}&layer=mapnik&marker=${center.lat}%2C${center.lng}`}
          ></iframe>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-6 h-6 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">1</div>
            <p className="text-xs leading-relaxed text-slate-300">Secure your Go-Bags with legal documents and 3-day water supply.</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">2</div>
            <p className="text-xs leading-relaxed text-slate-300">Proceed to {center.name}. Follow official instructions.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-3">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 transition-colors text-xs font-bold">
            <Navigation className="h-4 w-4 mr-2" />
            NAVIGATE
          </a>
          <a href={`tel:${center.contact}`} className="flex items-center justify-center border border-slate-600 hover:bg-slate-800 text-white rounded-lg py-2 transition-colors text-xs font-bold">
            <Phone className="h-4 w-4 mr-2 text-slate-400" />
            {center.contact}
          </a>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-600/20 rounded-full blur-xl pointer-events-none"></div>
    </div>
  );
}
