import React, { useEffect, useRef, useState } from 'react';
import { audio } from './audio';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { GameState } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [finalScore, setFinalScore] = useState(0);
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // Keep track of keys in a ref to avoid triggering React renders on every keypress
  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    repair: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) keysRef.current.up = true;
      if (['ArrowDown', 's', 'S'].includes(e.key)) keysRef.current.down = true;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) keysRef.current.left = true;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) keysRef.current.right = true;
      if ([' ', 'Enter'].includes(e.key)) keysRef.current.repair = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) keysRef.current.up = false;
      if (['ArrowDown', 's', 'S'].includes(e.key)) keysRef.current.down = false;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) keysRef.current.left = false;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) keysRef.current.right = false;
      if ([' ', 'Enter'].includes(e.key)) keysRef.current.repair = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    audio.init();
    keysRef.current = { up: false, down: false, left: false, right: false, repair: false };
    setGameState('PLAYING');
  };

  const handleWin = (score: number) => {
    audio.playWin();
    setFinalScore(score);
    setGameState('WIN');
  };

  const handleLose = (reason: string, score: number) => {
    audio.playLose();
    setCauseOfDeath(reason);
    setFinalScore(score);
    setGameState('LOSE');
  };

  const handleActionDown = (action: string) => {
    if (action in keysRef.current) {
      keysRef.current[action as keyof typeof keysRef.current] = true;
    }
  };

  const handleActionUp = (action: string) => {
    if (action in keysRef.current) {
      keysRef.current[action as keyof typeof keysRef.current] = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e7da] flex items-center justify-center p-4 overflow-hidden font-sans text-[#5a5a40] select-none">
      
      {gameState === 'START' && (
        <div className="max-w-md w-full bg-[#fefcf8] p-8 rounded-2xl shadow-2xl text-center border-4 border-[#8ba888]">
          <h1 className="text-5xl font-black text-[#5a5a40] mb-6 tracking-tight">
            BROPIPE
          </h1>
          <div className="space-y-4 mb-8 text-[#5a5a40]">
            <p className="font-medium">The community water pipes are broken and leaking! You must save the water supply.</p>
            <div className="bg-[#f0f4ee] border border-[#8ba888]/30 p-4 rounded-xl text-sm text-left space-y-2">
              <p>🚰 <strong>Goal:</strong> Repair 5 broken pipes before the water runs out.</p>
              <p>🕹️ <strong>Controls:</strong> Arrow keys / Touch D-Pad to move.</p>
              <p>🔧 <strong>Action:</strong> Spacebar or Wrench icon to repair.</p>
              <p>⚠️ <strong>Warning:</strong> Wrong repairs will cost you a life!</p>
            </div>
          </div>
          <button 
            onClick={startGame}
            className="w-full py-4 bg-[#5a5a40] hover:bg-black active:scale-95 text-white font-black rounded-xl shadow-lg transition-all text-lg border-b-4 border-black"
          >
            START GAME
          </button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="relative w-full max-w-4xl aspect-[4/3] flex items-center justify-center">
          <GameCanvas 
            onWin={handleWin} 
            onLose={handleLose} 
            keysRef={keysRef} 
          />
          <MobileControls 
            onActionDown={handleActionDown} 
            onActionUp={handleActionUp} 
          />
        </div>
      )}

      {gameState === 'WIN' && (
        <div className="max-w-md w-full bg-[#fefcf8] p-8 rounded-2xl shadow-2xl text-center border-4 border-[#8ba888]">
          <h2 className="text-4xl font-black text-[#5a5a40] mb-2">YOU WON!</h2>
          <p className="text-lg text-[#8ba888] mb-6 font-bold uppercase tracking-widest">ALL PIPES FIXED!<br/>COMMUNITY WATER SAVED!</p>
          
          <div className="bg-[#f0f4ee] border border-[#8ba888]/30 p-6 rounded-xl mb-8">
            <p className="text-sm text-[#8ba888] uppercase tracking-widest mb-1 font-bold">Final Score</p>
            <p className="text-6xl font-black text-[#5a5a40]">{finalScore}</p>
          </div>

          <button 
            onClick={startGame}
            className="w-full py-4 bg-[#5a5a40] hover:bg-black active:scale-95 text-white font-black rounded-xl shadow-lg transition-all text-lg border-b-4 border-black"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {gameState === 'LOSE' && (
        <div className="max-w-md w-full bg-[#fefcf8] p-8 rounded-2xl shadow-2xl text-center border-4 border-[#e69b81]">
          <h2 className="text-4xl font-black text-[#e69b81] mb-2">GAME OVER</h2>
          <p className="text-lg text-[#e69b81] mb-6 font-bold uppercase tracking-widest">{causeOfDeath}</p>
          
          <div className="bg-[#f0f4ee] border border-[#8ba888]/30 p-6 rounded-xl mb-8">
            <p className="text-sm text-[#8ba888] uppercase tracking-widest mb-1 font-bold">Final Score</p>
            <p className="text-6xl font-black text-[#5a5a40]">{finalScore}</p>
          </div>

          <button 
            onClick={startGame}
            className="w-full py-4 bg-[#5a5a40] hover:bg-black active:scale-95 text-white font-black rounded-xl shadow-lg transition-all text-lg border-b-4 border-black"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

    </div>
  );
}
