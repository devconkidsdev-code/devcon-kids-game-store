import React, { useEffect } from 'react';
import { BoatCustomization, PlayerRunData } from '../types/game';
import { Trophy, ArrowRight, Heart, ShieldAlert, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoundSummaryModalProps {
  roundNumber: 1 | 2;
  starterPlayerId: 'player1' | 'player2';
  nextAction: 'player2_turn' | 'player1_turn' | 'next_round' | 'final_results';
  p1Custom: BoatCustomization;
  p2Custom: BoatCustomization;
  p1Data: PlayerRunData;
  p2Data: PlayerRunData;
  onContinue: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  roundNumber,
  starterPlayerId,
  nextAction,
  p1Custom,
  p2Custom,
  p1Data,
  p2Data,
  onContinue
}) => {
  // Trigger confetti if round is complete
  useEffect(() => {
    if (nextAction === 'next_round' || nextAction === 'final_results') {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [nextAction]);

  // Determine round leader/winner
  const isP1Finished = p1Data.finished && !p1Data.dnf;
  const isP2Finished = p2Data.finished && !p2Data.dnf;

  let roundLeader = 'Tie';
  if (isP1Finished && !isP2Finished) roundLeader = p1Custom.name;
  else if (!isP1Finished && isP2Finished) roundLeader = p2Custom.name;
  else if (isP1Finished && isP2Finished) {
    if (p1Data.score > p2Data.score) roundLeader = p1Custom.name;
    else if (p2Data.score > p1Data.score) roundLeader = p2Custom.name;
    else roundLeader = p1Data.timeElapsed <= p2Data.timeElapsed ? p1Custom.name : p2Custom.name;
  }

  const isIntermissionBetweenRuns = nextAction === 'player2_turn' || nextAction === 'player1_turn';
  const completedRunner = isIntermissionBetweenRuns ? (nextAction === 'player2_turn' ? p1Custom : p2Custom) : null;
  const nextRunner = isIntermissionBetweenRuns ? (nextAction === 'player2_turn' ? p2Custom : p1Custom) : null;
  const activeRunData = isIntermissionBetweenRuns ? (nextAction === 'player2_turn' ? p1Data : p2Data) : null;

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-sky-900 border-4 border-sky-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl text-white flex flex-col gap-5">
        
        {/* Header with Bold Typography */}
        <div className="text-center flex flex-col items-center gap-1 border-b-2 border-white/10 pb-4">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-sky-950 font-black px-4 py-1 rounded-full text-xs uppercase tracking-widest shadow-md">
            <Trophy className="w-4 h-4 fill-sky-950" />
            <span>ROUND 0{roundNumber} OF 02</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-white mt-1">
            {isIntermissionBetweenRuns 
              ? `${completedRunner?.name?.toUpperCase()}'S RUN COMPLETE!`
              : `ROUND 0${roundNumber} SUMMARY`}
          </h2>
          <p className="text-xs sm:text-sm text-sky-200 font-bold">
            {isIntermissionBetweenRuns
              ? `Fast river time! Now it's time for ${nextRunner?.name} to race!`
              : `Round complete! Winner: ${roundLeader}`}
          </p>
        </div>

        {/* If single runner intermission */}
        {isIntermissionBetweenRuns && completedRunner && activeRunData && (
          <div className="bg-white/10 border-2 border-white/20 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/30"
                  style={{ backgroundColor: completedRunner.boatColor }}
                >
                  <span>{completedRunner.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                </div>
                <div>
                  <h3 className="font-black text-xl text-yellow-300 uppercase tracking-tight">{completedRunner.name}</h3>
                  <p className="text-xs text-sky-200 font-bold">{completedRunner.characterName}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black font-mono text-white">
                  {activeRunData.dnf ? 'DNF' : `${activeRunData.timeElapsed.toFixed(2)}s`}
                </div>
                <div className="text-[10px] text-yellow-300 font-black uppercase tracking-widest">
                  {activeRunData.dnf ? 'OUT OF LIVES / TIME' : 'RACE TIME'}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10 text-center">
              <div className="bg-sky-950/60 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] text-sky-300 font-black uppercase flex items-center justify-center gap-1">
                  ❤️ Lives Left
                </div>
                <div className="text-xl font-black text-white mt-0.5">{activeRunData.livesRemaining}/5</div>
              </div>

              <div className="bg-sky-950/60 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] text-sky-300 font-black uppercase flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" /> Hits Taken
                </div>
                <div className="text-xl font-black text-yellow-300 mt-0.5">{activeRunData.obstaclesHit}</div>
              </div>

              <div className="bg-sky-950/60 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] text-sky-300 font-black uppercase flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Score
                </div>
                <div className="text-xl font-black text-emerald-300 mt-0.5">+{activeRunData.score}</div>
              </div>
            </div>

            {/* Next Runner Alert */}
            <div className="bg-sky-800/80 border-2 border-sky-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⏱️</span>
                <div>
                  <div className="font-black text-base uppercase text-yellow-300 tracking-wide">UP NEXT: {nextRunner?.name}</div>
                  <div className="text-xs text-sky-200 font-bold">Target time to beat: {activeRunData.timeElapsed.toFixed(2)}s</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If Both Runners Completed in Round */}
        {!isIntermissionBetweenRuns && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Red Boat (Player 1) Summary Card */}
            <div className={`p-5 rounded-3xl border-2 flex flex-col gap-3 shadow-xl ${
              roundLeader === p1Custom.name 
                ? 'bg-red-950/70 border-yellow-400 ring-4 ring-yellow-400/30' 
                : 'bg-red-950/30 border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow border-2 border-white/30"
                    style={{ backgroundColor: p1Custom.boatColor }}
                  >
                    <span>{p1Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-red-200 uppercase">{p1Custom.name}</h4>
                    <p className="text-xs text-red-300/80 font-bold">{p1Custom.characterName}</p>
                  </div>
                </div>
                {roundLeader === p1Custom.name && (
                  <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    👑 WINNER
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-bold">
                <span className="text-sky-300">Time:</span>
                <span className="font-mono font-black text-white text-sm">
                  {p1Data.dnf ? 'DNF' : `${p1Data.timeElapsed.toFixed(2)}s`}
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-bold">
                <span className="text-sky-300">Lives Left:</span>
                <span className="font-black text-red-400 text-sm">{p1Data.livesRemaining}/5</span>
              </div>

              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-bold">
                <span className="text-sky-300">Score Earned:</span>
                <span className="font-black text-emerald-400 text-sm">+{p1Data.score} PTS</span>
              </div>
            </div>

            {/* Blue Boat (Player 2) Summary Card */}
            <div className={`p-5 rounded-3xl border-2 flex flex-col gap-3 shadow-xl ${
              roundLeader === p2Custom.name 
                ? 'bg-blue-950/70 border-yellow-400 ring-4 ring-yellow-400/30' 
                : 'bg-blue-950/30 border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow border-2 border-white/30"
                    style={{ backgroundColor: p2Custom.boatColor }}
                  >
                    <span>{p2Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-base text-blue-200 uppercase">{p2Custom.name}</h4>
                    <p className="text-xs text-blue-300/80 font-bold">{p2Custom.characterName}</p>
                  </div>
                </div>
                {roundLeader === p2Custom.name && (
                  <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    👑 WINNER
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-bold">
                <span className="text-sky-300">Time:</span>
                <span className="font-mono font-black text-white text-sm">
                  {p2Data.dnf ? 'DNF' : `${p2Data.timeElapsed.toFixed(2)}s`}
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-bold">
                <span className="text-sky-300">Lives Left:</span>
                <span className="font-black text-red-400 text-sm">{p2Data.livesRemaining}/5</span>
              </div>

              <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl text-xs font-bold">
                <span className="text-sky-300">Score Earned:</span>
                <span className="font-black text-emerald-400 text-sm">+{p2Data.score} PTS</span>
              </div>
            </div>

          </div>
        )}

        {/* Chunky 3D Action Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xl italic border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 shadow-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>
            {isIntermissionBetweenRuns
              ? `START ${nextRunner?.name?.toUpperCase()}'S RUN`
              : nextAction === 'next_round'
                ? 'START ROUND 02 (P2 STARTS FIRST!)'
                : 'VIEW FINAL CHAMPIONSHIP RESULTS'}
          </span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>

      </div>
    </div>
  );
};
