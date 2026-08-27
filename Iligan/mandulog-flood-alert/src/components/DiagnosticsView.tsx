import React from 'react';
import { HardwareStatus } from '../types';
import { Wifi, Cpu, Droplets, Waves, Radio, Server, Activity } from 'lucide-react';

interface DiagnosticsViewProps {
  status: HardwareStatus;
}

export function DiagnosticsView({ status }: DiagnosticsViewProps) {
  const StatusBadge = ({ state, onlineValues }: { state: string, onlineValues: string[] }) => {
    const isOnline = onlineValues.includes(state);
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {state}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Hardware Diagnostics</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-semibold">ESP32 Controller</span>
            </div>
            <StatusBadge state={status.esp32} onlineValues={['CONNECTED']} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-semibold">Rain Sensor Array</span>
            </div>
            <StatusBadge state={status.rainSensor} onlineValues={['WORKING']} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <Waves className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-semibold">Water Level Sensor</span>
            </div>
            <StatusBadge state={status.waterLevelSensor} onlineValues={['WORKING']} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-semibold">SX1278 LoRa Module</span>
            </div>
            <StatusBadge state={status.lora} onlineValues={['CONNECTED']} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-slate-700" />
              <span className="text-sm font-semibold">LoRa Gateway</span>
            </div>
            <StatusBadge state={status.gateway} onlineValues={['ONLINE']} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-sm font-semibold">Internet Connection</span>
            </div>
            <StatusBadge state={status.internet} onlineValues={['ONLINE']} />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Last Packet</p>
            <p className="text-sm font-medium">{status.lastPacketTime}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Success Rate</p>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-bold text-emerald-600">{status.packetSuccessRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
