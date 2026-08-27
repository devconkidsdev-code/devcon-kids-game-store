import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { HydroTimeseriesPoint, CorrelationDataPoint } from '../types';
import { Activity, TrendingUp, Info, Droplets, Waves, Calendar, AlertCircle } from 'lucide-react';

interface HydroChartsProps {
  timeseries: HydroTimeseriesPoint[];
  correlationData: CorrelationDataPoint[];
}

export const HydroCharts: React.FC<HydroChartsProps> = ({
  timeseries,
  correlationData
}) => {
  const [chartView, setChartView] = useState<'HYDRO_DUAL_AXIS' | 'CORRELATION_MODEL'>('HYDRO_DUAL_AXIS');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              Hydrological Dual-Axis Telemetry & Historical Delta Correlation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rainfall vs River Delta Depth with Tidal Ripple Overlay • Historical R = 0.83 Correlation Model
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setChartView('HYDRO_DUAL_AXIS')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartView === 'HYDRO_DUAL_AXIS'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Hydro-Tidal Dual Axis
          </button>
          <button
            onClick={() => setChartView('CORRELATION_MODEL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartView === 'CORRELATION_MODEL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            0.83 Correlation Model
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      {chartView === 'HYDRO_DUAL_AXIS' ? (
        <div>
          {/* Chart Info Callouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[11px]">Y1 (Left Axis):</span>
              <div className="font-bold text-cyan-400 font-mono">Hourly Rain (mm)</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[11px]">Y2 (Right Axis):</span>
              <div className="font-bold text-amber-400 font-mono">River Level (m)</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[11px]">Tidal Ripple:</span>
              <div className="font-bold text-teal-300 font-mono">12.4h Lunar Cycle Overlay</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[11px]">Critical Staff Max:</span>
              <div className="font-bold text-red-400 font-mono">3.50m (Caniogan)</div>
            </div>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeseries} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="rainBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="hourLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  interval={4}
                />

                {/* Left Axis: Hourly Rain mm */}
                <YAxis
                  yAxisId="rainAxis"
                  orientation="left"
                  stroke="#06b6d4"
                  tick={{ fontSize: 11, fill: '#06b6d4' }}
                  label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 11 }}
                  domain={[0, 40]}
                />

                {/* Right Axis: River Level Meters */}
                <YAxis
                  yAxisId="riverAxis"
                  orientation="right"
                  stroke="#f59e0b"
                  tick={{ fontSize: 11, fill: '#f59e0b' }}
                  label={{ value: 'River Level (meters)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 11 }}
                  domain={[0, 4.5]}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Hourly Rainfall (mm)') return [`${value} mm`, name];
                    if (name === 'Confluence Effective Level (m)') return [`${value} m (with Tide)`, name];
                    if (name === 'River Level Baseline (m)') return [`${value} m`, name];
                    return [value, name];
                  }}
                />

                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />

                {/* Alert Thresholds */}
                <ReferenceLine
                  yAxisId="riverAxis"
                  y={1.50}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  label={{ value: 'Yellow (1.5m)', position: 'insideTopLeft', fill: '#eab308', fontSize: 10 }}
                />
                <ReferenceLine
                  yAxisId="riverAxis"
                  y={2.50}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: 'Orange (2.5m)', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 10 }}
                />
                <ReferenceLine
                  yAxisId="riverAxis"
                  y={3.50}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Red Capacity (3.5m)', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10 }}
                />

                {/* Bars: Rain */}
                <Bar
                  yAxisId="rainAxis"
                  dataKey="hourlyRainMm"
                  name="Hourly Rainfall (mm)"
                  fill="url(#rainBarGradient)"
                  barSize={6}
                />

                {/* Line: River Baseline */}
                <Line
                  yAxisId="riverAxis"
                  type="monotone"
                  dataKey="riverLevelMeters"
                  name="River Level Baseline (m)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />

                {/* Line: Effective Level (Tidal Ripple Overlaid) */}
                <Line
                  yAxisId="riverAxis"
                  type="monotone"
                  dataKey="confluenceEffectiveLevelMeters"
                  name="Confluence Effective Level (m)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Correlation Model View */
        <div className="space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-base">
                R = 0.83
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">
                  Calibrated Hydrological Regression Model
                </h4>
                <p className="text-[11px] text-slate-400">
                  Strong 0.83 correlation between 3-day cumulative rainfall and river delta depth at Calumpit confluence.
                </p>
              </div>
            </div>

            <div className="bg-red-950/50 border border-red-800/60 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-red-400 font-bold">Historical Peak Calibration:</span>
              <div className="text-slate-200 font-mono mt-0.5">
                Aug 9, 2026: <span className="text-red-300 font-bold">188 mm Rain → 4.12 m Delta Depth</span>
              </div>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <XAxis
                  type="number"
                  dataKey="rainfall3DayMm"
                  name="3-Day Cumulative Rainfall"
                  unit=" mm"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: '3-Day Cumulative Rainfall (mm)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                  domain={[20, 200]}
                />
                <YAxis
                  type="number"
                  dataKey="riverDeltaDepthM"
                  name="River Delta Depth"
                  unit=" m"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'River Delta Depth (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                  domain={[1.0, 4.5]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CorrelationDataPoint;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                          <div className="font-bold text-slate-100">{data.date}</div>
                          {data.eventLabel && (
                            <div className="text-amber-400 font-semibold mt-0.5">{data.eventLabel}</div>
                          )}
                          <div className="text-cyan-300 mt-1 font-mono">
                            Rainfall (3-Day): {data.rainfall3DayMm} mm
                          </div>
                          <div className="text-indigo-300 font-mono">
                            Delta Depth: {data.riverDeltaDepthM} m
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name="Observed Monsoon Events"
                  data={correlationData}
                  fill="#818cf8"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
