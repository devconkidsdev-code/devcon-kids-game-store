import React from 'react';
import { DamStatus } from '../types';
import { Waves, ArrowDownRight, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface DamReleaseMonitorProps {
  damStatus: DamStatus[];
}

export const DamReleaseMonitor: React.FC<DamReleaseMonitorProps> = ({ damStatus }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Upstream Dam Inflow & Spillway Telemetry (Angat & Bustos)
            </h3>
            <p className="text-xs text-slate-400">
              Discharge cascading into Bagbag River Confluence • Hydro-Kinetic Travel Time to Calumpit
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>DAM SPILLED WATER MONITOR</span>
        </div>
      </div>

      {/* Dam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {damStatus.map((dam) => {
          const isAlert = dam.warningLevel === 'SPILLING_ALERT';
          const fillPercentage = (dam.waterLevel / dam.spillingLevel) * 100;

          return (
            <div
              key={dam.name}
              className={`bg-slate-950/70 border rounded-xl p-4 flex flex-col justify-between ${
                isAlert ? 'border-amber-500/60 shadow-lg shadow-amber-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{dam.name}</h4>
                    <p className="text-[11px] text-slate-400">{dam.location}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAlert
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  }`}>
                    {dam.warningLevel.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Level Gauge & Spilling bar */}
                <div className="my-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Water Elevation</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Spilling: {dam.spillingLevel.toFixed(2)}m
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                    {dam.waterLevel.toFixed(2)} <span className="text-xs font-normal text-slate-400">meters MSL</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dam.waterLevel >= dam.spillingLevel ? 'bg-red-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, fillPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Gates and Discharge */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Spillway Gates Open</span>
                    <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                      {dam.gatesOpen} Gates ({dam.totalGateOpeningMeters}m aperture)
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Discharge Rate</span>
                    <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                      {dam.dischargeRateCms} <span className="text-xs font-normal">m³/s (CMS)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrival Time Callout */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Arrival to Calumpit:</span>
                </div>
                <span className="font-mono font-bold text-slate-200 text-xs">
                  ~{dam.estimatedArrivalToCalumpitHours} hours
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hydraulic Confluence Note */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-200">The Dual-Action Confluence Factor:</strong> Angat Dam releases pass through Bustos Dam and flow directly through the Bagbag River into Calumpit center. If the Pampanga River is simultaneously swollen by Candaba Swamp runoff, water cannot drain towards Manila Bay and floods Calumpit's 29 barangays.
          </p>
        </div>
      </div>
    </div>
  );
};
