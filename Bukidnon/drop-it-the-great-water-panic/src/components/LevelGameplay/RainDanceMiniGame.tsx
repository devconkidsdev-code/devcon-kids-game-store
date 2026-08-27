import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Music, Sparkles } from 'lucide-react';
import { BloopAvatar } from '../BloopAvatar';
import { soundManager } from '../../utils/audio';

interface RainDanceMiniGameProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number }) => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

export const RainDanceMiniGame: React.FC<RainDanceMiniGameProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const [targetSequence, setTargetSequence] = useState<Direction[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Direction[]>([]);
  const [danceRound, setDanceRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('Copy Professor Croak & the villagers’ silly dance moves!');

  // Generate new dance sequence
  useEffect(() => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const len = 2 + danceRound;
    const seq: Direction[] = [];
    for (let i = 0; i < len; i++) {
      seq.push(directions[Math.floor(Math.random() * directions.length)]);
    }
    setTargetSequence(seq);
    setPlayerSequence([]);
  }, [danceRound]);

  const handleArrowInput = (dir: Direction) => {
    soundManager.playPop();
    const nextSeq = [...playerSequence, dir];
    setPlayerSequence(nextSeq);

    // Verify step
    const currentIndex = nextSeq.length - 1;
    if (targetSequence[currentIndex] !== dir) {
      soundManager.playPanic();
      setFeedback('Oops! Stumbled on a puddle! Try the sequence again!');
      setPlayerSequence([]);
      return;
    }

    // Check if completed round
    if (nextSeq.length === targetSequence.length) {
      soundManager.playVictory();
      setScore((s) => s + 100);

      if (danceRound >= 4) {
        setFeedback('Absurd Rain Dance Mastered! Remember: Rain dances are fun, but storage is real strategy!');
        setTimeout(() => {
          onSuccess({ waterSaved: 1000 + levelId * 30 });
        }, 1800);
      } else {
        setFeedback(`Round ${danceRound} Complete! Next dance groove incoming!`);
        setTimeout(() => {
          setDanceRound((r) => r + 1);
        }, 1000);
      }
    }
  };

  const getArrowIcon = (dir: Direction) => {
    switch (dir) {
      case 'up':
        return <ArrowUp className="w-5 h-5 text-sky-500" />;
      case 'down':
        return <ArrowDown className="w-5 h-5 text-emerald-500" />;
      case 'left':
        return <ArrowLeft className="w-5 h-5 text-amber-500" />;
      case 'right':
        return <ArrowRight className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-purple-50 p-3.5 rounded-2xl border border-purple-100">
        <div>
          <span className="text-[11px] uppercase font-bold text-purple-700 tracking-wider">
            Village Rain Dance Mini-Game
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Dance Round</span>
          <span className="text-sm font-extrabold text-purple-700">{danceRound} / 4</span>
        </div>
      </div>

      {/* Dance Floor Stage */}
      <div className="relative w-full aspect-video max-h-[280px] bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-950 rounded-2xl border-4 border-purple-900 shadow-inner flex flex-col items-center justify-center p-4 text-white overflow-hidden">
        {/* Animated disco lights */}
        <div className="absolute top-2 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse" />

        {/* Dancing Bloop */}
        <BloopAvatar isDancing={true} size={80} expression="excited" />

        {/* Funny Educational Note */}
        <span className="mt-3 text-[11px] text-purple-200 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-400/30">
          🕺 Professor Croak is doing the funky frog leap!
        </span>
      </div>

      {/* Target Sequence Prompts */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
          Dance Moves to Follow:
        </span>
        <div className="flex items-center gap-2">
          {targetSequence.map((dir, idx) => {
            const isDone = idx < playerSequence.length;
            return (
              <div
                key={idx}
                className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-100 border-emerald-400 scale-95'
                    : 'bg-slate-50 border-slate-300 shadow-sm'
                }`}
              >
                {getArrowIcon(dir)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback text */}
      <p className="text-xs text-center font-bold text-purple-900 mt-2">{feedback}</p>

      {/* Dance Input Buttons */}
      <div className="mt-4 grid grid-cols-4 gap-3 w-full max-w-xs">
        <button
          onClick={() => handleArrowInput('left')}
          className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
        >
          <ArrowLeft className="w-6 h-6 text-amber-700" />
        </button>
        <button
          onClick={() => handleArrowInput('up')}
          className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-2xl flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
        >
          <ArrowUp className="w-6 h-6 text-sky-700" />
        </button>
        <button
          onClick={() => handleArrowInput('down')}
          className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
        >
          <ArrowDown className="w-6 h-6 text-emerald-700" />
        </button>
        <button
          onClick={() => handleArrowInput('right')}
          className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-2xl flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition"
        >
          <ArrowRight className="w-6 h-6 text-purple-700" />
        </button>
      </div>
    </div>
  );
};
