import React, { useState, useRef } from 'react';
import { TouristSpot, SpotCategory, CalculatedRoute } from '../types';
import { 
  CloudRain, 
  Sun, 
  CloudSun, 
  AlertTriangle, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Eye, 
  Navigation2, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MapPin,
  Sparkles,
  Car
} from 'lucide-react';

interface IllustratedMapProps {
  spots: TouristSpot[];
  selectedSpot: TouristSpot | null;
  onSelectSpot: (spot: TouristSpot) => void;
  onOpenDetails: (spot: TouristSpot) => void;
  onOpenBooking: (spot: TouristSpot) => void;
  onOpenDirections: (spot: TouristSpot) => void;
  activeRoute: CalculatedRoute | null;
  showWeatherLayer: boolean;
  onToggleWeatherLayer: () => void;
  showRoadLayer: boolean;
  onToggleRoadLayer: () => void;
  selectedCategory: string;
  searchQuery: string;
}

export const IllustratedMap: React.FC<IllustratedMapProps> = ({
  spots,
  selectedSpot,
  onSelectSpot,
  onOpenDetails,
  onOpenBooking,
  onOpenDirections,
  activeRoute,
  showWeatherLayer,
  onToggleWeatherLayer,
  showRoadLayer,
  onToggleRoadLayer,
  selectedCategory,
  searchQuery,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSpot, setHoveredSpot] = useState<TouristSpot | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.8));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-interactive-control')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filter spots by category & search
  const filteredSpots = spots.filter((spot) => {
    const matchesCategory = selectedCategory === 'All' || spot.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get marker visual iconography based on category/spot
  const getSpotIcon = (spot: TouristSpot) => {
    if (spot.id.includes('dahilayan')) return '🌲';
    if (spot.id.includes('ranch')) return '🐎';
    if (spot.id.includes('kitanglad') || spot.id.includes('dulang')) return '🏔️';
    if (spot.id.includes('lake-apo')) return '🛶';
    if (spot.id.includes('pineapple')) return '🍍';
    if (spot.id.includes('monastery')) return '⛪';
    if (spot.id.includes('alalum') || spot.id.includes('cedar') || spot.id.includes('nasuli')) return '🌊';
    if (spot.id.includes('kaamulan')) return '🏛️';
    if (spot.id.includes('strawberry')) return '🍓';
    if (spot.id.includes('rotypeaks') || spot.id.includes('panimahawa') || spot.id.includes('overview')) return '⛺';
    return '📍';
  };

  const getStatusBadge = (status: TouristSpot['operatingStatus']) => {
    switch (status) {
      case 'open':
        return { color: 'bg-emerald-500', text: 'OPEN', border: 'border-emerald-300' };
      case 'limited':
        return { color: 'bg-amber-500', text: 'LIMITED', border: 'border-amber-300' };
      case 'closed':
        return { color: 'bg-rose-500', text: 'CLOSED', border: 'border-rose-300' };
    }
  };

  return (
    <div 
      id="lantaw-illustrated-map-container"
      ref={mapContainerRef}
      className="relative w-full h-[620px] lg:h-[720px] rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-900/20 bg-[#124233] select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Atmosphere Texture: Lush surrounding Mindanao forest, deep rivers, and topography */}
      <div 
        className="w-full h-full transition-transform duration-100 ease-out origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full pointer-events-auto"
          style={{ minWidth: '1000px', minHeight: '800px' }}
        >
          <defs>
            {/* Gradients matching the illustrated island art style */}
            <radialGradient id="highlandBackdrop" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#1e5c45" />
              <stop offset="60%" stopColor="#134332" />
              <stop offset="100%" stopColor="#0b281e" />
            </radialGradient>

            {/* Earthy Ochre & Sand Plateau Rim (like in the Lapu-Lapu map) */}
            <linearGradient id="plateauBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3c98b" />
              <stop offset="50%" stopColor="#df9f52" />
              <stop offset="100%" stopColor="#a36224" />
            </linearGradient>

            {/* Lush vibrant Bukidnon green plateau fill */}
            <linearGradient id="bukidnonGrass" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="25%" stopColor="#65a30d" />
              <stop offset="60%" stopColor="#4d7c0f" />
              <stop offset="100%" stopColor="#365314" />
            </linearGradient>

            {/* Pineapple plantation yellow-green textured strip */}
            <pattern id="pineapplePattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#65a30d" />
              <circle cx="10" cy="10" r="3.5" fill="#facc15" opacity="0.65" />
              <path d="M 10 3 L 12 7 L 8 7 Z" fill="#15803d" />
            </pattern>

            {/* Pine forest pattern */}
            <pattern id="pinePattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M12 4 L17 12 L14 12 L19 19 L5 19 L10 12 L7 12 Z" fill="#166534" opacity="0.4" />
            </pattern>

            {/* Highland Rivers Gradient */}
            <linearGradient id="riverGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Lake Apo Volcanic Water */}
            <radialGradient id="lakeApoWater" cx="45%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            {/* Drop shadow for 3D mountains and markers */}
            <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
            </filter>

            <filter id="landmassShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="8" dy="16" stdDeviation="10" floodColor="#061a13" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Canvas Background: Highland Forest Matrix */}
          <rect width="1000" height="800" fill="url(#highlandBackdrop)" />

          {/* Topographic Contour Background Lines */}
          <g opacity="0.12" stroke="#ffffff" strokeWidth="1.2" fill="none">
            <ellipse cx="500" cy="400" rx="460" ry="360" />
            <ellipse cx="490" cy="410" rx="380" ry="290" />
            <ellipse cx="480" cy="420" rx="280" ry="210" />
            <ellipse cx="440" cy="380" rx="180" ry="140" />
          </g>

          {/* Surrounding Mountain Silhouettes in the distance */}
          <g opacity="0.3" fill="#0f382a">
            <polygon points="40,220 120,90 210,240" />
            <polygon points="180,260 280,110 390,270" />
            <polygon points="680,210 790,70 890,220" />
            <polygon points="780,520 880,360 970,540" />
            <polygon points="20,680 140,490 240,710" />
          </g>

          {/* ========================================================================= */}
          {/* MAIN ILLUSTRATED BUKIDNON LANDMASS (Layered 3D Plateau shape with ochre rim) */}
          {/* ========================================================================= */}
          
          {/* Plateau 3D Bottom Cast Shadow */}
          <path
            d="M 230 110 
               C 350 70, 480 80, 620 120 
               C 740 160, 840 230, 870 330 
               C 900 440, 860 560, 820 650 
               C 780 730, 680 780, 520 770 
               C 380 760, 240 730, 160 620 
               C 90 510, 100 370, 130 260 
               C 160 170, 190 120, 230 110 Z"
            fill="#082218"
            filter="url(#landmassShadow)"
            transform="translate(8, 16)"
          />

          {/* Plateau Sandy Ochre 3D Edge Bevel (The golden-tan rim like in the Lapu-Lapu map) */}
          <path
            d="M 230 110 
               C 350 70, 480 80, 620 120 
               C 740 160, 840 230, 870 330 
               C 900 440, 860 560, 820 650 
               C 780 730, 680 780, 520 770 
               C 380 760, 240 730, 160 620 
               C 90 510, 100 370, 130 260 
               C 160 170, 190 120, 230 110 Z"
            fill="url(#plateauBevel)"
            stroke="#6c3c0c"
            strokeWidth="4"
          />

          {/* Plateau Upper Highland Green Terrain Surface */}
          <path
            d="M 238 118 
               C 352 82, 476 90, 612 128 
               C 728 166, 824 234, 852 328 
               C 880 432, 842 546, 804 632 
               C 766 710, 670 758, 516 748 
               C 382 738, 248 710, 172 604 
               C 106 498, 114 364, 142 260 
               C 170 174, 200 128, 238 118 Z"
            fill="url(#bukidnonGrass)"
          />

          {/* Northern Del Monte Pineapple Fields Textured Area */}
          <path
            d="M 270 135 C 330 120, 410 130, 440 160 C 420 210, 340 230, 260 210 C 240 170, 250 145, 270 135 Z"
            fill="url(#pineapplePattern)"
            opacity="0.85"
            stroke="#a3e635"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Pine Forest Zones (Dahilayan, Impasug-ong, Malaybalay) */}
          <path
            d="M 240 170 C 310 160, 360 220, 310 270 C 250 270, 220 220, 240 170 Z"
            fill="url(#pinePattern)"
          />
          <path
            d="M 470 230 C 580 210, 650 280, 610 360 C 520 370, 460 300, 470 230 Z"
            fill="url(#pinePattern)"
          />

          {/* ========================================================================= */}
          {/* WATERWAYS & LAKES: Pulangi River & Lake Apo */}
          {/* ========================================================================= */}
          {/* Pulangi River winding through Bukidnon */}
          <path
            d="M 640 140 
               C 620 220, 660 310, 620 410 
               C 580 490, 600 580, 560 660 
               C 530 710, 480 740, 450 780"
            fill="none"
            stroke="url(#riverGlow)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 640 140 
               C 620 220, 660 310, 620 410 
               C 580 490, 600 580, 560 660 
               C 530 710, 480 740, 450 780"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="2.5"
            strokeDasharray="12 18"
            opacity="0.8"
          />
          {/* Tagoloan River (North-West Canyon) */}
          <path
            d="M 170 140 C 230 180, 260 210, 290 280 C 310 320, 330 350, 360 370"
            fill="none"
            stroke="url(#riverGlow)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Lake Apo (Valencia Crater Lake) */}
          <g filter="url(#markerShadow)">
            <ellipse cx="500" cy="576" rx="42" ry="24" fill="#0369a1" />
            <ellipse cx="498" cy="574" rx="38" ry="21" fill="url(#lakeApoWater)" />
            {/* Bamboo Raft & Kayak on the lake */}
            <rect x="490" y="568" width="14" height="7" rx="2" fill="#d97706" />
            <line x1="486" y1="571" x2="508" y2="571" stroke="#451a03" strokeWidth="1" />
            <text x="500" y="608" textAnchor="middle" fill="#f0fdf4" fontSize="9" fontWeight="bold" className="tracking-wide">
              LAKE APO
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 3D ILLUSTRATED MOUNTAIN PEAKS (Kitanglad, Dulang-Dulang, Musuan, etc.) */}
          {/* ========================================================================= */}
          
          {/* Mt. Kitanglad Range Peak (Center West) */}
          <g filter="url(#markerShadow)" transform="translate(380, 270)">
            {/* Mountain Base/Shading */}
            <polygon points="50,140 0,60 40,0 80,60 110,140" fill="#2d6a4f" />
            {/* Mountain Light Side */}
            <polygon points="40,0 0,60 50,140 45,70" fill="#52b788" />
            {/* Mountain Dark/Crevasse Side */}
            <polygon points="40,0 80,60 110,140 45,70" fill="#1b4332" />
            {/* Snowy / Cloud-shrouded Summit Tip */}
            <polygon points="40,0 32,22 40,28 48,22" fill="#f1f5f9" />
            <text x="45" y="152" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" stroke="#000000" strokeWidth="2" paintOrder="stroke fill">
              MT. KITANGLAD (2,899m)
            </text>
          </g>

          {/* Mt. Dulang-Dulang Peak (D2) */}
          <g filter="url(#markerShadow)" transform="translate(330, 330)">
            <polygon points="45,130 5,60 40,0 75,60 95,130" fill="#1e4d3a" />
            <polygon points="40,0 5,60 45,130 40,65" fill="#40916c" />
            <polygon points="40,0 75,60 95,130 40,65" fill="#081c15" />
            <polygon points="40,0 33,20 40,26 47,20" fill="#e2e8f0" />
            <text x="40" y="142" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" stroke="#000000" strokeWidth="2" paintOrder="stroke fill">
              MT. DULANG-DULANG (2,938m)
            </text>
          </g>

          {/* Mt. Musuan Volcano Peak (Valencia / Maramag) */}
          <g filter="url(#markerShadow)" transform="translate(480, 580)">
            <polygon points="35,70 5,35 30,0 55,35 65,70" fill="#854d0e" />
            <polygon points="30,0 5,35 35,70 30,35" fill="#ca8a04" />
            <polygon points="30,0 55,35 65,70 30,35" fill="#713f12" />
            <circle cx="30" cy="10" r="4" fill="#ea580c" opacity="0.6" />
            <text x="32" y="82" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" stroke="#000000" strokeWidth="2" paintOrder="stroke fill">
              MT. MUSUAN
            </text>
          </g>

          {/* Impasug-ong Golden Ridge / Kulago */}
          <g filter="url(#markerShadow)" transform="translate(540, 220)">
            <polygon points="40,75 10,35 35,0 60,35 70,75" fill="#a16207" />
            <polygon points="35,0 10,35 40,75 35,38" fill="#eab308" />
            <polygon points="35,0 60,35 70,75 35,38" fill="#78350f" />
            <text x="38" y="87" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" stroke="#000000" strokeWidth="2" paintOrder="stroke fill">
              KULAGO RIDGE
            </text>
          </g>

          {/* ========================================================================= */}
          {/* HIGHWAYS & ROADS: Sayre National Highway & BuDa Highway */}
          {/* ========================================================================= */}
          
          {/* Sayre Highway Bed (Earthy highway strip with 3D road border) */}
          <path
            d="M 180 100 
               L 260 140 
               L 330 170 
               L 440 220 
               L 520 280 
               L 550 390 
               L 540 500 
               L 520 590 
               L 500 680 
               L 480 760"
            fill="none"
            stroke="#fef08a"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
          <path
            d="M 180 100 
               L 260 140 
               L 330 170 
               L 440 220 
               L 520 280 
               L 550 390 
               L 540 500 
               L 520 590 
               L 500 680 
               L 480 760"
            fill="none"
            stroke="#475569"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Highway Yellow Dashed Center Line */}
          <path
            d="M 180 100 
               L 260 140 
               L 330 170 
               L 440 220 
               L 520 280 
               L 550 390 
               L 540 500 
               L 520 590 
               L 500 680 
               L 480 760"
            fill="none"
            stroke="#facc15"
            strokeWidth="1.8"
            strokeDasharray="7 9"
            strokeLinecap="round"
          />

          {/* BuDa Highway (Bukidnon-Davao Road branching from Maramag to Quezon & Davao) */}
          <path
            d="M 500 680 
               L 610 690 
               L 720 730 
               L 820 760"
            fill="none"
            stroke="#475569"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 500 680 
               L 610 690 
               L 720 730 
               L 820 760"
            fill="none"
            stroke="#facc15"
            strokeWidth="1.6"
            strokeDasharray="6 8"
          />

          {/* Mountain Spur Road to Dahilayan */}
          <path
            d="M 260 140 L 280 180"
            fill="none"
            stroke="#64748b"
            strokeWidth="5"
            strokeDasharray="4 3"
          />

          {/* Spur Road to Communal Ranch Impasug-ong */}
          <path
            d="M 520 280 L 580 320"
            fill="none"
            stroke="#64748b"
            strokeWidth="5"
            strokeDasharray="4 3"
          />

          {/* Spur Road to Lantapan / Songco */}
          <path
            d="M 540 500 L 400 450 L 380 480"
            fill="none"
            stroke={showRoadLayer ? '#ef4444' : '#64748b'}
            strokeWidth={showRoadLayer ? 6 : 4}
            strokeDasharray={showRoadLayer ? '6 4' : '4 3'}
          />

          {/* Illustrated Mini Vehicles moving along Sayre Highway */}
          {/* Rural Bukidnon Red Bus */}
          <g transform="translate(430, 210) rotate(32)">
            <rect x="-10" y="-5" width="20" height="10" rx="3" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <rect x="3" y="-4" width="5" height="8" rx="1" fill="#e0f2fe" />
            <circle cx="-6" cy="6" r="2" fill="#1e293b" />
            <circle cx="6" cy="6" r="2" fill="#1e293b" />
          </g>

          {/* Colorful Bukidnon Jeepney */}
          <g transform="translate(545, 430) rotate(85)">
            <rect x="-12" y="-6" width="24" height="12" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            <rect x="4" y="-5" width="6" height="10" rx="1" fill="#38bdf8" />
            <rect x="-10" y="-4" width="8" height="8" rx="1" fill="#f97316" />
            <circle cx="-7" cy="7" r="2.5" fill="#0f172a" />
            <circle cx="7" cy="7" r="2.5" fill="#0f172a" />
          </g>

          {/* ========================================================================= */}
          {/* CURVED HIGHWAY & MUNICIPALITY LABELS (Inspired by Lapu-Lapu map style) */}
          {/* ========================================================================= */}
          <g fill="#fef08a" fontSize="11" fontWeight="900" letterSpacing="1px">
            {/* Sayre Highway Label */}
            <text x="360" y="195" transform="rotate(24, 360, 195)" fill="#ffffff" stroke="#1e293b" strokeWidth="3" paintOrder="stroke fill">
              SAYRE NATIONAL HIGHWAY
            </text>
            <text x="630" y="700" transform="rotate(15, 630, 700)" fill="#ffffff" stroke="#1e293b" strokeWidth="3" paintOrder="stroke fill">
              BUKIDNON-DAVAO (BUDA) HWY
            </text>

            {/* Municipality badges/names with little location markers */}
            <text x="190" y="85" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              NORTH GATEWAY (CDO / ALAE)
            </text>
            <text x="240" y="130" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              MANOLO FORTICH
            </text>
            <text x="440" y="200" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              SUMILAO
            </text>
            <text x="540" y="270" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              IMPASUG-ONG
            </text>
            <text x="565" y="380" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              MALAYBALAY CITY (CAPITOL)
            </text>
            <text x="340" y="470" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              LANTAPAN
            </text>
            <text x="535" y="570" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              VALENCIA CITY
            </text>
            <text x="470" y="665" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              MARAMAG
            </text>
            <text x="730" y="715" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              QUEZON
            </text>
            <text x="750" y="790" fill="#fef08a" stroke="#064e3b" strokeWidth="2.5" paintOrder="stroke fill">
              SOUTH GATEWAY (DAVAO)
            </text>
          </g>

          {/* ========================================================================= */}
          {/* ACTIVE ROUTE VISUALIZATION (When directions are calculated) */}
          {/* ========================================================================= */}
          {activeRoute && activeRoute.pathPoints && (
            <g>
              {/* Route glowing path */}
              <polyline
                points={activeRoute.pathPoints.map((p) => `${p.x * 10},${p.y * 8}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.45"
              />
              <polyline
                points={activeRoute.pathPoints.map((p) => `${p.x * 10},${p.y * 8}`).join(' ')}
                fill="none"
                stroke="#0284c7"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10 6"
                className="animate-pulse"
              />
              {/* Animated Origin Dot */}
              <circle
                cx={activeRoute.pathPoints[0].x * 10}
                cy={activeRoute.pathPoints[0].y * 8}
                r="10"
                fill="#22c55e"
                stroke="#ffffff"
                strokeWidth="3"
                filter="url(#markerShadow)"
              />
              {/* Destination Star */}
              <circle
                cx={activeRoute.destination.mapCoordinates.x * 10}
                cy={activeRoute.destination.mapCoordinates.y * 8}
                r="12"
                fill="#e11d48"
                stroke="#ffffff"
                strokeWidth="3"
                filter="url(#markerShadow)"
              />
            </g>
          )}

          {/* ========================================================================= */}
          {/* WEATHER OVERLAY LAYER (Rain animation, fog & storm zones) */}
          {/* ========================================================================= */}
          {showWeatherLayer && (
            <g className="transition-opacity duration-300">
              {/* Heavy Rain & Fog Zone over Central Mountain Range (Kitanglad / Dulang-dulang) */}
              <path
                d="M 280 260 C 400 220, 480 250, 460 380 C 440 480, 320 490, 280 430 C 240 370, 250 280, 280 260 Z"
                fill="#0f172a"
                opacity="0.45"
              />
              
              {/* Rain Droplets Animation Cluster */}
              <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.85">
                {[
                  [340, 290], [380, 310], [420, 300], [360, 350], [400, 370], [440, 340],
                  [320, 410], [370, 430], [410, 420], [350, 460], [390, 470], [430, 450]
                ].map(([rx, ry], idx) => (
                  <line key={idx} x1={rx} y1={ry} x2={rx - 4} y2={ry + 14} className="animate-pulse" />
                ))}
              </g>

              {/* Rainclouds in the sky */}
              <g transform="translate(320, 240)" filter="url(#markerShadow)">
                <ellipse cx="40" cy="20" rx="35" ry="18" fill="#64748b" />
                <ellipse cx="60" cy="15" rx="25" ry="16" fill="#94a3b8" />
                <ellipse cx="25" cy="24" rx="20" ry="14" fill="#475569" />
                <text x="45" y="24" fill="#ffffff" fontSize="12" fontWeight="bold">🌧️</text>
              </g>

              <g transform="translate(700, 680)" filter="url(#markerShadow)">
                <ellipse cx="35" cy="18" rx="30" ry="16" fill="#94a3b8" />
                <ellipse cx="50" cy="14" rx="20" ry="14" fill="#cbd5e1" />
                <text x="35" y="22" fill="#ffffff" fontSize="11">🌫️</text>
              </g>

              {/* Weather Alert Tag */}
              <g transform="translate(240, 500)">
                <rect width="260" height="34" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" opacity="0.95" />
                <text x="12" y="22" fill="#fef08a" fontSize="11" fontWeight="bold">
                  ⚠️ Heavy rain & fog on Kitanglad range
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* ROAD ACCESSIBILITY OVERLAY LAYER (Simulated Road Warnings & 4x4 trails) */}
          {/* ========================================================================= */}
          {showRoadLayer && (
            <g className="transition-opacity duration-300">
              {/* Red warning on Songco / Dulang-dulang access */}
              <g transform="translate(340, 450)" filter="url(#markerShadow)">
                <circle cx="15" cy="15" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <text x="8" y="20" fill="#ffffff" fontSize="14" fontWeight="bold">⚠️</text>
                <rect x="35" y="2" width="210" height="26" rx="6" fill="#7f1d1d" stroke="#f87171" strokeWidth="1" />
                <text x="42" y="19" fill="#ffffff" fontSize="9.5" fontWeight="bold">
                  Lantapan: Muddy trail (4x4 or hike only)
                </text>
              </g>

              {/* Yellow warning on RotyPeaks unpaved ridge */}
              <g transform="translate(560, 230)" filter="url(#markerShadow)">
                <circle cx="12" cy="12" r="12" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                <text x="7" y="16" fill="#ffffff" fontSize="12">🚙</text>
                <rect x="28" y="2" width="165" height="22" rx="4" fill="#78350f" stroke="#fde047" strokeWidth="1" />
                <text x="34" y="16" fill="#fef08a" fontSize="9" fontWeight="bold">
                  RotyPeaks: 4x4 transfer active
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* INTERACTIVE TOURIST SPOT 3D MARKERS */}
          {/* ========================================================================= */}
          {filteredSpots.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            const isHovered = hoveredSpot?.id === spot.id;
            const statusInfo = getStatusBadge(spot.operatingStatus);
            const posX = spot.mapCoordinates.x * 10;
            const posY = spot.mapCoordinates.y * 8;

            return (
              <g
                key={spot.id}
                id={`map-marker-${spot.id}`}
                transform={`translate(${posX}, ${posY})`}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSpot(spot);
                }}
                onMouseEnter={() => setHoveredSpot(spot)}
                onMouseLeave={() => setHoveredSpot(null)}
                filter="url(#markerShadow)"
              >
                {/* Pulse ring for selected spot */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="34"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="4"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Status Indicator Halo Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "28" : isHovered ? "25" : "21"}
                  fill="#ffffff"
                  stroke={
                    spot.operatingStatus === 'open'
                      ? '#10b981'
                      : spot.operatingStatus === 'limited'
                      ? '#f59e0b'
                      : '#f43f5e'
                  }
                  strokeWidth="4"
                />

                {/* Center Icon circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "22" : isHovered ? "20" : "17"}
                  fill={isSelected ? "#1e293b" : "#0f766e"}
                />

                {/* Illustrated Emoji/Icon */}
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fontSize={isSelected ? "18" : "15"}
                  className="pointer-events-none"
                >
                  {getSpotIcon(spot)}
                </text>

                {/* Weather mini-badge on top right of marker */}
                {spot.weather.condition.includes('Rain') && (
                  <g transform="translate(14, -14)">
                    <circle cx="0" cy="0" r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" textAnchor="middle" fontSize="9">🌧️</text>
                  </g>
                )}

                {/* Status Pill beneath the marker */}
                <g transform="translate(0, 26)">
                  <rect
                    x="-26"
                    y="0"
                    width="52"
                    height="14"
                    rx="7"
                    fill={
                      spot.operatingStatus === 'open'
                        ? '#059669'
                        : spot.operatingStatus === 'limited'
                        ? '#d97706'
                        : '#e11d48'
                    }
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7.5"
                    fontWeight="900"
                    letterSpacing="0.5px"
                  >
                    {statusInfo.text}
                  </text>
                </g>

                {/* Attraction Name Tag (Shown when hovered, selected, or high featured) */}
                {(isHovered || isSelected || spot.featured) && (
                  <g transform="translate(0, -28)" className="pointer-events-none">
                    <rect
                      x="-65"
                      y="-18"
                      width="130"
                      height="20"
                      rx="6"
                      fill="#0f172a"
                      stroke={isSelected ? "#facc15" : "#334155"}
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {spot.name.length > 18 ? spot.name.slice(0, 16) + '...' : spot.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ========================================================================= */}
          {/* ILLUSTRATED BRAND BADGE (Bottom Right like the Virtual Lapu-Lapu watermark) */}
          {/* ========================================================================= */}
          <g transform="translate(730, 60)" filter="url(#markerShadow)">
            <rect x="0" y="0" width="240" height="95" rx="18" fill="#064e3b" stroke="#fde047" strokeWidth="2.5" opacity="0.92" />
            <text x="120" y="32" textAnchor="middle" fill="#facc15" fontSize="24" fontWeight="900" fontFamily="sans-serif" letterSpacing="2px">
              LANTAW
            </text>
            <text x="120" y="52" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" letterSpacing="1px">
              BUKIDNON TOURISM PLATFORM
            </text>
            <text x="120" y="70" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="medium">
              Verified Owner-Managed Discovery
            </text>
            <line x1="30" y1="78" x2="210" y2="78" stroke="#059669" strokeWidth="1" />
            <text x="120" y="88" textAnchor="middle" fill="#6ee7b7" fontSize="7.5">
              Highland Province of Northern Mindanao
            </text>
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MAP CONTROLS & OVERLAYS (Fixed UI Floating on Map) */}
      {/* ========================================================================= */}
      
      {/* Top Left: Quick Map Layer Toggles */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 map-interactive-control z-20">
        <button
          id="btn-toggle-weather-layer"
          onClick={onToggleWeatherLayer}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
            showWeatherLayer
              ? 'bg-sky-500 text-white shadow-sky-500/40 ring-2 ring-sky-300'
              : 'bg-emerald-950/80 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/50'
          }`}
        >
          <CloudRain className="w-4 h-4 text-sky-200" />
          <span>{showWeatherLayer ? 'Weather Layer ON' : 'Weather Layer'}</span>
        </button>

        <button
          id="btn-toggle-road-layer"
          onClick={onToggleRoadLayer}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
            showRoadLayer
              ? 'bg-amber-500 text-white shadow-amber-500/40 ring-2 ring-amber-300'
              : 'bg-emerald-950/80 text-emerald-100 hover:bg-emerald-900 border border-emerald-700/50'
          }`}
        >
          <Car className="w-4 h-4 text-amber-200" />
          <span>{showRoadLayer ? 'Road / Access Alerts ON' : 'Road & Access'}</span>
        </button>
      </div>

      {/* Top Right: Zoom & Reset Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 map-interactive-control z-20">
        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          className="p-2.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-100 rounded-xl shadow-lg border border-emerald-700/60 backdrop-blur-md transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          className="p-2.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-100 rounded-xl shadow-lg border border-emerald-700/60 backdrop-blur-md transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-reset-view"
          onClick={handleResetView}
          className="p-2.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-100 rounded-xl shadow-lg border border-emerald-700/60 backdrop-blur-md transition"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left: Interactive Map Legend */}
      <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-3 px-3.5 py-2 bg-emerald-950/90 backdrop-blur-md rounded-2xl border border-emerald-700/50 text-[11px] text-emerald-100 shadow-xl map-interactive-control z-20">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
          <span>Open</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300"></span>
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300"></span>
          <span>Closed</span>
        </div>
        <div className="w-px h-3.5 bg-emerald-700"></div>
        <span className="text-emerald-300 font-semibold">📍 Click any marker for instant live operational status</span>
      </div>

      {/* ========================================================================= */}
      {/* SELECTED SPOT DETAILED POPUP CARD (Bottom Center Overlay) */}
      {/* ========================================================================= */}
      {selectedSpot && (
        <div 
          id="selected-spot-map-popup"
          className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-stone-900/95 backdrop-blur-xl border border-stone-700/80 rounded-2xl p-4 shadow-2xl text-white z-30 map-interactive-control animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  selectedSpot.operatingStatus === 'open'
                    ? 'bg-emerald-500 text-white'
                    : selectedSpot.operatingStatus === 'limited'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}>
                  {selectedSpot.operatingStatus === 'open' && '🟢 OPEN'}
                  {selectedSpot.operatingStatus === 'limited' && '🟡 LIMITED'}
                  {selectedSpot.operatingStatus === 'closed' && '🔴 CLOSED'}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">{selectedSpot.category}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{selectedSpot.name}</h3>
              <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{selectedSpot.locationDescription}</span>
              </p>
            </div>
            <button
              onClick={() => onSelectSpot(null as any)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
            >
              ✕
            </button>
          </div>

          {/* Live Status & Weather Strip */}
          <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 bg-stone-800/80 rounded-xl border border-stone-700/50 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Weather Condition</div>
              <div className="font-semibold text-stone-100 flex items-center gap-1.5 mt-0.5">
                <span>{selectedSpot.weather.condition.includes('Rain') ? '🌧️' : selectedSpot.weather.condition.includes('Sun') ? '☀️' : '⛅'}</span>
                <span>{selectedSpot.weather.condition} ({selectedSpot.weather.tempC}°C)</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Road / Access</div>
              <div className={`font-semibold flex items-center gap-1 mt-0.5 ${
                selectedSpot.accessibilityStatus === 'accessible'
                  ? 'text-emerald-400'
                  : selectedSpot.accessibilityStatus === 'limited'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                <span>{selectedSpot.accessibilityStatus === 'accessible' ? '🟢 Passable' : selectedSpot.accessibilityStatus === 'limited' ? '🟡 Limited' : '🔴 Road Warning'}</span>
              </div>
            </div>
          </div>

          {/* Last Updated Timestamp & Price */}
          <div className="flex items-center justify-between text-xs text-stone-400 mb-3 px-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>{selectedSpot.lastUpdated}</span>
            </div>
            <div className="font-semibold text-emerald-400">
              {selectedSpot.entranceFee.adult > 0 ? `Entrance: ₱${selectedSpot.entranceFee.adult}` : 'Free Entrance'}
            </div>
          </div>

          {/* Action Buttons: View Details, Book Now, Get Directions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              id={`btn-view-details-${selectedSpot.id}`}
              onClick={() => onOpenDetails(selectedSpot)}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition text-center border border-stone-700"
            >
              View Details
            </button>
            <button
              id={`btn-directions-${selectedSpot.id}`}
              onClick={() => onOpenDirections(selectedSpot)}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1"
            >
              <Navigation2 className="w-3 h-3" />
              <span>Route</span>
            </button>
            <button
              id={`btn-book-now-${selectedSpot.id}`}
              onClick={() => onOpenBooking(selectedSpot)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1 shadow-md ${
                selectedSpot.operatingStatus === 'closed'
                  ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              }`}
              disabled={selectedSpot.operatingStatus === 'closed'}
            >
              <Calendar className="w-3 h-3" />
              <span>Book</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
