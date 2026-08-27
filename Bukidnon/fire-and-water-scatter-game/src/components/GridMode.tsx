import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Flame, Droplets, RotateCcw, Zap, RefreshCw, Award, Info } from 'lucide-react';
import { GridSymbol } from '../types';
import { sound } from '../utils/sound';

interface GridModeProps {
  onUpdateStats: (wins: number, tsunamis: number, creditsWon: number) => void;
  highScore: number;
}

const ROWS = 6;
const COLS = 6;

const SYMBOL_TYPES = [
  { type: 'water_diamond', name: 'Water Diamond 💎', baseVal: 15, isScatter: true, color: 'text-sky-800 border-2 border-sky-400 bg-sky-100 shadow-[2px_2px_0px_0px_#7dd3fc]' },
  { type: 'water_drop', name: 'Aqua Droplet 💧', baseVal: 5, color: 'text-cyan-800 border-2 border-cyan-400 bg-cyan-100 shadow-[2px_2px_0px_0px_#67e8f9]' },
  { type: 'water_shell', name: 'Ocean Pearl 🐚', baseVal: 8, color: 'text-teal-800 border-2 border-teal-400 bg-teal-100 shadow-[2px_2px_0px_0px_#5eead4]' },
  { type: 'steam_crystal', name: 'Steam Crystal 💠', baseVal: 10, color: 'text-indigo-800 border-2 border-indigo-400 bg-indigo-100 shadow-[2px_2px_0px_0px_#a5b4fc]' },
  { type: 'fire_spark', name: 'Fire Spark 🔥', baseVal: 6, color: 'text-amber-800 border-2 border-amber-400 bg-amber-100 shadow-[2px_2px_0px_0px_#fde68a]' },
] as const;

