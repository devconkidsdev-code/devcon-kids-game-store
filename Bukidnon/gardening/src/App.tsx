import React, { useState, useEffect, useRef } from 'react';
import { 
  SoilPlot, 
  ToolType, 
  WeatherType, 
  PlantDefinition, 
  MarketOrder, 
  GameStats 
} from './types';
import { 
  PLANTS, 
  INITIAL_PLOTS_COUNT, 
  MAX_PLOTS_COUNT, 
  PLOT_UNLOCK_CONFIGS, 
  INITIAL_ORDERS,
  getXpForLevel 
} from './data/plants';
import { soundManager } from './utils/audio';
import { GardenHeader } from './components/GardenHeader';
import { GardenGrid } from './components/GardenGrid';
import { ToolBar } from './components/ToolBar';
import { SeedShop } from './components/SeedShop';
import { ExoticLab } from './components/ExoticLab';
import { MarketOrders } from './components/MarketOrders';
import { Compendium } from './components/Compendium';
import { UpgradesModal } from './components/UpgradesModal';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'gardening_game_save_v1';

export default function App() {
  // --- STATE ---
  const [coins, setCoins] = useState<number>(50);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Selected tool & seed
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedSeedId, setSelectedSeedId] = useState<string>('sweet_carrot');

  // Inventories
  const [seedsInventory, setSeedsInventory] = useState<Record<string, number>>({
    sweet_carrot: 5,
    golden_wheat: 3,
  });
  const [harvestInventory, setHarvestInventory] = useState<Record<string, number>>({});
  const [unlockedSeedIds, setUnlockedSeedIds] = useState<string[]>([
    'sweet_carrot',
    'golden_wheat',
  ]);

  // Plots
  const [plots, setPlots] = useState<SoilPlot[]>(() => {
    return PLOT_UNLOCK_CONFIGS.map((cfg) => ({
      id: cfg.id,
      unlocked: cfg.id < INITIAL_PLOTS_COUNT,
      unlockCost: cfg.cost,
      unlockLevel: cfg.level,
      plantId: null,
      plantedAt: null,
      growthProgress: 0,
      growthStage: 0,
      waterLevel: 80,
      lastWateredAt: null,
      fertilized: false,
    }));
  });

  // Upgrades
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});

  // Market Orders
  const [orders, setOrders] = useState<MarketOrder[]>(INITIAL_ORDERS);

  // Weather
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [weatherTimeRemaining, setWeatherTimeRemaining] = useState<number>(45);

  // Modals
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isLabOpen, setIsLabOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState<boolean>(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    totalHarvests: 0,
    totalCoinsEarned: 50,
    totalWaterings: 0,
    exoticSeedsUnlocked: 0,
    discoveredCropIds: ['sweet_carrot', 'golden_wheat'],
    harvestCountsByCrop: {},
    timePlayedSeconds: 0,
  });

  // Toast / notification banner
  const [notification, setNotification] = useState<{ text: string; icon: string } | null>(null);

  const plantsById = React.useMemo(() => {
    return PLANTS.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, PlantDefinition>);
  }, []);

  const unlockedPlants = React.useMemo(() => {
    return PLANTS.filter((p) => unlockedSeedIds.includes(p.id));
  }, [unlockedSeedIds]);

  const selectedSeed = plantsById[selectedSeedId] || null;

  // --- PERSISTENCE LOAD ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.coins !== undefined) setCoins(data.coins);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.level !== undefined) setLevel(data.level);
        if (data.seedsInventory) setSeedsInventory(data.seedsInventory);
        if (data.harvestInventory) setHarvestInventory(data.harvestInventory);
        if (data.unlockedSeedIds) setUnlockedSeedIds(data.unlockedSeedIds);
        if (data.plots) setPlots(data.plots);
        if (data.upgrades) setUpgrades(data.upgrades);
        if (data.orders) setOrders(data.orders);
        if (data.stats) setStats(data.stats);
        if (data.soundEnabled !== undefined) {
          setSoundEnabled(data.soundEnabled);
          soundManager.setEnabled(data.soundEnabled);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // --- PERSISTENCE SAVE ---
  useEffect(() => {
    const saveData = {
      coins,
      xp,
      level,
      seedsInventory,
      harvestInventory,
      unlockedSeedIds,
      plots,
      upgrades,
      orders,
      stats,
      soundEnabled,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch {
      // ignore
    }
  }, [coins, xp, level, seedsInventory, harvestInventory, unlockedSeedIds, plots, upgrades, orders, stats, soundEnabled]);

  // --- LEVEL UP CHECK ---
  const currentXpRequirement = getXpForLevel(level);

  const addXp = (amount: number) => {
    setXp((prevXp) => {
      const nextXp = prevXp + amount;
      if (nextXp >= currentXpRequirement) {
        // Level up!
        setLevel((prevLvl) => {
          const newLevel = prevLvl + 1;
          soundManager.playLevelUpSound();
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
            });
          } catch {}

          // Check if any plants unlock at this new level
          const newlyUnlocked = PLANTS.filter(
            (p) => p.unlockLevel <= newLevel && !unlockedSeedIds.includes(p.id)
          );
          if (newlyUnlocked.length > 0) {
            setUnlockedSeedIds((prev) => [...prev, ...newlyUnlocked.map((p) => p.id)]);
            showNotification(`Level Up! Level ${newLevel}! Unlocked ${newlyUnlocked.map(p => p.name).join(', ')}`, '🎉');
          } else {
            showNotification(`Level Up! Reached Level ${newLevel}!`, '⭐');
          }
          return newLevel;
        });
        return nextXp - currentXpRequirement;
      }
      return nextXp;
    });
  };

  const showNotification = (text: string, icon: string = '✨') => {
    setNotification({ text, icon });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- MAIN GAME TICK LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Weather timer
      setWeatherTimeRemaining((prev) => {
        if (prev <= 1) {
          // cycle weather
          const weathers: WeatherType[] = ['sunny', 'rainy', 'golden_hour', 'starlight'];
          const nextWeather = weathers[(weathers.indexOf(weather) + 1) % weathers.length];
          setWeather(nextWeather);
          showNotification(`Weather changed to ${nextWeather.replace('_', ' ')}!`, '🌤️');
          return 45;
        }
        return prev - 1;
      });

      // 2. Automated Sprinklers check
      const hasSprinklers = (upgrades['sprinkler_system'] || 0) > 0;
      const isRain = weather === 'rainy';

      // 3. Update Plots
      setPlots((prevPlots) => {
        return prevPlots.map((plot) => {
          if (!plot.unlocked || !plot.plantId) return plot;

          const plant = plantsById[plot.plantId];
          if (!plant) return plot;

          // Water drain or auto hydration
          let nextWater = plot.waterLevel;
          if (isRain) {
            nextWater = Math.min(100, nextWater + 15);
          } else if (hasSprinklers) {
            nextWater = Math.min(100, nextWater + 8);
          } else {
            // Drain rate (slower with golden watering can upgrade)
            const canMod = (upgrades['golden_watering_can'] || 0) > 0 ? 0.6 : 1.0;
            const drainPerTick = (100 / plant.waterDrainRate) * 0.25 * canMod;
            nextWater = Math.max(0, nextWater - drainPerTick);
          }

          // Growth step
          if (plot.growthStage === 4) {
            // Fully grown
            return { ...plot, waterLevel: nextWater };
          }

          if (nextWater <= 0) {
            // Plant halts growth when dry
            return { ...plot, waterLevel: 0 };
          }

          // Growth speed multipliers
          let speedMultiplier = 1.0;
          if (plot.fertilized) {
            const hasStardust = (upgrades['stardust_fertilizer'] || 0) > 0;
            speedMultiplier *= hasStardust ? 2.5 : 2.0;
          }
          if (weather === 'starlight' && (plant.tier === 'exotic' || plant.tier === 'legendary')) {
            speedMultiplier *= 1.5;
          }

          const progressIncrement = (100 / plant.growthTimeSeconds) * speedMultiplier;
          const nextProgress = Math.min(100, plot.growthProgress + progressIncrement);

          let nextStage: 0 | 1 | 2 | 3 | 4 = plot.growthStage;
          if (nextProgress >= 100) nextStage = 4;
          else if (nextProgress >= 70) nextStage = 3;
          else if (nextProgress >= 30) nextStage = 2;
          else nextStage = 1;

          return {
            ...plot,
            waterLevel: nextWater,
            growthProgress: nextProgress,
            growthStage: nextStage,
          };
        });
      });

      // Update total playtime
      setStats((prev) => ({ ...prev, timePlayedSeconds: prev.timePlayedSeconds + 1 }));
    }, 1000);

    return () => clearInterval(interval);
  }, [weather, upgrades, plantsById]);

  // --- ACTIONS ---

  // Water plot
  const handleWaterPlot = (plotId: number) => {
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId && p.unlocked) {
          soundManager.playWaterSound();
          setStats((s) => ({ ...s, totalWaterings: s.totalWaterings + 1 }));
          return { ...p, waterLevel: 100, lastWateredAt: Date.now() };
        }
        return p;
      })
    );
  };

  // Plant seed in plot
  const handlePlantSeedInPlot = (plotId: number, plant: PlantDefinition) => {
    const currentCount = seedsInventory[plant.id] || 0;
    if (currentCount <= 0) {
      showNotification(`No ${plant.name} seeds left! Open Shop to buy more.`, '⚠️');
      return;
    }

    setSeedsInventory((prev) => ({
      ...prev,
      [plant.id]: Math.max(0, (prev[plant.id] || 0) - 1),
    }));

    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId && p.unlocked && !p.plantId) {
          soundManager.playPlantSound();
          return {
            ...p,
            plantId: plant.id,
            plantedAt: Date.now(),
            growthProgress: 0,
            growthStage: 1,
            waterLevel: Math.max(p.waterLevel, 60),
            fertilized: false,
          };
        }
        return p;
      })
    );
  };

  // Fertilize plot
  const handleFertilizePlot = (plotId: number) => {
    const cost = 5;
    if (coins < cost) {
      showNotification('Need 5 coins for organic fertilizer!', '⚠️');
      return;
    }

    setCoins((c) => Math.max(0, c - cost));
    soundManager.playFertilizeSound();

    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId && p.unlocked && p.plantId && !p.fertilized) {
          return { ...p, fertilized: true };
        }
        return p;
      })
    );
    showNotification('Plot fertilized! 2x growth speed.', '⚡');
  };

  // Harvest ripe plot
  const handleHarvestPlot = (plotId: number) => {
    const plot = plots.find((p) => p.id === plotId);
    if (!plot || !plot.plantId || plot.growthStage !== 4) return;

    const plant = plantsById[plot.plantId];
    if (!plant) return;

    const isExotic = plant.tier === 'exotic' || plant.tier === 'legendary';
    soundManager.playHarvestSound(isExotic);

    // Weather bonus (golden hour gives +25%)
    let coinReward = plant.sellPrice;
    if (weather === 'golden_hour') {
      coinReward = Math.round(coinReward * 1.25);
    }
    // Upgrade bonus (master scythe gives +15%)
    if ((upgrades['master_scythe'] || 0) > 0) {
      coinReward = Math.round(coinReward * 1.15);
    }

    // Add produce to harvest silo
    setHarvestInventory((prev) => ({
      ...prev,
      [plant.id]: (prev[plant.id] || 0) + 1,
    }));

    // Chance to discover exotic seed mutation drop!
    if (plant.mutationPossibility && Math.random() < plant.mutationPossibility.chance) {
      const dropPlant = plantsById[plant.mutationPossibility.resultCropId];
      if (dropPlant && !unlockedSeedIds.includes(dropPlant.id)) {
        setUnlockedSeedIds((prev) => [...prev, dropPlant.id]);
        setSeedsInventory((prev) => ({ ...prev, [dropPlant.id]: (prev[dropPlant.id] || 0) + 2 }));
        soundManager.playExoticUnlockSound();
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
        showNotification(`Botanical Mutation! Discovered Exotic ${dropPlant.name}!`, dropPlant.icon);
      }
    }

    // Seed drop return (1-2 seeds)
    const seedDropCount = Math.random() > 0.4 ? 2 : 1;
    setSeedsInventory((prev) => ({
      ...prev,
      [plant.id]: (prev[plant.id] || 0) + seedDropCount,
    }));

    // Add XP
    addXp(plant.xpReward);

    // Update Stats
    setStats((prev) => {
      const currentCropHarvests = (prev.harvestCountsByCrop[plant.id] || 0) + 1;
      return {
        ...prev,
        totalHarvests: prev.totalHarvests + 1,
        harvestCountsByCrop: {
          ...prev.harvestCountsByCrop,
          [plant.id]: currentCropHarvests,
        },
      };
    });

    // Reset plot
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId) {
          return {
            ...p,
            plantId: null,
            plantedAt: null,
            growthProgress: 0,
            growthStage: 0,
            fertilized: false,
          };
        }
        return p;
      })
    );
  };

  // Clear plot
  const handleClearPlot = (plotId: number) => {
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId && p.unlocked) {
          return {
            ...p,
            plantId: null,
            plantedAt: null,
            growthProgress: 0,
            growthStage: 0,
            fertilized: false,
          };
        }
        return p;
      })
    );
  };

  // Smart plot click
  const handlePlotClick = (plot: SoilPlot) => {
    if (!plot.unlocked) {
      handleUnlockPlot(plot);
      return;
    }

    if (selectedTool === 'water') {
      handleWaterPlot(plot.id);
    } else if (selectedTool === 'plant') {
      if (!plot.plantId && selectedSeed) {
        handlePlantSeedInPlot(plot.id, selectedSeed);
      }
    } else if (selectedTool === 'fertilize') {
      handleFertilizePlot(plot.id);
    } else if (selectedTool === 'harvest') {
      if (plot.growthStage === 4) {
        handleHarvestPlot(plot.id);
      }
    } else if (selectedTool === 'clear') {
      handleClearPlot(plot.id);
    } else {
      // 'select' smart auto mode
      if (plot.growthStage === 4) {
        handleHarvestPlot(plot.id);
      } else if (!plot.plantId && selectedSeed) {
        handlePlantSeedInPlot(plot.id, selectedSeed);
      } else if (plot.plantId && plot.waterLevel <= 50) {
        handleWaterPlot(plot.id);
      } else if (plot.plantId && !plot.fertilized) {
        handleFertilizePlot(plot.id);
      }
    }
  };

  // Bulk actions
  const handleWaterAll = () => {
    soundManager.playWaterSound();
    setPlots((prev) =>
      prev.map((p) => (p.unlocked ? { ...p, waterLevel: 100, lastWateredAt: Date.now() } : p))
    );
    showNotification('All plots fully watered!', '💧');
  };

  const handleHarvestAll = () => {
    const readyPlots = plots.filter((p) => p.unlocked && p.plantId && p.growthStage === 4);
    if (readyPlots.length === 0) return;

    readyPlots.forEach((p) => {
      handleHarvestPlot(p.id);
    });
    showNotification(`Harvested ${readyPlots.length} ripe crops!`, '🌾');
  };

  const handlePlantAll = () => {
    if (!selectedSeed) return;
    const count = seedsInventory[selectedSeed.id] || 0;
    if (count <= 0) {
      showNotification(`No ${selectedSeed.name} seeds available. Buy more at the shop.`, '⚠️');
      return;
    }

    const emptyPlots = plots.filter((p) => p.unlocked && !p.plantId);
    const toPlantCount = Math.min(emptyPlots.length, count);

    if (toPlantCount === 0) return;

    soundManager.playPlantSound();
    setSeedsInventory((prev) => ({
      ...prev,
      [selectedSeed.id]: prev[selectedSeed.id] - toPlantCount,
    }));

    let planted = 0;
    setPlots((prev) =>
      prev.map((p) => {
        if (p.unlocked && !p.plantId && planted < toPlantCount) {
          planted++;
          return {
            ...p,
            plantId: selectedSeed.id,
            plantedAt: Date.now(),
            growthProgress: 0,
            growthStage: 1,
            waterLevel: Math.max(p.waterLevel, 60),
            fertilized: false,
          };
        }
        return p;
      })
    );
    showNotification(`Planted ${toPlantCount} ${selectedSeed.name} seeds!`, selectedSeed.icon);
  };

  // Unlock new soil plot
  const handleUnlockPlot = (plot: SoilPlot) => {
    if (coins < plot.unlockCost) {
      showNotification(`Need ${plot.unlockCost} coins to unlock Plot #${plot.id + 1}!`, '🪙');
      return;
    }
    if (level < plot.unlockLevel) {
      showNotification(`Reach Level ${plot.unlockLevel} to unlock this plot!`, '🔒');
      return;
    }

    setCoins((c) => c - plot.unlockCost);
    soundManager.playCoinSound();
    setPlots((prev) =>
      prev.map((p) => (p.id === plot.id ? { ...p, unlocked: true, waterLevel: 80 } : p))
    );
    showNotification(`Plot #${plot.id + 1} unlocked!`, '🌱');
  };

  // Buy seeds from shop
  const handleBuySeeds = (plantId: string, count: number, totalCost: number) => {
    if (coins < totalCost) {
      showNotification('Not enough coins!', '🪙');
      return;
    }

    setCoins((c) => c - totalCost);
    setSeedsInventory((prev) => ({
      ...prev,
      [plantId]: (prev[plantId] || 0) + count,
    }));
    soundManager.playCoinSound();
    const plant = plantsById[plantId];
    showNotification(`Purchased +${count} ${plant?.name} seeds!`, plant?.icon || '🌱');
  };

  // Unlock seed in shop
  const handleUnlockSeed = (plant: PlantDefinition) => {
    if (unlockedSeedIds.includes(plant.id)) return;
    if (level < plant.unlockLevel) {
      showNotification(`Requires Level ${plant.unlockLevel}!`, '🔒');
      return;
    }

    setUnlockedSeedIds((prev) => [...prev, plant.id]);
    setSeedsInventory((prev) => ({ ...prev, [plant.id]: (prev[plant.id] || 0) + 3 }));
    soundManager.playExoticUnlockSound();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
    showNotification(`Unlocked ${plant.name}! (+3 bonus seeds)`, plant.icon);
  };

  // Sell crops from Silo
  const handleSellCrop = (plantId: string, count: number, pricePerUnit: number) => {
    const owned = harvestInventory[plantId] || 0;
    const toSell = Math.min(owned, count);
    if (toSell <= 0) return;

    const totalEarned = toSell * pricePerUnit;
    setHarvestInventory((prev) => ({
      ...prev,
      [plantId]: Math.max(0, (prev[plantId] || 0) - toSell),
    }));
    setCoins((c) => c + totalEarned);
    soundManager.playCoinSound();
    showNotification(`Sold ${toSell} crops for +${totalEarned} coins!`, '🪙');
  };

  // Sell all crops
  const handleSellAllCrops = () => {
    let totalEarned = 0;
    let totalCount = 0;

    Object.entries(harvestInventory).forEach(([cropId, count]) => {
      const numCount = Number(count) || 0;
      const plant = plantsById[cropId];
      if (plant && numCount > 0) {
        totalEarned += numCount * plant.sellPrice;
        totalCount += numCount;
      }
    });

    if (totalCount === 0) return;

    setHarvestInventory({});
    setCoins((c) => c + totalEarned);
    soundManager.playCoinSound();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
    showNotification(`Sold all ${totalCount} crops for +${totalEarned} coins!`, '💰');
  };

  // Exotic Lab synthesis
  const handleSynthesizeExotic = (
    targetPlant: PlantDefinition,
    consumed: { crop1Id: string; crop2Id: string }
  ) => {
    soundManager.playExoticUnlockSound();

    // Consume parent crops
    setHarvestInventory((prev) => ({
      ...prev,
      [consumed.crop1Id]: Math.max(0, (prev[consumed.crop1Id] || 0) - 2),
      [consumed.crop2Id]: Math.max(0, (prev[consumed.crop2Id] || 0) - 2),
    }));

    // Unlock seed
    if (!unlockedSeedIds.includes(targetPlant.id)) {
      setUnlockedSeedIds((prev) => [...prev, targetPlant.id]);
    }
    setSeedsInventory((prev) => ({
      ...prev,
      [targetPlant.id]: (prev[targetPlant.id] || 0) + 3,
    }));

    addXp(targetPlant.xpReward * 2);
    showNotification(`Exotic Synthesis Complete! Unlocked ${targetPlant.name}!`, targetPlant.icon);
  };

  // Complete market order
  const handleCompleteOrder = (order: MarketOrder) => {
    // Consume requirements
    setHarvestInventory((prev) => {
      const updated = { ...prev };
      order.requirements.forEach((req) => {
        updated[req.cropId] = Math.max(0, (updated[req.cropId] || 0) - req.needed);
      });
      return updated;
    });

    // Rewards
    setCoins((c) => c + order.rewardCoins);
    addXp(order.rewardXp);
    soundManager.playCoinSound();

    if (order.bonusSeedId) {
      const bonusPlant = plantsById[order.bonusSeedId];
      if (bonusPlant) {
        if (!unlockedSeedIds.includes(bonusPlant.id)) {
          setUnlockedSeedIds((prev) => [...prev, bonusPlant.id]);
        }
        setSeedsInventory((prev) => ({
          ...prev,
          [bonusPlant.id]: (prev[bonusPlant.id] || 0) + 3,
        }));
        showNotification(`Order Fulfilled! Earned +${order.rewardCoins}🪙 and +3 ${bonusPlant.name} seeds!`, '🎁');
      }
    } else {
      showNotification(`Order Fulfilled! +${order.rewardCoins}🪙 +${order.rewardXp}XP!`, '📦');
    }

    // Refresh orders list with new random customer
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
  };

  // Buy tool upgrade
  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if (coins < cost) {
      showNotification('Not enough coins for this upgrade!', '🪙');
      return;
    }

    setCoins((c) => c - cost);
    setUpgrades((prev) => ({ ...prev, [upgradeId]: (prev[upgradeId] || 0) + 1 }));
    soundManager.playCoinSound();
    showNotification('Workshop Upgrade Installed!', '🔧');
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  // Weather cycle
  const handleCycleWeather = () => {
    const weathers: WeatherType[] = ['sunny', 'rainy', 'golden_hour', 'starlight'];
    const nextWeather = weathers[(weathers.indexOf(weather) + 1) % weathers.length];
    setWeather(nextWeather);
    setWeatherTimeRemaining(45);
    showNotification(`Summoned ${nextWeather.replace('_', ' ')}!`, '✨');
  };

  // Reset Game
  const handleResetGame = () => {
    if (window.confirm('Reset your garden progress and start fresh with beginner seeds?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Header */}
      <GardenHeader
        coins={coins}
        xp={xp}
        level={level}
        xpForNextLevel={currentXpRequirement}
        xpCurrentLevelProgress={xp}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenLab={() => setIsLabOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenCompendium={() => setIsCompendiumOpen(true)}
        onOpenUpgrades={() => setIsUpgradesOpen(true)}
        onResetGame={handleResetGame}
        weather={weather}
        weatherTimeRemaining={weatherTimeRemaining}
        onCycleWeather={handleCycleWeather}
        activeOrdersCount={orders.length}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-emerald-900/90 text-white border border-emerald-400/40 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs sm:text-sm font-black">
            <span className="text-lg">{notification.icon}</span>
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Main Garden Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-5">
        {/* Garden Plots Grid */}
        <GardenGrid
          plots={plots}
          plantsById={plantsById}
          selectedTool={selectedTool}
          selectedSeed={selectedSeed}
          selectedSeedCount={selectedSeed ? (seedsInventory[selectedSeed.id] || 0) : 0}
          currentWeather={weather}
          playerCoins={coins}
          playerLevel={level}
          onPlotClick={handlePlotClick}
          onUnlockPlot={handleUnlockPlot}
          onWaterAll={handleWaterAll}
          onHarvestAll={handleHarvestAll}
          onPlantAll={handlePlantAll}
        />

        {/* Tools & Seed Pouch Bar */}
        <ToolBar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          seedsInventory={seedsInventory}
          unlockedSeeds={unlockedPlants}
          selectedSeedId={selectedSeedId}
          onSelectSeed={setSelectedSeedId}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenLab={() => setIsLabOpen(true)}
        />
      </main>

      {/* Modals */}
      <SeedShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        allPlants={PLANTS}
        unlockedSeedIds={unlockedSeedIds}
        seedsInventory={seedsInventory}
        harvestInventory={harvestInventory}
        playerCoins={coins}
        playerLevel={level}
        onBuySeeds={handleBuySeeds}
        onUnlockSeed={handleUnlockSeed}
        onSellCrop={handleSellCrop}
        onSellAllCrops={handleSellAllCrops}
      />

      <ExoticLab
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        allPlants={PLANTS}
        harvestInventory={harvestInventory}
        unlockedSeedIds={unlockedSeedIds}
        onSynthesizeExotic={handleSynthesizeExotic}
      />

      <MarketOrders
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        allPlants={PLANTS}
        harvestInventory={harvestInventory}
        onCompleteOrder={handleCompleteOrder}
      />

      <Compendium
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
        allPlants={PLANTS}
        unlockedSeedIds={unlockedSeedIds}
        stats={stats}
      />

      <UpgradesModal
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        playerCoins={coins}
        playerLevel={level}
        unlockedUpgrades={upgrades}
        onBuyUpgrade={handleBuyUpgrade}
      />
    </div>
  );
}
