import React from 'react';
import { GameState } from '../game/engine';
import {
  Droplets,
  Heart,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  MapPin,
  HelpCircle,
  List,
  Radio,
  Activity,
  ShieldAlert,
  FastForward,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HUDProps {
  gameState: GameState;
  onOpenLevelSelect: () => void;
  onOpenGuide: () => void;
  onOpenAudioSettings: () => void;
  onActionItem: (item: 'flare' | 'stone' | 'speed_tonic') => void;
  onCollectWaterToggle: (active: boolean) => void;
  onPourWaterToggle: (active: boolean) => void;
  onForceCompleteLevel: () => void;
  onSkipToNextLevel: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  onOpenLevelSelect,
  onOpenGuide,
  onOpenAudioSettings,
  onActionItem,
  onCollectWaterToggle,
  onPourWaterToggle,
  onForceCompleteLevel,
  onSkipToNextLevel,
}) => {
  const { player, level, finishPlots, waterSources, animals, gameTime } = gameState;
  const isMuted = soundEngine.getMuted();

  // Calculate total water delivered across all finish plots
  const totalWaterDelivered = finishPlots.reduce((acc, p) => acc + p.waterReceived, 0);
  const totalWaterGoal = finishPlots.reduce((acc, p) => acc + p.waterNeeded, 0);
  const overallWaterPct = Math.min(100, (totalWaterDelivered / totalWaterGoal) * 100);

  // Compass target determination
  let targetAngle = 0;
  let targetDesc = 'Water Source';
  let targetDistance = 0;

  if (player.waterCarried > 0) {
    const unhydratedPlots = finishPlots.filter((p) => !p.isFullyHydrated);
    if (unhydratedPlots.length > 0) {
      let nearest = unhydratedPlots[0];
      let minDist = Math.hypot(player.x - nearest.x, player.y - nearest.y);
      for (const p of unhydratedPlots) {
        const d = Math.hypot(player.x - p.x, player.y - p.y);
        if (d < minDist) {
          minDist = d;
          nearest = p;
        }
      }
      targetAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
      targetDesc = nearest.name;
      targetDistance = Math.round(minDist / 10);
    }
  } else {
    if (waterSources.length > 0) {
      let nearest = waterSources[0];
      let minDist = Math.hypot(player.x - nearest.x, player.y - nearest.y);
      for (const ws of waterSources) {
        const d = Math.hypot(player.x - ws.x, player.y - ws.y);
        if (d < minDist) {
          minDist = d;
          nearest = ws;
        }
      }
      targetAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
      targetDesc = nearest.name;
      targetDistance = Math.round(minDist / 10);
    }
  }

  // Check proximity to water source or plant plot for dynamic action buttons
  let nearWaterSource = false;
  for (const ws of waterSources) {
    if (Math.hypot(player.x - ws.x, player.y - ws.y) < ws.radius + 35) {
      nearWaterSource = true;
      break;
    }
  }

  let nearFinishPlot = false;
  for (const fp of finishPlots) {
    if (Math.hypot(player.x - fp.x, player.y - fp.y) < fp.radius + 40 && !fp.isFullyHydrated) {
      nearFinishPlot = true;
      break;
    }
  }

  // Check nearby alerted predators for acoustic sensor
  let nearestAlertAnimal: (typeof animals)[0] | null = null;
  let minAnimalDist = 999999;
  for (const a of animals) {
    const dist = Math.hypot(player.x - a.x, player.y - a.y);
    if (dist < minAnimalDist) {
      minAnimalDist = dist;
      if (a.state === 'chase' || a.state === 'alert' || dist < 300) {
        nearestAlertAnimal = a;
      }
    }
  }

  // Format timer
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Health segments calculation (5 blocks)
  const healthSegments = 5;
  const activeHealthSegments = Math.ceil((player.health / 100) * healthSegments);

  return (
    <div
      id="game-hud-overlay"
      className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none z-10 text-emerald-50"
    >
      {/* TOP HEADER BAR (Immersive UI Style) */}
      <header
        id="hud-top-bar"
        className="h-16 sm:h-20 bg-black/75 border-b border-emerald-500/30 flex items-center justify-between px-3 sm:px-8 z-20 backdrop-blur-md pointer-events-auto shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
      >
        {/* Left: Mission Phase & Farmer Vitality */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-emerald-500/80 font-bold">
              Mission Phase
            </span>
            <span className="text-base sm:text-xl font-black tracking-tighter italic text-white flex items-baseline gap-1">
              LEVEL {level.levelNumber < 10 ? `0${level.levelNumber}` : level.levelNumber}
              <span className="text-emerald-500/50 text-xs sm:text-sm font-semibold not-italic">
                / 30
              </span>
            </span>
          </div>

          <div className="h-8 sm:h-10 w-[1px] bg-emerald-500/20" />

          {/* Operative Biometric Profile Card */}
          <div className="hidden sm:flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-sm">
            {/* Realistic Vector Human Operative Portrait */}
            <div className="relative w-9 h-9 rounded-sm overflow-hidden bg-slate-900 border border-emerald-400/40 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                {/* Background Tactical Matrix */}
                <rect width="40" height="40" fill="#0b130e" />
                <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
                <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(16,185,129,0.15)" strokeWidth="0.5" />
                
                {/* Shoulders & Flannel Shirt Collar */}
                <path d="M 6 40 Q 20 28 34 40 Z" fill="#861e1e" />
                <path d="M 12 36 L 20 28 L 28 36 Z" fill="#b93232" />
                <path d="M 16 36 L 20 30 L 24 36 Z" fill="#501010" />

                {/* Muscular Neck */}
                <rect x="16" y="22" width="8" height="9" fill="#d48a56" rx="1" />
                <path d="M 18 23 L 20 28 L 22 23" stroke="#b0693c" strokeWidth="0.8" fill="none" />

                {/* Anatomical Head & Jawline */}
                <ellipse cx="20" cy="18" rx="8" ry="9" fill="#e59f6b" />
                {/* 5 O'Clock Stubble */}
                <path d="M 14 18 Q 20 27 26 18 Q 20 25 14 18 Z" fill="rgba(45,25,15,0.4)" />

                {/* Ears */}
                <ellipse cx="11.5" cy="18" rx="1.5" ry="2.5" fill="#d48a56" />
                <ellipse cx="28.5" cy="18" rx="1.5" ry="2.5" fill="#d48a56" />

                {/* Eyes & Brows */}
                <rect x="14.5" y="15.5" width="3" height="1.5" rx="0.5" fill="#ffffff" />
                <rect x="22.5" y="15.5" width="3" height="1.5" rx="0.5" fill="#ffffff" />
                <circle cx="16" cy="16.2" r="0.9" fill="#2d1a0e" />
                <circle cx="24" cy="16.2" r="0.9" fill="#2d1a0e" />
                <path d="M 14 14.5 Q 16 13.8 18 14.5" stroke="#26170d" strokeWidth="1" fill="none" />
                <path d="M 22 14.5 Q 24 13.8 26 14.5" stroke="#26170d" strokeWidth="1" fill="none" />

                {/* Nose & Highlight */}
                <path d="M 20 15 L 20 20 L 21.5 20" stroke="#ffeedb" strokeWidth="1" strokeLinecap="round" fill="none" />
                {/* Mouth */}
                <line x1="17.5" y1="23" x2="22.5" y2="23" stroke="#8b4513" strokeWidth="0.8" strokeLinecap="round" />

                {/* Expedition Boonie Hat Brim & Crown */}
                <ellipse cx="20" cy="12" rx="12" ry="4" fill="#a37f48" stroke="#705327" strokeWidth="0.6" />
                <ellipse cx="20" cy="10" rx="7.5" ry="3.5" fill="#deb87a" />
                <path d="M 13 10 Q 20 12 27 10" stroke="#3d2a13" strokeWidth="1" fill="none" />
                <circle cx="16" cy="8.5" r="0.6" fill="#d4af37" />
                <circle cx="24" cy="8.5" r="0.6" fill="#d4af37" />

                {/* Tactical HUD Crosshair scanline */}
                <line x1="0" y1="36" x2="40" y2="36" stroke="#10b981" strokeWidth="0.8" opacity="0.6" />
              </svg>
              {player.health < 35 && (
                <div className="absolute inset-0 bg-red-500/30 animate-pulse border border-red-500" />
              )}
            </div>

            {/* Vital Signs (ECG BPM & Temp) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Activity className={`w-3 h-3 ${player.isSprinting ? 'text-amber-400 animate-bounce' : 'text-emerald-400'}`} />
                <span className="text-[10px] font-mono font-bold text-slate-200">
                  {player.isSprinting ? '142' : player.health < 40 ? '118' : '74'} <span className="text-[8px] text-emerald-500">BPM</span>
                </span>
                <span className="text-[8px] font-mono text-emerald-400/60 ml-1">37.0°C</span>
              </div>
              <span className="text-[8px] uppercase tracking-widest text-emerald-500/80 font-mono">
                {player.isCrouching ? 'STEALTH STANCE' : player.isSprinting ? 'RAPID SPRINT' : 'FIELD OPERATIVE'}
              </span>
            </div>
          </div>

          <div className="h-8 sm:h-10 w-[1px] bg-emerald-500/20" />

          {/* Farmer Vitality Segmented Meter */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-emerald-500/80 font-bold flex items-center gap-1">
                Farmer Vitality
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                {Math.ceil(player.health)}%
              </span>
            </div>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: healthSegments }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 sm:w-6 h-2 transition-all ${
                    i < activeHealthSegments
                      ? player.health < 35
                        ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse'
                        : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      : 'bg-emerald-950/80 border border-emerald-900/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stamina Meter */}
          <div className="hidden lg:flex flex-col min-w-[100px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
                Stamina
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300">
                {Math.ceil(player.stamina)}%
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-950 border border-amber-500/30 mt-1 rounded-sm overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all shadow-[0_0_8px_#fbbf24]"
                style={{ width: `${player.stamina}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Tactical Compass / Objective */}
        <div
          id="hud-compass"
          className="hidden md:flex items-center gap-3 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-sm backdrop-blur-sm"
        >
          <div
            className="w-7 h-7 rounded-full bg-black/60 border border-emerald-400/50 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${targetAngle}rad)` }}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold block">
              {player.waterCarried > 0 ? 'Target: Hydrate Crop' : 'Target: Water Reserve'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-[130px] block">
              {targetDesc} ({targetDistance}m)
            </span>
          </div>
        </div>

        {/* Right: Water Reserves & Tactical Control Buttons */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Water Reserves Bar */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
                Water Reserves
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-300">
                {Math.floor(totalWaterDelivered)} / {totalWaterGoal}L
              </span>
            </div>
            <div className="w-28 sm:w-44 h-2.5 sm:h-3 bg-slate-950 border border-cyan-500/40 mt-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_#22d3ee]"
                style={{ width: `${overallWaterPct}%` }}
              />
            </div>
          </div>

          {/* Quick Sound / Guide / Level Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mission Timer */}
            <div className="hidden sm:block bg-black/60 border border-emerald-500/30 px-2.5 py-1.5 text-xs font-mono text-emerald-400 font-bold">
              {timeFormatted}
            </div>

            <button
              id="hud-sound-toggle-btn"
              onClick={() => {
                soundEngine.toggleMute();
                onOpenAudioSettings();
              }}
              title="Acoustic Settings"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <button
              id="hud-guide-btn"
              onClick={onOpenGuide}
              title="Field Survival Guide"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center transition"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
            </button>

            {/* Skewed Immersive Level Select Button */}
            <button
              id="hud-level-select-btn"
              onClick={onOpenLevelSelect}
              className="bg-emerald-600 hover:bg-emerald-500 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-sm skew-x-[-12deg] transition-all border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <span className="block skew-x-[12deg] font-bold text-xs sm:text-sm tracking-widest text-slate-950 uppercase flex items-center gap-1.5">
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Campaign</span> Map
              </span>
            </button>

            {/* Quick End & Proceed to Next Level Button */}
            <button
              id="hud-finish-and-next-btn"
              onClick={onForceCompleteLevel}
              title="Complete Current Sector & Proceed to Next Level [Key: N]"
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm skew-x-[-12deg] transition-all border border-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.6)] animate-pulse"
            >
              <span className="block skew-x-[12deg] font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 font-mono text-slate-950">
                <FastForward className="w-4 h-4 text-slate-950 fill-current" />
                <span>Next Level</span>
                <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MIDDLE: SATELLITE RADAR & ACOUSTIC SENSOR (Desktop Tactical Sidebar View) */}
      <div className="flex-1 flex justify-between items-start p-3 sm:p-6 pointer-events-none">
        {/* Left Floating Stealth & Sensor Indicators */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Status Pills */}
          <div className="flex flex-col gap-1.5 text-[10px] font-mono">
            {player.isInBush && (
              <div className="bg-emerald-950/90 text-emerald-300 px-2.5 py-1 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>CAMOUFLAGE: VEGETATION COVER ACTIVE</span>
              </div>
            )}
            {player.isCrouching && (
              <div className="bg-slate-950/90 text-amber-300 px-2.5 py-1 border border-amber-500/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-400" />
                <span>LOCOMOTION: SILENT STALKING</span>
              </div>
            )}
            {player.isInMud && (
              <div className="bg-amber-950/90 text-amber-200 px-2.5 py-1 border border-amber-600/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 animate-pulse" />
                <span>HAZARD: TERRAIN RESISTANCE (MUD)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Floating Tactical Telemetry (Satellite Feed & Acoustic Sensor) */}
        <aside className="hidden xl:flex w-72 bg-black/60 backdrop-blur-lg border border-emerald-500/30 p-4 flex-col gap-4 pointer-events-auto shadow-2xl">
          {/* Satellite Radar Feed */}
          <div className="border border-emerald-500/30 p-3 bg-emerald-950/20 relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Satellite Feed
              </span>
              <span className="text-[9px] font-mono text-emerald-500/60">LIVE</span>
            </div>

            {/* Radar Scope Box */}
            <div className="h-32 w-full bg-black/90 mt-2 relative border border-emerald-900/60 overflow-hidden bg-carbon-pattern">
              {/* Radar Grid Circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-emerald-500/20 rounded-full w-16 h-16 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-emerald-500/10 rounded-full w-28 h-28 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-emerald-500/10" />
                <div className="h-full w-px bg-emerald-500/10 absolute" />
              </div>

              {/* Radar Sweep Line */}
              <div className="absolute top-1/2 left-1/2 w-16 h-16 origin-top-left -translate-x-0 -translate-y-0 animate-radar-sweep pointer-events-none opacity-40 bg-gradient-to-br from-emerald-500/30 to-transparent" />

              {/* Farmer Center Ping */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-300 rounded-full shadow-[0_0_8px_#fde047]" />

              {/* Predator Pings on Radar */}
              {animals.map((a, i) => {
                const dx = (a.x - player.x) / 30;
                const dy = (a.y - player.y) / 30;
                if (Math.abs(dx) > 55 || Math.abs(dy) > 55) return null;
                return (
                  <div
                    key={i}
                    className={`absolute w-1.5 h-1.5 rounded-full ${
                      a.state === 'chase'
                        ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
                        : 'bg-red-400/80'
                    }`}
                    style={{
                      left: `calc(50% + ${dx}px)`,
                      top: `calc(50% + ${dy}px)`,
                    }}
                  />
                );
              })}

              {/* Water source ping */}
              {waterSources.map((ws, i) => {
                const dx = (ws.x - player.x) / 30;
                const dy = (ws.y - player.y) / 30;
                if (Math.abs(dx) > 55 || Math.abs(dy) > 55) return null;
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse"
                    style={{
                      left: `calc(50% + ${dx}px)`,
                      top: `calc(50% + ${dy}px)`,
                    }}
                  />
                );
              })}

              <div className="absolute bottom-1 left-2 text-[8px] font-mono text-emerald-500/70">
                SQUARE_COORD: {(player.x / 10).toFixed(1)} // {(player.y / 10).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Acoustic Wildlife Sensor */}
          <div className="border border-emerald-500/30 p-3 bg-emerald-950/20">
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Acoustic Sensor
            </span>
            <div className="flex items-end gap-1.5 h-10 mt-2 px-2 bg-black/80 border border-emerald-950 py-1">
              <div className="w-1.5 bg-emerald-500 h-[25%]" />
              <div className="w-1.5 bg-emerald-500 h-[45%]" />
              <div
                className={`w-1.5 transition-all duration-100 ${
                  nearestAlertAnimal
                    ? 'bg-red-500 h-[90%] shadow-[0_0_8px_#ef4444]'
                    : 'bg-emerald-500 h-[30%]'
                }`}
              />
              <div
                className={`w-1.5 transition-all duration-100 ${
                  nearestAlertAnimal
                    ? 'bg-red-500 h-[100%] shadow-[0_0_12px_#ef4444] animate-pulse'
                    : 'bg-emerald-500 h-[20%]'
                }`}
              />
              <div
                className={`w-1.5 transition-all duration-100 ${
                  nearestAlertAnimal
                    ? 'bg-red-500 h-[80%] shadow-[0_0_8px_#ef4444]'
                    : 'bg-emerald-500 h-[50%]'
                }`}
              />
              <div className="w-1.5 bg-emerald-500 h-[40%]" />
              <div className="w-1.5 bg-emerald-500 h-[60%]" />
              <div className="w-1.5 bg-emerald-500 h-[30%]" />
            </div>
            <div className="text-[9px] mt-1.5 font-mono truncate">
              {nearestAlertAnimal ? (
                <span className="text-red-400 font-bold">
                  DETECTED: {nearestAlertAnimal.species.toUpperCase()} ALERT
                </span>
              ) : (
                <span className="text-emerald-500/70">ENVIRONMENT_NOISE: NOMINAL</span>
              )}
            </div>
          </div>

          {/* Tactical Inventory Slots */}
          <div className="border-t border-emerald-500/20 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider">
                TACTICAL GEAR
              </span>
              <span className="text-[9px] font-mono text-emerald-500/60">3 ACTIVE</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center p-1">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] font-mono text-cyan-300 font-bold mt-0.5">
                  {Math.floor(player.waterCarried)}L
                </span>
              </div>
              <div className="aspect-square bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center p-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[9px] font-mono text-orange-300 font-bold mt-0.5">
                  x{player.inventory.flares}
                </span>
              </div>
              <div className="aspect-square bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center p-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">
                  x{player.inventory.stones}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM ACTION DOCK & FOOTER TELEMETRY */}
      <div className="pointer-events-auto">
        {/* Interaction Buttons Dock */}
        <div
          id="hud-bottom-bar"
          className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-8 py-2 bg-black/60 backdrop-blur-md border-t border-emerald-500/20"
        >
          {/* Quick Carrier Tank Gauge */}
          <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-sm">
            <div className="relative w-7 h-7 rounded-sm bg-slate-950 border border-cyan-500/40 flex items-center justify-center overflow-hidden">
              <div
                className="absolute bottom-0 inset-x-0 bg-cyan-400 transition-all duration-200 shadow-[0_0_10px_#22d3ee]"
                style={{ height: `${(player.waterCarried / player.waterCapacity) * 100}%` }}
              />
              <Droplets className="w-3.5 h-3.5 text-cyan-200 relative z-10" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                Carrier Tank
              </div>
              <div className="text-xs font-mono font-bold text-white">
                {Math.floor(player.waterCarried)} / {player.waterCapacity} Liters
              </div>
            </div>
          </div>

          {/* Tactical Items & Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Flare Action */}
            <button
              id="action-btn-flare"
              onClick={() => onActionItem('flare')}
              disabled={player.inventory.flares <= 0}
              className={`px-3 py-2 border rounded-sm transition flex items-center gap-2 ${
                player.inventory.flares > 0
                  ? 'bg-orange-950/80 hover:bg-orange-900 border-orange-500 text-orange-200 shadow-[0_0_10px_rgba(249,115,22,0.3)] active:scale-95'
                  : 'bg-black/60 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold tracking-wider text-orange-400">
                  Deploy Flare [Q/1]
                </div>
                <div className="text-xs font-mono font-bold">x{player.inventory.flares} READY</div>
              </div>
            </button>

            {/* Stone Distraction Action */}
            <button
              id="action-btn-stone"
              onClick={() => onActionItem('stone')}
              disabled={player.inventory.stones <= 0}
              className={`px-3 py-2 border rounded-sm transition flex items-center gap-2 ${
                player.inventory.stones > 0
                  ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-500 text-slate-200 active:scale-95'
                  : 'bg-black/60 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-300" />
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                  Toss Stone [F/2]
                </div>
                <div className="text-xs font-mono font-bold">x{player.inventory.stones} READY</div>
              </div>
            </button>

            {/* Collect Water Button */}
            <button
              id="action-btn-collect-water"
              onMouseDown={() => onCollectWaterToggle(true)}
              onMouseUp={() => onCollectWaterToggle(false)}
              onTouchStart={() => onCollectWaterToggle(true)}
              onTouchEnd={() => onCollectWaterToggle(false)}
              className={`px-4 py-2 rounded-sm border font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 ${
                nearWaterSource
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-300 shadow-[0_0_15px_#22d3ee] animate-pulse'
                  : 'bg-black/80 hover:bg-slate-900 text-cyan-300 border-cyan-500/30'
              }`}
            >
              <Droplets className="w-4 h-4 text-cyan-300" />
              <span className="font-mono tracking-wider">[SPACE] EXTRACT WATER</span>
            </button>

            {/* Water Finish Crops Button */}
            <button
              id="action-btn-nourish-plants"
              onMouseDown={() => onPourWaterToggle(true)}
              onMouseUp={() => onPourWaterToggle(false)}
              onTouchStart={() => onPourWaterToggle(true)}
              onTouchEnd={() => onPourWaterToggle(false)}
              className={`px-4 py-2 rounded-sm border font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 ${
                nearFinishPlot && player.waterCarried > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300 shadow-[0_0_15px_#10b981] animate-pulse'
                  : 'bg-black/80 hover:bg-slate-900 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="font-mono tracking-wider">[E] REVITALIZE CROPS</span>
            </button>

            {/* Instant End/Next Level Action Button */}
            <button
              id="action-btn-instant-next-level"
              onClick={onForceCompleteLevel}
              className="px-4 py-2 rounded-sm border border-amber-400 bg-amber-950/70 hover:bg-amber-900/90 text-amber-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            >
              <FastForward className="w-4 h-4 text-amber-400" />
              <span className="font-mono tracking-wider">[N] PROCEED TO NEXT LEVEL</span>
            </button>
          </div>
        </div>

        {/* Tactical Footer Telemetry Bar */}
        <footer className="h-9 sm:h-11 bg-[#050905] border-t border-emerald-500/20 flex items-center px-4 sm:px-8 justify-between text-[9px] sm:text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto py-1">
            <span>[W,A,S,D] Movement</span>
            <span>[SHIFT] Sprint</span>
            <span>[C] Stealth</span>
            <span className="text-cyan-400">[SPACE] Extract Water</span>
            <span className="text-emerald-400">[E] Water Crops</span>
            <span>[Q] Flare</span>
            <span>[F] Stone</span>
            <span className="text-amber-300 font-bold">[N] NEXT LEVEL</span>
          </div>
          <div className="hidden md:block text-emerald-500/40 text-[9px]">
            TACTICAL_RADAR_V2.4 // STATUS: OPTIMAL
          </div>
        </footer>
      </div>
    </div>
  );
};
