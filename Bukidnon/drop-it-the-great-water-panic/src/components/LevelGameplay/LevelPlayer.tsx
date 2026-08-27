import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { LevelData, DialogueLine } from '../../types/game';
import { CharacterPortrait } from '../CharacterPortraits';
import { ActionGridCanvas } from './ActionGridCanvas';
import { PipePuzzleView } from './PipePuzzleView';
import { DetectiveView } from './DetectiveView';
import { DistributionStrategyView } from './DistributionStrategyView';
import { RiverCleanView } from './RiverCleanView';
import { FarmIrrigationView } from './FarmIrrigationView';
import { RainHarvestView } from './RainHarvestView';
import { RainDanceMiniGame } from './RainDanceMiniGame';
import { CityMetersView } from './CityMetersView';
import { Level100BossFinale } from './Level100BossFinale';
import { soundManager } from '../../utils/audio';

interface LevelPlayerProps {
  level: LevelData;
  onLevelComplete: (stats: {
    waterSaved: number;
    waterWasted?: number;
    leaksRepaired?: number;
    rainwaterCollected?: number;
    pollutionPrevented?: number;
    cropsSaved?: number;
    animalsHelped?: number;
  }) => void;
  onExit: () => void;
  equippedCosmetics?: {
    hat?: string;
    backpack?: string;
    outfit?: string;
    accessory?: string;
  };
}

export const LevelPlayer: React.FC<LevelPlayerProps> = ({
  level,
  onLevelComplete,
  onExit,
  equippedCosmetics,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showingIntro, setShowingIntro] = useState(true);
  const [failedReason, setFailedReason] = useState<string | null>(null);

  const currentDialogue: DialogueLine | undefined = level.storyIntro[dialogueIndex];

  const handleNextDialogue = () => {
    soundManager.playClick();
    if (dialogueIndex + 1 < level.storyIntro.length) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setShowingIntro(false);
    }
  };

  const handleLevelSuccess = (stats: {
    waterSaved: number;
    leaksFixed?: number;
    dropsCollected?: number;
    rainwaterCollected?: number;
    pollutionPrevented?: number;
    cropsSaved?: number;
  }) => {
    onLevelComplete({
      waterSaved: stats.waterSaved,
      leaksRepaired: stats.leaksFixed || 1,
      rainwaterCollected: stats.rainwaterCollected || 0,
      pollutionPrevented: stats.pollutionPrevented || 0,
      cropsSaved: stats.cropsSaved || 0,
      animalsHelped: 1,
    });
  };

  const handleLevelFail = (reason: string) => {
    soundManager.playPanic();
    setFailedReason(reason);
  };

  const handleRetry = () => {
    soundManager.playClick();
    setFailedReason(null);
    setDialogueIndex(0);
    setShowingIntro(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-3 sm:p-6">
      {/* Top Breadcrumb Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-sky-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Map</span>
        </button>
        <span className="text-xs font-black uppercase text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
          {level.title}
        </span>
      </div>

      {/* Story Intro Dialogue Modal */}
      <AnimatePresence>
        {showingIntro && currentDialogue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-sky-200 z-30"
          >
            <div className="flex items-start gap-4">
              <CharacterPortrait
                speaker={currentDialogue.speaker}
                expression={currentDialogue.expression}
                size={70}
              />
              <div className="flex-1">
                <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
                  {currentDialogue.speakerName}
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 mt-1 leading-relaxed">
                  “{currentDialogue.text}”
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-bold">
                {dialogueIndex + 1} / {level.storyIntro.length}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextDialogue}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition"
              >
                <span>{dialogueIndex + 1 < level.storyIntro.length ? 'Next' : 'Start Mission!'}</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gameplay Screen (Rendered when Intro is done) */}
      {!showingIntro && !failedReason && (
        <div className="w-full flex justify-center">
          {level.type === 'action_patrol' && (
            <ActionGridCanvas
              levelId={level.id}
              objectiveText={level.objectiveText}
              targetWaterSaved={level.targetWaterSaved}
              onSuccess={handleLevelSuccess}
              onFail={handleLevelFail}
              equippedCosmetics={equippedCosmetics}
            />
          )}

          {level.type === 'pipe_puzzle' && (
            <PipePuzzleView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
              onFail={handleLevelFail}
            />
          )}

          {level.type === 'detective' && (
            <DetectiveView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
            />
          )}

          {level.type === 'distribution' && (
            <DistributionStrategyView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
              onFail={handleLevelFail}
            />
          )}

          {level.type === 'river_clean' && (
            <RiverCleanView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
            />
          )}

          {level.type === 'farm_irrigation' && (
            <FarmIrrigationView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
            />
          )}

          {level.type === 'rain_harvest' && (
            <RainHarvestView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
            />
          )}

          {level.type === 'rain_dance' && (
            <RainDanceMiniGame
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
            />
          )}

          {level.type === 'city_meters' && (
            <CityMetersView
              levelId={level.id}
              objectiveText={level.objectiveText}
              onSuccess={handleLevelSuccess}
            />
          )}

          {level.type === 'boss_finale' && (
            <Level100BossFinale
              onSuccess={handleLevelSuccess}
            />
          )}
        </div>
      )}

      {/* Level Fail Modal */}
      {failedReason && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-red-200 text-center"
        >
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800">Mission Incomplete!</h3>
          <p className="text-xs sm:text-sm text-slate-600 my-3">{failedReason}</p>
          <p className="text-[11px] text-sky-700 bg-sky-50 p-2.5 rounded-xl border border-sky-200 font-medium">
            💡 Conservation Tip: Remember that fixing leaks early prevents thousands of litres of wasted water!
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onExit}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Exit to Map
            </button>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
