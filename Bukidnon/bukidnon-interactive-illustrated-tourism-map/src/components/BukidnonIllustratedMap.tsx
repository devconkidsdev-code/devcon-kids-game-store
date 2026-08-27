import { useState, useRef, useEffect, useCallback, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Landmark, 
  CategoryType, 
  MunicipalityId 
} from '../types';
import { 
  BUKIDNON_LANDMARKS, 
  MUNICIPALITIES 
} from '../data/bukidnonData';
import { soundscape } from '../utils/soundscape';
import { 
  Sparkles, 
  Navigation, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  RotateCcw, 
  Eye, 
  Layers, 
  Volume2, 
  VolumeX, 
  Info,
  MapPin,
  Compass,
  Star,
  ExternalLink,
  ChevronRight,
  Sun,
  Sunset,
  CloudFog,
  Moon,
  Mountain,
  TreePine,
  Footprints,
  Compass as CompassIcon
} from 'lucide-react';

interface BukidnonIllustratedMapProps {
  selectedCategory: CategoryType;
  searchQuery: string;
  activeLandmark: Landmark | null;
  onSelectLandmark: (landmark: Landmark | null) => void;
  activeItineraryIds?: string[];
  timeOfDay: 'sunny' | 'misty' | 'golden' | 'night';
  onTimeOfDayChange: (time: 'sunny' | 'misty' | 'golden' | 'night') => void;
  onOpenBooking: (landmark: Landmark) => void;
  onOpenPassport: () => void;
}

