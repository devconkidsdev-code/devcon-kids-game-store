import React from 'react';
import { Sliders, RefreshCw, AlertTriangle, ShieldCheck, Zap, Droplets } from 'lucide-react';
import { SCENARIOS } from '../data/calumpitData';
import { ScenarioConfig } from '../types/flood';

interface ScenarioSwitcherProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: ScenarioConfig) => void;
  language: 'tl' | 'en';
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  currentScenarioId,
  onSelectScenario,
  language
}) => {
  const scenarioKeys = Object.keys(SCENARIOS) as Array<keyof typeof SCENARIOS>;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              {language === 'tl' ? 'Simulator ng Sitwasyon ng Baha' : 'Flood Telemetry Scenario Simulator'}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono font-normal">
                CBFMMP Test Mode
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {language === 'tl'
                ? 'Pumili ng sitwasyon upang masubukan ang maagang babala at tugon sa mga barangay ng Calumpit.'
                : 'Select meteorological scenarios to test early warning sirens, river crest projections, and barangay safety.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarioKeys.map((key) => {
          const sc = SCENARIOS[key];
          const isSelected = currentScenarioId === sc.id;

          const getBadgeColor = () => {
            switch (sc.overallAlert) {
              case 'red':
                return 'border-red-500/50 bg-red-950/40 text-red-300';
              case 'orange':
                return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
              case 'yellow':
                return 'border-yellow-500/50 bg-yellow-950/40 text-yellow-300';
              default:
                return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300';
            }
          };

          const getIcon = () => {
            switch (sc.id) {
              case 'habagat_high_tide':
                return <Droplets className="w-4 h-4 text-cyan-400" />;
              case 'dam_release':
                return <Zap className="w-4 h-4 text-amber-400" />;
              case 'typhoon_severe':
                return <AlertTriangle className="w-4 h-4 text-red-400" />;
              default:
                return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
            }
          };

          return (
            <button
              key={sc.id}
              id={`scenario-btn-${sc.id}`}
              onClick={() => onSelectScenario(sc)}
              className={`text-left p-3 rounded-lg border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? `bg-neutral-800/90 ring-2 ring-cyan-500/60 shadow-lg ${getBadgeColor()}`
                  : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60 text-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {getIcon()}
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {language === 'tl' ? sc.tagalogName : sc.name}
                  </span>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    sc.overallAlert === 'red'
                      ? 'bg-red-900/60 text-red-300 border-red-700'
                      : sc.overallAlert === 'orange'
                      ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                      : sc.overallAlert === 'yellow'
                      ? 'bg-yellow-900/60 text-yellow-300 border-yellow-700'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {sc.overallAlert}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                {sc.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
