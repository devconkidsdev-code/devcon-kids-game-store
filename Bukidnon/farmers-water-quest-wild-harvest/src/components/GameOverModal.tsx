import React from 'react';
import { GameState } from '../game/engine';
import { Skull, RotateCcw, List, ShieldAlert, Lightbulb, AlertTriangle, FastForward, ArrowRight } from 'lucide-react';

interface GameOverModalProps {
  gameState: GameState;
  onRetry: () => void;
  onOpenLevelSelect: () => void;
  onSkipLevel?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onRetry,
  onOpenLevelSelect,
  onSkipLevel,
}) => {
  const { level } = gameState;

  // Survival tips based on biome/animals
  const tips = [
    'Dense green bushes hide you completely from predators if you stay still.',
    'Timber wolves and carnivores are terrified of open flame—deploy a Flare (Q/1) when they charge!',
    'Throwing stones (F/2) makes a sound that draws beasts toward the impact point, away from springs.',
    'Mud will slow your running speed by almost half. Navigate around muddy marshes.',
    'Sprinting generates loud vibrations that alert predators. Walk or crouch (C) to remain undetected.',
  ];
  const selectedTip = tips[(level.levelNumber + 2) % tips.length];

  return (
    <div
      id="game-over-modal-backdrop"
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        id="game-over-card"
        className="bg-[#0a0f0a] border border-red-500/50 w-full max-w-md p-6 sm:p-8 text-center text-emerald-50 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden"
      >
        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

        <div className="relative z-10">
          {/* Tactical Alert Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500/50 text-[10px] uppercase font-mono tracking-[0.2em] text-red-400 font-bold mb-3">
            <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" /> BIO-SENSOR FAILURE
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white italic">
            FARMER EXPEDITION TERMINATED
          </h2>
          <p className="text-red-400/80 text-xs font-mono mt-1 uppercase">
            Vital signs depleted in {level.title}
          </p>

          {/* Survival Tip Tactical Box */}
          <div className="bg-black/80 p-4 border border-red-500/30 my-5 text-left flex items-start gap-3 font-mono">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                TACTICAL FIELD INTEL
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedTip}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="game-over-retry-btn"
                onClick={onRetry}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 skew-x-[-8deg] shadow-[0_0_15px_#ef4444] flex items-center justify-center gap-2 transition border border-red-400 uppercase tracking-widest text-xs font-mono"
              >
                <span className="skew-x-[8deg] flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Restart Sector
                </span>
              </button>

              <button
                id="game-over-levels-btn"
                onClick={onOpenLevelSelect}
                className="flex-1 bg-black/60 hover:bg-emerald-950/40 text-emerald-300 font-bold py-3 px-4 border border-emerald-500/40 flex items-center justify-center gap-2 transition tracking-wider text-xs uppercase font-mono"
              >
                <List className="w-4 h-4" /> Sector Select
              </button>
            </div>

            {onSkipLevel && (
              <button
                id="game-over-skip-btn"
                onClick={onSkipLevel}
                className="w-full bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-slate-950 font-black py-2.5 px-4 skew-x-[-8deg] shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transition border border-amber-300 uppercase tracking-widest text-xs font-mono"
              >
                <span className="skew-x-[8deg] flex items-center gap-2">
                  <FastForward className="w-4 h-4 fill-current" /> Proceed to Next Level <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
