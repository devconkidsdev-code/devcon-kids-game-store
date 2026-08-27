import React, { useState } from 'react';
import { AlertTriangle, Phone, Volume2, VolumeX, ShieldAlert, Radio, Globe, LifeBuoy } from 'lucide-react';
import { AlertLevel } from '../types/flood';
import { sirenAudio } from '../utils/audioSiren';

interface HeaderProps {
  overallAlert: AlertLevel;
  language: 'tl' | 'en';
  setLanguage: (lang: 'tl' | 'en') => void;
  onOpenSos: () => void;
  onOpenHotlines: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  overallAlert,
  language,
  setLanguage,
  onOpenSos,
  onOpenHotlines
}) => {
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);

  const toggleSiren = () => {
    if (isSirenPlaying) {
      sirenAudio.stop();
      setIsSirenPlaying(false);
    } else {
      sirenAudio.playAlertSiren(overallAlert === 'red' ? 'evacuate' : 'alert');
      setIsSirenPlaying(true);
    }
  };

  const getAlertBadge = () => {
    switch (overallAlert) {
      case 'red':
        return {
          bg: 'bg-red-600',
          text: language === 'tl' ? 'ALERTO: RED (IKALIKAS)' : 'ALERT: RED (EVACUATE)',
          ping: 'animate-ping bg-red-400'
        };
      case 'orange':
        return {
          bg: 'bg-amber-600',
          text: language === 'tl' ? 'ALERTO: ORANGE (MAGHANDA)' : 'ALERT: ORANGE (PREPARE)',
          ping: 'animate-ping bg-amber-400'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500 text-neutral-950',
          text: language === 'tl' ? 'ALERTO: YELLOW (MAGBANTAY)' : 'ALERT: YELLOW (MONITOR)',
          ping: 'animate-ping bg-yellow-300'
        };
      default:
        return {
          bg: 'bg-emerald-600',
          text: language === 'tl' ? 'NORMAL NA LEBEL' : 'NORMAL LEVEL',
          ping: 'bg-emerald-400'
        };
    }
  };

  const badge = getAlertBadge();

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Municipal Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  CALUMPIT <span className="text-cyan-400 font-semibold">CBFMMP</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                  <Radio className="w-3 h-3 text-cyan-400 mr-1 animate-pulse" />
                  MDRRMO Early Warning
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                {language === 'tl'
                  ? 'Sistema ng Pagbabantay sa Baha at Panahon para sa Bayan ng Calumpit, Bulacan'
                  : 'Community-Based Flood Mitigation & Weather Disturbance Monitoring System'}
              </p>
            </div>
          </div>

          {/* Action Tools & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Status Pill */}
            <div className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white shadow-sm ${badge.bg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.ping}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>{badge.text}</span>
            </div>

            {/* Siren Acoustic Test */}
            <button
              id="cbfmmp-siren-toggle-btn"
              onClick={toggleSiren}
              title={isSirenPlaying ? 'Stop siren test audio' : 'Test CBFMMP early warning siren acoustic tone'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                isSirenPlaying
                  ? 'bg-red-600/90 text-white border-red-500 shadow-md shadow-red-600/30 animate-pulse'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              }`}
            >
              {isSirenPlaying ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span className="hidden sm:inline">
                {isSirenPlaying
                  ? (language === 'tl' ? 'Itigil ang Siren' : 'Stop Siren')
                  : (language === 'tl' ? 'Tunog ng Siren' : 'Siren Audio')}
              </span>
            </button>

            {/* Emergency Hotlines Button */}
            <button
              id="emergency-hotlines-header-btn"
              onClick={onOpenHotlines}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{language === 'tl' ? 'Hotlines' : 'Hotlines'}</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              id="emergency-sos-header-btn"
              onClick={onOpenSos}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 ring-1 ring-red-400/30 transition transform active:scale-95"
            >
              <LifeBuoy className="w-4 h-4 animate-spin-slow text-white" />
              <span>{language === 'tl' ? 'RESCUE SOS' : 'RESCUE SOS'}</span>
            </button>

            {/* Language Toggle */}
            <button
              id="language-toggle-btn"
              onClick={() => setLanguage(language === 'tl' ? 'en' : 'tl')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 transition"
              title="Palitan ang Wika / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'tl' ? 'EN' : 'TAG'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
