import React from 'react';
import { Search, X } from 'lucide-react';
import { FilterCategory, SortOption } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterCounts: Record<FilterCategory, number>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  filterCounts
}) => {
  const filters: FilterCategory[] = [
    'All',
    'High Severity',
    'Medium',
    'Low',
    'Active',
    'Needs Review',
    'Resolved'
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-2">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <input
          id="incident-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search incidents..."
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-[#12304A] outline-none focus:border-[#168AAD] transition-colors"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        {searchQuery && (
          <button
            id="clear-search-btn"
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              id={`filter-pill-${filter.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#12304A] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#12304A]'
              }`}
            >
              <span>{filter}</span>
              <span className={`ml-1 text-[10px] ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                ({filterCounts[filter] || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Select */}
      <div className="ml-auto flex items-center gap-2 text-xs font-medium text-slate-500 self-end lg:self-auto shrink-0">
        <span>Sort by:</span>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Sort incidents by"
          className="bg-transparent font-bold text-[#12304A] outline-none cursor-pointer hover:text-[#168AAD] transition-colors"
        >
          <option value="priority">Priority</option>
          <option value="recent">Most Recent</option>
          <option value="severity">Severity</option>
          <option value="location">Location</option>
        </select>
      </div>
    </div>
  );
};
