import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCw, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface PipePuzzleViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; leaksFixed: number }) => void;
  onFail: (reason: string) => void;
}

type PipeType = 'straight' | 'elbow' | 'tee' | 'cross';

interface PipeTile {
  id: string;
  type: PipeType;
  rotation: number; // 0, 90, 180, 270
  targetRotation: number; // solved state
  isWaterFilled: boolean;
}

export const PipePuzzleView: React.FC<PipePuzzleViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const GRID_ROWS = 3;
  const GRID_COLS = 3;

  const [grid, setGrid] = useState<PipeTile[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  // Initialize a randomized solvable pipe network
  useEffect(() => {
    const defaultTiles: { type: PipeType; solvedRot: number }[] = [
      { type: 'elbow', solvedRot: 0 },   // (0,0) Start from top-left -> down/right
      { type: 'straight', solvedRot: 90 }, // (0,1)
      { type: 'elbow', solvedRot: 90 },  // (0,2)
      { type: 'straight', solvedRot: 0 },  // (1,0)
      { type: 'tee', solvedRot: 180 },    // (1,1)
      { type: 'straight', solvedRot: 0 },  // (1,2)
      { type: 'elbow', solvedRot: 270 }, // (2,0)
      { type: 'straight', solvedRot: 90 }, // (2,1)
      { type: 'elbow', solvedRot: 180 }, // (2,2) Exit to basin
    ];

    const randomized: PipeTile[] = defaultTiles.map((t, idx) => {
      // Scramble rotation randomly
      const randomRot = Math.floor(Math.random() * 4) * 90;
      return {
        id: `tile-${idx}`,
        type: t.type,
        rotation: (t.solvedRot + (randomRot === 0 ? 90 : randomRot)) % 360,
        targetRotation: t.solvedRot,
        isWaterFilled: false,
      };
    });

    setGrid(randomized);
    setIsSolved(false);
    setMovesCount(0);
  }, [levelId]);

  // Check connection status whenever grid updates
  useEffect(() => {
    if (grid.length === 0) return;

    // Check if the solution criteria is met
    const solved = grid.every((tile) => {
      if (tile.type === 'cross') return true;
      if (tile.type === 'straight') {
        return (tile.rotation % 180) === (tile.targetRotation % 180);
      }
      return tile.rotation === tile.targetRotation;
    });

    if (solved && !isSolved) {
      setIsSolved(true);
      soundManager.playVictory();
      // Animate water filling tiles
      setGrid((prev) => prev.map((t) => ({ ...t, isWaterFilled: true })));
      setTimeout(() => {
        onSuccess({ waterSaved: 350 + levelId * 15, leaksFixed: 4 });
      }, 1500);
    }
  }, [grid, isSolved, levelId, onSuccess]);

  const rotateTile = (index: number) => {
    if (isSolved) return;
    soundManager.playPop();
    setMovesCount((m) => m + 1);

    setGrid((prev) =>
      prev.map((tile, idx) => {
        if (idx !== index) return tile;
        return {
          ...tile,
          rotation: (tile.rotation + 90) % 360,
        };
      })
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Objective header */}
      <div className="w-full flex items-center justify-between mb-4 bg-sky-50 p-3.5 rounded-2xl border border-sky-100">
        <div>
          <span className="text-[11px] uppercase font-bold text-sky-600 tracking-wider">Pipe Alignment Mission</span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Moves</span>
            <span className="text-sm font-extrabold text-sky-600">{movesCount}</span>
          </div>
        </div>
      </div>

      {/* Main Pipe Puzzle Board */}
      <div className="relative p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl border-4 border-slate-700 max-w-[360px] w-full">
        {/* Top-Left Source Indicator (Big Blue Tank) */}
        <div className="absolute -top-4 -left-4 bg-sky-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white z-20">
          <span>💧 Tank In</span>
        </div>

        {/* Bottom-Right Destination Indicator (Village Basin) */}
        <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white z-20">
          <span>🚰 Village Tap</span>
        </div>

        {/* 3x3 Pipe Grid */}
        <div className="grid grid-cols-3 gap-2 w-full aspect-square">
          {grid.map((tile, idx) => {
            const isMatch =
              tile.type === 'straight'
                ? tile.rotation % 180 === tile.targetRotation % 180
                : tile.rotation === tile.targetRotation;

            return (
              <motion.button
                key={tile.id}
                onClick={() => rotateTile(idx)}
                whileTap={{ scale: 0.94 }}
                className={`relative flex items-center justify-center rounded-2xl bg-slate-700/80 hover:bg-slate-600 border-2 transition-all cursor-pointer overflow-hidden p-2 ${
                  isSolved
                    ? 'border-sky-400 shadow-lg shadow-sky-500/20'
                    : isMatch
                    ? 'border-sky-500/50'
                    : 'border-slate-600'
                }`}
              >
                {/* Rotating Pipe SVG */}
                <motion.div
                  animate={{ rotate: tile.rotation }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Pipe background conduit */}
                    {tile.type === 'straight' && (
                      <g>
                        <rect x="36" y="0" width="28" height="100" fill="#475569" rx="4" />
                        <rect
                          x="40"
                          y="0"
                          width="20"
                          height="100"
                          fill={tile.isWaterFilled ? '#38bdf8' : '#64748b'}
                          className={tile.isWaterFilled ? 'animate-pulse' : ''}
                        />
                      </g>
                    )}

                    {tile.type === 'elbow' && (
                      <g>
                        <path
                          d="M 36 0 L 64 0 L 64 36 L 100 36 L 100 64 L 36 64 Z"
                          fill="#475569"
                        />
                        <path
                          d="M 40 0 L 60 0 L 60 40 L 100 40 L 100 60 L 40 60 Z"
                          fill={tile.isWaterFilled ? '#38bdf8' : '#64748b'}
                          className={tile.isWaterFilled ? 'animate-pulse' : ''}
                        />
                      </g>
                    )}

                    {tile.type === 'tee' && (
                      <g>
                        <path
                          d="M 36 0 L 64 0 L 64 36 L 100 36 L 100 64 L 64 64 L 64 100 L 36 100 Z"
                          fill="#475569"
                        />
                        <path
                          d="M 40 0 L 60 0 L 60 40 L 100 40 L 100 60 L 60 60 L 60 100 L 40 100 Z"
                          fill={tile.isWaterFilled ? '#38bdf8' : '#64748b'}
                          className={tile.isWaterFilled ? 'animate-pulse' : ''}
                        />
                      </g>
                    )}
                  </svg>
                </motion.div>

                {/* Subtle Rotate indicator */}
                <span className="absolute bottom-1 right-1 opacity-40 text-slate-400">
                  <RotateCw className="w-3 h-3" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Success / Status Message */}
      <div className="mt-5 text-center">
        {isSolved ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm sm:text-base bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Water Flowing Clean & Leak-Free! Victory!</span>
          </motion.div>
        ) : (
          <p className="text-xs text-slate-500">
            Tap or click any pipe to rotate 90°. Connect Tank In to Village Tap!
          </p>
        )}
      </div>
    </div>
  );
};
