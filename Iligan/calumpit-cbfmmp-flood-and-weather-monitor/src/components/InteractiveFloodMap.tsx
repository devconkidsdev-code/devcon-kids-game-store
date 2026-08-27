import React, { useState } from 'react';
import { MapPin, Navigation, Siren, Shield, Waves, AlertTriangle, Layers, Maximize2, X, Phone, LifeBuoy } from 'lucide-react';
import { BarangayFloodInfo, EvacuationCenter, RiverStation } from '../types/flood';

interface InteractiveFloodMapProps {
  barangays: BarangayFloodInfo[];
  riverStations: RiverStation[];
  evacuationCenters: EvacuationCenter[];
  selectedBarangay: BarangayFloodInfo | null;
  onSelectBarangay: (b: BarangayFloodInfo | null) => void;
  language: 'tl' | 'en';
  onFindRoute: (b: BarangayFloodInfo) => void;
  onSosRequest: (b: BarangayFloodInfo) => void;
}

export const InteractiveFloodMap: React.FC<InteractiveFloodMapProps> = ({
  barangays,
  riverStations,
  evacuationCenters,
  selectedBarangay,
  onSelectBarangay,
  language,
  onFindRoute,
  onSosRequest
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'flood' | 'sirens' | 'shelters'>('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getBarangayColor = (status: BarangayFloodInfo['status']) => {
    switch (status) {
      case 'red':
        return '#ef4444'; // Red-500
      case 'orange':
        return '#f97316'; // Orange-500
      case 'yellow':
        return '#eab308'; // Yellow-500
      default:
        return '#10b981'; // Emerald-500
    }
  };

  const getBarangayFillOpacity = (status: BarangayFloodInfo['status']) => {
    switch (status) {
      case 'red':
        return '0.75';
      case 'orange':
        return '0.55';
      case 'yellow':
        return '0.35';
      default:
        return '0.15';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
      
      {/* Map Header & Filter Controls */}
      <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-900/90">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {language === 'tl' ? 'Interaktibong Mapa ng Baha sa Calumpit' : 'Interactive Calumpit Flood Inundation Map'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-cyan-400 border border-neutral-700">
                  29 Barangays
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'tl'
                  ? 'I-click ang alinmang barangay upang makita ang lalim ng baha, impassable na kalsada, at pinakamalapit na evacuation center.'
                  : 'Click any barangay zone to inspect flood depth, road passability, and emergency routing.'}
              </p>
            </div>
          </div>
        </div>

        {/* Map Layers Selector */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-lg border border-neutral-700 text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeLayer === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-neutral-300 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Lahat' : 'All Layers'}
          </button>
          <button
            onClick={() => setActiveLayer('flood')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeLayer === 'flood' ? 'bg-cyan-600 text-white shadow' : 'text-neutral-300 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Baha' : 'Flood Zones'}
          </button>
          <button
            onClick={() => setActiveLayer('sirens')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeLayer === 'sirens' ? 'bg-cyan-600 text-white shadow' : 'text-neutral-300 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Sirena' : 'Sirens'}
          </button>
          <button
            onClick={() => setActiveLayer('shelters')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeLayer === 'shelters' ? 'bg-cyan-600 text-white shadow' : 'text-neutral-300 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Likasan' : 'Shelters'}
          </button>
        </div>
      </div>

      {/* Map Canvas & Detailed Inspection Layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 min-h-[480px]">
        
        {/* SVG Interactive Map Area (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 relative bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800">
          
          {/* Compass Rose & River Labels */}
          <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-2 rounded-lg text-[11px] text-neutral-300 font-mono space-y-1">
            <div className="flex items-center gap-1 text-cyan-400 font-bold">
              <span>▲ N</span> <span className="text-[10px] text-neutral-400">(Apalit / Pampanga)</span>
            </div>
            <div className="text-[10px] text-neutral-400">
              ◄ W: Hagonoy | E: Pulilan ►
            </div>
            <div className="text-[10px] text-neutral-400">
              ▼ S: Paombong / Malolos
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-neutral-900/85 backdrop-blur-sm border border-neutral-800 p-2.5 rounded-lg text-[10px] text-neutral-300 space-y-1.5 shadow-md">
            <div className="font-bold text-white mb-1">{language === 'tl' ? 'Talaan ng Kulay' : 'Flood Legend'}</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
              <span>{language === 'tl' ? 'Lubog (>4 talampakan / Bangka lang)' : 'Severe (>4ft / Boats Only)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
              <span>{language === 'tl' ? 'Katamtaman (2-4 talampakan)' : 'Moderate (2-4ft Flood)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500 inline-block"></span>
              <span>{language === 'tl' ? 'Mababang Baha (1-2 talampakan)' : 'Low Flood (1-2ft)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span>{language === 'tl' ? 'Normal / Ligtas' : 'Normal / Safe Ground'}</span>
            </div>
          </div>

          {/* Interactive SVG Cartography */}
          <svg
            viewBox="0 0 1000 900"
            className="w-full h-full max-h-[560px] select-none"
            aria-label="Calumpit Municipality Geographical Map"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              
              {/* Radial gradient for siren pulsation */}
              <radialGradient id="sirenGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Grid */}
            <rect width="1000" height="900" fill="url(#grid)" />

            {/* Calumpit Municipal Border Outline */}
            <path
              d="M 220 80 
                 C 350 70, 480 90, 580 110 
                 C 720 140, 850 250, 880 400 
                 C 900 520, 820 680, 750 760 
                 C 650 870, 450 900, 360 880 
                 C 250 850, 150 750, 140 600 
                 C 130 480, 160 250, 220 80 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="3"
              strokeDasharray="6 4"
            />

            {/* Pampanga River Main Channel (North to South/West) */}
            <path
              d="M 280 80 
                 C 320 180, 360 250, 380 320 
                 C 410 400, 460 440, 490 490 
                 C 510 540, 460 620, 420 700 
                 C 380 780, 330 840, 280 880"
              fill="none"
              stroke="#0284c7"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Angat River Channel (East to Confluence at Calumpit) */}
            <path
              d="M 860 420 
                 C 760 440, 680 460, 590 470 
                 C 540 480, 510 485, 490 490"
              fill="none"
              stroke="#0369a1"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Labangan Floodway Channel Bypass */}
            <path
              d="M 490 490 
                 C 530 580, 580 660, 640 760 
                 C 680 820, 700 860, 720 900"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.6"
              strokeDasharray="8 4"
            />

            {/* Waterway Flow Markers & Labels */}
            <text x="310" y="140" fill="#7dd3fc" fontSize="14" fontWeight="bold" fontFamily="monospace" transform="rotate(35 310 140)">
              Pampanga River ▼
            </text>
            <text x="700" y="445" fill="#7dd3fc" fontSize="14" fontWeight="bold" fontFamily="monospace">
              ◄ Angat River (From Bustos)
            </text>
            <text x="560" y="650" fill="#bae6fd" fontSize="12" fontWeight="bold" fontFamily="monospace" transform="rotate(45 560 650)">
              Labangan Floodway ▼
            </text>

            {/* 29 Barangay Polygonal / Circle Risk Zones */}
            {barangays.map((b) => {
              const cx = b.coordinates.x * 10;
              const cy = b.coordinates.y * 9;
              const isSelected = selectedBarangay?.id === b.id;
              const isHovered = hoveredItem === b.id;
              const color = getBarangayColor(b.status);
              const opacity = getBarangayFillOpacity(b.status);

              return (
                <g
                  key={b.id}
                  id={`map-barangay-${b.id}`}
                  onClick={() => onSelectBarangay(b)}
                  onMouseEnter={() => setHoveredItem(b.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="cursor-pointer transition-transform duration-200"
                >
                  {/* Outer Risk Halo */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 42 : isHovered ? 36 : 28}
                    fill={color}
                    fillOpacity={opacity}
                    stroke={isSelected ? '#ffffff' : color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-300"
                  />

                  {/* Barangay Center Node */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 10 : 7}
                    fill={isSelected ? '#ffffff' : color}
                    stroke="#000000"
                    strokeWidth="1.5"
                  />

                  {/* Barangay Label */}
                  <text
                    x={cx}
                    y={cy - (isSelected ? 22 : 16)}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize={isSelected ? "14" : "11"}
                    fontWeight={isSelected ? "bold" : "600"}
                    className="pointer-events-none drop-shadow-md"
                  >
                    {b.name}
                  </text>

                  {/* Flood Depth Tag */}
                  {b.floodDepthFeet > 0 && (
                    <text
                      x={cx}
                      y={cy + (isSelected ? 24 : 18)}
                      textAnchor="middle"
                      fill={b.status === 'red' ? '#fca5a5' : '#fde047'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none"
                    >
                      {b.floodDepthFeet}ft
                    </text>
                  )}
                </g>
              );
            })}

            {/* Siren Warning Towers Layer */}
            {(activeLayer === 'all' || activeLayer === 'sirens') &&
              barangays.filter(b => b.sirenActive).map(b => {
                const sx = b.coordinates.x * 10;
                const sy = b.coordinates.y * 9;
                return (
                  <g key={`siren-${b.id}`} className="pointer-events-none">
                    {/* Animated Pulsing Sound Wave Circle */}
                    <circle
                      cx={sx}
                      cy={sy}
                      r="48"
                      fill="url(#sirenGlow)"
                      className="animate-ping"
                      opacity="0.6"
                    />
                    <circle
                      cx={sx}
                      cy={sy}
                      r="14"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={sx}
                      y={sy + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      !
                    </text>
                  </g>
                );
              })}

            {/* Evacuation Center Shelters Layer */}
            {(activeLayer === 'all' || activeLayer === 'shelters') &&
              evacuationCenters.map(ec => {
                const ex = ec.coordinates.x * 10;
                const ey = ec.coordinates.y * 9;
                return (
                  <g
                    key={`ec-${ec.id}`}
                    className="cursor-pointer"
                    onClick={() => {
                      const matchingB = barangays.find(b => b.id === ec.barangay.toLowerCase());
                      if (matchingB) onSelectBarangay(matchingB);
                    }}
                  >
                    <rect
                      x={ex - 12}
                      y={ey - 12}
                      width="24"
                      height="24"
                      rx="6"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-lg hover:scale-125 transition transform origin-center"
                    />
                    <text
                      x={ex}
                      y={ey + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      H
                    </text>
                  </g>
                );
              })}

            {/* River Telemetry Sensor Pins Layer */}
            {(activeLayer === 'all' || activeLayer === 'flood') &&
              riverStations.map(st => {
                const px = st.coordinates.x * 10;
                const py = st.coordinates.y * 9;
                return (
                  <g key={`sensor-${st.id}`} className="cursor-pointer">
                    <circle
                      cx={px}
                      cy={py}
                      r="11"
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={px}
                      y={py + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {st.currentLevel.toFixed(1)}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Selected Barangay / Zone Inspector Panel */}
        <div className="p-4 sm:p-5 bg-neutral-900 flex flex-col justify-between">
          {selectedBarangay ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    {selectedBarangay.zone} Zone • {selectedBarangay.elevationCategory}
                  </span>
                  <h4 className="text-xl font-extrabold text-white flex items-center gap-2">
                    Barangay {selectedBarangay.name}
                  </h4>
                </div>
                <button
                  onClick={() => onSelectBarangay(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge & Flood Height */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`p-3 rounded-lg border ${
                  selectedBarangay.status === 'red'
                    ? 'bg-red-950/40 border-red-700/60 text-red-300'
                    : selectedBarangay.status === 'orange'
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                    : selectedBarangay.status === 'yellow'
                    ? 'bg-yellow-950/40 border-yellow-700/60 text-yellow-300'
                    : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider block text-neutral-400">
                    {language === 'tl' ? 'Lalim ng Baha' : 'Flood Depth'}
                  </span>
                  <div className="text-xl font-extrabold font-mono text-white mt-0.5">
                    {selectedBarangay.floodDepthFeet} ft
                    <span className="text-xs text-neutral-400 font-normal ml-1">
                      ({selectedBarangay.floodDepthMeters}m)
                    </span>
                  </div>
                  <span className="text-[10px] capitalize block mt-0.5">
                    {language === 'tl'
                      ? selectedBarangay.trend === 'rising' ? '▲ Tumataas ang tubig' : '▼ Bumababa ang tubig'
                      : `${selectedBarangay.trend} trend`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700/60">
                  <span className="text-[10px] uppercase font-bold tracking-wider block text-neutral-400">
                    {language === 'tl' ? 'Katayuan sa Paglikas' : 'Evacuation Status'}
                  </span>
                  <div className="text-sm font-bold uppercase text-white mt-1">
                    {selectedBarangay.evacuationStatus === 'mandatory' ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> MANDATORY
                      </span>
                    ) : selectedBarangay.evacuationStatus === 'preemptive' ? (
                      <span className="text-amber-400">PREEMPTIVE</span>
                    ) : selectedBarangay.evacuationStatus === 'voluntary' ? (
                      <span className="text-yellow-400">VOLUNTARY</span>
                    ) : (
                      <span className="text-emerald-400">NORMAL</span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-0.5 block">
                    {selectedBarangay.affectedFamilies} {language === 'tl' ? 'Pamilyang apektado' : 'Families affected'}
                  </span>
                </div>
              </div>

              {/* Road Passability */}
              <div className="p-3 rounded-lg bg-neutral-800/40 border border-neutral-700/40">
                <span className="text-[11px] font-bold text-neutral-300 block mb-1">
                  {language === 'tl' ? 'Kondisyon ng Kalsada (Passability)' : 'Road Passability Status'}:
                </span>
                <p className="text-xs text-neutral-200">
                  {selectedBarangay.roadPassability === 'impassable_boats_only' && (
                    <strong className="text-red-400">
                      🚫 {language === 'tl' ? 'Hindi madaanan ng sasakyan (Bangka / Rescue boats lamang)' : 'Not passable to all vehicles (Boats & amphibians only)'}
                    </strong>
                  )}
                  {selectedBarangay.roadPassability === 'light_vehicles_not_passable' && (
                    <strong className="text-amber-400">
                      ⚠️ {language === 'tl' ? 'Hindi madaanan ng magagaan na sasakyan (Trucks / High clearance lamang)' : 'Not passable to light vehicles (High-clearance trucks only)'}
                    </strong>
                  )}
                  {selectedBarangay.roadPassability === 'high_clearance' && (
                    <strong className="text-yellow-400">
                      ⚠️ {language === 'tl' ? 'Kailangan ng mataas na sasakyan' : 'High-clearance vehicles only'}
                    </strong>
                  )}
                  {selectedBarangay.roadPassability === 'all' && (
                    <strong className="text-emerald-400">
                      ✅ {language === 'tl' ? 'Madaanan ng lahat ng uri ng sasakyan' : 'Passable to all vehicles'}
                    </strong>
                  )}
                </p>
              </div>

              {/* Critical Spots */}
              {selectedBarangay.criticalSpots.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                    {language === 'tl' ? 'Mga Mapanganib / Binabahang Lugar' : 'Critical Hazard Spots'}:
                  </span>
                  <ul className="text-xs text-neutral-300 space-y-1 pl-4 list-disc">
                    {selectedBarangay.criticalSpots.map((spot, idx) => (
                      <li key={idx}>{spot}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons for Selected Barangay */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  id="barangay-find-route-btn"
                  onClick={() => onFindRoute(selectedBarangay)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{language === 'tl' ? 'Ruta ng Paglikas' : 'Find Evac Route'}</span>
                </button>
                <button
                  id="barangay-sos-btn"
                  onClick={() => onSosRequest(selectedBarangay)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 transition shadow"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>{language === 'tl' ? 'Humingi ng Saklolo' : 'Request Rescue'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-3 my-auto">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <MapPin className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-white">
                {language === 'tl' ? 'Pumili ng Barangay sa Mapa' : 'Select a Barangay on the Map'}
              </h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                {language === 'tl'
                  ? 'I-click ang bilog ng alinmang barangay upang makita ang antas ng baha, alert level, at bukas na evacuation center.'
                  : 'Click on any barangay circle marker to review flood elevation, road passability, and emergency shelter routes.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
