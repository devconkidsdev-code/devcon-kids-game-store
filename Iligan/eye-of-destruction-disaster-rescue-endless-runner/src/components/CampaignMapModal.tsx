import React from 'react';
import { X, MapPin, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Trophy } from 'lucide-react';
import { DisasterArea } from '../types';

interface CampaignMapModalProps {
  areas: DisasterArea[];
  currentAreaIndex: number;
  onClose: () => void;
  onSelectArea: (index: number) => void;
}

export const CampaignMapModal: React.FC<CampaignMapModalProps> = ({
  areas,
  currentAreaIndex,
  onClose,
  onSelectArea
}) => {
  const restoredAreasCount = areas.filter(a => a.isRestored).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#151518] border border-white/10 rounded max-w-3xl w-full p-5 sm:p-7 shadow-2xl text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange-500 font-bold">DISASTER COMMAND CENTER</span>
              <span className="text-white/20">•</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                METROPOLITAN SECTOR OVERVIEW
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">Disaster Zone Campaign Map</h2>
          </div>
          <button
            id="close-map-modal-btn"
            onClick={onClose}
            className="p-2 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="my-4 p-4 rounded bg-[#0c0c0e] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest">Metropolitan Restoration Index</div>
            <div className="text-lg sm:text-xl font-mono font-black text-green-400 mt-0.5">
              {restoredAreasCount} / {areas.length} SECTORS FULLY RESTORED
            </div>
          </div>
          <div className="w-full sm:w-56 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${(restoredAreasCount / areas.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Sectors List */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {areas.map((area, idx) => {
            const isUnlocked = idx <= currentAreaIndex || area.isRestored;
            const isCurrent = idx === currentAreaIndex;
            const rescued = area.residents.filter(r => r.isRescued).length;
            const repaired = area.buildings.filter(b => b.isRepaired).length;

            return (
              <div
                key={area.id}
                className={`p-3.5 rounded border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  area.isRestored 
                    ? 'bg-[#0c0c0e] border-green-400/30 hover:border-green-400' 
                    : isCurrent 
                    ? 'bg-[#1c1c21] border-orange-500/50 hover:border-orange-400' 
                    : isUnlocked 
                    ? 'bg-[#0c0c0e] border-white/10 hover:border-white/20' 
                    : 'bg-[#0c0c0e]/40 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    area.isRestored 
                      ? 'bg-green-400 text-black' 
                      : isCurrent 
                      ? 'bg-orange-500 text-black' 
                      : 'bg-[#1c1c21] text-white/50 border border-white/10'
                  }`}>
                    {area.isRestored ? <CheckCircle2 className="w-4 h-4" /> : `0${area.id}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white uppercase">{area.name}</h4>
                      {area.isRestored ? (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-400/20 text-green-300 border border-green-400/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> RESTORED
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          ACTIVE MISSION
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                          LOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-white/40 mt-0.5 line-clamp-1">{area.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-white/60">
                      <span>SURVIVORS: <strong className="text-green-400">{rescued}/{area.residents.length}</strong></span>
                      <span>•</span>
                      <span>STRUCTURES: <strong className="text-sky-400">{repaired}/{area.buildings.length}</strong></span>
                    </div>
                  </div>
                </div>

                {isUnlocked && (
                  <button
                    id={`map-select-area-${area.id}`}
                    onClick={() => {
                      onSelectArea(idx);
                      onClose();
                    }}
                    className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shrink-0 ${
                      isCurrent
                        ? 'bg-orange-500 hover:bg-orange-400 text-black shadow-md'
                        : 'bg-[#1c1c21] hover:bg-[#25252b] text-white border border-white/10'
                    }`}
                  >
                    <span>{isCurrent ? 'Current' : 'Travel'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
          <button
            id="map-close-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white font-mono text-xs uppercase tracking-wider"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};

