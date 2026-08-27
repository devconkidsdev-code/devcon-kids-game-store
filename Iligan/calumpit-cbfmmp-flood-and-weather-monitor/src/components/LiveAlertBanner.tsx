import React from 'react';
import { AlertOctagon, CloudRain, Waves, Wind, Siren, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { AlertLevel, DamStatus, TideData, WeatherData } from '../types/flood';

interface LiveAlertBannerProps {
  overallAlert: AlertLevel;
  weather: WeatherData;
  dams: DamStatus[];
  tide: TideData;
  language: 'tl' | 'en';
  activeSirensCount: number;
  inundatedBarangaysCount: number;
}

export const LiveAlertBanner: React.FC<LiveAlertBannerProps> = ({
  overallAlert,
  weather,
  dams,
  tide,
  language,
  activeSirensCount,
  inundatedBarangaysCount
}) => {
  const spillingDams = dams.filter(d => d.dischargeRate > 0 || d.warningIssued);

  const getAlertStyle = () => {
    switch (overallAlert) {
      case 'red':
        return 'bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-red-700/80 text-red-100';
      case 'orange':
        return 'bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 border-amber-700/80 text-amber-100';
      case 'yellow':
        return 'bg-gradient-to-r from-yellow-950 via-amber-900 to-yellow-900 border-yellow-700/80 text-yellow-100';
      default:
        return 'bg-gradient-to-r from-slate-900 via-neutral-900 to-emerald-950 border-neutral-700 text-neutral-200';
    }
  };

  return (
    <section aria-label="Live Emergency Alert Banner" className={`border-b shadow-md transition-colors duration-300 ${getAlertStyle()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Main Advisory Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 p-2 rounded-lg bg-black/30 border border-white/10 shrink-0">
              {overallAlert === 'red' ? (
                <AlertOctagon className="w-6 h-6 text-red-400 animate-bounce" />
              ) : overallAlert === 'orange' ? (
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              ) : (
                <Waves className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/40 border border-white/15">
                  {language === 'tl' ? 'PAGBABALITA NG MDRRMO' : 'MDRRMO ADVISORY'}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} | Calumpit Basin
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {overallAlert === 'red' && (language === 'tl'
                  ? `MATINDING BABALA SA BAHA: ${inundatedBarangaysCount} Barangay ang apektado. Agarang paglikas sa ligtas na lugar!`
                  : `CRITICAL FLOOD EMERGENCY: ${inundatedBarangaysCount} Barangays severely inundated. Evacuate low-lying areas now!`)}
                {overallAlert === 'orange' && (language === 'tl'
                  ? `PAGHAHANDA SA BAHA: Tumataas ang antas ng Pampanga at Angat River. Ihanda ang pamilya at kagamitan.`
                  : `FLOOD PREPARATION ADVISORY: Rising river levels across Pampanga and Angat channels. Preemptive actions active.`)}
                {overallAlert === 'yellow' && (language === 'tl'
                  ? `PAGMAMATYAG SA PANAHON: May mga pag-ulan at posibleng pagbaha sa mabababang bahagi ng bayan.`
                  : `FLOOD WATCH ACTIVE: Continuous rainfall monitoring. Low-lying zones advised to remain vigilant.`)}
                {overallAlert === 'normal' && (language === 'tl'
                  ? 'NORMAL NA KALAGAYAN: Ligtas at normal ang antas ng tubig sa lahat ng monitoring stations sa Calumpit.'
                  : 'NORMAL STATUS: River telemetry and weather systems within safe operational levels in Calumpit.')}
              </h2>
            </div>
          </div>

          {/* Quick Warning Chips */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            
            {/* Rainfall Warning */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/10 text-xs">
              <CloudRain className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {language === 'tl' ? 'Ulan' : 'Rain'}: <strong className="text-white">{weather.rainfallRate} mm/h</strong>
              </span>
            </div>

            {/* TCWS Signal */}
            {weather.tcwsSignal > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-900/60 border border-red-500/40 text-xs font-bold text-red-200">
                <Wind className="w-3.5 h-3.5 text-red-300" />
                <span>TCWS #{weather.tcwsSignal}</span>
              </div>
            )}

            {/* Dam Discharge Warning */}
            {spillingDams.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-900/60 border border-amber-500/40 text-xs text-amber-200">
                <Waves className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {language === 'tl' ? 'Bustos Dam' : 'Bustos Dam'}:{' '}
                  <strong className="text-white">
                    {dams.find(d => d.name.includes('Bustos'))?.dischargeRate || 0} cms
                  </strong>
                </span>
              </div>
            )}

            {/* High Tide Warning */}
            {tide.isHighTideNow && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200">
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-300" />
                <span>
                  {language === 'tl' ? 'Taob (High Tide)' : 'High Tide'}: <strong className="text-white">{tide.highTideHeightM}m</strong>
                </span>
              </div>
            )}

            {/* Active Sirens Count */}
            {activeSirensCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-800/80 border border-red-400 text-xs font-bold text-white animate-pulse">
                <Siren className="w-3.5 h-3.5 text-red-200" />
                <span>
                  {activeSirensCount} {language === 'tl' ? 'Sirena Aktibo' : 'Sirens Sounding'}
                </span>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
