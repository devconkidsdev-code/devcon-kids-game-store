import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Clock, Trophy, Droplets, Wrench } from 'lucide-react';
import { audio } from './audio';

const REPAIR_TIME = 1000; // ms
const INTERACTION_RADIUS = 150; // px

const getLevelStats = (level: number) => {
  const pipeCount = Math.min(45, 4 + Math.ceil(level * 1.5));
  // Provide enough time that scales with level and pipes, but keeps it challenging
  const duration = Math.max(25, 15 + Math.floor(pipeCount * 2.5) + Math.floor(level * 1.5));
  return { pipeCount, duration };
};

type PipeDecoration = {
  type: 'rock' | 'root' | 'dirt' | 'bone' | 'crack';
  dx: number;
  dy: number;
  size: number;
  z: number;
  rot: number;
};

type PipeData = {
  id: string;
  x: number; // percentage
  y: number; // percentage
  isFixed: boolean;
  severity: number;
  maxSeverity: number;
  decorations: PipeDecoration[];
};

const CommunityBackground = () => (
  <div className="absolute inset-0 bg-[#87CEEB] overflow-hidden pointer-events-none select-none">
    {/* Sun */}
    <div className="absolute top-12 right-20 w-24 h-24 bg-yellow-300 rounded-full blur-[2px] shadow-[0_0_60px_rgba(253,224,71,0.8)] z-0" />

    {/* Sky & Clouds */}
    <div className="absolute top-[10%] left-[20%] w-48 h-16 bg-white/80 rounded-full blur-[2px] z-10" />
    <div className="absolute top-[15%] left-[25%] w-32 h-16 bg-white/80 rounded-full blur-[2px] z-10" />
    <div className="absolute top-[8%] left-[70%] w-40 h-12 bg-white/60 rounded-full blur-[2px] z-10" />
    <div className="absolute top-[20%] right-[10%] w-56 h-14 bg-white/70 rounded-full blur-[2px] z-10" />

    {/* Birds */}
    <svg className="absolute top-[15%] left-[50%] w-10 h-6 opacity-60 z-10" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12 Q 7 4 12 12 Q 17 4 22 12" /></svg>
    <svg className="absolute top-[12%] left-[55%] w-8 h-5 opacity-50 z-10" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12 Q 7 4 12 12 Q 17 4 22 12" /></svg>
    <svg className="absolute top-[18%] left-[45%] w-6 h-4 opacity-40 z-10" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12 Q 7 4 12 12 Q 17 4 22 12" /></svg>

    {/* Mountains */}
    <div className="absolute bottom-[65%] left-[-5%] w-[35%] h-[30%] bg-[#64748b] opacity-80 z-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    <div className="absolute bottom-[65%] left-[20%] w-[50%] h-[40%] bg-[#475569] opacity-90 z-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    <div className="absolute bottom-[65%] left-[65%] w-[40%] h-[25%] bg-[#94a3b8] opacity-75 z-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    
    {/* Cityscape / Community Buildings */}
    {/* Tall Building */}
    <div className="absolute bottom-[65%] left-[10%] w-32 h-48 bg-stone-300 border-x-4 border-t-4 border-stone-400 rounded-t-xl z-10">
       <div className="absolute top-6 left-4 w-6 h-10 bg-stone-700 rounded-sm" />
       <div className="absolute top-6 right-4 w-6 h-10 bg-stone-700 rounded-sm" />
       <div className="absolute top-20 left-4 w-6 h-10 bg-stone-700 rounded-sm" />
       <div className="absolute top-20 right-4 w-6 h-10 bg-stone-700 rounded-sm" />
       <div className="absolute top-34 left-4 w-6 h-10 bg-stone-700 rounded-sm" />
       <div className="absolute top-34 right-4 w-6 h-10 bg-stone-700 rounded-sm" />
    </div>
    
    {/* House 1 */}
    <div className="absolute bottom-[65%] left-[32%] w-28 h-24 bg-amber-100 border-x-2 border-t-2 border-amber-900 z-20 flex flex-col items-center">
        <div className="absolute -top-12 -left-2 w-32 h-14 bg-red-600 border-b-4 border-red-900" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div className="absolute top-4 left-3 w-6 h-6 bg-blue-200 border-2 border-blue-900" />
        <div className="absolute top-4 right-3 w-6 h-6 bg-blue-200 border-2 border-blue-900" />
        <div className="mt-auto w-8 h-12 bg-[#8b4513] border-x-2 border-t-2 border-[#5c2e0b]" />
    </div>

    {/* Small Building */}
    <div className="absolute bottom-[65%] left-[55%] w-24 h-36 bg-[#e2e8f0] border-x-4 border-t-4 border-slate-400 rounded-t-xl z-10">
       <div className="absolute top-4 left-4 w-5 h-8 bg-slate-700 rounded-sm" />
       <div className="absolute top-4 right-4 w-5 h-8 bg-slate-700 rounded-sm" />
       <div className="absolute top-16 left-4 w-5 h-8 bg-slate-700 rounded-sm" />
       <div className="absolute top-16 right-4 w-5 h-8 bg-slate-700 rounded-sm" />
    </div>

    {/* Trees */}
    <div className="absolute bottom-[65%] left-[5%] flex flex-col items-center z-20">
       <div className="w-16 h-16 bg-green-700 rounded-full -mb-6 border-2 border-green-900 shadow-lg" />
       <div className="w-4 h-12 bg-[#5c2e0b] border-x-2 border-[#3d1e06]" />
    </div>
    <div className="absolute bottom-[65%] left-[48%] flex flex-col items-center z-20">
       <div className="w-14 h-14 bg-green-600 rounded-full -mb-5 border-2 border-green-800 shadow-lg" />
       <div className="w-3 h-10 bg-[#5c2e0b] border-x-2 border-[#3d1e06]" />
    </div>
    <div className="absolute bottom-[65%] right-[15%] flex flex-col items-center z-20">
       <div className="w-20 h-20 bg-green-800 rounded-full -mb-8 border-2 border-green-950 shadow-lg" />
       <div className="w-5 h-16 bg-[#5c2e0b] border-x-2 border-[#3d1e06]" />
    </div>

    {/* Flowers along grass */}
    <div className="absolute bottom-[65%] left-[25%] text-2xl z-30">🌻</div>
    <div className="absolute bottom-[65%] left-[28%] text-lg z-30">🌷</div>
    <div className="absolute bottom-[65%] left-[44%] text-xl z-30">🌸</div>
    <div className="absolute bottom-[65%] right-[30%] text-2xl z-30">🌼</div>
    <div className="absolute bottom-[65%] right-[26%] text-xl z-30">🌹</div>

    {/* Ground Surface (Grass) */}
    <div className="absolute top-[35%] left-0 right-0 h-4 bg-green-500 border-t-4 border-green-400 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.3)]" />
    
    {/* Underground Dirt */}
    <div className="absolute top-[35%] bottom-0 left-0 right-0 bg-[#3d2a17] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] z-0">
      {/* SVG Noise Texture for Dirt realism */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  </div>
);

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(getLevelStats(1).duration);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [facingRight, setFacingRight] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const [repairingId, setRepairingId] = useState<string | null>(null);
  const [repairProgress, setRepairProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and handle window resize
  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        // Center mouse initially if not set
        if (mousePos.x === 0 && mousePos.y === 0) {
          setMousePos({ x: width / 2, y: height / 2 });
        }
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    let lastTime = performance.now();
    let reqId: number;

    const tick = (now: number) => {
      const deltaMs = now - lastTime;
      lastTime = now;

      const brokenPipes = pipes.filter(p => !p.isFixed);
      const totalSeverity = brokenPipes.reduce((sum, p) => sum + p.severity, 0);
      const penaltyPerSeverity = 0.04 + (level * 0.004);
      const multiplier = 1 + (totalSeverity * penaltyPerSeverity);
      const drain = (deltaMs / 1000) * multiplier;

      setTimeLeft(prev => {
        const next = prev - drain;
        if (next <= 0) {
          audio.stopBGM();
          audio.playGameOver();
          setGameState('lost');
          return 0;
        }
        return next;
      });
      reqId = requestAnimationFrame(tick);
    };
    reqId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqId);
  }, [gameState, pipes, level]);

  // Win condition check
  useEffect(() => {
    if (gameState === 'playing' && pipes.length > 0) {
      const allFixed = pipes.every(p => p.isFixed);
      if (allFixed) {
        audio.stopBGM();
        audio.playLevelUp();
        setGameState('won');
      }
    }
  }, [pipes, gameState]);

  const generatePipes = (count: number, currentLevel: number) => {
    const newPipes: PipeData[] = [];
    const decoTypes: ('rock' | 'root' | 'dirt' | 'bone' | 'crack')[] = ['rock', 'root', 'dirt', 'bone', 'crack'];
    
    let attempts = 0;
    let minDistance = 20;

    while (newPipes.length < count && attempts < 1000) {
      attempts++;
      const x = 10 + Math.random() * 80;
      const y = 45 + Math.random() * 45; // Keep in dirt area
      
      // Gradually reduce minDistance if we are struggling to find space
      if (attempts > 100) minDistance = 15;
      if (attempts > 300) minDistance = 10;
      if (attempts > 500) minDistance = 5;
      
      // Ensure pipes aren't too close to each other
      const isTooClose = newPipes.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
      
      if (!isTooClose) {
        const decorations: PipeDecoration[] = [];
        const numDecos = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numDecos; i++) {
          const type = decoTypes[Math.floor(Math.random() * decoTypes.length)];
          const isLeft = Math.random() > 0.5;
          const dx = (isLeft ? -1 : 1) * (60 + Math.random() * 80); // 60px to 140px away from center
          const dy = (Math.random() - 0.5) * 100;
          const size = 0.5 + Math.random() * 1;
          
          decorations.push({
            type, dx, dy, size,
            z: dy > 0 ? 20 : 0, // Render in front if lower on the screen
            rot: Math.random() * 360
          });
        }

        let maxAllowedSev = 1;
        if (currentLevel >= 12) maxAllowedSev = 4;
        else if (currentLevel >= 6) maxAllowedSev = 3;
        else if (currentLevel >= 3) maxAllowedSev = 2;
        
        const sev = Math.floor(Math.random() * maxAllowedSev) + 1;

        newPipes.push({
          id: `pipe-${newPipes.length}`,
          x,
          y,
          isFixed: false,
          severity: sev,
          maxSeverity: sev,
          decorations
        });
      }
    }
    return newPipes;
  };

  const handleStartGame = (reset: boolean = false) => {
    audio.init();
    audio.startBGM();
    const nextLevel = reset ? 1 : (gameState === 'won' && level < 50 ? level + 1 : 1);
    if (nextLevel === 1) setScore(0);
    setLevel(nextLevel);
    const stats = getLevelStats(nextLevel);
    setPipes(generatePipes(stats.pipeCount, nextLevel));
    setTimeLeft(stats.duration);
    setGameState('playing');
    setRepairingId(null);
    setRepairProgress(0);
  };

  const startRepair = useCallback((id: string) => {
    if (repairingId) return;
    audio.playHit();
    setRepairingId(id);
    setRepairProgress(0);
    
    const baseRepairTime = Math.max(350, 750 - (level * 10));

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / baseRepairTime) * 100, 100);
      setRepairProgress(progress);
      
      if (elapsed >= baseRepairTime) {
        clearInterval(timer);
        setPipes(prev => prev.map(p => {
          if (p.id === id) {
            const newSeverity = p.severity - 1;
            if (newSeverity <= 0) {
              audio.playFix();
              setScore(s => s + (p.maxSeverity * 2));
              return { ...p, severity: 0, isFixed: true };
            }
            return { ...p, severity: newSeverity };
          }
          return p;
        }));
        setRepairingId(null);
      }
    }, 50);
  }, [repairingId, level]);

  // Mouse & Touch tracking
  const updateMousePos = (clientX: number, clientY: number) => {
    if (gameState !== 'playing') return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setMousePos(prev => {
        if (x !== prev.x) setFacingRight(x > prev.x);
        return { x, y };
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateMousePos(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
  };

  const getDistance = (pxPct: number, pyPct: number) => {
    const pipeX = (pxPct / 100) * dimensions.width;
    const pipeY = (pyPct / 100) * dimensions.height;
    return Math.sqrt(Math.pow(pipeX - mousePos.x, 2) + Math.pow(pipeY - mousePos.y, 2));
  };

  return (
    <div 
      className="relative w-full h-screen bg-[#344029] overflow-hidden font-sans select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={containerRef}
    >
      <CommunityBackground />

      {/* Main Game Area */}
      {gameState === 'playing' && (
        <>
          {/* HUD */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-8 z-40 shadow-lg pointer-events-none">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-2 rounded-lg shadow-inner">
                 <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <h1 className="text-white font-black text-2xl tracking-tighter">BROPIPE</h1>
              <div className="ml-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-blue-400 font-bold text-sm tracking-widest">
                LVL {level}
              </div>
            </div>
            
            <div className="flex gap-10 items-center">
              <div className="bg-slate-800 border border-slate-700 rounded-xl px-6 py-1 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Score</div>
                  <div className="text-blue-400 font-mono text-xl font-bold">{score.toString().padStart(4, '0')}</div>
                </div>
                <div className="w-[1px] h-8 bg-slate-700"></div>
                <div className="text-center relative flex flex-col items-center">
                  <div className={`text-[10px] uppercase font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>Timer</div>
                  <div className={`font-mono text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                    00:{Math.ceil(timeLeft).toString().padStart(2, '0')}
                  </div>
                  {pipes.filter(p => !p.isFixed).length > 0 && (
                    <div className="text-[9px] font-black text-red-400 bg-red-900/40 px-1.5 rounded absolute -bottom-5 whitespace-nowrap shadow-sm border border-red-900/50">
                      {(1 + (pipes.filter(p => !p.isFixed).reduce((sum, p) => sum + p.severity, 0) * (0.04 + (level * 0.004)))).toFixed(1)}x DRAIN
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pipes */}
          {pipes.map(pipe => {
            const isNear = getDistance(pipe.x, pipe.y) < INTERACTION_RADIUS;
            const isRepairingThis = repairingId === pipe.id;
            const canRepair = isNear && !pipe.isFixed && !repairingId;

            return (
              <div 
                key={pipe.id} 
                className="absolute top-0 left-0 z-10"
                style={{ 
                  left: `${pipe.x}%`, 
                  top: `${pipe.y}%`,
                }}
              >
                <div className="relative transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  
                  {/* Decorations */}
                  {pipe.decorations.map((deco, idx) => (
                    <div 
                      key={idx} 
                      className="absolute pointer-events-none flex items-center justify-center select-none"
                      style={{ 
                        left: '50%', top: '50%',
                        transform: `translate(calc(-50% + ${deco.dx}px), calc(-50% + ${deco.dy}px)) rotate(${deco.rot}deg)`,
                        zIndex: deco.z
                      }}
                    >
                      {deco.type === 'rock' && <div className="w-12 h-10 bg-stone-500 rounded-tl-3xl rounded-br-2xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.3)] border border-stone-600" style={{ transform: `scale(${deco.size})` }} />}
                      {deco.type === 'root' && <div className="w-16 h-2 bg-[#4a3525] rounded-full border border-[#2a1f16]" style={{ transform: `scale(${deco.size}) rotate(${deco.rot}deg)` }} />}
                      {deco.type === 'dirt' && <div className="w-20 h-10 bg-[#291b0f] rounded-[50px] opacity-60 blur-[2px]" style={{ transform: `scale(${deco.size})` }} />}
                      {deco.type === 'bone' && <div className="w-12 h-4 bg-stone-200 rounded-full border border-stone-400 opacity-80 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] flex items-center justify-between px-[-2px]"><div className="w-3 h-3 bg-stone-200 rounded-full" /><div className="w-3 h-3 bg-stone-200 rounded-full" /></div>}
                      {deco.type === 'crack' && <div className="w-16 h-2 bg-stone-900 opacity-40 blur-[1px] rounded-full" style={{ transform: `scale(${deco.size}) rotate(${deco.rot}deg)` }} />}
                    </div>
                  ))}

                  {/* Pipe Body & Ground Crater */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-[#18110b] rounded-full blur-md shadow-inner z-0 opacity-80" />
                  
                  <div className="w-32 h-12 relative flex items-center shadow-2xl rounded-sm z-10">
                     {pipe.isFixed ? (
                        <>
                          <div className="w-full h-full bg-gradient-to-b from-stone-600 via-stone-400 to-stone-700 border-2 border-stone-800 rounded-sm relative overflow-hidden flex items-center justify-center">
                             {/* Rust patches */}
                             <div className="absolute top-1 left-2 w-4 h-3 bg-orange-900/40 blur-[1px]" />
                             <div className="absolute bottom-2 right-4 w-6 h-4 bg-orange-800/30 blur-[2px]" />
                             <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay" />
                             <div className="absolute left-0 w-3 h-full bg-stone-700 border-r-2 border-stone-800 shadow-xl" />
                             <div className="absolute right-0 w-3 h-full bg-stone-700 border-l-2 border-stone-800 shadow-xl" />
                             {/* Metal Sleeve Patch */}
                             <div className="w-16 h-full bg-stone-300 border-x-2 border-stone-600 z-10 relative flex items-center justify-center shadow-lg">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                <div className="absolute top-1.5 left-2 w-1.5 h-1.5 bg-stone-600 rounded-full shadow-[inset_0_-1px_0_rgba(255,255,255,0.8)]" />
                                <div className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-stone-600 rounded-full shadow-[inset_0_-1px_0_rgba(255,255,255,0.8)]" />
                                <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 bg-stone-600 rounded-full shadow-[inset_0_-1px_0_rgba(255,255,255,0.8)]" />
                                <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 bg-stone-600 rounded-full shadow-[inset_0_-1px_0_rgba(255,255,255,0.8)]" />
                             </div>
                          </div>
                          <div className="w-12 h-12 bg-emerald-500 rounded-full absolute -top-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center border-4 border-stone-900 z-20 shadow-lg">
                            <CheckCircle size={24} className="text-white" strokeWidth={4} />
                          </div>
                        </>
                     ) : (
                        <>
                          {/* Broken Pipe (Two Halves) */}
                          <div className="w-full h-full flex items-center justify-between relative">
                             <div className="w-[45%] h-full bg-gradient-to-b from-stone-600 via-stone-400 to-stone-700 border-2 border-r-0 border-stone-800 rounded-l-sm relative overflow-hidden">
                                <div className="absolute top-1 left-2 w-4 h-3 bg-orange-900/40 blur-[1px]" />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay" />
                                <div className="absolute left-0 w-3 h-full bg-stone-700 border-r-2 border-stone-800" />
                                <div className="absolute right-0 h-full w-2 bg-stone-900" style={{ clipPath: 'polygon(0 0, 100% 20%, 0 40%, 100% 60%, 0 80%, 100% 100%, 0 100%)' }} />
                             </div>
                             {/* Gap for water */}
                             <div className="flex-1 h-full relative" />
                             <div className="w-[45%] h-full bg-gradient-to-b from-stone-600 via-stone-400 to-stone-700 border-2 border-l-0 border-stone-800 rounded-r-sm relative overflow-hidden">
                                <div className="absolute bottom-2 right-4 w-6 h-4 bg-orange-800/30 blur-[2px]" />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40 mix-blend-overlay" />
                                <div className="absolute right-0 w-3 h-full bg-stone-700 border-l-2 border-stone-800" />
                                <div className="absolute left-0 h-full w-2 bg-stone-900" style={{ clipPath: 'polygon(100% 0, 0 20%, 100% 40%, 0 60%, 100% 80%, 0 100%, 100% 100%)' }} />
                             </div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#13171a] rounded-full shadow-inner z-0" />
                        </>
                     )}
                  </div>

                  {/* Water Leaking Animation */}
                  {!pipe.isFixed && (
                    <>
                      {/* Puddle */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-8 left-1/2 -translate-x-1/2 bg-blue-500/40 rounded-[100%] blur-sm z-0 pointer-events-none"
                        style={{ width: `${pipe.severity * 2 + 6}rem`, height: `${pipe.severity + 2}rem` }}
                      />
                      {/* Heavy Spray Center Jet */}
                      <motion.div
                        animate={{ height: [pipe.severity * 15, pipe.severity * 25, pipe.severity * 15], opacity: [0.6, 0.9, 0.6], width: [pipe.severity * 3, pipe.severity * 5, pipe.severity * 3] }}
                        transition={{ duration: 0.15, repeat: Infinity }}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full ${pipe.severity === 4 ? 'bg-stone-800/90' : pipe.severity === 3 ? 'bg-red-400/80' : 'bg-blue-300'} rounded-t-full blur-[2px] z-10 pointer-events-none`}
                      />
                      {/* Spray Particles */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        {[...Array(pipe.severity * 12)].map((_, i) => {
                          const isCyan = i % 3 === 0;
                          const isDeep = i % 4 === 0;
                          const isRed = pipe.severity >= 3 && i % 5 === 0;
                          const isBlack = pipe.severity === 4 && i % 4 === 0;
                          return (
                            <motion.div
                              key={i}
                              animate={{
                                y: [0, -40 - Math.random() * (pipe.severity * 30), 30 + Math.random() * 30],
                                x: [(Math.random() - 0.5) * (pipe.severity * 40 + 60), (Math.random() - 0.5) * (pipe.severity * 50 + 80)],
                                opacity: [0, 1, 0],
                                scale: [0.3 + Math.random() * 0.5, 1 + Math.random() * 1.5, 0.5],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.4 + Math.random() * 0.6,
                                delay: Math.random() * 0.5,
                                ease: "easeOut"
                              }}
                              className={`absolute w-3 h-3 ${isBlack ? 'bg-stone-900' : isRed ? 'bg-red-500' : isDeep ? 'bg-blue-600' : isCyan ? 'bg-cyan-400' : 'bg-blue-400'} rounded-full blur-[1px]`}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Interaction UI */}
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30 min-h-[40px] flex flex-col items-center justify-end">
                    {/* Severity Indicator */}
                    {!pipe.isFixed && pipe.maxSeverity > 1 && (
                      <div className="flex gap-1 mb-2 absolute -top-8">
                        {[...Array(pipe.maxSeverity)].map((_, i) => (
                          <div key={i} className={`w-3 h-3 rounded-full border-2 border-stone-900 shadow-sm ${i < pipe.severity ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-stone-600'}`} />
                        ))}
                      </div>
                    )}
                    <AnimatePresence>
                      {canRepair && (
                        <div className="flex flex-col items-center gap-2">
                          <motion.button
                            initial={{ scale: 0, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: 10 }}
                            className="bg-blue-500 text-white w-14 h-14 rounded-full font-black shadow-[0_6px_0_#2563eb] border-2 border-white flex items-center justify-center cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-none pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); startRepair(pipe.id); }}
                          >
                            <svg viewBox='0 0 24 24' className='w-7 h-7' fill='currentColor'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6-3.8 3.8L11 11.6a1 1 0 0 0-1.4 0l-4.9 5a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0l4.2-4.2 1.5 1.5a1 1 0 0 0 1.4 0l5.2-5.2a1 1 0 0 0 0-1.4l-3.6-3.8a1 1 0 0 0-1.4 0z'/></svg>
                          </motion.button>
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-2 h-2 bg-blue-500 rotate-45 border-r border-b border-white"
                          />
                        </div>
                      )}
                    </AnimatePresence>

                    {isRepairingThis && (
                      <div className="w-32 h-6 bg-gray-200 rounded-full border-4 border-gray-400 overflow-hidden shadow-inner">
                        <div className="h-full bg-blue-500 transition-all duration-75 ease-linear" style={{ width: `${repairProgress}%` }} />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          {/* Plumber Cursor - Side View */}
          <motion.div
            className="absolute pointer-events-none z-50 top-0 left-0"
            animate={{ x: mousePos.x, y: mousePos.y }}
            transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
          >
            <div 
              className="relative transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-end h-24 w-16"
              style={{ transform: `translate(-50%, -50%) scaleX(${facingRight ? 1 : -1})` }}
            >
               {/* Plumber shadow */}
               <div className="absolute -bottom-4 w-16 h-6 bg-black/40 rounded-full blur-sm z-0" />
               
               {/* Character Container - Side View Worker */}
               <div className="relative w-16 h-20 z-10 filter drop-shadow-xl flex flex-col items-center justify-end">
                 
                 {/* Hard Hat */}
                 <div className="absolute top-0 w-14 h-8 bg-yellow-400 rounded-t-full border-2 border-stone-900 z-30 overflow-hidden">
                    {/* Hat brim */}
                    <div className="absolute bottom-0 -right-2 w-6 h-2 bg-yellow-400 border-t-2 border-stone-900 rounded-full" />
                 </div>
                 
                 {/* Face */}
                 <div className="absolute top-6 w-10 h-10 bg-[#fcd5b5] border-x-2 border-stone-900 z-20">
                    {/* Eye */}
                    <div className="absolute top-2 right-2 w-2 h-3 bg-stone-900 rounded-full" />
                    {/* Nose */}
                    <div className="absolute top-4 -right-2 w-4 h-3 bg-[#e8a87b] rounded-r-full border-y border-r border-stone-900" />
                    {/* Mustache */}
                    <div className="absolute top-6 -right-1 w-6 h-3 bg-stone-800 rounded-full border border-stone-900" />
                 </div>
                 
                 {/* Body (High Vis Vest) */}
                 <div className="absolute bottom-6 w-12 h-10 bg-[#e85d04] rounded-t-xl border-2 border-stone-900 z-10 overflow-hidden">
                    <div className="absolute top-2 w-full h-2 bg-yellow-400 border-y border-stone-800 opacity-90" />
                 </div>
                 
                 {/* Legs */}
                 <div className="absolute bottom-0 w-10 h-6 flex justify-between z-0">
                    <div className="w-4 h-full bg-blue-700 border-2 border-t-0 border-stone-900" />
                    <div className="w-4 h-full bg-blue-800 border-2 border-t-0 border-stone-900" />
                 </div>
               </div>

               {/* Wrench Arm (Animates when repairing) */}
               <motion.div 
                 className="absolute top-10 z-40 origin-top-left"
                 style={{ right: -4 }}
                 animate={{ rotate: repairingId ? [0, -60, 0] : 20 }}
                 transition={{ repeat: repairingId ? Infinity : 0, duration: 0.15 }}
               >
                  <div className="w-10 h-4 bg-[#e85d04] rounded-full border-2 border-stone-900 relative">
                     {/* Hand */}
                     <div className="absolute -right-2 -top-1 w-6 h-6 bg-[#fcd5b5] rounded-full border-2 border-stone-900 z-10" />
                     {/* Wrench */}
                     <div className="absolute -right-8 -top-8 w-12 h-12 bg-stone-300 rounded-full border-2 border-stone-900 flex items-center justify-center shadow-lg origin-bottom-left rotate-45 z-0">
                        <Wrench size={24} className="text-stone-800" />
                     </div>
                  </div>
               </motion.div>

               <div className="absolute -bottom-8 bg-white/90 px-2 py-0.5 rounded shadow-lg border border-stone-200 z-40">
                 <span className="text-[10px] font-bold text-stone-800 uppercase tracking-tighter whitespace-nowrap" style={{ transform: `scaleX(${facingRight ? 1 : -1})`, display: 'inline-block' }}>Worker</span>
               </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Game States Overlays (Start / Result) */}
      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[4px] z-[60] flex items-center justify-center"
          >
            <div className="bg-white rounded-[32px] p-12 w-[450px] shadow-2xl text-center border-4 border-blue-500 flex flex-col items-center">
              {gameState === 'start' ? (
                <>
                  <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">BROPIPE</h1>
                  <p className="text-slate-500 mb-8 font-medium">
                    The community's water pipes are broken!<br/><br/>
                    Move your plumber to a pipe and click <span className="font-bold text-blue-500">the WRENCH button</span>. Fix them all before time runs out.
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartGame(true)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-colors"
                  >
                    START PLAYING
                  </motion.button>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-black text-slate-900 mb-2">
                    {gameState === 'won' ? (level === 50 ? 'GAME COMPLETE!' : `LEVEL ${level} SAVED!`) : 'TIME IS UP!'}
                  </h2>
                  <p className="text-slate-500 mb-8 font-medium">
                    {gameState === 'won' ? (level === 50 ? 'You fixed every pipe up to Level 50!' : 'The community thanks you, Bro.') : 'The community ran out of water.'}
                  </p>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 w-full">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400 font-bold uppercase text-xs">Total Score</span>
                      <span className="text-3xl font-black text-blue-500">{score.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase text-xs">Status</span>
                      <span className={`text-xl font-black ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                        {gameState === 'won' ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartGame(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-colors"
                  >
                    {gameState === 'won' && level < 50 ? 'NEXT LEVEL' : 'PLAY AGAIN'}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
