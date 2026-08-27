import React from 'react';
import { X, Droplets, Zap, Sparkles, CloudRain, Store, ArrowUpCircle } from 'lucide-react';
import { Upgrades } from '../types';

interface ShopModalProps {
  coins: number;
  upgrades: Upgrades;
  onBuyUpgrade: (type: keyof Upgrades, cost: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  upgrades,
  onBuyUpgrade,
  onClose,
}) => {
  const canCost = 100 * Math.pow(1.8, upgrades.canCapacityLevel);
  const speedCost = 120 * Math.pow(1.8, upgrades.speedLevel);
  const fertCost = 150 * Math.pow(2.0, upgrades.fertilizerLevel);
  const rainCloudCost = 80;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🏪
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-200">
                Farmer's Supply Shed
              </h2>
              <p className="text-xs text-stone-400">
                Upgrade tools to beat tough levels & keep thirsty crops thriving!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Display */}
            <div className="bg-amber-950/80 border border-amber-500/50 px-3 py-1.5 rounded-xl font-black text-amber-300 text-sm flex items-center gap-1.5 shadow-inner">
              <span>🪙</span>
              <span>{coins} Coins</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          
          {/* 1. Large Watering Can */}
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Large Watering Can</h4>
                  <span className="text-[10px] font-bold bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded-md">
                    Lvl {upgrades.canCapacityLevel + 1}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Holds +5 more water per fill ({10 + upgrades.canCapacityLevel * 5} max capacity).
                </p>
              </div>
            </div>

            <button
              onClick={() => onBuyUpgrade('canCapacityLevel', Math.round(canCost))}
              disabled={coins < canCost}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                coins >= canCost
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>🪙 {Math.round(canCost)}</span>
            </button>
          </div>

          {/* 2. Swift Boots */}
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Swift Sprint Boots</h4>
                  <span className="text-[10px] font-bold bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-md">
                    Lvl {upgrades.speedLevel + 1}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Run +20% faster across the garden plots to reach thirsty crops in time.
                </p>
              </div>
            </div>

            <button
              onClick={() => onBuyUpgrade('speedLevel', Math.round(speedCost))}
              disabled={coins < speedCost}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                coins >= speedCost
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>🪙 {Math.round(speedCost)}</span>
            </button>
          </div>

          {/* 3. Rich Fertilizer */}
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Rich Soil Fertilizer</h4>
                  <span className="text-[10px] font-bold bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded-md">
                    Lvl {upgrades.fertilizerLevel + 1}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Crops grow 25% faster and retain soil moisture longer before withering.
                </p>
              </div>
            </div>

            <button
              onClick={() => onBuyUpgrade('fertilizerLevel', Math.round(fertCost))}
              disabled={coins < fertCost}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                coins >= fertCost
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>🪙 {Math.round(fertCost)}</span>
            </button>
          </div>

          {/* 4. Rain Cloud Booster (Consumable) */}
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <CloudRain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Rain Cloud Booster</h4>
                  <span className="text-[10px] font-bold bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-md">
                    Owned: {upgrades.rainCloudPowerups}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Consumable! Summons an instant rain shower to fully restore 100% moisture on all plots!
                </p>
              </div>
            </div>

            <button
              onClick={() => onBuyUpgrade('rainCloudPowerups', rainCloudCost)}
              disabled={coins < rainCloudCost}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                coins >= rainCloudCost
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>+1 Buy</span>
              <span>🪙 {rainCloudCost}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Earn coins by completing harvests and maintaining perfect gardens!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Back to Garden
          </button>
        </div>
      </div>
    </div>
  );
};
