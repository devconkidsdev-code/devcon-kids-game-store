import { useCallback, useEffect, useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameOverScreen } from './components/GameOverScreen';
import { HUD } from './components/HUD';
import { PauseScreen } from './components/PauseScreen';
import { StartScreen } from './components/StartScreen';
import { GameStatus } from './types/game';
import { soundEngine } from './utils/audio';
import { INITIAL_PLAYER_CAR, INITIAL_SAFE_ZONE } from './utils/mapData';

const GAME_DURATION_SECONDS = 180; // 3 minutes

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('START');
  const [timeRemaining, setTimeRemaining] = useState<number>(GAME_DURATION_SECONDS);
  const [score, setScore] = useState<number>(0);
  const [passengersCount, setPassengersCount] = useState<number>(0);
  const [maxPassengers] = useState<number>(5);
  const [isEarthquakeActive, setIsEarthquakeActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [insideBuildingName, setInsideBuildingName] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('earthquakes_survival_high_score')) || 0;
    } catch {
      return 0;
    }
  });

  const [activeBannerMessage, setActiveBannerMessage] = useState<string | null>(null);
  const bannerTimeoutRef = useRef<number | null>(null);

  const [playerPos, setPlayerPos] = useState({
    x: INITIAL_PLAYER_CAR.x,
    y: INITIAL_PLAYER_CAR.y,
    angle: INITIAL_PLAYER_CAR.angle,
  });

  // Countdown timer effect
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }

        // Urgent audio ticking for final 10 seconds
        if (prev <= 10) {
          soundEngine.playTick(true);
        } else if (prev === 30 || prev === 60) {
          showNotification(`⏱️ ${prev} SECONDS REMAINING!`);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  const showNotification = useCallback((message: string, duration = 3000) => {
    setActiveBannerMessage(message);
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    bannerTimeoutRef.current = window.setTimeout(() => {
      setActiveBannerMessage(null);
    }, duration);
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setPassengersCount(0);
    setTimeRemaining(GAME_DURATION_SECONDS);
    setIsEarthquakeActive(false);
    setInsideBuildingName(null);
    setGameStatus('PLAYING');
    showNotification('🚨 MISSION STARTED: Find survivors and bring them to the Safe Zone!');
  };

  const handleTimeUp = () => {
    setGameStatus('GAMEOVER');
    soundEngine.stopContinuousSounds();
    setScore((currentScore) => {
      if (currentScore > highScore) {
        setHighScore(currentScore);
        try {
          localStorage.setItem('earthquakes_survival_high_score', String(currentScore));
        } catch {
          // safe
        }
      }
      return currentScore;
    });
  };

  const handleRestartGame = () => {
    handleStartGame();
  };

  const handleTogglePause = () => {
    if (gameStatus === 'PLAYING') {
      setGameStatus('PAUSED');
      soundEngine.stopContinuousSounds();
    } else if (gameStatus === 'PAUSED') {
      setGameStatus('PLAYING');
    }
  };

  const handleEndGame = () => {
    handleTimeUp();
  };

  const handleScoreUpdate = useCallback((deliveredBatch: number, newPassengers: number) => {
    if (deliveredBatch > 0) {
      // Points are awarded ONLY for people safely delivered to the Safe Zone
      setScore((prev) => {
        const next = prev + deliveredBatch;
        if (next > highScore) {
          setHighScore(next);
          try {
            localStorage.setItem('earthquakes_survival_high_score', String(next));
          } catch {
            // safe
          }
        }
        return next;
      });
      setPassengersCount(0);
    } else {
      // Just passenger count change
      setPassengersCount(newPassengers);
    }
  }, [highScore]);

  const handleRescueEvent = useCallback(
    (type: 'pickup' | 'delivery' | 'earthquake', details: { count?: number; name?: string }) => {
      if (type === 'pickup') {
        showNotification(`✅ Rescued ${details.name || 'Citizen'}! Drive to Safe Zone.`);
      } else if (type === 'delivery') {
        showNotification(`🎉 ${details.count || 1} People Safely Evacuated to Base Camp!`, 4000);
      } else if (type === 'earthquake') {
        setIsEarthquakeActive(true);
        showNotification('⚠️ AFTERSHOCK DETECTED! Watch for fissures and falling debris!', 5000);
        setTimeout(() => {
          setIsEarthquakeActive(false);
        }, 6500);
      }
    },
    [showNotification]
  );

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleHonk = () => {
    soundEngine.playHorn();
    showNotification('📢 HORN HONKED: Attracting nearby survivors!');
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#1a1a1a] select-none font-sans flex flex-col justify-between">
      {/* 2D 60FPS Game Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <GameCanvas
          isPlaying={gameStatus === 'PLAYING' || gameStatus === 'PAUSED'}
          isPaused={gameStatus === 'PAUSED'}
          onScoreUpdate={handleScoreUpdate}
          onRescueEvent={handleRescueEvent}
          onPlayerMoved={setPlayerPos}
          onBuildingStateChanged={setInsideBuildingName}
          onTogglePause={handleTogglePause}
          onTimeOut={handleTimeUp}
          timeRemaining={timeRemaining}
          isMuted={isMuted}
          score={score}
        />

        {/* Realtime In-Game HUD (Header & Radar) */}
        <HUD
          timeRemaining={timeRemaining}
          score={score}
          passengersCount={passengersCount}
          maxPassengers={maxPassengers}
          isEarthquakeActive={isEarthquakeActive}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onHonk={handleHonk}
          onPause={handleTogglePause}
          onEndGame={handleEndGame}
          isPaused={gameStatus === 'PAUSED'}
          insideBuildingName={insideBuildingName}
          playerPos={playerPos}
          safeZone={INITIAL_SAFE_ZONE}
          activeBannerMessage={activeBannerMessage}
        />

        {/* Start Game Modal Screen */}
        {gameStatus === 'START' && (
          <StartScreen onStartGame={handleStartGame} highScore={highScore} />
        )}

        {/* Pause Modal Screen */}
        {gameStatus === 'PAUSED' && (
          <PauseScreen
            onResume={handleTogglePause}
            onRestart={handleRestartGame}
            onEndGame={handleEndGame}
            timeRemaining={timeRemaining}
            score={score}
            passengersCount={passengersCount}
            maxPassengers={maxPassengers}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Game Over / Time's Up Screen */}
        {gameStatus === 'GAMEOVER' && (
          <GameOverScreen
            score={score}
            onRestartGame={handleRestartGame}
            highScore={highScore}
          />
        )}
      </div>

      {/* VIBRANT PALETTE STATUS FOOTER */}
      <div className="bg-[#111111] py-2 sm:py-2.5 px-4 sm:px-8 flex justify-between items-center text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gray-500 border-t border-white/5 font-mono z-40 shrink-0">
        <span>Disaster Coordination Area v1.1.0</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {insideBuildingName ? `Location: ${insideBuildingName}` : 'Operational Status: Active'}
        </span>
        <span>Region: Sector 7G - Ground Zero</span>
      </div>
    </main>
  );
}
