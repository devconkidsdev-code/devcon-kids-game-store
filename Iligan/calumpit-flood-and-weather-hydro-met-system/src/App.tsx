import React, { useEffect, useState, useCallback } from 'react';
import {
  TelemetryStation,
  BarangayStatus,
  TidalData,
  DamStatus,
  HydroTimeseriesPoint,
  CorrelationDataPoint,
  ShineReport,
  AlertDispatchPayload,
  AISituationReport,
  AlertSeverity
} from './types';
import {
  INITIAL_STATIONS,
  INITIAL_TIDAL_DATA,
  INITIAL_DAM_STATUS,
  INITIAL_BARANGAYS,
  GENERATE_HYDRO_TIMESERIES,
  HISTORICAL_CORRELATION_DATA,
  INITIAL_SHINE_REPORTS,
  INITIAL_ALERT_DISPATCHES
} from './data/mockData';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { WeatherWidget } from './components/WeatherWidget';
import { ConfluenceMap } from './components/ConfluenceMap';
import { HydroCharts } from './components/HydroCharts';
import { BarangayStatusGrid } from './components/BarangayStatusGrid';
import { DamReleaseMonitor } from './components/DamReleaseMonitor';
import { ShinePortal } from './components/ShinePortal';
import { AlertDispatcher } from './components/AlertDispatcher';
import { AISituationRoom } from './components/AISituationRoom';
import { EvacuationGuideModal } from './components/EvacuationGuideModal';
import {
  Shield,
  Waves,
  AlertTriangle,
  Users,
  Home,
  Activity,
  CheckCircle2,
  Megaphone,
  Compass
} from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState<TelemetryStation[]>(INITIAL_STATIONS);
  const [tidalData, setTidalData] = useState<TidalData>(INITIAL_TIDAL_DATA);
  const [damStatus, setDamStatus] = useState<DamStatus[]>(INITIAL_DAM_STATUS);
  const [barangays, setBarangays] = useState<BarangayStatus[]>(INITIAL_BARANGAYS);
  const [timeseries, setTimeseries] = useState<HydroTimeseriesPoint[]>(GENERATE_HYDRO_TIMESERIES());
  const [correlationData, setCorrelationData] = useState<CorrelationDataPoint[]>(
    HISTORICAL_CORRELATION_DATA
  );
  const [shineReports, setShineReports] = useState<ShineReport[]>(INITIAL_SHINE_REPORTS);
  const [alertDispatches, setAlertDispatches] =
    useState<AlertDispatchPayload[]>(INITIAL_ALERT_DISPATCHES);

  const [overallAlert, setOverallAlert] = useState<{ level: AlertSeverity; reason: string }>({
    level: 'ORANGE',
    reason:
      'PRE-EVACUATION WARNING: Caniogan Gauge at 2.85m (≥2.50m threshold). Upstream dam release and high tide confluence.'
  });

  const [activeScenario, setActiveScenario] = useState<string>('MONSOON_CONFLUENCE_HIGH_TIDE');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<AISituationReport | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Evacuation and Safe Routes Modal state
  const [isEvacuationModalOpen, setIsEvacuationModalOpen] = useState<boolean>(false);
  const [evacuationModalBarangay, setEvacuationModalBarangay] = useState<string>('Frances');

  const handleOpenEvacuationModal = (barangayName?: string) => {
    if (barangayName) {
      setEvacuationModalBarangay(barangayName);
    }
    setIsEvacuationModalOpen(true);
  };

  // Fetch live telemetry from backend
  const fetchTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const [liveRes, hydroRes, brgyRes, shineRes, alertRes] = await Promise.all([
        fetch('/api/telemetry/live'),
        fetch('/api/telemetry/timeseries'),
        fetch('/api/barangays'),
        fetch('/api/shine/reports'),
        fetch('/api/alerts/history')
      ]);

      if (liveRes.ok) {
        const liveData = await liveRes.json();
        setStations(liveData.stations);
        setTidalData(liveData.tidalData);
        setDamStatus(liveData.damStatus);
        setOverallAlert(liveData.overallAlert);
        setActiveScenario(liveData.activeScenario);
      }

      if (hydroRes.ok) {
        const hydroData = await hydroRes.json();
        setTimeseries(hydroData.timeseries);
        setCorrelationData(hydroData.correlationData);
      }

      if (brgyRes.ok) {
        const brgyData = await brgyRes.json();
        setBarangays(brgyData.barangays);
      }

      if (shineRes.ok) {
        const sData = await shineRes.json();
        setShineReports(sData.reports);
      }

      if (alertRes.ok) {
        const aData = await alertRes.json();
        setAlertDispatches(aData.dispatches);
      }
    } catch (err) {
      console.warn('Backend polling error, continuing with client state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch AI situation report
  const generateAiReport = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/situation-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data.report);
      }
    } catch (err) {
      console.error('Failed to generate AI situation report:', err);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    generateAiReport();

    // Auto-refresh interval every 30s
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTelemetry, generateAiReport]);

  // Handle simulation scenario change
  const handleSelectScenario = async (scenario: string) => {
    setActiveScenario(scenario);
    setIsLoading(true);
    try {
      const res = await fetch('/api/simulation/set-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        const data = await res.json();
        setOverallAlert(data.overallAlert);
        await fetchTelemetry();
        await generateAiReport();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update specific barangay
  const handleUpdateBarangay = async (id: string, updates: Partial<BarangayStatus>) => {
    try {
      const res = await fetch('/api/barangays/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (res.ok) {
        await fetchTelemetry();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit SHINe report
  const handleSubmitShineReport = async (report: Partial<ShineReport>) => {
    try {
      const res = await fetch('/api/shine/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      if (res.ok) {
        await fetchTelemetry();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatch alert
  const handleDispatchAlert = async (payload: Partial<AlertDispatchPayload>) => {
    try {
      const res = await fetch('/api/alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchTelemetry();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics helper
  const canioganStn = stations.find((s) => s.id === 'stn-10-caniogan');
  const pwsStn = stations.find((s) => s.type === 'WEATHER_STATION');
  const canioganLevel = canioganStn?.currentWaterLevel ?? 2.85;
  const rain24hMm = pwsStn?.rain24hMm ?? 74.2;

  const totalAtRisk = barangays.reduce((acc, b) => acc + b.populationAtRisk, 0);
  const totalHouseholds = barangays.reduce((acc, b) => acc + b.householdsAffected, 0);
  const totalEvacuees = barangays.reduce((acc, b) => acc + b.evacuationCenter.currentOccupancy, 0);
  const totalEvacCapacity = barangays.reduce((acc, b) => acc + b.evacuationCenter.capacity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        overallAlert={overallAlert}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchTelemetry}
        isLoading={isLoading}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Dynamic Alert Banner */}
        <AlertBanner
          overallAlert={overallAlert}
          onOpenDispatcher={() => setActiveTab('alert-dispatch')}
          canioganGaugeLevel={canioganLevel}
          rain24hMm={rain24hMm}
        />

        {/* Quick Operations Summary Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3 shadow">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">WL Stn 10 (Caniogan)</span>
              <div className="text-xl font-bold font-mono text-cyan-300">
                {canioganLevel.toFixed(2)}m{' '}
                <span className="text-xs font-normal text-slate-400">/ 3.5m</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3 shadow">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Population at Risk</span>
              <div className="text-xl font-bold font-mono text-amber-300">
                {totalAtRisk.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3 shadow">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Affected Households</span>
              <div className="text-xl font-bold font-mono text-indigo-300">
                {totalHouseholds.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-2 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Sheltered Evacuees</span>
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {totalEvacuees}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {totalEvacCapacity}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenEvacuationModal()}
              className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors shrink-0"
              title="Open Evacuation & Safe Route Navigator"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Content */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Weather & Tidal Delta Widget */}
            <WeatherWidget pwsStation={pwsStn} tidalData={tidalData} />

            {/* GIS Confluence Map */}
            <ConfluenceMap
              stations={stations}
              barangays={barangays}
              onSelectBarangay={(b) => handleOpenEvacuationModal(b.name)}
              onSelectStation={() => {}}
              onOpenEvacuationModal={handleOpenEvacuationModal}
            />

            {/* Hydrological Dual-Axis & Correlation Chart */}
            <HydroCharts timeseries={timeseries} correlationData={correlationData} />

            {/* Vulnerable Barangay Cards Deck */}
            <BarangayStatusGrid
              barangays={barangays}
              onUpdateBarangay={handleUpdateBarangay}
              onOpenEvacuationModal={handleOpenEvacuationModal}
            />

            {/* Dam Release Monitoring */}
            <DamReleaseMonitor damStatus={damStatus} />

            {/* AI Situation Room Card */}
            <AISituationRoom
              currentAlertLevel={overallAlert.level}
              onGenerateReport={generateAiReport}
              aiReport={aiReport}
              isLoading={isAiLoading}
            />
          </div>
        )}

        {activeTab === 'confluence-map' && (
          <div className="space-y-5">
            <ConfluenceMap
              stations={stations}
              barangays={barangays}
              onSelectBarangay={(b) => handleOpenEvacuationModal(b.name)}
              onSelectStation={() => {}}
              onOpenEvacuationModal={handleOpenEvacuationModal}
            />
            <DamReleaseMonitor damStatus={damStatus} />
          </div>
        )}

        {activeTab === 'hydro-telemetry' && (
          <div className="space-y-5">
            <WeatherWidget pwsStation={pwsStn} tidalData={tidalData} />
            <HydroCharts timeseries={timeseries} correlationData={correlationData} />
            <DamReleaseMonitor damStatus={damStatus} />
          </div>
        )}

        {activeTab === 'barangays' && (
          <div className="space-y-5">
            <BarangayStatusGrid
              barangays={barangays}
              onUpdateBarangay={handleUpdateBarangay}
              onOpenEvacuationModal={handleOpenEvacuationModal}
            />
          </div>
        )}

        {activeTab === 'shine-portal' && (
          <div className="space-y-5">
            <ShinePortal
              reports={shineReports}
              onSubmitReport={handleSubmitShineReport}
            />
          </div>
        )}

        {activeTab === 'alert-dispatch' && (
          <div className="space-y-5">
            <AlertDispatcher
              currentAlertLevel={overallAlert.level}
              canioganLevel={canioganLevel}
              rain24hMm={rain24hMm}
              dispatches={alertDispatches}
              onDispatchAlert={handleDispatchAlert}
            />
          </div>
        )}

        {activeTab === 'ai-situation' && (
          <div className="space-y-5">
            <AISituationRoom
              currentAlertLevel={overallAlert.level}
              onGenerateReport={generateAiReport}
              aiReport={aiReport}
              isLoading={isAiLoading}
            />
          </div>
        )}
      </main>

      {/* Evacuation Centers and Safe Routes Modal */}
      <EvacuationGuideModal
        isOpen={isEvacuationModalOpen}
        onClose={() => setIsEvacuationModalOpen(false)}
        barangays={barangays}
        initialBarangayName={evacuationModalBarangay}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/50 border border-cyan-700/50 flex items-center justify-center text-cyan-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">
                Calumpit Municipal Disaster Risk Reduction & Management Office (MDRRMO)
              </div>
              <div className="text-[11px] text-slate-500">
                In partnership with Bulacan PDRRMO CBFMMP, DOST-PAGASA & SHINe Volunteer Youth Observers
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => handleOpenEvacuationModal()}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Evacuation Navigator</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confluence Telemetry Online</span>
            </span>
            <span>•</span>
            <span>
              Calumpit Emergency Hotline: <strong>911 / (044) 913-0911</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
