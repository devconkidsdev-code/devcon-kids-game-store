import React, { useEffect } from 'react';
import { BoatCustomization, RoundResult } from '../types/game';
import { Trophy, Award, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinalWinnerModalProps {
  roundResults: RoundResult[];
  p1Custom: BoatCustomization;
  p2Custom: BoatCustomization;
  p1TotalScore: number;
  p2TotalScore: number;
  onRestartChampionship: () => void;
}

export const FinalWinnerModal: React.FC<FinalWinnerModalProps> = ({
  roundResults,
  p1Custom,
  p2Custom,
  p1TotalScore,
  p2TotalScore,
  onRestartChampionship
}) => {
  // Trigger fireworks confetti celebration
  useEffect(() => {
    const end = Date.now() + 3000;
    const colors = ['#facc15', '#38bdf8', '#ef4444', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Determine overall champion
  let winner: 'player1' | 'player2' | 'tie' = 'tie';
  if (p1TotalScore > p2TotalScore) winner = 'player1';
  else if (p2TotalScore > p1TotalScore) winner = 'player2';

  const champion = winner === 'player1' ? p1Custom : winner === 'player2' ? p2Custom : null;

  // Compute total times
  const p1TotalTime = roundResults.reduce((acc, r) => acc + (r.player1Result.dnf ? 60 : r.player1Result.timeElapsed), 0);
  const p2TotalTime = roundResults.reduce((acc, r) => acc + (r.player2Result.dnf ? 60 : r.player2Result.timeElapsed), 0);

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/90 backdrop-blur-lg flex items-center justify-center p-4 select-none animate-in zoom-in-95 duration-200">
      <div className="bg-sky-900 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl text-white flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Championship Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-sky-950 font-black px-5 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-lg">
            <Trophy className="w-4 h-4 fill-sky-950" />
            <span>GRAND CHAMPIONSHIP FINALE</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-yellow-400 drop-shadow-lg">
            {winner === 'tie' ? "IT'S AN EPIC TIE!" : `${champion?.name?.toUpperCase()} WINS!`}
          </h1>

          <p className="text-xs sm:text-sm text-sky-200 font-bold">
            {winner === 'tie'
              ? 'Both captains delivered legendary performances across 2 grueling rounds!'
              : `Crowned the Ultimate River Speed Champion after 2 intense rounds!`}
          </p>
        </div>

        {/* Podium Display (Bold Typography Cards) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Red Boat (Player 1) Podium */}
          <div className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 text-center transition-all ${
            winner === 'player1'
              ? 'bg-red-950/80 border-yellow-400 ring-4 ring-yellow-400/30 shadow-2xl scale-102'
              : 'bg-red-950/30 border-white/20 opacity-85'
          }`}>
            {winner === 'player1' && (
              <span className="text-3xl animate-bounce">👑</span>
            )}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/30"
              style={{ backgroundColor: p1Custom.boatColor }}
            >
              <span>{p1Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
            </div>
            <div>
              <h3 className="font-black text-red-200 text-lg uppercase">{p1Custom.name}</h3>
              <p className="text-xs text-red-300/80 font-bold">{p1Custom.characterName}</p>
            </div>

            <div className="w-full bg-black/40 rounded-2xl p-3 mt-1 flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-sky-300 font-bold">
                <span>Total Score:</span>
                <span className="font-black text-yellow-300 font-mono text-base">{p1TotalScore.toLocaleString()} PTS</span>
              </div>
              <div className="flex justify-between text-sky-300 font-bold">
                <span>Total Time:</span>
                <span className="font-black text-white font-mono">{p1TotalTime.toFixed(2)}s</span>
              </div>
            </div>
          </div>

          {/* Blue Boat (Player 2) Podium */}
          <div className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 text-center transition-all ${
            winner === 'player2'
              ? 'bg-blue-950/80 border-yellow-400 ring-4 ring-yellow-400/30 shadow-2xl scale-102'
              : 'bg-blue-950/30 border-white/20 opacity-85'
          }`}>
            {winner === 'player2' && (
              <span className="text-3xl animate-bounce">👑</span>
            )}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/30"
              style={{ backgroundColor: p2Custom.boatColor }}
            >
              <span>{p2Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
            </div>
            <div>
              <h3 className="font-black text-blue-200 text-lg uppercase">{p2Custom.name}</h3>
              <p className="text-xs text-blue-300/80 font-bold">{p2Custom.characterName}</p>
            </div>

            <div className="w-full bg-black/40 rounded-2xl p-3 mt-1 flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-sky-300 font-bold">
                <span>Total Score:</span>
                <span className="font-black text-yellow-300 font-mono text-base">{p2TotalScore.toLocaleString()} PTS</span>
              </div>
              <div className="flex justify-between text-sky-300 font-bold">
                <span>Total Time:</span>
                <span className="font-black text-white font-mono">{p2TotalTime.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Round Breakdown Table */}
        <div className="bg-sky-950/70 border-2 border-white/15 rounded-3xl p-4 flex flex-col gap-3">
          <div className="text-xs font-black uppercase text-yellow-300 tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>2-ROUND CHAMPIONSHIP BREAKDOWN</span>
          </div>

          <div className="flex flex-col gap-2">
            {roundResults.map((round) => (
              <div key={round.roundNumber} className="bg-black/30 p-3 rounded-2xl border border-white/10 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center text-sky-300 font-black border-b border-white/10 pb-1.5">
                  <span>ROUND 0{round.roundNumber} (Starter: {round.starterPlayerId === 'player1' ? p1Custom.name : p2Custom.name})</span>
                  <span className="text-yellow-300 uppercase">
                    Winner: {round.winner === 'player1' ? p1Custom.name : round.winner === 'player2' ? p2Custom.name : 'Tie'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* P1 round stat */}
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 font-black">{p1Custom.name}:</span>
                    <span className="font-mono text-white font-bold">
                      {round.player1Result.dnf ? 'DNF' : `${round.player1Result.timeElapsed.toFixed(2)}s`} ({round.player1Result.livesRemaining}♥, +{round.player1Result.score}pts)
                    </span>
                  </div>

                  {/* P2 round stat */}
                  <div className="flex justify-between items-center">
                    <span className="text-red-200 font-black">{p2Custom.name}:</span>
                    <span className="font-mono text-white font-bold">
                      {round.player2Result.dnf ? 'DNF' : `${round.player2Result.timeElapsed.toFixed(2)}s`} ({round.player2Result.livesRemaining}♥, +{round.player2Result.score}pts)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restart Button with Chunky 3D Arcade Styling */}
        <button
          onClick={onRestartChampionship}
          className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xl italic border-b-8 border-yellow-600 active:border-b-0 active:translate-y-2 shadow-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 stroke-[3]" />
          <span>RACE AGAIN (NEW CHAMPIONSHIP)</span>
        </button>

      </div>
    </div>
  );
};
