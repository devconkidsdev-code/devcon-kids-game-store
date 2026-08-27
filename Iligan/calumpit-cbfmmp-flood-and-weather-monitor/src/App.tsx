import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveAlertBanner } from './components/LiveAlertBanner';
import { ScenarioSwitcher } from './components/ScenarioSwitcher';
import { HydrologicalDashboard } from './components/HydrologicalDashboard';
import { InteractiveFloodMap } from './components/InteractiveFloodMap';
import { BarangayInundationGrid } from './components/BarangayInundationGrid';
import { EvacuationCenterManager } from './components/EvacuationCenterManager';
import { AiSafetyAdvisor } from './components/AiSafetyAdvisor';
import { SafetyChecklist } from './components/SafetyChecklist';
import { EmergencySosModal } from './components/EmergencySosModal';
import { HotlineModal } from './components/HotlineModal';
import { SCENARIOS } from './data/calumpitData';
import { BarangayFloodInfo, EmergencyRescueRequest, RiverStation, ScenarioConfig } from './types/flood';
import {
  Waves,
  MapPin,
  Home,
  Bot,
  Shield,
  Phone,
  LifeBuoy,
  Radio,
  Sliders,
  AlertOctagon,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [currentScenario, setCurrentScenario] = useState<ScenarioConfig>(SCENARIOS.habagat_high_tide);
  const [language, setLanguage] = useState<'tl' | 'en'>('tl');
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'barangays' | 'evacuation' | 'ai' | 'checklist'>('overview');

  const [riverStations, setRiverStations] = useState(currentScenario.riverStations);
  const [dams, setDams] = useState(currentScenario.dams);
  const [weather, setWeather] = useState(currentScenario.weather);
  const [tide, setTide] = useState(currentScenario.tide);
  const [barangays, setBarangays] = useState(currentScenario.barangays);
  const [evacuationCenters, setEvacuationCenters] = useState(currentScenario.evacuationCenters);

  const [selectedBarangay, setSelectedBarangay] = useState<BarangayFloodInfo | null>(
    currentScenario.barangays.find(b => b.id === 'meysulao') || currentScenario.barangays[0]
  );

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isHotlinesModalOpen, setIsHotlinesModalOpen] = useState(false);
  const [rescueRequests, setRescueRequests] = useState<EmergencyRescueRequest[]>([]);

  // Update state whenever scenario changes
  const handleSelectScenario = (sc: ScenarioConfig) => {
    setCurrentScenario(sc);
    setRiverStations(sc.riverStations);
    setDams(sc.dams);
    setWeather(sc.weather);
    setTide(sc.tide);
    setBarangays(sc.barangays);
    setEvacuationCenters(sc.evacuationCenters);

    // Keep selected barangay updated to match new scenario
    if (selectedBarangay) {
      const updated = sc.barangays.find(b => b.id === selectedBarangay.id);
      if (updated) setSelectedBarangay(updated);
    }
  };

  const handleFindRoute = (b: BarangayFloodInfo) => {
    setSelectedBarangay(b);
    setActiveTab('evacuation');
  };

  const handleSosRequest = (b: BarangayFloodInfo) => {
    setSelectedBarangay(b);
    setIsSosModalOpen(true);
  };

  const handleSubmitRescue = (req: EmergencyRescueRequest) => {
    setRescueRequests(prev => [req, ...prev]);
  };

  const activeSirensCount = barangays.filter(b => b.sirenActive).length;
  const inundatedBarangaysCount = barangays.filter(b => b.floodDepthFeet > 1.0).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Application Bar */}
      <Header
        overallAlert={currentScenario.overallAlert}
        language={language}
        setLanguage={setLanguage}
        onOpenSos={() => setIsSosModalOpen(true)}
        onOpenHotlines={() => setIsHotlinesModalOpen(true)}
      />

      {/* Real-time Emergency Warning Banner */}
      <LiveAlertBanner
        overallAlert={currentScenario.overallAlert}
        weather={weather}
        dams={dams}
        tide={tide}
        language={language}
        activeSirensCount={activeSirensCount}
        inundatedBarangaysCount={inundatedBarangaysCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Scenario Switcher / Simulator Bar */}
        <ScenarioSwitcher
          currentScenarioId={currentScenario.id}
          onSelectScenario={handleSelectScenario}
          language={language}
        />

        {/* Primary View Navigation Tabs */}
        <div className="flex items-center justify-start border-b border-neutral-800 overflow-x-auto pb-1 gap-1">
          
          <button
            id="tab-btn-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>{language === 'tl' ? 'Pangkalahatang Dashboard' : 'Telemetry Overview'}</span>
          </button>

          <button
            id="tab-btn-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{language === 'tl' ? 'Mapa ng Calumpit' : 'Interactive Map'}</span>
          </button>

          <button
            id="tab-btn-barangays"
            onClick={() => setActiveTab('barangays')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'barangays'
                ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>
              {language === 'tl' ? '29 na Barangay' : '29 Barangays Matrix'} ({inundatedBarangaysCount} {language === 'tl' ? 'Lubog' : 'Flooded'})
            </span>
          </button>

          <button
            id="tab-btn-evacuation"
            onClick={() => setActiveTab('evacuation')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'evacuation'
                ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{language === 'tl' ? 'Likasan at Ruta' : 'Evacuation & Routes'}</span>
          </button>

          <button
            id="tab-btn-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="flex items-center gap-1">
              {language === 'tl' ? 'AI Alerto Calumpit' : 'AI Safety Advisor'}
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </span>
          </button>

          <button
            id="tab-btn-checklist"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-neutral-900 text-cyan-400 border-cyan-500 shadow-sm'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{language === 'tl' ? 'Go-Bag at Kaligtasan' : 'Go-Bag & Protocols'}</span>
          </button>

        </div>

        {/* TAB CONTENT: Overview (Dashboard + Interactive Map + AI Preview) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Hydrological Telemetry Dashboard */}
            <HydrologicalDashboard
              riverStations={riverStations}
              dams={dams}
              weather={weather}
              tide={tide}
              language={language}
              onSelectStation={() => setActiveTab('map')}
            />

            {/* Interactive Cartography Map of Calumpit */}
            <InteractiveFloodMap
              barangays={barangays}
              riverStations={riverStations}
              evacuationCenters={evacuationCenters}
              selectedBarangay={selectedBarangay}
              onSelectBarangay={(b) => setSelectedBarangay(b)}
              language={language}
              onFindRoute={handleFindRoute}
              onSosRequest={handleSosRequest}
            />

            {/* AI Advisor Preview Section */}
            <AiSafetyAdvisor
              telemetry={{
                weather,
                riverStations,
                dams,
                tide,
                barangays
              }}
              selectedBarangay={selectedBarangay}
              language={language}
            />

          </div>
        )}

        {/* TAB CONTENT: Dedicated Map View */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <InteractiveFloodMap
              barangays={barangays}
              riverStations={riverStations}
              evacuationCenters={evacuationCenters}
              selectedBarangay={selectedBarangay}
              onSelectBarangay={(b) => setSelectedBarangay(b)}
              language={language}
              onFindRoute={handleFindRoute}
              onSosRequest={handleSosRequest}
            />
          </div>
        )}

        {/* TAB CONTENT: 29 Barangays Matrix */}
        {activeTab === 'barangays' && (
          <BarangayInundationGrid
            barangays={barangays}
            selectedBarangay={selectedBarangay}
            onSelectBarangay={(b) => {
              setSelectedBarangay(b);
              setActiveTab('map');
            }}
            language={language}
            onFindRoute={handleFindRoute}
          />
        )}

        {/* TAB CONTENT: Evacuation Centers & Safe Route Planner */}
        {activeTab === 'evacuation' && (
          <EvacuationCenterManager
            evacuationCenters={evacuationCenters}
            barangays={barangays}
            selectedBarangay={selectedBarangay}
            language={language}
            onSelectBarangay={(b) => setSelectedBarangay(b)}
          />
        )}

        {/* TAB CONTENT: AI Flood Risk Advisor */}
        {activeTab === 'ai' && (
          <AiSafetyAdvisor
            telemetry={{
              weather,
              riverStations,
              dams,
              tide,
              barangays
            }}
            selectedBarangay={selectedBarangay}
            language={language}
          />
        )}

        {/* TAB CONTENT: Go-Bag & Safety Protocols Checklist */}
        {activeTab === 'checklist' && (
          <SafetyChecklist language={language} />
        )}

        {/* Dispatch Queue Log (Shown when resident requests are submitted) */}
        {rescueRequests.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-red-400" />
                {language === 'tl' ? 'Kasalukuyang Nakabinbing Rescue SOS Dispatches' : 'Active Local Rescue Dispatches'}
              </h4>
              <span className="text-xs font-mono text-cyan-400">
                {rescueRequests.length} {language === 'tl' ? 'Nai-log' : 'Logged'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rescueRequests.map((req) => (
                <div key={req.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px]">
                    <span>{req.id}</span>
                    <span>{req.timestamp}</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    Brgy. {req.barangay} • {req.contactName}
                  </div>
                  <div className="text-neutral-300">
                    📍 {req.exactLocation}
                  </div>
                  <div className="text-neutral-400 flex items-center justify-between pt-1 border-t border-neutral-800 text-[11px]">
                    <span>👥 {req.headcount} {language === 'tl' ? 'katao' : 'persons'}</span>
                    <span className="text-amber-400 font-semibold">{language === 'tl' ? 'Naka-lineup sa Rescue Boat' : 'Boat Dispatched'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-neutral-400 font-medium">
            Community-Based Flood Mitigation Management Program (CBFMMP) • Bayan ng Calumpit, Lalawigan ng Bulacan
          </p>
          <p className="text-[11px] text-neutral-500">
            Sa pakikipagtulungan ng Calumpit MDRRMO, PAGASA Pampanga River Flood Forecasting & Warning Center (PRFFWC), at PDRRMC Bulacan.
          </p>
          <div className="pt-2 flex justify-center items-center space-x-4 text-[11px] text-cyan-400">
            <button onClick={() => setIsHotlinesModalOpen(true)} className="hover:underline">
              {language === 'tl' ? 'Mga Emergency Hotline' : 'Emergency Hotlines'}
            </button>
            <span>•</span>
            <button onClick={() => setIsSosModalOpen(true)} className="hover:underline text-red-400">
              {language === 'tl' ? 'Rescue SOS Request' : 'Rescue SOS Request'}
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('checklist')} className="hover:underline">
              {language === 'tl' ? 'Go-Bag Checklist' : 'Go-Bag Checklist'}
            </button>
          </div>
        </div>
      </footer>

      {/* SOS Rescue Modal */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        selectedBarangay={selectedBarangay}
        language={language}
        onSubmitRequest={handleSubmitRescue}
      />

      {/* Hotlines Modal */}
      <HotlineModal
        isOpen={isHotlinesModalOpen}
        onClose={() => setIsHotlinesModalOpen(false)}
        language={language}
      />

    </div>
  );
}
