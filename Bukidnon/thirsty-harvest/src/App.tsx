import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CROPS } from './data/crops';
import { LEVELS } from './data/levels';
import {
  CropId,
  FarmerState,
  GameScreen,
  LevelConfig,
  LevelProgress,
  Particle,
  PlotData,
  Upgrades,
} from './types';
import { soundFx } from './utils/audio';
import { FarmerSprite } from './components/FarmerSprite';
import { PlantPlot } from './components/PlantPlot';
import { WaterWell } from './components/WaterWell';
import { GardenHUD } from './components/GardenHUD';
import { TouchControls } from './components/TouchControls';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ShopModal } from './components/ShopModal';
import { GameOverModal } from './components/GameOverModal';
import { StartScreen } from './components/StartScreen';
import { FloatingParticles } from './components/FloatingParticles';

const STORAGE_KEY_PROGRESS = 'garden_farmer_level_progress_v1';
const STORAGE_KEY_UPGRADES = 'garden_farmer_upgrades_v1';
const STORAGE_KEY_COINS = 'garden_farmer_coins_v1';

export default function App() {
  // --- Persistent Storage State ---
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COINS);
    return saved ? parseInt(saved, 10) : 50;
  });

  const [upgrades, setUpgrades] = useState<Upgrades>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_UPGRADES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      canCapacityLevel: 0, // 10 water base
      speedLevel: 0,
      fertilizerLevel: 0,
      wellPumpLevel: 0,
      sprinklerPowerups: 0,
      rainCloudPowerups: 1, // give 1 free booster
    };
  });

  const [progressList, setProgressList] = useState<LevelProgress[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return LEVELS.map((lvl) => ({
      level: lvl.levelNumber,
      unlocked: lvl.levelNumber === 1,
      stars: 0,
      highScore: 0,
      completed: false,
    }));
  });

  // --- Active Game Session State ---
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [screen, setScreen] = useState<GameScreen>('start');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);

  // Level Gameplay
  const levelConfig: LevelConfig = LEVELS[currentLevelNumber - 1] || LEVELS[0];
  const maxWaterCapacity = 10 + upgrades.canCapacityLevel * 5;

  const [plots, setPlots] = useState<PlotData[]>([]);
  const [harvestCount, setHarvestCount] = useState<number>(0);
  const [deadCount, setDeadCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(levelConfig.timeLimitSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{
    isVictory: boolean;
    reason?: 'harvest_goal' | 'too_many_dead' | 'time_out';
    stars: number;
    coinsEarned: number;
  }>({
    isVictory: false,
    stars: 0,
    coinsEarned: 0,
  });

  // Farmer State
  const [farmer, setFarmer] = useState<FarmerState>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    facing: 'down',
    isWatering: false,
    isWalking: false,
    waterLevel: maxWaterCapacity,
    maxWater: maxWaterCapacity,
    moveSpeed: 3.5,
    waterRange: 1.5,
    splashRadius: 1,
  });

  const [farmerPlotIndex, setFarmerPlotIndex] = useState<number | null>(null);
  const [isNearWell, setIsNearWell] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Refs for animation loop & keys
  const containerRef = useRef<HTMLDivElement | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const lastTickTime = useRef<number>(Date.now());
  const particleIdCounter = useRef<number>(0);
  const lastWarningSoundTime = useRef<number>(0);

  // --- Save to LocalStorage ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressList));
  }, [progressList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COINS, coins.toString());
  }, [coins]);

  // --- Spawn Floating Particle helper ---
  const addParticle = useCallback((x: number, y: number, text: string, color = '#38bdf8') => {
    particleIdCounter.current += 1;
    const newP: Particle = {
      id: particleIdCounter.current,
      x,
      y,
      vx: (Math.random() - 0.5) * 40,
      vy: -60 - Math.random() * 40,
      color,
      size: 14,
      alpha: 1,
      life: 0,
      maxLife: 1.2,
      text,
    };
    setParticles((prev) => [...prev.slice(-25), newP]);
  }, []);

  // --- Level Initialization ---
  const initLevel = useCallback(
    (lvlNum: number) => {
      const cfg = LEVELS[lvlNum - 1] || LEVELS[0];
      setCurrentLevelNumber(lvlNum);

      // Create initial plot data
      const initialPlots: PlotData[] = [];
      let pId = 0;
      for (let r = 0; r < cfg.gridRows; r++) {
        for (let c = 0; c < cfg.gridCols; c++) {
          const randomCropId =
            cfg.allowedCrops[Math.floor(Math.random() * cfg.allowedCrops.length)];
          initialPlots.push({
            id: pId++,
            row: r,
            col: c,
            cropId: randomCropId,
            stage: 0,
            growthProgress: 0,
            moisture: 70 + Math.random() * 20, // initial nice moisture
            isWithered: false,
            witherTimer: 0,
            isDead: false,
            pestPresent: false,
            pestTimer: 0,
            harvestCount: 0,
            lastWateredTime: Date.now(),
          });
        }
      }

      setPlots(initialPlots);
      setHarvestCount(0);
      setDeadCount(0);
      setScore(0);
      setTimeRemaining(cfg.timeLimitSeconds);
      setIsPaused(false);

      const canCapacity = 10 + upgrades.canCapacityLevel * 5;
      setFarmer({
        x: cfg.gridCols / 2,
        y: -0.6,
        targetX: cfg.gridCols / 2,
        targetY: -0.6,
        facing: 'down',
        isWatering: false,
        isWalking: false,
        waterLevel: canCapacity,
        maxWater: canCapacity,
        moveSpeed: 3.5 + upgrades.speedLevel * 0.7,
        waterRange: 1.2,
        splashRadius: 1,
      });

      setScreen('playing');
      lastTickTime.current = Date.now();
      soundFx.startBackgroundMusic();
    },
    [upgrades]
  );

  // --- Start Game / Replay / Level Select Handlers ---
  const handleStartGame = () => {
    const highestUnlocked = Math.max(
      ...progressList.filter((p) => p.unlocked).map((p) => p.level),
      1
    );
    initLevel(highestUnlocked);
  };

  const handleReplay = () => {
    initLevel(currentLevelNumber);
  };

  const handleNextLevel = () => {
    if (currentLevelNumber < 30) {
      initLevel(currentLevelNumber + 1);
    }
  };

  const handleSelectLevel = (lvlNum: number) => {
    initLevel(lvlNum);
  };

  // --- Water Action ---
  const handleWater = useCallback(() => {
    if (farmer.waterLevel <= 0) {
      soundFx.playWitherWarningSound();
      return;
    }

    setFarmer((prev) => ({ ...prev, isWatering: true, waterLevel: Math.max(0, prev.waterLevel - 1) }));
    soundFx.playWaterSound();

    setTimeout(() => {
      setFarmer((prev) => ({ ...prev, isWatering: false }));
    }, 250);

    // Apply water to nearest plot or plots
    setPlots((prevPlots) => {
      let harvestedAny = false;
      const updated = prevPlots.map((plot) => {
        // Calculate distance between farmer and plot
        const dx = farmer.x - (plot.col + 0.5);
        const dy = farmer.y - (plot.row + 0.5);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= 1.4 && !plot.isDead) {
          // If plot has pest, shoo it away!
          let hasPest = plot.pestPresent;
          if (hasPest) {
            hasPest = false;
            soundFx.playPestShooSound();
          }

          // If fully mature (Stage 3), harvest it!
          if (plot.stage === 3) {
            harvestedAny = true;
            const cropCfg = CROPS[plot.cropId] || CROPS.carrot;
            const coinsWon = cropCfg.value;
            const pointsWon = cropCfg.value * 10;

            setCoins((c) => c + coinsWon);
            setScore((s) => s + pointsWon);
            setHarvestCount((h) => h + 1);
            soundFx.playHarvestSound(2);

            // Re-seed plot with a fresh random crop
            const randomCropId =
              levelConfig.allowedCrops[
                Math.floor(Math.random() * levelConfig.allowedCrops.length)
              ];

            return {
              ...plot,
              cropId: randomCropId,
              stage: 0,
              growthProgress: 0,
              moisture: Math.min(100, plot.moisture + 50),
              isWithered: false,
              witherTimer: 0,
              pestPresent: false,
              harvestCount: plot.harvestCount + 1,
            };
          }

          // Water normal growing plot
          return {
            ...plot,
            moisture: Math.min(100, plot.moisture + 45),
            isWithered: false,
            witherTimer: 0,
            pestPresent: hasPest,
          };
        }
        return plot;
      });

      return updated;
    });
  }, [farmer.waterLevel, farmer.x, farmer.y, levelConfig.allowedCrops]);

  // --- Refill Water at Well ---
  const handleRefillWell = useCallback(() => {
    setFarmer((prev) => ({
      ...prev,
      waterLevel: prev.maxWater,
    }));
    soundFx.playRefillSound();
  }, []);

  // --- Rain Cloud Booster Powerup ---
  const handleUseRainCloud = () => {
    if (upgrades.rainCloudPowerups <= 0) return;

    setUpgrades((u) => ({ ...u, rainCloudPowerups: u.rainCloudPowerups - 1 }));
    soundFx.playRefillSound();

    // Soak all alive plots to 100% moisture and clear pests
    setPlots((prev) =>
      prev.map((p) =>
        p.isDead
          ? p
          : {
              ...p,
              moisture: 100,
              isWithered: false,
              witherTimer: 0,
              pestPresent: false,
            }
      )
    );
  };

  // --- Move Farmer by Direction ---
  const moveFarmer = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      setFarmer((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        const step = 0.5;

        if (dir === 'left') newX = Math.max(0, prev.x - step);
        if (dir === 'right') newX = Math.min(levelConfig.gridCols, prev.x + step);
        if (dir === 'up') newY = Math.max(-0.8, prev.y - step);
        if (dir === 'down') newY = Math.min(levelConfig.gridRows, prev.y + step);

        return {
          ...prev,
          x: newX,
          y: newY,
          targetX: newX,
          targetY: newY,
          facing: dir,
          isWalking: true,
        };
      });

      setTimeout(() => {
        setFarmer((prev) => ({ ...prev, isWalking: false }));
      }, 150);
    },
    [levelConfig.gridCols, levelConfig.gridRows]
  );

  // --- Plot Click / Tap Handler: Move to Plot & Water ---
  const handlePlotClick = (plotId: number) => {
    const plot = plots.find((p) => p.id === plotId);
    if (!plot) return;

    const targetPlotX = plot.col + 0.5;
    const targetPlotY = plot.row + 0.5;

    const dx = farmer.x - targetPlotX;
    const dy = farmer.y - targetPlotY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= 1.5) {
      // If already close, water/harvest immediately
      handleWater();
    } else {
      // Walk towards plot
      const dirFacing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'up' : 'down');
      setFarmer((prev) => ({
        ...prev,
        targetX: targetPlotX,
        targetY: targetPlotY,
        facing: dirFacing,
        isWalking: true,
      }));
    }
  };

  // --- Pest Shoo Click ---
  const handlePestClick = (plotId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playPestShooSound();
    setPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, pestPresent: false } : p))
    );
  };

  // --- Keyboard Event Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;

      keysPressed.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        handleWater();
      } else if (e.code === 'KeyE' || e.code === 'KeyR') {
        handleRefillWell();
      } else if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, handleWater, handleRefillWell]);

  // --- Main 60FPS Game Physics & Moisture Tick Engine ---
  useEffect(() => {
    if (screen !== 'playing' || isPaused) return;

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - lastTickTime.current) / 1000);
      lastTickTime.current = now;

      // 1. Move Farmer smoothly towards targetX, targetY or with arrow keys
      setFarmer((prev) => {
        let vx = 0;
        let vy = 0;
        let isMoving = false;
        let facing = prev.facing;

        // Check active keyboard keys
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
          vx -= 1;
          facing = 'left';
          isMoving = true;
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
          vx += 1;
          facing = 'right';
          isMoving = true;
        }
        if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
          vy -= 1;
          facing = 'up';
          isMoving = true;
        }
        if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
          vy += 1;
          facing = 'down';
          isMoving = true;
        }

        let newX = prev.x;
        let newY = prev.y;

        if (isMoving) {
          // Normalize speed
          const len = Math.sqrt(vx * vx + vy * vy) || 1;
          newX += (vx / len) * prev.moveSpeed * dt;
          newY += (vy / len) * prev.moveSpeed * dt;
          newX = Math.max(-0.2, Math.min(levelConfig.gridCols + 0.2, newX));
          newY = Math.max(-0.8, Math.min(levelConfig.gridRows + 0.2, newY));
          return {
            ...prev,
            x: newX,
            y: newY,
            targetX: newX,
            targetY: newY,
            facing,
            isWalking: true,
          };
        } else {
          // Move towards target if mouse clicked
          const dx = prev.targetX - prev.x;
          const dy = prev.targetY - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.05) {
            const moveAmt = Math.min(dist, prev.moveSpeed * dt);
            newX += (dx / dist) * moveAmt;
            newY += (dy / dist) * moveAmt;
            const newFacing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            return {
              ...prev,
              x: newX,
              y: newY,
              facing: newFacing,
              isWalking: true,
            };
          } else {
            return {
              ...prev,
              isWalking: false,
            };
          }
        }
      });

      // 2. Check well proximity
      const wellDx = farmer.x - (-0.5);
      const wellDy = farmer.y - (-0.5);
      const distToWell = Math.sqrt(wellDx * wellDx + wellDy * wellDy);
      setIsNearWell(distToWell < 1.6);

      // 3. Tick Plots Moisture, Growth & Withering/Shrinking Logic
      const fertilizerBonus = upgrades.fertilizerLevel * 0.25;
      let newlyDeadPlots = 0;
      let hasShrinkingPlots = false;

      setPlots((prevPlots) => {
        return prevPlots.map((plot) => {
          if (plot.isDead) return plot;

          const cropCfg = CROPS[plot.cropId] || CROPS.carrot;
          let currentMoisture = plot.moisture;
          let growthProgress = plot.growthProgress;
          let stage = plot.stage;
          let isWithered = plot.isWithered;
          let witherTimer = plot.witherTimer;
          let isDead = plot.isDead;
          let pestPresent = plot.pestPresent;

          // Pest spawn logic
          if (levelConfig.spawnPests && !pestPresent && Math.random() < 0.003) {
            pestPresent = true;
          }

          // Drying rate
          const pestMultiplier = pestPresent ? 2.5 : 1.0;
          const dryRate =
            (cropCfg.drySpeed * levelConfig.drySpeedMultiplier * pestMultiplier) /
            (1 + fertilizerBonus * 0.5);

          currentMoisture = Math.max(0, currentMoisture - dryRate * dt);

          // Growth or Withering / Shrinking
          if (currentMoisture >= cropCfg.minMoistureToGrow) {
            // Plant is well watered and growing!
            isWithered = false;
            witherTimer = 0;

            if (stage < 3) {
              const growRate = (100 / cropCfg.growDuration) * (1 + fertilizerBonus);
              growthProgress = Math.min(100, growthProgress + growRate * dt);

              if (growthProgress >= 100) {
                stage = 3; // Fully mature!
              } else if (growthProgress >= 65) {
                stage = 2;
              } else if (growthProgress >= 30) {
                stage = 1;
              }
            }
          } else if (currentMoisture <= 0) {
            // MOISTURE IS ZERO! PLANT WITHERS AND SHRINKS!
            isWithered = true;
            witherTimer += dt;
            hasShrinkingPlots = true;

            // SHRINK PLANT GROWTH PROGRESS!
            const shrinkRate = cropCfg.witherShrinkSpeed;
            growthProgress = Math.max(0, growthProgress - shrinkRate * dt);

            // Revert stage downwards if shrunk too much
            if (growthProgress < 30 && stage > 0) {
              stage = 0;
            } else if (growthProgress < 65 && stage > 1) {
              stage = 1;
            }

            // If it stays completely at 0 for > 3.5 seconds or shrinks below 0, it dies!
            if (witherTimer >= 3.5 && growthProgress <= 5) {
              isDead = true;
              newlyDeadPlots++;
              soundFx.playPlantDeathSound();
            }
          }

          return {
            ...plot,
            moisture: currentMoisture,
            growthProgress,
            stage,
            isWithered,
            witherTimer,
            isDead,
            pestPresent,
          };
        });
      });

      // Play warning sound if plants are actively withering
      if (hasShrinkingPlots && now - lastWarningSoundTime.current > 3500) {
        lastWarningSoundTime.current = now;
        soundFx.playWitherWarningSound();
      }

      // Update dead count
      if (newlyDeadPlots > 0) {
        setDeadCount((d) => d + newlyDeadPlots);
      }

      // 4. Tick Timer Countdown
      setTimeRemaining((t) => Math.max(0, t - dt));

      // 5. Tick Floating Particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life + dt,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter((p) => p.life < p.maxLife)
      );
    }, 50);

    return () => clearInterval(intervalId);
  }, [screen, isPaused, farmer.x, farmer.y, levelConfig, upgrades]);

  // --- Check Win / Loss Conditions ---
  useEffect(() => {
    if (screen !== 'playing') return;

    // Victory Check: Harvest target reached
    if (harvestCount >= levelConfig.targetHarvests) {
      soundFx.playVictorySound();
      
      // Calculate 3-star rating
      let stars = 1;
      if (deadCount === 0 && timeRemaining > levelConfig.timeLimitSeconds * 0.3) {
        stars = 3;
      } else if (deadCount <= 1) {
        stars = 2;
      }

      const rewardCoins = 50 + stars * 25 + currentLevelNumber * 10;
      setCoins((c) => c + rewardCoins);

      // Save Level Progress
      setProgressList((prevList) => {
        return prevList.map((p) => {
          if (p.level === currentLevelNumber) {
            return {
              ...p,
              completed: true,
              stars: Math.max(p.stars, stars),
              highScore: Math.max(p.highScore, score),
            };
          }
          if (p.level === currentLevelNumber + 1) {
            return {
              ...p,
              unlocked: true,
            };
          }
          return p;
        });
      });

      setGameResult({
        isVictory: true,
        reason: 'harvest_goal',
        stars,
        coinsEarned: rewardCoins,
      });

      setScreen('level_complete');
      return;
    }

    // Loss Condition 1: Too many withered/dead plants
    if (deadCount >= levelConfig.maxDeadAllowed) {
      soundFx.playGameOverSound();
      setGameResult({
        isVictory: false,
        reason: 'too_many_dead',
        stars: 0,
        coinsEarned: 0,
      });
      setScreen('game_over');
      return;
    }

    // Loss Condition 2: Time Out
    if (timeRemaining <= 0) {
      soundFx.playGameOverSound();
      setGameResult({
        isVictory: false,
        reason: 'time_out',
        stars: 0,
        coinsEarned: 0,
      });
      setScreen('game_over');
      return;
    }
  }, [harvestCount, deadCount, timeRemaining, screen, levelConfig, currentLevelNumber, score]);

  // --- Buy Upgrade Handler ---
  const handleBuyUpgrade = (type: keyof Upgrades, cost: number) => {
    if (coins < cost) return;
    setCoins((c) => c - cost);
    setUpgrades((u) => ({
      ...u,
      [type]: u[type] + 1,
    }));
    soundFx.playButtonClick();
  };

  // Sound toggle
  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const highestUnlockedLevel = Math.max(
    ...progressList.filter((p) => p.unlocked).map((p) => p.level),
    1
  );
  const totalStars = progressList.reduce((acc, p) => acc + (p.stars || 0), 0);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-stone-950 flex flex-col items-center justify-start overflow-x-hidden font-sans select-none"
    >
      {/* 1. START SCREEN */}
      {screen === 'start' && (
        <StartScreen
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setShowLevelModal(true)}
          onOpenShop={() => setShowShopModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highestUnlockedLevel={highestUnlockedLevel}
          totalStars={totalStars}
        />
      )}

      {/* 2. GAMEPLAY VIEW */}
      {(screen === 'playing' ||
        screen === 'paused' ||
        screen === 'level_complete' ||
        screen === 'game_over') && (
        <div className="w-full flex-1 flex flex-col items-center justify-between relative">
          
          {/* Top HUD */}
          <GardenHUD
            levelConfig={levelConfig}
            score={score}
            coins={coins}
            harvestCount={harvestCount}
            deadCount={deadCount}
            timeRemaining={Math.ceil(timeRemaining)}
            waterLevel={farmer.waterLevel}
            maxWater={farmer.maxWater}
            upgrades={upgrades}
            isPaused={isPaused}
            isMuted={isMuted}
            onTogglePause={() => setIsPaused((p) => !p)}
            onToggleMute={handleToggleMute}
            onOpenShop={() => setShowShopModal(true)}
            onOpenLevelSelect={() => setShowLevelModal(true)}
            onUseRainCloud={handleUseRainCloud}
          />

          {/* Garden Playing Canvas Ground */}
          <main className="flex-1 w-full max-w-5xl flex items-center justify-center p-2 sm:p-4 my-auto relative">
            <div className="relative bg-gradient-to-b from-emerald-800 to-green-900 border-4 border-emerald-950 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              
              {/* Garden Grass Decoration & Daisy Flowers */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute top-2 left-4 text-sm opacity-50">🌼</div>
              <div className="absolute bottom-3 right-6 text-sm opacity-50">🌸</div>
              <div className="absolute bottom-4 left-8 text-sm opacity-50">🌼</div>

              {/* Water Well Station Top Corner */}
              <div className="w-full flex items-center justify-between mb-4 z-10">
                <WaterWell
                  isFarmerNear={isNearWell}
                  onRefillClick={handleRefillWell}
                  farmerWater={farmer.waterLevel}
                  maxWater={farmer.maxWater}
                />

                {/* Level Objectives Legend */}
                <div className="bg-stone-900/80 backdrop-blur-xs px-3 py-2 rounded-2xl border border-stone-800 text-right text-xs text-stone-300">
                  <div className="text-[11px] font-bold text-amber-300">
                    Crops: {levelConfig.allowedCrops.map((c) => CROPS[c]?.emoji).join(' ')}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Keep plots moist or crops will shrink!
                  </div>
                </div>
              </div>

              {/* Garden Grid of Plots */}
              <div
                className="grid gap-3 sm:gap-4 relative z-10"
                style={{
                  gridTemplateColumns: `repeat(${levelConfig.gridCols}, minmax(0, 1fr))`,
                }}
              >
                {plots.map((plot) => {
                  const dx = farmer.x - (plot.col + 0.5);
                  const dy = farmer.y - (plot.row + 0.5);
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const isNear = dist <= 1.4;

                  return (
                    <PlantPlot
                      key={plot.id}
                      plot={plot}
                      isFarmerNear={isNear}
                      onPlotClick={handlePlotClick}
                      onPestClick={handlePestClick}
                    />
                  );
                })}
              </div>

              {/* Floating Text Particles */}
              <FloatingParticles particles={particles} />

              {/* Floating Farmer Avatar above grid based on position */}
              <div
                className="absolute z-20 pointer-events-none transition-all duration-75"
                style={{
                  left: `${((farmer.x + 0.5) / (levelConfig.gridCols + 1)) * 90 + 5}%`,
                  top: `${((farmer.y + 0.8) / (levelConfig.gridRows + 1.2)) * 75 + 15}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <FarmerSprite
                  facing={farmer.facing}
                  isWalking={farmer.isWalking}
                  isWatering={farmer.isWatering}
                  waterLevel={farmer.waterLevel}
                  maxWater={farmer.maxWater}
                />
              </div>

            </div>
          </main>

          {/* On-Screen Mobile Touch Controls */}
          <TouchControls
            onMove={moveFarmer}
            onWater={handleWater}
            onRefill={handleRefillWell}
            waterLevel={farmer.waterLevel}
            maxWater={farmer.maxWater}
            isNearWell={isNearWell}
          />
        </div>
      )}

      {/* 3. LEVEL SELECT MODAL */}
      {showLevelModal && (
        <LevelSelectModal
          progressList={progressList}
          currentLevel={currentLevelNumber}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {/* 4. UPGRADES SHOP MODAL */}
      {showShopModal && (
        <ShopModal
          coins={coins}
          upgrades={upgrades}
          onBuyUpgrade={handleBuyUpgrade}
          onClose={() => setShowShopModal(false)}
        />
      )}

      {/* 5. LEVEL COMPLETE / GAME OVER MODAL */}
      {(screen === 'level_complete' || screen === 'game_over') && (
        <GameOverModal
          isVictory={gameResult.isVictory}
          reason={gameResult.reason}
          score={score}
          coinsEarned={gameResult.coinsEarned}
          harvests={harvestCount}
          deadCount={deadCount}
          starsEarned={gameResult.stars}
          levelConfig={levelConfig}
          onReplay={handleReplay}
          onNextLevel={handleNextLevel}
          onOpenLevelSelect={() => {
            setShowLevelModal(true);
            setScreen('playing');
          }}
          onOpenShop={() => {
            setShowShopModal(true);
          }}
        />
      )}

      {/* 6. PAUSE OVERLAY */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-stone-700 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-2xl">
            <h3 className="text-xl font-black text-amber-300 mb-2">Game Paused</h3>
            <p className="text-xs text-stone-400 mb-6">
              Take a breath! Your garden is resting safely.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-sm transition-colors"
              >
                Resume Farming
              </button>
              <button
                onClick={handleReplay}
                className="w-full py-3 bg-stone-800 hover:bg-stone-700 font-bold rounded-xl text-xs transition-colors"
              >
                Restart Level
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setShowLevelModal(true);
                }}
                className="w-full py-3 bg-stone-800 hover:bg-stone-700 font-bold rounded-xl text-xs transition-colors"
              >
                Level Map (1-30)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
