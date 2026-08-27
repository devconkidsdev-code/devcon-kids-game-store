import React from 'react';
import { Waves, Droplet, ArrowUp, ArrowDown, Minus, AlertTriangle, ShieldCheck, Gauge, CloudRain, Wind, Eye, Compass, Radio } from 'lucide-react';
import { DamStatus, RiverStation, TideData, WeatherData } from '../types/flood';

interface HydrologicalDashboardProps {
  riverStations: RiverStation[];
  dams: DamStatus[];
  weather: WeatherData;
  tide: TideData;
  language: 'tl' | 'en';
  onSelectStation?: (station: RiverStation) => void;
}

export const HydrologicalDashboard: React.FC<HydrologicalDashboardProps> = ({
  riverStations,
  dams,
  weather,
  tide,
  language,
  onSelectStation
}) => {
  const getTrendIcon = (trend: RiverStation['trend']) => {
    switch (trend) {
      case 'rising':
        return <ArrowUp className="w-3.5 h-3.5 text-red-400 animate-bounce" />;
      case 'falling':
        return <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  const getAlertBadge = (status: RiverStation['status']) => {
    switch (status) {
      case 'red':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'orange':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'yellow':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: River Gauges & Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'tl' ? 'Mga Estasyon ng Lebel ng Ilog' : 'River Water Level Gauges'}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'tl'
                  ? 'Pampanga River, Angat River, at Candaba Basin Telemetry ng PAGASA-PRFFWC at CBFMMP'
                  : 'Real-time telemetry from Pampanga River Basin, Angat Confluence, and Candaba Overflow'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" />
            Live Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {riverStations.map((station) => {
            const percentage = Math.min(100, Math.max(0, (station.currentLevel / station.criticalLevel) * 100));
            const isCritical = station.currentLevel >= station.warningLevel;

            return (
              <div
                key={station.id}
                id={`station-card-${station.id}`}
                onClick={() => onSelectStation?.(station)}
                className={`bg-neutral-900/90 rounded-xl p-4 border transition-all duration-200 hover:border-blue-500/60 cursor-pointer shadow-sm ${
                  station.status === 'red'
                    ? 'border-red-600/50 bg-red-950/20'
                    : station.status === 'orange'
                    ? 'border-amber-600/50 bg-amber-950/20'
                    : 'border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                      {station.river}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {station.name}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getAlertBadge(station.status)}`}>
                    {station.status}
                  </span>
                </div>

                {/* Main Water Level Number */}
                <div className="flex items-baseline justify-between my-3">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                      {station.currentLevel.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400 ml-1 font-semibold">meters</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    {getTrendIcon(station.trend)}
                    <span className="text-neutral-300 capitalize font-medium">
                      {language === 'tl'
                        ? station.trend === 'rising' ? 'Tumataas' : station.trend === 'falling' ? 'Bumababa' : 'Pantay'
                        : station.trend}
                    </span>
                    {station.rateOfRisePerHour > 0 && (
                      <span className="text-[11px] text-red-400 font-mono">
                        (+{station.rateOfRisePerHour.toFixed(2)}m/h)
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Level Gauge Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        station.status === 'red'
                          ? 'bg-gradient-to-r from-amber-500 to-red-500'
                          : station.status === 'orange'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Level Threshold Scale */}
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono pt-1">
                    <span>Norm: {station.normalLevel}m</span>
                    <span className="text-yellow-400">Alert: {station.alertLevel}m</span>
                    <span className="text-red-400">Crit: {station.criticalLevel}m</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{station.lastUpdated}</span>
                  <span className="text-cyan-400 hover:underline">
                    {language === 'tl' ? 'Tingnan sa Mapa' : 'View on Map'} &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Dam Discharge & Astronomical Tide Dual-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Dam Gate Discharge Monitor */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {language === 'tl' ? 'Pagpapakawala ng Tubig sa mga Dam' : 'Dam Spilling & Water Gate Discharges'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {language === 'tl'
                    ? 'Bustos Dam (Direktang umaagos sa Calumpit), Ipo, at Angat'
                    : 'Bustos Dam afterbay spillway cascading into Calumpit basin'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dams.map((dam) => {
              const isSpilling = dam.dischargeRate > 0 || dam.status !== 'normal';

              return (
                <div
                  key={dam.name}
                  className={`p-3 rounded-lg border transition ${
                    isSpilling
                      ? 'bg-amber-950/20 border-amber-700/60'
                      : 'bg-neutral-800/40 border-neutral-700/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {dam.name}
                        {dam.warningIssued && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900 text-red-200 border border-red-600 animate-pulse">
                            SPILLING ALERT
                          </span>
                        )}
                      </h5>
                      <span className="text-[11px] text-neutral-400">
                        {language === 'tl' ? 'Apektadong Ilog' : 'Target Rivers'}: {dam.targetRivers.join(', ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {dam.dischargeRate} m³/s (cms)
                      </span>
                      <span className="text-[10px] text-neutral-400 block">
                        {dam.gateOpenings > 0 ? `${dam.gateOpenings}m Gate Opening` : 'Gates Closed'}
                      </span>
                    </div>
                  </div>

                  {/* Dam Elevation Status */}
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-300 bg-black/30 px-2.5 py-1.5 rounded">
                    <span>
                      {language === 'tl' ? 'Kasalukuyang Lebel' : 'Water Level'}:{' '}
                      <strong className="font-mono text-white">{dam.waterLevel.toFixed(2)}m</strong>
                    </span>
                    <span className="text-neutral-400 font-mono">
                      Spilling Level: {dam.spillingLevel.toFixed(2)}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weather & Manila Bay High Tide */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {language === 'tl' ? 'Panahon at Taob (High Tide)' : 'PAGASA Weather & Manila Bay Tide'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {language === 'tl'
                    ? 'Epekto ng ulan at backflow mula sa Look ng Maynila sa Calumpit'
                    : 'Tidal backflow and monsoon rainfall trapping metrics'}
                </p>
              </div>
            </div>

            {/* Weather Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[10px] text-neutral-400 uppercase block">Rainfall Rate</span>
                <span className="text-base font-bold text-blue-400 font-mono">{weather.rainfallRate} mm/h</span>
                <span className="text-[10px] text-neutral-500 block">24h: {weather.rainfall24h}mm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[10px] text-neutral-400 uppercase block">Wind Speed</span>
                <span className="text-base font-bold text-white font-mono">{weather.windSpeedKmh} km/h</span>
                <span className="text-[10px] text-neutral-500 block">Temp: {weather.temperatureC}°C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[10px] text-neutral-400 uppercase block">High Tide Peak</span>
                <span className="text-base font-bold text-cyan-300 font-mono">{tide.highTideHeightM}m</span>
                <span className="text-[10px] text-neutral-500 block">{tide.highTideTime}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60">
                <span className="text-[10px] text-neutral-400 uppercase block">Backflow Risk</span>
                <span className={`text-base font-bold uppercase font-mono ${
                  tide.backflowRisk === 'severe' ? 'text-red-400' : tide.backflowRisk === 'high' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {tide.backflowRisk}
                </span>
                <span className="text-[10px] text-neutral-500 block">Labangan / Hagonoy</span>
              </div>
            </div>

            {/* Weather Synoptic Note */}
            <div className="p-3 rounded-lg bg-neutral-800/40 border border-neutral-700/40 text-xs text-neutral-300 leading-relaxed">
              <p className="font-medium text-white mb-0.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                {weather.monsoonStatus}
              </p>
              <p className="text-neutral-400 text-[11px]">
                {weather.forecastSummary}
              </p>
            </div>
          </div>

          {/* High Tide Warning Footnote */}
          {tide.isHighTideNow && (
            <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-700/50 flex items-center justify-between text-xs text-cyan-200">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'tl'
                  ? 'Kasalukuyang Mataas ang Taob sa Look ng Maynila. Naaantala ang paghupa ng baha.'
                  : 'High tide peak currently active in Manila Bay. Natural river drainage temporarily impeded.'}
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
