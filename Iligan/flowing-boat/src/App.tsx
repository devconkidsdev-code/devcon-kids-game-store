import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, InputState } from './game/gameEngine';
import { GameRenderer } from './game/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TOTAL_ROUNDS, ROUNDS_CONFIG } from './game/constants';
import { GameStage, Difficulty, HighScoreEntry } from './types';
import { soundManager } from './audio/soundManager';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { TouchControls } from './components/TouchControls';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { RoundClearedModal } from './components/RoundClearedModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  const [currentStage, setCurrentStage] = useState<GameStage>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [waveSpeedMultiplier, setWaveSpeedMultiplier] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

  // HUD Reactive Snapshot State
  const [hudPlayer, setHudPlayer] = useState(engineRef.current?.player);
  const [hudWave, setHudWave] = useState(engineRef.current?.wave);
  const [currentRoundNum, setCurrentRoundNum] = useState<number>(1);

  // Load High Scores and Wave Speed Preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flowing_boat_highscores');
      if (saved) {
        setHighScores(JSON.parse(saved));
      }
      const savedWaveSpeed = localStorage.getItem('flowing_boat_wave_speed');
      if (savedWaveSpeed) {
        const parsed = parseFloat(savedWaveSpeed);
        if (!isNaN(parsed) && parsed >= 0.4 && parsed <= 2.5) {
          setWaveSpeedMultiplier(parsed);
          if (engineRef.current) {
            engineRef.current.setWaveSpeedMultiplier(parsed);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize Engine & Renderer
  useEffect(() => {
    const engine = new GameEngine();
    const renderer = new GameRenderer();

    engine.onStageChange = (newStage) => {
      setCurrentStage(newStage);
      setCurrentRoundNum(engine.currentRound);
    };

    engine.onGameOver = (reason) => {
      setGameOverReason(reason);
      setCurrentStage('game_over');
    };

    engine.onVictory = (stats) => {
      setCurrentStage('victory');
      // Save High Score
      const newEntry: HighScoreEntry = {
        difficulty: engine.difficulty,
        time: stats.timeElapsed,
        stars: stats.starsEarned,
        date: new Date().toISOString(),
      };
      setHighScores((prev) => {
        const updated = [...prev, newEntry].sort((a, b) => a.time - b.time).slice(0, 5);
        try {
          localStorage.setItem('flowing_boat_highscores', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    };

    engineRef.current = engine;
    rendererRef.current = renderer;
    setHudPlayer({ ...engine.player });
    setHudWave({ ...engine.wave });
  }, []);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let hudUpdateCounter = 0;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const engine = engineRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      if (engine && renderer && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!isPaused) {
            engine.update(dt);
          }

          const isStage2 = engine.stage === 'stage2_boat';
          const isTransition = engine.stage === 'transition';

          renderer.render(
            ctx,
            engine.player,
            engine.wave,
            engine.obstacles,
            engine.particles,
            engine.cameraY,
            isStage2,
            isTransition,
            engine.transitionProgress,
            engine.getRoundConfig().biome,
            engine.currentRound,
            engine.getStage1Length(),
            engine.getTotalGameLength()
          );

          // Periodically update React HUD state (every 3 frames) to keep HUD snappy without excessive re-renders
          hudUpdateCounter++;
          if (hudUpdateCounter % 3 === 0) {
            setHudPlayer({ ...engine.player });
            setHudWave({ ...engine.wave });
            setCurrentRoundNum(engine.currentRound);
          }
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.inputs.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.inputs.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.inputs.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.inputs.down = true;
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        engine.inputs.space = true;
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (engine.stage === 'stage1_walking' || engine.stage === 'stage2_boat') {
          setIsPaused((prev) => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.inputs.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.inputs.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.inputs.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engine.inputs.down = false;
      } else if (e.key === ' ' || e.code === 'Space') {
        engine.inputs.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouchInputChange = useCallback((key: keyof InputState, value: boolean) => {
    if (engineRef.current) {
      engineRef.current.inputs[key] = value;
    }
  }, []);

  const handleChangeWaveSpeed = (speedMultiplier: number) => {
    const clamped = Math.max(0.4, Math.min(2.5, speedMultiplier));
    setWaveSpeedMultiplier(clamped);
    if (engineRef.current) {
      engineRef.current.setWaveSpeedMultiplier(clamped);
    }
    try {
      localStorage.setItem('flowing_boat_wave_speed', clamped.toString());
    } catch {
      // ignore
    }
  };

  const handleStartGame = () => {
    if (engineRef.current) {
      setIsPaused(false);
      engineRef.current.startGame(difficulty, 1, waveSpeedMultiplier);
      setCurrentStage('stage1_walking');
      setCurrentRoundNum(1);
    }
  };

  const handleRestartGame = () => {
    handleStartGame();
  };

  const handleNextRound = () => {
    if (engineRef.current) {
      setIsPaused(false);
      engineRef.current.nextRound();
      setCurrentStage('stage1_walking');
      setCurrentRoundNum(engineRef.current.currentRound);
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const currentBiomeName = engineRef.current?.getRoundConfig().title || ROUNDS_CONFIG[0].title;
  const stage1Len = engineRef.current?.getStage1Length() || 1800;
  const totalGameLen = engineRef.current?.getTotalGameLength() || 6800;

  return (
    <main className="relative w-screen h-screen bg-slate-950 flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {/* Game Canvas Container */}
      <div className="relative w-full h-full max-w-[800px] max-h-[600px] flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* In-Game HUD during gameplay */}
        {(currentStage === 'stage1_walking' ||
          currentStage === 'transition' ||
          currentStage === 'stage2_boat') &&
          hudPlayer &&
          hudWave && (
            <>
              <GameHUD
                stage={currentStage}
                player={hudPlayer}
                wave={hudWave}
                currentRound={currentRoundNum}
                totalRounds={TOTAL_ROUNDS}
                biomeName={currentBiomeName}
                stage1Length={stage1Len}
                totalGameLength={totalGameLen}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onPause={handleTogglePause}
              />
              <TouchControls
                onInputChange={handleTouchInputChange}
                isStage2={currentStage === 'stage2_boat'}
              />
            </>
          )}

        {/* Start Menu */}
        {currentStage === 'menu' && (
          <StartScreen
            difficulty={difficulty}
            onSelectDifficulty={setDifficulty}
            waveSpeedMultiplier={waveSpeedMultiplier}
            onChangeWaveSpeed={handleChangeWaveSpeed}
            onStartGame={handleStartGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            highScores={highScores}
          />
        )}

        {/* Round Cleared Modal */}
        {currentStage === 'round_cleared' && engineRef.current && (
          <RoundClearedModal
            round={engineRef.current.currentRound}
            totalRounds={TOTAL_ROUNDS}
            stats={engineRef.current.stats}
            onNextRound={handleNextRound}
          />
        )}

        {/* Pause Modal */}
        {isPaused && (
          <PauseModal
            onResume={() => setIsPaused(false)}
            onRestart={handleRestartGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            waveSpeedMultiplier={waveSpeedMultiplier}
            onChangeWaveSpeed={handleChangeWaveSpeed}
          />
        )}

        {/* Victory Modal */}
        {currentStage === 'victory' && engineRef.current && (
          <VictoryModal
            stats={engineRef.current.stats}
            onRestart={handleRestartGame}
          />
        )}

        {/* Game Over Modal */}
        {currentStage === 'game_over' && engineRef.current && (
          <GameOverModal
            reason={gameOverReason}
            distanceTraveled={engineRef.current.player.y}
            stats={engineRef.current.stats}
            onRestart={handleRestartGame}
          />
        )}
      </div>

      {/* Sleek Stage & Round Indicator Badges on Large Screens (Right side) */}
      {(currentStage === 'stage1_walking' ||
        currentStage === 'transition' ||
        currentStage === 'stage2_boat' ||
        currentStage === 'round_cleared') && (
        <aside className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-10 pointer-events-none">
          <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
            ROUNDS
          </div>
          {[1, 2, 3].map((rNum) => {
            const isCompleted = rNum < currentRoundNum;
            const isCurrent = rNum === currentRoundNum;
            return (
              <div
                key={rNum}
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-blue-600 border-white/50 text-white shadow-lg shadow-blue-500/50 scale-110'
                    : isCompleted
                    ? 'bg-emerald-600/80 border-emerald-400 text-white'
                    : 'bg-white/5 backdrop-blur-lg border-white/10 text-white/30'
                }`}
              >
                <span>R0{rNum}</span>
              </div>
            );
          })}
        </aside>
      )}

      {/* Sleek Bottom Desktop Controls Pill Bar */}
      <footer className="absolute bottom-3 hidden md:flex items-center gap-3 z-10 select-none">
        <div className="px-4 py-2 bg-white/90 backdrop-blur-md text-black rounded-full font-bold flex items-center gap-2.5 shadow-xl border border-white">
          <div className="flex gap-1">
            <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px] font-mono font-bold">←</span>
            <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px] font-mono font-bold">↑</span>
            <span className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px] font-mono font-bold">→</span>
          </div>
          <span className="text-xs uppercase tracking-wider">Steer & Row</span>
        </div>

        <div className="px-4 py-2 bg-blue-600 backdrop-blur-md text-white rounded-full font-bold flex items-center gap-2.5 shadow-xl border border-blue-400">
          <span className="px-2 h-5 flex items-center justify-center bg-blue-800 rounded text-[10px] font-mono font-bold tracking-tight">SPACE</span>
          <span className="text-xs uppercase tracking-wider">
            {currentStage === 'stage2_boat' ? 'Oar Boost' : 'Jump / Dodge'}
          </span>
        </div>

        <div className="px-3 py-2 bg-black/40 backdrop-blur-md text-white/70 rounded-full font-medium flex items-center gap-2 border border-white/10 text-xs">
          <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">P</span>
          <span>Pause</span>
        </div>
      </footer>
    </main>
  );
}


