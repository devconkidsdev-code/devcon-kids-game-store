import React, { useState } from 'react';
import { PlantDefinition, GameStats, PlantRarity } from '../types';
import { BookOpen, X, Sparkles, Award, Lock, Droplet, Clock, Coins } from 'lucide-react';

interface CompendiumProps {
  isOpen: boolean;
  onClose: () => void;
  allPlants: PlantDefinition[];
  unlockedSeedIds: string[];
  stats: GameStats;
}

const RARITY_COLORS: Record<PlantRarity, { border: string; bg: string; text: string; badge: string }> = {
  common: { border: 'border-stone-600/40', bg: 'bg-stone-900/40', text: 'text-stone-300', badge: 'bg-stone-800 text-stone-300' },
  uncommon: { border: 'border-emerald-600/40', bg: 'bg-emerald-950/40', text: 'text-emerald-300', badge: 'bg-emerald-900/60 text-emerald-300' },
  rare: { border: 'border-blue-600/40', bg: 'bg-blue-950/40', text: 'text-blue-300', badge: 'bg-blue-900/60 text-blue-300' },
  exotic: { border: 'border-fuchsia-600/50', bg: 'bg-fuchsia-950/40', text: 'text-fuchsia-300', badge: 'bg-fuchsia-900/60 text-fuchsia-300' },
  legendary: { border: 'border-amber-500/60', bg: 'bg-amber-950/50', text: 'text-amber-300', badge: 'bg-amber-900/80 text-amber-300' },
};

export const Compendium: React.FC<CompendiumProps> = ({
  isOpen,
  onClose,
  allPlants,
  unlockedSeedIds,
  stats,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(allPlants[0].id);

  if (!isOpen) return null;

  const totalDiscovered = unlockedSeedIds.length;
  const totalPlants = allPlants.length;
  const completionPercentage = Math.round((totalDiscovered / totalPlants) * 100);

  const selectedPlant = allPlants.find((p) => p.id === selectedPlantId) || allPlants[0];
  const isSelectedUnlocked = unlockedSeedIds.includes(selectedPlant.id);
  const harvestCount = stats.harvestCountsByCrop[selectedPlant.id] || 0;
  const totalRevenue = harvestCount * selectedPlant.sellPrice;
  const rarity = RARITY_COLORS[selectedPlant.tier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-emerald-800/60 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/80 to-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Botanical Compendium & Journal
              </h2>
              <p className="text-xs text-emerald-300/80">
                Documenting {totalDiscovered} of {totalPlants} discovered botanical varieties ({completionPercentage}%)
              </p>
            </div>
          </div>

          <button
            id="close-compendium-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
          {/* Plants Grid */}
          <div className="w-full md:w-1/2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Crop Varieties
              </span>
              <span className="text-xs font-black text-emerald-400">
                {totalDiscovered}/{totalPlants} Discovered
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {allPlants.map((plant) => {
                const isUnlocked = unlockedSeedIds.includes(plant.id);
                const isSelected = selectedPlantId === plant.id;
                const r = RARITY_COLORS[plant.tier];

                return (
                  <button
                    key={plant.id}
                    id={`compendium-item-${plant.id}`}
                    onClick={() => setSelectedPlantId(plant.id)}
                    className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/60 shadow-md ring-2 ring-emerald-400/40 scale-105'
                        : isUnlocked
                        ? `${r.bg} ${r.border} hover:scale-102`
                        : 'border-stone-800 bg-stone-950/60 opacity-40 hover:opacity-60'
                    }`}
                  >
                    <span className="text-2xl select-none">
                      {isUnlocked ? plant.icon : '❓'}
                    </span>
                    <span className="text-[10px] font-bold text-stone-300 truncate w-full text-center mt-1">
                      {isUnlocked ? plant.name : 'Unknown'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plant Detail Dossier */}
          <div className="w-full md:w-1/2 bg-stone-950/70 rounded-2xl border border-stone-800 p-5 flex flex-col justify-between">
            {isSelectedUnlocked ? (
              <div className="space-y-4">
                {/* Plant Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-700 flex items-center justify-center text-4xl shadow-inner shrink-0">
                    {selectedPlant.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{selectedPlant.name}</h3>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${rarity.badge}`}>
                        {selectedPlant.tier}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 italic mt-0.5">{selectedPlant.scientificName}</div>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed">{selectedPlant.description}</p>
                  </div>
                </div>

                {/* Botanical Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
                    <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> Growth Speed
                    </div>
                    <div className="font-black text-white mt-1">{selectedPlant.growthTimeSeconds} seconds</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
                    <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                      <Coins className="w-3 h-3" /> Market Price
                    </div>
                    <div className="font-black text-amber-400 mt-1">{selectedPlant.sellPrice} 🪙</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
                    <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" /> EXP Yield
                    </div>
                    <div className="font-black text-sky-400 mt-1">+{selectedPlant.xpReward} XP</div>
                  </div>
                </div>

                {/* Lifetime Farm Statistics */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-2">
                  <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Lifetime Farm Record
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span>Total Harvested:</span>
                    <strong className="text-white">{harvestCount} crops</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span>Total Revenue Generated:</span>
                    <strong className="text-amber-400">{totalRevenue.toLocaleString()} 🪙</strong>
                  </div>
                </div>

                {/* Mutation Recipe Info */}
                {selectedPlant.mutationPossibility && (
                  <div className="p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-800/30 text-xs text-fuchsia-200">
                    <strong>Exotic Hybrid Potential:</strong> Cross-breeding this plant in the Exotic Lab unlocks rare botanical varietals.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400 flex flex-col items-center justify-center">
                <Lock className="w-10 h-10 text-stone-600 mb-2" />
                <h4 className="text-sm font-bold text-stone-300">Undiscovered Specimen</h4>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  {selectedPlant.unlockRequirementText || `Reach Level ${selectedPlant.unlockLevel} or unlock through the Exotic Breeding Lab.`}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-stone-800 text-center text-xs text-stone-400">
              Garden Compendium Entry #{allPlants.findIndex(p => p.id === selectedPlant.id) + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
