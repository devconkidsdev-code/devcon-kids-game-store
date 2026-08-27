import React from 'react';
import { WeatherType } from '../types';
import { Sun, CloudRain, Sparkles, Moon, Wand2 } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherType;
  timeRemaining: number;
  onCycleWeather: () => void;
}

const WEATHER_CONFIGS: Record<WeatherType, {
  name: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  effectDescription: string;
}> = {
  sunny: {
    name: 'Sunny Skies',
    icon: <Sun className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin-slow" />,
    badgeBg: 'bg-amber-950/40',
    badgeBorder: 'border-amber-500/30',
    textColor: 'text-amber-300',
    effectDescription: 'Standard healthy sunlight growth',
  },
  rainy: {
    name: 'Gentle Rain',
    icon: <CloudRain className="w-4 h-4 text-sky-400 fill-sky-400 animate-bounce" />,
    badgeBg: 'bg-sky-950/50',
    badgeBorder: 'border-sky-500/40',
    textColor: 'text-sky-300',
    effectDescription: 'Rain automatically hydrates all garden plots!',
  },
  golden_hour: {
    name: 'Golden Hour',
    icon: <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />,
    badgeBg: 'bg-gradient-to-r from-amber-950/60 to-orange-950/60',
    badgeBorder: 'border-amber-400/40',
    textColor: 'text-amber-200',
    effectDescription: '+25% bonus coins on all crop harvests!',
  },
  starlight: {
    name: 'Moonlit Starlight',
    icon: <Moon className="w-4 h-4 text-indigo-300 fill-indigo-300" />,
    badgeBg: 'bg-indigo-950/50',
    badgeBorder: 'border-indigo-500/40',
    textColor: 'text-indigo-200',
    effectDescription: 'Exotic & Legendary crops grow 50% faster!',
  },
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  timeRemaining,
  onCycleWeather,
}) => {
  const current = WEATHER_CONFIGS[weather];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${current.badgeBg} ${current.badgeBorder} backdrop-blur-md shadow-sm`}
      >
        <div className="shrink-0">{current.icon}</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black ${current.textColor}`}>{current.name}</span>
            <span className="text-[10px] text-stone-400 font-mono">({timeRemaining}s)</span>
          </div>
          <span className="text-[10px] text-stone-300 font-medium truncate max-w-[170px] sm:max-w-[240px]">
            {current.effectDescription}
          </span>
        </div>
      </div>

      <button
        id="toggle-weather-charm-btn"
        onClick={onCycleWeather}
        title="Summon next weather pattern"
        className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 text-stone-300 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <Wand2 className="w-4 h-4" />
      </button>
    </div>
  );
};
