import React, { useState, useEffect, useCallback } from 'react';
import { generateLevel, TOTAL_LEVELS } from './game/levels';
import { LevelScore, LevelConfig } from './types';
import { GameCanvas } from './components/GameCanvas';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { ControlsGuide } from './components/ControlsGuide';
import { AudioSettings } from './components/AudioSettings';
import { GameState } from './game/engine';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(() => {
    const saved = localStorage.getItem('farmer_water_quest_current_lvl');
    return saved ? Math.min(TOTAL_LEVELS, Math.max(1, parseInt(saved, 10))) : 1;
  });

  const [unlockedLevelNum, setUnlockedLevelNum] = useState<number>(() => {
    const saved = localStorage.getItem('farmer_water_quest_unlocked_lvl');
    return saved ? Math.min(TOTAL_LEVELS, Math.max(1, parseInt(saved, 10))) : 1;
  });

  const [scores, setScores] = useState<{ [lvl: number]: LevelScore }>(() => {
    const saved = localStorage.getItem('farmer_water_quest_scores');
    return saved ? JSON.parse(saved) : {};
  });

  const [levelConfig, setLevelConfig] = useState<LevelConfig>(() => generateLevel(currentLevelNum));
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showAudioSettings, setShowAudioSettings] = useState<boolean>(false);
  const [victoryState, setVictoryState] = useState<GameState | null>(null);
  const [gameOverState, setGameOverState] = useState<GameState | null>(null);

  // Initialize sound on first user touch or click
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      soundEngine.init();
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);
    window.addEventListener('touchstart', handleFirstUserInteraction);

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  // Update level config when current level changes
  const startLevel = useCallback((lvlNum: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_LEVELS, lvlNum));
    setCurrentLevelNum(clamped);
    setLevelConfig(generateLevel(clamped));
    setVictoryState(null);
    setGameOverState(null);
    localStorage.setItem('farmer_water_quest_current_lvl', clamped.toString());
  }, []);

  const handleLevelComplete = useCallback((state: GameState) => {
    setVictoryState(state);

    // Calculate score
    const underParTime = state.gameTime <= state.level.parTimeSeconds;
    const highHealth = state.player.health >= 70;
    let stars = 1;
    if (underParTime) stars++;
    if (highHealth || state.stealthBonusMaintained) stars++;

    const newScore: LevelScore = {
      stars,
      timeSeconds: state.gameTime,
      waterDelivered: state.level.waterGoal,
      stealthBonus: state.stealthBonusMaintained,
      completed: true,
    };

    setScores((prev) => {
      const updated = {
        ...prev,
        [state.level.levelNumber]: prev[state.level.levelNumber]
          ? {
              ...prev[state.level.levelNumber],
              stars: Math.max(prev[state.level.levelNumber].stars, stars),
              timeSeconds: Math.min(prev[state.level.levelNumber].timeSeconds, state.gameTime),
            }
          : newScore,
      };
      localStorage.setItem('farmer_water_quest_scores', JSON.stringify(updated));
      return updated;
    });

    // Unlock next level
    if (state.level.levelNumber < TOTAL_LEVELS) {
      setUnlockedLevelNum((prev) => {
        const next = Math.max(prev, state.level.levelNumber + 1);
        localStorage.setItem('farmer_water_quest_unlocked_lvl', next.toString());
        return next;
      });
    }
  }, []);

  const handleGameOver = useCallback((state: GameState) => {
    setGameOverState(state);
  }, []);

  const handleNextLevel = () => {
    if (currentLevelNum < TOTAL_LEVELS) {
      startLevel(currentLevelNum + 1);
    } else {
      setShowLevelSelect(true);
    }
  };

  const handleRetry = () => {
    startLevel(currentLevelNum);
  };

  return (
    <div id="game-app-root" className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Game Canvas Viewport */}
      <GameCanvas
        key={`level-${levelConfig.levelNumber}`}
        level={levelConfig}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenGuide={() => setShowGuide(true)}
        onOpenAudioSettings={() => setShowAudioSettings(true)}
        onLevelComplete={handleLevelComplete}
        onGameOver={handleGameOver}
        onNextLevelDirect={handleNextLevel}
      />

      {/* Level Select Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          currentLevel={currentLevelNum}
          unlockedLevel={unlockedLevelNum}
          scores={scores}
          onSelectLevel={startLevel}
          onClose={() => setShowLevelSelect(false)}
          onUnlockAll={() => {
            setUnlockedLevelNum(TOTAL_LEVELS);
            localStorage.setItem('farmer_water_quest_unlocked_lvl', TOTAL_LEVELS.toString());
          }}
        />
      )}

      {/* Controls & Survival Guide Modal */}
      {showGuide && (
        <ControlsGuide onClose={() => setShowGuide(false)} />
      )}

      {/* Audio Settings & Sound Test Modal */}
      {showAudioSettings && (
        <AudioSettings onClose={() => setShowAudioSettings(false)} />
      )}

      {/* Victory Modal */}
      {victoryState && (
        <VictoryModal
          gameState={victoryState}
          onNextLevel={handleNextLevel}
          onReplay={handleRetry}
          onOpenLevelSelect={() => {
            setVictoryState(null);
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Game Over Modal */}
      {gameOverState && (
        <GameOverModal
          gameState={gameOverState}
          onRetry={handleRetry}
          onSkipLevel={() => {
            setGameOverState(null);
            handleNextLevel();
          }}
          onOpenLevelSelect={() => {
            setGameOverState(null);
            setShowLevelSelect(true);
          }}
        />
      )}
    </div>
  );
}
