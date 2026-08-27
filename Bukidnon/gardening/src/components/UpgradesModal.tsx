import React from 'react';
import { X, Wrench, CheckCircle2, Lock, Droplets, Zap, Sparkles, Sprout } from 'lucide-react';

interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: number;
  unlockLevel: number;
  category: string;
}

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCoins: number;
  playerLevel: number;
  unlockedUpgrades: Record<string, number>;
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
}

export const UPGRADES_LIST: UpgradeItem[] = [
  {
    id: 'sprinkler_system',
    name: 'Automatic Rain Sprinklers',
    description: 'Continuously hydrates all garden plots automatically every 10 seconds.',
    icon: <Droplets className="w-5 h-5 text-sky-400" />,
    cost: 250,
    unlockLevel: 3,
    category: 'Automation',
  },
  {
    id: 'golden_watering_can',
    name: 'Gilded Watering Can',
    description: 'Watering lasts 2x longer before soil dries out, and plots stay moist longer.',
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    cost: 450,
    unlockLevel: 4,
    category: 'Tools',
  },
  {
    id: 'stardust_fertilizer',
    name: 'Stardust Fertilizer Infusion',
    description: 'Fertilizer gives a 2.5x growth speed multiplier and +10% exotic mutation boost.',
    icon: <Zap className="w-5 h-5 text-fuchsia-400" />,
    cost: 750,
    unlockLevel: 6,
    category: 'Chemistry',
  },
  {
    id: 'master_scythe',
    name: 'Master Harvester Scythe',
    description: 'Harvesting crops grants +15% extra bonus coins on every harvest.',
    icon: <Sprout className="w-5 h-5 text-emerald-400" />,
    cost: 1200,
    unlockLevel: 8,
    category: 'Equipment',
  },
];

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  isOpen,
  onClose,
  playerCoins,
  playerLevel,
  unlockedUpgrades,
  onBuyUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-sky-800/60 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-sky-950/80 to-emerald-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Garden Workshop & Upgrades
              </h2>
              <p className="text-xs text-sky-300/80">
                Enhance your tools, automate hydration, and boost growth yields
              </p>
            </div>
          </div>

          <button
            id="close-upgrades-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Upgrades */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {UPGRADES_LIST.map((upgrade) => {
            const isOwned = (unlockedUpgrades[upgrade.id] || 0) > 0;
            const canAfford = playerCoins >= upgrade.cost;
            const meetsLevel = playerLevel >= upgrade.unlockLevel;

            return (
              <div
                key={upgrade.id}
                id={`upgrade-item-${upgrade.id}`}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isOwned
                    ? 'bg-emerald-950/30 border-emerald-600/40'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-700/60 flex items-center justify-center shrink-0">
                    {upgrade.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{upgrade.name}</h3>
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                        {upgrade.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">{upgrade.description}</p>
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      Unlocked at Level {upgrade.unlockLevel}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isOwned ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 rounded-xl text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Installed</span>
                    </div>
                  ) : meetsLevel ? (
                    <button
                      id={`buy-upgrade-btn-${upgrade.id}`}
                      onClick={() => onBuyUpgrade(upgrade.id, upgrade.cost)}
                      disabled={!canAfford}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 disabled:opacity-40 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      Buy for {upgrade.cost} 🪙
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-stone-400 rounded-xl text-xs font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lvl {upgrade.unlockLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
