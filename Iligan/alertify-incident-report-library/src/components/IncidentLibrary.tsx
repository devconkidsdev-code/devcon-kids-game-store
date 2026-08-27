import React from 'react';
import { Incident } from '../types';
import { IncidentCard } from './IncidentCard';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface IncidentLibraryProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId?: string | null;
  onResetFilters?: () => void;
  hasSidePanel?: boolean;
}

export const IncidentLibrary: React.FC<IncidentLibraryProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId,
  onResetFilters,
  hasSidePanel = false
}) => {
  if (incidents.length === 0) {
    return (
      <div 
        id="incident-library-empty-state"
        className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-slate-200 text-center card-shadow my-4"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#12304A] mb-1">
          No matching reports found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-xs">
          Try adjusting your search terms or changing your active filters.
        </p>
        {onResetFilters && (
          <button
            id="reset-filters-btn"
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12304A] hover:bg-[#168AAD] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      id="incident-cards-grid" 
      className={`flex-1 grid gap-4 ${
        hasSidePanel
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}
    >
      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          onClick={() => onSelectIncident(incident)}
          isSelected={selectedIncidentId === incident.id}
        />
      ))}
    </div>
  );
};
