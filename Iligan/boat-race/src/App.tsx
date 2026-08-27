import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BoatCustomization, GamePhase, GameSettings, Obstacle, PathIndex, PlayerRunData, RoundResult } from './types/game';
import { PATH_CONFIGS, TRACK_LENGTH, generateTrackObstacles } from './utils/trackGenerator';
import { DEFAULT_PLAYER_1, DEFAULT_PLAYER_2 } from './utils/playerPresets';
import { soundManager } from './utils/audio';
import { TrackCanvas } from './components/TrackCanvas';
import { HUD } from './components/HUD';
import { ControlDeck } from './components/ControlDeck';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { FinalWinnerModal } from './components/FinalWinnerModal';
import { RulesModal } from './components/RulesModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { Play, RotateCcw, Settings, HelpCircle, Trophy, Zap, ShieldAlert, Sparkles } from 'lucide-react';

const INITIAL_PLAYER_DATA: PlayerRunData = {
  timeElapsed: 0,
  timeLeft: 40,
  livesRemaining: 5,
  finished: false,
  dnf: false,
  distanceTraveled: 0,
  obstaclesHit: 0,
  starsCollected: 0,
  pathSwitches: 0,
  score: 0,
  pathHistory: []
};

export default function App() {
  // Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    roundDuration: 40,
    trackLength: TRACK_LENGTH,
    soundEnabled: true,
    musicEnabled: false,
    mode: 'turn_based',
    vsAI: false
  });

  // Customization
  const [player1Custom, setPlayer1Custom] = useState<BoatCustomization>(DEFAULT_PLAYER_1);
  const [player2Custom, setPlayer2Custom] = useState<BoatCustomization>(DEFAULT_PLAYER_2);

  // Championship State
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [roundNumber, setRoundNumber] = useState<1 | 2>(1);
  const [activePlayerId, setActivePlayerId] = useState<'player1' | 'player2'>('player1');
  const [turnInRound, setTurnInRound] = useState<1 | 2>(1); // For turn-based: Turn 1 vs Turn 2
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Active Race Obstacles for this round
  const [obstacles, setObstacles] = useState<Obstacle[]>(() => generateTrackObstacles(TRACK_LENGTH, 101));

  // Primary Boat Dynamic Physics State
  const boatRef = useRef({
    x: 100,
    path: 1 as PathIndex,
    speed: 0,
    maxSpeed: 8.5,
    invincibleTimer: 0,
    turboTimer: 0,
    lives: 5,
    obstaclesHit: 0,
    starsCollected: 0,
    pathSwitches: 0,
    score: 0,
    timeElapsed: 0,
    pathHistory: [] as { t: number; x: number; path: PathIndex }[]
  });

  // Second Boat Physics State (for simultaneous mode)
  const boat2Ref = useRef({
    x: 100,
    path: 1 as PathIndex,
    speed: 0,
    maxSpeed: 8.5,
    invincibleTimer: 0,
    turboTimer: 0,
    lives: 5,
    obstaclesHit: 0,
    starsCollected: 0,
    pathSwitches: 0,
    score: 0,
    timeElapsed: 0
  });

  // Ghost boat run storage (for turn-based 2nd run comparison)
  const ghostRunRef = useRef<{ pathHistory: { t: number; x: number; path: PathIndex }[]; custom: BoatCustomization } | null>(null);

  // Control inputs state
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const [runPressed, setRunPressed] = useState<boolean>(false);
  const [stopPressed, setStopPressed] = useState<boolean>(false);
  const [p2RunPressed, setP2RunPressed] = useState<boolean>(false);
  const [p2StopPressed, setP2StopPressed] = useState<boolean>(false);

  // Visual screen shake
  const [screenShake, setScreenShake] = useState<number>(0);

  // Live HUD render mirrors
  const [hudState, setHudState] = useState({
    boatX: 100,
    boatPath: 1 as PathIndex,
    boatSpeed: 0,
    boatLives: 5,
    timeElapsed: 0,
    timeLeft: 45,
    p1Score: 0,
    p2Score: 0,
    p1Distance: 100,
    p2Distance: 100,
    p1Lives: 5,
    p2Lives: 5,
    ghostPos: null as { x: number; y: number; path: PathIndex; customization: BoatCustomization } | null,
    secondBoatPos: null as { x: number; y: number; path: PathIndex; speed: number; invincible: boolean; customization: BoatCustomization } | null
  });

  // Round summary data
  const [currentRoundP1Data, setCurrentRoundP1Data] = useState<PlayerRunData>(INITIAL_PLAYER_DATA);
  const [currentRoundP2Data, setCurrentRoundP2Data] = useState<PlayerRunData>(INITIAL_PLAYER_DATA);

  // Sound sync
  useEffect(() => {
    soundManager.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  useEffect(() => {
    soundManager.setMusicMuted(!settings.musicEnabled);
    if (settings.musicEnabled && gamePhase === 'racing') {
      soundManager.startMusic();
    } else {
      soundManager.stopMusic();
    }
  }, [settings.musicEnabled, gamePhase]);

  // Path Y helper (Canvas height is 480, top margin 70)
  const getPathCenterY = (path: PathIndex) => {
    const laneHeight = (480 - 140) / 3;
    const topMargin = 70;
    return topMargin + path * laneHeight + laneHeight / 2;
  };

  // Switch Path Action for Active Player
  const handleSwitchPath = useCallback((direction: 'up' | 'down') => {
    if (gamePhase !== 'racing') return;
    const current = boatRef.current.path;
    let next: PathIndex = current;
    if (direction === 'up' && current > 0) {
      next = (current - 1) as PathIndex;
    } else if (direction === 'down' && current < 2) {
      next = (current + 1) as PathIndex;
    }

    if (next !== current) {
      boatRef.current.path = next;
      boatRef.current.pathSwitches++;
      soundManager.playSplash();
      setHudState(prev => ({ ...prev, boatPath: next }));
    }
  }, [gamePhase]);

  // Switch Path Action for Player 2 (in simultaneous mode)
  const handleSwitchPathP2 = useCallback((direction: 'up' | 'down') => {
    if (gamePhase !== 'racing' || settings.mode !== 'simultaneous') return;
    const current = boat2Ref.current.path;
    let next: PathIndex = current;
    if (direction === 'up' && current > 0) {
      next = (current - 1) as PathIndex;
    } else if (direction === 'down' && current < 2) {
      next = (current + 1) as PathIndex;
    }

    if (next !== current) {
      boat2Ref.current.path = next;
      boat2Ref.current.pathSwitches++;
      soundManager.playSplash();
    }
  }, [gamePhase, settings.mode]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling for game controls
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      keysPressedRef.current[e.code] = true;

      if (e.code === 'KeyW' || (settings.mode === 'turn_based' && e.code === 'ArrowUp')) {
        handleSwitchPath('up');
      } else if (e.code === 'KeyS' || (settings.mode === 'turn_based' && e.code === 'ArrowDown')) {
        handleSwitchPath('down');
      } else if (settings.mode === 'simultaneous' && e.code === 'ArrowUp') {
        handleSwitchPathP2('up');
      } else if (settings.mode === 'simultaneous' && e.code === 'ArrowDown') {
        handleSwitchPathP2('down');
      } else if (e.code === 'KeyH') {
        soundManager.playHorn();
      } else if (e.code === 'KeyP') {
        if (gamePhase === 'racing') setGamePhase('paused');
        else if (gamePhase === 'paused') setGamePhase('racing');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleSwitchPath, handleSwitchPathP2, gamePhase, settings.mode]);

  // Start Countdown Sequence before a race run
  const startCountdown = useCallback(() => {
    setGamePhase('countdown');
    setCountdownNum(3);
    soundManager.playCountdown(false);

    let count = 3;
    const interval = window.setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        soundManager.playCountdown(false);
      } else if (count === 0) {
        setCountdownNum(0);
        soundManager.playCountdown(true);
      } else {
        clearInterval(interval);
        setGamePhase('racing');
      }
    }, 900);
  }, []);

  // Initialize a new round or turn
  const setupTurn = useCallback((round: 1 | 2, starter: 'player1' | 'player2', turn: 1 | 2) => {
    // Generate new obstacles with seed per round
    const seed = round === 1 ? 101 : 202;
    const newObs = generateTrackObstacles(settings.trackLength, seed);
    setObstacles(newObs);

    // Determine who is actively running
    const activePlayer = turn === 1 ? starter : (starter === 'player1' ? 'player2' : 'player1');
    setActivePlayerId(activePlayer);
    setRoundNumber(round);
    setTurnInRound(turn);

    // Reset primary boat
    boatRef.current = {
      x: 120,
      path: 1,
      speed: 0,
      maxSpeed: 9.4,
      invincibleTimer: 0,
      turboTimer: 0,
      lives: 5,
      obstaclesHit: 0,
      starsCollected: 0,
      pathSwitches: 0,
      score: 0,
      timeElapsed: 0,
      pathHistory: []
    };

    // Reset second boat if simultaneous
    boat2Ref.current = {
      x: 120,
      path: 1,
      speed: 0,
      maxSpeed: 9.4,
      invincibleTimer: 0,
      turboTimer: 0,
      lives: 5,
      obstaclesHit: 0,
      starsCollected: 0,
      pathSwitches: 0,
      score: 0,
      timeElapsed: 0
    };

    setHudState({
      boatX: 120,
      boatPath: 1,
      boatSpeed: 0,
      boatLives: 5,
      timeElapsed: 0,
      timeLeft: settings.roundDuration,
      p1Score: roundResults.reduce((sum, r) => sum + r.player1Result.score, 0),
      p2Score: roundResults.reduce((sum, r) => sum + r.player2Result.score, 0),
      p1Distance: 120,
      p2Distance: 120,
      p1Lives: 5,
      p2Lives: 5,
      ghostPos: null,
      secondBoatPos: null
    });

    startCountdown();
  }, [settings.trackLength, settings.roundDuration, roundResults, startCountdown]);

  // Start Championship from Round 1
  const startNewChampionship = () => {
    setRoundResults([]);
    setCurrentRoundP1Data(INITIAL_PLAYER_DATA);
    setCurrentRoundP2Data(INITIAL_PLAYER_DATA);
    ghostRunRef.current = null;
    // Round 1: Player 1 starts first!
    setupTurn(1, 'player1', 1);
  };

  // Main 60fps Game Loop
  useEffect(() => {
    if (gamePhase !== 'racing') {
      soundManager.stopEngine();
      return;
    }

    let isMounted = true;
    let animId = 0;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (!isMounted) return;
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      const keys = keysPressedRef.current;
      const boat = boatRef.current;
      const boat2 = boat2Ref.current;

      // 1. Primary Boat Input & Acceleration
      const isRunKey = keys['KeyD'] || keys['Space'] || (settings.mode === 'turn_based' && keys['ArrowRight']) || runPressed;
      const isStopKey = keys['KeyA'] || (settings.mode === 'turn_based' && keys['ArrowLeft']) || stopPressed;

      // Current Path Multiplier
      const pathMultiplier = PATH_CONFIGS[boat.path].speedMultiplier;
      const turboBoost = boat.turboTimer > 0 ? 1.4 : 1.0;

      if (isRunKey) {
        boat.speed = Math.min(boat.speed + 14 * dt, boat.maxSpeed * pathMultiplier * turboBoost);
      } else if (isStopKey) {
        boat.speed = Math.max(boat.speed - 24 * dt, 0);
      } else {
        // Natural water drag friction
        boat.speed = Math.max(boat.speed - 3.8 * dt, 0);
      }

      // Move boat forward
      boat.x += boat.speed * 60 * dt;
      boat.timeElapsed += dt;

      // Invincibility & Turbo timers
      if (boat.invincibleTimer > 0) boat.invincibleTimer -= dt;
      if (boat.turboTimer > 0) boat.turboTimer -= dt;

      // Record path history for ghost racer
      boat.pathHistory.push({
        t: boat.timeElapsed,
        x: boat.x,
        path: boat.path
      });

      // Sound update for engine
      soundManager.updateEngine(boat.speed / boat.maxSpeed, boat.speed > 0.1);

      // 2. Obstacle & Pickup Collisions for Primary Boat
      obstacles.forEach(obs => {
        if (obs.collected) return;
        // Collision check when on same path and overlapping x coordinates
        if (obs.path === boat.path && Math.abs(boat.x - obs.x) < 32) {
          if (obs.isPickup) {
            obs.collected = true;
            if (obs.type === 'star') {
              boat.starsCollected++;
              boat.score += 150;
              soundManager.playStarPickup();
            } else if (obs.type === 'turbo_pad') {
              boat.turboTimer = 2.0;
              boat.score += 80;
              soundManager.playTurbo();
            }
          } else {
            // Hazard Obstacle Collision!
            if (boat.invincibleTimer <= 0) {
              boat.lives--;
              boat.obstaclesHit++;
              boat.invincibleTimer = 1.6;
              boat.speed = Math.max(boat.speed * 0.2, 1.0); // drop speed
              setScreenShake(0.35);
              soundManager.playCollision();
              soundManager.playLifeLost();

              // AUTOMATIC PATH REDIRECTION AS SPECIFIED IN PROMPT:
              // "Example: If a player is traveling on the second path and collides with an obstacle, the game may automatically move or redirect the player to either the first or third path."
              const oldPath = boat.path;
              if (oldPath === 1) {
                // If in Middle path, bounce to Upper (0) or Lower (2)
                const targetPath: PathIndex = Math.random() > 0.5 ? 0 : 2;
                boat.path = targetPath;
                soundManager.playSplash();
              } else if (oldPath === 0) {
                // If in Upper path, bounce down to Middle (1)
                boat.path = 1;
                soundManager.playSplash();
              } else if (oldPath === 2) {
                // If in Lower path, bounce up to Middle (1)
                boat.path = 1;
                soundManager.playSplash();
              }
            }
          }
        }
      });

      // 3. Second Boat Logic (Simultaneous Mode)
      if (settings.mode === 'simultaneous') {
        const isRunKey2 = keys['ArrowRight'] || p2RunPressed;
        const isStopKey2 = keys['ArrowLeft'] || p2StopPressed;
        const pathMult2 = PATH_CONFIGS[boat2.path].speedMultiplier;
        const turbo2 = boat2.turboTimer > 0 ? 1.4 : 1.0;

        if (isRunKey2) {
          boat2.speed = Math.min(boat2.speed + 14 * dt, boat2.maxSpeed * pathMult2 * turbo2);
        } else if (isStopKey2) {
          boat2.speed = Math.max(boat2.speed - 24 * dt, 0);
        } else {
          boat2.speed = Math.max(boat2.speed - 3.8 * dt, 0);
        }

        boat2.x += boat2.speed * 60 * dt;
        boat2.timeElapsed += dt;
        if (boat2.invincibleTimer > 0) boat2.invincibleTimer -= dt;
        if (boat2.turboTimer > 0) boat2.turboTimer -= dt;

        // Obstacles for boat 2
        obstacles.forEach(obs => {
          if (obs.path === boat2.path && Math.abs(boat2.x - obs.x) < 32 && !obs.collected) {
            if (obs.isPickup) {
              obs.collected = true;
              if (obs.type === 'star') boat2.starsCollected++;
              else if (obs.type === 'turbo_pad') boat2.turboTimer = 2.0;
            } else if (boat2.invincibleTimer <= 0) {
              boat2.lives--;
              boat2.obstaclesHit++;
              boat2.invincibleTimer = 1.6;
              boat2.speed = Math.max(boat2.speed * 0.2, 1.0);
              // Redirection for boat 2
              if (boat2.path === 1) boat2.path = Math.random() > 0.5 ? 0 : 2;
              else boat2.path = 1;
            }
          }
        });
      }

      // 4. Ghost Boat Position Calculation (Turn-Based Run 2)
      let ghostPosData = null;
      if (settings.mode === 'turn_based' && turnInRound === 2 && ghostRunRef.current) {
        const history = ghostRunRef.current.pathHistory;
        const targetTime = boat.timeElapsed;
        // Find closest point in ghost history
        const frame = history.find(p => p.t >= targetTime) || history[history.length - 1];
        if (frame) {
          ghostPosData = {
            x: frame.x,
            y: getPathCenterY(frame.path),
            path: frame.path,
            customization: ghostRunRef.current.custom
          };
        }
      }

      // 5. Screen shake decay
      setScreenShake(prev => Math.max(prev - dt * 2, 0));

      // 6. Check Race End Conditions
      const timeLeft = Math.max(settings.roundDuration - boat.timeElapsed, 0);
      const isFinished = boat.x >= settings.trackLength;
      const isEliminated = boat.lives <= 0 || timeLeft <= 0;

      // Update HUD Mirror
      const p1Dist = activePlayerId === 'player1' ? boat.x : (ghostRunRef.current ? (turnInRound === 2 ? ghostRunRef.current.pathHistory[ghostRunRef.current.pathHistory.length - 1]?.x || 0 : 0) : (settings.mode === 'simultaneous' ? boat.x : 0));
      const p2Dist = activePlayerId === 'player2' ? boat.x : (settings.mode === 'simultaneous' ? boat2.x : (ghostRunRef.current ? ghostRunRef.current.pathHistory[ghostRunRef.current.pathHistory.length - 1]?.x || 0 : 0));

      setHudState({
        boatX: boat.x,
        boatPath: boat.path,
        boatSpeed: boat.speed,
        boatLives: boat.lives,
        timeElapsed: boat.timeElapsed,
        timeLeft,
        p1Score: (activePlayerId === 'player1' ? boat.score : 0) + roundResults.reduce((s, r) => s + r.player1Result.score, 0),
        p2Score: (activePlayerId === 'player2' ? boat.score : (settings.mode === 'simultaneous' ? boat2.score : 0)) + roundResults.reduce((s, r) => s + r.player2Result.score, 0),
        p1Distance: activePlayerId === 'player1' ? boat.x : (settings.mode === 'simultaneous' ? boat.x : 100),
        p2Distance: activePlayerId === 'player2' ? boat.x : (settings.mode === 'simultaneous' ? boat2.x : 100),
        p1Lives: activePlayerId === 'player1' ? boat.lives : (settings.mode === 'simultaneous' ? boat.lives : 5),
        p2Lives: activePlayerId === 'player2' ? boat.lives : (settings.mode === 'simultaneous' ? boat2.lives : 5),
        ghostPos: ghostPosData,
        secondBoatPos: settings.mode === 'simultaneous' ? {
          x: boat2.x,
          y: getPathCenterY(boat2.path),
          path: boat2.path,
          speed: boat2.speed,
          invincible: boat2.invincibleTimer > 0,
          customization: player2Custom
        } : null
      });

      if (isFinished || isEliminated) {
        soundManager.stopEngine();
        if (isFinished) {
          soundManager.playFinishFanfare();
        }
        handleRaceEnd(isFinished, isEliminated, timeLeft);
        return;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [gamePhase, settings, activePlayerId, turnInRound, runPressed, stopPressed, p2RunPressed, p2StopPressed, obstacles, roundResults, player2Custom]);

  // Handle Race Finish / DNF End Logic
  const handleRaceEnd = (finished: boolean, dnf: boolean, timeLeft: number) => {
    const boat = boatRef.current;
    // Calculate final run points:
    // +1000 for finishing + (timeLeft * 20) + (lives * 100) + (stars * 150)
    let runScore = boat.score;
    if (finished && !dnf) {
      runScore += 1000 + Math.floor(timeLeft * 25) + (boat.lives * 120);
    } else {
      runScore = Math.max(runScore, 100); // partial points for distance
    }

    const runData: PlayerRunData = {
      timeElapsed: boat.timeElapsed,
      timeLeft,
      livesRemaining: Math.max(boat.lives, 0),
      finished,
      dnf,
      distanceTraveled: Math.min(boat.x, settings.trackLength),
      obstaclesHit: boat.obstaclesHit,
      starsCollected: boat.starsCollected,
      pathSwitches: boat.pathSwitches,
      score: runScore,
      pathHistory: boat.pathHistory
    };

    if (settings.mode === 'turn_based') {
      if (turnInRound === 1) {
        // Save first runner's ghost
        ghostRunRef.current = {
          pathHistory: boat.pathHistory,
          custom: activePlayerId === 'player1' ? player1Custom : player2Custom
        };

        if (activePlayerId === 'player1') {
          setCurrentRoundP1Data(runData);
        } else {
          setCurrentRoundP2Data(runData);
        }

        setGamePhase('round_over');
      } else {
        // Turn 2 complete -> Complete Round
        const p1Data = activePlayerId === 'player1' ? runData : currentRoundP1Data;
        const p2Data = activePlayerId === 'player2' ? runData : currentRoundP2Data;

        // Determine round winner
        let roundWinner: 'player1' | 'player2' | 'tie' = 'tie';
        if (p1Data.finished && !p2Data.finished) roundWinner = 'player1';
        else if (!p1Data.finished && p2Data.finished) roundWinner = 'player2';
        else if (p1Data.finished && p2Data.finished) {
          if (p1Data.score > p2Data.score) roundWinner = 'player1';
          else if (p2Data.score > p1Data.score) roundWinner = 'player2';
          else roundWinner = p1Data.timeElapsed <= p2Data.timeElapsed ? 'player1' : 'player2';
        }

        const starter = roundNumber === 1 ? 'player1' : 'player2';
        const roundRes: RoundResult = {
          roundNumber,
          starterPlayerId: starter,
          player1Result: p1Data,
          player2Result: p2Data,
          winner: roundWinner
        };

        const updatedResults = [...roundResults, roundRes];
        setRoundResults(updatedResults);

        if (activePlayerId === 'player1') setCurrentRoundP1Data(runData);
        else setCurrentRoundP2Data(runData);

        setGamePhase('round_over');
      }
    } else {
      // Simultaneous mode: record both
      const b2 = boat2Ref.current;
      let p2Score = b2.score;
      const b2Finished = b2.x >= settings.trackLength;
      const b2Dnf = b2.lives <= 0;
      if (b2Finished && !b2Dnf) {
        p2Score += 1000 + Math.floor(timeLeft * 25) + (b2.lives * 120);
      }

      const p2Data: PlayerRunData = {
        timeElapsed: b2.timeElapsed,
        timeLeft,
        livesRemaining: Math.max(b2.lives, 0),
        finished: b2Finished,
        dnf: b2Dnf,
        distanceTraveled: Math.min(b2.x, settings.trackLength),
        obstaclesHit: b2.obstaclesHit,
        starsCollected: b2.starsCollected,
        pathSwitches: b2.pathSwitches,
        score: p2Score,
        pathHistory: []
      };

      const roundRes: RoundResult = {
        roundNumber,
        starterPlayerId: 'player1',
        player1Result: runData,
        player2Result: p2Data,
        winner: runData.score >= p2Data.score ? 'player1' : 'player2'
      };

      setRoundResults([...roundResults, roundRes]);
      setCurrentRoundP1Data(runData);
      setCurrentRoundP2Data(p2Data);
      setGamePhase('round_over');
    }
  };

  // Continue Handler from Round Summary Modal
  const handleSummaryContinue = () => {
    if (settings.mode === 'turn_based') {
      if (turnInRound === 1) {
        // Start Turn 2 of same round!
        const nextStarter = roundNumber === 1 ? 'player1' : 'player2';
        setupTurn(roundNumber, nextStarter, 2);
      } else {
        // Round complete! Check if Round 1 or Round 2
        if (roundNumber === 1) {
          // PROMPT SPECIFICATION: "Round 2: Player 2 starts first, followed by Player 1."
          ghostRunRef.current = null;
          setupTurn(2, 'player2', 1);
        } else {
          // Both 2 rounds complete -> Grand Final Podium!
          setGamePhase('final_results');
        }
      }
    } else {
      // Simultaneous mode
      if (roundNumber === 1) {
        setupTurn(2, 'player2', 1);
      } else {
        setGamePhase('final_results');
      }
    }
  };

  // Camera X calculation: Follows active boat with slight forward offset
  const cameraX = Math.max(0, hudState.boatX - 220);

  // Total scores
  const p1TotalScore = roundResults.reduce((acc, r) => acc + r.player1Result.score, 0) + (gamePhase === 'racing' && activePlayerId === 'player1' ? hudState.boatLives * 10 : 0);
  const p2TotalScore = roundResults.reduce((acc, r) => acc + r.player2Result.score, 0) + (gamePhase === 'racing' && activePlayerId === 'player2' ? hudState.boatLives * 10 : 0);

  // Compute Next Action for Summary Modal
  let summaryNextAction: 'player2_turn' | 'player1_turn' | 'next_round' | 'final_results' = 'next_round';
  if (settings.mode === 'turn_based') {
    if (turnInRound === 1) {
      summaryNextAction = roundNumber === 1 ? 'player2_turn' : 'player1_turn';
    } else {
      summaryNextAction = roundNumber === 1 ? 'next_round' : 'final_results';
    }
  } else {
    summaryNextAction = roundNumber === 1 ? 'next_round' : 'final_results';
  }

  return (
    <div className="min-h-screen bg-sky-950 text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-x-hidden font-sans">
      
      {/* Top HUD Component */}
      <div className="w-full max-w-5xl">
        <HUD
          phase={gamePhase}
          roundNumber={roundNumber}
          activePlayerId={activePlayerId}
          mode={settings.mode}
          timeLeft={hudState.timeLeft}
          timeElapsed={hudState.timeElapsed}
          currentPath={hudState.boatPath}
          player1Custom={player1Custom}
          player2Custom={player2Custom}
          p1Lives={hudState.p1Lives}
          p2Lives={hudState.p2Lives}
          p1Distance={hudState.p1Distance}
          p2Distance={hudState.p2Distance}
          trackLength={settings.trackLength}
          p1Score={hudState.p1Score}
          p2Score={hudState.p2Score}
          currentSpeedKts={hudState.boatSpeed * 4.2}
          soundEnabled={settings.soundEnabled}
          musicEnabled={settings.musicEnabled}
          onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          onToggleMusic={() => setSettings(s => ({ ...s, musicEnabled: !s.musicEnabled }))}
          onOpenRules={() => setShowRules(true)}
          onTogglePause={() => setGamePhase(p => p === 'racing' ? 'paused' : 'racing')}
          isPaused={gamePhase === 'paused'}
        />
      </div>

      {/* Main Game Stage Area */}
      <div className="relative w-full max-w-5xl my-2 flex-1 flex flex-col items-center justify-center min-h-[360px] md:min-h-[440px]">
        
        {/* Track Canvas */}
        <TrackCanvas
          cameraX={cameraX}
          trackLength={settings.trackLength}
          obstacles={obstacles}
          boatX={hudState.boatX}
          boatY={getPathCenterY(hudState.boatPath)}
          boatPath={hudState.boatPath}
          boatSpeed={hudState.boatSpeed}
          boatInvincible={boatRef.current.invincibleTimer > 0}
          boatCustomization={activePlayerId === 'player1' ? player1Custom : player2Custom}
          ghostData={hudState.ghostPos}
          secondBoat={hudState.secondBoatPos}
          shakeTime={screenShake}
        />

        {/* In-Game Active Floating Race HUD: Prominent Timer & Life Numbers */}
        {(gamePhase === 'racing' || gamePhase === 'countdown' || gamePhase === 'paused') && (
          <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none z-10 gap-2">
            
            {/* Left: Prominent In-Game Life Number */}
            <div className="bg-sky-950/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 border-sky-400/50 shadow-xl flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-xl sm:text-2xl animate-pulse">❤️</span>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sky-200">
                    {settings.mode === 'turn_based' ? (activePlayerId === 'player1' ? player1Custom.name : player2Custom.name) : 'P1 LIVES'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-xl font-black text-white leading-none">
                      {settings.mode === 'turn_based' 
                        ? (activePlayerId === 'player1' ? hudState.p1Lives : hudState.p2Lives)
                        : hudState.p1Lives}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-sky-300/80">/ 5 LIVES</span>
                  </div>
                </div>
              </div>

              {/* In simultaneous mode, show Player 2 lives too */}
              {settings.mode === 'simultaneous' && (
                <div className="flex items-center gap-1 sm:gap-1.5 pl-2 border-l border-white/20">
                  <span className="text-xl sm:text-2xl">❤️</span>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sky-200">
                      {player2Custom.name}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-xl font-black text-white leading-none">
                        {hudState.p2Lives}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-sky-300/80">/ 5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Live Speed & Lane Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-sky-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border-2 border-yellow-400/40 shadow-lg">
              <span className="text-xs font-black text-yellow-300">
                {(hudState.boatSpeed * 4.2).toFixed(0)} KTS
              </span>
              <span className="text-white/40 font-bold">•</span>
              <span className="text-[11px] font-black text-cyan-200 uppercase">
                {PATH_CONFIGS[hudState.boatPath].name}
              </span>
            </div>

            {/* Right: High-Contrast In-Game Race Timer */}
            <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 backdrop-blur-md shadow-xl flex items-center gap-2 sm:gap-2.5 pointer-events-auto transition-all ${
              hudState.timeLeft <= 10
                ? 'bg-red-950/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-sky-950/85 border-yellow-400/70 shadow-lg'
            }`}>
              <span className="text-lg sm:text-xl">⏱️</span>
              <div className="flex flex-col items-end">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-yellow-300">
                  {hudState.timeLeft <= 10 ? 'HURRY!' : 'TIME LEFT'}
                </span>
                <span className={`text-base sm:text-xl font-mono font-black tracking-wider leading-none ${
                  hudState.timeLeft <= 10 ? 'text-red-400 font-extrabold' : 'text-yellow-400'
                }`}>
                  00:{Math.max(0, Math.floor(hudState.timeLeft)).toString().padStart(2, '0')}.{Math.max(0, Math.floor((hudState.timeLeft % 1) * 10))}s
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Countdown Overlay (3, 2, 1, GO!) */}
        {gamePhase === 'countdown' && (
          <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-3xl z-20 animate-in zoom-in-75 duration-200">
            <div className="text-center flex flex-col items-center">
              <div className="text-xs uppercase tracking-widest text-yellow-300 font-black bg-sky-900/90 px-6 py-1.5 rounded-full border-2 border-yellow-400/40 mb-3 shadow-lg">
                {activePlayerId === 'player1' ? player1Custom.name : player2Custom.name} GET READY!
              </div>
              <div className={`font-black italic text-8xl md:text-9xl drop-shadow-[0_0_40px_rgba(250,204,21,0.9)] ${
                countdownNum === 0 ? 'text-emerald-400 animate-ping' : 'text-yellow-400 animate-bounce'
              }`}>
                {countdownNum === 0 ? 'GO!' : countdownNum}
              </div>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {gamePhase === 'paused' && (
          <div className="absolute inset-0 bg-sky-950/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-20">
            <div className="bg-sky-900 border-4 border-sky-700 rounded-3xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl max-w-sm">
              <h3 className="text-3xl font-black italic text-yellow-400 tracking-tight">RACE PAUSED</h3>
              <p className="text-xs text-sky-200 font-medium">Catch your breath, captain!</p>
              <button
                onClick={() => setGamePhase('racing')}
                className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-lg italic border-b-6 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-lg cursor-pointer"
              >
                RESUME RACE
              </button>
            </div>
          </div>
        )}

        {/* Start / Main Menu Hero Screen (Bold Typography Theme) */}
        {gamePhase === 'menu' && (
          <div className="absolute inset-0 bg-sky-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 rounded-3xl z-20 border-4 border-sky-800">
            <div className="text-center flex flex-col items-center gap-6 max-w-lg">
              
              {/* Title & Banner */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-black tracking-[0.4em] uppercase text-sky-300 opacity-90">
                  WATER SPORTS ARCADE
                </span>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter drop-shadow-2xl italic flex items-center gap-3">
                  <span className="text-yellow-400">BOAT</span>
                  <span className="text-white">RACE</span>
                </h1>
                <p className="text-sky-200 text-xs sm:text-sm font-bold max-w-sm mt-1">
                  2-Player River Championship with 3 Paths, 5 Lives, and high-speed water currents!
                </p>
              </div>

              {/* Matchup Preview */}
              <div className="grid grid-cols-2 gap-3 w-full bg-white/10 border-2 border-white/20 p-4 rounded-3xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white/30"
                    style={{ backgroundColor: player1Custom.boatColor }}
                  >
                    <span>{player1Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-red-200 text-sm uppercase">{player1Custom.name}</div>
                    <div className="text-xs text-red-300/80 font-bold">{player1Custom.characterName}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <div className="text-right">
                    <div className="font-black text-blue-200 text-sm uppercase">{player2Custom.name}</div>
                    <div className="text-xs text-blue-300/80 font-bold">{player2Custom.characterName}</div>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white/30"
                    style={{ backgroundColor: player2Custom.boatColor }}
                  >
                    <span>{player2Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons with 3D Chunky Styling */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={startNewChampionship}
                  className="flex-1 py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-2xl italic border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>START RACE</span>
                  <Play className="w-6 h-6 fill-sky-950 stroke-none" />
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="py-4 px-6 rounded-2xl bg-sky-700 hover:bg-sky-600 text-white font-black text-base uppercase border-b-6 border-sky-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  title="Customize Boats & Settings"
                >
                  <Settings className="w-5 h-5" />
                  <span>OPTIONS</span>
                </button>
              </div>

              {/* Rules quick link */}
              <button
                onClick={() => setShowRules(true)}
                className="text-xs font-black uppercase tracking-wider text-yellow-300 hover:text-yellow-200 underline flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>HOW TO PLAY & 3-PATH SYSTEM</span>
              </button>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Controls Deck */}
      <div className="w-full max-w-5xl">
        <ControlDeck
          mode={settings.mode}
          activePlayerId={activePlayerId}
          onRunPress={(isPressed) => setRunPressed(isPressed)}
          onStopPress={(isPressed) => setStopPressed(isPressed)}
          onUpPress={() => handleSwitchPath('up')}
          onDownPress={() => handleSwitchPath('down')}
          isRunning={runPressed || keysPressedRef.current['KeyD'] || keysPressedRef.current['Space']}
          isStopping={stopPressed || keysPressedRef.current['KeyA']}
          canMoveUp={hudState.boatPath > 0}
          canMoveDown={hudState.boatPath < 2}
          p2Controls={{
            onRunPress: (isPressed) => setP2RunPressed(isPressed),
            onStopPress: (isPressed) => setP2StopPressed(isPressed),
            onUpPress: () => handleSwitchPathP2('up'),
            onDownPress: () => handleSwitchPathP2('down'),
            isRunning: p2RunPressed || keysPressedRef.current['ArrowRight'],
            isStopping: p2StopPressed || keysPressedRef.current['ArrowLeft'],
            canMoveUp: boat2Ref.current.path > 0,
            canMoveDown: boat2Ref.current.path < 2
          }}
          onHorn={() => soundManager.playHorn()}
        />
      </div>

      {/* Modals */}
      {gamePhase === 'round_over' && (
        <RoundSummaryModal
          roundNumber={roundNumber}
          starterPlayerId={roundNumber === 1 ? 'player1' : 'player2'}
          nextAction={summaryNextAction}
          p1Custom={player1Custom}
          p2Custom={player2Custom}
          p1Data={currentRoundP1Data}
          p2Data={currentRoundP2Data}
          onContinue={handleSummaryContinue}
        />
      )}

      {gamePhase === 'final_results' && (
        <FinalWinnerModal
          roundResults={roundResults}
          p1Custom={player1Custom}
          p2Custom={player2Custom}
          p1TotalScore={p1TotalScore}
          p2TotalScore={p2TotalScore}
          onRestartChampionship={startNewChampionship}
        />
      )}

      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}

      {showSettings && (
        <GameSettingsModal
          settings={settings}
          p1Custom={player1Custom}
          p2Custom={player2Custom}
          onUpdateSettings={(newSet) => setSettings(s => ({ ...s, ...newSet }))}
          onUpdateP1={(newP1) => setPlayer1Custom(newP1)}
          onUpdateP2={(newP2) => setPlayer2Custom(newP2)}
          onClose={() => setShowSettings(false)}
        />
      )}

    </div>
  );
}
