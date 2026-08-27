import React from 'react';
import { TelemetryStation, TidalData } from '../types';
import { CloudRain, Wind, Compass, Droplets, Gauge, Thermometer, Waves, Clock, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface WeatherWidgetProps {
  pwsStation?: TelemetryStation;
  tidalData: TidalData;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  pwsStation,
  tidalData
}) => {
  const temp = pwsStation?.temperature ?? 26.4;
  const humidity = pwsStation?.humidity ?? 94;
  const pressureInHg = pwsStation?.pressureInHg ?? 29.62;
  const pressureHpa = pwsStation?.pressureHpa ?? 1003.0;
  const windSpeed = pwsStation?.windSpeedKmh ?? 28;
  const windGust = pwsStation?.windGustKmh ?? 46;
  const windDir = pwsStation?.windDirection ?? 'WSW (Habagat Monsoon)';
  const rainRate = pwsStation?.rainRateMmHr ?? 16.8;
  const rain24h = pwsStation?.rain24hMm ?? 74.2;
  const dewPoint = pwsStation?.dewPoint ?? 25.3;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* PWS Primary Card */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Claro M. Recto Weather Station</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  ID: IANGEL23
                </span>
              </div>
              <p className="text-xs text-slate-400">Poblacion Corridor • Telemetry Refresh: 15s</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE TELEMETRY</span>
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          {/* Temperature */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Temperature</span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {temp.toFixed(1)}°C
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Dew Point: <span className="text-slate-300 font-mono">{dewPoint}°C</span>
            </div>
          </div>

          {/* Rain Rate */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Rainfall Rate</span>
              <CloudRain className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
              {rainRate.toFixed(1)} <span className="text-xs text-slate-400 font-normal">mm/h</span>
            </div>
            <div className="text-[11px] text-cyan-300/80 mt-0.5">
              24-Hr Sum: <span className="font-bold font-mono">{rain24h} mm</span>
            </div>
          </div>

          {/* Barometric Pressure */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Barometer</span>
              <Gauge className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-300 font-mono mt-1">
              {pressureInHg.toFixed(2)} <span className="text-xs text-slate-400 font-normal">inHg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {pressureHpa} hPa (Low Pressure)
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Humidity</span>
              <Droplets className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-300 font-mono mt-1">
              {humidity}%
            </div>
            <div className="text-[11px] text-sky-400/80 mt-0.5">
              Near Saturation (Vapor Lock)
            </div>
          </div>
        </div>

        {/* Wind & Gust Banner */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-teal-400" />
            <span className="text-slate-400">Sustained Wind:</span>
            <span className="font-mono font-bold text-slate-200">{windSpeed} km/h</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Gusts:</span>
            <span className="font-mono font-bold text-amber-300">{windGust} km/h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Direction:</span>
            <span className="font-semibold text-cyan-300">{windDir}</span>
          </div>
        </div>
      </div>

      {/* Tidal Delta Integration Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-lg">
        {/* Tidal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Manila Bay Tidal Telemetry</h3>
              <p className="text-xs text-slate-400">Hagonoy - Labangan Delta Outlet</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            tidalData.tideState === 'FLOODING_HIGH'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
          }`}>
            {tidalData.tideState === 'FLOODING_HIGH' ? 'FLOODING (RISING)' : 'EBBING (FALLING)'}
          </span>
        </div>

        {/* Tidal Readout */}
        <div className="my-3 space-y-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Current Tide Level (MSL)</span>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-0.5">
                +{tidalData.currentTideMsl.toFixed(2)} <span className="text-xs text-slate-400 font-normal">meters</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Confluence Backflow Block</span>
              <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                {(tidalData.tideInfluenceFactor * 100).toFixed(0)}% Hydraulic Wall
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Next High Tide Peak</span>
              </div>
              <div className="font-mono font-bold text-slate-200 mt-1">
                {tidalData.nextHighTideTime}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Height: <span className="font-mono text-amber-300">+{tidalData.nextHighTideHeight}m MSL</span>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-2.5">
              <div className="flex items-center gap-1 text-cyan-400 font-semibold text-[11px]">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Next Low Tide</span>
              </div>
              <div className="font-mono font-bold text-slate-200 mt-1">
                {tidalData.nextLowTideTime}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Height: <span className="font-mono text-cyan-300">+{tidalData.nextLowTideHeight}m MSL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Warning Note */}
        <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/50 flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            During High Tide, river discharge into Manila Bay halts, causing Angat/Pampanga waters to bottleneck back into Calumpit riverside barangays.
          </span>
        </p>
      </div>
    </div>
  );
};
