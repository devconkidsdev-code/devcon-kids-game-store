import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Clock, 
  User, 
  CheckCircle, 
  Send, 
  Radio, 
  ShieldCheck, 
  AlertOctagon, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Truck,
  MessageSquare
} from 'lucide-react';
import { Incident, IncidentStatus, Severity, Urgency } from '../types';
import { SeverityBadge, UrgencyIndicator, StatusBadge } from './Badges';

interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onAssignUnit: (incidentId: string, unitName: string) => void;
  onVerifyIncident: (incidentId: string) => void;
  onViewOnMap: (incident: Incident) => void;
  onAddNote: (incidentId: string, note: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onAssignUnit,
  onVerifyIncident,
  onViewOnMap,
  onAddNote
}) => {
  const [newNote, setNewNote] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(incident.assignedUnit?.name || '');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const availableUnits = [
    'CDRRMO Water Rescue Team Alpha',
    'CDRRMO Rescue Unit 1',
    'City Engineering Clearing Team B',
    'Heavy Equipment Response Alpha',
    'ILPI Emergency Feeder Unit 4',
    'Philippine Coast Guard Substation Iligan',
    'DPWH Bridge Structural Assessment Team',
    'BFP Engine 2 (Fire & Hazard)'
  ];

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(incident.id, newNote.trim());
    setNewNote('');
  };

  const handleUnitSelect = (unit: string) => {
    setSelectedUnit(unit);
    onAssignUnit(incident.id, unit);
    setShowUnitPicker(false);
  };

  return (
    <div 
      id="incident-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="incident-detail-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#64747F] bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {incident.reportCode}
            </span>
            <SeverityBadge severity={incident.severity} size="md" />
            <UrgencyIndicator urgency={incident.urgency} size="md" />
            <StatusBadge status={incident.status} size="md" />
          </div>

          <button
            id="close-detail-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Close incident detail"
            className="p-1.5 rounded-lg text-[#64747F] hover:text-[#12304A] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Title & Location */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#12304A] tracking-tight mb-2">
              {incident.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#12304A]">
              <div className="flex items-center font-medium">
                <MapPin className="w-4 h-4 mr-1 text-[#168AAD] shrink-0" />
                <span>{incident.location.name}, {incident.location.barangay}, {incident.location.city}</span>
              </div>
              <span className="text-xs font-mono text-[#64747F] bg-slate-100 px-2 py-0.5 rounded">
                {incident.location.coordinates.formatted}
              </span>
            </div>
          </div>

          {/* 2-Column Core Info Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Citizen Photo & Description */}
            <div className="space-y-4">
              {/* Photo */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                {incident.hasImage && incident.imageUrl ? (
                  <img
                    src={incident.imageUrl}
                    alt={incident.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-100 flex flex-col items-center justify-center p-6 text-center text-[#64747F]">
                    <MapPin className="w-8 h-8 text-[#168AAD] mb-2 opacity-60" />
                    <span className="text-sm font-semibold text-[#12304A]">No Photo Provided</span>
                    <span className="text-xs text-[#64747F] font-mono mt-1">{incident.location.coordinates.formatted}</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md font-medium">
                  Submitted via {incident.source}
                </div>
              </div>

              {/* Citizen Original Submission */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#12304A] uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5 text-[#168AAD]" />
                  <span>Citizen Submission</span>
                </div>
                <p className="text-sm text-[#12304A] italic leading-relaxed">
                  "{incident.citizenDescription}"
                </p>
                <div className="mt-2 text-[11px] text-[#64747F] flex items-center justify-between">
                  <span>Reported {incident.reportedAt}</span>
                  <span>Source: {incident.source}</span>
                </div>
              </div>
            </div>

            {/* Right Column: AI Analysis & Hazard Intelligence */}
            <div className="space-y-4">
              {/* Structured AI Analysis Box */}
              <div className="bg-[#12304A]/5 rounded-xl p-5 border border-[#168AAD]/20 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#12304A] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#168AAD]" />
                    <span>Structured AI Extraction</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#168AAD] bg-[#168AAD]/10 px-2 py-0.5 rounded">
                    {Math.round(incident.aiAnalysis.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-[13px]">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-[#64747F] font-medium">Incident Classification:</span>
                    <span className="font-bold text-[#12304A]">{incident.aiAnalysis.incidentType}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-[#64747F] font-medium">Extracted Location:</span>
                    <span className="font-semibold text-[#12304A] text-right">{incident.aiAnalysis.extractedLocation}</span>
                  </div>

                  <div className="py-1 border-b border-slate-200/60">
                    <span className="text-[#64747F] font-medium block mb-1">Identified Hazards:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {incident.aiAnalysis.keyHazards.map((hazard, i) => (
                        <span key={i} className="inline-flex items-center text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-2xs">
                          {hazard}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="py-1">
                    <span className="text-[#64747F] font-medium block mb-1">Recommended Response Action:</span>
                    <p className="text-xs text-[#12304A] bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
                      {incident.aiAnalysis.suggestedAction}
                    </p>
                  </div>

                  <div className="text-[10px] text-[#64747F] pt-1">
                    Engine: {incident.aiAnalysis.modelName}
                  </div>
                </div>
              </div>

              {/* Assignment & Operational Status */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-[#12304A] uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#168AAD]" />
                    <span>Assigned Response Unit</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUnitPicker(!showUnitPicker)}
                    className="text-xs text-[#168AAD] hover:underline font-semibold"
                  >
                    {incident.assignedUnit ? 'Reassign' : '+ Assign Unit'}
                  </button>
                </div>

                {showUnitPicker && (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold text-[#64747F] block px-1">Select Agency/Unit:</span>
                    {availableUnits.map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => handleUnitSelect(unit)}
                        className="w-full text-left px-2.5 py-1.5 text-xs rounded hover:bg-[#12304A] hover:text-white font-medium transition-colors"
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}

                {incident.assignedUnit ? (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs">
                    <div>
                      <div className="font-bold text-[#12304A]">{incident.assignedUnit.name}</div>
                      <div className="text-[11px] text-[#64747F]">{incident.assignedUnit.agency} · {incident.assignedUnit.contact}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-white text-[#12304A] font-semibold rounded text-[11px] border border-blue-200">
                      {incident.assignedUnit.status} {incident.assignedUnit.eta ? `(${incident.assignedUnit.eta})` : ''}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-[#64747F] italic">
                    No unit dispatched yet. Click above to assign municipal or CDRRMO crew.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Timeline & Responder Notes */}
          <div className="border-t border-slate-200/80 pt-5">
            <h3 className="text-sm font-bold text-[#12304A] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#168AAD]" />
              <span>Incident Audit & Action Log</span>
            </h3>

            <div className="space-y-3">
              {incident.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-[#168AAD] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#12304A]">{event.title}</span>
                      <span className="text-[11px] font-mono text-[#64747F]">{event.time}</span>
                    </div>
                    <p className="text-[#64747F] mt-0.5">{event.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">by {event.author}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Responder Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a responder update or field note..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#168AAD]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#12304A] hover:bg-[#168AAD] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Bottom Operational Actions Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
          {/* Status Changer */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#64747F]">Change Status:</span>
            <select
              id="detail-status-select"
              value={incident.status}
              onChange={(e) => onUpdateStatus(incident.id, e.target.value as IncidentStatus)}
              className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[#12304A] cursor-pointer focus:ring-2 focus:ring-[#168AAD]/20"
            >
              <option value="Reported">Reported</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Responding">Responding</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="view-on-map-btn"
              type="button"
              onClick={() => {
                onViewOnMap(incident);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 text-[#12304A] hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#168AAD]" />
              <span>Locate on Map</span>
            </button>

            {incident.status !== 'Verified' && (
              <button
                id="verify-incident-btn"
                type="button"
                onClick={() => onVerifyIncident(incident.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Verified</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#12304A] hover:bg-[#168AAD] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
