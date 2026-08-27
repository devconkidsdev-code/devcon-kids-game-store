import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Navigation, Siren, Users, ShieldAlert, ArrowUpDown } from 'lucide-react';
import { AlertLevel, BarangayFloodInfo } from '../types/flood';

interface BarangayInundationGridProps {
  barangays: BarangayFloodInfo[];
  selectedBarangay: BarangayFloodInfo | null;
  onSelectBarangay: (b: BarangayFloodInfo) => void;
  language: 'tl' | 'en';
  onFindRoute: (b: BarangayFloodInfo) => void;
}

export const BarangayInundationGrid: React.FC<BarangayInundationGridProps> = ({
  barangays,
  selectedBarangay,
  onSelectBarangay,
  language,
  onFindRoute
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AlertLevel>('all');
  const [sortBy, setSortBy] = useState<'depth' | 'name' | 'families'>('depth');

  const filteredBarangays = useMemo(() => {
    return barangays
      .filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'depth') {
          return b.floodDepthFeet - a.floodDepthFeet;
        }
        if (sortBy === 'families') {
          return b.affectedFamilies - a.affectedFamilies;
        }
        return a.name.localeCompare(b.name);
      });
  }, [barangays, searchTerm, filterStatus, sortBy]);

  const countByStatus = useMemo(() => {
    return {
      all: barangays.length,
      red: barangays.filter(b => b.status === 'red').length,
      orange: barangays.filter(b => b.status === 'orange').length,
      yellow: barangays.filter(b => b.status === 'yellow').length,
      normal: barangays.filter(b => b.status === 'normal').length,
    };
  }, [barangays]);

  return (
    <div className="space-y-4">
      
      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="search-barangay-input"
            type="text"
            placeholder={language === 'tl' ? 'Maghanap ng Barangay (hal. Meysulao, Frances, Gatbuca)...' : 'Search Calumpit Barangay (e.g. Meysulao, Frances)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'all'
                ? 'bg-neutral-700 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Lahat' : 'All'} ({countByStatus.all})
          </button>
          
          <button
            onClick={() => setFilterStatus('red')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'red'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-red-400 hover:bg-red-950/50'
            }`}
          >
            Red ({countByStatus.red})
          </button>

          <button
            onClick={() => setFilterStatus('orange')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'orange'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 text-amber-400 hover:bg-amber-950/50'
            }`}
          >
            Orange ({countByStatus.orange})
          </button>

          <button
            onClick={() => setFilterStatus('yellow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'yellow'
                ? 'bg-yellow-600 text-white'
                : 'bg-neutral-800 text-yellow-400 hover:bg-yellow-950/50'
            }`}
          >
            Yellow ({countByStatus.yellow})
          </button>

          <button
            onClick={() => setFilterStatus('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'normal'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-800 text-emerald-400 hover:bg-emerald-950/50'
            }`}
          >
            Normal ({countByStatus.normal})
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'depth' | 'name' | 'families')}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 py-1.5 px-2.5 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="depth">{language === 'tl' ? 'Lalim ng Baha' : 'Highest Flood'}</option>
            <option value="families">{language === 'tl' ? 'Pamilyang Apektado' : 'Affected Families'}</option>
            <option value="name">{language === 'tl' ? 'Alpabetiko (A-Z)' : 'Name (A-Z)'}</option>
          </select>
        </div>

      </div>

      {/* Grid of Barangays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBarangays.map((barangay) => {
          const isSelected = selectedBarangay?.id === barangay.id;

          const getStatusBadge = () => {
            switch (barangay.status) {
              case 'red':
                return 'bg-red-500/20 text-red-300 border-red-500/40';
              case 'orange':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              case 'yellow':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
              default:
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            }
          };

          return (
            <div
              key={barangay.id}
              id={`barangay-card-${barangay.id}`}
              onClick={() => onSelectBarangay(barangay)}
              className={`bg-neutral-900/90 rounded-xl p-4 border transition-all duration-200 cursor-pointer shadow-sm hover:border-cyan-500/60 ${
                isSelected
                  ? 'ring-2 ring-cyan-500 border-cyan-500 bg-neutral-800'
                  : barangay.status === 'red'
                  ? 'border-red-600/40 bg-red-950/15'
                  : barangay.status === 'orange'
                  ? 'border-amber-600/40 bg-amber-950/15'
                  : 'border-neutral-800'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                    {barangay.zone} Zone • {barangay.elevationCategory}
                  </span>
                  <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                    {barangay.name}
                    {barangay.sirenActive && (
                      <span className="text-[10px] p-0.5 px-1 rounded bg-red-900 text-red-200 border border-red-500 animate-pulse flex items-center gap-0.5">
                        <Siren className="w-3 h-3 text-red-400" />
                        SIREN
                      </span>
                    )}
                  </h4>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${getStatusBadge()}`}>
                  {barangay.status}
                </span>
              </div>

              {/* Water Depth & Families */}
              <div className="grid grid-cols-2 gap-2 my-2.5">
                <div className="p-2 rounded-lg bg-black/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase block">
                    {language === 'tl' ? 'Lalim ng Baha' : 'Flood Depth'}
                  </span>
                  <div className="text-lg font-bold font-mono text-white">
                    {barangay.floodDepthFeet > 0 ? (
                      <>
                        {barangay.floodDepthFeet} ft
                        <span className="text-[10px] text-neutral-400 font-normal ml-1">
                          ({barangay.floodDepthMeters}m)
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-400 text-sm">0.0 ft (Dry)</span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase block">
                    {language === 'tl' ? 'Pamilyang Apektado' : 'Families'}
                  </span>
                  <div className="text-lg font-bold font-mono text-neutral-200">
                    {barangay.affectedFamilies > 0 ? (
                      barangay.affectedFamilies
                    ) : (
                      <span className="text-neutral-500 text-sm">0</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Road Passability Pill */}
              <div className="mb-3">
                <span className={`text-[11px] font-medium px-2 py-1 rounded block truncate ${
                  barangay.roadPassability === 'impassable_boats_only'
                    ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                    : barangay.roadPassability === 'light_vehicles_not_passable'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                }`}>
                  {barangay.roadPassability === 'impassable_boats_only' && (language === 'tl' ? '🚫 Bangka lamang (Lubog ang kalsada)' : '🚫 Rescue Boats Only (Impassable)')}
                  {barangay.roadPassability === 'light_vehicles_not_passable' && (language === 'tl' ? '⚠️ High-clearance truck lamang' : '⚠️ High-Clearance Only')}
                  {barangay.roadPassability === 'high_clearance' && (language === 'tl' ? '⚠️ Mataas na sasakyan lamang' : '⚠️ Heavy Vehicles Only')}
                  {barangay.roadPassability === 'all' && (language === 'tl' ? '✅ Madaanan ng lahat ng sasakyan' : '✅ Passable to All Vehicles')}
                </span>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {language === 'tl' ? 'Likasan' : 'Shelter'}: {barangay.evacuationStatus}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFindRoute(barangay);
                  }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  {language === 'tl' ? 'Ligtas na Ruta' : 'Safe Route'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBarangays.length === 0 && (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
          <p className="text-sm text-neutral-400">
            {language === 'tl' ? 'Walang nahanap na barangay sa pamantayan.' : 'No barangays found matching search criteria.'}
          </p>
        </div>
      )}

    </div>
  );
};
