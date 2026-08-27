import React, { useState } from 'react';
import { Incident, Severity } from '../types';
import { SeverityBadge, UrgencyIndicator, StatusBadge } from './Badges';
import { MapPin, Navigation as NavIcon, Eye, ArrowRight, Layers, Compass, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenDetail: (incident: Incident) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onOpenDetail
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'all' | 'flooding' | 'landslide' | 'critical'>('all');
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);

  const filteredMapIncidents = incidents.filter((inc) => {
    if (activeLayer === 'flooding') return inc.type === 'Flooding';
    if (activeLayer === 'landslide') return inc.type === 'Landslide';
    if (activeLayer === 'critical') return inc.severity === 'HIGH' || inc.urgency === 'URGENT';
    return true;
  });

  return (
    <div className="relative w-full h-[640px] sm:h-[680px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col md:flex-row">
      {/* Interactive Map Canvas */}
      <div className="relative flex-1 h-full bg-[#0d1e2e] overflow-hidden select-none">
        {/* Background Cartography Grid / Topology Vector Map */}
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16324e" strokeWidth="0.8" />
            </pattern>
            {/* Water Gradient */}
            <linearGradient id="bay-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#081827" />
              <stop offset="100%" stopColor="#0d243a" />
            </linearGradient>
            {/* Land Gradient */}
            <linearGradient id="land-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#112538" />
              <stop offset="100%" stopColor="#0e1f30" />
            </linearGradient>
          </defs>

          {/* Ocean / Iligan Bay (West) */}
          <rect width="1000" height="700" fill="url(#bay-gradient)" />

          {/* Landmass Polygon (Iligan Mainland & Coastline) */}
          <path
            d="M 280,0 C 260,120 220,180 200,260 C 180,340 210,420 240,500 C 260,560 310,640 360,700 L 1000,700 L 1000,0 Z"
            fill="url(#land-gradient)"
            stroke="#1a3b5c"
            strokeWidth="2"
          />

          {/* Elevation Contours (Topography) */}
          <path
            d="M 600,0 C 580,180 520,320 620,480 C 680,560 740,650 820,700"
            fill="none"
            stroke="#1c3d5e"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          <path
            d="M 780,0 C 720,200 690,400 780,550 C 830,620 900,680 960,700"
            fill="none"
            stroke="#1c3d5e"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            opacity="0.4"
          />

          {/* Mandulog River Network (North-East to Coast) */}
          <path
            d="M 1000,140 Q 750,130 650,150 T 450,180 T 235,210"
            fill="none"
            stroke="#168AAD"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Agus River Network (South from Lake Lanao towards Coast) */}
          <path
            d="M 720,700 Q 560,580 460,520 T 320,470 T 215,480"
            fill="none"
            stroke="#168AAD"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Ditucalan Stream Tributary */}
          <path
            d="M 850,650 Q 680,610 580,580 T 460,520"
            fill="none"
            stroke="#168AAD"
            strokeWidth="3.5"
            opacity="0.7"
          />

          {/* Major National Arterial Highway */}
          <path
            d="M 270,0 L 250,140 L 230,280 L 260,450 L 330,600 L 400,700"
            fill="none"
            stroke="#2a527a"
            strokeWidth="4"
          />
          {/* Secondary Arterials */}
          <path
            d="M 230,280 L 480,310 L 780,450"
            fill="none"
            stroke="#224263"
            strokeWidth="2.5"
          />
          <path
            d="M 250,140 L 520,180 L 800,240"
            fill="none"
            stroke="#224263"
            strokeWidth="2"
          />

          {/* Subtle Grid Overlay */}
          <rect width="1000" height="700" fill="url(#grid-pattern)" opacity="0.7" />

          {/* Geographic Barangay Labels */}
          <g className="font-sans text-[11px] font-bold fill-[#4b7299] uppercase tracking-wider select-none pointer-events-none">
            <text x="70" y="320" fill="#2d5882" fontSize="13">Iligan Bay</text>
            <text x="350" y="220">Tibanga</text>
            <text x="550" y="190">Hinaplanon</text>
            <text x="420" y="360">San Miguel</text>
            <text x="480" y="420">Pala-o</text>
            <text x="240" y="380">Tambacan</text>
            <text x="320" y="520">Tubod</text>
            <text x="270" y="600">Suarez</text>
            <text x="680" y="460">Pugaan (Purok 6)</text>
            <text x="540" y="620">Ditucalan Basin</text>
            <text x="480" y="110">Sta. Filomena</text>
            <text x="620" y="130">Mandulog Bridge</text>
          </g>

          {/* Incident Geo-Pins */}
          {filteredMapIncidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const isHovered = hoveredIncident?.id === incident.id;
            const isUrgent = incident.urgency === 'URGENT';
            
            // Map coordinate percentages to 1000x700 viewBox
            const posX = (incident.location.mapX / 100) * 1000;
            const posY = (incident.location.mapY / 100) * 700;

            const pinColor = {
              HIGH: '#DC2626',
              MEDIUM: '#F28C28',
              LOW: '#16A34A'
            }[incident.severity];

            return (
              <g
                key={incident.id}
                id={`map-pin-${incident.id}`}
                transform={`translate(${posX}, ${posY})`}
                onClick={() => onSelectIncident(incident)}
                onMouseEnter={() => setHoveredIncident(incident)}
                onMouseLeave={() => setHoveredIncident(null)}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  transform: `translate(${posX}px, ${posY}px) ${isSelected || isHovered ? 'scale(1.25)' : 'scale(1)'}`
                }}
              >
                {/* Urgent radar pulse */}
                {isUrgent && (
                  <circle
                    r="24"
                    fill={pinColor}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Selection halo */}
                {isSelected && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeDasharray="4,2"
                  />
                )}

                {/* Outer shadow glow */}
                <circle
                  r="12"
                  fill="#000000"
                  opacity="0.4"
                  cy="2"
                />

                {/* Pin Head */}
                <circle
                  r="10"
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />

                {/* Inner dot */}
                <circle
                  r="3.5"
                  fill="#FFFFFF"
                />
              </g>
            );
          })}
        </svg>

        {/* Map Header Floating Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Layer Filter Pills */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
            <span className="px-2 text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Layers:
            </span>
            {[
              { id: 'all', label: 'All Incidents' },
              { id: 'critical', label: 'Critical / Urgent' },
              { id: 'flooding', label: 'Floods' },
              { id: 'landslide', label: 'Landslides' }
            ].map((layer) => (
              <button
                key={layer.id}
                id={`map-layer-${layer.id}`}
                type="button"
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeLayer === layer.id
                    ? 'bg-[#168AAD] text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg p-1">
            <button
              id="map-zoom-in-btn"
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
              aria-label="Zoom in map"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              id="map-zoom-out-btn"
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              aria-label="Zoom out map"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              id="map-reset-view-btn"
              type="button"
              onClick={() => setZoomLevel(1)}
              aria-label="Reset map zoom"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Tooltip for Hovered Pin */}
        {hoveredIncident && (
          <div 
            className="absolute bottom-4 left-4 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white rounded-xl p-3.5 shadow-2xl max-w-xs z-20"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <SeverityBadge severity={hoveredIncident.severity} size="sm" />
              <UrgencyIndicator urgency={hoveredIncident.urgency} size="sm" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
              {hoveredIncident.title}
            </h4>
            <div className="flex items-center text-[11px] text-slate-300 mt-1">
              <MapPin className="w-3 h-3 mr-1 text-[#168AAD]" />
              <span className="truncate">{hoveredIncident.location.barangay}, {hoveredIncident.location.city}</span>
            </div>
          </div>
        )}
      </div>

      {/* Synchronized Side Drawer for Selected Map Pin */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shrink-0">
        {selectedIncident ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#64747F]">
                {selectedIncident.reportCode}
              </span>
              <StatusBadge status={selectedIncident.status} size="sm" />
            </div>

            {/* Thumbnail preview with fallback */}
            <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
              {selectedIncident.imageUrl && selectedIncident.hasImage ? (
                <img
                  src={selectedIncident.imageUrl}
                  alt={selectedIncident.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 map-pattern flex flex-col items-center justify-center p-2 text-center">
                  <MapPin className="w-5 h-5 text-[#168AAD] mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                    {selectedIncident.location.coordinates.formatted}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                    GPS Geotagged
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <SeverityBadge severity={selectedIncident.severity} size="sm" />
                <UrgencyIndicator urgency={selectedIncident.urgency} size="sm" />
              </div>
              <h3 className="text-base font-bold text-[#12304A] leading-snug">
                {selectedIncident.title}
              </h3>
            </div>

            <div className="space-y-1.5 text-xs text-[#64747F] bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-start gap-1.5 text-[#12304A] font-medium">
                <MapPin className="w-4 h-4 text-[#168AAD] shrink-0 mt-0.5" />
                <span>{selectedIncident.location.name}, {selectedIncident.location.barangay}</span>
              </div>
              <div className="text-[11px] font-mono text-[#64747F] pl-5">
                {selectedIncident.location.coordinates.formatted}
              </div>
            </div>

            <p className="text-xs text-[#64747F] leading-relaxed">
              {selectedIncident.summary}
            </p>

            <button
              id="map-drawer-view-detail-btn"
              type="button"
              onClick={() => onOpenDetail(selectedIncident)}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#12304A] hover:bg-[#168AAD] text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-xs"
            >
              <span>Inspect Full Incident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#64747F]">
            <NavIcon className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-[#12304A] mb-1">
              Select an Incident Pin
            </h4>
            <p className="text-xs leading-relaxed max-w-[200px]">
              Click any incident marker on the cartographic map to inspect details, coordinates, and response status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
