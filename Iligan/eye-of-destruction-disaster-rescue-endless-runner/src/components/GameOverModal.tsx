import React from 'react';
import { AlertTriangle, RotateCcw, Truck, Wrench } from 'lucide-react';

interface GameOverModalProps {
  onRestartArea: () => void;
  onRepairVanCheckpoint: () => void;
  areaName: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRestartArea,
  onRepairVanCheckpoint,
  areaName
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#151518] border border-red-500/50 rounded max-w-md w-full p-6 sm:p-8 shadow-2xl text-white text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-red-500/10 text-red-400 border border-red-500/30 mb-3 animate-pulse">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
          VEHICLE STATUS: CRITICAL FAILURE
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">Rescue Van Disabled</h2>
        <p className="text-xs font-mono text-white/60 mt-2">
          Severe debris impact along the expressway neutralized structural integrity in <strong className="text-orange-400">{areaName}</strong>.
        </p>

        <div className="flex flex-col gap-2 mt-6 font-mono">
          <button
            id="gameover-emergency-repair-btn"
            onClick={onRepairVanCheckpoint}
            className="w-full py-3 px-4 rounded bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Emergency Field Repair (Continue)</span>
          </button>

          <button
            id="gameover-restart-area-btn"
            onClick={onRestartArea}
            className="w-full py-3 px-4 rounded bg-[#1c1c21] hover:bg-[#25252b] text-white/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Sector Travel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

