import React, { useState, useMemo, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { StartScreen } from './components/StartScreen';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HelpModal } from './components/HelpModal';
import { PauseModal } from './components/PauseModal';
import { soundSynth } from './audio/SoundSynth';
import { Difficulty, GameStatus, HighScoreRecord } from './types';

export default function App() {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [, setRenderTrigger] = useState(0);

  // Force render callback when engine status updates
  const handleEngineStateChange = useCallback(() => {
    setGameStatus(engine.status);
    setRenderTrigger(prev => prev + 1);
  }, [engine]);

  // Start Campaign
  const handleStartCampaign = useCallback((difficulty: Difficulty) => {
    engine.startCampaign(0, difficulty);
    setGameStatus('PLAYING');
  }, [engine]);

  // Start Endless
  const handleStartEndless = useCallback((difficulty: Difficulty) => {
    engine.startEndless(1, difficulty);
    setGameStatus('PLAYING');
  }, [engine]);

  // Next Level
  const handleNextLevel = useCallback(() => {
    engine.nextLevel();
    setGameStatus(engine.status);
  }, [engine]);

  // Retry Level
  const handleRetry = useCallback(() => {
    engine.retryLevel();
    setGameStatus('PLAYING');
  }, [engine]);

  // Return to Menu
  const handleMenu = useCallback(() => {
    engine.status = 'MENU';
    soundSynth.stopBGM();
    soundSynth.stopHeartbeat();
    setGameStatus('MENU');
  }, [engine]);

  // Pause / Resume Toggle
  const handlePauseToggle = useCallback(() => {
    if (engine.status === 'PLAYING') {
      engine.status = 'PAUSED';
      setGameStatus('PAUSED');
    } else if (engine.status === 'PAUSED') {
      engine.status = 'PLAYING';
      setGameStatus('PLAYING');
    }
  }, [engine]);

  // Mute Toggle
  const handleMuteToggle = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundSynth.setMute(nextMuted);
  }, [isMuted]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-indigo-950 font-sans text-white select-none">
      {/* 2D Canvas Viewport */}
      <GameCanvas engine={engine} onStateChange={handleEngineStateChange} />

      {/* In-Game HUD Overlay */}
      {(gameStatus === 'PLAYING' || gameStatus === 'PAUSED') && (
        <>
          <HUD
            engine={engine}
            onPauseToggle={handlePauseToggle}
            onMuteToggle={handleMuteToggle}
            isMuted={isMuted}
            isPaused={gameStatus === 'PAUSED'}
          />
          <TouchControls engine={engine} />
        </>
      )}

      {/* Start Screen */}
      {gameStatus === 'MENU' && (
        <StartScreen
          onStartCampaign={handleStartCampaign}
          onStartEndless={handleStartEndless}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenHelp={() => setShowHelp(true)}
        />
      )}

      {/* Victory Modal */}
      {gameStatus === 'VICTORY' && (
        <VictoryModal
          engine={engine}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          onMenu={handleMenu}
        />
      )}

      {/* Game Over Modal */}
      {gameStatus === 'GAMEOVER' && (
        <GameOverModal
          engine={engine}
          onRetry={handleRetry}
          onMenu={handleMenu}
        />
      )}

      {/* Pause Modal */}
      {gameStatus === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            engine.status = 'PLAYING';
            setGameStatus('PLAYING');
          }}
          onRetry={handleRetry}
          onMenu={handleMenu}
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          records={engine.getHighScores()}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Help & Guide Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </main>
  );
}
