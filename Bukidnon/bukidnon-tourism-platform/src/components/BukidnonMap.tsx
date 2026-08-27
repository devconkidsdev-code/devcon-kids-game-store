import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TouristSpot, SpotCategory, OperatingStatus } from '../types';
import { 
  CloudRain, 
  Sun, 
  Cloud, 
  Wind, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Layers, 
  MapPin, 
  AlertTriangle,
  Navigation,
  CheckCircle2,
  Sparkles,
  Mountain,
  Maximize2,
  Minimize2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Star,
  Clock,
  Car,
  Bike,
  Bus,
  Search,
  X,
  SlidersHorizontal,
  Info,
  Box,
  TreePine,
  Palmtree,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ActiveRouteData {
  originName: string;
  destinationName: string;
  pathPoints: { x: number; y: number }[];
  distanceKm: number;
  durationMins: number;
  hasWarning?: boolean;
  warningText?: string;
}

interface BukidnonMapProps {
  spots: TouristSpot[];
  selectedSpotId?: number | null;
  selectedSpot?: TouristSpot | null;
  onSelectSpot: (spot: TouristSpot) => void;
  onSelectSpotForDetail?: (spot: TouristSpot) => void;
  onBookSpot?: (spot: TouristSpot) => void;
  activeRoute?: ActiveRouteData | null;
  onClearRoute?: () => void;
  onNavigateToSpot?: (spot: TouristSpot, originId?: string) => void;
  weatherLayerActive?: boolean;
  onToggleWeatherLayer?: () => void;
  roadLayerActive?: boolean;
  onToggleRoadLayer?: () => void;
  highlightCategory?: string;
  className?: string;
}

export const START_GATEWAYS = [
  { id: 'cdo', name: 'CDO / Laguindingan Gateway (North)', coords: { x: 210, y: 35 } },
  { id: 'malaybalay', name: 'Malaybalay City Center (Capital)', coords: { x: 265, y: 310 } },
  { id: 'valencia', name: 'Valencia City Gateway (Central)', coords: { x: 285, y: 410 } },
  { id: 'manolo', name: 'Manolo Fortich Gateway (Sayre Hwy)', coords: { x: 220, y: 90 } },
  { id: 'davao', name: 'Davao / BuDa Border Gateway (South)', coords: { x: 340, y: 560 } }
];

export const BukidnonMap: React.FC<BukidnonMapProps> = ({
  spots,
  selectedSpotId,
  selectedSpot: propSelectedSpot,
  onSelectSpot,
  onSelectSpotForDetail,
  onBookSpot,
  activeRoute,
  onClearRoute,
  onNavigateToSpot,
  weatherLayerActive: propWeatherLayerActive,
  onToggleWeatherLayer: propOnToggleWeatherLayer,
  roadLayerActive: propRoadLayerActive,
  onToggleRoadLayer: propOnToggleRoadLayer,
  highlightCategory = 'All',
  className = ''
}) => {
  // Dimension Mode: 3D Adventure (Isometric Tilt) vs 2D Illustrated
  const [mapMode, setMapMode] = useState<'3d' | '2d'>('3d');
  const [tiltAngle, setTiltAngle] = useState<number>(32); // degrees X-axis tilt
  const [rotateAngle, setRotateAngle] = useState<number>(-4); // degrees Z-axis rotation
  const [showCartoonLandmarks, setShowCartoonLandmarks] = useState<boolean>(true);

  // Map viewport states for fluid Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Layer states
  const [internalWeatherLayer, setInternalWeatherLayer] = useState<boolean>(true);
  const [internalRoadLayer, setInternalRoadLayer] = useState<boolean>(true);
  const [topoLayerActive, setTopoLayerActive] = useState<boolean>(true);
  const [municipalitiesLayerActive, setMunicipalitiesLayerActive] = useState<boolean>(true);
  
  // Local active popup & highlighted spot
  const [popupSpot, setPopupSpot] = useState<TouristSpot | null>(null);
  const [hoveredSpot, setHoveredSpot] = useState<TouristSpot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchMapQuery, setSearchMapQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'north' | 'central' | 'south' | 'west'>('all');
  const [selectedOriginGateway, setSelectedOriginGateway] = useState<string>('malaybalay');
  const [selectedTransportMode, setSelectedTransportMode] = useState<'car' | 'motorcycle' | 'bus'>('car');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const weatherLayer = propWeatherLayerActive !== undefined ? propWeatherLayerActive : internalWeatherLayer;
  const toggleWeather = propOnToggleWeatherLayer || (() => setInternalWeatherLayer((prev) => !prev));

  const roadLayer = propRoadLayerActive !== undefined ? propRoadLayerActive : internalRoadLayer;
  const toggleRoad = propOnToggleRoadLayer || (() => setInternalRoadLayer((prev) => !prev));

  // Sync selectedSpot with props if provided
  const activeSpot = useMemo(() => {
    if (propSelectedSpot) return propSelectedSpot;
    if (selectedSpotId) return spots.find((s) => s.id === selectedSpotId) || null;
    return popupSpot;
  }, [propSelectedSpot, selectedSpotId, spots, popupSpot]);

  // Synchronize internal popup spot when activeSpot changes from outside
  useEffect(() => {
    if (activeSpot) {
      setPopupSpot(activeSpot);
      centerOnSpot(activeSpot.coords.x, activeSpot.coords.y, 1.45);
    }
  }, [activeSpot?.id]);

  // Helper to center and zoom into coordinates
  const centerOnSpot = (targetX: number, targetY: number, targetZoom: number = 1.4) => {
    const viewBoxWidth = 500;
    const viewBoxHeight = 600;
    
    // Normalized center offset
    const offsetX = (viewBoxWidth / 2 - targetX) * (targetZoom - 0.2);
    const offsetY = (viewBoxHeight / 2 - targetY) * (targetZoom - 0.2);

    setZoom(targetZoom);
    setPan({ x: Math.max(-170, Math.min(170, offsetX)), y: Math.max(-170, Math.min(170, offsetY)) });
  };

  // Region Focus Preset buttons
  const handleFocusRegion = (region: 'all' | 'north' | 'central' | 'south' | 'west') => {
    setSelectedRegion(region);
    switch (region) {
      case 'north':
        setZoom(1.35);
        setPan({ x: 0, y: 110 });
        break;
      case 'central':
        setZoom(1.4);
        setPan({ x: 0, y: -20 });
        break;
      case 'south':
        setZoom(1.4);
        setPan({ x: 0, y: -130 });
        break;
      case 'west':
        setZoom(1.45);
        setPan({ x: 90, y: -20 });
        break;
      case 'all':
      default:
        setZoom(1);
        setPan({ x: 0, y: 0 });
        break;
    }
  };

  const handleResetView = () => {
    setSelectedRegion('all');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag and pan mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.interactive-control')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const maxPan = 280 * zoom;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    const maxPan = 280 * zoom;
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.min(2.8, Math.max(0.85, prev * zoomFactor)));
  };

  // Spot selection & Direct Navigation trigger
  const handleSpotClick = (spot: TouristSpot) => {
    setPopupSpot(spot);
    onSelectSpot(spot);
    centerOnSpot(spot.coords.x, spot.coords.y, 1.45);
  };

  // Category Icon helper
  const getCategoryIcon = (category: SpotCategory | string) => {
    switch (category) {
      case 'Adventure':
        return '⚡';
      case 'Mountain/Hiking':
        return '⛰️';
      case 'Waterfalls':
        return '🌊';
      case 'Nature & Lakes':
        return '🛶';
      case 'Agro-Farms':
        return '🍓';
      case 'Cultural/Heritage':
        return '🏛️';
      case 'Springs & Resorts':
        return '🏊';
      case 'Scenic Overlooks':
        return '🌄';
      default:
        return '📍';
    }
  };

  const getCategoryColor = (category: SpotCategory | string) => {
    switch (category) {
      case 'Adventure':
        return '#f97316'; // orange
      case 'Mountain/Hiking':
        return '#10b981'; // emerald
      case 'Waterfalls':
        return '#06b6d4'; // cyan
      case 'Nature & Lakes':
        return '#0284c7'; // sky blue
      case 'Agro-Farms':
        return '#e11d48'; // rose
      case 'Cultural/Heritage':
        return '#8b5cf6'; // violet
      case 'Springs & Resorts':
        return '#14b8a6'; // teal
      case 'Scenic Overlooks':
        return '#eab308'; // yellow
      default:
        return '#22c55e';
    }
  };

  const getStatusColor = (status: OperatingStatus) => {
    switch (status) {
      case 'open':
        return '#22c55e'; // vibrant green
      case 'limited':
        return '#f59e0b'; // amber
      case 'closed':
        return '#ef4444'; // red
      default:
        return '#64748b';
    }
  };

  // Generate SVG path for active route
  const generateRoutePath = (points: { x: number; y: number }[]) => {
    if (!points || points.length < 2) return '';
    return points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  // Filtered spots for instant search on the map
  const searchedSpots = useMemo(() => {
    if (!searchMapQuery.trim()) return [];
    return spots.filter(
      (s) =>
        s.name.toLowerCase().includes(searchMapQuery.toLowerCase()) ||
        s.municipality.toLowerCase().includes(searchMapQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchMapQuery.toLowerCase())
    );
  }, [spots, searchMapQuery]);

  // Selected Origin Gateway object
  const currentGateway = START_GATEWAYS.find((g) => g.id === selectedOriginGateway) || START_GATEWAYS[1];

  // Calculate simulated route when active popup spot is displayed
  const activeRouteInfo = useMemo(() => {
    if (activeRoute) return activeRoute;
    if (!popupSpot) return null;

    const dx = popupSpot.coords.x - currentGateway.coords.x;
    const dy = popupSpot.coords.y - currentGateway.coords.y;
    const baseDistanceKm = Math.max(12, Math.round(Math.sqrt(dx * dx + dy * dy) * 0.45));
    const speedMult = selectedTransportMode === 'motorcycle' ? 1.15 : selectedTransportMode === 'bus' ? 0.75 : 1.0;
    const roadPenalty = popupSpot.accessibilityStatus === 'limited' ? 1.3 : popupSpot.accessibilityStatus === 'inaccessible' ? 2.0 : 1.0;
    const durationMins = Math.round((baseDistanceKm / 45) * 60 / speedMult * roadPenalty);

    // Intermediate midpoint along Sayre Highway spine
    const midX = 265;
    const midY = (currentGateway.coords.y + popupSpot.coords.y) / 2;

    return {
      originName: currentGateway.name.split('(')[0].trim(),
      destinationName: popupSpot.name,
      pathPoints: [
        { x: currentGateway.coords.x, y: currentGateway.coords.y },
        { x: midX, y: midY },
        { x: popupSpot.coords.x, y: popupSpot.coords.y }
      ],
      distanceKm: baseDistanceKm,
      durationMins: durationMins,
      hasWarning: popupSpot.accessibilityStatus !== 'accessible' || popupSpot.weather.rainProbability > 50,
      warningText: popupSpot.accessibilityReason || (popupSpot.weather.rainProbability > 50 ? 'Rain clouds along mountain corridor.' : undefined)
    };
  }, [activeRoute, popupSpot, currentGateway, selectedTransportMode]);

  return (
    <div
      ref={mapContainerRef}
      id="bukidnon-master-interactive-map"
      className={`relative w-full bg-gradient-to-b from-[#0a192f] via-[#0b253a] to-[#081b2a] rounded-3xl border-2 border-emerald-500/40 shadow-2xl overflow-hidden select-none flex flex-col perspective-1200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[640px] sm:h-[740px] lg:h-[800px]'
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Cartoon Map Sky Atmosphere Background Gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.15),transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

      {/* Top Floating Control Bar (Search, 2D/3D Mode, Region Jump, Layer Toggles) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Left: Brand Badge & Search Bar */}
        <div className="flex items-center gap-2 pointer-events-auto max-w-full lg:max-w-md">
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-emerald-400/50 flex items-center gap-2.5 shadow-xl shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-sm shadow-md animate-bounce">
              ⛰️
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white tracking-wider flex items-center gap-1 uppercase">
                Bukidnon Cartoon Adventure
              </span>
              <span className="text-[9px] text-emerald-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {spots.length} Illustrated Spots & 3D Peaks
              </span>
            </div>
          </div>

          {/* Quick Search on Map */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchMapQuery}
              onChange={(e) => setSearchMapQuery(e.target.value)}
              placeholder="Search map (e.g. Dahilayan, Lake Apo, Ranch)..."
              className="w-full bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl pl-8 pr-7 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition shadow-xl"
            />
            {searchMapQuery && (
              <button
                onClick={() => setSearchMapQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}

            {/* Instant Search Results Dropdown */}
            {searchedSpots.length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-slate-900/98 backdrop-blur-xl border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-1.5 space-y-1 max-h-56 overflow-y-auto z-40">
                {searchedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => {
                      handleSpotClick(spot);
                      setSearchMapQuery('');
                    }}
                    className="p-2 rounded-xl hover:bg-emerald-950/80 flex items-center justify-between cursor-pointer text-xs text-slate-200 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getCategoryIcon(spot.category)}</span>
                      <div>
                        <div className="font-bold text-white leading-tight">{spot.name}</div>
                        <div className="text-[10px] text-emerald-400">{spot.municipality} • ₱{spot.entranceFee}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white shadow">
                      Fly To 🚀
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 3D/2D Switcher, Region Focus & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/30 shadow-xl self-start lg:self-auto">
          
          {/* 3D vs 2D Toggle Button */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-emerald-500/40 mr-1 shadow-inner">
            <button
              onClick={() => setMapMode('3d')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 ${
                mapMode === '3d'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to 3D Isometric Cartoon Adventure Mode"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Isometric</span>
            </button>
            <button
              onClick={() => setMapMode('2d')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1.5 ${
                mapMode === '2d'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to 2D Top-Down Cartoon Mode"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Illustrated</span>
            </button>
          </div>

          {/* Region Jump Pills */}
          <div className="flex items-center gap-1 pr-1.5 border-r border-slate-800 hidden sm:flex">
            <button
              onClick={() => handleFocusRegion('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                selectedRegion === 'all'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Bukidnon
            </button>
            <button
              onClick={() => handleFocusRegion('north')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                selectedRegion === 'north'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="North: Manolo Fortich, Dahilayan, Impasug-ong"
            >
              🌲 North
            </button>
            <button
              onClick={() => handleFocusRegion('central')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                selectedRegion === 'central'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Central: Malaybalay, Valencia, Lantapan"
            >
              🏛️ Central
            </button>
            <button
              onClick={() => handleFocusRegion('south')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                selectedRegion === 'south'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="South: Maramag, Quezon, BuDa"
            >
              🍓 South
            </button>
          </div>

          {/* Interactive Layer Switches */}
          <button
            onClick={toggleWeather}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              weatherLayer
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Weather Radar Overlay"
          >
            <CloudRain className="w-3 h-3" />
            <span className="hidden sm:inline">Weather</span>
          </button>

          <button
            onClick={toggleRoad}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              roadLayer
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Highway Road Status Overlay"
          >
            <Car className="w-3 h-3" />
            <span className="hidden sm:inline">Highway</span>
          </button>

          <button
            onClick={() => setShowCartoonLandmarks(!showCartoonLandmarks)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              showCartoonLandmarks
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Cartoon Landmarks (Pineapples, Ranch, Eagle, Lakes)"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Landmarks</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating Vertical Zoom & 3D Controls on Left-Bottom */}
      <div className="absolute bottom-6 left-4 z-30 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-1 flex flex-col gap-1 shadow-2xl">
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.3, 2.8))}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow font-bold"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.3, 0.85))}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow font-bold"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-800 my-0.5" />
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow"
            title="Reset Map to Full View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Tilt Controls in 3D Mode */}
        {mapMode === '3d' && (
          <div className="bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-emerald-500/30 shadow-2xl text-[10px] space-y-1 max-w-[150px] hidden sm:block">
            <div className="flex items-center justify-between text-emerald-400 font-bold uppercase">
              <span>3D Tilt Angle</span>
              <span className="font-mono text-white">{tiltAngle}°</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={tiltAngle}
              onChange={(e) => setTiltAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        )}

        {/* Departure Gateway Selector for Router */}
        <div className="bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-emerald-500/30 shadow-2xl text-[10px] space-y-1.5 max-w-[200px] hidden sm:block">
          <div className="flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider">
            <Navigation className="w-3 h-3" />
            <span>Departure Hub</span>
          </div>
          <select
            value={selectedOriginGateway}
            onChange={(e) => setSelectedOriginGateway(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {START_GATEWAYS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3D ISOMETRIC / 2D CARTOON STAGE CONTAINER */}
      <div 
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing preserve-3d"
        style={{
          perspective: '1200px'
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center transition-all duration-500 ease-out preserve-3d"
          style={{
            transform: mapMode === '3d' 
              ? `rotateX(${tiltAngle}deg) rotateZ(${rotateAngle}deg) scale(0.92)` 
              : 'rotateX(0deg) rotateZ(0deg) scale(1)',
            transformOrigin: 'center center'
          }}
        >
          {/* Main SVG Graphic Canvas */}
          <svg
            ref={svgRef}
            viewBox="0 0 500 600"
            className="w-full h-full max-h-full transition-transform duration-200 ease-out overflow-visible"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Vibrant Cartoon Terrain Land Gradients */}
              <linearGradient id="cartoonGrassGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />     {/* Bright Emerald */}
                <stop offset="40%" stopColor="#16a34a" />    {/* Lush Forest Green */}
                <stop offset="80%" stopColor="#15803d" />    {/* Deep Highland Green */}
                <stop offset="100%" stopColor="#14532d" />   {/* Mountain Base */}
              </linearGradient>

              {/* 3D Cliff Extrusion Gradient */}
              <linearGradient id="cliffExtrusionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="40%" stopColor="#57230b" />
                <stop offset="100%" stopColor="#2e1306" />
              </linearGradient>

              {/* Highland Mountain Cone Gradients */}
              <radialGradient id="cartoonKitangladCone" cx="45%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#86efac" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#16a34a" stopOpacity="0.85" />
                <stop offset="80%" stopColor="#14532d" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#052e16" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cartoonKalatunganCone" cx="40%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#15803d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#052e16" stopOpacity="0" />
              </radialGradient>

              {/* Lake Water Ripple Radial Gradient */}
              <radialGradient id="lakeWaterGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="65%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>

              {/* Rain Precipitation Cartoon Pattern */}
              <pattern id="cartoonRainPattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3,4" />
              </pattern>

              {/* Drop Shadow Filter for 3D Elements */}
              <filter id="cartoonDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
              </filter>
              
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Playful Coordinate Grid & Water Texture */}
            <g opacity="0.05">
              {[80, 160, 240, 320, 400, 480, 560].map((y) => (
                <line key={`grid-y-${y}`} x1="0" y1={y} x2="500" y2={y} stroke="#34d399" strokeWidth="1" strokeDasharray="6,6" />
              ))}
              {[80, 160, 240, 320, 400, 480].map((x) => (
                <line key={`grid-x-${x}`} x1={x} y1="0" x2={x} y2="600" stroke="#34d399" strokeWidth="1" strokeDasharray="6,6" />
              ))}
            </g>

            {/* Surrounding Neighboring Region Tags with Cartoon Banners */}
            <g opacity="0.45" pointerEvents="none">
              {/* CDO & Macajalar Bay */}
              <path d="M100,22 Q250,8 400,38" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="250" y="24" fill="#93c5fd" fontSize="8" fontWeight="900" letterSpacing="1" textAnchor="middle">
                🌊 CAGAYAN DE ORO / NORTH SEA GATEWAY ➔
              </text>

              {/* Davao / BuDa Southern Corridor */}
              <text x="375" y="585" fill="#fde047" fontSize="8" fontWeight="900" letterSpacing="1" textAnchor="middle">
                🍍 DAVAO REGION / BUDA SKYLINE ➔
              </text>

              {/* Lanao & Cotabato Borders */}
              <text x="25" y="330" fill="#a7f3d0" fontSize="7.5" fontWeight="900" letterSpacing="1">
                ◄ LANAO LAKES
              </text>
              <text x="170" y="590" fill="#a7f3d0" fontSize="7.5" fontWeight="900" letterSpacing="1">
                ▼ NORTH COTABATO VALLEY
              </text>
            </g>

            {/* MASTER BUKIDNON CARTOON LANDMASS & 3D ISOMETRIC EXTRUSION */}
            <g id="bukidnon-cartoon-landmass">
              
              {/* 3D Bottom Extrusion Layer (Earthy Brown Cliffs) */}
              <path
                d="M 140,55 L 240,45 L 340,65 L 390,95 L 430,170 L 445,260 L 460,360 L 430,470 L 360,550 L 290,565 L 200,550 L 120,510 L 80,430 L 65,330 L 75,230 L 105,130 Z"
                fill="url(#cliffExtrusionGrad)"
                transform="translate(0, 16)"
                filter="url(#cartoonDropShadow)"
              />

              {/* Secondary Landmass Terrace (Lush Forest Underlayer) */}
              <path
                d="M 140,55 L 240,45 L 340,65 L 390,95 L 430,170 L 445,260 L 460,360 L 430,470 L 360,550 L 290,565 L 200,550 L 120,510 L 80,430 L 65,330 L 75,230 L 105,130 Z"
                fill="#15803d"
                transform="translate(0, 8)"
                stroke="#166534"
                strokeWidth="2"
              />

              {/* Primary Vibrant Green Cartoon Province Shape */}
              <path
                d="M 140,55 L 240,45 L 340,65 L 390,95 L 430,170 L 445,260 L 460,360 L 430,470 L 360,550 L 290,565 L 200,550 L 120,510 L 80,430 L 65,330 L 75,230 L 105,130 Z"
                fill="url(#cartoonGrassGrad1)"
                stroke="#86efac"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Decorative Rolling Hill Patches (Cartoon Texture) */}
              <g opacity="0.35" fill="#14532d">
                <ellipse cx="220" cy="120" rx="35" ry="20" />
                <ellipse cx="360" cy="180" rx="40" ry="25" />
                <ellipse cx="140" cy="240" rx="30" ry="18" />
                <ellipse cx="380" cy="360" rx="45" ry="28" />
                <ellipse cx="220" cy="480" rx="40" ry="22" />
                <ellipse cx="330" cy="520" rx="30" ry="18" />
              </g>

              {/* TOPOGRAPHIC HIGHLANDS & 3D CARTOON MOUNTAIN PEAKS */}
              {topoLayerActive && (
                <g id="cartoon-peaks-layer">
                  {/* Mt. Kitanglad Highland Elevation Glow */}
                  <circle cx="205" cy="300" r="95" fill="url(#cartoonKitangladCone)" />
                  {/* Mt. Kalatungan Highland Elevation Glow */}
                  <circle cx="170" cy="420" r="75" fill="url(#cartoonKalatunganCone)" />

                  {/* 3D Cartoon Mt. Kitanglad Peak (2,899m) */}
                  <g transform="translate(195, 275)" filter="url(#cartoonDropShadow)">
                    {/* Shadow base */}
                    <ellipse cx="10" cy="22" rx="28" ry="12" fill="rgba(0,0,0,0.3)" />
                    {/* Main green cone */}
                    <polygon points="10,0 -16,22 36,22" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
                    {/* Snow/Mist Cap */}
                    <polygon points="10,0 2,8 10,11 18,8" fill="#f8fafc" />
                    {/* Peak Flag */}
                    <line x1="10" y1="0" x2="10" y2="-8" stroke="#ffffff" strokeWidth="1.2" />
                    <polygon points="10,-8 18,-5 10,-2" fill="#ef4444" />
                    <text x="10" y="32" fill="#86efac" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      Mt. Kitanglad (2,899m)
                    </text>
                  </g>

                  {/* 3D Cartoon Mt. Dulang-Dulang Peak (2,938m - 2nd highest in PH) */}
                  <g transform="translate(235, 305)" filter="url(#cartoonDropShadow)">
                    <polygon points="10,-2 -14,20 34,20" fill="#166534" stroke="#4ade80" strokeWidth="1.5" />
                    <polygon points="10,-2 4,6 10,8 16,6" fill="#f8fafc" />
                    <text x="10" y="29" fill="#a7f3d0" fontSize="7" fontWeight="bold" textAnchor="middle">
                      Mt. Dulang-Dulang
                    </text>
                  </g>

                  {/* 3D Cartoon Mt. Kalatungan Peak (2,860m) */}
                  <g transform="translate(160, 400)" filter="url(#cartoonDropShadow)">
                    <polygon points="10,0 -14,22 34,22" fill="#15803d" stroke="#86efac" strokeWidth="1.5" />
                    <polygon points="10,0 3,7 10,9 17,7" fill="#f8fafc" />
                    <text x="10" y="31" fill="#86efac" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      Mt. Kalatungan (2,860m)
                    </text>
                  </g>

                  {/* 3D Cartoon Musuan Volcanic Cone */}
                  <g transform="translate(275, 455)" filter="url(#cartoonDropShadow)">
                    <polygon points="10,4 -10,20 30,20" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
                    <ellipse cx="10" cy="5" rx="4" ry="2" fill="#15803d" />
                    <text x="10" y="28" fill="#a7f3d0" fontSize="7" fontWeight="bold" textAnchor="middle">
                      Musuan Peak 🌋
                    </text>
                  </g>

                  {/* 3D Cartoon Mt. Kulago (Impasug-ong Ridge) */}
                  <g transform="translate(330, 220)" filter="url(#cartoonDropShadow)">
                    <polygon points="10,2 -8,18 28,18" fill="#15803d" stroke="#86efac" strokeWidth="1.2" />
                    <polygon points="22,6 8,18 36,18" fill="#166534" stroke="#4ade80" strokeWidth="1.2" />
                    <text x="14" y="27" fill="#86efac" fontSize="7" fontWeight="bold" textAnchor="middle">
                      Mt. Kulago ⛰️
                    </text>
                  </g>
                </g>
              )}

              {/* PLAYFUL CARTOON RIVERS & SHIMMERING LAKES */}
              <g id="cartoon-waters">
                {/* Pulangi River Animated Blue Artery */}
                <path
                  d="M 130,70 Q 180,120 230,150 T 310,210 T 360,320 T 380,420 T 340,510 T 290,560"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 130,70 Q 180,120 230,150 T 310,210 T 360,320 T 380,420 T 340,510 T 290,560"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 130,70 Q 180,120 230,150 T 310,210 T 360,320 T 380,420 T 340,510 T 290,560"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeDasharray="4,8"
                  className="animate-water-pulse"
                />

                {/* Tagoloan River */}
                <path
                  d="M 170,50 Q 200,90 220,130"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Lake Apo (Guinuyoran, Valencia) - Sparkling Blue Cartoon Lake */}
                <g transform="translate(230, 420)" filter="url(#cartoonDropShadow)">
                  <ellipse cx="15" cy="10" rx="14" ry="9" fill="url(#lakeWaterGrad)" stroke="#bae6fd" strokeWidth="1.5" />
                  <ellipse cx="12" cy="8" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
                  <text x="15" y="24" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                    Lake Apo 🛶
                  </text>
                </g>

                {/* Lake Pinamaloy (Don Carlos) - Famous Guitar-shaped Lake */}
                <g transform="translate(270, 525)" filter="url(#cartoonDropShadow)">
                  <path
                    d="M10,5 C15,0 22,2 20,8 C18,12 24,18 20,22 C14,24 8,20 10,14 C11,10 6,8 10,5 Z"
                    fill="url(#lakeWaterGrad)"
                    stroke="#bae6fd"
                    strokeWidth="1.5"
                  />
                  <text x="15" y="30" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                    Lake Pinamaloy 🎸
                  </text>
                </g>
              </g>

              {/* CARTOON LANDMARKS & CULTURAL HIGHLIGHTS */}
              {showCartoonLandmarks && (
                <g id="cartoon-fun-landmarks" pointerEvents="none">
                  {/* Manolo Fortich: Giant Del Monte Golden Pineapple Landmark 🍍 */}
                  <g transform="translate(225, 95)" filter="url(#cartoonDropShadow)">
                    <ellipse cx="10" cy="14" rx="9" ry="11" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    {/* Pineapple texture lines */}
                    <path d="M4,10 L16,18 M4,18 L16,10" stroke="#a16207" strokeWidth="0.8" />
                    {/* Green crown leaves */}
                    <polygon points="10,3 7,0 10,5" fill="#22c55e" />
                    <polygon points="10,3 13,0 10,5" fill="#22c55e" />
                    <polygon points="10,3 10,-2 10,5" fill="#16a34a" />
                    <text x="10" y="30" fill="#fde047" fontSize="7" fontWeight="900" textAnchor="middle">
                      Del Monte Pineapple 🍍
                    </text>
                  </g>

                  {/* Impasug-ong: Cowboy Country & Communal Ranch 🤠🐎 */}
                  <g transform="translate(345, 175)" filter="url(#cartoonDropShadow)">
                    <rect x="0" y="4" width="22" height="14" rx="3" fill="#854d0e" stroke="#ca8a04" strokeWidth="1" />
                    <text x="11" y="15" fontSize="9" textAnchor="middle">🤠</text>
                    <text x="11" y="25" fill="#fef08a" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                      Communal Ranch
                    </text>
                  </g>

                  {/* Dahilayan Adventure Park: Dual Zipline & Rollercoaster Cables 🎢 */}
                  <g transform="translate(200, 140)">
                    <line x1="-15" y1="-10" x2="35" y2="15" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,2" />
                    <circle cx="10" cy="3" r="3.5" fill="#f97316" />
                    <text x="10" y="15" fill="#fb923c" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                      Zipline 840m ⚡
                    </text>
                  </g>

                  {/* Malaybalay: Monastery of Transfiguration Pyramid Church ⛪ */}
                  <g transform="translate(285, 320)" filter="url(#cartoonDropShadow)">
                    <polygon points="10,2 0,16 20,16" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="10" y1="2" x2="10" y2="-2" stroke="#f8fafc" strokeWidth="1" />
                    <line x1="8" y1="0" x2="12" y2="0" stroke="#f8fafc" strokeWidth="1" />
                    <text x="10" y="24" fill="#cbd5e1" fontSize="6" fontWeight="bold" textAnchor="middle">
                      Monastery ⛪
                    </text>
                  </g>

                  {/* Quezon: Blue Water Cave / Kiokong White Rock Karst 💎 */}
                  <g transform="translate(365, 480)" filter="url(#cartoonDropShadow)">
                    <circle cx="8" cy="8" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                    <text x="8" y="12" fontSize="8" textAnchor="middle">💎</text>
                    <text x="8" y="22" fill="#7dd3fc" fontSize="6" fontWeight="bold" textAnchor="middle">
                      Blue Water Cave
                    </text>
                  </g>

                  {/* Scattered Cartoon Pine Trees across Mountain Slopes 🌲 */}
                  {[
                    { x: 190, y: 165 },
                    { x: 215, y: 180 },
                    { x: 175, y: 220 },
                    { x: 160, y: 310 },
                    { x: 145, y: 340 },
                    { x: 210, y: 360 },
                    { x: 155, y: 460 },
                    { x: 330, y: 270 },
                    { x: 350, y: 330 }
                  ].map((tree, idx) => (
                    <g key={`pine-${idx}`} transform={`translate(${tree.x}, ${tree.y})`}>
                      <polygon points="4,0 0,6 8,6" fill="#15803d" />
                      <polygon points="4,4 1,9 7,9" fill="#166534" />
                      <rect x="3.2" y="9" width="1.6" height="3" fill="#78350f" />
                    </g>
                  ))}

                  {/* Majestic Philippine Eagle Soaring Over Bukidnon Rainforest 🦅 */}
                  <g className="animate-eagle-soar">
                    <text x="0" y="0" fontSize="16" filter="url(#cartoonDropShadow)">
                      🦅
                    </text>
                  </g>
                </g>
              )}

              {/* MUNICIPALITY CARTOON LABELS & BANNERS */}
              {municipalitiesLayerActive && (
                <g id="municipality-cartoon-banners" opacity="0.9" pointerEvents="none">
                  {/* Northern Bukidnon */}
                  <g transform="translate(220, 115)">
                    <rect x="-38" y="-7" width="76" height="13" rx="4" fill="#0f172a" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="0.8" />
                    <text x="0" y="2" fill="#e2e8f0" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      MANOLO FORTICH
                    </text>
                  </g>

                  <g transform="translate(340, 160)">
                    <rect x="-34" y="-7" width="68" height="13" rx="4" fill="#0f172a" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="0.8" />
                    <text x="0" y="2" fill="#e2e8f0" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      IMPASUG-ONG
                    </text>
                  </g>

                  <text x="250" y="170" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    SUMILAO
                  </text>
                  <text x="135" y="150" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    TALAKAG
                  </text>
                  <text x="175" y="75" fill="#cbd5e1" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                    LIBONA / BAUNGON
                  </text>

                  {/* Central Bukidnon Capital: Malaybalay City */}
                  <g transform="translate(270, 305)">
                    <rect x="-44" y="-8" width="88" height="16" rx="5" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#ffffff" fontSize="8.5" fontWeight="900" textAnchor="middle">
                      ★ MALAYBALAY CITY
                    </text>
                  </g>

                  <text x="155" y="325" fill="#cbd5e1" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    LANTAPAN
                  </text>

                  {/* Commercial Capital: Valencia City */}
                  <g transform="translate(290, 405)">
                    <rect x="-40" y="-8" width="80" height="16" rx="5" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#ffffff" fontSize="8.5" fontWeight="900" textAnchor="middle">
                      ★ VALENCIA CITY
                    </text>
                  </g>

                  <text x="375" y="340" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    CABANGLASAN
                  </text>

                  {/* Southern Bukidnon Municipalities */}
                  <text x="290" y="490" fill="#cbd5e1" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    MARAMAG
                  </text>
                  <text x="355" y="465" fill="#cbd5e1" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    QUEZON
                  </text>
                  <text x="280" y="545" fill="#cbd5e1" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    DON CARLOS
                  </text>
                  <text x="350" y="540" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    KITAOTAO / BUDA
                  </text>
                  <text x="290" y="580" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    KIBAWE / DAMULOG
                  </text>
                  <text x="135" y="445" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    PANGANTUCAN
                  </text>
                  <text x="405" y="415" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">
                    SAN FERNANDO
                  </text>
                </g>
              )}

              {/* SAYRE HIGHWAY & CARTOON ROAD NETWORK */}
              <g id="sayre-highway-network">
                {/* Road Base Track (Asphalt Gray) */}
                <path
                  d="M 210,40 L 210,95 L 230,145 L 245,185 L 265,240 L 270,335 L 285,410 L 295,470 L 325,515 L 340,560"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Sayre Highway Yellow Center Stripes */}
                <path
                  d="M 210,40 L 210,95 L 230,145 L 245,185 L 265,240 L 270,335 L 285,410 L 295,470 L 325,515 L 340,560"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Road Status Highlights when Highway Layer is Active */}
                {roadLayer && (
                  <g id="road-status-overlay">
                    {/* Clear Northern Highway Section */}
                    <path
                      d="M 210,40 L 210,95 L 230,145 L 245,185 L 265,240 L 270,335 L 285,410"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeOpacity="0.8"
                    />
                    {/* Lantapan Caution Road (Rain/Fog) */}
                    <path
                      d="M 270,335 L 210,330 L 195,310"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray="4,3"
                    />
                    {/* San Fernando Flooded Risk Road */}
                    <path
                      d="M 285,410 L 340,415 L 395,425"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="4"
                      strokeOpacity="0.85"
                    />
                  </g>
                )}

                {/* Cute Animated Jeepney Bobbing on Sayre Highway 🚙 */}
                <g transform="translate(255, 230)" className="animate-jeepney-bob pointer-events-none">
                  <rect x="-8" y="-5" width="16" height="10" rx="2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                  <rect x="-4" y="-3" width="8" height="6" rx="1" fill="#fde047" />
                  <circle cx="-5" cy="5" r="2.5" fill="#0f172a" />
                  <circle cx="5" cy="5" r="2.5" fill="#0f172a" />
                  <text x="0" y="14" fill="#ffffff" fontSize="5.5" fontWeight="900" textAnchor="middle">
                    JEEPNEY 🚙
                  </text>
                </g>
              </g>

              {/* ACTIVE NAVIGATION ROUTE LINE (Animated Neon Trail) */}
              {activeRouteInfo && activeRouteInfo.pathPoints && activeRouteInfo.pathPoints.length > 1 && (
                <g id="active-navigation-route-line">
                  {/* Glowing Backing */}
                  <path
                    d={generateRoutePath(activeRouteInfo.pathPoints)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                    filter="url(#softGlow)"
                  />
                  {/* Moving Animated Dashed Trail */}
                  <path
                    d={generateRoutePath(activeRouteInfo.pathPoints)}
                    fill="none"
                    stroke="#fde047"
                    strokeWidth="3.5"
                    strokeDasharray="6,6"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />

                  {/* Start Origin Gateway Marker (Pin A) */}
                  <g transform={`translate(${activeRouteInfo.pathPoints[0].x}, ${activeRouteInfo.pathPoints[0].y})`}>
                    <circle cx="0" cy="0" r="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" filter="url(#cartoonDropShadow)" />
                    <text x="0" y="3.5" fontSize="8.5" fill="#ffffff" fontWeight="900" textAnchor="middle">
                      A
                    </text>
                  </g>
                </g>
              )}

              {/* CARTOON WEATHER SIMULATION OVERLAY */}
              {weatherLayer && (
                <g id="cartoon-weather-overlay" className="transition-opacity duration-500">
                  {/* Rainy Cloud 1 over Kitanglad & Lantapan */}
                  <g transform="translate(150, 260)" filter="url(#cartoonDropShadow)">
                    <ellipse cx="45" cy="30" rx="55" ry="35" fill="url(#cartoonRainPattern)" />
                    {/* Cartoon Cloud Body */}
                    <path
                      d="M20,25 Q30,10 45,20 Q60,12 70,25 Q80,28 75,38 Q65,48 40,45 Q15,45 15,35 Z"
                      fill="#475569"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    <text x="45" y="33" fill="#93c5fd" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      🌧️ Heavy Rain (85%)
                    </text>
                  </g>

                  {/* Sunny Sky over Manolo Fortich & Malaybalay */}
                  <g transform="translate(200, 90)" filter="url(#cartoonDropShadow)">
                    <circle cx="15" cy="15" r="14" fill="#fbbf24" opacity="0.3" className="animate-ping" />
                    <circle cx="15" cy="15" r="9" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
                    <text x="28" y="18" fill="#fde047" fontSize="7.5" fontWeight="900">
                      ☀️ 24°C Sunny
                    </text>
                  </g>
                </g>
              )}

              {/* STYLIZED 3D CARTOON TOURIST SPOT MARKERS */}
              <g id="tourist-destination-markers">
                {spots.map((spot) => {
                  const isSelected = popupSpot?.id === spot.id || selectedSpotId === spot.id;
                  const isHovered = hoveredSpot?.id === spot.id;
                  const isCategoryMatch = !highlightCategory || highlightCategory === 'All' || spot.category === highlightCategory;
                  const statusColor = getStatusColor(spot.operatingStatus);
                  const categoryColor = getCategoryColor(spot.category);

                  return (
                    <g
                      key={spot.id}
                      id={`marker-spot-${spot.id}`}
                      transform={`translate(${spot.coords.x}, ${spot.coords.y})`}
                      className={`cursor-pointer transition-all duration-300 ${
                        !isCategoryMatch ? 'opacity-30 scale-90' : 'opacity-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpotClick(spot);
                      }}
                      onMouseEnter={() => setHoveredSpot(spot)}
                      onMouseLeave={() => setHoveredSpot(null)}
                    >
                      {/* Selected Target Radar Glow Rings */}
                      {isSelected && (
                        <>
                          <circle
                            cx="0"
                            cy="0"
                            r="28"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            className="animate-ping"
                          />
                          <circle
                            cx="0"
                            cy="0"
                            r="20"
                            fill="#22c55e"
                            fillOpacity="0.25"
                          />
                        </>
                      )}

                      {/* 3D Pin Drop Shadow */}
                      <ellipse
                        cx="0"
                        cy="6"
                        rx={isSelected ? 14 : isHovered ? 12 : 9}
                        ry={isSelected ? 5 : isHovered ? 4 : 3}
                        fill="rgba(0,0,0,0.6)"
                      />

                      {/* 3D Cartoon Pin Head (Teardrop Marker / Figurine) */}
                      <g 
                        transform={mapMode === '3d' ? `translate(0, ${isSelected ? -14 : isHovered ? -10 : -6})` : `translate(0, 0)`}
                        className={isSelected ? 'animate-pin-float' : ''}
                      >
                        {/* Outer Pin Body */}
                        <path
                          d="M 0,-18 C -11,-18 -11,-4 0,6 C 11,-4 11,-18 0,-18 Z"
                          fill={isSelected ? '#ffffff' : categoryColor}
                          stroke={isSelected ? '#22c55e' : '#ffffff'}
                          strokeWidth="2.2"
                          filter="url(#cartoonDropShadow)"
                        />

                        {/* Inner Circle Indicator */}
                        <circle
                          cx="0"
                          cy="-9"
                          r={isSelected ? 7.5 : 6}
                          fill={isSelected ? categoryColor : '#0f172a'}
                        />

                        {/* Category Emoji Glyph inside Pin */}
                        <text
                          x="0"
                          y="-6"
                          fontSize={isSelected ? '8' : '7'}
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                        >
                          {getCategoryIcon(spot.category)}
                        </text>

                        {/* Status Sparkle Dot */}
                        <circle
                          cx="7"
                          cy="-16"
                          r="3"
                          fill={statusColor}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      </g>

                      {/* Cartoon Name Tag Banner */}
                      <g transform="translate(0, 16)" className="pointer-events-none select-none">
                        <rect
                          x={-spot.name.length * 2.7 - 6}
                          y="-3"
                          width={spot.name.length * 5.4 + 12}
                          height="14"
                          rx="4"
                          fill={isSelected ? '#15803d' : '#0f172a'}
                          fillOpacity={isSelected ? 0.98 : 0.88}
                          stroke={isSelected ? '#4ade80' : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="7"
                          fill={isSelected ? '#ffffff' : '#f8fafc'}
                          fontSize="7"
                          fontWeight={isSelected ? '900' : '700'}
                          textAnchor="middle"
                        >
                          {spot.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* FLOATING PUFFY CARTOON CLOUDS (Drifting across the 3D Sky) */}
              <g id="drifting-clouds-layer" pointerEvents="none">
                {/* Cloud A */}
                <g className="animate-cloud-drift-a" opacity="0.75" filter="url(#cartoonDropShadow)">
                  <path
                    d="M10,20 Q18,8 30,15 Q42,5 55,18 Q68,10 75,22 Q82,25 78,35 Q70,42 45,40 Q15,42 10,30 Z"
                    fill="#f8fafc"
                  />
                </g>

                {/* Cloud B */}
                <g className="animate-cloud-drift-b" opacity="0.65" filter="url(#cartoonDropShadow)">
                  <path
                    d="M0,18 Q10,5 24,12 Q36,2 48,14 Q58,8 65,20 Q70,22 66,30 Q60,36 38,34 Q10,36 0,26 Z"
                    fill="#f8fafc"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Marker Hover Mini Tooltip (When no active popup is clicked) */}
      {hoveredSpot && !popupSpot && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-emerald-400/50 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
        >
          <span className="text-2xl">{getCategoryIcon(hoveredSpot.category)}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">{hoveredSpot.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                  hoveredSpot.operatingStatus === 'open' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                ● {hoveredSpot.operatingStatus}
              </span>
            </div>
            <div className="text-[10px] text-slate-300">
              {hoveredSpot.municipality} • {hoveredSpot.entranceFee === 0 ? 'FREE Entry' : `₱${hoveredSpot.entranceFee}`} • Click to Fly
            </div>
          </div>
        </div>
      )}

      {/* MASTER POP-UP INFORMATION PANEL (Triggered on Click / Direction Icon) */}
      {popupSpot && (
        <div 
          className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-40 w-full max-w-[340px] sm:max-w-md bg-slate-900/98 backdrop-blur-xl border-2 border-emerald-500/50 rounded-3xl shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto max-h-[85vh] overflow-y-auto space-y-3"
        >
          {/* Panel Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-2xl shadow">
                {getCategoryIcon(popupSpot.category)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {popupSpot.municipality}, Bukidnon
                  </span>
                  {popupSpot.isVerified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[9px] font-bold border border-blue-500/40">
                      <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                      LGU
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {popupSpot.name}
                </h3>
              </div>
            </div>

            {/* Close Popup Button */}
            <button
              onClick={() => {
                setPopupSpot(null);
                if (onClearRoute) onClearRoute();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Spot Image Preview with Operating Status Badge */}
          <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-950">
            <img
              src={popupSpot.images[0]}
              alt={popupSpot.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />
            
            {/* Status Badge */}
            <div className="absolute top-2.5 left-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-lg border ${
                  popupSpot.operatingStatus === 'open'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                    : popupSpot.operatingStatus === 'limited'
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                    : 'bg-red-950/90 text-red-300 border-red-500/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    popupSpot.operatingStatus === 'open'
                      ? 'bg-emerald-400 animate-pulse'
                      : popupSpot.operatingStatus === 'limited'
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                />
                {popupSpot.operatingStatus === 'open' ? 'Open Today' : popupSpot.operatingStatus}
              </span>
            </div>

            {/* Rating Pill */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700 text-[11px] text-amber-300 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{popupSpot.rating}</span>
              <span className="text-slate-400 text-[9px]">({popupSpot.reviewCount})</span>
            </div>
          </div>

          {/* Tagline & Quick Summary */}
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {popupSpot.tagline || popupSpot.description}
          </p>

          {/* Real-Time Navigation Route Metrics Banner */}
          {activeRouteInfo && (
            <div className="bg-slate-950/90 rounded-2xl p-3 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  Route from {currentGateway.name.split('(')[0].trim()}
                </span>
                <span className="text-slate-400 text-[10px]">Active Trajectory</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Distance</div>
                  <div className="font-black text-white font-mono">{activeRouteInfo.distanceKm} km</div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Travel Time</div>
                  <div className="font-black text-emerald-400 font-mono">~{activeRouteInfo.durationMins}m</div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Entrance</div>
                  <div className="font-black text-amber-300 font-mono">
                    {popupSpot.entranceFee === 0 ? 'FREE' : `₱${popupSpot.entranceFee}`}
                  </div>
                </div>
              </div>

              {/* Road or Weather Warnings */}
              {activeRouteInfo.hasWarning && (
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>{activeRouteInfo.warningText}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Specs Grid: Weather & Hours */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="text-base">⛅</span>
              <div>
                <div className="text-[9px] text-slate-400">Live Mountain Weather</div>
                <div className="font-bold text-white">{popupSpot.weather.temp}°C • {popupSpot.weather.condition}</div>
              </div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[9px] text-slate-400">Hours</div>
                <div className="font-bold text-white truncate">{popupSpot.operatingHours}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                if (onSelectSpotForDetail) {
                  onSelectSpotForDetail(popupSpot);
                }
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 shadow"
            >
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Details & Fees</span>
            </button>

            <button
              onClick={() => {
                if (onBookSpot) {
                  onBookSpot(popupSpot);
                }
              }}
              disabled={popupSpot.operatingStatus === 'closed'}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg ${
                popupSpot.operatingStatus === 'closed'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-900/40'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-950" />
              <span>Book Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Footer Strip */}
      <div className="absolute bottom-3 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 hidden md:flex items-center gap-3 text-[11px] text-slate-300 shadow-xl pointer-events-auto">
        <span className="text-slate-400 font-bold">Status:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span>Open</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span>Limited</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
          <span>Closed</span>
        </span>
      </div>
    </div>
  );
};
