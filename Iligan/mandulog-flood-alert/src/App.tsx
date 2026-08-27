import React, { useState, useEffect } from 'react';
import { UserProfile, SensorData, ForecastResult, HardwareStatus, HistoricalDataPoint } from './types';
import { runAIForecast, generateHistoricalData, EVACUATION_CENTERS } from './data';
import { AlertBanner } from './components/AlertBanner';
import { SensorPanel } from './components/SensorPanel';
import { RiverMonitoring } from './components/RiverMonitoring';
import { EvacuationPanel } from './components/EvacuationPanel';
import { SettingsView } from './components/SettingsView';
import { Simulator } from './components/Simulator';
import { DiagnosticsView } from './components/DiagnosticsView';
import { Activity, User, Radio, LineChart, AlertTriangle, Navigation } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GRAPHS' | 'HARDWARE' | 'SETTINGS'>('DASHBOARD');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Juan Dela Cruz',
    mobile: '0917-000-0000',
    barangay: 'Hinaplanon',
    purok: 'Purok 4 Riverside'
  });

  // Simulator State
  const [rainfall, setRainfall] = useState(0.5);
  const [riverLevel, setRiverLevel] = useState(1.2);
  const [rateOfRise, setRateOfRise] = useState(0.0);
  const [waterVelocity, setWaterVelocity] = useState(0.5);

  // Computed State
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>({
    esp32: 'CONNECTED',
    rainSensor: 'WORKING',
    waterLevelSensor: 'WORKING',
    velocitySensor: 'WORKING',
    lora: 'CONNECTED',
    gateway: 'ONLINE',
    lastPacketTime: new Date().toLocaleTimeString(),
    packetSuccessRate: 98,
    internet: 'ONLINE'
  });

  const [sensorData, setSensorData] = useState<SensorData>({
    rainfall1h: 0.5,
    rainfall3h: 1.2,
    rainfall6h: 2.0,
    rainfall24h: 15.0,
    currentRiverLevel: 1.2,
    rateOfRise: 0.0,
    waterVelocity: 0.5,
    trend: 'STABLE',
    timestamp: new Date().toLocaleString()
  });

  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  // Initial load
  useEffect(() => {
    handleRunForecast();
  }, []);

  const handleRunForecast = () => {
    let trend: SensorData['trend'] = 'STABLE';
    if (rateOfRise > 0.5) trend = 'RAPIDLY RISING';
    else if (rateOfRise > 0.1) trend = 'RISING';
    else if (rateOfRise < -0.1) trend = 'FALLING';

    const data: SensorData = {
      ...sensorData,
      rainfall1h: rainfall,
      currentRiverLevel: riverLevel,
      rateOfRise: rateOfRise,
      waterVelocity: waterVelocity,
      trend,
      timestamp: new Date().toLocaleString()
    };
    
    setSensorData(data);
    setHardwareStatus(prev => ({
      ...prev,
      lastPacketTime: new Date().toLocaleTimeString()
    }));
    
    const newForecast = runAIForecast(data);
    setForecast(newForecast);
    setHistoricalData(generateHistoricalData(riverLevel, waterVelocity, 24));
  };

  const isEmergency = forecast?.riskLevel === 'RED';

  if (isEmergency) {
    const center = EVACUATION_CENTERS[userProfile.barangay]?.[0];
    return (
      <div className="min-h-screen bg-red-600 text-white font-sans flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white text-red-600 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">FLOOD WARNING</h1>
          <h2 className="text-6xl font-black mb-6 bg-white text-red-600 py-2 px-4 rounded-xl inline-block uppercase">EVACUATE</h2>
          
          <div className="bg-red-700/50 rounded-2xl p-6 mb-6 border border-red-500 text-left">
            <p className="text-red-200 text-sm uppercase font-bold mb-1">Status</p>
            <p className="text-2xl font-bold mb-4">🌊 WATER RISING RAPIDLY</p>
            
            <p className="text-red-200 text-sm uppercase font-bold mb-1">Danger</p>
            <p className="text-xl font-bold mb-4">⏱️ EXPECTED WITHIN {forecast.plus1h > 8 ? '1 HOUR' : forecast.plus3h > 8 ? '3 HOURS' : '6 HOURS'}</p>
            
            <p className="text-red-200 text-sm uppercase font-bold mb-1">Your Area</p>
            <p className="text-xl font-bold mb-1">📍 {userProfile.barangay}</p>
            <p className="text-lg opacity-90">{userProfile.purok}</p>
          </div>

          {center && (
            <div className="bg-white text-slate-900 rounded-2xl p-6 mb-8 text-left shadow-2xl">
              <p className="text-slate-500 text-sm uppercase font-bold mb-1">Go To</p>
              <p className="text-xl font-black mb-1">🏫 {center.name}</p>
              <p className="text-sm text-slate-500 mb-6">📍 {center.distance} KM AWAY</p>
              
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`} target="_blank" rel="noreferrer" className="w-full bg-blue-600 text-white text-lg font-black py-4 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                <Navigation className="h-6 w-6 mr-2" />
                NAVIGATE NOW
              </a>
            </div>
          )}

          <button onClick={() => setRiverLevel(4)} className="text-sm font-bold text-red-300 opacity-50 underline">Exit Simulation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="h-16 bg-[#0f172a] text-white flex items-center justify-between px-4 border-b border-slate-700 shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">I</div>
            <h1 className="text-lg font-bold tracking-tight">InnoVision</h1>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-bold tracking-wider uppercase ${hardwareStatus.internet === 'ONLINE' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${hardwareStatus.internet === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {hardwareStatus.internet}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'DASHBOARD' && forecast && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AlertBanner level={forecast.riskLevel} probability={forecast.probability} />
            <SensorPanel data={sensorData} hardware={hardwareStatus} />
            <EvacuationPanel userProfile={userProfile} />
            
            <div className="mt-8">
              <Simulator 
                rainfall={rainfall} 
                setRainfall={setRainfall} 
                riverLevel={riverLevel} 
                setRiverLevel={setRiverLevel} 
                rateOfRise={rateOfRise}
                setRateOfRise={setRateOfRise}
                waterVelocity={waterVelocity}
                setWaterVelocity={setWaterVelocity}
                hardware={hardwareStatus}
                setHardware={setHardwareStatus}
                onRunForecast={handleRunForecast}
              />
            </div>
          </div>
        )}

        {activeTab === 'GRAPHS' && forecast && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <RiverMonitoring historicalData={historicalData} forecast={forecast} />
          </div>
        )}

        {activeTab === 'HARDWARE' && (
          <DiagnosticsView status={hardwareStatus} />
        )}

        {activeTab === 'SETTINGS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <SettingsView 
              profile={userProfile} 
              onSave={(p) => {
                setUserProfile(p);
                setActiveTab('DASHBOARD');
              }} 
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 px-6 py-2 pb-safe z-20">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Activity className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Status</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('GRAPHS')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'GRAPHS' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LineChart className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Graphs</span>
          </button>

          <button 
            onClick={() => setActiveTab('HARDWARE')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'HARDWARE' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Radio className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Hardware</span>
          </button>

          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'SETTINGS' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
