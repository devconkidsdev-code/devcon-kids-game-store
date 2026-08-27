import React from 'react';
import { LevelDefinition } from '../types';
import { Lightbulb, Check } from 'lucide-react';

interface HintModalProps {
  level: LevelDefinition;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ level, onClose }) => {
  return (
    <div id="hint-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white border-4 border-amber-200 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 w-60 h-60 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-amber-200 shadow-lg shadow-amber-200 flex items-center justify-center mb-3">
          <Lightbulb className="w-7 h-7 text-amber-950" />
        </div>

        <h3 className="text-xl font-black text-slate-800">
          Gardener's Whisper
        </h3>
        <p className="text-xs text-amber-600 font-bold mb-4">
          Level {level.id}: {level.name}
        </p>

        <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6 text-xs text-slate-700 leading-relaxed text-left font-medium">
          {level.hint || 'Think ahead: push water boxes carefully toward the withered plants!'}
        </div>

        <button
          id="close-hint-btn"
          onClick={onClose}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-transform active:scale-95 uppercase tracking-wider"
        >
          <Check className="w-4 h-4" />
          <span>Got it!</span>
        </button>
      </div>
    </div>
  );
};
