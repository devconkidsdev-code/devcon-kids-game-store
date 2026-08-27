import React from 'react';

interface DashboardHeaderProps {
  totalCount: number;
  urgentCount: number;
  viewMode: 'library' | 'map';
  onViewModeChange: (mode: 'library' | 'map') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalCount,
  urgentCount,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 id="dashboard-main-heading" className="text-2xl sm:text-3xl font-bold mb-1 text-[#12304A] tracking-tight">
          Incident Reports
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Monitor, review, and prioritize reports from across the community.
          <span id="header-total-count" className="ml-2 font-semibold text-slate-400">
            {totalCount} reports total
          </span>
          {urgentCount > 0 && (
            <span className="ml-2 font-bold text-[#DC2626]">
              · {urgentCount} urgent
            </span>
          )}
        </p>
      </div>

      {/* Library | Map Toggle */}
      <div className="flex bg-white border border-slate-200 rounded-lg p-1 shrink-0 self-start sm:self-auto">
        <button
          id="view-mode-library-btn"
          type="button"
          onClick={() => onViewModeChange('library')}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
            viewMode === 'library'
              ? 'bg-slate-100 text-[#12304A]'
              : 'text-slate-400 hover:text-[#12304A]'
          }`}
        >
          Library
        </button>
        <button
          id="view-mode-map-btn"
          type="button"
          onClick={() => onViewModeChange('map')}
          className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
            viewMode === 'map'
              ? 'bg-slate-100 text-[#12304A]'
              : 'text-slate-400 hover:text-[#12304A]'
          }`}
        >
          Map
        </button>
      </div>
    </div>
  );
};
