import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, LevelResult, GameStats } from './types';
import { LEVELS, getRating, calculateScore } from './data/levels';
import { soundManager } from './utils/audio';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen } from './components/StartScreen';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { DPad } from './components/DPad';

const STATS_STORAGE_KEY = 'fetch_game_stats_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [water, setWater] = useState<number>(100);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getIsMuted());
  const [activeDirection, setActiveDirection] = useState<{ x: number; y: number } | null>(null);

  // Campaign results storage
  const [campaignResults, setCampaignResults] = useState<LevelResult[]>([]);
  const [currentLevelResult, setCurrentLevelResult] = useState<LevelResult | null>(null);

  // Persistent game stats (Best scores)
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      totalScore: 0,
      levelsCompleted: 0,
      totalWaterSaved: 0,
      bestScores: {},
    };
  });

  const level = LEVELS[currentLevelIndex] || LEVELS[0];

  // Sound toggle handler
  const handleToggleMute = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Start / Init Level
  const startLevel = useCallback((levelIdx: number) => {
    setCurrentLevelIndex(levelIdx);
    setWater(LEVELS[levelIdx].initialWater);
    setTimeElapsed(0);
    setGameState('PLAYING');
    soundManager.playPop();
  }, []);

  // Restart current level
  const handleRestartLevel = useCallback(() => {
    setWater(level.initialWater);
    setTimeElapsed(0);
    setGameState('PLAYING');
    soundManager.playPop();
  }, [level]);

  // Win Level Handler
  const handleWin = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    soundManager.playWin();
    const finalWater = Math.max(0, Math.round(water));
    const finalTime = Number(timeElapsed.toFixed(1));
    const score = calculateScore(finalWater, finalTime, level.parTime);
    const { rating, color } = getRating(finalWater);

    const result: LevelResult = {
      levelId: level.id,
      levelName: level.name,
      waterRemaining: finalWater,
      timeTaken: finalTime,
      score,
      rating,
      ratingColor: color,
    };

    setCurrentLevelResult(result);

    // Update campaign records
    setCampaignResults((prev) => {
      const filtered = prev.filter((r) => r.levelId !== level.id);
      return [...filtered, result];
    });

    // Update persistent high scores
    setGameStats((prev) => {
      const prevBest = prev.bestScores[level.id];
      const isNewBest = !prevBest || score > prevBest.score;
      const updatedBestScores: Record<number, LevelResult> = {
        ...prev.bestScores,
        [level.id]: isNewBest ? result : prevBest,
      };
      const totalScore = (Object.values(updatedBestScores) as LevelResult[]).reduce(
        (acc: number, curr: LevelResult) => acc + curr.score,
        0
      );

      const nextStats: GameStats = {
        ...prev,
        totalScore,
        levelsCompleted: Math.max(prev.levelsCompleted, level.id),
        bestScores: updatedBestScores,
      };

      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats));
      } catch {
        // ignore storage errors
      }

      return nextStats;
    });

    setGameState('LEVEL_COMPLETE');
  }, [gameState, water, timeElapsed, level]);

  // Lose Level Handler (Water ran dry)
  const handleLose = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    soundManager.playGameOver();
    setGameState('GAME_OVER');
  }, [gameState]);

  // Next level progression
  const handleNextLevel = useCallback(() => {
    if (currentLevelIndex + 1 < LEVELS.length) {
      startLevel(currentLevelIndex + 1);
    } else {
      // Completed all levels!
      setGameState('ALL_LEVELS_COMPLETE');
    }
  }, [currentLevelIndex, startLevel]);

  // Toggle Pause
  const handleTogglePause = useCallback(() => {
    setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
  }, []);

  // Timer Tick
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, [gameState]);

  // Global Keyboard Shortcuts (R = Restart, P = Pause, M = Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'r') {
        if (gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'LEVEL_COMPLETE') {
          handleRestartLevel();
        }
      } else if (key === 'p') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          handleTogglePause();
        }
      } else if (key === 'm') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleRestartLevel, handleTogglePause, handleToggleMute]);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#FDFBF7] text-[#2D3748] flex flex-col items-center justify-between select-none font-sans">
      {gameState === 'START' && (
        <StartScreen
          onStartGame={startLevel}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          gameStats={gameStats}
        />
      )}

      {(gameState === 'PLAYING' ||
        gameState === 'PAUSED' ||
        gameState === 'LEVEL_COMPLETE' ||
        gameState === 'GAME_OVER' ||
        gameState === 'ALL_LEVELS_COMPLETE') && (
        <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#F1F3F0]">
          {/* Top HUD */}
          <HUD
            level={level}
            water={water}
            timeElapsed={timeElapsed}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onRestart={handleRestartLevel}
            isPaused={gameState === 'PAUSED'}
            onTogglePause={handleTogglePause}
          />

          {/* Interactive Game Arena */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <GameCanvas
              level={level}
              water={water}
              setWater={setWater}
              onWin={handleWin}
              onLose={handleLose}
              isPaused={gameState === 'PAUSED'}
              activeDirection={activeDirection}
            />

            {/* Pause Overlay */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex flex-col items-center justify-center z-30">
                <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-xl flex flex-col items-center text-center">
                  <h3 className="font-display font-black text-2xl text-[#2F4F4F] mb-1">GAME PAUSED</h3>
                  <p className="text-[#708090] text-xs mb-4">Press Resume or P to continue the expedition</p>
                  <button
                    id="resume-btn"
                    onClick={handleTogglePause}
                    className="px-6 py-2.5 bg-[#2F4F4F] hover:bg-[#233D3D] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Resume
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Instructions on Desktop & Virtual D-Pad on Mobile */}
          <footer className="w-full bg-white border-t border-[#E2E8F0] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#708090] z-20 shrink-0 shadow-xs">
            {/* Desktop Keyboard Guide */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="font-bold text-[#2D3748]">CONTROLS:</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-[#F1F3F0] border border-[#E2E8F0] rounded text-[#2D3748] font-mono font-bold text-[11px]">
                  W A S D
                </kbd>
                <span>or</span>
                <kbd className="px-2 py-1 bg-[#F1F3F0] border border-[#E2E8F0] rounded text-[#2D3748] font-mono font-bold text-[11px]">
                  ARROWS
                </kbd>
                <span className="ml-1">TO MOVE</span>
              </div>
              <span className="text-[#E2E8F0]">|</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-[#F1F3F0] border border-[#E2E8F0] rounded text-[#2D3748] font-mono font-bold text-[11px]">
                  R
                </kbd>
                <span>RESTART</span>
              </div>
            </div>

            {/* In-game quick objective reminder */}
            <div className="hidden md:flex items-center gap-1.5 text-[#708090] font-medium">
              <span>Spring</span>
              <span className="text-[#00BFFF] font-bold">→</span>
              <span>Mountain Maze</span>
              <span className="text-[#00BFFF] font-bold">→</span>
              <span>Village</span>
            </div>

            {/* Mobile / Touch DPad */}
            <div className="sm:hidden w-full flex flex-col items-center">
              <DPad onDirectionChange={setActiveDirection} />
              <span className="text-[10px] text-[#708090] mt-1">Tap D-pad or swipe to move</span>
            </div>
          </footer>

          {/* Modals */}
          {gameState === 'LEVEL_COMPLETE' && currentLevelResult && (
            <LevelCompleteModal
              result={currentLevelResult}
              hasNextLevel={currentLevelIndex + 1 < LEVELS.length}
              onNextLevel={handleNextLevel}
              onRetry={handleRestartLevel}
              onMenu={() => setGameState('START')}
            />
          )}

          {gameState === 'GAME_OVER' && (
            <GameOverModal
              level={level}
              timeTaken={timeElapsed}
              onRetry={handleRestartLevel}
              onMenu={() => setGameState('START')}
            />
          )}

          {gameState === 'ALL_LEVELS_COMPLETE' && (
            <VictoryModal
              results={campaignResults}
              onPlayAgain={() => startLevel(0)}
              onMenu={() => setGameState('START')}
            />
          )}
        </div>
      )}
    </main>
  );
}
