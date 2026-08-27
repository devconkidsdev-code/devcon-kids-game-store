import React from 'react';
import { ToolType, PlantDefinition, PlantRarity } from '../types';
import { 
  Droplet, 
  Sprout, 
  Sparkles, 
  Zap, 
  Trash2, 
  Hand,
  Store,
  ChevronRight
} from 'lucide-react';

interface ToolBarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  seedsInventory: Record<string, number>;
  unlockedSeeds: PlantDefinition[];
  selectedSeedId: string;
  onSelectSeed: (seedId: string) => void;
  onOpenShop: () => void;
  onOpenLab: () => void;
}

const RARITY_COLORS: Record<PlantRarity, { border: string; bg: string; text: string; label: string }> = {
  common: { border: 'border-stone-500/40', bg: 'bg-stone-800/60', text: 'text-stone-300', label: 'Common' },
  uncommon: { border: 'border-emerald-500/50', bg: 'bg-emerald-950/40', text: 'text-emerald-300', label: 'Uncommon' },
  rare: { border: 'border-blue-500/50', bg: 'bg-blue-950/40', text: 'text-blue-300', label: 'Rare' },
  exotic: { border: 'border-fuchsia-500/50', bg: 'bg-fuchsia-950/40', text: 'text-fuchsia-300', label: 'Exotic' },
  legendary: { border: 'border-amber-500/60', bg: 'bg-amber-950/50', text: 'text-amber-300', label: 'Legendary' },
};

export const ToolBar: React.FC<ToolBarProps> = ({
  selectedTool,
  onSelectTool,
  seedsInventory,
  unlockedSeeds,
  selectedSeedId,
  onSelectSeed,
  onOpenShop,
  onOpenLab,
}) => {
  const tools: { id: ToolType; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    { id: 'select', label: 'Smart Tap', icon: <Hand className="w-4 h-4" />, color: 'hover:border-emerald-400', desc: 'Auto actions: water, plant, or harvest' },
    { id: 'water', label: 'Water Can', icon: <Droplet className="w-4 h-4 fill-sky-400 text-sky-400" />, color: 'hover:border-sky-400', desc: 'Hydrate soil to grow plants' },
    { id: 'plant', label: 'Plant Seed', icon: <Sprout className="w-4 h-4 text-emerald-400" />, color: 'hover:border-emerald-400', desc: 'Plant selected seed from pouch' },
    { id: 'fertilize', label: 'Fertilizer', icon: <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />, color: 'hover:border-amber-400', desc: 'Boost growth speed by 2x' },
    { id: 'harvest', label: 'Harvest', icon: <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />, color: 'hover:border-amber-300', desc: 'Gather ripe crops' },
    { id: 'clear', label: 'Clear', icon: <Trash2 className="w-4 h-4 text-rose-400" />, color: 'hover:border-rose-400', desc: 'Clear a plot' },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Tool Selection Row */}
      <div className="bg-emerald-950/50 p-2 rounded-2xl border border-emerald-800/30 backdrop-blur-md">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tools.map((t) => {
            const isSelected = selectedTool === t.id;
            return (
              <button
                key={t.id}
                id={`tool-btn-${t.id}`}
                onClick={() => onSelectTool(t.id)}
                className={`flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 scale-[1.02] ring-1 ring-emerald-300/40'
                    : 'bg-emerald-900/20 text-stone-300 hover:bg-emerald-900/40 hover:text-white border border-emerald-800/20'
                }`}
              >
                {t.icon}
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seed Pouch / Tray Selector */}
      <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/30">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Seed Pouch
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="open-shop-quick-btn"
              onClick={onOpenShop}
              className="flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 px-2.5 py-1 rounded-lg border border-amber-600/30 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seed Shop</span>
            </button>

            <button
              id="open-lab-quick-btn"
              onClick={onOpenLab}
              className="flex items-center gap-1 text-xs font-bold text-fuchsia-300 hover:text-fuchsia-200 bg-fuchsia-950/40 hover:bg-fuchsia-900/50 px-2.5 py-1 rounded-lg border border-fuchsia-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exotic Lab</span>
            </button>
          </div>
        </div>

        {/* Horizontal scrollable seeds list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-emerald-700/50">
          {unlockedSeeds.map((plant) => {
            const count = seedsInventory[plant.id] || 0;
            const isSelected = selectedSeedId === plant.id;
            const rarity = RARITY_COLORS[plant.tier];

            return (
              <button
                key={plant.id}
                id={`seed-pouch-item-${plant.id}`}
                onClick={() => {
                  onSelectSeed(plant.id);
                  if (selectedTool === 'select' || selectedTool === 'clear') {
                    onSelectTool('plant');
                  }
                }}
                className={`flex-shrink-0 flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-left ${rarity.bg} ${rarity.border} ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 shadow-md scale-[1.02]'
                    : 'hover:border-emerald-400/50 opacity-90 hover:opacity-100'
                }`}
              >
                <div className="text-2xl select-none">{plant.icon}</div>
                <div className="flex flex-col pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">
                      {plant.name}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1 rounded ${rarity.text} bg-black/40`}>
                      {plant.tier}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className={`text-[11px] font-bold ${count > 0 ? 'text-emerald-400' : 'text-rose-400 font-semibold'}`}>
                      {count > 0 ? `${count} seeds` : '0 seeds (Buy)'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      ⏱️ {plant.growthTimeSeconds}s
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
