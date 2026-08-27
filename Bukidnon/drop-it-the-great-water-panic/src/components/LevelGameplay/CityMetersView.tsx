import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface CityMetersViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; leaksFixed: number }) => void;
}

interface SmartMeterNode {
  id: string;
  zone: string;
  usageLitersHour: number;
  isLeaking: boolean;
  fixed: boolean;
  cause: string;
}

export const CityMetersView: React.FC<CityMetersViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const [nodes, setNodes] = useState<SmartMeterNode[]>([
    { id: '1', zone: 'Downtown Plaza Fountain', usageLitersHour: 850, isLeaking: true, fixed: false, cause: 'Submerged cracked supply line' },
    { id: '2', zone: 'Mega-Shine 24/7 Car Wash', usageLitersHour: 920, isLeaking: true, fixed: false, cause: 'Continuous open pressure hose with no shutoff trigger' },
    { id: '3', zone: 'Skyscraper District Apts', usageLitersHour: 340, isLeaking: false, fixed: true, cause: 'Normal morning routine' },
    { id: '4', zone: 'Industrial Cooling Tower', usageLitersHour: 780, isLeaking: true, fixed: false, cause: 'Evaporative chiller overflow valve stuck open' },
  ]);

  const [waterSaved, setWaterSaved] = useState(0);

  const handleFixMeter = (nodeId: string) => {
    soundManager.playRepair();
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, fixed: true, usageLitersHour: 150 } : n))
    );
    setWaterSaved((w) => w + 500);
  };

  const allFixed = nodes.every((n) => n.fixed);

  const handleFinishAudit = () => {
    soundManager.playVictory();
    setTimeout(() => {
      onSuccess({ waterSaved: 1600 + levelId * 35, leaksFixed: 3 });
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-violet-50 p-3.5 rounded-2xl border border-violet-200">
        <div>
          <span className="text-[11px] uppercase font-bold text-violet-800 tracking-wider">
            Splash City Smart Meter Hydro-Audit
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Urban Loss Prevented</span>
          <span className="text-sm font-extrabold text-violet-700">{waterSaved} L / hour</span>
        </div>
      </div>

      {/* Grid of Urban Smart Meter Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              node.fixed
                ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                : 'bg-rose-50/80 border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${node.fixed ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`} />
                <h4 className="text-xs font-bold text-slate-900">{node.zone}</h4>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  node.fixed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}
              >
                {node.fixed ? 'Efficient' : 'Spike Detected!'}
              </span>
            </div>

            <div className="my-2.5">
              <span className="text-xs font-extrabold text-slate-800 block">
                Flow Rate: {node.usageLitersHour} L/hr
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">{node.cause}</p>
            </div>

            {node.fixed ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-white/80 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Smart Regulator Installed</span>
              </div>
            ) : (
              <button
                onClick={() => handleFixMeter(node.id)}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Fix Urban Waste</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Completion */}
      <div className="mt-5 w-full flex justify-center">
        {allFixed ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinishAudit}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Splash City Smart Grid Optimized! Continue!</span>
          </motion.button>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            Audit and repair all 3 abnormal municipal water consumption spikes!
          </p>
        )}
      </div>
    </div>
  );
};
