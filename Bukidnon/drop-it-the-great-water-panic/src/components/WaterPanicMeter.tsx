import React from 'react';
import { motion } from 'motion/react';
import { PanicLevel } from '../types/game';

interface WaterPanicMeterProps {
  waterPercent: number; // 0 - 100
  onClick?: () => void;
  className?: string;
}

export const getPanicState = (percent: number): {
  level: PanicLevel;
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  reaction: string;
  icon: string;
} => {
  if (percent > 70) {
    return {
      level: 'fine',
      label: '“Everything is totally fine!”',
      color: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      reaction: '😊 Bloop is smiling calmly.',
      icon: '💧',
    };
  }
  if (percent > 45) {
    return {
      level: 'warning',
      label: '“Maybe we should save some water...”',
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      reaction: '🤔 Villagers are raising eyebrows.',
      icon: '⚠️',
    };
  }
  if (percent > 25) {
    return {
      level: 'serious',
      label: '“Okay, this is getting serious.”',
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      reaction: '😰 Professor Croak is sweating.',
      icon: '🚨',
    };
  }
  if (percent > 10) {
    return {
      level: 'panic',
      label: '“WHO LEFT THE TAP ON?!”',
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      reaction: '😱 Clucky is running around with a towel!',
      icon: '🔥',
    };
  }
  return {
    level: 'meltdown',
    label: '“EVERYBODY PANIC!”',
    color: 'bg-red-600',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    reaction: '🚨 Moo-Moo is drinking from a tiny thimble!',
    icon: '⚡',
  };
};

export const WaterPanicMeter: React.FC<WaterPanicMeterProps> = ({
  waterPercent,
  onClick,
  className = '',
}) => {
  const panic = getPanicState(waterPercent);

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-1.5 rounded-2xl border ${panic.bgColor} ${panic.borderColor} shadow-sm transition-all hover:scale-[1.02] cursor-pointer text-left ${className}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            Panic Meter <span className="text-sm">{panic.icon}</span>
          </span>
          <span className={`text-xs font-extrabold ${panic.textColor}`}>
            {Math.round(waterPercent)}%
          </span>
        </div>

        {/* Meter Gauge Bar */}
        <div className="w-32 h-2.5 bg-slate-200/80 rounded-full overflow-hidden mt-1 relative">
          <motion.div
            className={`h-full rounded-full ${panic.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(4, Math.min(100, waterPercent))}%` }}
            transition={{ type: 'spring', damping: 15, stiffness: 90 }}
          />
        </div>
      </div>

      <div className="hidden sm:flex flex-col max-w-[170px]">
        <span className={`text-xs font-bold leading-tight ${panic.textColor} line-clamp-1`}>
          {panic.label}
        </span>
        <span className="text-[10px] text-slate-500 leading-tight truncate">
          {panic.reaction}
        </span>
      </div>
    </motion.button>
  );
};
