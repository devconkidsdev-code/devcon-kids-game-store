import React from 'react';
import { Severity, Urgency, IncidentStatus } from '../types';

export const SeverityBadge: React.FC<{ severity: Severity; size?: 'sm' | 'md' | 'lg' }> = ({ 
  severity, 
  size = 'md' 
}) => {
  const config = {
    HIGH: {
      label: 'HIGH',
      className: 'severity-high text-[#DC2626] bg-[rgba(220,38,38,0.1)] border border-red-200/50'
    },
    MEDIUM: {
      label: 'MEDIUM',
      className: 'severity-medium text-[#F28C28] bg-[rgba(242,140,40,0.1)] border border-orange-200/50'
    },
    LOW: {
      label: 'LOW',
      className: 'severity-low text-[#16A34A] bg-[rgba(22,163,74,0.1)] border border-emerald-200/50'
    }
  }[severity];

  const sizeClasses = {
    sm: 'text-[10px] font-black px-2 py-0.5 tracking-wider',
    md: 'text-[10px] font-black px-2.5 py-1 tracking-wider',
    lg: 'text-xs font-black px-3 py-1.5 tracking-wider'
  }[size];

  return (
    <span
      id={`severity-badge-${severity.toLowerCase()}`}
      className={`inline-flex items-center justify-center rounded uppercase font-sans ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};

export const UrgencyIndicator: React.FC<{ urgency: Urgency; size?: 'sm' | 'md' }> = ({ 
  urgency, 
  size = 'md' 
}) => {
  const config = {
    URGENT: {
      label: 'URGENT',
      icon: '🔴',
      textColor: 'urgency-urgent text-[#DC2626]'
    },
    NEEDS_ATTENTION: {
      label: 'ATTENTION',
      icon: '🟠',
      textColor: 'urgency-attention text-[#F28C28]'
    },
    MONITOR: {
      label: 'MONITOR',
      icon: '🟡',
      textColor: 'text-amber-600'
    },
    RESOLVED: {
      label: 'RESOLVED',
      icon: '🟢',
      textColor: 'text-[#16A34A]'
    }
  }[urgency];

  const textSizes = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <div 
      id={`urgency-indicator-${urgency.toLowerCase()}`} 
      className={`inline-flex items-center gap-1 font-bold ${config.textColor} ${textSizes}`}
    >
      <span className="text-[10px] select-none">{config.icon}</span>
      <span className="uppercase tracking-tight">{config.label}</span>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md'
}) => {
  const config = {
    Reported: {
      bg: 'bg-slate-100',
      text: 'text-slate-600'
    },
    'Under Review': {
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    Verified: {
      bg: 'bg-teal-50',
      text: 'text-[#168AAD]'
    },
    Responding: {
      bg: 'bg-indigo-50',
      text: 'text-[#12304A]'
    },
    Resolved: {
      bg: 'bg-emerald-50',
      text: 'text-[#16A34A]'
    }
  }[status];

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1';

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center rounded font-black uppercase tracking-wider ${config.bg} ${config.text} ${sizeClasses}`}
    >
      {status}
    </span>
  );
};
