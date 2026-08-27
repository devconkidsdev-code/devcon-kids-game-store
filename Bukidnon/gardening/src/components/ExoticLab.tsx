import React, { useState } from 'react';
import { PlantDefinition, PlantRarity } from '../types';
import { Sparkles, X, Dna, FlaskConical, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExoticLabProps {
  isOpen: boolean;
  onClose: () => void;
  allPlants: PlantDefinition[];
  harvestInventory: Record<string, number>;
  unlockedSeedIds: string[];
  onSynthesizeExotic: (targetPlant: PlantDefinition, consumed: { crop1Id: string; crop2Id: string }) => void;
}

interface ExoticRecipe {
  id: string;
  resultPlantId: string;
  parent1Id: string;
  parent1Count: number;
  parent2Id: string;
  parent2Count: number;
  description: string;
  hint: string;
}

const EXOTIC_RECIPES: ExoticRecipe[] = [
  {
    id: 'recipe_moonflower',
    resultPlantId: 'luminescent_moonflower',
    parent1Id: 'juicy_strawberry',
    parent1Count: 3,
    parent2Id: 'sunburst_pepper',
    parent2Count: 2,
    description: 'Fuse twilight nectar with sunburst essence to synthesize the nocturnal Moon Orchid.',
    hint: 'Requires 3 Honey Strawberries + 2 Sunburst Peppers',
  },
  {
    id: 'recipe_solar_lotus',
    resultPlantId: 'solar_lotus',
    parent1Id: 'golden_corn',
    parent1Count: 4,
    parent2Id: 'sunburst_pepper',
    parent2Count: 3,
    description: 'Concentrate radiant golden maize with fiery sunburst peppers to awaken the Solar Bloom.',
    hint: 'Requires 4 Butter Maize + 3 Sunburst Peppers',
  },
  {
    id: 'recipe_crystal_dragonfruit',
    resultPlantId: 'crystal_dragonfruit',
    parent1Id: 'luminescent_moonflower',
    parent1Count: 2,
    parent2Id: 'solar_lotus',
    parent2Count: 2,
    description: 'Harmonize lunar luminescence and solar brilliance to crystallize the Crystal Dragonfruit.',
    hint: 'Requires 2 Moon Orchids + 2 Solar Blooms',
  },
  {
    id: 'recipe_rainbow_prism',
    resultPlantId: 'rainbow_prism_rose',
    parent1Id: 'crystal_dragonfruit',
    parent1Count: 2,
    parent2Id: 'midnight_lavender',
    parent2Count: 4,
    description: 'Refract midnight botanical pigments through crystalline scales into a Prism Blossom.',
    hint: 'Requires 2 Crystal Dragonfruits + 4 Midnight Lavenders',
  },
  {
    id: 'recipe_cosmic_melon',
    resultPlantId: 'cosmic_starlight_melon',
    parent1Id: 'crystal_dragonfruit',
    parent1Count: 3,
    parent2Id: 'rainbow_prism_rose',
    parent2Count: 2,
    description: 'Weave prism spectrums with crystal dragonfruit essence to birth the Astral Star Fruit.',
    hint: 'Requires 3 Crystal Dragonfruits + 2 Prism Blossoms',
  },
  {
    id: 'recipe_phoenix_tree',
    resultPlantId: 'phoenix_ember_tree',
    parent1Id: 'cosmic_starlight_melon',
    parent1Count: 2,
    parent2Id: 'sunburst_pepper',
    parent2Count: 6,
    description: 'Infuse cosmic starlight with burning embers to hatch the mythical Phoenix Blossom.',
    hint: 'Requires 2 Astral Star Fruits + 6 Sunburst Peppers',
  },
];

export const ExoticLab: React.FC<ExoticLabProps> = ({
  isOpen,
  onClose,
  allPlants,
  harvestInventory,
  unlockedSeedIds,
  onSynthesizeExotic,
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(EXOTIC_RECIPES[0].id);

  if (!isOpen) return null;

  const plantsById = allPlants.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, PlantDefinition>);
  const activeRecipe = EXOTIC_RECIPES.find((r) => r.id === selectedRecipeId) || EXOTIC_RECIPES[0];
  
  const resultPlant = plantsById[activeRecipe.resultPlantId];
  const parent1 = plantsById[activeRecipe.parent1Id];
  const parent2 = plantsById[activeRecipe.parent2Id];

  const parent1Owned = harvestInventory[activeRecipe.parent1Id] || 0;
  const parent2Owned = harvestInventory[activeRecipe.parent2Id] || 0;

  const hasIngredients = parent1Owned >= activeRecipe.parent1Count && parent2Owned >= activeRecipe.parent2Count;
  const isAlreadyUnlocked = unlockedSeedIds.includes(activeRecipe.resultPlantId);

  const handleSynthesize = () => {
    if (!hasIngredients || !resultPlant) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#38bdf8', '#fbbf24'],
      });
    } catch {
      // safe fallback
    }

    onSynthesizeExotic(resultPlant, {
      crop1Id: activeRecipe.parent1Id,
      crop2Id: activeRecipe.parent2Id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-fuchsia-800/60 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-fuchsia-950/80 to-purple-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-600/30 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Exotic Botanical Lab
              </h2>
              <p className="text-xs text-fuchsia-300/80">
                Cross-breed harvested crops to discover and unlock rare exotic seeds
              </p>
            </div>
          </div>

          <button
            id="close-lab-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
          {/* Recipes List Sidebar */}
          <div className="w-full md:w-1/3 space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">
              Exotic Discoveries
            </span>

            <div className="space-y-1.5 max-h-60 md:max-h-[400px] overflow-y-auto pr-1">
              {EXOTIC_RECIPES.map((recipe) => {
                const target = plantsById[recipe.resultPlantId];
                const isSelected = selectedRecipeId === recipe.id;
                const isUnlocked = unlockedSeedIds.includes(recipe.resultPlantId);

                return (
                  <button
                    key={recipe.id}
                    id={`recipe-btn-${recipe.id}`}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-fuchsia-950/60 border-fuchsia-500 text-white shadow-md'
                        : 'bg-stone-900/40 border-stone-800 text-stone-400 hover:bg-stone-800/60 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{target?.icon || '✨'}</span>
                      <div>
                        <div className="text-xs font-black text-white">{target?.name}</div>
                        <div className="text-[10px] text-fuchsia-300/80 capitalize">{target?.tier}</div>
                      </div>
                    </div>

                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Synthesis Chamber */}
          <div className="w-full md:w-2/3 flex flex-col justify-between bg-stone-950/60 p-4 sm:p-5 rounded-2xl border border-fuchsia-900/40">
            {resultPlant && parent1 && parent2 && (
              <div className="space-y-5">
                {/* Result Seed Hero */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 to-purple-950/40 border border-fuchsia-500/30">
                  <div className="w-16 h-16 rounded-2xl bg-black/60 border border-fuchsia-400/40 flex items-center justify-center text-4xl shadow-inner animate-bounce-subtle">
                    {resultPlant.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{resultPlant.name}</h3>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-fuchsia-900/80 text-fuchsia-200 border border-fuchsia-600/40">
                        {resultPlant.tier}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1 italic">"{resultPlant.scientificName}"</p>
                    <p className="text-xs text-stone-400 mt-1">{activeRecipe.description}</p>
                  </div>
                </div>

                {/* Synthesis Ingredients Equation */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                    Required Harvests for Cross-Breeding
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Parent 1 */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      parent1Owned >= activeRecipe.parent1Count
                        ? 'bg-emerald-950/30 border-emerald-600/40'
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{parent1.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{parent1.name}</div>
                          <div className="text-[11px] text-stone-400">
                            Have: <strong className={parent1Owned >= activeRecipe.parent1Count ? 'text-emerald-400' : 'text-rose-400'}>{parent1Owned}</strong> / {activeRecipe.parent1Count}
                          </div>
                        </div>
                      </div>
                      {parent1Owned >= activeRecipe.parent1Count ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>

                    {/* Parent 2 */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      parent2Owned >= activeRecipe.parent2Count
                        ? 'bg-emerald-950/30 border-emerald-600/40'
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{parent2.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{parent2.name}</div>
                          <div className="text-[11px] text-stone-400">
                            Have: <strong className={parent2Owned >= activeRecipe.parent2Count ? 'text-emerald-400' : 'text-rose-400'}>{parent2Owned}</strong> / {activeRecipe.parent2Count}
                          </div>
                        </div>
                      </div>
                      {parent2Owned >= activeRecipe.parent2Count ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Plant Properties Preview */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                  <div>
                    <div className="text-[10px] text-stone-400">Growth Duration</div>
                    <div className="font-bold text-amber-300 mt-0.5">⏱️ {resultPlant.growthTimeSeconds}s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Sell Harvest Value</div>
                    <div className="font-bold text-emerald-300 mt-0.5">🪙 {resultPlant.sellPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Experience XP</div>
                    <div className="font-bold text-sky-300 mt-0.5">✨ +{resultPlant.xpReward}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Synthesize Button */}
            <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between gap-4">
              <div className="text-xs text-stone-400">
                {isAlreadyUnlocked ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Already in Seed Pouch (+3 bonus seeds on breed)
                  </span>
                ) : (
                  <span>Synthesizing unlocks this seed forever in your garden pouch</span>
                )}
              </div>

              <button
                id="synthesize-exotic-btn"
                onClick={handleSynthesize}
                disabled={!hasIngredients}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-black shadow-lg shadow-fuchsia-900/30 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-fuchsia-200" />
                <span>{isAlreadyUnlocked ? 'Synthesize +3 Seeds' : 'Synthesize & Unlock'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
