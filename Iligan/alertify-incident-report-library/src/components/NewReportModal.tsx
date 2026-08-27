import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  Sparkles, 
  Upload, 
  AlertTriangle, 
  Check, 
  Loader2,
  FileText
} from 'lucide-react';
import { Incident, IncidentType, Severity, Urgency } from '../types';

interface NewReportModalProps {
  onClose: () => void;
  onSubmit: (newIncident: Incident) => void;
}

const BARANGAY_OPTIONS = [
  { name: 'Tibanga', mapX: 42, mapY: 34, lat: 8.2412, lng: 124.2443 },
  { name: 'Hinaplanon', mapX: 62, mapY: 28, lat: 8.2495, lng: 124.2571 },
  { name: 'Pala-o', mapX: 48, mapY: 52, lat: 8.2250, lng: 124.2490 },
  { name: 'San Miguel', mapX: 38, mapY: 48, lat: 8.2340, lng: 124.2380 },
  { name: 'Suarez', mapX: 25, mapY: 72, lat: 8.1980, lng: 124.2150 },
  { name: 'Tambacan', mapX: 30, mapY: 42, lat: 8.2315, lng: 124.2320 },
  { name: 'Pugaan', mapX: 78, mapY: 65, lat: 8.2120, lng: 124.2810 },
  { name: 'Tubod', mapX: 36, mapY: 60, lat: 8.2180, lng: 124.2380 },
  { name: 'Sta. Filomena', mapX: 50, mapY: 12, lat: 8.2700, lng: 124.2480 }
];

const SAMPLE_PHOTOS = [
  {
    label: 'Flooding',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80',
    type: 'Flooding' as IncidentType,
    severity: 'HIGH' as Severity,
    urgency: 'URGENT' as Urgency
  },
  {
    label: 'Road Debris',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=900&q=80',
    type: 'Road Obstruction' as IncidentType,
    severity: 'MEDIUM' as Severity,
    urgency: 'NEEDS_ATTENTION' as Urgency
  },
  {
    label: 'Landslide',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=900&q=80',
    type: 'Landslide' as IncidentType,
    severity: 'HIGH' as Severity,
    urgency: 'URGENT' as Urgency
  },
  {
    label: 'Power Wire',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80',
    type: 'Power Hazard' as IncidentType,
    severity: 'HIGH' as Severity,
    urgency: 'URGENT' as Urgency
  }
];

