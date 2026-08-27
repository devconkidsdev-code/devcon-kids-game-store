import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowUpCircle,
  Plus,
  CheckCircle2,
  Smile,
  Shield,
  Heart,
  Droplet,
  ShoppingBag,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { UserProgress, VillageUpgrade } from '../types/game';
import { VILLAGE_UPGRADES } from '../data/cosmeticsData';
import { BloopAvatar } from './BloopAvatar';
import { CharacterPortrait } from './CharacterPortraits';
import { soundManager } from '../utils/audio';

interface VillageHubProps {
  progress: UserProgress;
  onUpgrade: (upgradeId: string, cost: number) => void;
  onNavigate: (screen: any) => void;
  onSelectLevel: (levelId: number) => void;
}

export const VillageHub: React.FC<VillageHubProps> = ({
  progress,
  onUpgrade,
  onNavigate,
  onSelectLevel,
}) => {
  const [selectedVillager, setSelectedVillager] = useState<{
    speaker: any;
    name: string;
    quote: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'village' | 'upgrades' | 'decorations'>('village');

  const villagerQuotes = [
    {
      speaker: 'moo_moo',
      name: 'Moo-Moo the Cow',
      quote: '“Moooo! I only drink from my designated trough now! Clean water makes the best milk!”',
    },
    {
      speaker: 'prof_croak',
      name: 'Professor Croak',
      quote: '“RIBBIT! The weather station reports a 90% drop in pointless lawn-sprinkling! Extraordinary!”',
    },
    {
      speaker: 'farmer_bramble',
      name: 'Farmer Bramble',
      quote: '“My precision drip emitters are a miracle. The carrots are sweeter than ever!”',
    },
    {
      speaker: 'clucky',
      name: 'Clucky the Chicken',
      quote: '“Bawk! I’ve mastered the 4-minute power shower! My feathers are pristine!”',
    },
    {
      speaker: 'mr_sludge',
      name: 'Mr. Sludge',
      quote: '“Who knew that clean river water would bring so many joyful jumping fish? I’m never polluting again!”',
    },
  ];

  const handleVillagerClick = (v: typeof villagerQuotes[0]) => {
    soundManager.playClick();
    if (v.speaker === 'moo_moo') soundManager.playMoo();
    if (v.speaker === 'prof_croak') soundManager.playCroak();
    setSelectedVillager(v);
  };

  const handleBuyUpgrade = (upg: VillageUpgrade) => {
    if (progress.resources.ecoCoins >= upg.cost) {
      soundManager.playRepair();
      onUpgrade(upg.id, upg.cost);
    } else {
      soundManager.playPanic();
    }
  };

  const waterPercent = (progress.resources.cleanWater / progress.resources.maxCapacity) * 100;
  const villageGreenFactor = Math.min(100, Math.floor(progress.unlockedLevels * 1.1));

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 flex flex-col gap-5">
      {/* Top Village Banner & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-sky-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
              Splashville Town Center
            </span>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full">
              🌿 {villageGreenFactor}% Restored
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">
            Welcome to Splashville, Guardian Bloop!
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('village');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'village'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏘️ Village Square
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('upgrades');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'upgrades'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Infrastructure</span>
          </button>
        </div>
      </div>

      {/* View 1: Village Square Overview */}
      {activeTab === 'village' && (
        <div className="space-y-5">
          {/* Interactive Visual Village Map Stage */}
          <div className="relative w-full aspect-video max-h-[380px] bg-gradient-to-b from-sky-200 via-emerald-100 to-lime-200 rounded-3xl border-4 border-emerald-300 shadow-inner overflow-hidden flex items-center justify-center p-4">
            {/* Background Clouds & Sun */}
            <div className="absolute top-4 left-10 text-3xl opacity-80 animate-pulse">☁️</div>
            <div className="absolute top-6 right-20 text-3xl opacity-80">☁️</div>

            {/* Giant Big Blue Tank */}
            <div className="absolute top-12 left-12 flex flex-col items-center">
              <div className="relative w-20 sm:w-24 h-28 bg-slate-100 rounded-t-3xl border-4 border-sky-400 overflow-hidden shadow-lg">
                {/* Water Level inside tank */}
                <motion.div
                  className="absolute bottom-0 inset-x-0 bg-sky-500"
                  animate={{ height: `${Math.max(5, waterPercent)}%` }}
                  transition={{ duration: 1 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-black text-slate-900 bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
                    {Math.round(progress.resources.cleanWater)}L
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-black text-sky-950 mt-1 bg-white/90 px-2 py-0.5 rounded-full border border-sky-200">
                Big Blue Tank
              </span>
            </div>

            {/* Sparkling Village River */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 opacity-90 border-t-2 border-cyan-300 flex items-center justify-around">
              <span className="text-xl animate-bounce">🐟</span>
              <span className="text-xl">🦆</span>
              <span className="text-xl animate-bounce">🐟</span>
            </div>

            {/* Bloop Guardian in center */}
            <div className="absolute bottom-18 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <BloopAvatar
                expression="happy"
                size={70}
                hat={progress.equippedCosmetics?.hat}
                backpack={progress.equippedCosmetics?.backpack}
                outfit={progress.equippedCosmetics?.outfit}
                accessory={progress.equippedCosmetics?.accessory}
              />
              <span className="text-[10px] font-extrabold text-slate-800 bg-white/90 px-2 py-0.5 rounded-full shadow-xs mt-1">
                Guardian Bloop
              </span>
            </div>

            {/* Clickable Villagers on Map */}
            {/* Moo-Moo */}
            <button
              onClick={() => handleVillagerClick(villagerQuotes[0])}
              className="absolute bottom-20 right-16 flex flex-col items-center cursor-pointer hover:scale-110 transition"
            >
              <CharacterPortrait speaker="moo_moo" size={44} />
              <span className="text-[9px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs mt-0.5">
                Moo-Moo
              </span>
            </button>

            {/* Professor Croak */}
            <button
              onClick={() => handleVillagerClick(villagerQuotes[1])}
              className="absolute top-20 right-12 flex flex-col items-center cursor-pointer hover:scale-110 transition"
            >
              <CharacterPortrait speaker="prof_croak" size={44} />
              <span className="text-[9px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs mt-0.5">
                Prof. Croak
              </span>
            </button>

            {/* Farmer Bramble */}
            <button
              onClick={() => handleVillagerClick(villagerQuotes[2])}
              className="absolute bottom-20 left-28 flex flex-col items-center cursor-pointer hover:scale-110 transition"
            >
              <CharacterPortrait speaker="farmer_bramble" size={44} />
              <span className="text-[9px] font-bold text-slate-800 bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs mt-0.5">
                Farmer Bramble
              </span>
            </button>

            {/* Hint overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-slate-700 border border-slate-200">
              💡 Tap any villager to chat with them!
            </div>
          </div>

          {/* Villager Dialogue Bubble if active */}
          <AnimatePresence>
            {selectedVillager && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 bg-sky-900 text-white rounded-2xl shadow-lg flex items-start justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <CharacterPortrait speaker={selectedVillager.speaker} size={48} />
                  <div>
                    <span className="text-xs font-black text-amber-300">
                      {selectedVillager.name}
                    </span>
                    <p className="text-xs sm:text-sm italic text-sky-100 mt-0.5">
                      {selectedVillager.quote}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVillager(null)}
                  className="text-xs text-sky-300 hover:text-white px-2 py-1 bg-sky-800 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Level Launcher Banner */}
          <div className="p-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-sky-200">
                Ready for the next conservation mission?
              </span>
              <h3 className="text-base sm:text-lg font-black">
                Level {progress.currentLevel}: Next Challenge
              </h3>
            </div>
            <button
              onClick={() => onSelectLevel(progress.currentLevel)}
              className="px-6 py-3 bg-white text-sky-900 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:bg-sky-50 transition cursor-pointer hover:scale-105"
            >
              Play Level {progress.currentLevel} →
            </button>
          </div>
        </div>
      )}

      {/* View 2: Upgrades & Infrastructure */}
      {activeTab === 'upgrades' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {VILLAGE_UPGRADES.map((upg) => {
              const currentLvl = progress.upgrades[upg.id] || 0;
              const isMax = currentLvl >= upg.maxLevel;
              const canAfford = progress.resources.ecoCoins >= upg.cost;

              return (
                <div
                  key={upg.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-50 rounded-xl border border-slate-100">
                        {upg.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{upg.name}</h4>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          {upg.waterBenefit}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      Lvl {currentLvl} / {upg.maxLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 my-2.5">{upg.desc}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                      <span>🪙</span>
                      <span>{upg.cost} Coins</span>
                    </span>

                    {isMax ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Max Level
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyUpgrade(upg)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
