import React from 'react';
import { Settings, Play } from 'lucide-react';
import { HardwareStatus } from '../types';

interface SimulatorProps {
  rainfall: number;
  setRainfall: (v: number) => void;
  riverLevel: number;
  setRiverLevel: (v: number) => void;
  rateOfRise: number;
  setRateOfRise: (v: number) => void;
  waterVelocity: number;
  setWaterVelocity: (v: number) => void;
  hardware: HardwareStatus;
  setHardware: (h: HardwareStatus) => void;
  onRunForecast: () => void;
}

export function Simulator({ rainfall, setRainfall, riverLevel, setRiverLevel, rateOfRise, setRateOfRise, waterVelocity, setWaterVelocity, hardware, setHardware, onRunForecast }: SimulatorProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-6 shadow-md text-white">
      <div className="flex items-center mb-4 border-b border-slate-700 pb-2">
        <Settings className="h-4 w-4 mr-2 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Dev Simulator Mode</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="flex justify-between text-xs text-slate-400 mb-1">
            <span>1h Rainfall (mm)</span>
            <span>{rainfall.toFixed(1)} mm</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="150" 
            step="1" 
            value={rainfall} 
            onChange={(e) => setRainfall(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs text-slate-400 mb-1">
            <span>River Level (m)</span>
            <span>{riverLevel.toFixed(1)} m</span>
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="10" 
            step="0.1" 
            value={riverLevel} 
            onChange={(e) => setRiverLevel(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Rate of Rise (m/hr)</span>
            <span>+{rateOfRise.toFixed(2)} m/hr</span>
          </label>
          <input 
            type="range" 
            min="-1" 
            max="3" 
            step="0.05" 
            value={rateOfRise} 
            onChange={(e) => setRateOfRise(parseFloat(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Water Velocity (m/s)</span>
            <span>{waterVelocity.toFixed(1)} m/s</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="6" 
            step="0.1" 
            value={waterVelocity} 
            onChange={(e) => setWaterVelocity(parseFloat(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
           <span className="text-slate-400">LoRa Connection:</span>
           <button 
             onClick={() => setHardware({ ...hardware, lora: hardware.lora === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' })}
             className={`px-3 py-1 rounded font-bold ${hardware.lora === 'CONNECTED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
           >
             {hardware.lora}
           </button>
        </div>
        <div className="flex justify-between items-center text-xs">
           <span className="text-slate-400">Internet Connection:</span>
           <button 
             onClick={() => setHardware({ ...hardware, internet: hardware.internet === 'ONLINE' ? 'OFFLINE' : 'ONLINE' })}
             className={`px-3 py-1 rounded font-bold ${hardware.internet === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
           >
             {hardware.internet}
           </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={onRunForecast}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-bold text-sm flex items-center justify-center transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            RUN AI FORECAST
          </button>
        </div>
      </div>
    </div>
  );
}