export const NewReportModal: React.FC<NewReportModalProps> = ({ onClose, onSubmit }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTOS[0]);
  const [locationName, setLocationName] = useState('Pala-o Overpass / Main St');
  const [selectedBarangay, setSelectedBarangay] = useState(BARANGAY_OPTIONS[2]);
  const [description, setDescription] = useState('Flood water is rapidly rising past the sidewalk. Motorists cannot see road edges.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simulate AI parsing pipeline latency
    setTimeout(() => {
      const randomCode = `ALT-2026-${Math.floor(8830 + Math.random() * 90)}`;
      
      const newIncident: Incident = {
        id: `inc-${Date.now()}`,
        reportCode: randomCode,
        title: `${selectedPhoto.type} reported in ${selectedBarangay.name}`,
        type: selectedPhoto.type,
        severity: selectedPhoto.severity,
        urgency: selectedPhoto.urgency,
        status: 'Reported',
        location: {
          name: locationName || `${selectedBarangay.name} Main Road`,
          barangay: selectedBarangay.name,
          city: 'Iligan City',
          coordinates: {
            lat: selectedBarangay.lat,
            lng: selectedBarangay.lng,
            formatted: `${selectedBarangay.lat.toFixed(4)}° N, ${selectedBarangay.lng.toFixed(4)}° E`
          },
          mapX: selectedBarangay.mapX,
          mapY: selectedBarangay.mapY
        },
        summary: description.slice(0, 100) || `${selectedPhoto.type} actively reported by citizen.`,
        citizenDescription: description,
        imageUrl: selectedPhoto.url,
        hasImage: true,
        reportedAt: 'Just now',
        reportedTimestamp: Date.now(),
        source: 'Citizen App',
        aiAnalysis: {
          incidentType: `${selectedPhoto.type} Ingestion`,
          confidence: 0.95,
          severityAssessment: selectedPhoto.severity,
          severityReasoning: 'Parsed from visual cues and semantic urgency indicators in citizen submission.',
          extractedLocation: `${selectedBarangay.name}, Iligan City`,
          keyHazards: ['Active hazard on roadway', 'Pedestrian passage restricted'],
          suggestedAction: 'CDRRMO verification team dispatch recommended.',
          modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
          analyzedAt: 'Just now'
        },
        timeline: [
          {
            id: `t-${Date.now()}-1`,
            time: 'Just now',
            title: 'Report Submitted',
            description: 'Submitted through Citizen Incident Reporter with GPS Geo-lock.',
            author: 'Citizen #Live',
            type: 'report'
          },
          {
            id: `t-${Date.now()}-2`,
            time: 'Just now',
            title: 'AI Analysis Complete',
            description: `Automated classifier assigned ${selectedPhoto.severity} severity and ${selectedPhoto.urgency} urgency.`,
            author: 'Alertify AI Core',
            type: 'ai_analysis'
          }
        ]
      };

      setIsAnalyzing(false);
      onSubmit(newIncident);
    }, 1200);
  };

  return (
    <div
      id="new-report-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="new-report-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-extrabold text-[#12304A]">
              Submit Citizen Incident Report
            </h2>
            <p className="text-xs text-[#64747F]">
              Ingest a new citizen photo and description for AI structuring.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#64747F] hover:text-[#12304A] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo Selection */}
          <div>
            <label className="block text-xs font-bold text-[#12304A] uppercase tracking-wider mb-2">
              1. Incident Photo
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {SAMPLE_PHOTOS.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className={`relative rounded-lg overflow-hidden h-20 border-2 transition-all ${
                    selectedPhoto.label === photo.label
                      ? 'border-[#168AAD] ring-2 ring-[#168AAD]/30'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1">
                    <span className="text-[10px] font-bold text-white leading-tight">
                      {photo.label}
                    </span>
                  </div>
                  {selectedPhoto.label === photo.label && (
                    <div className="absolute top-1 right-1 bg-[#168AAD] text-white rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#64747F]">
              Select from real-world disaster report samples for AI vision classification.
            </p>
          </div>

          {/* Location Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#12304A] uppercase tracking-wider mb-1.5">
                2. Barangay Location
              </label>
              <select
                value={selectedBarangay.name}
                onChange={(e) => {
                  const b = BARANGAY_OPTIONS.find((opt) => opt.name === e.target.value);
                  if (b) setSelectedBarangay(b);
                }}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 text-[#12304A] focus:outline-none focus:border-[#168AAD]"
              >
                {BARANGAY_OPTIONS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} (Iligan City)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12304A] uppercase tracking-wider mb-1.5">
                Specific Landmark / Street
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Near Market Footbridge"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-[#12304A] focus:outline-none focus:border-[#168AAD]"
                required
              />
            </div>
          </div>

          {/* Citizen Description */}
          <div>
            <label className="block text-xs font-bold text-[#12304A] uppercase tracking-wider mb-1.5">
              3. Citizen Description (Optional Notes)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see: water depth, blocked lanes, hazards..."
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-[#12304A] focus:outline-none focus:border-[#168AAD]"
              required
            />
          </div>

          {/* AI Feature Pill Preview */}
          <div className="bg-[#12304A]/5 rounded-xl p-3.5 border border-[#168AAD]/20 flex items-start gap-2.5 text-xs text-[#12304A]">
            <Sparkles className="w-4 h-4 text-[#168AAD] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Alertify AI Pipeline:</span>
              <p className="text-[11px] text-[#64747F] mt-0.5">
                Upon submission, Alertify extracts severity ({selectedPhoto.severity}), urgency ({selectedPhoto.urgency}), and structures actionable response items automatically.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64747F] hover:text-[#12304A]"
            >
              Cancel
            </button>
            <button
              id="submit-new-incident-btn"
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 bg-[#12304A] hover:bg-[#168AAD] disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-xs"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Parsing Incident...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Process & Publish Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
