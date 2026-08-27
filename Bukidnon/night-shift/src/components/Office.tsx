import { Battery, BatteryLow, BatteryMedium, DoorClosed, DoorOpen, Monitor } from 'lucide-react';
import { Room } from '../types';

interface OfficeProps {
  powerLevel: number;
  doorLocked: boolean;
  time: number;
  toggleDoor: () => void;
  openCameras: () => void;
}

export function Office({ powerLevel, doorLocked, time, toggleDoor, openCameras }: OfficeProps) {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black z-0" />
      
      {/* Door visualization */}
      <div className="relative z-10 w-[800px] h-[600px] border-8 border-zinc-900 flex justify-center items-end pb-8">
        {/* The Doorway */}
        <div className={`absolute top-0 bottom-0 left-[10%] right-[10%] transition-colors duration-500 flex justify-center items-center ${doorLocked ? 'bg-zinc-800' : 'bg-black'}`}>
          {doorLocked ? (
             <div className="w-full h-full border-4 border-zinc-700 bg-zinc-800 flex flex-col justify-between p-12">
               <div className="w-full h-20 bg-zinc-900 rounded opacity-50"></div>
               <div className="w-full h-20 bg-zinc-900 rounded opacity-50"></div>
               <div className="w-full h-20 bg-zinc-900 rounded opacity-50"></div>
             </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
              <span className="text-white font-mono text-xl tracking-[1em]">DARKNESS</span>
            </div>
          )}
        </div>

        {/* Desk */}
        <div className="absolute bottom-0 w-[120%] h-48 bg-[#050505]/90 border-t border-red-900/30 flex justify-between items-end px-48 pb-12 z-20 backdrop-blur-md">
          
          {/* Monitor Button */}
          <button 
            onClick={openCameras}
            className="group flex flex-col items-start gap-2 hover:translate-x-2 transition-all cursor-pointer"
          >
            <span className="text-[10px] font-mono text-red-600 opacity-0 group-hover:opacity-100 tracking-widest">SYS_01</span>
            <span className="text-3xl uppercase tracking-[0.3em] font-light text-white/40 group-hover:text-white transition-colors">Cameras</span>
          </button>

          {/* Door Button */}
          <button 
            onClick={toggleDoor}
            className="group flex flex-col items-end gap-2 hover:-translate-x-2 transition-all cursor-pointer"
          >
            <span className="text-[10px] font-mono text-red-600 opacity-0 group-hover:opacity-100 tracking-widest">SYS_02</span>
            <span className={`text-3xl uppercase tracking-[0.3em] font-light transition-colors ${
              doorLocked 
                ? 'text-red-600' 
                : 'text-white/40 group-hover:text-white'
            }`} style={doorLocked ? { textShadow: '0 0 15px rgba(220, 38, 38, 0.8)' } : {}}>
              {doorLocked ? 'Unlock' : 'Lock'} Door
            </span>
          </button>
        </div>
      </div>
      
      {/* Vignette */}
      <div className="vignette" />
    </div>
  );
}
