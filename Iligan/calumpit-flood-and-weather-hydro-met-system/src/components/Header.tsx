import React from 'react';
import { AlertSeverity } from '../types';
import { ShieldAlert, Radio, Waves, RefreshCw, AlertTriangle, CheckCircle2, Siren } from 'lucide-react';

interface HeaderProps {
  overallAlert: { level: AlertSeverity; reason: string };
  activeScenario: string;
  onSelectScenario: (scenario: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  overallAlert,
  activeScenario,
  onSelectScenario,
  activeTab,
  setActiveTab,
  onRefresh,
  isLoading
}) => {
  const getBadgeStyle = (level: AlertSeverity) => {
    switch (level) {
      case 'RED':
        return 'bg-red-500/20 text-red-400 border-red-500/50 animate-siren';
      case 'ORANGE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10 shadow-lg';
      case 'YELLOW':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-yellow-500/10 shadow-lg';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Operations Overview' },
    { id: 'confluence-map', label: 'Confluence GIS Map' },
    { id: 'hydro-telemetry', label: 'Hydro Telemetry & Delta Model' },
    { id: 'barangays', label: 'Barangay Status Deck' },
    { id: 'shine-portal', label: 'SHINe Observer Network' },
    { id: 'alert-dispatch', label: 'Alert Dispatch Engine' },
    { id: 'ai-situation', label: 'AI Situation Room' }
  ];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/30">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                Calumpit Hydro-Met & Flood Monitoring System
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                MDRRMO / CBFMMP
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Lower Pampanga River Basin • Angat-Bagbag Confluence & Tidal Delta Telemetry
            </p>
          </div>
        </div>

        {/* Right: Alert Status & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Active Alert Level Pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-bold ${getBadgeStyle(overallAlert.level)} transition-all`}>
            {overallAlert.level === 'RED' && <Siren className="w-4 h-4 text-red-400 animate-bounce" />}
            {overallAlert.level === 'ORANGE' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {overallAlert.level === 'YELLOW' && <Radio className="w-4 h-4 text-yellow-400" />}
            {overallAlert.level === 'NORMAL' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>ALERT LEVEL: {overallAlert.level}</span>
          </div>

          {/* Scenario Simulator Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Scenario:</span>
            <select
              id="scenario-selector"
              value={activeScenario}
              onChange={(e) => onSelectScenario(e.target.value)}
              aria-label="Simulation Scenario"
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="MONSOON_CONFLUENCE_HIGH_TIDE" className="bg-slate-900 text-amber-400">Active Habagat + High Tide (Orange)</option>
              <option value="RED_EXTREME_MONSOON" className="bg-slate-900 text-red-400">Extreme Surge 188mm / Caniogan &gt;3.5m (Red)</option>
              <option value="YELLOW_THREATENING" className="bg-slate-900 text-yellow-400">Threatening 24h Rain 42mm (Yellow)</option>
              <option value="NORMAL_BASELINE" className="bg-slate-900 text-emerald-400">Normal Dry Baseline (Normal)</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-telemetry-btn"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Live Hydro-Met Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 py-1.5 text-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
