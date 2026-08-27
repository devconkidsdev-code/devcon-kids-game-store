import React, { useState } from 'react';
import { Incident } from '../types';
import { SeverityBadge, UrgencyIndicator, StatusBadge } from './Badges';
import { MapPin } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
  isSelected?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ 
  incident, 
  onClick,
  isSelected = false
}) => {
  const [imageError, setImageError] = useState(false);
  const isResolved = incident.status === 'Resolved';
  const hasValidPhoto = incident.hasImage && incident.imageUrl && !imageError;

  return (
    <div
      id={`incident-card-${incident.id}`}
      onClick={onClick}
      className={`group bg-white rounded-xl card-shadow flex flex-col overflow-hidden relative cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-2 border-[#168AAD] ring-2 ring-[#168AAD]/15'
          : 'border border-slate-200 hover:border-slate-300 hover:shadow-md'
      } ${isResolved ? 'opacity-85 hover:opacity-100' : ''}`}
    >
      {/* 1. THUMBNAIL CONTAINER: Consistent size, object-cover, subtle rounded corners, integrated look */}
      <div className="w-full h-40 bg-slate-100 relative overflow-hidden shrink-0 border-b border-slate-100">
        {hasValidPhoto ? (
          <>
            <img
              src={incident.imageUrl}
              alt={incident.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Subtle gradient overlay to smoothly integrate into the card */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
          </>
        ) : (
          /* Subtle Cartographic / Map Location Placeholder for reports without an image */
          <div className="w-full h-full bg-slate-100 map-pattern flex flex-col items-center justify-center p-3 text-center relative select-none">
            {/* Radar rings */}
            <div className="absolute w-28 h-28 rounded-full border border-slate-300/60 pointer-events-none" />
            <div className="absolute w-16 h-16 rounded-full border border-slate-300/40 pointer-events-none" />
            
            <div className="z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white/90 shadow-2xs flex items-center justify-center text-[#168AAD] mb-1.5 border border-slate-200">
                <MapPin className="w-4 h-4 text-[#168AAD]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs">
                {incident.location.coordinates.formatted}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mt-1">
                GPS Geotag · No Photo Attached
              </span>
            </div>
          </div>
        )}

        {/* Severity Badge (Top-Right of Thumbnail) */}
        <div className="absolute top-2.5 right-2.5 z-10 shadow-xs pointer-events-none">
          <SeverityBadge severity={incident.severity} size="sm" />
        </div>

        {/* Status Badge (Top-Left of Thumbnail) */}
        <div className="absolute top-2.5 left-2.5 z-10 shadow-xs pointer-events-none">
          <StatusBadge status={incident.status} size="sm" />
        </div>

        {/* Incident Type Tag (Bottom-Left of Thumbnail) */}
        <div className="absolute bottom-2 left-2.5 z-10 pointer-events-none">
          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
            {incident.type}
          </span>
        </div>
      </div>

      {/* 2. INCIDENT CARD BODY (Strict Hierarchy: Title → Severity & Location & Urgency → Short Description) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* WHAT: Incident Title */}
          <h3 
            className={`font-bold text-base leading-tight mb-2 text-[#12304A] group-hover:text-[#168AAD] transition-colors line-clamp-2 ${
              isResolved ? 'text-slate-600' : ''
            }`}
          >
            {incident.title}
          </h3>

          {/* SEVERITY, LOCATION & URGENCY ROW */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-slate-500 mb-2.5">
            {/* WHERE: Location */}
            <span className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-[190px]">
              <MapPin className="w-3.5 h-3.5 text-[#168AAD] shrink-0" />
              <span className="truncate">{incident.location.barangay}, {incident.location.city}</span>
            </span>

            {/* HOW URGENT: Urgency Indicator */}
            <UrgencyIndicator urgency={incident.urgency} size="sm" />
          </div>

          {/* SHORT DESCRIPTION */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {incident.summary}
          </p>
        </div>

        {/* CARD FOOTER */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight truncate mr-2">
            {incident.reportedAt} · {incident.source}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1 ${
            isSelected ? 'text-[#168AAD]' : 'text-[#168AAD] group-hover:text-[#12304A]'
          }`}>
            <span>View Incident</span>
            <span className="text-sm">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};
