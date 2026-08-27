import React from 'react';
import { AlertLevel } from '../types';
import { ALERT_MESSAGES } from '../data';

interface AlertBannerProps {
  level: AlertLevel;
  probability: number;
}

const themeStyles: Record<AlertLevel, { bg: string, labelColor: string, title: string }> = {
  GREEN: {
    bg: 'bg-emerald-600',
    labelColor: 'text-emerald-200',
    title: 'GREEN ALERT: NORMAL'
  },
  YELLOW: {
    bg: 'bg-yellow-500',
    labelColor: 'text-yellow-100',
    title: 'YELLOW ALERT: WATCH'
  },
  ORANGE: {
    bg: 'bg-orange-600',
    labelColor: 'text-orange-200',
    title: 'ORANGE ALERT: ALERT'
  },
  RED: {
    bg: 'bg-red-600',
    labelColor: 'text-red-200',
    title: 'RED ALERT: CRITICAL'
  }
};

export function AlertBanner({ level, probability }: AlertBannerProps) {
  const alertData = ALERT_MESSAGES[level];
  const theme = themeStyles[level];
  
  return (
    <div className={`mb-4 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center relative overflow-hidden ${theme.bg}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-8 -mt-8 rounded-full blur-2xl"></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className={`${theme.labelColor} text-[10px] font-bold uppercase tracking-[0.2em] mb-1`}>Flood Early Warning</p>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">{theme.title}</h2>
        </div>
        <div className="px-3 py-2 bg-white/20 backdrop-blur rounded-lg border border-white/30 text-center leading-tight">
          <span className="text-[10px] block opacity-80 uppercase tracking-wider">Risk</span>
          <span className="text-xl font-black">{probability}%</span>
        </div>
      </div>
      <div className="mt-4 bg-white/10 border border-white/20 p-4 rounded-xl relative z-10">
        <p className="text-lg italic font-serif leading-tight">"{alertData.bisaya}"</p>
      </div>
    </div>
  );
}
