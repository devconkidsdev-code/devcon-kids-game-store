import React from 'react';
import { AlertSeverity } from '../types';
import { Siren, AlertTriangle, AlertCircle, CheckCircle2, Megaphone, BellRing, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  overallAlert: { level: AlertSeverity; reason: string };
  onOpenDispatcher: () => void;
  canioganGaugeLevel: number;
  rain24hMm: number;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  overallAlert,
  onOpenDispatcher,
  canioganGaugeLevel,
  rain24hMm
}) => {
  const { level, reason } = overallAlert;

  if (level === 'NORMAL') {
    return (
      <div id="alert-banner-normal" className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-emerald-200">NORMAL HYDROLOGICAL CONDITION (ALERT LEVEL 0)</h2>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Caniogan Bridge Staff Gauge: <span className="font-mono font-bold text-emerald-300">{canioganGaugeLevel.toFixed(2)}m</span> (Capacity: 3.50m) • 24-hr Basin Rainfall: <span className="font-mono font-bold text-emerald-300">{rain24hMm}mm</span>. Normal river drainage active.
            </p>
          </div>
        </div>
        <button
          id="btn-broadcast-normal"
          onClick={onOpenDispatcher}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700 text-emerald-200 shrink-0 flex items-center gap-1.5 transition-colors"
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Dispatch Center</span>
        </button>
      </div>
    );
  }

  if (level === 'YELLOW') {
    return (
      <div id="alert-banner-yellow" className="bg-yellow-950/40 border-2 border-yellow-500/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-yellow-950/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-yellow-500 text-yellow-950 uppercase tracking-wider">
                ALERT LEVEL 1 • YELLOW WARNING
              </span>
              <span className="text-xs font-semibold text-yellow-300">THREATENING FLOOD LEVEL</span>
            </div>
            <p className="text-xs text-yellow-200/90 mt-1 font-medium">
              Flooding is threatening in low-lying riverside areas. Caniogan Gauge reads <span className="font-bold font-mono">{canioganGaugeLevel.toFixed(2)}m</span> (≥1.50m threshold) or 24-hr rain reached <span className="font-bold font-mono">{rain24hMm}mm</span>.
            </p>
            <p className="text-[11px] text-yellow-400/80 mt-0.5">
              Action: BDRRMC officers alerted. Monitor riverside staff gauges in San Miguel, Frances, and Poblacion.
            </p>
          </div>
        </div>
        <button
          id="btn-broadcast-yellow"
          onClick={onOpenDispatcher}
          className="text-xs px-3.5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold shrink-0 flex items-center gap-1.5 shadow transition-all"
        >
          <BellRing className="w-4 h-4" />
          <span>Dispatch Yellow Advisory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (level === 'ORANGE') {
    return (
      <div id="alert-banner-orange" className="bg-amber-950/60 border-2 border-amber-500/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-amber-950/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-500 text-amber-950 uppercase tracking-wider">
                ALERT LEVEL 2 • ORANGE WARNING
              </span>
              <span className="text-xs font-semibold text-amber-300">PRE-EVACUATION ACTIVE</span>
            </div>
            <p className="text-xs text-amber-100 mt-1 font-medium">
              MDRRMO Alert: River levels are rising rapidly. Prepare emergency go-bags. Low-lying barangays (Frances, San Miguel, Meysulao, Calizon) on pre-evacuation alert.
            </p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              Trigger: Caniogan Gauge at <span className="font-bold font-mono">{canioganGaugeLevel.toFixed(2)}m</span> (≥2.50m threshold) with upstream dam release and incoming high tide.
            </p>
          </div>
        </div>
        <button
          id="btn-broadcast-orange"
          onClick={onOpenDispatcher}
          className="text-xs px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
        >
          <Megaphone className="w-4 h-4" />
          <span>Dispatch Pre-Evacuation SMS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // RED WARNING
  return (
    <div id="alert-banner-red" className="bg-red-950/70 border-2 border-red-500 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl shadow-red-950 animate-siren">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-red-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-red-600/40">
          <Siren className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
              ALERT LEVEL 3 • RED WARNING (CRITICAL)
            </span>
            <span className="text-xs font-bold text-red-300">MANDATORY IMMEDIATE EVACUATION</span>
          </div>
          <p className="text-xs text-white mt-1 font-semibold">
            CRITICAL FLOOD EVENT: Immediate evacuation required for riverside, confluence, and delta communities. Caniogan Bridge gauge at <span className="font-mono text-red-300 font-black">{canioganGaugeLevel.toFixed(2)}m</span> (Capacity &gt;3.50m exceeded) / 24h Rain: <span className="font-mono text-red-300 font-black">{rain24hMm}mm</span>.
          </p>
          <p className="text-[11px] text-red-200/90 mt-0.5">
            Target Barangays: Frances, San Miguel, Meysulao, Calizon, Sapang Bayan, Gatbuca, Gugo, Piocruzcosa. Deploy all rescue watercraft.
          </p>
        </div>
      </div>
      <button
        id="btn-broadcast-red"
        onClick={onOpenDispatcher}
        className="text-xs px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black shrink-0 flex items-center gap-2 shadow-lg shadow-red-600/50 transition-all uppercase tracking-wide"
      >
        <Siren className="w-4 h-4 animate-spin" />
        <span>BROADCAST RED SIREN ALERT</span>
      </button>
    </div>
  );
};
