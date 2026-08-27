/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProgress, LevelData, LevelReplayStats, ChallengeMode } from './types/game';
import { ALL_LEVELS } from './data/levelsData';
import { ALL_ACHIEVEMENTS } from './data/cosmeticsData';
import { ResourceHeader } from './components/ResourceHeader';
import { MainMenu } from './components/MainMenu';
import { VillageHub } from './components/VillageHub';
import { LevelMap } from './components/LevelMap';
import { LevelPlayer } from './components/LevelGameplay/LevelPlayer';
import { LevelVictoryModal } from './components/LevelVictoryModal';
import { Level100EndingCinematic } from './components/Level100EndingCinematic';
import { GuardianJournalModal } from './components/GuardianJournalModal';
import { WardrobeModal } from './components/WardrobeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ChallengeModeModal } from './components/ChallengeModeModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './utils/audio';

const STORAGE_KEY = 'DROP_IT_GAME_SAVE_V1';

const INITIAL_PROGRESS: UserProgress = {
  currentLevel: 1,
  unlockedLevels: 1,
  starsEarned: 0,
  levelStars: {},
  levelHighScores: {},
  totalWaterSaved: 0,
  totalWaterWasted: 0,
  totalLeaksFixed: 0,
  totalRainCollected: 0,
  mooMooSipsCaught: 0,
  resources: {
    cleanWater: 450,
    maxCapacity: 1000,
    ecoCoins: 50,
    panicLevel: 25,
    happiness: 80,
  },
  upgrades: {},
  unlockedCosmetics: ['hat_leaf', 'backpack_canvas'],
  equippedCosmetics: {
    hat: 'hat_leaf',
    backpack: 'backpack_canvas',
  },
  achievements: {},
  journalRead: [],
  unlockedDecorations: [],
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_PROGRESS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load save game', e);
    }
    return INITIAL_PROGRESS;
  });

  const [currentScreen, setCurrentScreen] = useState<'main_menu' | 'village' | 'level_map' | 'gameplay'>(
    'main_menu'
  );
  const [activeLevelId, setActiveLevelId] = useState<number>(1);

  // Modals state
  const [showJournal, setShowJournal] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndingCinematic, setShowEndingCinematic] = useState(false);

  const [victoryData, setVictoryData] = useState<{
    level: LevelData;
    stars: number;
    replayStats: LevelReplayStats;
  } | null>(null);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save progress', e);
    }
  }, [progress]);

  // Handle ambient music on screen switch
  useEffect(() => {
    if (currentScreen === 'gameplay') {
      soundManager.startMusic('drought');
    } else {
      soundManager.startMusic('village');
    }
  }, [currentScreen]);

  const activeLevel = ALL_LEVELS.find((l) => l.id === activeLevelId) || ALL_LEVELS[0];

  const handleStartLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setVictoryData(null);
    setCurrentScreen('gameplay');
  };

  const handleLevelComplete = (stats: {
    waterSaved: number;
    waterWasted?: number;
    leaksRepaired?: number;
    rainwaterCollected?: number;
    pollutionPrevented?: number;
    cropsSaved?: number;
    animalsHelped?: number;
  }) => {
    const stars = 3; // Outstanding guardian work
    const nextLevelId = Math.min(100, activeLevelId + 1);
    const newUnlocked = Math.max(progress.unlockedLevels, nextLevelId);

    const prevStars = progress.levelStars[activeLevelId] || 0;
    const addedStars = Math.max(0, stars - prevStars);

    // Funny highlight generator for replay summary
    const highlights = [
      'Moo-Moo tried to sneak a sip, but was gently directed to the water trough!',
      'Professor Croak’s lawn sprinkler was calibrated to perfection!',
      'Bio-filters trapped 100% of the muddy sediment before it reached the village tap!',
      'Drip irrigation saved enough water to fill 50 bathtubs!',
      'Clucky was reminded that showers over 5 minutes turn chickens into prunes!',
    ];
    const randomHighlight = highlights[Math.floor(Math.random() * highlights.length)];

    const replayStats: LevelReplayStats = {
      levelId: activeLevelId,
      waterSaved: stats.waterSaved,
      waterWasted: stats.waterWasted || 0,
      leaksRepaired: stats.leaksRepaired || 1,
      rainwaterCollected: stats.rainwaterCollected || 0,
      pollutionPrevented: stats.pollutionPrevented || 0,
      cropsSaved: stats.cropsSaved || 0,
      animalsHelped: stats.animalsHelped || 1,
      funnyHighlight: randomHighlight,
    };

    setProgress((prev) => ({
      ...prev,
      currentLevel: nextLevelId,
      unlockedLevels: newUnlocked,
      starsEarned: prev.starsEarned + addedStars,
      totalWaterSaved: prev.totalWaterSaved + stats.waterSaved,
      totalLeaksFixed: prev.totalLeaksFixed + (stats.leaksRepaired || 1),
      totalRainCollected: prev.totalRainCollected + (stats.rainwaterCollected || 0),
      mooMooSipsCaught: prev.mooMooSipsCaught + 1,
      levelStars: {
        ...prev.levelStars,
        [activeLevelId]: Math.max(prevStars, stars),
      },
      resources: {
        ...prev.resources,
        cleanWater: Math.min(prev.resources.maxCapacity, prev.resources.cleanWater + stats.waterSaved / 5),
        ecoCoins: prev.resources.ecoCoins + activeLevel.rewards.ecoCoins,
        panicLevel: Math.max(0, prev.resources.panicLevel - 10),
        happiness: Math.min(100, prev.resources.happiness + 5),
      },
    }));

    if (activeLevelId === 100) {
      setShowEndingCinematic(true);
    } else {
      setVictoryData({
        level: activeLevel,
        stars,
        replayStats,
      });
    }
  };

  const handleNextLevelFromVictory = () => {
    setVictoryData(null);
    if (activeLevelId < 100) {
      handleStartLevel(activeLevelId + 1);
    } else {
      setCurrentScreen('village');
    }
  };

  const handleReplayLevel = () => {
    setVictoryData(null);
    handleStartLevel(activeLevelId);
  };

  const handleBuyCosmetic = (id: string, cost: number) => {
    setProgress((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        ecoCoins: prev.resources.ecoCoins - cost,
      },
      unlockedCosmetics: [...prev.unlockedCosmetics, id],
    }));
  };

  const handleEquipCosmetic = (type: 'hat' | 'backpack' | 'outfit' | 'accessory', id: string) => {
    setProgress((prev) => ({
      ...prev,
      equippedCosmetics: {
        ...prev.equippedCosmetics,
        [type]: id,
      },
    }));
  };

  const handleUpgradeVillage = (upgradeId: string, cost: number) => {
    setProgress((prev) => {
      const curLvl = prev.upgrades[upgradeId] || 0;
      return {
        ...prev,
        resources: {
          ...prev.resources,
          ecoCoins: prev.resources.ecoCoins - cost,
          maxCapacity: upgradeId === 'rain_cistern' ? prev.resources.maxCapacity + 500 : prev.resources.maxCapacity,
        },
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: curLvl + 1,
        },
      };
    });
  };

  const handleClaimAchievement = (achId: string, rewardCoins: number) => {
    setProgress((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        ecoCoins: prev.resources.ecoCoins + rewardCoins,
      },
      achievements: {
        ...prev.achievements,
        [achId]: {
          unlocked: true,
          claimed: true,
          dateUnlocked: new Date().toISOString(),
        },
      },
    }));
  };

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(INITIAL_PROGRESS);
    setCurrentScreen('main_menu');
  };

  const handleStartChallenge = (challenge: ChallengeMode) => {
    setShowChallenges(false);
    handleStartLevel(10); // Start specialized high-intensity patrol
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Persistent Global Resource Header (except when in title main menu) */}
      {currentScreen !== 'main_menu' && (
        <ResourceHeader
          resources={progress.resources}
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenJournal={() => setShowJournal(true)}
          onOpenWardrobe={() => setShowWardrobe(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenChallenges={() => setShowChallenges(true)}
          levelNumber={activeLevelId}
        />
      )}

      {/* Primary Screen Router */}
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        {currentScreen === 'main_menu' && (
          <MainMenu
            progress={progress}
            onStartAdventure={() => handleStartLevel(progress.currentLevel)}
            onOpenMap={() => setCurrentScreen('level_map')}
            onOpenVillage={() => setCurrentScreen('village')}
            onOpenJournal={() => setShowJournal(true)}
            onOpenWardrobe={() => setShowWardrobe(true)}
            onOpenChallenges={() => setShowChallenges(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {currentScreen === 'village' && (
          <VillageHub
            progress={progress}
            onUpgrade={handleUpgradeVillage}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectLevel={handleStartLevel}
          />
        )}

        {currentScreen === 'level_map' && (
          <LevelMap
            progress={progress}
            onSelectLevel={handleStartLevel}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'gameplay' && (
          <LevelPlayer
            level={activeLevel}
            onLevelComplete={handleLevelComplete}
            onExit={() => setCurrentScreen('level_map')}
            equippedCosmetics={progress.equippedCosmetics}
          />
        )}
      </main>

      {/* Victory / Replay Summary Modal */}
      {victoryData && (
        <LevelVictoryModal
          level={victoryData.level}
          stars={victoryData.stars}
          replayStats={victoryData.replayStats}
          onNextLevel={handleNextLevelFromVictory}
          onReplay={handleReplayLevel}
          onBackToMap={() => {
            setVictoryData(null);
            setCurrentScreen('level_map');
          }}
        />
      )}

      {/* Level 100 Grand Ending Cinematic */}
      {showEndingCinematic && (
        <Level100EndingCinematic
          progress={progress}
          onReturnToVillage={() => {
            setShowEndingCinematic(false);
            setCurrentScreen('village');
          }}
        />
      )}

      {/* Knowledge Journal Modal */}
      {showJournal && (
        <GuardianJournalModal
          unlockedLevelMax={progress.unlockedLevels}
          onClose={() => setShowJournal(false)}
        />
      )}

      {/* Wardrobe Modal */}
      {showWardrobe && (
        <WardrobeModal
          ecoCoins={progress.resources.ecoCoins}
          unlockedCosmetics={progress.unlockedCosmetics}
          equippedCosmetics={progress.equippedCosmetics}
          onBuyCosmetic={handleBuyCosmetic}
          onEquipCosmetic={handleEquipCosmetic}
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <AchievementsModal
          progress={progress}
          onClaimReward={handleClaimAchievement}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Challenges Modal */}
      {showChallenges && (
        <ChallengeModeModal
          onStartChallenge={handleStartChallenge}
          onClose={() => setShowChallenges(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
}
