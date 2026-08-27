import React, { useState, useEffect } from 'react';
import { GameMode, GameStats } from './types';
import { Navbar } from './components/Navbar';
import { BlitzMode } from './components/BlitzMode';
import { GridMode } from './components/GridMode';
import { MinesMode } from './components/MinesMode';
import { InstructionsModal } from './components/InstructionsModal';
import { StatsModal } from './components/StatsModal';
import { sound } from './utils/sound';

const STATS_STORAGE_KEY = 'scatter_fire_water_stats_v1';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('blitz');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      highScoreBlitz: 0,
      highScoreCascade: 0,
      highScoreMines: 0,
      totalWaterDiamondsCollected: 0,
      totalFireBombsDefused: 0,
      totalCascadesWon: 0,
      tsunamisTriggered: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleUpdateBlitzStats = (diamonds: number, bombsDefused: number, score: number) => {
    setStats(prev => ({
      ...prev,
      highScoreBlitz: Math.max(prev.highScoreBlitz, score),
      totalWaterDiamondsCollected: prev.totalWaterDiamondsCollected + diamonds,
      totalFireBombsDefused: prev.totalFireBombsDefused + bombsDefused,
    }));
  };

  const handleUpdateGridStats = (wins: number, cascades: number, creditsWon: number) => {
    setStats(prev => ({
      ...prev,
      highScoreCascade: Math.max(prev.highScoreCascade, creditsWon),
      totalCascadesWon: prev.totalCascadesWon + wins,
      tsunamisTriggered: prev.tsunamisTriggered + (cascades >= 4 ? 1 : 0),
    }));
  };

  const handleUpdateMinesStats = (diamondsFound: number, bombsHit: number, profit: number) => {
    setStats(prev => ({
      ...prev,
      highScoreMines: Math.max(prev.highScoreMines, Math.max(0, profit)),
      totalWaterDiamondsCollected: prev.totalWaterDiamondsCollected + diamondsFound,
      totalFireBombsDefused: prev.totalFireBombsDefused + (bombsHit === 0 && diamondsFound > 0 ? 1 : 0),
    }));
  };

  const handleResetStats = () => {
    const emptyStats: GameStats = {
      highScoreBlitz: 0,
      highScoreCascade: 0,
      highScoreMines: 0,
      totalWaterDiamondsCollected: 0,
      totalFireBombsDefused: 0,
      totalCascadesWon: 0,
      tsunamisTriggered: 0,
    };
    setStats(emptyStats);
    try {
      localStorage.removeItem(STATS_STORAGE_KEY);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenStats={() => setShowStats(true)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 max-w-6xl w-full mx-auto">
        {currentMode === 'blitz' && (
          <BlitzMode
            onUpdateStats={handleUpdateBlitzStats}
            highScore={stats.highScoreBlitz}
          />
        )}

        {currentMode === 'cascade' && (
          <GridMode
            onUpdateStats={handleUpdateGridStats}
            highScore={stats.highScoreCascade}
          />
        )}

        {currentMode === 'mines' && (
          <MinesMode
            onUpdateStats={handleUpdateMinesStats}
            highScore={stats.highScoreMines}
          />
        )}
      </main>

      {/* Modals */}
      <InstructionsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        onResetStats={handleResetStats}
      />
    </div>
  );
}
