import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ForecastResult, HistoricalDataPoint } from '../types';
import { THRESHOLDS, VELOCITY_THRESHOLDS } from '../data';

interface RiverMonitoringProps {
  historicalData: HistoricalDataPoint[];
  forecast: ForecastResult;
}

export function RiverMonitoring({ historicalData, forecast }: RiverMonitoringProps) {
  const [timeRange, setTimeRange] = useState<number>(6); // 1, 3, 6, 12, 24
  
  // Filter historical data based on time range (just visual slice in a real app, here we just use what we have)
  const displayData = historicalData.slice(Math.max(historicalData.length - timeRange - 1, 0));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">River Monitoring</h3>
        <select 
          className="text-[10px] font-bold bg-slate-100 text-slate-600 rounded-lg px-2 py-1 border-none outline-none"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={1}>1 HOUR</option>
          <option value={3}>3 HOURS</option>
          <option value={6}>6 HOURS</option>
          <option value={12}>12 HOURS</option>
          <option value={24}>24 HOURS</option>
        </select>
      </div>

      <div className="mb-8">
        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">🌊 Live Water Level</h4>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} domain={[0, 10]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value.toFixed(2)}m`, 'Level']}
              />
              <ReferenceLine y={THRESHOLDS.YELLOW} stroke="#eab308" strokeDasharray="3 3" />
              <ReferenceLine y={THRESHOLDS.ORANGE} stroke="#f97316" strokeDasharray="3 3" />
              <ReferenceLine y={THRESHOLDS.RED} stroke="#dc2626" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLevel)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">💨 Live Water Velocity</h4>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} domain={[0, 6]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value.toFixed(2)}m/s`, 'Velocity']}
              />
              <ReferenceLine y={VELOCITY_THRESHOLDS.MODERATE} stroke="#eab308" strokeDasharray="3 3" />
              <ReferenceLine y={VELOCITY_THRESHOLDS.FAST} stroke="#f97316" strokeDasharray="3 3" />
              <ReferenceLine y={VELOCITY_THRESHOLDS.VERY_FAST} stroke="#dc2626" strokeDasharray="3 3" />
              <Area type="stepAfter" dataKey="velocity" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorVelocity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">🔮 AI 6-Hour Forecast</h4>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} domain={[0, 10]} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value.toFixed(2)}m`, 'Level']}
              />
              <ReferenceLine y={THRESHOLDS.YELLOW} stroke="#eab308" strokeDasharray="3 3" />
              <ReferenceLine y={THRESHOLDS.ORANGE} stroke="#f97316" strokeDasharray="3 3" />
              <ReferenceLine y={THRESHOLDS.RED} stroke="#dc2626" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="level" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
