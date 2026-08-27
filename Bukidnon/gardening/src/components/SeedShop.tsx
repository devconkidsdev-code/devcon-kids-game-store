import React, { useState } from 'react';
import { PlantDefinition, PlantRarity } from '../types';
import { Store, X, Plus, Sparkles, Coins, ShoppingBag, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface SeedShopProps {
  isOpen: boolean;
  onClose: () => void;
  allPlants: PlantDefinition[];
  unlockedSeedIds: string[];
  seedsInventory: Record<string, number>;
  harvestInventory: Record<string, number>;
  playerCoins: number;
  playerLevel: number;
  onBuySeeds: (plantId: string, count: number, totalCost: number) => void;
  onUnlockSeed: (plant: PlantDefinition) => void;
  onSellCrop: (plantId: string, count: number, pricePerUnit: number) => void;
  onSellAllCrops: () => void;
}

const RARITY_COLORS: Record<PlantRarity, { border: string; bg: string; text: string; badge: string }> = {
  common: { border: 'border-stone-600/40', bg: 'bg-stone-900/40', text: 'text-stone-300', badge: 'bg-stone-800 text-stone-300' },
  uncommon: { border: 'border-emerald-600/40', bg: 'bg-emerald-950/40', text: 'text-emerald-300', badge: 'bg-emerald-900/60 text-emerald-300' },
  rare: { border: 'border-blue-600/40', bg: 'bg-blue-950/40', text: 'text-blue-300', badge: 'bg-blue-900/60 text-blue-300' },
  exotic: { border: 'border-fuchsia-600/50', bg: 'bg-fuchsia-950/40', text: 'text-fuchsia-300', badge: 'bg-fuchsia-900/60 text-fuchsia-300' },
  legendary: { border: 'border-amber-500/60', bg: 'bg-amber-950/50', text: 'text-amber-300', badge: 'bg-amber-900/80 text-amber-300' },
};

export const SeedShop: React.FC<SeedShopProps> = ({
  isOpen,
  onClose,
  allPlants,
  unlockedSeedIds,
  seedsInventory,
  harvestInventory,
  playerCoins,
  playerLevel,
  onBuySeeds,
  onUnlockSeed,
  onSellCrop,
  onSellAllCrops,
}) => {
  const [activeTab, setActiveTab] = useState<'buy_seeds' | 'sell_crops'>('buy_seeds');
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<string>('all');

  if (!isOpen) return null;

  const totalHarvestValue = Object.entries(harvestInventory).reduce((sum, [cropId, count]) => {
    const numCount = Number(count) || 0;
    if (numCount <= 0) return sum;
    const plant = allPlants.find(p => p.id === cropId);
    return sum + (plant ? plant.sellPrice * numCount : 0);
  }, 0);

  const totalHarvestCount = Object.values(harvestInventory).reduce<number>((sum, count) => sum + (Number(count) || 0), 0);

  const filteredPlants = allPlants.filter(p => {
    if (selectedRarityFilter === 'all') return true;
    return p.tier === selectedRarityFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-emerald-800/60 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-emerald-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Garden Nursery & Market
              </h2>
              <p className="text-xs text-emerald-300/80">
                Purchase seeds, exotic varietals, or sell your fresh harvests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 border border-amber-500/40 rounded-xl">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-black text-amber-300">{playerCoins.toLocaleString()}</span>
            </div>

            <button
              id="close-shop-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950/50 px-4 pt-2 gap-2">
          <button
            id="shop-tab-buy-seeds"
            onClick={() => setActiveTab('buy_seeds')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-black rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'buy_seeds'
                ? 'bg-stone-900 text-emerald-400 border-t-2 border-emerald-400'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Seed Packets</span>
          </button>

          <button
            id="shop-tab-sell-crops"
            onClick={() => setActiveTab('sell_crops')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-black rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sell_crops'
                ? 'bg-stone-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Sell Harvest ({totalHarvestCount})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'buy_seeds' ? (
            <div className="space-y-4">
              {/* Rarity Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'common', 'uncommon', 'rare', 'exotic', 'legendary'].map((rarity) => (
                  <button
                    key={rarity}
                    id={`filter-rarity-${rarity}`}
                    onClick={() => setSelectedRarityFilter(rarity)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      selectedRarityFilter === rarity
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-800/80 text-stone-400 hover:text-white'
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>

              {/* Seed Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPlants.map((plant) => {
                  const isUnlocked = unlockedSeedIds.includes(plant.id);
                  const currentInventory = seedsInventory[plant.id] || 0;
                  const rarity = RARITY_COLORS[plant.tier];
                  const canAffordSingle = playerCoins >= plant.buyPrice;
                  const canAfford5 = playerCoins >= plant.buyPrice * 5;
                  const canAffordUnlock = playerLevel >= plant.unlockLevel;

                  return (
                    <div
                      key={plant.id}
                      id={`shop-card-${plant.id}`}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${rarity.bg} ${rarity.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-black/40 border border-stone-700/50 flex items-center justify-center text-3xl shrink-0">
                          {plant.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-sm font-black text-white truncate">{plant.name}</h3>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${rarity.badge}`}>
                              {plant.tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {plant.description}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[11px]">
                            <span className="text-stone-300 font-semibold">
                              ⏱️ {plant.growthTimeSeconds}s growth
                            </span>
                            <span className="text-emerald-400 font-semibold">
                              🪙 Sells for {plant.sellPrice}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Buy or Unlock Buttons */}
                      <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                        <span className="text-xs text-stone-400 font-medium">
                          Owned: <strong className="text-emerald-300">{currentInventory}</strong>
                        </span>

                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`buy-1-${plant.id}`}
                              onClick={() => onBuySeeds(plant.id, 1, plant.buyPrice)}
                              disabled={!canAffordSingle}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-black transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <span>+1</span>
                              <span className="text-[10px] text-amber-200">({plant.buyPrice}🪙)</span>
                            </button>

                            <button
                              id={`buy-5-${plant.id}`}
                              onClick={() => onBuySeeds(plant.id, 5, plant.buyPrice * 5)}
                              disabled={!canAfford5}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <span>+5</span>
                              <span className="text-[10px] text-amber-200">({plant.buyPrice * 5}🪙)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {canAffordUnlock ? (
                              <button
                                id={`unlock-seed-${plant.id}`}
                                onClick={() => onUnlockSeed(plant)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-md"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Unlock Seed</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-800/40">
                                <Lock className="w-3 h-3" />
                                <span>Req: Level {plant.unlockLevel}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Sell Crops Silo */
            <div className="space-y-4">
              {/* Bulk Sell Banner */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-amber-200">Garden Silo Storage</h3>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Total in inventory: <strong>{totalHarvestCount}</strong> crops worth <strong className="text-amber-400">{totalHarvestValue.toLocaleString()} 🪙</strong>
                  </p>
                </div>

                <button
                  id="sell-all-harvest-btn"
                  onClick={onSellAllCrops}
                  disabled={totalHarvestCount === 0}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 disabled:opacity-40 text-white text-xs font-black shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 text-amber-200" />
                  <span>Sell All for {totalHarvestValue.toLocaleString()} 🪙</span>
                </button>
              </div>

              {/* Crops Grid */}
              {totalHarvestCount === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-sm">Your harvest basket is empty!</p>
                  <p className="text-xs mt-1">Water and harvest your crops in the garden to collect produce.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allPlants.map((plant) => {
                    const count = harvestInventory[plant.id] || 0;
                    if (count <= 0) return null;
                    const totalValue = count * plant.sellPrice;

                    return (
                      <div
                        key={plant.id}
                        id={`sell-item-${plant.id}`}
                        className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{plant.icon}</div>
                          <div>
                            <h4 className="text-xs font-black text-white">{plant.name}</h4>
                            <p className="text-[11px] text-stone-400">
                              {count} in basket • {plant.sellPrice}🪙 each
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            id={`sell-1-${plant.id}`}
                            onClick={() => onSellCrop(plant.id, 1, plant.sellPrice)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 text-xs font-black border border-amber-600/30 cursor-pointer"
                          >
                            Sell 1
                          </button>

                          <button
                            id={`sell-all-item-${plant.id}`}
                            onClick={() => onSellCrop(plant.id, count, plant.sellPrice)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black cursor-pointer"
                          >
                            All ({totalValue}🪙)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
