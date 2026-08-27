import React from 'react';
import { Droplets, Sparkles, Zap, ShieldAlert, BookOpen, Layers } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div id="instructions-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white border-4 border-emerald-100 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-800">Gardener's Field Guide</h2>
              <p className="text-xs text-slate-500 font-medium">Master terrain mechanics and nurture all wilting plants</p>
            </div>
          </div>

          <button
            id="close-instructions-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-700">
          {/* Section 1: Objective */}
          <div className="bg-emerald-50/70 border-2 border-emerald-100 rounded-2xl p-4">
            <h3 className="text-sm font-black text-emerald-800 mb-1 flex items-center gap-2">
              <span>🌱</span> Core Objective: Water Every Plant
            </h3>
            <p className="leading-relaxed text-slate-600">
              Navigate your gardener (🧑‍🌾) across the landscape. Push glowing blue <strong>Water Boxes (H2O)</strong> directly into withered plants to revive them into vibrant blooming blossoms, sacred lotuses, and ancient trees. Once all plants bloom, the level is complete!
            </p>
          </div>

          {/* Section 2: Interactive Grid Elements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Water Box */}
            <div className="bg-white border-2 border-blue-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-500 border-2 border-blue-300 flex items-center justify-center shrink-0 shadow-xs">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-700 text-xs">Water Box (H2O)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Push into thirsty plants to water and bloom them.
                </p>
              </div>
            </div>

            {/* Empty Crate */}
            <div className="bg-white border-2 border-amber-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#A67C52] border-b-2 border-[#5D3A1A] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-amber-200">BOX</span>
              </div>
              <div>
                <h4 className="font-bold text-amber-800 text-xs">Wooden Crate</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Push onto a Water Spring to fill it with water!
                </p>
              </div>
            </div>

            {/* Water Spring */}
            <div className="bg-white border-2 border-cyan-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-cyan-500 border-2 border-cyan-200 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-cyan-700 text-xs">Fresh Water Spring</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Refills empty crates into fresh Water Containers.
                </p>
              </div>
            </div>

            {/* Deep River Chasm */}
            <div className="bg-white border-2 border-blue-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-600 border-2 border-blue-400 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">≈≈</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-700 text-xs">Deep River Chasm</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Push a crate into the river to create a walkable wooden bridge.
                </p>
              </div>
            </div>

            {/* Pressure Plates & Gates */}
            <div className="bg-white border-2 border-red-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-red-500 border-2 border-red-300 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-red-700 text-xs">Plates & Gates</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Step on or push boxes onto colored plates to open matching colored gates.
                </p>
              </div>
            </div>

            {/* Ice Sliding */}
            <div className="bg-white border-2 border-cyan-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 border-2 border-cyan-300 flex items-center justify-center shrink-0">
                <span className="text-cyan-700 font-bold text-sm">❄</span>
              </div>
              <div>
                <h4 className="font-bold text-cyan-700 text-xs">Ice Slide Blocks</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pushing ice blocks sends them gliding until they hit an obstacle.
                </p>
              </div>
            </div>

            {/* Teleport Portals */}
            <div className="bg-white border-2 border-purple-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-purple-600 border-2 border-purple-300 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-purple-700 text-xs">Mist Teleport Portals</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Step into Portal A to emerge instantly from linked Portal B.
                </p>
              </div>
            </div>

            {/* Dewdrops */}
            <div className="bg-white border-2 border-cyan-100 rounded-xl p-3 flex gap-3 items-start shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-cyan-400 border-2 border-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h4 className="font-bold text-cyan-700 text-xs">Luminous Dewdrops</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional bonus collectibles required for a full 3-star rating.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 border-t-2 border-emerald-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Ready to Play
          </button>
        </div>
      </div>
    </div>
  );
};
