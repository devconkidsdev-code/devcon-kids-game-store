import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GAME_LEVELS, INFINITE_LEVEL } from './game/levels';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ControlsOverlay } from './components/ControlsOverlay';
import { MenuModal } from './components/MenuModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PauseModal } from './components/PauseModal';
import { CustomizeModal } from './components/CustomizeModal';
import { soundManager } from './audio/soundManager';
import { CharacterConfig, GameState, HighScoreEntry, LevelConfig, RunStats } from './types';
import { DEFAULT_BOY_CHARACTER } from './game/characterPresets';

const STORAGE_KEY = 'funrun_legend_highscores_v1';
const CHARACTER_STORAGE_KEY = 'funrun_legend_char_v1';

const INITIAL_RECORDS: HighScoreEntry[] = [
  {
    id: '1',
    playerName: 'Alexander (Speedster)',
    levelId: 4,
    levelName: 'The Legend Ridge',
    score: 18500,
    timeSpent: 38.2,
    date: 'Province Record',
  },
  {
    id: '2',
    playerName: 'Alexandra (Windrunner)',
    levelId: 3,
    levelName: 'Volcanic Foothills',
    score: 14200,
    timeSpent: 34.5,
    date: 'Province Record',
  },
  {
    id: '3',
    playerName: 'Alexander (Speedster)',
    levelId: 1,
    levelName: 'Barangay Meadows',
    score: 9800,
    timeSpent: 26.0,
    date: 'Province Record',
  },
];