export const GridMode: React.FC<GridModeProps> = ({ onUpdateStats, highScore }) => {
  const [grid, setGrid] = useState<GridSymbol[][]>([]);
  const [balance, setBalance] = useState<number>(1000);
  const [bet, setBet] = useState<number>(20);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [totalWin, setTotalWin] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number>(0);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [turbo, setTurbo] = useState<boolean>(false);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [tumbleStep, setTumbleStep] = useState<number>(0);

  const isAutoSpinRef = useRef(isAutoSpin);
  isAutoSpinRef.current = isAutoSpin;
  const isSpinningRef = useRef(isSpinning);
  isSpinningRef.current = isSpinning;

  // Initialize random grid
  const generateRandomSymbol = (isBonus = false): GridSymbol => {
    const rand = Math.random();
    // Fire Bomb Multiplier spawn chance
    if (rand < (isBonus ? 0.12 : 0.06)) {
      const mults = [2, 3, 5, 10, 25, 50, 100];
      const mult = mults[Math.floor(Math.random() * (isBonus ? mults.length : 4))];
      return {
        id: Math.random().toString(),
        type: 'fire_bomb',
        value: 0,
        multiplier: mult,
      };
    }

    // Water Diamond (Scatter)
    if (rand < 0.28) {
      return {
        id: Math.random().toString(),
        type: 'water_diamond',
        value: 20,
      };
    }

    const regularSymbols = SYMBOL_TYPES.filter(s => s.type !== 'water_diamond');
    const picked = regularSymbols[Math.floor(Math.random() * regularSymbols.length)];
    return {
      id: Math.random().toString(),
      type: picked.type,
      value: picked.baseVal,
    };
  };

  const createInitialGrid = () => {
    const newGrid: GridSymbol[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: GridSymbol[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push(generateRandomSymbol());
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  useEffect(() => {
    setGrid(createInitialGrid());
  }, []);

  // Spin & Tumble Engine
  const handleSpin = async (customBet?: number, isFreeSpin = false) => {
    const currentBet = customBet ?? bet;

    if (!isFreeSpin && balance < currentBet) {
      sound.playClick();
      setWinMessage('Insufficient credits! Click Refill to reload.');
      return;
    }

    if (isSpinningRef.current) return;
    setIsSpinning(true);
    setWinMessage(null);
    setLastWin(0);
    setTumbleStep(0);

    if (!isFreeSpin) {
      setBalance(b => b - currentBet);
      setActiveMultiplier(1);
    }

    sound.playClick();

    // 1. Drop in new grid
    const delayTime = turbo ? 80 : 180;
    const initialDrop = createInitialGrid();
    setGrid(initialDrop);
    sound.playCascadePop(1);

    await new Promise(r => setTimeout(r, delayTime * 2));

    // 2. Cascade / Tumble loop
    let currentGrid = initialDrop;
    let accumulatedWin = 0;
    let roundMultiplier = isFreeSpin ? activeMultiplier : 1;
    let cascadeCount = 0;
    let scatterDiamondsCount = 0;

    while (true) {
      // Find all matching symbols (Scatter Pay: 8+ matching of any regular symbol, or 4+ Water Diamonds)
      const countMap: Record<string, { count: number; coords: [number, number][] }> = {};
      let fireBombs: { r: number; c: number; mult: number }[] = [];

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const sym = currentGrid[r][c];
          if (sym.type === 'fire_bomb' && sym.multiplier) {
            fireBombs.push({ r, c, mult: sym.multiplier });
          } else {
            if (!countMap[sym.type]) {
              countMap[sym.type] = { count: 0, coords: [] };
            }
            countMap[sym.type].count++;
            countMap[sym.type].coords.push([r, c]);
          }
        }
      }

      // Check winning combinations
      let winInThisCascade = 0;
      const winningCoords = new Set<string>();

      // Water Diamond Scatter wins (4+ triggers scatter pay, 4+ also triggers Free Spins)
      if (countMap['water_diamond'] && countMap['water_diamond'].count >= 4) {
        scatterDiamondsCount = Math.max(scatterDiamondsCount, countMap['water_diamond'].count);
        const pts = countMap['water_diamond'].count * 40 * (currentBet / 10);
        winInThisCascade += pts;
        countMap['water_diamond'].coords.forEach(([r, c]) => winningCoords.add(`${r},${c}`));
      }

      // Regular symbol clusters (8+ matching anywhere on board)
      for (const [type, data] of Object.entries(countMap)) {
        if (type !== 'water_diamond' && data.count >= 8) {
          const symDef = SYMBOL_TYPES.find(s => s.type === type);
          const baseVal = symDef ? symDef.baseVal : 5;
          const pts = data.count * baseVal * (currentBet / 10);
          winInThisCascade += pts;
          data.coords.forEach(([r, c]) => winningCoords.add(`${r},${c}`));
        }
      }

      // If no wins, break cascade loop
      if (winInThisCascade === 0) {
        break;
      }

      cascadeCount++;
      setTumbleStep(cascadeCount);
      sound.playDiamondChime(1 + cascadeCount * 0.2);

      // Check Fire Bomb Multipliers on board
      if (fireBombs.length > 0) {
        sound.playBombExplosion();
        let fireMultiplierSum = 0;
        fireBombs.forEach(b => {
          fireMultiplierSum += b.mult;
        });
        roundMultiplier += fireMultiplierSum;
        setActiveMultiplier(roundMultiplier);
      }

      accumulatedWin += winInThisCascade;

      // Highlight winning tiles
      const highlightedGrid = currentGrid.map((row, r) =>
        row.map((sym, c) => ({
          ...sym,
          highlight: winningCoords.has(`${r},${c}`),
        }))
      );
      setGrid(highlightedGrid);
      await new Promise(r => setTimeout(r, delayTime * 2));

      // Remove winning tiles and tumble down
      const nextGrid: GridSymbol[][] = [];
      for (let r = 0; r < ROWS; r++) {
        nextGrid.push(new Array(COLS));
      }

      for (let c = 0; c < COLS; c++) {
        const surviving: GridSymbol[] = [];
        for (let r = ROWS - 1; r >= 0; r--) {
          if (!winningCoords.has(`${r},${c}`)) {
            surviving.push(currentGrid[r][c]);
          }
        }
        // Fill remaining top with new falling symbols
        while (surviving.length < ROWS) {
          surviving.push(generateRandomSymbol(isFreeSpin));
        }
        // Place into nextGrid
        for (let r = ROWS - 1; r >= 0; r--) {
          nextGrid[r][c] = surviving[ROWS - 1 - r];
        }
      }

      currentGrid = nextGrid;
      setGrid(currentGrid);
      sound.playCascadePop(1.2);
      await new Promise(r => setTimeout(r, delayTime * 2.5));
    }

    // Apply Round Multipliers (Fire Multiplier x Water Win)
    const finalPayout = Math.floor(accumulatedWin * roundMultiplier);
    if (finalPayout > 0) {
      setTotalWin(tw => tw + finalPayout);
      setLastWin(finalPayout);
      setBalance(b => b + finalPayout);
      onUpdateStats(1, cascadeCount, finalPayout);

      if (finalPayout > currentBet * 10) {
        sound.playWinFanfare();
        setWinMessage(`🌊 TSUNAMI SCATTER WIN! +${finalPayout.toLocaleString()} Credits (${roundMultiplier}x Fire Multiplier)`);
      } else {
        setWinMessage(`Cascade Win: +${finalPayout.toLocaleString()} Credits`);
      }
    }

    // Trigger Free Spins if 4+ Water Diamonds landed
    if (scatterDiamondsCount >= 4 && freeSpinsLeft === 0) {
      sound.playWinFanfare();
      setFreeSpinsLeft(10);
      setWinMessage(`💎 ${scatterDiamondsCount} SCATTER DIAMONDS! 10 FREE HYDRO SPINS AWARDED!`);
    } else if (isFreeSpin) {
      setFreeSpinsLeft(fs => fs - 1);
    }

    setIsSpinning(false);

    // Auto-spin continuation
    if ((isAutoSpinRef.current || (isFreeSpin && freeSpinsLeft > 1)) && balance >= currentBet) {
      setTimeout(() => {
        handleSpin(currentBet, isFreeSpin && freeSpinsLeft > 1);
      }, turbo ? 300 : 700);
    }
  };

  const buyFreeSpins = () => {
    const cost = bet * 75;
    if (balance < cost) {
      setWinMessage('Not enough credits to buy Free Spins!');
      return;
    }
    setBalance(b => b - cost);
    setFreeSpinsLeft(10);
    setActiveMultiplier(1);
    sound.playWinFanfare();
    setWinMessage('🌊 HYDRO FREE SPINS UNLOCKED! Persistent Fire Multipliers Active!');
  };

  const refillCredits = () => {
    sound.playDiamondChime(1.5);
    setBalance(b => b + 1000);
    setWinMessage('Refilled +1,000 Credits!');
  };

  return (
    <div id="cascade-grid-container" className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top Header & Multiplier Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {/* Credits Balance */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Credits</span>
            <button
              onClick={refillCredits}
              className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 transition-colors cursor-pointer"
            >
              + Refill
            </button>
          </div>
          <span className="text-2xl font-black text-sky-600 mt-1">{balance.toLocaleString()}</span>
        </div>

        {/* Active Fire Multiplier */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Fire Multiplier</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Flame className={`w-5 h-5 ${activeMultiplier > 1 ? 'text-orange-500 animate-bounce' : 'text-slate-400'}`} />
            <span className={`text-2xl font-black ${activeMultiplier > 1 ? 'text-orange-500' : 'text-slate-500'}`}>
              {activeMultiplier}x
            </span>
          </div>
        </div>

        {/* Last Win */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Last Cascade Win</span>
          <span className={`text-2xl font-black mt-1 ${lastWin > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
            {lastWin > 0 ? `+${lastWin.toLocaleString()}` : '0'}
          </span>
        </div>

        {/* Free Spins Feature */}
        <div className={`border-3 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between transition-all ${
          freeSpinsLeft > 0 ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-300' : 'bg-white border-amber-300'
        }`}>
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Hydro Free Spins</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-sky-700">{freeSpinsLeft}</span>
            {freeSpinsLeft === 0 && (
              <button
                onClick={buyFreeSpins}
                className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[2px_2px_0px_0px_#c2410c] hover:opacity-90 transition-opacity cursor-pointer"
              >
                Buy ({bet * 75})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Win Banner / Message */}
      {winMessage && (
        <div className="w-full mb-3 p-3 bg-white border-3 border-orange-400 rounded-2xl text-center text-xs sm:text-sm font-black text-orange-600 shadow-[4px_4px_0px_0px_#fed7aa] animate-in fade-in">
          {winMessage}
        </div>
      )}

      {/* Main Cascade Grid Board */}
      <div className="relative w-full aspect-square max-w-[540px] p-3.5 rounded-3xl bg-amber-100 border-4 border-amber-400 shadow-[8px_8px_0px_0px_#fde68a] overflow-hidden flex flex-col items-center justify-center">
        {/* Ambient Element Glows */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-6 grid-rows-6 gap-2 w-full h-full">
          {grid.map((row, r) =>
            row.map((sym, c) => (
              <div
                key={sym.id || `${r}-${c}`}
                className={`relative rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 select-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] ${
                  sym.type === 'fire_bomb'
                    ? 'bg-gradient-to-b from-orange-100 to-red-100 border-red-500 shadow-[3px_3px_0px_0px_#fca5a5] text-red-700 animate-pulse'
                    : sym.type === 'water_diamond'
                    ? 'bg-gradient-to-b from-sky-100 to-blue-100 border-sky-500 shadow-[3px_3px_0px_0px_#7dd3fc] text-sky-800'
                    : SYMBOL_TYPES.find(s => s.type === sym.type)?.color || 'bg-white border-amber-200 text-slate-700'
                } ${
                  sym.highlight
                    ? 'scale-105 ring-4 ring-orange-400 bg-amber-200 z-10 brightness-110 animate-bounce shadow-lg'
                    : 'hover:border-amber-400'
                }`}
              >
                {/* Symbol Graphic */}
                {sym.type === 'fire_bomb' ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl drop-shadow-sm">💣</span>
                    <span className="text-[10px] sm:text-xs font-black text-white bg-red-500 px-1.5 py-0.2 rounded-md border border-red-600 shadow-[1px_1px_0px_0px_#991b1b]">
                      {sym.multiplier}x
                    </span>
                  </div>
                ) : sym.type === 'water_diamond' ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xl sm:text-2xl drop-shadow-sm animate-pulse">💎</span>
                    <span className="text-[9px] font-black text-sky-700">SCATTER</span>
                  </div>
                ) : sym.type === 'water_drop' ? (
                  <span className="text-xl sm:text-2xl">💧</span>
                ) : sym.type === 'water_shell' ? (
                  <span className="text-xl sm:text-2xl">🐚</span>
                ) : sym.type === 'steam_crystal' ? (
                  <span className="text-xl sm:text-2xl">💠</span>
                ) : (
                  <span className="text-xl sm:text-2xl">🔥</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Control Panel: Bet, Spin, Turbo, Auto */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-3 bg-amber-100/95 p-3.5 rounded-3xl border-3 border-amber-300 shadow-[4px_4px_0px_0px_#fde68a]">
        {/* Bet Adjustment */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-900/80">BET:</span>
          {[10, 20, 50, 100].map(b => (
            <button
              key={b}
              disabled={isSpinning}
              onClick={() => {
                sound.playClick();
                setBet(b);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                bet === b
                  ? 'bg-sky-500 text-white shadow-[2px_2px_0px_0px_#0284c7] border border-sky-600'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Toggles: Turbo & Auto */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setTurbo(!turbo);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              turbo
                ? 'bg-amber-400 text-amber-950 font-black border border-amber-500 shadow-[2px_2px_0px_0px_#d97706]'
                : 'bg-white text-slate-700 border border-amber-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Turbo
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsAutoSpin(!isAutoSpin);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
              isAutoSpin
                ? 'bg-cyan-500 text-white font-black border border-cyan-600 shadow-[2px_2px_0px_0px_#0891b2]'
                : 'bg-white text-slate-700 border border-amber-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
            Auto
          </button>
        </div>

        {/* Main Spin Button */}
        <button
          id="btn-spin-grid"
          disabled={isSpinning}
          onClick={() => handleSpin()}
          className={`px-8 py-3 rounded-2xl font-black text-sm tracking-wide transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ${
            isSpinning
              ? 'bg-amber-200 text-amber-800/40 border border-amber-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 hover:opacity-95 text-white shadow-[4px_4px_0px_0px_#c2410c] border-2 border-orange-600'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          {freeSpinsLeft > 0 ? `FREE SPIN (${freeSpinsLeft})` : 'SPIN SCATTERS'}
        </button>
      </div>

      {/* Rules Footer */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-amber-900/70 mt-2.5 px-1">
        <span>💎 4+ Water Diamonds anywhere trigger 10 Free Spins</span>
        <span>💣 Fire Bombs multiply all cascade wins by 2x-100x</span>
      </div>
    </div>
  );
};
