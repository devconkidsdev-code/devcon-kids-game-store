import React from 'react';
import { MarketOrder, PlantDefinition } from '../types';
import { Truck, CheckCircle2, AlertCircle, X, Sparkles, Coins, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarketOrdersProps {
  isOpen: boolean;
  onClose: () => void;
  orders: MarketOrder[];
  allPlants: PlantDefinition[];
  harvestInventory: Record<string, number>;
  onCompleteOrder: (order: MarketOrder) => void;
}

export const MarketOrders: React.FC<MarketOrdersProps> = ({
  isOpen,
  onClose,
  orders,
  allPlants,
  harvestInventory,
  onCompleteOrder,
}) => {
  if (!isOpen) return null;

  const plantsById = allPlants.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, PlantDefinition>);

  const handleFulfill = (order: MarketOrder) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }
    onCompleteOrder(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-800/60 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-amber-950/80 to-emerald-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Town Market Delivery Board
              </h2>
              <p className="text-xs text-amber-300/80">
                Fulfill custom farm orders to earn big coin bonuses, XP, and rare seed packets
              </p>
            </div>
          </div>

          <button
            id="close-orders-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-stone-200">All Town Orders Fulfilled!</p>
              <p className="text-xs mt-1">New customers will arrive shortly with fresh requests.</p>
            </div>
          ) : (
            orders.map((order) => {
              const bonusSeed = order.bonusSeedId ? plantsById[order.bonusSeedId] : null;

              const isFulfillable = order.requirements.every((req) => {
                const owned = harvestInventory[req.cropId] || 0;
                return owned >= req.needed;
              });

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="p-4 rounded-2xl bg-stone-950/60 border border-amber-900/30 hover:border-amber-700/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Customer & Title */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{order.customerAvatar}</span>
                      <div>
                        <div className="text-xs font-black text-white">{order.title}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">{order.customerName}</div>
                      </div>
                    </div>

                    {/* Requirements Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.requirements.map((req) => {
                        const crop = plantsById[req.cropId];
                        const owned = harvestInventory[req.cropId] || 0;
                        const hasEnough = owned >= req.needed;

                        return (
                          <div
                            key={req.cropId}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border ${
                              hasEnough
                                ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                                : 'bg-stone-900 border-stone-800 text-stone-400'
                            }`}
                          >
                            <span>{crop?.icon || '🌱'}</span>
                            <span className="font-bold">{crop?.name}</span>
                            <span className={`font-black ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({owned}/{req.needed})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rewards & Fulfill Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 font-bold text-amber-300">
                        <Coins className="w-3.5 h-3.5" /> +{order.rewardCoins}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-sky-300">
                        <Sparkles className="w-3.5 h-3.5" /> +{order.rewardXp} XP
                      </span>
                      {bonusSeed && (
                        <span className="flex items-center gap-1 font-bold text-fuchsia-300 bg-fuchsia-950/50 px-1.5 py-0.5 rounded-md border border-fuchsia-800/40 text-[10px]">
                          <Gift className="w-3 h-3" /> {bonusSeed.icon}
                        </span>
                      )}
                    </div>

                    <button
                      id={`fulfill-order-btn-${order.id}`}
                      onClick={() => handleFulfill(order)}
                      disabled={!isFulfillable}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 disabled:opacity-40 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fulfill Delivery</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