export default function App() {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(GAME_LEVELS[0]);
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [lastRunStats, setLastRunStats] = useState<RunStats | undefined>(undefined);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Character Customization State
  const [character, setCharacter] = useState<CharacterConfig>(() => {
    try {
      const saved = localStorage.getItem(CHARACTER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_BOY_CHARACTER;
  });

  const [highScores, setHighScores] = useState<HighScoreEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RECORDS;
  });

  // State ticks for HUD updates
  const [, setTick] = useState(0);

  // Game Engine instance
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(
      selectedLevel,
      character,
      (newState, stats) => {
        setGameState(newState);
        if (stats) {
          setLastRunStats(stats);
        }
      }
    );
  }

  const engine = engineRef.current;

  // Sync character changes to engine
  const handleSaveCharacter = useCallback(
    (newChar: CharacterConfig) => {
      setCharacter(newChar);
      engine.setCharacter(newChar);
      try {
        localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(newChar));
      } catch {
        // ignore
      }
      setGameState('MENU');
    },
    [engine]
  );

  // Sync state changes from engine
  useEffect(() => {
    engine.setOnStateChange((newState, stats) => {
      setGameState(newState);
      if (stats) {
        setLastRunStats(stats);
        if (newState === 'VICTORY' || (stats.isInfinite && stats.score > 0)) {
          saveScore(stats);
        }
      }
    });
  }, [engine]);

  // Periodic HUD state sync timer during play
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, 50);
    return () => clearInterval(interval);
  }, [gameState]);

  // Save Score to LocalStorage
  const saveScore = useCallback(
    (stats: RunStats) => {
      const isInf = !!stats.isInfinite;
      const levelName = isInf
        ? `Infinite Odyssey (Tier ${stats.difficultyTier || 1})`
        : GAME_LEVELS.find((l) => l.id === stats.levelId)?.name || 'Course';

      const newEntry: HighScoreEntry = {
        id: Date.now().toString(),
        playerName: `${character.name} (${character.gender === 'girl' ? 'Girl' : 'Boy'})`,
        levelId: stats.levelId,
        levelName,
        score: stats.score,
        timeSpent: stats.timeSpent,
        distance: stats.distance,
        difficultyTier: stats.difficultyTier,
        isInfinite: isInf,
        date: new Date().toLocaleDateString(),
      };

      setHighScores((prev) => {
        const updated = [newEntry, ...prev]
          .sort((a, b) => b.score - a.score)
          .slice(0, 15);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [character]
  );

  const handleClearScores = useCallback(() => {
    setHighScores([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // Rock throwing via SPACE, F, or J
      if (e.code === 'Space' || e.code === 'KeyF' || e.code === 'KeyJ') {
        e.preventDefault();
        engine.throwRock();
      }

      // Jump via Up Arrow or W
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        engine.keys.up = true;
        engine.keys.jump = true;
        engine.handleJump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        engine.keys.down = true;
        engine.handleSlide();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        engine.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        engine.keys.right = true;
      }

      // Quick start or pause shortcuts
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engine.gameState === 'PLAYING') {
          engine.pauseGame();
        } else if (engine.gameState === 'PAUSED') {
          engine.resumeGame();
        }
      }

      if (e.code === 'Enter') {
        if (gameState === 'MENU' || gameState === 'GAMEOVER') {
          handleStartGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.keys.up = false;
        engine.keys.jump = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.keys.down = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, gameState]);

  // Game Flow Actions
  const handleStartGame = useCallback(() => {
    engine.startGame(selectedLevel);
    setGameState('PLAYING');
  }, [engine, selectedLevel]);

  const handleStartInfinite = useCallback(() => {
    setSelectedLevel(INFINITE_LEVEL);
    engine.resetLevel(INFINITE_LEVEL);
    engine.startGame(INFINITE_LEVEL);
    setGameState('PLAYING');
  }, [engine]);

  const handleSelectLevel = useCallback(
    (level: LevelConfig) => {
      setSelectedLevel(level);
      engine.resetLevel(level);
      engine.startGame(level);
      setGameState('PLAYING');
    },
    [engine]
  );

  const handleNextLevel = useCallback(() => {
    const currentIndex = GAME_LEVELS.findIndex((l) => l.id === selectedLevel.id);
    if (currentIndex < GAME_LEVELS.length - 1) {
      const nextLvl = GAME_LEVELS[currentIndex + 1];
      setSelectedLevel(nextLvl);
      engine.resetLevel(nextLvl);
      engine.startGame(nextLvl);
      setGameState('PLAYING');
    }
  }, [engine, selectedLevel]);

  const handleReplay = useCallback(() => {
    engine.resetLevel(selectedLevel);
    engine.startGame(selectedLevel);
    setGameState('PLAYING');
  }, [engine, selectedLevel]);

  const handleMenu = useCallback(() => {
    engine.gameState = 'MENU';
    soundManager.stopMusic();
    setGameState('MENU');
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  const hasNextLevel =
    !selectedLevel.isInfinite &&
    GAME_LEVELS.findIndex((l) => l.id === selectedLevel.id) < GAME_LEVELS.length - 1;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050805] text-emerald-50 flex flex-col items-center justify-center font-sans">
      {/* 60 FPS Canvas Game Layer */}
      <GameCanvas engine={engine} />

      {/* Heads-Up Display (HUD) */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            player={engine.player}
            level={engine.currentLevel}
            timeRemaining={engine.timeRemaining}
            timeSpent={engine.timeSpent}
            difficultyTier={engine.difficultyTier}
            tierAnnounceText={engine.tierAnnounceText}
            tierAnnounceTimer={engine.tierAnnounceTimer}
            boss={engine.boss}
            onThrowRock={() => engine.throwRock()}
            score={engine.score}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => engine.pauseGame()}
          />
          {/* Non-blocking key hint */}
          <ControlsOverlay />
        </>
      )}

      {/* Title & Start Menu */}
      {gameState === 'MENU' && (
        <MenuModal
          currentLevel={selectedLevel}
          character={character}
          onStartGame={handleStartGame}
          onStartInfinite={handleStartInfinite}
          onOpenLevelSelect={() => setGameState('LEVEL_SELECT')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onOpenCustomize={() => setGameState('CUSTOMIZE')}
        />
      )}

      {/* Character Customization Modal */}
      {gameState === 'CUSTOMIZE' && (
        <CustomizeModal
          initialCharacter={character}
          onSaveCharacter={handleSaveCharacter}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* Leaderboard Screen */}
      {gameState === 'LEADERBOARD' && (
        <LeaderboardModal
          scores={highScores}
          onClearScores={handleClearScores}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={lastRunStats}
          level={selectedLevel}
          onRetry={handleReplay}
          onMenu={handleMenu}
        />
      )}

      {/* Victory Screen */}
      {gameState === 'VICTORY' && lastRunStats && (
        <VictoryModal
          stats={lastRunStats}
          level={selectedLevel}
          hasNextLevel={hasNextLevel}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onMenu={handleMenu}
        />
      )}

      {/* Pause Screen */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => engine.resumeGame()}
          onRestart={handleReplay}
          onMenu={handleMenu}
        />
      )}

      {/* Level Selection Modal */}
      {gameState === 'LEVEL_SELECT' && (
        <LevelSelectModal
          currentLevelId={selectedLevel.id}
          onSelectLevel={handleSelectLevel}
          onBack={() => setGameState('MENU')}
        />
      )}

      {/* How To Play Modal */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onBack={() => setGameState('MENU')} />
      )}
    </main>
  );
}