export function BukidnonIllustratedMap({
  selectedCategory,
  searchQuery,
  activeLandmark,
  onSelectLandmark,
  activeItineraryIds = [],
  timeOfDay,
  onTimeOfDayChange,
  onOpenBooking,
  onOpenPassport,
}: BukidnonIllustratedMapProps) {
  // Map viewport state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredLandmark, setHoveredLandmark] = useState<Landmark | null>(null);
  const [showTownLabels, setShowTownLabels] = useState(true);
  const [showAnimations, setShowAnimations] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter landmarks based on category, search, and district
  const filteredLandmarks = BUKIDNON_LANDMARKS.filter((landmark) => {
    const matchesCategory = selectedCategory === 'all' || landmark.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      landmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      landmark.municipalityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      landmark.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesDistrict = true;
    if (selectedDistrict !== 'all') {
      const muni = MUNICIPALITIES.find((m) => m.id === landmark.municipalityId);
      matchesDistrict = muni?.district === selectedDistrict;
    }

    return matchesCategory && matchesSearch && matchesDistrict;
  });

  // Center on landmark when selected
  useEffect(() => {
    if (activeLandmark) {
      // Landmark coords are in 0-1000 viewBox space
      const targetX = (500 - activeLandmark.coords.x) * 0.8;
      const targetY = (450 - activeLandmark.coords.y) * 0.8;
      setPan({ x: targetX, y: targetY });
      setZoom(1.35);
      soundscape.playInteractivePop();
    }
  }, [activeLandmark]);

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.75), 2.4));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onSelectLandmark(null);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSound = () => {
    const playing = soundscape.toggleSound(setIsAudioPlaying);
    setIsAudioPlaying(playing);
  };

  // Focus on district
  const handleFocusDistrict = (district: string) => {
    setSelectedDistrict(district);
    if (district === 'North Bukidnon') {
      setPan({ x: 40, y: 150 });
      setZoom(1.3);
    } else if (district === 'Central Bukidnon') {
      setPan({ x: 0, y: 10 });
      setZoom(1.25);
    } else if (district === 'South Bukidnon') {
      setPan({ x: -20, y: -170 });
      setZoom(1.3);
    } else {
      handleReset();
    }
  };

  // Time of day visual styles
  const getTimeStyles = () => {
    switch (timeOfDay) {
      case 'misty':
        return {
          bg: 'from-emerald-950 via-teal-900 to-slate-900',
          overlay: 'bg-emerald-900/20 backdrop-blur-[0.5px]',
          lighting: 'saturate-[0.95] contrast-[1.05] brightness-[0.92]',
          skyTint: '#4a6b6c',
        };
      case 'golden':
        return {
          bg: 'from-amber-950 via-orange-950 to-stone-900',
          overlay: 'bg-amber-600/15 mix-blend-color-dodge',
          lighting: 'saturate-[1.25] contrast-[1.1] brightness-[1.02] sepia-[0.15]',
          skyTint: '#d97706',
        };
      case 'night':
        return {
          bg: 'from-slate-950 via-indigo-950 to-neutral-950',
          overlay: 'bg-indigo-950/40 mix-blend-multiply',
          lighting: 'saturate-[0.8] contrast-[1.15] brightness-[0.75]',
          skyTint: '#1e1b4b',
        };
      default: // sunny
        return {
          bg: 'from-emerald-950 via-teal-950 to-stone-900',
          overlay: '',
          lighting: 'saturate-[1.15] contrast-[1.05] brightness-[1.02]',
          skyTint: '#065f46',
        };
    }
  };

  const timeStyle = getTimeStyles();

  return (
    <div
      id="bukidnon-map-hero"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-[calc(100vh-4.5rem)] min-h-[640px] overflow-hidden select-none cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      } bg-gradient-to-b ${timeStyle.bg} transition-colors duration-1000`}
    >
      {/* Dynamic Background Ambient Sky & Topography Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Night mode twinkling stars */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 pointer-events-none opacity-80 overflow-hidden">
          <div className="absolute top-12 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-28 left-1/3 w-1.5 h-1.5 bg-amber-200 rounded-full animate-pulse" />
          <div className="absolute top-16 right-1/4 w-1 h-1 bg-sky-200 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-8 left-1/2 w-1.5 h-1.5 bg-amber-100 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>
      )}

      {/* Decorative Compass & Map Cartouche */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-stone-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/30 shadow-xl shadow-black/40 text-stone-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-900/50">
          <Compass className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Illustrated Explorer</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
            BUKIDNON HIGHLANDS
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Mindanao, PH
            </span>
          </h1>
        </div>
      </div>

      {/* Elevation & Topo Legend Top Left (Under Title) */}
      <div className="hidden md:flex absolute top-20 left-6 z-20 items-center gap-3 bg-stone-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-700/60 shadow-lg text-[11px] text-stone-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1b5e20] border border-emerald-400" />
          <span>Alpine Peaks (2,000m+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#38a169] border border-emerald-500" />
          <span>Plateau (600–1,400m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308] border border-amber-400" />
          <span>Agro Plains</span>
        </div>
      </div>

      {/* Time of Day & Audio Controls Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        {/* Ambient Nature Sound Toggle */}
        <button
          id="soundscape-toggle-btn"
          onClick={toggleSound}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all duration-300 shadow-md ${
            isAudioPlaying
              ? 'bg-[#799F0C] text-white border-[#799F0C] shadow-[#799F0C]/30'
              : 'bg-[#FDFCF0]/90 text-[#4A5A40] hover:text-[#1E392A] border-[#799F0C]/20 hover:border-[#799F0C]/50 hover:bg-white'
          }`}
          title="Toggle Procedural Pine Breeze & Mountain Birdsong"
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-white animate-pulse" />
              <span>Pine Breeze: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#4A5A40]" />
              <span>Soundscape</span>
            </>
          )}
        </button>

        {/* Time of Day Mood Selector */}
        <div className="flex items-center bg-[#FDFCF0]/90 backdrop-blur-md p-1 rounded-xl border border-[#799F0C]/25 shadow-md">
          <button
            onClick={() => onTimeOfDayChange('sunny')}
            className={`p-2 rounded-lg transition-colors ${
              timeOfDay === 'sunny'
                ? 'bg-[#799F0C] text-white shadow-xs'
                : 'text-[#4A5A40] hover:text-[#1E392A]'
            }`}
            title="Sunny Crisp Highlands (22°C)"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTimeOfDayChange('misty')}
            className={`p-2 rounded-lg transition-colors ${
              timeOfDay === 'misty'
                ? 'bg-[#4A5A40] text-white shadow-xs'
                : 'text-[#4A5A40] hover:text-[#1E392A]'
            }`}
            title="Highland Morning Mist (16°C)"
          >
            <CloudFog className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTimeOfDayChange('golden')}
            className={`p-2 rounded-lg transition-colors ${
              timeOfDay === 'golden'
                ? 'bg-[#FF9F1C] text-white shadow-xs'
                : 'text-[#4A5A40] hover:text-[#1E392A]'
            }`}
            title="Sunset Golden Hour"
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTimeOfDayChange('night')}
            className={`p-2 rounded-lg transition-colors ${
              timeOfDay === 'night'
                ? 'bg-[#1E392A] text-white shadow-xs'
                : 'text-[#4A5A40] hover:text-[#1E392A]'
            }`}
            title="Starlit Mountain Night (14°C)"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* 7 Tribes Cultural Passport Button */}
        <button
          id="open-passport-top-btn"
          onClick={onOpenPassport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E392A] hover:bg-[#2D3436] text-white text-xs font-bold shadow-md shadow-[#1E392A]/20 border border-[#799F0C]/30 transition-transform active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#A7C957]" />
          <span>7 Tribes of Bukidnon</span>
        </button>
      </div>

      {/* District Fast Navigator Tabs (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5 bg-[#FDFCF0]/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#799F0C]/25 shadow-xl">
        <span className="text-[11px] font-bold text-[#4A5A40] px-2 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-[#799F0C]" />
          Region:
        </span>
        {['all', 'North Bukidnon', 'Central Bukidnon', 'South Bukidnon'].map((district) => (
          <button
            key={district}
            onClick={() => handleFocusDistrict(district)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDistrict === district
                ? 'bg-[#1E392A] text-white shadow-xs border border-[#1E392A]'
                : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
            }`}
          >
            {district === 'all' ? 'All Bukidnon' : district.replace(' Bukidnon', '')}
          </button>
        ))}
      </div>

      {/* Map Zoom & View Layer Controls Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-[#FDFCF0]/95 backdrop-blur-md rounded-2xl border border-[#799F0C]/25 p-1 shadow-xl overflow-hidden">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-2.5 text-[#4A5A40] hover:text-[#1E392A] hover:bg-white rounded-xl transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-2.5 text-[#4A5A40] hover:text-[#1E392A] hover:bg-white rounded-xl transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-[#799F0C]/15 my-0.5" />
          <button
            onClick={handleReset}
            className="p-2.5 text-[#4A5A40] hover:text-[#1E392A] hover:bg-white rounded-xl transition-colors"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Layer Visibility Buttons */}
        <div className="flex items-center gap-1 bg-[#FDFCF0]/95 backdrop-blur-md rounded-2xl border border-[#799F0C]/25 p-1 shadow-xl">
          <button
            onClick={() => setShowTownLabels(!showTownLabels)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              showTownLabels ? 'bg-[#799F0C] text-white' : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
            }`}
            title="Toggle Town Labels"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              showTrails ? 'bg-[#0284c7] text-white' : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
            }`}
            title="Toggle Mountain Trekking Trails"
          >
            <Footprints className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowContours(!showContours)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              showContours ? 'bg-[#16a34a] text-white' : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
            }`}
            title="Toggle Elevation Contours"
          >
            <Mountain className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowAnimations(!showAnimations)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-colors ${
              showAnimations ? 'bg-[#FF9F1C] text-white' : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
            }`}
            title="Toggle Moving Vehicles & Wildlife"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* THE MAIN 3D ILLUSTRATED BUKIDNON MAP SVG CANVAS */}
      <motion.div
        className="w-full h-full flex items-center justify-center"
        animate={{
          x: pan.x,
          y: pan.y,
          scale: zoom,
        }}
        transition={{ type: 'spring', damping: 24, stiffness: 180 }}
      >
        <div className="relative w-[1150px] h-[980px] flex-shrink-0 drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]">
          <svg
            viewBox="0 0 1000 900"
            className={`w-full h-full overflow-visible ${timeStyle.lighting} transition-all duration-700`}
            style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.45))' }}
          >
            <defs>
              {/* Gradients for 3D Mountain & Highland Terrain */}
              <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="35%" stopColor="#388e3c" />
                <stop offset="70%" stopColor="#43a047" />
                <stop offset="100%" stopColor="#2e7d32" />
              </linearGradient>

              <linearGradient id="mountainPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="25%" stopColor="#81c784" />
                <stop offset="60%" stopColor="#2e7d32" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>

              <linearGradient id="kalatunganGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#bbf7d0" />
                <stop offset="35%" stopColor="#4ade80" />
                <stop offset="75%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>

              <linearGradient id="cliffShadowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a3818" />
                <stop offset="100%" stopColor="#2d5a27" />
              </linearGradient>

              {/* Road ribbon gradients */}
              <linearGradient id="sayreHighwayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="50%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>

              {/* River Gradient with flow shine */}
              <linearGradient id="pulangiRiverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="45%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              {/* Lake Apo Caldera gradient */}
              <radialGradient id="lakeApoGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="70%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#164e63" />
              </radialGradient>

              {/* Nasuli Cyan Spring gradient */}
              <radialGradient id="nasuliSpringGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="60%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" />
              </radialGradient>

              {/* Pulangi Dam Reservoir Lake gradient */}
              <linearGradient id="pulangiDamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="60%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>

              {/* Del Monte Pineapple Field Texture Pattern */}
              <pattern id="pineappleFieldPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#eab308" fillOpacity="0.2" />
                <path d="M 0,8 L 8,0 L 16,8 L 8,16 Z" fill="#84cc16" fillOpacity="0.4" />
                <circle cx="8" cy="8" r="2" fill="#ca8a04" />
              </pattern>

              {/* Sugarcane & Rice Plains Texture in Valencia / Quezon */}
              <pattern id="sugarcanePattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="4" y1="2" x2="4" y2="18" stroke="#a3e635" strokeWidth="1" opacity="0.4" />
                <line x1="12" y1="2" x2="12" y2="18" stroke="#84cc16" strokeWidth="1" opacity="0.4" />
                <line x1="20" y1="2" x2="20" y2="18" stroke="#a3e635" strokeWidth="1" opacity="0.4" />
              </pattern>

              {/* Coffee Plantation Pattern in Lantapan & Talakag */}
              <pattern id="coffeeFarmPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="2" fill="#ef4444" opacity="0.5" />
                <circle cx="18" cy="18" r="2" fill="#dc2626" opacity="0.5" />
                <path d="M 4 8 C 8 4, 12 4, 16 8" stroke="#15803d" strokeWidth="1" fill="none" opacity="0.6" />
              </pattern>

              {/* Impasug-ong Rolling Pasture Texture */}
              <pattern id="pasturePattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#fef08a" fillOpacity="0.4" />
                <circle cx="25" cy="22" r="1.2" fill="#86efac" fillOpacity="0.4" />
              </pattern>

              {/* Animated River Flow Dash */}
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. BUKIDNON BASE 3D ISOMETRIC ELEVATION SHADOW & EXTRUDED CRAGS */}
            <g id="extruded-base-layer">
              {/* Outer Deep Shadow */}
              <path
                d="M 400 60
                   C 540 50, 720 120, 780 200
                   C 860 300, 890 480, 850 620
                   C 820 740, 760 840, 600 880
                   C 480 910, 360 880, 260 820
                   C 180 750, 160 620, 190 480
                   C 210 360, 260 220, 330 120
                   Z"
                fill="#0f2915"
                transform="translate(18, 32)"
                opacity="0.8"
              />

              {/* 3D Extruded Cliff Slabs */}
              <path
                d="M 400 60
                   C 540 50, 720 120, 780 200
                   C 860 300, 890 480, 850 620
                   C 820 740, 760 840, 600 880
                   C 480 910, 360 880, 260 820
                   C 180 750, 160 620, 190 480
                   C 210 360, 260 220, 330 120
                   Z"
                fill="#1f4422"
                stroke="#142c16"
                strokeWidth="6"
                transform="translate(8, 16)"
              />
            </g>

            {/* 2. THE MAIN ILLUSTRATED BUKIDNON PROVINCE HIGH PLATEAU SURFACE */}
            <g id="main-plateau-surface">
              {/* Main Province Polygon Boundary accurately shaped */}
              <path
                d="M 400 60
                   C 540 50, 720 120, 780 200
                   C 860 300, 890 480, 850 620
                   C 820 740, 760 840, 600 880
                   C 480 910, 360 880, 260 820
                   C 180 750, 160 620, 190 480
                   C 210 360, 260 220, 330 120
                   Z"
                fill="url(#terrainGrad)"
                stroke="#68d391"
                strokeWidth="4"
              />

              {/* Layered Highland Elevation Tiers */}
              {/* Northern Plateaus (Manolo Fortich / Sumilao / Impasug-ong) */}
              <path
                d="M 360 90
                   C 480 80, 680 140, 730 220
                   C 760 270, 720 340, 600 350
                   C 480 360, 340 310, 320 230
                   C 310 170, 330 120, 360 90 Z"
                fill="#48bb78"
                opacity="0.85"
                stroke="#9ae6b4"
                strokeWidth="2"
              />

              {/* Del Monte Pineapple Fields Golden Zone */}
              <path
                d="M 420 110
                   C 500 100, 560 130, 540 190
                   C 520 230, 440 220, 410 180
                   C 390 140, 400 120, 420 110 Z"
                fill="url(#pineappleFieldPattern)"
                stroke="#ca8a04"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Impasug-ong Communal Pasturelands & Canyon Rim */}
              <path
                d="M 620 190
                   C 720 190, 760 250, 740 310
                   C 710 350, 640 330, 610 280
                   C 590 240, 600 200, 620 190 Z"
                fill="url(#pasturePattern)"
                stroke="#86efac"
                strokeWidth="1.5"
              />

              {/* Lantapan & Talakag High-Altitude Coffee & Agro Zone */}
              <path
                d="M 320 310
                   C 390 320, 430 360, 410 430
                   C 370 470, 310 450, 290 380
                   C 280 340, 300 320, 320 310 Z"
                fill="url(#coffeeFarmPattern)"
                stroke="#15803d"
                strokeWidth="1"
                opacity="0.75"
              />

              {/* Central Valley (Malaybalay - Valencia Rice & Sugarcane Plains) */}
              <path
                d="M 450 360
                   C 600 370, 680 430, 660 550
                   C 640 630, 540 660, 450 630
                   C 390 600, 400 500, 420 420
                   C 430 380, 440 365, 450 360 Z"
                fill="#38a169"
                opacity="0.9"
                stroke="#68d391"
                strokeWidth="2"
              />

              {/* Southern Highlands & Sugarcane Fields (Maramag - Quezon) */}
              <path
                d="M 460 630
                   C 580 640, 700 660, 680 750
                   C 650 810, 520 820, 460 780
                   C 430 740, 440 670, 460 630 Z"
                fill="url(#sugarcanePattern)"
                opacity="0.6"
              />
            </g>

            {/* 3. ELEVATION CONTOUR LINES (Topographical Elevation Rings) */}
            {showContours && (
              <g id="topographical-contours" opacity="0.45" stroke="#a7f3d0" strokeWidth="1" fill="none">
                {/* Kitanglad Massif 2,500m+ Contour */}
                <ellipse cx="320" cy="330" rx="65" ry="45" strokeDasharray="3 3" />
                <ellipse cx="320" cy="330" rx="45" ry="30" />
                <ellipse cx="320" cy="330" rx="25" ry="18" />

                {/* Kalatungan Massif Contour */}
                <ellipse cx="250" cy="650" rx="55" ry="38" strokeDasharray="3 3" />
                <ellipse cx="250" cy="650" rx="35" ry="24" />

                {/* Northern Plateau 800m Contour */}
                <path d="M 380 130 C 480 120, 600 160, 660 220 C 620 280, 500 270, 420 230 Z" strokeDasharray="4 4" />

                {/* Southern Ridge Contour */}
                <path d="M 640 700 C 720 720, 780 770, 750 830 C 670 840, 580 810, 560 760 Z" strokeDasharray="4 4" />
              </g>
            )}

            {/* 4. 3D ILLUSTRATED MOUNTAIN RANGES */}
            <g id="mountain-ranges-layer">
              {/* MT. KITANGLAD & DULANG-DULANG RANGE (West-Central Fortress) */}
              <g id="kitanglad-cluster" className="transition-transform hover:scale-105 origin-center cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'mt_kitanglad_dulang');
                if (landmark) onSelectLandmark(landmark);
              }}>
                {/* Mountain Base Shadow */}
                <ellipse cx="320" cy="380" rx="110" ry="70" fill="#133d18" opacity="0.6" />
                
                {/* Mt. Dulang-Dulang Peak (2,938m - 2nd Highest in PH) */}
                <polygon points="320,240 240,390 400,390" fill="url(#mountainPeakGrad)" stroke="#81c784" strokeWidth="2" />
                <polygon points="320,240 320,390 400,390" fill="#1b5e20" opacity="0.4" />
                <polygon points="320,240 305,275 335,275" fill="#f0fdf4" opacity="0.9" /> {/* Snow/Mist Peak cap */}

                {/* Mt. Kitanglad Peak (2,899m) */}
                <polygon points="260,280 190,410 330,410" fill="url(#mountainPeakGrad)" stroke="#81c784" strokeWidth="2" />
                <polygon points="260,280 260,410 330,410" fill="#144d18" opacity="0.4" />
                <polygon points="260,280 248,310 272,310" fill="#f0fdf4" opacity="0.85" />

                {/* Altitude Banner */}
                <rect x="270" y="245" width="100" height="15" rx="7" fill="#0f172a" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1" />
                <text x="320" y="256" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                  Dulang-Dulang 2,938m
                </text>

                {/* Mossy Forest Clustered Trees on slopes */}
                <g fill="#166534" stroke="#14532d" strokeWidth="1">
                  <path d="M 270 360 l 12 -24 l 12 24 z M 290 370 l 10 -20 l 10 20 z M 340 350 l 14 -26 l 14 26 z" />
                </g>
              </g>

              {/* MT. KALATUNGAN RANGE (South-West Sanctuary 2,824m) */}
              <g id="kalatungan-cluster" className="transition-transform hover:scale-105 origin-center cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'mt_kalatungan_park');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <ellipse cx="250" cy="670" rx="90" ry="60" fill="#133d18" opacity="0.55" />
                <polygon points="250,560 180,690 320,690" fill="url(#kalatunganGrad)" stroke="#68d391" strokeWidth="2" />
                <polygon points="250,560 250,690 320,690" fill="#144d18" opacity="0.4" />
                <polygon points="250,560 240,585 260,585" fill="#f0fdf4" opacity="0.8" />
                <rect x="205" y="565" width="90" height="14" rx="7" fill="#0f172a" fillOpacity="0.8" stroke="#4ade80" strokeWidth="1" />
                <text x="250" y="575" textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="bold">
                  Mt. Kalatungan 2,824m
                </text>
              </g>

              {/* MT. CAPISTRANO (Jagged Limestone Spire in Malaybalay) */}
              <g id="capistrano-crag" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'mt_capistrano');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <polygon points="640,460 625,505 655,505" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
                <polygon points="650,470 642,510 668,510" fill="#64748b" />
                <polygon points="635,480 620,515 645,515" fill="#475569" />
                <text x="640" y="520" textAnchor="middle" fill="#f1f5f9" fontSize="7" fontWeight="bold">
                  Mt. Capistrano 610m
                </text>
              </g>

              {/* MUSUAN PEAK (Active Volcanic Dome in Maramag) */}
              <g id="musuan-volcano" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'musuan_peak');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <path d="M 440 700 C 455 655, 485 655, 500 700 Z" fill="#84cc16" stroke="#4d7c0f" strokeWidth="2" />
                <ellipse cx="470" cy="662" rx="14" ry="6" fill="#a16207" stroke="#713f12" strokeWidth="1" />
                {/* Watchtower on top */}
                <rect x="467" y="650" width="6" height="12" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                <polygon points="465,650 470,643 475,650" fill="#dc2626" />
                <text x="470" y="715" textAnchor="middle" fill="#fef08a" fontSize="7.5" fontWeight="bold">
                  Musuan Peak 646m
                </text>
              </g>

              {/* PANIMAHAWA RIDGE & MT. KULAGO (Impasug-ong Ridge) */}
              <g id="panimahawa-kulago-ridge" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'panimahawa_ridge');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <polygon points="710,270 690,310 730,310" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5" />
                <polygon points="725,278 712,312 738,312" fill="#15803d" />
                {/* Tiny Camping Tent */}
                <polygon points="702,305 696,314 708,314" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
              </g>

              {/* PANTARON MOUNTAIN RANGE (Eastern Misty Spine) */}
              <g id="pantaron-range" opacity="0.75">
                <polygon points="800,280 750,380 840,380" fill="#2d6a36" />
                <polygon points="820,400 770,510 860,510" fill="#275e30" />
                <polygon points="790,520 740,620 830,620" fill="#23542a" />
              </g>
            </g>

            {/* 5. RIVERS, LAKES, SPRINGS & WATERFALLS */}
            <g id="water-system-layer">
              {/* Pulangi River (Main lifeline winding across Bukidnon) */}
              <path
                id="pulangi-river-path"
                d="M 800 240
                   C 720 280, 680 340, 660 410
                   C 640 480, 620 540, 560 590
                   C 510 635, 530 700, 570 760
                   C 610 810, 680 840, 720 890"
                fill="none"
                stroke="url(#pulangiRiverGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* River animated shimmer lines */}
              {showAnimations && (
                <path
                  d="M 800 240
                     C 720 280, 680 340, 660 410
                     C 640 480, 620 540, 560 590
                     C 510 635, 530 700, 570 760
                     C 610 810, 680 840, 720 890"
                  fill="none"
                  stroke="#e0f2fe"
                  strokeWidth="3"
                  strokeDasharray="16 28"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Tagoloan & Sawaga River Tributary (Flows through Malaybalay & Manolo) */}
              <path
                d="M 540 180
                   C 570 230, 560 300, 530 380
                   C 510 440, 530 500, 560 560"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* PULANGI IV HYDROELECTRIC RESERVOIR & DAM */}
              <g id="pulangi-iv-dam-polygon" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'pulangi_iv_dam_lake');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <path
                  d="M 560 700
                     C 610 690, 630 730, 600 750
                     C 570 760, 550 730, 560 700 Z"
                  fill="url(#pulangiDamGrad)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Dam Wall & Spillway */}
                <rect x="585" y="725" width="12" height="6" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                <line x1="588" y1="731" x2="588" y2="736" stroke="#e0f2fe" strokeWidth="1.5" />
                <line x1="593" y1="731" x2="593" y2="736" stroke="#e0f2fe" strokeWidth="1.5" />
              </g>

              {/* LAKE APO (Crater Lake in Valencia) */}
              <g id="lake-apo-polygon" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'lake_apo_crater');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <ellipse cx="500" cy="580" rx="34" ry="22" fill="url(#lakeApoGrad)" stroke="#bae6fd" strokeWidth="3" />
                {/* Floating Bamboo Balsa Raft */}
                <g transform="translate(492, 572)">
                  <rect width="16" height="12" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                  <rect x="2" y="2" width="12" height="8" rx="1" fill="#fef3c7" />
                  <circle cx="8" cy="6" r="3" fill="#ef4444" />
                </g>
                <circle cx="500" cy="580" r="16" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.6" className="animate-ping" style={{ animationDuration: '3s' }} />
              </g>

              {/* NASULI COLD SPRING LAGOON (Malaybalay Bangcud) */}
              <g id="nasuli-spring-polygon" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'nasuli_cold_spring');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <ellipse cx="540" cy="510" rx="22" ry="15" fill="url(#nasuliSpringGrad)" stroke="#67e8f9" strokeWidth="2" />
                {/* Wooden Diving Platform */}
                <rect x="528" y="504" width="8" height="12" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                <rect x="532" y="500" width="10" height="4" fill="#d97706" />
                <circle cx="540" cy="510" r="10" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" className="animate-ping" style={{ animationDuration: '2.5s' }} />
              </g>

              {/* LAKE PINAMALOY (Heart-shaped Lake in Don Carlos) */}
              <g id="lake-pinamaloy" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'lake_pinamaloy_park');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <path
                  d="M 440 820
                     C 430 805, 415 815, 440 840
                     C 465 815, 450 805, 440 820 Z"
                  fill="#0284c7"
                  stroke="#7dd3fc"
                  strokeWidth="2"
                />
                {/* Pink Lotus Flower */}
                <circle cx="440" cy="826" r="2.5" fill="#f472b6" />
              </g>

              {/* MANGIMA CANYON & SPRINGS (Manolo Fortich) */}
              <g id="mangima-canyon-pass" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'mangima_canyon_springs');
                if (landmark) onSelectLandmark(landmark);
              }}>
                <path d="M 460 90 Q 470 100 480 95" stroke="#38bdf8" strokeWidth="3" fill="none" />
                <circle cx="470" cy="95" r="5" fill="#0891b2" stroke="#e0f2fe" strokeWidth="1.5" />
              </g>
            </g>

            {/* 6. HIGHWAY & ROADS NETWORK (Sayre Highway AH26, BuDa Hwy 941, Dahilayan Pass, Trails) */}
            <g id="roads-network-layer">
              {/* SAYRE HIGHWAY (Main North-to-South Arterial Highway AH26) */}
              <path
                id="sayre-highway-road"
                d="M 440 70
                   C 450 140, 520 200, 560 250
                   C 590 300, 570 380, 560 430
                   C 540 500, 520 560, 500 630
                   C 480 690, 460 760, 450 880"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
              {/* Sayre Highway Center Dashed Line */}
              <path
                d="M 440 70
                   C 450 140, 520 200, 560 250
                   C 590 300, 570 380, 560 430
                   C 540 500, 520 560, 500 630
                   C 480 690, 460 760, 450 880"
                fill="none"
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="8 8"
                strokeLinecap="round"
              />

              {/* Highway Route Badge AH26 / Route 10 */}
              <g transform="translate(450, 110)">
                <rect x="-12" y="-7" width="24" height="14" rx="3" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">AH26</text>
              </g>
              <g transform="translate(560, 470)">
                <rect x="-12" y="-7" width="24" height="14" rx="3" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">Rte 10</text>
              </g>

              {/* Dahilayan Highland Scenic Road */}
              <path
                d="M 440 140 C 410 140, 390 150, 380 155"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Talakag - Lantapan - Malaybalay Mountain Corridor (Route 940) */}
              <path
                d="M 280 290
                   C 330 330, 370 380, 420 400
                   C 470 410, 520 420, 560 430"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="6 3"
              />

              {/* BuDa (Bukidnon-Davao) Highway Branching East from Maramag/Quezon (Route 941) */}
              <path
                d="M 500 630
                   C 570 660, 660 700, 740 760
                   C 800 810, 840 850, 860 880"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 500 630
                   C 570 660, 660 700, 740 760
                   C 800 810, 840 850, 860 880"
                fill="none"
                stroke="#d97706"
                strokeWidth="1.2"
                strokeDasharray="6 6"
              />
              <g transform="translate(680, 715)">
                <rect x="-14" y="-7" width="28" height="14" rx="3" fill="#047857" stroke="#ffffff" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">BuDa</text>
              </g>

              {/* Impasug-ong Communal Ranch & RotyPeaks Scenic Loop */}
              <path
                d="M 560 250 C 610 240, 650 230, 670 225 C 680 235, 690 245, 690 250"
                fill="none"
                stroke="#fef3c7"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* ATUGAN CANYON HIGHWAY BRIDGE (65m Piers over Gorge) */}
              <g transform="translate(620, 240)" className="cursor-pointer" onClick={() => {
                const landmark = BUKIDNON_LANDMARKS.find(l => l.id === 'atugan_canyon_bridge');
                if (landmark) onSelectLandmark(landmark);
              }}>
                {/* Canyon Gorge Cut */}
                <polygon points="-16,-12 -8,12 8,12 16,-12" fill="#0f2915" opacity="0.7" />
                {/* Bridge Deck */}
                <line x1="-18" y1="0" x2="18" y2="0" stroke="#f1f5f9" strokeWidth="4" />
                <line x1="-18" y1="-2" x2="18" y2="-2" stroke="#dc2626" strokeWidth="1" />
                {/* Bridge Tall Support Piers (65m) */}
                <line x1="-8" y1="0" x2="-8" y2="12" stroke="#64748b" strokeWidth="2" />
                <line x1="8" y1="0" x2="8" y2="12" stroke="#64748b" strokeWidth="2" />
              </g>

              {/* SCENIC MOUNTAIN TREKKING TRAILS (Dashed hiking lines) */}
              {showTrails && (
                <g id="mountain-trekking-trails" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 4" fill="none">
                  {/* Kitanglad - Dulang-Dulang Sacred Traverse Trail */}
                  <path d="M 380 390 C 350 360, 330 310, 320 250" />
                  {/* Kalatungan Mendis Falls Trekking Trail */}
                  <path d="M 260 640 C 255 645, 250 650, 250 650" />
                  {/* Panimahawa Ridge Sea-of-Clouds Trail */}
                  <path d="M 670 225 C 690 250, 710 270, 710 280" />
                </g>
              )}
            </g>

            {/* 7. ANIMATED VEHICLES & WILDLIFE */}
            {showAnimations && (
              <g id="animated-vehicles-layer">
                {/* 1. Colorful Mindanao Jeepney moving along Sayre Highway */}
                <g className="vehicle-jeepney">
                  <animateMotion
                    path="M 440 70 C 450 140, 520 200, 560 250 C 590 300, 570 380, 560 430 C 540 500, 520 560, 500 630"
                    dur="18s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  <g transform="scale(0.85) translate(-12, -8)">
                    <rect width="24" height="14" rx="3" fill="#e11d48" stroke="#881337" strokeWidth="1" />
                    <rect x="18" y="2" width="6" height="10" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
                    <rect x="4" y="2" width="12" height="4" fill="#38bdf8" />
                    <line x1="2" y1="0" x2="22" y2="0" stroke="#fbbf24" strokeWidth="1.5" />
                    <circle cx="23" cy="4" r="1" fill="#fef08a" />
                  </g>
                </g>

                {/* 2. Del Monte Golden Pineapple Delivery Truck in North Bukidnon */}
                <g className="vehicle-pineapple-truck">
                  <animateMotion
                    path="M 380 155 C 410 140, 440 140, 520 200 C 560 250, 590 300, 560 350"
                    dur="24s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  <g transform="scale(0.8) translate(-15, -8)">
                    <rect x="16" y="2" width="10" height="12" rx="2" fill="#facc15" stroke="#a16207" strokeWidth="1" />
                    <rect x="0" y="0" width="15" height="14" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
                    <text x="3" y="10" fontSize="8">🍍</text>
                  </g>
                </g>

                {/* 3. 4x4 Adventure Overland Rig going to BuDa & Overview Park */}
                <g className="vehicle-adventure-4x4">
                  <animateMotion
                    path="M 500 630 C 570 660, 660 700, 740 760"
                    dur="15s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                  <g transform="scale(0.75) translate(-10, -7)">
                    <rect width="18" height="12" rx="2" fill="#ea580c" stroke="#7c2d12" strokeWidth="1" />
                    <circle cx="4" cy="12" r="3" fill="#18181b" />
                    <circle cx="14" cy="12" r="3" fill="#18181b" />
                    <rect x="3" y="2" width="8" height="4" fill="#e0f2fe" />
                  </g>
                </g>
              </g>
            )}

            {/* 8. ACTIVE ITINERARY CONNECTING ROUTE PATH */}
            {activeItineraryIds.length > 1 && (
              <g id="itinerary-active-path">
                {(() => {
                  const points = activeItineraryIds
                    .map((id) => BUKIDNON_LANDMARKS.find((l) => l.id === id))
                    .filter(Boolean) as Landmark[];

                  if (points.length < 2) return null;

                  const pathD = points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.coords.x} ${pt.coords.y}` : `${acc} L ${pt.coords.x} ${pt.coords.y}`;
                  }, '');

                  return (
                    <>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="5"
                        strokeDasharray="8 6"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' }}
                        className="animate-pulse"
                      />
                      {points.map((pt, idx) => (
                        <g key={pt.id} transform={`translate(${pt.coords.x}, ${pt.coords.y})`}>
                          <circle r="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                          <text x="0" y="4" textAnchor="middle" fill="#78350f" fontSize="10" fontWeight="bold">
                            {idx + 1}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </g>
            )}

            {/* 9. ILLUSTRATED 3D VIGNETTES & MINI-LANDMARK ART OBJECTS */}
            <g id="illustrated-vignette-art">
              {/* DAHILAYAN ZIPLINE TOWER & FLYING ZIPLINER */}
              <g transform="translate(380, 140)">
                <line x1="0" y1="20" x2="0" y2="0" stroke="#f97316" strokeWidth="3" />
                <line x1="-5" y1="20" x2="5" y2="20" stroke="#ea580c" strokeWidth="2" />
                <rect x="-4" y="0" width="8" height="6" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                <line x1="0" y1="2" x2="45" y2="25" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="3 2" />
                {showAnimations && (
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,2; 40,23; 0,2"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                    <circle cx="0" cy="0" r="3" fill="#dc2626" />
                    <line x1="0" y1="0" x2="0" y2="-4" stroke="#ffffff" strokeWidth="1" />
                  </g>
                )}
              </g>

              {/* DEL MONTE GIANT PINEAPPLE STATUE AT CAMP PHILLIPS */}
              <g transform="translate(470, 130)" className="hover:scale-110 transition-transform origin-bottom cursor-pointer">
                <rect x="-8" y="14" width="16" height="5" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                <ellipse cx="0" cy="4" rx="11" ry="14" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                <path d="M -7,0 L 7,8 M -7,8 L 7,0 M -9,4 L 9,4" stroke="#854d0e" strokeWidth="1" opacity="0.6" />
                <path d="M 0,-10 L -6,-16 L -1,-12 L 0,-18 L 1,-12 L 6,-16 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
              </g>

              {/* IMPASUG-ONG COWBOY & HORSES PASTURE */}
              <g transform="translate(670, 215)">
                <line x1="-15" y1="12" x2="15" y2="12" stroke="#b45309" strokeWidth="1.5" />
                <line x1="-15" y1="16" x2="15" y2="16" stroke="#b45309" strokeWidth="1.5" />
                <line x1="-12" y1="8" x2="-12" y2="20" stroke="#78350f" strokeWidth="1.5" />
                <line x1="0" y1="8" x2="0" y2="20" stroke="#78350f" strokeWidth="1.5" />
                <line x1="12" y1="8" x2="12" y2="20" stroke="#78350f" strokeWidth="1.5" />
                <text x="-8" y="6" fontSize="14" className="animate-bounce" style={{ animationDuration: '4s' }}>🐎</text>
              </g>

              {/* ROTYPEAKS RIDGE A-FRAME CABINS & FLOWER TERRACES */}
              <g transform="translate(690, 245)">
                {/* Wooden A-Frame Cabin */}
                <polygon points="0,-10 -8,4 8,4" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                <rect x="-2" y="-2" width="4" height="6" fill="#fef08a" />
                {/* Flower Blooms */}
                <circle cx="-10" cy="2" r="2" fill="#ec4899" />
                <circle cx="-13" cy="4" r="2" fill="#f59e0b" />
                <circle cx="10" cy="2" r="2" fill="#a855f7" />
              </g>

              {/* MONASTERY OF THE TRANSFIGURATION (Iconic Pyramid Roof) */}
              <g transform="translate(610, 430)" className="hover:scale-110 transition-transform origin-bottom cursor-pointer">
                <polygon points="0,-16 -16,10 16,10" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                <polygon points="0,-16 0,10 16,10" fill="#1e293b" opacity="0.5" />
                <polygon points="0,-16 -4,-4 4,-4" fill="#94a3b8" />
                <line x1="0" y1="-16" x2="0" y2="-22" stroke="#facc15" strokeWidth="1.5" />
                <line x1="-3" y1="-19" x2="3" y2="-19" stroke="#facc15" strokeWidth="1.5" />
                <text x="14" y="6" fontSize="12">☕</text>
              </g>

              {/* TALAANDIG SOIL PAINTING EASEL & CULTURAL TULUGAN */}
              <g transform="translate(360, 435)">
                <ellipse cx="0" cy="6" rx="12" ry="7" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                <polygon points="0,-10 -12,4 12,4" fill="#a16207" stroke="#713f12" strokeWidth="1.5" />
                <line x1="14" y1="-8" x2="10" y2="10" stroke="#b45309" strokeWidth="1" />
                <line x1="14" y1="-8" x2="18" y2="10" stroke="#b45309" strokeWidth="1" />
                <rect x="8" y="-6" width="12" height="9" rx="1" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
                <circle cx="14" cy="-2" r="2" fill="#c2410c" />
              </g>

              {/* CINCHONA MEDICINAL PINE FOREST RESERVE */}
              <g transform="translate(380, 355)">
                <path d="M 0,-14 L -6,0 L 6,0 Z" fill="#14532d" />
                <path d="M 8,-12 L 3,0 L 13,0 Z" fill="#166534" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="#78350f" strokeWidth="1.5" />
                <line x1="8" y1="0" x2="8" y2="6" stroke="#78350f" strokeWidth="1.5" />
              </g>

              {/* ALALUM FALLS & CEDAR CANYON WATERFALL */}
              <g transform="translate(570, 265)">
                <path d="M -8,0 L 8,0 L 10,22 L -10,22 Z" fill="#64748b" stroke="#334155" strokeWidth="1" />
                <path d="M -3,0 L 3,0 L 4,20 L -4,20 Z" fill="#e0f2fe" opacity="0.9" />
                {showAnimations && (
                  <circle cx="0" cy="21" r="5" fill="#bae6fd" opacity="0.7" className="animate-ping" style={{ animationDuration: '1.8s' }} />
                )}
              </g>

              {/* OVERVIEW PARK TRIBAL WARRIOR STATUES (Quezon / BuDa Pass) */}
              <g transform="translate(740, 750)">
                <rect x="-14" y="8" width="28" height="6" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                <text x="-12" y="5" fontSize="15">🗿</text>
                <text x="0" y="5" fontSize="15">🗿</text>
              </g>

              {/* SOARING PHILIPPINE EAGLE OVER MT. KITANGLAD */}
              {showAnimations && (
                <g className="eagle-flight cursor-pointer" onClick={() => soundscape.playEagleCall()}>
                  <animateMotion
                    path="M 320 280 C 260 220, 220 300, 280 340 C 340 380, 420 320, 320 280"
                    dur="20s"
                    repeatCount="indefinite"
                  />
                  <g transform="scale(0.8) translate(-10, -5)">
                    <path
                      d="M 0,0 C 4,-6 14,-8 20,-3 C 15,2 10,4 0,2 C -10,4 -15,2 -20,-3 C -14,-8 -4,-6 0,0 Z"
                      fill="#78350f"
                      stroke="#451a03"
                      strokeWidth="1"
                    />
                    <circle cx="0" cy="1" r="2" fill="#fef08a" />
                  </g>
                </g>
              )}

              {/* FLOATING CLOUDS DRIFTING ACROSS HIGHLAND PEAKS */}
              {showAnimations && (
                <g id="floating-clouds-layer" opacity="0.85">
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="-40,0; 120,0; -40,0"
                      dur="45s"
                      repeatCount="indefinite"
                    />
                    <ellipse cx="330" cy="290" rx="38" ry="16" fill="#000000" opacity="0.15" />
                    <path
                      d="M 300 270
                         q 10 -15 25 -10
                         q 15 -18 30 0
                         q 20 2 18 18
                         q 2 12 -12 12
                         h -45
                         q -18 0 -16 -20 Z"
                      fill="#ffffff"
                      opacity="0.92"
                    />
                  </g>
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="60,0; -80,0; 60,0"
                      dur="50s"
                      repeatCount="indefinite"
                    />
                    <ellipse cx="260" cy="620" rx="32" ry="14" fill="#000000" opacity="0.15" />
                    <path
                      d="M 235 605
                         q 8 -12 20 -8
                         q 12 -14 24 0
                         q 16 2 14 14
                         q 2 10 -10 10
                         h -36
                         q -14 0 -12 -16 Z"
                      fill="#ffffff"
                      opacity="0.9"
                    />
                  </g>
                </g>
              )}
            </g>

            {/* 10. MUNICIPALITY / TOWN BADGES & GEOGRAPHIC LABELS */}
            {showTownLabels && (
              <g id="town-labels-layer">
                {MUNICIPALITIES.map((muni) => (
                  <g
                    key={muni.id}
                    transform={`translate(${muni.mapCoords.x}, ${muni.mapCoords.y})`}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      const firstLandmark = BUKIDNON_LANDMARKS.find((l) => l.municipalityId === muni.id);
                      if (firstLandmark) onSelectLandmark(firstLandmark);
                    }}
                  >
                    <circle cx="0" cy="0" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                    <rect
                      x="-38"
                      y="-22"
                      width="76"
                      height="16"
                      rx="8"
                      fill="#1c1917"
                      fillOpacity="0.85"
                      stroke="#44403c"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-11"
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="8"
                      fontWeight="bold"
                      letterSpacing="0.5"
                    >
                      {muni.name.toUpperCase()}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* 11. INTERACTIVE ANIMATED LANDMARK PINS & HERO MARKERS */}
            <g id="interactive-landmark-markers">
              {filteredLandmarks.map((landmark) => {
                const isSelected = activeLandmark?.id === landmark.id;
                const isHovered = hoveredLandmark?.id === landmark.id;
                const isItinerary = activeItineraryIds.includes(landmark.id);

                return (
                  <g
                    key={landmark.id}
                    id={`map-pin-${landmark.id}`}
                    transform={`translate(${landmark.coords.x}, ${landmark.coords.y})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLandmark(landmark);
                    }}
                    onMouseEnter={() => setHoveredLandmark(landmark)}
                    onMouseLeave={() => setHoveredLandmark(null)}
                  >
                    {/* Active Selected Pulse Ring */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx="0"
                        cy="-16"
                        r="26"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        className="animate-ping"
                        style={{ animationDuration: '1.5s' }}
                      />
                    )}

                    {/* Pin Drop Shadow */}
                    <ellipse cx="0" cy="0" rx="10" ry="4" fill="#000000" opacity="0.4" />

                    {/* Animated Pin Marker Stem & Head */}
                    <g className={`transition-transform duration-300 ${isSelected || isHovered ? 'scale-125 -translate-y-2' : ''}`}>
                      {/* Pin Teardrop Shape */}
                      <path
                        d="M 0,-34
                           C -16,-34 -16,-16 0,0
                           C 16,-16 16,-34 0,-34 Z"
                        fill={
                          isSelected
                            ? '#f59e0b'
                            : landmark.category === 'mountains'
                            ? '#0284c7'
                            : landmark.category === 'adventure'
                            ? '#ea580c'
                            : landmark.category === 'farms'
                            ? '#16a34a'
                            : landmark.category === 'waterfalls'
                            ? '#0891b2'
                            : landmark.category === 'culture'
                            ? '#7c3aed'
                            : '#b45309'
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                        filter="url(#glowEffect)"
                      />

                      {/* Pin Center Icon / Glyph */}
                      <circle cx="0" cy="-20" r="10" fill="#ffffff" />
                      <text
                        x="0"
                        y="-16"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#1e293b"
                      >
                        {landmark.iconType === 'pineapple'
                          ? '🍍'
                          : landmark.iconType === 'zipline'
                          ? '⚡'
                          : landmark.iconType === 'mountain'
                          ? '🏔️'
                          : landmark.iconType === 'ranch'
                          ? '🤠'
                          : landmark.iconType === 'monastery'
                          ? '⛪'
                          : landmark.iconType === 'lake'
                          ? '🛶'
                          : landmark.iconType === 'spring'
                          ? '🏊'
                          : landmark.iconType === 'volcano'
                          ? '🌋'
                          : landmark.iconType === 'statue'
                          ? '🗿'
                          : landmark.iconType === 'waterfall'
                          ? '💧'
                          : landmark.iconType === 'culture'
                          ? '🪘'
                          : landmark.iconType === 'cave'
                          ? '🧗'
                          : landmark.iconType === 'coffee'
                          ? '☕'
                          : landmark.iconType === 'farm'
                          ? '🌿'
                          : landmark.iconType === 'camp'
                          ? '⛺'
                          : landmark.iconType === 'dam'
                          ? '⚡'
                          : landmark.iconType === 'forest'
                          ? '🌲'
                          : '📍'}
                      </text>

                      {/* Itinerary Number Badge if selected */}
                      {isItinerary && (
                        <circle cx="12" cy="-30" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                      )}
                    </g>

                    {/* Quick Floating Map Label (Always readable) */}
                    <g transform="translate(0, 10)">
                      <rect
                        x={-(landmark.title.length * 3.2 + 8)}
                        y="0"
                        width={landmark.title.length * 6.4 + 16}
                        height="16"
                        rx="8"
                        fill="#0c0a09"
                        fillOpacity="0.88"
                        stroke={isSelected ? '#f59e0b' : '#44403c'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="11"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        {landmark.title.length > 24 ? landmark.title.substring(0, 22) + '…' : landmark.title}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </motion.div>

      {/* FLOATING HOVER QUICK POPUP PREVIEW CARD */}
      <AnimatePresence>
        {hoveredLandmark && !activeLandmark && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-sm w-full bg-[#FDFCF0]/95 backdrop-blur-md rounded-2xl border border-[#799F0C]/30 p-4 shadow-2xl text-[#2D3436]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-[#799F0C] tracking-wider">
                  {hoveredLandmark.municipalityName} • {hoveredLandmark.elevation}
                </span>
                <h2 className="text-sm font-extrabold text-[#1E392A] leading-snug">{hoveredLandmark.title}</h2>
                <p className="text-xs text-[#4A5A40] mt-1 line-clamp-2">{hoveredLandmark.tagline}</p>
              </div>
              <div className="flex items-center gap-1 bg-[#FFF9EB] text-[#FF9F1C] border border-[#FF9F1C]/25 px-2 py-0.5 rounded-lg text-xs font-bold">
                <Star className="w-3 h-3 fill-[#FF9F1C] text-[#FF9F1C]" />
                <span>{hoveredLandmark.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#799F0C]/15 text-[11px] text-[#799F0C] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Click landmark on map to view full interactive travel guide & booking</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
