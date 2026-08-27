import React, { useState } from 'react';
import { Flame, Droplets, Shield, RotateCcw, Award, Play, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/sound';

interface MinesModeProps {
  onUpdateStats: (diamondsFound: number, bombsHit: number, profit: number) => void;
  highScore: number;
}

interface TileState {
  isRevealed: boolean;
  isBomb: boolean;
  multiplier: number;
}

export const MinesMode: React.FC<MinesModeProps> = ({ onUpdateStats, highScore }) => {
  const [bombCount, setBombCount] = useState<number>(3);
  const [bet, setBet] = useState<number>(20);
  const [balance, setBalance] = useState<number>(1000);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [diamondsFound, setDiamondsFound] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [gameMessage, setGameMessage] = useState<string>('Select Fire Bombs count and place bet to start.');

  const TOTAL_TILES = 25;

  const calculateNextMultiplier = (foundCount: number, bombs: number) => {
    // Fair probabilistic multiplier formula with small house edge
    let mult = 1.0;
    for (let i = 0; i <= foundCount; i++) {
      const remainingTiles = TOTAL_TILES - i;
      const remainingDiamonds = TOTAL_TILES - bombs - i;
      if (remainingDiamonds <= 0) break;
      mult *= (remainingTiles / remainingDiamonds) * 0.98;
    }
    return Math.max(1.05, Math.round(mult * 100) / 100);
  };

  const startGame = () => {
    if (balance < bet) {
      setGameMessage('Insufficient credits! Refill first.');
      return;
    }

    sound.playClick();
    setBalance(b => b - bet);
    setIsPlaying(true);
    setGameOver(false);
    setCashedOut(false);
    setDiamondsFound(0);
    setCurrentMultiplier(1.0);
    setGameMessage('Uncover Water Diamonds 💎 and avoid Fire Bombs 💣!');

    // Generate board
    const newTiles: TileState[] = Array(TOTAL_TILES).fill(null).map(() => ({
      isRevealed: false,
      isBomb: false,
      multiplier: 1.0,
    }));

    // Place random fire bombs
    let placed = 0;
    while (placed < bombCount) {
      const idx = Math.floor(Math.random() * TOTAL_TILES);
      if (!newTiles[idx].isBomb) {
        newTiles[idx].isBomb = true;
        placed++;
      }
    }

    setTiles(newTiles);
  };

  const revealTile = (idx: number) => {
    if (!isPlaying || gameOver || cashedOut || tiles[idx].isRevealed) return;

    const newTiles = [...tiles];
    newTiles[idx].isRevealed = true;

    if (newTiles[idx].isBomb) {
      // Hit Fire Bomb!
      sound.playBombExplosion();
      setGameOver(true);
      setIsPlaying(false);
      setGameMessage('💥 BOOM! You triggered a Fire Bomb! Stake lost.');

      // Reveal all tiles
      newTiles.forEach(t => { t.isRevealed = true; });
      setTiles(newTiles);
      onUpdateStats(diamondsFound, 1, -bet);
    } else {
      // Found Water Diamond!
      const nextFound = diamondsFound + 1;
      setDiamondsFound(nextFound);
      const nextMult = calculateNextMultiplier(nextFound, bombCount);
      setCurrentMultiplier(nextMult);
      sound.playDiamondChime(1 + nextFound * 0.15);
      sound.playSplash();

      setTiles(newTiles);
      setGameMessage(`💎 Water Diamond found! Multiplier: ${nextMult}x`);

      // Check if all diamonds found
      if (nextFound === TOTAL_TILES - bombCount) {
        cashOut(nextMult);
      }
    }
  };

  const cashOut = (forcedMult?: number) => {
    if (!isPlaying || gameOver || cashedOut) return;
    const finalMult = forcedMult ?? currentMultiplier;
    const winAmount = Math.floor(bet * finalMult);

    sound.playWinFanfare();
    setBalance(b => b + winAmount);
    setCashedOut(true);
    setIsPlaying(false);
    setGameMessage(`🌊 CASHED OUT! You won +${winAmount.toLocaleString()} Credits (${finalMult}x)!`);

    // Reveal all
    const newTiles = tiles.map(t => ({ ...t, isRevealed: true }));
    setTiles(newTiles);
    onUpdateStats(diamondsFound, 0, winAmount - bet);
  };

  return (
    <div id="mines-mode-container" className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* HUD Info */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Credits</span>
          <span className="text-2xl font-black text-sky-600 mt-1">{balance.toLocaleString()}</span>
        </div>

        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Fire Bombs Hidden</span>
          <span className="text-2xl font-black text-orange-500 mt-1">{bombCount} / 25</span>
        </div>

        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Water Gems Found</span>
          <span className="text-2xl font-black text-cyan-600 mt-1">{diamondsFound}</span>
        </div>

        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Current Payout</span>
          <span className={`text-2xl font-black mt-1 ${diamondsFound > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`}>
            {diamondsFound > 0 ? `${Math.floor(bet * currentMultiplier)} (${currentMultiplier}x)` : '0'}
          </span>
        </div>
      </div>

      {/* Message Banner */}
      <div className="w-full mb-3 p-3 bg-white border-3 border-amber-300 rounded-2xl text-center text-xs sm:text-sm font-black text-amber-900 shadow-[4px_4px_0px_0px_#fde68a]">
        {gameMessage}
      </div>

      {/* 5x5 Mines Grid */}
      <div className="relative w-full max-w-[420px] aspect-square p-3.5 rounded-3xl bg-amber-100 border-4 border-amber-400 shadow-[8px_8px_0px_0px_#fde68a] flex flex-col items-center justify-center">
        <div className="grid grid-cols-5 grid-rows-5 gap-2 w-full h-full">
          {tiles.length === 0 ? (
            Array(25).fill(null).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-amber-200 bg-white flex items-center justify-center text-xl text-slate-400 shadow-[2px_2px_0px_0px_#fde68a]"
              >
                ?
              </div>
            ))
          ) : (
            tiles.map((tile, idx) => (
              <button
                key={idx}
                disabled={!isPlaying || tile.isRevealed}
                onClick={() => revealTile(idx)}
                className={`rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 select-none ${
                  tile.isRevealed
                    ? tile.isBomb
                      ? 'bg-red-100 border-red-500 text-2xl shadow-[3px_3px_0px_0px_#fca5a5] animate-bounce'
                      : 'bg-sky-100 border-sky-400 text-2xl shadow-[3px_3px_0px_0px_#7dd3fc]'
                    : isPlaying
                    ? 'bg-white hover:bg-amber-50 border-amber-300 hover:border-sky-400 text-amber-900 cursor-pointer active:scale-95 shadow-[2px_2px_0px_0px_#fde68a]'
                    : 'bg-white/80 border-amber-200 text-slate-400'
                }`}
              >
                {tile.isRevealed ? (
                  tile.isBomb ? '💣' : '💎'
                ) : (
                  <span className="text-xs font-black text-amber-900/60">?</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-3 bg-amber-100/95 p-3.5 rounded-3xl border-3 border-amber-300 shadow-[4px_4px_0px_0px_#fde68a]">
        {/* Select Bomb Count */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-900/80">BOMBS:</span>
          {[1, 3, 5, 8].map(count => (
            <button
              key={count}
              disabled={isPlaying}
              onClick={() => {
                sound.playClick();
                setBombCount(count);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                bombCount === count
                  ? 'bg-orange-500 text-white shadow-[2px_2px_0px_0px_#c2410c] border border-orange-600'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              {count} 🔥
            </button>
          ))}
        </div>

        {/* Bet Selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-900/80">BET:</span>
          {[10, 25, 50, 100].map(b => (
            <button
              key={b}
              disabled={isPlaying}
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

        {/* Action Button: Start or Cash Out */}
        {isPlaying && diamondsFound > 0 ? (
          <button
            onClick={() => cashOut()}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-sm shadow-[4px_4px_0px_0px_#15803d] border-2 border-green-600 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            Cash Out (+{Math.floor(bet * currentMultiplier)})
          </button>
        ) : (
          <button
            disabled={isPlaying}
            onClick={startGame}
            className={`px-6 py-2.5 rounded-2xl font-black text-sm tracking-wide transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ${
              isPlaying
                ? 'bg-amber-200 text-amber-800/40 border border-amber-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 hover:opacity-95 text-white shadow-[4px_4px_0px_0px_#c2410c] border-2 border-orange-600'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Start Mines Round
          </button>
        )}
      </div>
    </div>
  );
};
