import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BukidnonScenery } from './components/BukidnonScenery';
import { FarmerCharacter } from './components/FarmerCharacter';
import { CropPlot } from './components/CropPlot';
import { GameHUD } from './components/GameHUD';
import { MobileControls } from './components/MobileControls';
import { StartScreen } from './components/StartScreen';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { GameStatus, Crop, FloatingText, GameStats } from './types';
import { getLevelConfig, CROP_TYPES } from './utils/levels';
import { soundFX } from './utils/audio';
import { Sparkles, Pause, Play, RotateCcw } from 'lucide-react';

const STORAGE_HIGH_SCORE = 'aqua_harvest_high_score';
const STORAGE_MAX_LEVEL = 'aqua_harvest_max_level';

export default function App() {
  // Game Flow State
  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [water, setWater] = useState<number>(110);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [cropsWateredCorrectly, setCropsWateredCorrectly] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [gameOverReason, setGameOverReason] = useState<'lives' | 'time' | 'water'>('lives');

  // Player Character State
  const [currentPlotIndex, setCurrentPlotIndex] = useState<number>(0);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [isWatering, setIsWatering] = useState<boolean>(false);

  // Audio & Settings State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // High Scores
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_HIGH_SCORE) || '0', 10);
    } catch {
      return 0;
    }
  });
  const [highestLevel, setHighestLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_MAX_LEVEL) || '1', 10);
    } catch {
      return 1;
    }
  });

  // Current Level Config
  const levelConfig = getLevelConfig(level);

  // Crops Array
  const [crops, setCrops] = useState<Crop[]>([]);

  // Floating Text Alerts
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Refs for loop stability
  const cropsRef = useRef<Crop[]>(crops);
  cropsRef.current = crops;
  const gameStatusRef = useRef<GameStatus>(gameStatus);
  gameStatusRef.current = gameStatus;

  // Initialize a fresh level's crops
  const initializeLevel = useCallback((levelNum: number, keepScore = false) => {
    const config = getLevelConfig(levelNum);
    const newCrops: Crop[] = [];

    for (let i = 0; i < config.cropCount; i++) {
      const randomCropType = CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)].type;
      // Stagger initial moisture so some are dry soon, others are moderate
      const initialMoisture = 25 + Math.random() * 55;
      const drySpeedModifier = 0.8 + Math.random() * 0.4;

      newCrops.push({
        id: i,
        type: randomCropType,
        moisture: initialMoisture,
        dryRate: config.baseDryRate * drySpeedModifier,
        growthStage: 2,
        isGolden: Math.random() < 0.15,
      });
    }

    setCrops(newCrops);
    setLevel(levelNum);
    setWater(config.waterSupply);
    setTimeLeft(config.timeLimit);
    setCurrentPlotIndex(Math.floor(config.cropCount / 2));
    if (!keepScore) {
      setScore(0);
      setLives(3);
      setCombo(0);
      setMaxCombo(0);
      setCropsWateredCorrectly(0);
      setMistakesCount(0);
    }
    setGameStatus('PLAYING');
  }, []);

  // Start / Restart Game
  const handleStartGame = () => {
    initializeLevel(1, false);
  };

  // Next Level Handler
  const handleNextLevel = () => {
    const nextLvl = level + 1;
    // Keep accumulated score + water bonus
    const waterBonus = Math.round(water * 0.5);
    const newScore = score + waterBonus;
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem(STORAGE_HIGH_SCORE, newScore.toString());
      } catch {}
    }
    if (nextLvl > highestLevel) {
      setHighestLevel(nextLvl);
      try {
        localStorage.setItem(STORAGE_MAX_LEVEL, nextLvl.toString());
      } catch {}
    }

    initializeLevel(nextLvl, true);
  };

  // Spawn floating feedback banner
  const addFloatingText = (text: string, color: string, type: 'score' | 'penalty' | 'combo' | 'water') => {
    const newId = Date.now() + Math.random();
    const plotPercent = ((currentPlotIndex + 0.5) / levelConfig.cropCount) * 100;
    
    setFloatingTexts((prev) => [
      ...prev.slice(-4), // keep maximum 4 active
      {
        id: newId,
        x: plotPercent,
        y: 50,
        text,
        color,
        type,
      },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newId));
    }, 1200);
  };

  // Movement Handlers
  const moveLeft = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING') return;
    setFacingDirection('left');
    setCurrentPlotIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const moveRight = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING') return;
    setFacingDirection('right');
    setCurrentPlotIndex((prev) => Math.min(cropsRef.current.length - 1, prev + 1));
  }, []);

  // Core Water Spray Mechanism
  const sprayWater = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING') return;

    // Trigger visual spray animation
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 220);

    // Audio SFX
    soundFX.playSpray();

    const targetIndex = currentPlotIndex;
    const currentCrop = cropsRef.current[targetIndex];
    if (!currentCrop) return;

    const waterCost = 7;
    const newWater = Math.max(0, water - waterCost);
    setWater(newWater);

    // Evaluate Moisture & Scoring Rules
    if (currentCrop.moisture <= 32) {
      // 1. SUCCESS: DRY/PARCHED CROP WATERED!
      const isBonus = currentCrop.isGolden;
      const pointsEarned = isBonus ? 3 : 1;
      const nextCombo = combo + 1;
      
      const updatedScore = score + pointsEarned;
      setScore(updatedScore);
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCropsWateredCorrectly((prev) => prev + 1);

      // Play Sound
      if (isBonus) {
        soundFX.playGoldenBonus();
        addFloatingText(`+${pointsEarned} GOLDEN HARVEST!`, '#facc15', 'combo');
      } else {
        soundFX.playCorrect(nextCombo);
        addFloatingText(nextCombo > 2 ? `+1 COMBO x${nextCombo}!` : '+1 POINT!', '#38bdf8', 'score');
      }

      // Update crop state: hydrate to optimal 85%
      setCrops((prev) =>
        prev.map((c, i) =>
          i === targetIndex
            ? {
                ...c,
                moisture: 85,
                isGolden: Math.random() < 0.1, // roll new golden chance
                statusText: '✨ REFRESHED!',
              }
            : c
        )
      );

      // Check for Level Completion
      if (updatedScore >= levelConfig.targetScore) {
        if (updatedScore > highScore) {
          setHighScore(updatedScore);
          try {
            localStorage.setItem(STORAGE_HIGH_SCORE, updatedScore.toString());
          } catch {}
        }
        setGameStatus('LEVEL_COMPLETE');
        return;
      }
    } else if (currentCrop.moisture > 72) {
      // 2. PENALTY: OVERWATERING ALREADY WET CROP!
      const newLives = lives - 1;
      setLives(newLives);
      setCombo(0);
      setMistakesCount((prev) => prev + 1);

      soundFX.playMistake();
      addFloatingText('MUD SPLASH! -1 LIFE ⚠️', '#ef4444', 'penalty');

      // Set temporary alert on crop
      setCrops((prev) =>
        prev.map((c, i) =>
          i === targetIndex
            ? {
                ...c,
                statusText: '⚠️ OVERWATERED!',
              }
            : c
        )
      );

      // Check for Game Over by Lives
      if (newLives <= 0) {
        setGameOverReason('lives');
        setGameStatus('GAME_OVER');
        return;
      }
    } else {
      // 3. OPTIMAL CROP WATERED (Mild water waste)
      addFloatingText('Already Moist! -7L', '#94a3b8', 'water');
      setCrops((prev) =>
        prev.map((c, i) =>
          i === targetIndex
            ? {
                ...c,
                moisture: Math.min(100, c.moisture + 15),
              }
            : c
        )
      );
    }

    // Check if water depleted and player cannot reach target
    if (newWater <= 0 && score < levelConfig.targetScore) {
      // Check if any remaining dry crop can be watered with 0 water
      setGameOverReason('water');
      setGameStatus('GAME_OVER');
    }
  }, [currentPlotIndex, water, combo, score, levelConfig, lives, highScore]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on Space and Arrow keys during gameplay
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        if (gameStatus === 'PLAYING') {
          e.preventDefault();
        }
      }

      if (gameStatus === 'PLAYING') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          moveLeft();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          moveRight();
        } else if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
          sprayWater();
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          setGameStatus('PAUSED');
        }
      } else if (gameStatus === 'PAUSED') {
        if (e.code === 'KeyP' || e.code === 'Escape' || e.code === 'Space') {
          setGameStatus('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, moveLeft, moveRight, sprayWater]);

  // Game Physics & Crop Moisture Decay Loop (Runs every 100ms)
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const interval = setInterval(() => {
      setCrops((prev) =>
        prev.map((crop) => {
          // Dynamic moisture decay
          const newMoisture = Math.max(0, crop.moisture - crop.dryRate * 0.1);
          
          // Clear temporary status text if old
          const newStatusText = crop.statusText ? crop.statusText : undefined;

          return {
            ...crop,
            moisture: newMoisture,
            statusText: newStatusText,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Game Countdown Timer Loop (Runs every 1s)
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;

        if (nextTime <= 5 && nextTime > 0) {
          soundFX.playTick();
        }

        if (nextTime <= 0) {
          clearInterval(timer);
          // Check if player reached target on buzzer
          if (score >= levelConfig.targetScore) {
            setGameStatus('LEVEL_COMPLETE');
          } else {
            setGameOverReason('time');
            setGameStatus('GAME_OVER');
          }
          return 0;
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, score, levelConfig]);

  // Audio Mute Toggle
  const toggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  // Pause / Resume Toggle
  const togglePause = () => {
    soundFX.playClick();
    setGameStatus((prev) => (prev === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
  };

  // Compile Game Stats object for HUD and Modals
  const currentStats: GameStats = {
    score,
    level,
    lives,
    maxLives: 3,
    waterRemaining: water,
    maxWater: levelConfig.waterSupply,
    timeLeft,
    targetScore: levelConfig.targetScore,
    combo,
    maxCombo,
    cropsWateredCorrectly,
    mistakesCount,
    waterWastedCount: mistakesCount,
    accuracy: cropsWateredCorrectly + mistakesCount > 0 
      ? Math.round((cropsWateredCorrectly / (cropsWateredCorrectly + mistakesCount)) * 100) 
      : 100,
  };

  return (
    <main className="relative w-full min-h-screen bg-[#2D5A27] flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* Background Scenic Canvas */}
      <BukidnonScenery level={level} timeLeft={timeLeft} />

      {/* Top Header HUD (Visible when active or paused) */}
      {gameStatus !== 'MENU' && (
        <GameHUD
          stats={currentStats}
          isMuted={isMuted}
          isPaused={gameStatus === 'PAUSED'}
          onToggleMute={toggleMute}
          onTogglePause={togglePause}
        />
      )}

      {/* Floating Scores / Alert Notifications */}
      {floatingTexts.map((item) => (
        <div
          key={item.id}
          className="absolute z-40 font-black text-sm sm:text-base pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-[bounce_0.6s_ease-out_infinite] -translate-x-1/2 whitespace-nowrap bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20"
          style={{
            left: `${item.x}%`,
            top: '40%',
            color: item.color,
          }}
        >
          {item.text}
        </div>
      ))}

      {/* Main Play Area */}
      {gameStatus === 'MENU' ? (
        <StartScreen
          onStartGame={handleStartGame}
          highScore={highScore}
          highestLevel={highestLevel}
        />
      ) : (
        <div className="relative z-20 flex-1 flex flex-col justify-end w-full max-w-5xl mx-auto px-2 sm:px-6 pb-3">
          
          {/* Active Field Information Bar - Frosted Glass Strip */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-white/15 backdrop-blur-xl rounded-2xl text-xs font-black text-white mb-2 border border-white/25 shadow-lg">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 drop-shadow-xs" />
              <span className="text-yellow-300">{levelConfig.name}</span>
            </div>
            <span className="text-[11px] text-white/80 font-medium">
              {levelConfig.description}
            </span>
          </div>

          {/* Crops Track & Farmer Area Container - Frosted Glass Soil Bed */}
          <div className="relative w-full bg-white/10 backdrop-blur-xl rounded-[32px] p-2 sm:p-4 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            
            {/* Interactive Crops Row */}
            <div className="grid grid-flow-col auto-cols-fr gap-1 sm:gap-3 items-end justify-items-center w-full">
              {crops.map((crop, index) => (
                <CropPlot
                  key={crop.id}
                  crop={crop}
                  index={index}
                  isActive={index === currentPlotIndex}
                  onPlotClick={() => {
                    if (gameStatus === 'PLAYING') {
                      setCurrentPlotIndex(index);
                      sprayWater();
                    }
                  }}
                />
              ))}
            </div>

            {/* Bukidnon Farmer Character Sprite Layer */}
            <FarmerCharacter
              currentPlotIndex={currentPlotIndex}
              totalPlots={crops.length || 5}
              isWatering={isWatering}
              facingDirection={facingDirection}
            />
          </div>

          {/* Mobile & Tablet Tactile Buttons */}
          <div className="mt-2">
            <MobileControls
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onWater={sprayWater}
              disabled={gameStatus !== 'PLAYING'}
            />
          </div>
        </div>
      )}

      {/* Paused Modal - Frosted Glass Container */}
      {gameStatus === 'PAUSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-sm bg-white/15 backdrop-blur-2xl border border-white/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-yellow-300" />

            <h3 className="text-3xl font-black text-white drop-shadow-md mb-2">GAME PAUSED</h3>
            <p className="text-xs text-white/80 mb-6">Take a breath, Bukidnon farmer! Press Resume to continue caring for your crops.</p>
            
            <div className="space-y-3">
              <button
                id="resume-btn"
                onClick={togglePause}
                className="w-full py-3.5 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-lg shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer border border-emerald-200"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>RESUME GAME</span>
              </button>

              <button
                id="restart-level-btn"
                onClick={() => {
                  soundFX.playClick();
                  initializeLevel(level, true);
                }}
                className="w-full py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/35 text-white font-black text-sm border border-white/25 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART LEVEL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Complete Celebration Modal */}
      {gameStatus === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          level={level}
          score={score}
          waterRemaining={water}
          nextLevelConfig={getLevelConfig(level + 1)}
          onNextLevel={handleNextLevel}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAME_OVER' && (
        <GameOverModal
          stats={currentStats}
          highScore={highScore}
          reason={gameOverReason}
          onRestart={handleStartGame}
        />
      )}
    </main>
  );
}
