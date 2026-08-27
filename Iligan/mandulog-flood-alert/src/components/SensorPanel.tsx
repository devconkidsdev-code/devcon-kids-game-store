import React from 'react';
import { Waves, CloudRain, TrendingUp, TrendingDown, ArrowRight, Radio, Wind } from 'lucide-react';
import { SensorData, HardwareStatus } from '../types';

interface SensorPanelProps {
  data: SensorData;
  hardware: HardwareStatus;
}

export function SensorPanel({ data, hardware }: SensorPanelProps) {
  const isOnline = hardware.lora === 'CONNECTED' && hardware.gateway === 'ONLINE';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live LoRa Monitoring</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1">NODE: MANDULOG-UPSTREAM-01</p>
        </div>
        <div className="flex flex-col items-end">
           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             <Radio className="h-3 w-3" />
             {isOnline ? 'CONNECTED' : 'OFFLINE'}
           </span>
           <span className="text-[9px] text-slate-400 mt-1 uppercase">Last Update: {data.timestamp}</span>
        </div>
      </div>
      
      {!isOnline ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
          <p className="text-red-600 font-bold text-sm">SENSOR OFFLINE</p>
          <p className="text-red-400 text-xs mt-1">Last valid reading: {data.timestamp}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center mb-2">
              <CloudRain className="h-4 w-4 mr-1.5 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase">Rain (1h)</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-slate-800">{data.rainfall1h.toFixed(1)}</span>
              <span className="text-xs font-medium text-slate-500 ml-1">mm</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center mb-2">
              <Waves className="h-4 w-4 mr-1.5 text-blue-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase">River Level</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-slate-800">{data.currentRiverLevel.toFixed(2)}</span>
              <span className="text-xs font-medium text-slate-500 ml-1">m</span>
            </div>
          </div>

          <div className="col-span-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Wind className="h-4 w-4 mr-1.5 text-teal-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase">Water Velocity</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-slate-800">{data.waterVelocity.toFixed(1)}</span>
                <span className="text-xs font-medium text-slate-500 ml-1">m/s</span>
              </div>
            </div>
            <div className="relative h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${data.waterVelocity < 1.5 ? 'bg-green-500' : data.waterVelocity < 3 ? 'bg-yellow-500' : data.waterVelocity < 4.5 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min((data.waterVelocity / 6) * 100, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase">
              <span>Low</span>
              <span>Mod</span>
              <span>Fast</span>
              <span>V. Fast</span>
            </div>
          </div>

          <div className="col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Rate of Rise</p>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-blue-900">+{data.rateOfRise.toFixed(2)}</span>
                <span className="text-[10px] font-medium text-blue-700 ml-1">m/hour</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Trend</p>
              <div className="flex items-center justify-end text-sm font-bold text-blue-900">
                {data.trend === 'RAPIDLY RISING' && <TrendingUp className="h-4 w-4 mr-1 text-red-500" />}
                {data.trend === 'RISING' && <TrendingUp className="h-4 w-4 mr-1 text-orange-500" />}
                {data.trend === 'STABLE' && <ArrowRight className="h-4 w-4 mr-1 text-blue-500" />}
                {data.trend === 'FALLING' && <TrendingDown className="h-4 w-4 mr-1 text-green-500" />}
                {data.trend}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
