import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, X, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { ALL_COSMETICS } from '../data/cosmeticsData';
import { BloopAvatar } from './BloopAvatar';
import { soundManager } from '../utils/audio';

interface WardrobeModalProps {
  ecoCoins: number;
  unlockedCosmetics: string[];
  equippedCosmetics: {
    hat?: string;
    backpack?: string;
    outfit?: string;
    accessory?: string;
  };
  onBuyCosmetic: (cosmeticId: string, cost: number) => void;
  onEquipCosmetic: (type: 'hat' | 'backpack' | 'outfit' | 'accessory', id: string) => void;
  onClose: () => void;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  ecoCoins,
  unlockedCosmetics,
  equippedCosmetics,
  onBuyCosmetic,
  onEquipCosmetic,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<'hat' | 'backpack' | 'outfit' | 'accessory'>('hat');

  const filteredCosmetics = ALL_COSMETICS.filter((c) => c.type === selectedType);

  const handleItemAction = (item: typeof ALL_COSMETICS[0]) => {
    const isUnlocked = unlockedCosmetics.includes(item.id);

    if (isUnlocked) {
      soundManager.playPop();
      onEquipCosmetic(item.type, item.id);
    } else {
      if (ecoCoins >= item.cost) {
        soundManager.playCoin();
        onBuyCosmetic(item.id, item.cost);
      } else {
        soundManager.playPanic();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Bloop’s Guardian Wardrobe & Boutique
              </h2>
              <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                <span>🪙</span>
                <span>{ecoCoins} Eco-Coins Available</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bloop Live Fitting Preview */}
        <div className="my-4 p-4 bg-gradient-to-b from-sky-100 via-sky-50 to-white rounded-2xl border border-sky-100 flex items-center justify-center gap-6">
          <BloopAvatar
            expression="happy"
            size={90}
            hat={equippedCosmetics.hat}
            backpack={equippedCosmetics.backpack}
            outfit={equippedCosmetics.outfit}
            accessory={equippedCosmetics.accessory}
          />
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-sky-600 tracking-wider">
              Current Outfit
            </span>
            <h3 className="text-sm font-black text-slate-800">Custom Guardian Bloop</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Equip your unlocked cosmetics to personalize Bloop’s look!
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          {(['hat', 'backpack', 'outfit', 'accessory'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                soundManager.playClick();
                setSelectedType(type);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition cursor-pointer ${
                selectedType === type
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}s
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 max-h-[300px] overflow-y-auto pr-1">
          {filteredCosmetics.map((item) => {
            const isUnlocked = unlockedCosmetics.includes(item.id);
            const isEquipped = equippedCosmetics[item.type] === item.id;
            const canAfford = ecoCoins >= item.cost;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  isEquipped
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                    : isUnlocked
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {item.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">{item.description}</p>
                  </div>
                </div>

                <div>
                  {isEquipped ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                      Equipped
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleItemAction(item)}
                      className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Wear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleItemAction(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>🪙</span>
                      <span>{item.cost}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
