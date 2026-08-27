import React from 'react';
import { X, BriefcaseMedical, Wrench, Shield, Sparkles, MoveLeft, MoveRight, ArrowUp, ArrowDown, Hand } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#151518] border border-white/10 rounded max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-500">OPERATIONAL FIELD MANUAL</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">Disaster Protocol & Controls</h2>
          </div>
          <button
            id="close-how-to-play-btn"
            onClick={onClose}
            className="p-2 rounded bg-[#1c1c21] hover:bg-[#25252b] border border-white/10 text-white/60 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5 my-4 overflow-y-auto flex-1 pr-1 text-xs font-mono text-white/70">
          {/* Section 1: 3-Lane Travel */}
          <div className="p-3.5 rounded bg-[#0c0c0e] border border-white/10">
            <h3 className="font-bold text-xs uppercase tracking-wider text-orange-400 mb-1.5 flex items-center gap-2">
              <span>01 // Expressway Transit Navigation</span>
            </h3>
            <p className="text-[11px] text-white/50 mb-3">
              Pilot Rose's emergency rescue van across 3 highway lanes while dodging concrete wreckage and fallen overhead structures.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 text-center">
                <kbd className="px-1.5 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-orange-400 font-bold">A / D</kbd>
                <div className="mt-1 text-[11px] text-white/80">Switch Lanes</div>
              </div>
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 text-center">
                <kbd className="px-1.5 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-orange-400 font-bold">W / ↑ / Space</kbd>
                <div className="mt-1 text-[11px] text-white/80">Jump Rubble</div>
              </div>
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 text-center">
                <kbd className="px-1.5 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-orange-400 font-bold">S / ↓</kbd>
                <div className="mt-1 text-[11px] text-white/80">Slide Under</div>
              </div>
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 text-center">
                <kbd className="px-1.5 py-0.5 bg-[#1c1c21] border border-white/10 rounded text-green-400 font-bold">E</kbd>
                <div className="mt-1 text-[11px] text-white/80">Interact / Action</div>
              </div>
            </div>
          </div>

          {/* Section 2: Supplies */}
          <div className="p-3.5 rounded bg-[#0c0c0e] border border-white/10">
            <h3 className="font-bold text-xs uppercase tracking-wider text-green-400 mb-2">02 // Essential Cargo Procurement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 flex items-start gap-2">
                <BriefcaseMedical className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-[11px]">Medical Kits</strong>
                  Heal injured survivors trapped in disaster zones.
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 flex items-start gap-2">
                <Wrench className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-[11px]">Repair Materials</strong>
                  Reconstruct collapsed buildings & power grids.
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#151518] border border-white/10 flex items-start gap-2">
                <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-[11px]">Deflector Shield</strong>
                  Absorbs 1 direct high-speed collision.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 2D Rescue System & 1-Click Controls */}
          <div className="p-3.5 rounded bg-[#0c0c0e] border border-white/10">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>03 // 2D Rescue & Building Reconstruction System</span>
            </h3>
            <p className="text-[11px] text-white/60 leading-relaxed mb-2">
              When arriving at designated disaster zones, use direct 1-click controls:
            </p>
            <ul className="space-y-1.5 text-[11px] text-white/70 list-disc list-inside">
              <li><strong className="text-emerald-400">2D Survivor Triage:</strong> Click directly on injured <strong className="text-white">hands</strong>, <strong className="text-white">legs</strong>, or click the <strong className="text-white">TREAT</strong> button to instantly apply <strong className="text-white">Elastic Bandages</strong> and <strong className="text-white">Sterile Gauze Pads</strong>.</li>
              <li><strong className="text-amber-400">2D Building Rebuild:</strong> Click directly on broken <strong className="text-white">roofs</strong>, <strong className="text-white">cracked walls</strong>, <strong className="text-white">shattered windows</strong>, or click the <strong className="text-white">REPAIR</strong> button to reconstruct the structure.</li>
              <li><strong className="text-sky-400">Sector Clearance:</strong> Stabilize all survivors and repair all buildings to clear the storm and unlock the next disaster sector!</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            id="how-to-play-understood-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition"
          >
            Acknowledge Directives
          </button>
        </div>
      </div>
    </div>
  );
};

