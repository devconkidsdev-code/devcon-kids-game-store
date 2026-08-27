import { useEffect, useState, useRef } from 'react';
import { CameraView } from './components/CameraView';
import { Office } from './components/Office';
import { GameState, Room } from './types';
import { Battery, BatteryLow, BatteryMedium } from 'lucide-react';
import jumpscareImg from './assets/images/jumpscare_1786687580700.jpg';

const MONSTER_PATH: Room[] = ['break_room', 'storage_room', 'hallway', 'office_entrance'];

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentView: 'office',
    activeCamera: 'break_room',
    monsterPosition: 'break_room',
    doorLocked: false,
    powerLevel: 100,
    time: 12,
    gameOver: false,
    gameWon: false,
    jumpscare: false,
  });
  
  const [gameStarted, setGameStarted] = useState(false);
  const [glitching, setGlitching] = useState(false);

  // Audio refs
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Start Game
  const startGame = () => {
    setGameStarted(true);
    setGameState({
      currentView: 'office',
      activeCamera: 'break_room',
      monsterPosition: 'break_room',
      doorLocked: false,
      powerLevel: 100,
      time: 12,
      gameOver: false,
      gameWon: false,
      jumpscare: false,
    });
    
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = 0.3;
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.play().catch(e => console.error(e));
    }
  };

  // Game Loop: Time & Power
  useEffect(() => {
    if (!gameStarted || gameState.gameOver || gameState.gameWon) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // Power drain logic
        let drain = 0.5;
        if (prev.currentView === 'cameras') drain += 0.5;
        if (prev.doorLocked) drain += 1.5;
        
        const newPower = Math.max(0, prev.powerLevel - drain);
        
        if (newPower === 0 && !prev.gameOver) {
          return { ...prev, powerLevel: 0, gameOver: true, currentView: 'office', doorLocked: false };
        }
        
        return { ...prev, powerLevel: newPower };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameState.gameOver, gameState.gameWon]);

  // Game Loop: Time progression (Every 60s is 1 hour in-game)
  useEffect(() => {
    if (!gameStarted || gameState.gameOver || gameState.gameWon) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const nextTime = prev.time === 12 ? 1 : prev.time + 1;
        if (nextTime === 6) {
          return { ...prev, time: 6, gameWon: true, currentView: 'office' };
        }
        return { ...prev, time: nextTime };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [gameStarted, gameState.gameOver, gameState.gameWon]);

  // Game Loop: Monster AI
  useEffect(() => {
    if (!gameStarted || gameState.gameOver || gameState.gameWon || gameState.powerLevel === 0) return;

    // Monster moves every 5-15 seconds
    const moveInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.gameOver || prev.gameWon) return prev;

        const currentPosIndex = MONSTER_PATH.indexOf(prev.monsterPosition as Room);
        
        // If in office entrance
        if (prev.monsterPosition === 'office_entrance') {
          if (prev.doorLocked) {
            // Door is locked, monster goes back to start
            triggerGlitch();
            return { ...prev, monsterPosition: 'break_room' };
          } else {
            // Door is open, jumpscare!
            return { ...prev, monsterPosition: 'office', gameOver: true, jumpscare: true };
          }
        }

        // 50% chance to advance
        if (Math.random() > 0.5) {
          const nextPosIndex = currentPosIndex + 1;
          const nextPos = MONSTER_PATH[nextPosIndex];
          triggerGlitch();
          return { ...prev, monsterPosition: nextPos };
        }

        return prev;
      });
    }, Math.random() * 10000 + 5000);

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameState.gameOver, gameState.gameWon, gameState.powerLevel]);

  // Handle power out
  useEffect(() => {
    if (gameState.powerLevel === 0 && !gameState.jumpscare && !gameState.gameWon) {
      const timeout = setTimeout(() => {
        setGameState(prev => ({ ...prev, jumpscare: true, gameOver: true }));
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [gameState.powerLevel, gameState.jumpscare, gameState.gameWon]);

  const triggerGlitch = () => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 400);
  };

  const toggleCameras = () => {
    if (gameState.powerLevel === 0) return;
    setGameState(prev => ({
      ...prev,
      currentView: prev.currentView === 'office' ? 'cameras' : 'office'
    }));
  };

  const toggleDoor = () => {
    if (gameState.powerLevel === 0) return;
    setGameState(prev => ({ ...prev, doorLocked: !prev.doorLocked }));
  };

  const switchCamera = (room: Room) => {
    setGameState(prev => ({ ...prev, activeCamera: room }));
    triggerGlitch();
  };

  // Main UI
  if (!gameStarted) {
    return (
      <div className="w-full h-screen flex flex-col p-12 relative overflow-hidden font-serif select-none" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, #000 1px), repeating-linear-gradient(#444 0, #000 1px)', backgroundSize: '4px 4px' }}></div>
        
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 rotate-90">
             <span className="text-[160px] font-black text-white/5 uppercase leading-none tracking-tighter select-none">DREAD</span>
          </div>
          
          <div className="max-w-2xl ml-32">
            <h1 className="text-[110px] font-bold leading-[0.85] tracking-tighter text-white mb-6 uppercase" style={{ textShadow: '4px 4px 0px rgba(220, 38, 38, 0.2)' }}>
              Night <br/> Shift
            </h1>
            
            <div className="w-32 h-[1px] bg-red-800 mb-8"></div>
            
            <p className="font-mono text-sm opacity-50 mb-12 max-w-md tracking-wider text-[#D1D1D1]">
              Watch the cameras. Conserve power. Lock the door if you see it. Survive until 6 AM.<br/><br/>
              <span className="text-red-600/60 uppercase">Warning: Flashing lights and jumpscares.</span>
            </p>

            <button onClick={startGame} className="group flex items-center gap-6 hover:translate-x-2 transition-all cursor-pointer">
              <span className="text-xs font-mono text-red-600 opacity-0 group-hover:opacity-100">01</span>
              <span className="text-3xl uppercase tracking-[0.3em] font-light text-white/40 group-hover:text-white transition-colors">Start Shift</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, transparent 15%, transparent 85%, rgba(5,5,5,0.6) 100%)' }}></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.9)' }}></div>
      </div>
    );
  }

  if (gameState.jumpscare) {
    return (
      <div className="w-full h-screen overflow-hidden flex flex-col items-center justify-center font-serif relative" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)' }}>
        <img src={jumpscareImg} className="absolute inset-0 w-full h-full object-cover glitch animate-pulse select-none pointer-events-none mix-blend-screen contrast-200" alt="Jumpscare" />
        <div className="absolute inset-0 bg-red-900/50 mix-blend-overlay animate-ping pointer-events-none" />
        
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, #000 1px), repeating-linear-gradient(#444 0, #000 1px)', backgroundSize: '4px 4px' }}></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, transparent 15%, transparent 85%, rgba(5,5,5,0.6) 100%)' }}></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.9)' }}></div>

        <div className="absolute z-50 text-center flex flex-col items-center mt-32">
           <h1 className="text-[110px] font-bold leading-[0.85] tracking-tighter text-white mb-12 uppercase glitch" style={{ textShadow: '4px 4px 0px rgba(220, 38, 38, 0.8)' }}>
             Game <br/> Over
           </h1>
           <button 
            onClick={() => setGameStarted(false)}
            className="group flex items-center gap-6 hover:translate-x-2 transition-all cursor-pointer"
           >
             <span className="text-xs font-mono text-red-600 opacity-0 group-hover:opacity-100">00</span>
             <span className="text-3xl uppercase tracking-[0.3em] font-light text-white/40 group-hover:text-white transition-colors">Restart</span>
           </button>
        </div>
      </div>
    );
  }

  if (gameState.gameWon) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center font-serif relative" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)' }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, #000 1px), repeating-linear-gradient(#444 0, #000 1px)', backgroundSize: '4px 4px' }}></div>
        
        <h1 className="text-[110px] font-bold leading-[0.85] tracking-tighter text-white mb-6 uppercase" style={{ textShadow: '4px 4px 0px rgba(220, 38, 38, 0.2)' }}>6:00 AM</h1>
        
        <div className="w-32 h-[1px] bg-red-800 mb-8"></div>
        
        <p className="font-mono text-sm opacity-50 mb-12 tracking-wider text-[#D1D1D1] uppercase">Shift Completed</p>
        
        <button 
          onClick={() => setGameStarted(false)}
          className="group flex items-center gap-6 hover:translate-x-2 transition-all cursor-pointer"
        >
          <span className="text-xs font-mono text-red-600 opacity-0 group-hover:opacity-100">&gt;&gt;</span>
          <span className="text-3xl uppercase tracking-[0.3em] font-light text-white/40 group-hover:text-white transition-colors">Main Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen flex flex-col relative overflow-hidden font-serif ${glitching ? 'glitch' : ''}`} style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)' }}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, #000 1px), repeating-linear-gradient(#444 0, #000 1px)', backgroundSize: '4px 4px' }}></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, transparent 15%, transparent 85%, rgba(5,5,5,0.6) 100%)' }}></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.9)' }}></div>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-12 flex justify-between items-start z-50 pointer-events-none">
        {/* Power */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_#dc2626] ${gameState.powerLevel > 20 ? 'bg-red-600' : 'bg-red-600 animate-pulse'}`}></div>
            <span className="font-mono text-xs tracking-widest text-red-600 uppercase font-bold">
              System Power // {Math.ceil(gameState.powerLevel)}%
            </span>
          </div>
          <div className="w-48 h-1 bg-white/10 relative overflow-hidden mt-2">
            <div 
              className={`absolute top-0 left-0 h-full bg-red-600 shadow-[0_0_10px_#dc2626] ${gameState.powerLevel <= 20 ? 'animate-pulse' : ''}`}
              style={{ width: `${gameState.powerLevel}%`, transition: 'width 1s linear' }}
            />
          </div>
        </div>

        {/* Time */}
        <div className="text-right flex flex-col items-end gap-1">
          <span className="font-mono text-xs tracking-widest text-red-600 uppercase font-bold">Local Time</span>
          <p className="text-4xl font-mono text-white tracking-tighter">
            {gameState.time}:00 <span className="text-[14px] opacity-40">AM</span>
          </p>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 relative z-20 flex flex-col justify-center items-center h-full">
        {gameState.currentView === 'office' ? (
          <div className="w-full h-full p-12 pt-32">
            <Office 
              powerLevel={gameState.powerLevel}
              doorLocked={gameState.doorLocked}
              time={gameState.time}
              toggleDoor={toggleDoor}
              openCameras={toggleCameras}
            />
          </div>
        ) : (
          <div className="relative w-full h-full max-w-5xl mx-auto py-32 flex flex-col items-center">
            <div className="w-full aspect-[4/3] border border-red-900/30 relative">
              <CameraView 
                activeCamera={gameState.activeCamera} 
                monsterPosition={gameState.monsterPosition} 
              />
            </div>
            
            {/* Close Cameras Button */}
            <button 
              onClick={toggleCameras}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 group flex items-center gap-4 hover:-translate-y-2 transition-all z-50 cursor-pointer"
            >
              <span className="text-xs font-mono text-red-600 opacity-0 group-hover:opacity-100">X</span>
              <span className="text-xl uppercase tracking-[0.3em] font-light text-white/60 group-hover:text-white transition-colors">Close Feed</span>
            </button>
            
            {/* Camera Controls */}
            <div className="absolute right-[-140px] top-1/2 -translate-y-1/2 flex flex-col gap-8 z-50">
              {(['break_room', 'storage_room', 'hallway', 'office_entrance'] as Room[]).map((room, idx) => (
                <button
                  key={room}
                  onClick={() => switchCamera(room)}
                  className="group flex items-center gap-4 hover:-translate-x-2 transition-all justify-end cursor-pointer"
                >
                  <span className={`text-2xl uppercase tracking-[0.2em] font-light transition-colors ${
                    gameState.activeCamera === room 
                      ? 'text-white' 
                      : 'text-white/40 group-hover:text-white/80'
                  }`}>
                    Cam_0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-mono transition-opacity ${
                    gameState.activeCamera === room ? 'text-red-600 opacity-100' : 'text-red-600 opacity-0 group-hover:opacity-50'
                  }`}>
                    REC
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Low Power Overlay */}
      {gameState.powerLevel === 0 && !gameState.jumpscare && (
        <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center pointer-events-none">
          <div className="w-full h-full static-overlay opacity-10" />
        </div>
      )}
    </div>
  );
}
