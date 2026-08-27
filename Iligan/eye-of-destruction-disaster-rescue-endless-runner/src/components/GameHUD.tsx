import React from 'react';
import { 
  Heart, 
  BriefcaseMedical, 
  Wrench, 
  Coins, 
  Shield as ShieldIcon, 
  Gauge, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  MapPin, 
  RotateCcw, 
  HelpCircle,
  Sparkles,
  Activity
} from 'lucide-react';
import { DisasterArea, GameMode } from '../types';

interface GameHUDProps {
  mode: GameMode;
  currentArea: DisasterArea;
  health: number;
  maxHealth: number;
  distanceTraveled: number;
  targetDistance: number;
  speed: number;
  medSupplies: number;
  repairMaterials: number;
  coins: number;
  score: number;
  hasShield: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  onOpenMap: () => void;
  onOpenHelp: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  currentArea,
  health,
  maxHealth,
  distanceTraveled,
  targetDistance,
  speed,
  medSupplies,
  repairMaterials,
  coins,
  score,
  hasShield,
  isMuted,
  onToggleMute,
  onTogglePause,
  isPaused,
  onOpenMap,
  onOpenHelp
}) => {
  const distanceLeft = Math.max(0, Math.round(targetDistance - distanceTraveled));
  const progressPercent = Math.min(100, Math.max(0, (distanceTraveled / targetDistance) * 100));

  const rescuedCount = currentArea.residents.filter(r => r.isRescued).length;
  const totalResidents = currentArea.residents.length;
  const repairedCount = currentArea.buildings.filter(b => b.isRepaired).length;
  const totalBuildings = currentArea.buildings.length;

  return (
    <header className="absolute inset-x-0 top-0 pointer-events-none select-none z-30 flex flex-col">
      {/* Top Geometric Balance Header Bar */}
      <div className="w-full bg-[#151518]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-2.5 flex items-center justify-between pointer-events-auto">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded flex items-center justify-center font-black text-black text-lg shadow-sm shrink-0">
            E
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tighter text-white uppercase flex items-center gap-1.5">
              <span>EYE OF</span>
              <span className="text-orange-500">DESTRUCTION</span>
            </h1>
            <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">
              Emergency Rescue Runner
            </div>
          </div>
        </div>

        {/* Center: Current Area & Telemetry */}
        <div className="hidden md:flex items-center gap-8 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Current Sector</p>
            <p className="font-mono text-xs sm:text-sm text-orange-200 font-semibold truncate max-w-[220px]">
              {currentArea.name.toUpperCase()}
            </p>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {mode === 'RUNNER' ? (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Distance to Station</p>
              <p className="font-mono text-sm sm:text-base text-orange-500 font-bold tabular-nums">
                {distanceLeft} <span className="text-[10px] text-white/40">M</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Sector Status</p>
              <p className="font-mono text-xs sm:text-sm text-green-400 font-bold">
                {rescuedCount === totalResidents && repairedCount === totalBuildings ? 'RESTORED' : 'ACTIVE RESTORATION'}
              </p>
            </div>
          )}

          <div className="h-6 w-px bg-white/10" />

          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Mission Score</p>
            <p className="font-mono text-sm sm:text-base text-green-400 font-bold tabular-nums">
              {score.toLocaleString()} <span className="text-[10px] text-white/40">PTS</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="hud-map-btn"
            onClick={onOpenMap}
            className="px-2.5 py-1.5 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white/70 hover:text-white transition text-xs font-mono flex items-center gap-1.5"
            title="City Restoration Map"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">MAP</span>
          </button>

          <button
            id="hud-help-btn"
            onClick={onOpenHelp}
            className="p-1.5 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white/70 hover:text-white transition"
            title="Field Manual / Controls"
          >
            <HelpCircle className="w-4 h-4 text-white/60" />
          </button>

          <button
            id="hud-mute-btn"
            onClick={onToggleMute}
            className="p-1.5 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white/70 hover:text-white transition"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>

          <button
            id="hud-pause-btn"
            onClick={onTogglePause}
            className="p-1.5 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white/70 hover:text-white transition"
            title={isPaused ? "Resume Game" : "Pause Game"}
          >
            {isPaused ? <Play className="w-4 h-4 text-orange-500" /> : <Pause className="w-4 h-4 text-white/70" />}
          </button>
        </div>
      </div>

      {/* Floating Tactical Data Pods */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-3 flex items-start justify-between gap-3 pointer-events-none">
        {/* Left: Van Integrity */}
        <div className="bg-[#151518]/90 border border-white/10 rounded p-3 text-white backdrop-blur-md pointer-events-auto min-w-[200px] sm:min-w-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Van Integrity</span>
            {hasShield ? (
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldIcon className="w-3 h-3" /> Shield Active
              </span>
            ) : (
              <span className="text-[10px] font-mono text-white/60">{health}%</span>
            )}
          </div>
          {/* Segmented health meter */}
          <div className="flex gap-1 h-2">
            {[25, 50, 75, 100].map((step) => (
              <div
                key={step}
                className={`flex-1 rounded-xs transition-all duration-200 ${
                  health >= step
                    ? health > 50 ? 'bg-green-400' : 'bg-orange-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] font-mono text-white/50">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-orange-400" />
              <span>{speed} KM/H</span>
            </span>
            <span className="text-white/40">{currentArea.subtitle.split('—')[0]}</span>
          </div>
        </div>

        {/* Right: Cargo Inventory Pods */}
        <div className="bg-[#151518]/90 border border-white/10 rounded p-2 sm:p-2.5 text-white backdrop-blur-md pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Medical */}
          <div className="bg-[#1c1c21] px-3 py-1.5 rounded border border-white/5 text-center min-w-[65px]">
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Medical</p>
            <p className="text-base font-mono font-bold text-green-400 tabular-nums flex items-center justify-center gap-1">
              <BriefcaseMedical className="w-3 h-3" />
              <span>{medSupplies}</span>
            </p>
          </div>

          {/* Materials */}
          <div className="bg-[#1c1c21] px-3 py-1.5 rounded border border-white/5 text-center min-w-[65px]">
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Materials</p>
            <p className="text-base font-mono font-bold text-orange-400 tabular-nums flex items-center justify-center gap-1">
              <Wrench className="w-3 h-3" />
              <span>{repairMaterials}</span>
            </p>
          </div>

          {/* Badges */}
          <div className="bg-[#1c1c21] px-3 py-1.5 rounded border border-white/5 text-center min-w-[65px]">
            <p className="text-[9px] text-white/40 uppercase tracking-wider">Badges</p>
            <p className="text-base font-mono font-bold text-yellow-400 tabular-nums flex items-center justify-center gap-1">
              <Coins className="w-3 h-3" />
              <span>{coins}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Runner Distance Progress Banner */}
      {mode === 'RUNNER' && (
        <div className="mx-auto mt-auto mb-3 pointer-events-none flex flex-col items-center gap-1">
          <div className="bg-[#151518]/90 border border-white/10 rounded px-4 py-2 backdrop-blur-md text-white flex items-center gap-4 shadow-xl">
            <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span>Approach Stop</span>
            </div>
            <div className="w-36 sm:w-56 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs text-orange-400 font-bold tabular-nums">
              {distanceLeft}m
            </span>
          </div>

          {/* Key Controls Helper */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#0c0c0e]/80 border border-white/10 rounded text-[11px] font-mono text-white/50">
            <span className="text-white/30">NAV:</span>
            <kbd className="px-1 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-white/80">A</kbd>
            <kbd className="px-1 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-white/80">D</kbd>
            <span className="text-white/30 ml-2">JUMP:</span>
            <kbd className="px-1 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-white/80">W</kbd>
            <span className="text-white/30 ml-2">SLIDE:</span>
            <kbd className="px-1 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-white/80">S</kbd>
          </div>
        </div>
      )}
    </header>
  );
};

