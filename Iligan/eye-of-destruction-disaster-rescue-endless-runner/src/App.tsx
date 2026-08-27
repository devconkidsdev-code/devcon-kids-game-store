/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Game3DEngine } from './game/threeEngine';
import { RunnerManager } from './game/runnerManager';
import { DISASTER_AREAS } from './game/gameData';
import { DisasterArea, GameMode, Lane, CollectibleType } from './types';
import { sound } from './audio/soundEffects';

import { GameHUD } from './components/GameHUD';
import { RescueRepairOverlay } from './components/RescueRepairOverlay';
import { TitleScreen } from './components/TitleScreen';
import { CampaignMapModal } from './components/CampaignMapModal';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameOverModal } from './components/GameOverModal';
import { MobileControls } from './components/MobileControls';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Game3DEngine | null>(null);
  const runnerManagerRef = useRef<RunnerManager | null>(null);

  // Game State
  const [gameMode, setGameMode] = useState<GameMode>('TITLE');
  const [areas, setAreas] = useState<DisasterArea[]>(() => JSON.parse(JSON.stringify(DISASTER_AREAS)));
  const [currentAreaIndex, setCurrentAreaIndex] = useState<number>(0);

  // Player State
  const [lane, setLane] = useState<Lane>(0);
  const [playerX, setPlayerX] = useState<number>(0);
  const [playerY, setPlayerY] = useState<number>(0);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(30);
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [maxHealth] = useState<number>(100);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [medSupplies, setMedSupplies] = useState<number>(6);
  const [repairMaterials, setRepairMaterials] = useState<number>(8);
  const [coins, setCoins] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Stop Area Repairing & Interactive Triage/Construction state
  const [repairingBuildingId, setRepairingBuildingId] = useState<string | null>(null);
  const [repairProgress, setRepairProgress] = useState<number>(0);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  // Modals & Controls
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);

  // Physics refs for requestAnimationFrame
  const jumpVelocityRef = useRef<number>(0);
  const slideTimerRef = useRef<number>(0);
  const nitroTimerRef = useRef<number>(0);
  const playerXRef = useRef<number>(0);
  const playerYRef = useRef<number>(0);
  const laneRef = useRef<Lane>(0);
  const lastTimeRef = useRef<number>(performance.now());

  const currentArea = areas[currentAreaIndex] || areas[0];

  // 1. Initialize 3D Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new Game3DEngine(containerRef.current);
    engineRef.current = engine;

    const runner = new RunnerManager(engine);
    runnerManagerRef.current = runner;

    return () => {
      engine.dispose();
      sound.stopAll();
    };
  }, []);

  // 2. Player Controls (Lane switch, Jump, Slide)
  const handleLaneLeft = useCallback(() => {
    if (gameMode !== 'RUNNER' || isPaused) return;
    setLane((prev) => {
      const next = prev === 1 ? 0 : prev === 0 ? -1 : -1;
      laneRef.current = next;
      sound.playLaneSwitch();
      return next as Lane;
    });
  }, [gameMode, isPaused]);

  const handleLaneRight = useCallback(() => {
    if (gameMode !== 'RUNNER' || isPaused) return;
    setLane((prev) => {
      const next = prev === -1 ? 0 : prev === 0 ? 1 : 1;
      laneRef.current = next;
      sound.playLaneSwitch();
      return next as Lane;
    });
  }, [gameMode, isPaused]);

  const handleJump = useCallback(() => {
    if (gameMode !== 'RUNNER' || isPaused || isJumping) return;
    setIsJumping(true);
    setIsSliding(false);
    jumpVelocityRef.current = 13.5;
    sound.playJump();
  }, [gameMode, isPaused, isJumping]);

  const handleSlide = useCallback(() => {
    if (gameMode !== 'RUNNER' || isPaused) return;
    setIsSliding(true);
    slideTimerRef.current = 0.65;
    if (isJumping) {
      // Fast drop downward
      jumpVelocityRef.current = -15;
    }
    sound.playSlide();
  }, [gameMode, isPaused, isJumping]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') {
        handleLaneLeft();
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        handleLaneRight();
      } else if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
        handleJump();
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        handleSlide();
      } else if (code === 'KeyM') {
        toggleMute();
      } else if (code === 'KeyP' || code === 'Escape') {
        if (gameMode === 'RUNNER' || gameMode === 'STOP_AREA') {
          setIsPaused((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLaneLeft, handleLaneRight, handleJump, handleSlide, gameMode]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  };

  // 3. Collision & Collectibles Callbacks
  const handleCrash = useCallback(() => {
    if (hasShield) {
      setHasShield(false);
      sound.playCollect('SHIELD');
      return;
    }

    sound.playCrash();
    setHealth((prev) => {
      const next = Math.max(0, prev - 25);
      if (next <= 0) {
        setGameMode('GAME_OVER');
        sound.setMusicMode('SILENT');
      }
      return next;
    });
  }, [hasShield]);

  const handleCollect = useCallback((type: CollectibleType) => {
    if (type === 'MED_KIT') {
      sound.playCollect('MED');
      setMedSupplies((prev) => prev + 1);
      setScore((prev) => prev + 100);
    } else if (type === 'REPAIR_MATERIAL') {
      sound.playCollect('MATERIAL');
      setRepairMaterials((prev) => prev + 1);
      setScore((prev) => prev + 100);
    } else if (type === 'SHIELD') {
      sound.playCollect('SHIELD');
      setHasShield(true);
      setScore((prev) => prev + 250);
    } else if (type === 'NITRO') {
      sound.playCollect('NITRO');
      nitroTimerRef.current = 4.0;
      setScore((prev) => prev + 300);
    } else {
      // Coin / Badge
      sound.playCollect('COIN');
      setCoins((prev) => prev + 1);
      setScore((prev) => prev + 50);
    }
  }, []);

  // 4. Main Physics and Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (time: number) => {
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (!isPaused && engineRef.current) {
        // --- RUNNER MODE ---
        if (gameMode === 'RUNNER') {
          // Lane Interpolation
          const targetX = laneRef.current * 3.5;
          playerXRef.current += (targetX - playerXRef.current) * Math.min(1, delta * 14);
          setPlayerX(playerXRef.current);

          // Jump Gravity Physics
          if (isJumping) {
            jumpVelocityRef.current -= 30 * delta; // Gravity
            playerYRef.current += jumpVelocityRef.current * delta;

            if (playerYRef.current <= 0) {
              playerYRef.current = 0;
              jumpVelocityRef.current = 0;
              setIsJumping(false);
            }
          }
          setPlayerY(playerYRef.current);

          // Slide Timer
          if (isSliding) {
            slideTimerRef.current -= delta;
            if (slideTimerRef.current <= 0) {
              setIsSliding(false);
            }
          }

          // Speed & Nitro Boost
          let currentSpeed = 28;
          if (nitroTimerRef.current > 0) {
            nitroTimerRef.current -= delta;
            currentSpeed = 42;
          }
          setSpeed(currentSpeed);

          // Distance Tracker
          const distIncrement = currentSpeed * delta;
          setDistanceTraveled((prev) => {
            const next = prev + distIncrement;
            if (next >= currentArea.distanceToReach) {
              // Reached Stopping Plaza!
              setTimeout(() => {
                enterStopArea();
              }, 100);
              return currentArea.distanceToReach;
            }
            return next;
          });

          // Update Obstacles & Collectibles
          if (runnerManagerRef.current) {
            const distLeft = currentArea.distanceToReach - distanceTraveled;
            runnerManagerRef.current.update(
              delta,
              currentSpeed,
              laneRef.current,
              playerXRef.current,
              playerYRef.current,
              isJumping,
              isSliding,
              hasShield,
              handleCrash,
              handleCollect,
              distLeft
            );
          }
        }

        // --- TICK 3D ENGINE ---
        engineRef.current.update(
          delta,
          playerXRef.current,
          playerYRef.current,
          isJumping,
          isSliding,
          hasShield,
          speed,
          currentArea.distanceToReach - distanceTraveled
        );
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameMode, isPaused, isJumping, isSliding, hasShield, speed, distanceTraveled, currentArea, handleCrash, handleCollect]);

  // 5. Stopping Area Transition
  const enterStopArea = () => {
    setGameMode('STOP_AREA');
    setIsJumping(false);
    setIsSliding(false);
    playerYRef.current = 0;
    playerXRef.current = 0;
    laneRef.current = 0;
    setLane(0);
    setPlayerX(0);
    setPlayerY(0);

    if (engineRef.current) {
      engineRef.current.setupPlazaArea(currentArea);
    }
    sound.setMusicMode('PLAZA');
  };

  // 6. Multi-stage Interactive Healing Handler
  const handleAdvanceResidentTreatment = (residentId: string) => {
    const res = currentArea.residents.find((r) => r.id === residentId);
    if (!res || res.isRescued) return;

    const totalSteps = res.treatmentSteps?.length || 3;
    const currentStep = res.treatmentStage || 0;
    const stepCost = res.treatmentSteps?.[currentStep]?.requiredSupplies || 1;

    if (medSupplies < stepCost) return;

    setMedSupplies((prev) => prev - stepCost);
    const nextStep = currentStep + 1;
    const isCompleted = nextStep >= totalSteps;

    if (isCompleted) {
      setScore((prev) => prev + 650);
      sound.playHealSigh();
      sound.playRescueSuccess();
      if (engineRef.current) {
        engineRef.current.animateResidentRescued(residentId);
      }
    } else {
      setScore((prev) => prev + 150);
      sound.playMedicalPulse();
      if (engineRef.current) {
        engineRef.current.animateResidentHealingStage(residentId, nextStep, totalSteps);
      }
    }

    setAreas((prevAreas) => {
      const updated = prevAreas.map((a, idx) => {
        if (idx !== currentAreaIndex) return a;
        return {
          ...a,
          residents: a.residents.map((r) => {
            if (r.id !== residentId) return r;
            const newHealth = Math.min(100, Math.round((nextStep / totalSteps) * 100));
            return {
              ...r,
              treatmentStage: nextStep,
              health: newHealth,
              isRescued: isCompleted,
            };
          }),
        };
      });

      checkAreaCompletion(updated[currentAreaIndex]);
      return updated;
    });
  };

  // Instant Full Rescue Shortcut
  const handleRescueResident = (residentId: string) => {
    const res = currentArea.residents.find((r) => r.id === residentId);
    if (!res || res.isRescued || medSupplies < res.requiredMedKits) return;

    setMedSupplies((prev) => prev - res.requiredMedKits);
    setScore((prev) => prev + 600);
    sound.playHealSigh();
    sound.playRescueSuccess();

    if (engineRef.current) {
      engineRef.current.animateResidentRescued(residentId);
    }

    setAreas((prevAreas) => {
      const updated = prevAreas.map((a, idx) => {
        if (idx !== currentAreaIndex) return a;
        return {
          ...a,
          residents: a.residents.map((r) => (r.id === residentId ? { 
            ...r, 
            isRescued: true, 
            health: 100, 
            treatmentStage: r.treatmentSteps?.length || 3 
          } : r)),
        };
      });

      checkAreaCompletion(updated[currentAreaIndex]);
      return updated;
    });
  };

  // 7. Multi-phase Interactive Building Reconstruction Handler
  const handleAdvanceBuildingPhase = (buildingId: string) => {
    const bld = currentArea.buildings.find((b) => b.id === buildingId);
    if (!bld || bld.isRepaired || repairingBuildingId) return;

    const totalPhases = bld.repairPhases?.length || 3;
    const currentPhase = bld.currentPhaseIndex || 0;
    const phaseCost = bld.repairPhases?.[currentPhase]?.requiredMaterials || 2;

    if (repairMaterials < phaseCost) return;

    setRepairingBuildingId(buildingId);
    setRepairProgress(0);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      sound.playWelderSparks();
      setRepairProgress(Math.min(100, prog));

      if (prog >= 100) {
        clearInterval(interval);
        setRepairingBuildingId(null);
        setRepairMaterials((prev) => prev - phaseCost);

        const nextPhase = currentPhase + 1;
        const isFullyRepaired = nextPhase >= totalPhases;

        if (isFullyRepaired) {
          setScore((prev) => prev + 900);
          sound.playStructurePhaseComplete();
          sound.playBuildingRestored();
          if (engineRef.current) {
            engineRef.current.animateBuildingRepaired(buildingId);
          }
        } else {
          setScore((prev) => prev + 250);
          sound.playStructurePhaseComplete();
          if (engineRef.current) {
            engineRef.current.animateBuildingRepairPhase(buildingId, nextPhase, totalPhases);
          }
        }

        setAreas((prevAreas) => {
          const updated = prevAreas.map((a, idx) => {
            if (idx !== currentAreaIndex) return a;
            return {
              ...a,
              buildings: a.buildings.map((b) => {
                if (b.id !== buildingId) return b;
                const newIntegrity = Math.min(100, Math.round((nextPhase / totalPhases) * 100));
                return {
                  ...b,
                  currentPhaseIndex: nextPhase,
                  integrity: newIntegrity,
                  isRepaired: isFullyRepaired,
                };
              }),
            };
          });

          checkAreaCompletion(updated[currentAreaIndex]);
          return updated;
        });
      }
    }, 120);
  };

  // Instant Full Repair Shortcut
  const handleRepairBuilding = (buildingId: string) => {
    const bld = currentArea.buildings.find((b) => b.id === buildingId);
    if (!bld || bld.isRepaired || repairMaterials < bld.requiredMaterials || repairingBuildingId) return;

    setRepairingBuildingId(buildingId);
    setRepairProgress(0);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      sound.playWelderSparks();
      setRepairProgress(Math.min(100, prog));

      if (prog >= 100) {
        clearInterval(interval);
        setRepairingBuildingId(null);
        setRepairMaterials((prev) => prev - bld.requiredMaterials);
        setScore((prev) => prev + 800);
        sound.playStructurePhaseComplete();
        sound.playBuildingRestored();

        if (engineRef.current) {
          engineRef.current.animateBuildingRepaired(buildingId);
        }

        setAreas((prevAreas) => {
          const updated = prevAreas.map((a, idx) => {
            if (idx !== currentAreaIndex) return a;
            return {
              ...a,
              buildings: a.buildings.map((b) => (b.id === buildingId ? { 
                ...b, 
                isRepaired: true, 
                integrity: 100, 
                currentPhaseIndex: b.repairPhases?.length || 3 
              } : b)),
            };
          });

          checkAreaCompletion(updated[currentAreaIndex]);
          return updated;
        });
      }
    }, 120);
  };

  // 8. Emergency Restock from Van
  const handleRestockSupplies = () => {
    sound.playCollect('MATERIAL');
    setMedSupplies((prev) => Math.max(prev + 3, 4));
    setRepairMaterials((prev) => Math.max(prev + 4, 6));
  };

  // 9. Area Completion Checker
  const checkAreaCompletion = (area: DisasterArea) => {
    const allRescued = area.residents.every((r) => r.isRescued);
    const allRepaired = area.buildings.every((b) => b.isRepaired);

    if (allRescued && allRepaired && !area.isRestored) {
      area.isRestored = true;
      if (engineRef.current) {
        engineRef.current.applyFullAreaRestoration(area);
      }
      sound.playAreaRestoredFanfare();
      sound.setMusicMode('RESTORED');
    }
  };

  // 10. Continue to Next Disaster Area
  const handleContinueToNextArea = () => {
    if (currentAreaIndex < areas.length - 1) {
      const nextIdx = currentAreaIndex + 1;
      setCurrentAreaIndex(nextIdx);
      setDistanceTraveled(0);
      setGameMode('RUNNER');

      if (engineRef.current) {
        engineRef.current.switchToRunnerMode();
      }
      if (runnerManagerRef.current) {
        runnerManagerRef.current.reset();
      }
      sound.setMusicMode('RUNNER');
    } else {
      // All 5 areas completed! Grand Campaign Victory!
      setGameMode('CAMPAIGN_VICTORY');
      sound.playAreaRestoredFanfare();
      sound.setMusicMode('VICTORY');
    }
  };

  // 11. Start Game from Title
  const handleStartGame = () => {
    setGameMode('RUNNER');
    setDistanceTraveled(0);
    setHealth(100);
    if (engineRef.current) {
      engineRef.current.switchToRunnerMode();
    }
    if (runnerManagerRef.current) {
      runnerManagerRef.current.reset();
    }
    sound.setMusicMode('RUNNER');
  };

  // 12. Area Select from Map Modal
  const handleSelectArea = (index: number) => {
    setCurrentAreaIndex(index);
    setDistanceTraveled(0);
    setHealth(100);
    setGameMode('RUNNER');

    if (engineRef.current) {
      engineRef.current.switchToRunnerMode();
    }
    if (runnerManagerRef.current) {
      runnerManagerRef.current.reset();
    }
    sound.setMusicMode('RUNNER');
  };

  // 13. Replay Campaign
  const handleReplayCampaign = () => {
    const freshAreas: DisasterArea[] = JSON.parse(JSON.stringify(DISASTER_AREAS));
    setAreas(freshAreas);
    setCurrentAreaIndex(0);
    setDistanceTraveled(0);
    setHealth(100);
    setScore(0);
    setCoins(0);
    setMedSupplies(6);
    setRepairMaterials(8);
    setGameMode('RUNNER');

    if (engineRef.current) {
      engineRef.current.switchToRunnerMode();
    }
    if (runnerManagerRef.current) {
      runnerManagerRef.current.reset();
    }
    sound.setMusicMode('RUNNER');
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none font-sans">
      {/* 3D WebGL Canvas Container */}
      <div 
        id="game-canvas-container"
        ref={containerRef} 
        onClick={(e) => {
          if (gameMode === 'STOP_AREA' && engineRef.current) {
            engineRef.current.raycastPlazaClick(
              e.clientX,
              e.clientY,
              (resId) => {
                setSelectedResidentId(resId);
                setSelectedBuildingId(null);
                sound.playHeartbeat();
              },
              (bldId) => {
                setSelectedBuildingId(bldId);
                setSelectedResidentId(null);
                sound.playWelderSparks();
              }
            );
          }
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Main HUD overlay */}
      {gameMode !== 'TITLE' && (
        <GameHUD
          mode={gameMode}
          currentArea={currentArea}
          health={health}
          maxHealth={maxHealth}
          distanceTraveled={distanceTraveled}
          targetDistance={currentArea.distanceToReach}
          speed={speed}
          medSupplies={medSupplies}
          repairMaterials={repairMaterials}
          coins={coins}
          score={score}
          hasShield={hasShield}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          isPaused={isPaused}
          onOpenMap={() => setShowMapModal(true)}
          onOpenHelp={() => setShowHowToPlayModal(true)}
        />
      )}

      {/* Stop / Plaza Area Rescue & Repair Overlay */}
      {gameMode === 'STOP_AREA' && (
        <RescueRepairOverlay
          area={currentArea}
          medSupplies={medSupplies}
          repairMaterials={repairMaterials}
          onRescueResident={handleRescueResident}
          onRepairBuilding={handleRepairBuilding}
          onAdvanceResidentTreatment={handleAdvanceResidentTreatment}
          onAdvanceBuildingPhase={handleAdvanceBuildingPhase}
          selectedResidentId={selectedResidentId}
          selectedBuildingId={selectedBuildingId}
          onSelectResident={(id) => {
            setSelectedResidentId(id);
            setSelectedBuildingId(null);
            if (id) sound.playHeartbeat();
          }}
          onSelectBuilding={(id) => {
            setSelectedBuildingId(id);
            setSelectedResidentId(null);
            if (id) sound.playWelderSparks();
          }}
          onContinueToNextArea={handleContinueToNextArea}
          onRestockSupplies={handleRestockSupplies}
          repairingBuildingId={repairingBuildingId}
          repairProgress={repairProgress}
          raycastTarget={(clientX, clientY) => engineRef.current?.raycastPlazaTarget(clientX, clientY) || null}
        />
      )}

      {/* Title / Intro Screen */}
      {gameMode === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlayModal(true)}
        />
      )}

      {/* Mobile Touch Controls */}
      {gameMode !== 'TITLE' && (
        <MobileControls
          mode={gameMode}
          onLaneLeft={handleLaneLeft}
          onLaneRight={handleLaneRight}
          onJump={handleJump}
          onSlide={handleSlide}
          onInteract={() => {
            const unrescued = currentArea.residents.find((r) => !r.isRescued);
            if (unrescued && medSupplies >= unrescued.requiredMedKits) {
              handleRescueResident(unrescued.id);
              return;
            }
            const unrepaired = currentArea.buildings.find((b) => !b.isRepaired);
            if (unrepaired && repairMaterials >= unrepaired.requiredMaterials) {
              handleRepairBuilding(unrepaired.id);
              return;
            }
            handleRestockSupplies();
          }}
        />
      )}

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-black text-amber-400">Mission Paused</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">Rose is awaiting your command in {currentArea.name}.</p>
            <div className="space-y-2.5">
              <button
                id="pause-resume-btn"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Resume Rescue Run
              </button>
              <button
                id="pause-how-to-play-btn"
                onClick={() => {
                  setIsPaused(false);
                  setShowHowToPlayModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition"
              >
                Field Manual / Controls
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City Restoration Map Modal */}
      {showMapModal && (
        <CampaignMapModal
          areas={areas}
          currentAreaIndex={currentAreaIndex}
          onClose={() => setShowMapModal(false)}
          onSelectArea={handleSelectArea}
        />
      )}

      {/* How to Play Manual Modal */}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}

      {/* Disaster Crash Game Over Modal */}
      {gameMode === 'GAME_OVER' && (
        <GameOverModal
          areaName={currentArea.name}
          onRestartArea={() => {
            setHealth(100);
            setDistanceTraveled(0);
            setGameMode('RUNNER');
            if (runnerManagerRef.current) {
              runnerManagerRef.current.reset();
            }
            sound.setMusicMode('RUNNER');
          }}
          onRepairVanCheckpoint={() => {
            setHealth(80);
            setHasShield(true);
            setGameMode('RUNNER');
            sound.setMusicMode('RUNNER');
          }}
        />
      )}

      {/* Cinematic Final City Restored Victory Modal */}
      {gameMode === 'CAMPAIGN_VICTORY' && (
        <VictoryModal
          areas={areas}
          totalScore={score}
          totalCoins={coins}
          onExploreRestoredCity={() => {
            setGameMode('STOP_AREA');
            if (engineRef.current) {
              engineRef.current.setupPlazaArea(areas[4]);
            }
            sound.setMusicMode('RESTORED');
          }}
          onReplayCampaign={handleReplayCampaign}
        />
      )}
    </main>
  );
}
