import React, { useState } from 'react';
import { X, MapPin, Sparkles, CheckCircle2, Truck, ChevronRight, Send, ArrowRight } from 'lucide-react';
import { Incident, IncidentStatus } from '../types';
import { SeverityBadge, UrgencyIndicator, StatusBadge } from './Badges';

interface IncidentDetailAsideProps {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onAssignUnit: (incidentId: string, unitName: string) => void;
  onVerifyIncident: (incidentId: string) => void;
  onViewOnMap: (incident: Incident) => void;
}

export const IncidentDetailAside: React.FC<IncidentDetailAsideProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onAssignUnit,
  onVerifyIncident,
  onViewOnMap
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const availableUnits = [
    'CDRRMO Water Rescue Team Alpha',
    'CDRRMO Rescue Unit 1',
    'City Engineering Clearing Team B',
    'Heavy Equipment Response Alpha',
    'ILPI Emergency Feeder Unit 4',
    'Philippine Coast Guard Substation Iligan'
  ];

  const hasPhoto = incident.hasImage && incident.imageUrl && !imageError;

  return (
    <aside 
      id={`incident-detail-aside-${incident.id}`}
      className="w-full lg:w-[380px] xl:w-[420px] bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden card-shadow shrink-0 transition-all"
    >
      {/* Aside Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50">
        <div className="flex justify-between items-start mb-2.5">
          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold uppercase tracking-widest text-slate-600">
            CASE #{incident.reportCode}
          </span>
          <button 
            type="button" 
            onClick={onClose}
            aria-label="Close panel"
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-xl font-bold leading-tight text-[#12304A]">
          {incident.title}
        </h2>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SeverityBadge severity={incident.severity} size="sm" />
          <StatusBadge status={incident.status} size="sm" />
          <UrgencyIndicator urgency={incident.urgency} size="sm" />
        </div>
      </div>

      {/* Aside Scrollable Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
        {/* Incident Thumbnail / Photo Header */}
        <div className="h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
          {hasPhoto ? (
            <img
              src={incident.imageUrl}
              alt={incident.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 map-pattern flex flex-col items-center justify-center p-3 text-center relative select-none">
              <div className="w-8 h-8 rounded-full bg-white/90 shadow-2xs flex items-center justify-center text-[#168AAD] mb-1.5 border border-slate-200">
                <MapPin className="w-4 h-4 text-[#168AAD]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200/80">
                {incident.location.coordinates.formatted}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mt-1">
                GPS Geo-Tagged · No Citizen Photo
              </span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
            Submitted via {incident.source}
          </div>
        </div>

        {/* AI Analysis Grid */}
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#168AAD]" />
            <span>AI Analysis</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
              <div className="text-[9px] text-slate-500 font-bold uppercase">Incident Type</div>
              <div className="text-xs font-bold text-[#12304A] mt-0.5">{incident.aiAnalysis.incidentType}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
              <div className="text-[9px] text-slate-500 font-bold uppercase">Confidence Score</div>
              <div className="text-xs font-bold text-[#168AAD] mt-0.5">{Math.round(incident.aiAnalysis.confidence * 100)}%</div>
            </div>
          </div>
          <div className="mt-2 p-2.5 bg-slate-50 rounded border border-slate-100">
            <div className="text-[9px] text-slate-500 font-bold uppercase">AI Recommended Action</div>
            <div className="text-[11px] text-[#12304A] font-medium mt-0.5 leading-normal">
              {incident.aiAnalysis.suggestedAction}
            </div>
          </div>
        </div>

        {/* Location Detail */}
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
            Location Detail
          </h4>
          <div className="text-sm mb-0.5 font-bold text-[#12304A]">
            📍 {incident.location.name}, {incident.location.barangay}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {incident.location.coordinates.formatted}
          </div>
          
          {/* Tactical map preview button */}
          <div 
            onClick={() => onViewOnMap(incident)}
            className="mt-2.5 h-20 w-full bg-slate-100 map-pattern border border-slate-200 rounded-md relative flex items-center justify-center cursor-pointer hover:border-[#168AAD] transition-colors group"
          >
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#168AAD] transition-colors flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded shadow-2xs">
              <MapPin className="w-3 h-3 text-[#168AAD]" />
              <span>Click to Focus on Map</span>
            </span>
          </div>
        </div>

        {/* Citizen Description */}
        <div>
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
            Citizen Description
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50/70 p-3 rounded-lg border border-slate-100">
            "{incident.citizenDescription}"
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Reported {incident.reportedAt} via {incident.source}
          </span>
        </div>

        {/* Assigned Team */}
        {incident.assignedUnit && (
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#168AAD]" />
              <span>Assigned Team</span>
            </h4>
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg">
              <div className="font-bold text-[#12304A] text-xs">{incident.assignedUnit.name}</div>
              <div className="text-[10px] text-slate-500">{incident.assignedUnit.agency} · Status: {incident.assignedUnit.status}</div>
            </div>
          </div>
        )}
      </div>

      {/* Aside Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2 shrink-0">
        {incident.status !== 'Verified' ? (
          <button
            id="aside-verify-btn"
            type="button"
            onClick={() => onVerifyIncident(incident.id)}
            className="w-full py-2.5 bg-[#12304A] hover:bg-[#168AAD] text-white text-sm font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Mark as Verified
          </button>
        ) : (
          <div className="w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Incident Verified by Dispatch</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 relative">
          <button
            id="aside-assign-team-btn"
            type="button"
            onClick={() => {
              setShowUnitMenu(!showUnitMenu);
              setShowStatusMenu(false);
            }}
            className="py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
          >
            {incident.assignedUnit ? 'Reassign Team' : 'Assign Team'}
          </button>

          <button
            id="aside-update-status-btn"
            type="button"
            onClick={() => {
              setShowStatusMenu(!showStatusMenu);
              setShowUnitMenu(false);
            }}
            className="py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
          >
            Update Status
          </button>

          {/* Unit selection popover */}
          {showUnitMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Select Unit:</span>
              {availableUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    onAssignUnit(incident.id, u);
                    setShowUnitMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[11px] rounded hover:bg-slate-100 text-slate-700 font-medium truncate cursor-pointer"
                >
                  {u}
                </button>
              ))}
            </div>
          )}

          {/* Status selection popover */}
          {showStatusMenu && (
            <div className="absolute bottom-full right-0 mb-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Change Status:</span>
              {(['Reported', 'Under Review', 'Verified', 'Responding', 'Resolved'] as IncidentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onUpdateStatus(incident.id, st);
                    setShowStatusMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[11px] rounded hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
