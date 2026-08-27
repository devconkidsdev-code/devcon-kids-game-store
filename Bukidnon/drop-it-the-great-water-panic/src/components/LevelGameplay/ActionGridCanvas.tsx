import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import { BloopAvatar } from '../BloopAvatar';
import { soundManager } from '../../utils/audio';

interface ActionGridCanvasProps {
  levelId: number;
  objectiveText: string;
  targetWaterSaved: number;
  onSuccess: (stats: { waterSaved: number; leaksFixed: number; dropsCollected: number }) => void;
  onFail: (reason: string) => void;
  equippedCosmetics?: {
    hat?: string;
    backpack?: string;
    outfit?: string;
    accessory?: string;
  };
}

interface GridItem {
  id: string;
  x: number;
  y: number;
  type: 'faucet_leaking' | 'faucet_fixed' | 'water_drop' | 'drippy' | 'puddle' | 'animal_thirsty' | 'sprinkler_wild';
  progress?: number; // 0 to 100
}

export const ActionGridCanvas: React.FC<ActionGridCanvasProps> = ({
  levelId,
  objectiveText,
  targetWaterSaved,
  onSuccess,
  onFail,
  equippedCosmetics,
}) => {
  const [bloopPos, setBloopPos] = useState({ x: 4, y: 4 });
  const [items, setItems] = useState<GridItem[]>([]);
  const [waterSaved, setWaterSaved] = useState(0);
  const [leaksFixed, setLeaksFixed] = useState(0);
  const [dropsCollected, setDropsCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [bloopExpression, setBloopExpression] = useState<'happy' | 'worried' | 'proud' | 'mischievous'>('happy');

  const GRID_SIZE = 8;

  // Initialize level spawns
  useEffect(() => {
    const initialItems: GridItem[] = [];
    const numLeaks = Math.min(6, 2 + Math.floor(levelId / 12));
    const numDrops = 4 + Math.floor(levelId / 15);
    const numDrippies = levelId > 15 ? Math.min(3, 1 + Math.floor(levelId / 30)) : 0;

    const usedCoords = new Set(['4,4']);

    const getRandomCoord = () => {
      let x = 0, y = 0, key = '';
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
        key = `${x},${y}`;
      } while (usedCoords.has(key));
      usedCoords.add(key);
      return { x, y };
    };

    for (let i = 0; i < numLeaks; i++) {
      const { x, y } = getRandomCoord();
      initialItems.push({ id: `leak-${i}`, x, y, type: 'faucet_leaking', progress: 0 });
    }

    for (let i = 0; i < numDrops; i++) {
      const { x, y } = getRandomCoord();
      initialItems.push({ id: `drop-${i}`, x, y, type: 'water_drop' });
    }

    for (let i = 0; i < numDrippies; i++) {
      const { x, y } = getRandomCoord();
      initialItems.push({ id: `drippy-${i}`, x, y, type: 'drippy' });
    }

    if (levelId % 4 === 0) {
      const { x, y } = getRandomCoord();
      initialItems.push({ id: `sprinkler-0`, x, y, type: 'sprinkler_wild' });
    }

    setItems(initialItems);
    setWaterSaved(0);
    setLeaksFixed(0);
    setDropsCollected(0);
    setTimeLeft(45);
  }, [levelId]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Check success condition
          if (waterSaved >= targetWaterSaved * 0.7 || leaksFixed >= 2) {
            onSuccess({ waterSaved, leaksFixed, dropsCollected });
          } else {
            onFail('Time ran out before enough water was saved!');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [waterSaved, leaksFixed, dropsCollected, targetWaterSaved, onSuccess, onFail]);

  // Handle Movement
  const moveBloop = (dx: number, dy: number) => {
    setBloopPos((prev) => {
      const nextX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx));
      const nextY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy));
      return { x: nextX, y: nextY };
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        moveBloop(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        moveBloop(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        moveBloop(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        moveBloop(1, 0);
      } else if (['Space', 'KeyE', 'Enter'].includes(e.code)) {
        e.preventDefault();
        handleInteract();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bloopPos, items]);

  // Interaction check when Bloop steps onto or acts on an item
  useEffect(() => {
    // Check if stepped on a water drop
    const dropItem = items.find((it) => it.x === bloopPos.x && it.y === bloopPos.y && it.type === 'water_drop');
    if (dropItem) {
      soundManager.playDrop();
      setDropsCollected((c) => c + 1);
      setWaterSaved((w) => {
        const nextW = w + 35;
        if (nextW >= targetWaterSaved) {
          setTimeout(() => onSuccess({ waterSaved: nextW, leaksFixed, dropsCollected: dropsCollected + 1 }), 300);
        }
        return nextW;
      });
      setItems((prev) => prev.filter((it) => it.id !== dropItem.id));
      setActiveAction('+35L Droplet Caught!');
      setTimeout(() => setActiveAction(null), 1200);
    }
  }, [bloopPos, items]);

  const handleInteract = () => {
    // Find adjacent or same cell interactable
    const target = items.find(
      (it) => Math.abs(it.x - bloopPos.x) <= 1 && Math.abs(it.y - bloopPos.y) <= 1 && it.type !== 'water_drop'
    );

    if (!target) return;

    if (target.type === 'faucet_leaking') {
      soundManager.playRepair();
      setLeaksFixed((f) => f + 1);
      setWaterSaved((w) => {
        const nextW = w + 80;
        if (nextW >= targetWaterSaved) {
          setTimeout(() => onSuccess({ waterSaved: nextW, leaksFixed: leaksFixed + 1, dropsCollected }), 300);
        }
        return nextW;
      });
      setItems((prev) =>
        prev.map((it) => (it.id === target.id ? { ...it, type: 'faucet_fixed' } : it))
      );
      setBloopExpression('proud');
      setActiveAction('🔧 Faucet Tightened!');
      setTimeout(() => {
        setActiveAction(null);
        setBloopExpression('happy');
      }, 1500);
    } else if (target.type === 'drippy') {
      soundManager.playPop();
      setWaterSaved((w) => w + 60);
      setItems((prev) => prev.filter((it) => it.id !== target.id));
      setActiveAction('🫧 Drippy Guided to Safety!');
      setTimeout(() => setActiveAction(null), 1500);
    } else if (target.type === 'sprinkler_wild') {
      soundManager.playSplash();
      setWaterSaved((w) => w + 120);
      setItems((prev) => prev.filter((it) => it.id !== target.id));
      setActiveAction('🌾 Sprinkler Calmed & Drip Mode Activated!');
      setTimeout(() => setActiveAction(null), 1500);
    }
  };

  const remainingLeaks = items.filter((it) => it.type === 'faucet_leaking').length;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-3 sm:p-5 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Top Status & Objective */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 bg-sky-50/80 p-3 rounded-2xl border border-sky-100">
        <div>
          <span className="text-[11px] uppercase font-bold text-sky-600 tracking-wider">Mission Objective</span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Water Saved</span>
            <span className="text-sm sm:text-base font-extrabold text-sky-600">
              {waterSaved} / {targetWaterSaved} L
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Time Left</span>
            <span className={`text-sm sm:text-base font-extrabold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {activeAction && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 px-4 py-1.5 bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          {activeAction}
        </motion.div>
      )}

      {/* 2D Interactive Grid Map */}
      <div className="relative w-full aspect-square max-w-[420px] bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-4 border-emerald-200/80 shadow-inner overflow-hidden grid grid-cols-8 grid-rows-8 gap-0.5 p-1">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);
          const isBloopHere = bloopPos.x === x && bloopPos.y === y;
          const itemHere = items.find((it) => it.x === x && it.y === y);

          return (
            <div
              key={idx}
              onClick={() => {
                // Click to move or interact
                setBloopPos({ x, y });
              }}
              className="relative flex items-center justify-center rounded-lg bg-white/40 hover:bg-sky-100/60 border border-emerald-100/40 cursor-pointer transition-colors"
            >
              {/* Tile Items */}
              {itemHere?.type === 'faucet_leaking' && (
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xl sm:text-2xl drop-shadow-sm">🚰</span>
                  <span className="absolute -top-1 right-0 text-[10px] animate-bounce">💦</span>
                </motion.div>
              )}

              {itemHere?.type === 'faucet_fixed' && (
                <div className="flex flex-col items-center opacity-70">
                  <span className="text-xl sm:text-2xl">🚰</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 absolute -top-1 -right-1" />
                </div>
              )}

              {itemHere?.type === 'water_drop' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-lg sm:text-xl drop-shadow-sm"
                >
                  💧
                </motion.div>
              )}

              {itemHere?.type === 'drippy' && (
                <motion.div
                  animate={{ rotate: [-8, 8, -8], scale: [0.9, 1.1, 0.9] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-lg sm:text-xl"
                  title="Cute Drippy"
                >
                  👾
                </motion.div>
              )}

              {itemHere?.type === 'sprinkler_wild' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="text-xl sm:text-2xl"
                >
                  🚿
                </motion.div>
              )}

              {/* Bloop Player Character */}
              {isBloopHere && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <BloopAvatar
                    expression={bloopExpression}
                    size={38}
                    hat={equippedCosmetics?.hat}
                    backpack={equippedCosmetics?.backpack}
                    outfit={equippedCosmetics?.outfit}
                    accessory={equippedCosmetics?.accessory}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* On-Screen Mobile Controls & Action Button */}
      <div className="mt-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Helper Hint */}
        <div className="text-xs text-slate-500 text-center sm:text-left">
          <p className="font-semibold text-slate-700">Controls:</p>
          <p>Keyboard: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">WASD</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">Arrows</kbd> to move, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">Space</kbd> to fix leaks!</p>
          <p>Or tap tiles / use D-pad below.</p>
        </div>

        {/* D-Pad & Action Button */}
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 gap-1 w-32 h-24">
            <div />
            <button
              onClick={() => moveBloop(0, -1)}
              className="p-2 rounded-xl bg-slate-100 active:bg-sky-200 border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowUp className="w-4 h-4 text-slate-700" />
            </button>
            <div />
            <button
              onClick={() => moveBloop(-1, 0)}
              className="p-2 rounded-xl bg-slate-100 active:bg-sky-200 border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={() => moveBloop(0, 1)}
              className="p-2 rounded-xl bg-slate-100 active:bg-sky-200 border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowDown className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={() => moveBloop(1, 0)}
              className="p-2 rounded-xl bg-slate-100 active:bg-sky-200 border border-slate-200 flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          {/* Big Action Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleInteract}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold text-sm shadow-md flex items-center gap-2 border-2 border-sky-400 cursor-pointer"
          >
            <Wrench className="w-5 h-5" />
            <span>Fix / Save!</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
