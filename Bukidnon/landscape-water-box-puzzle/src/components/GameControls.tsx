import React from 'react';
import { GameState, LevelDefinition } from '../types';
import {
  RotateCcw,
  Undo2,
  Redo2,
  Lightbulb,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Hammer
} from 'lucide-react';

interface GameControlsProps {
  state: GameState;
  level: LevelDefinition;
  isMuted: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onMove: (dx: number, dy: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
  onOpenLevelSelect: () => void;
  onOpenInstructions: () => void;
  onOpenEditor: () => void;
  onOpenHint: () => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  hasPrevLevel: boolean;
  hasNextLevel: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  state,
  level,
  isMuted,
  canUndo,
  canRedo,
  onMove,
  onUndo,
  onRedo,
  onRestart,
  onToggleSound,
  onOpenLevelSelect,
  onOpenInstructions,
  onOpenEditor,
  onOpenHint,
  onPrevLevel,
  onNextLevel,
  hasPrevLevel,
  hasNextLevel,
}) => {
  const dewdropsCollected = state.dewdrops.filter(d => d.collected).length;
  const totalDewdrops = state.dewdrops.length;

  const plantsWatered = state.plants.filter(p => p.isWatered).length;
  const totalPlants = state.plants.length;

  return (
    <div id="game-controls-container" className="w-full max-w-2xl mx-auto flex flex-col gap-2.5 px-3">
      {/* Top Status Banner in Vibrant Theme */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border-2 border-emerald-100 rounded-2xl p-3 shadow-xs">
        {/* Level Navigation */}
        <div className="flex items-center gap-2">
          <button
            id="prev-level-btn"
            disabled={!hasPrevLevel}
            onClick={onPrevLevel}
            className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 disabled:hover:bg-emerald-50 text-emerald-800 flex items-center justify-center transition-colors border border-emerald-200"
            title="Previous Level"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="open-level-selector-btn"
            onClick={onOpenLevelSelect}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-2 transition-colors group"
          >
            <span className="text-xs font-black bg-blue-500 text-white px-2 py-0.5 rounded-lg shadow-xs">
              Lvl {level.id}
            </span>
            <span className="text-xs font-black text-emerald-900 group-hover:text-emerald-700">
              {level.name}
            </span>
            <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          <button
            id="next-level-btn"
            disabled={!hasNextLevel}
            onClick={onNextLevel}
            className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 disabled:hover:bg-emerald-50 text-emerald-800 flex items-center justify-center transition-colors border border-emerald-200"
            title="Next Level"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Counters & Objectives */}
        <div className="flex items-center gap-2 text-xs">
          {/* Moves / Par */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
            <span className="text-slate-500 font-medium">Moves:</span>
            <span className={`font-black text-sm ${state.moveCount <= level.parMoves ? 'text-emerald-700' : 'text-amber-600'}`}>
              {state.moveCount}
            </span>
            <span className="text-slate-400 text-[10px]">/ {level.parMoves} par</span>
          </div>

          {/* Plant Bloom Goal */}
          <div className="flex items-center gap-1.5 bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span>🌸</span>
            <span className="font-black text-emerald-800 font-mono text-xs">
              {plantsWatered}/{totalPlants}
            </span>
          </div>

          {/* Dewdrops if present */}
          {totalDewdrops > 0 && (
            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-black text-blue-700 font-mono text-xs">
                {dewdropsCollected}/{totalDewdrops}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar (Undo, Redo, Restart, Hint, Help, Sound, Level Builder) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border-2 border-emerald-100 rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            id="undo-btn"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors shadow-xs"
            title="Undo Move (Z / U)"
          >
            <Undo2 className="w-4 h-4 text-blue-600" />
            <span>Undo</span>
          </button>

          <button
            id="redo-btn"
            disabled={!canRedo}
            onClick={onRedo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors shadow-xs"
            title="Redo Move"
          >
            <Redo2 className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          <button
            id="restart-btn"
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors shadow-xs"
            title="Restart Level (R)"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {level.hint && (
            <button
              id="hint-btn"
              onClick={onOpenHint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-50 border-2 border-emerald-500 text-emerald-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Level Hint"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Hint</span>
            </button>
          )}

          <button
            id="instructions-btn"
            onClick={onOpenInstructions}
            className="w-9 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center border border-emerald-200 transition-colors shadow-xs"
            title="How to Play & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="level-editor-btn"
            onClick={onOpenEditor}
            className="w-9 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center border border-emerald-200 transition-colors shadow-xs"
            title="Level Builder Sandbox"
          >
            <Hammer className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className="w-9 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center border border-emerald-200 transition-colors shadow-xs"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        </div>
      </div>

      {/* On-screen Virtual D-pad for mobile/touch users */}
      <div className="sm:hidden flex items-center justify-center py-1">
        <div className="grid grid-cols-3 gap-2 w-44">
          <div />
          <button
            id="dpad-up"
            onClick={() => onMove(0, -1)}
            className="h-12 bg-white active:bg-emerald-500 border-2 border-emerald-200 active:border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-900 active:text-white shadow-sm transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            id="dpad-left"
            onClick={() => onMove(-1, 0)}
            className="h-12 bg-white active:bg-emerald-500 border-2 border-emerald-200 active:border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-900 active:text-white shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <button
            id="dpad-right"
            onClick={() => onMove(1, 0)}
            className="h-12 bg-white active:bg-emerald-500 border-2 border-emerald-200 active:border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-900 active:text-white shadow-sm transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            id="dpad-down"
            onClick={() => onMove(0, 1)}
            className="h-12 bg-white active:bg-emerald-500 border-2 border-emerald-200 active:border-emerald-500 rounded-2xl flex items-center justify-center text-emerald-900 active:text-white shadow-sm transition-colors"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
