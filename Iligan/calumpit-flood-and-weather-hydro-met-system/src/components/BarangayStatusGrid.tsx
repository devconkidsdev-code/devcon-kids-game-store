import React, { useState } from 'react';
import { BarangayStatus, AlertSeverity } from '../types';
import {
  ShieldAlert,
  Car,
  AlertTriangle,
  Users,
  Home,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Edit3,
  CheckCircle2,
  ChevronRight,
  Compass,
  Navigation
} from 'lucide-react';

interface BarangayStatusGridProps {
  barangays: BarangayStatus[];
  onUpdateBarangay: (id: string, updates: Partial<BarangayStatus>) => void;
  onOpenEvacuationModal?: (barangayName: string) => void;
}

export const BarangayStatusGrid: React.FC<BarangayStatusGridProps> = ({
  barangays,
  onUpdateBarangay,
  onOpenEvacuationModal
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'RED' | 'ORANGE' | 'YELLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBarangay, setEditingBarangay] = useState<BarangayStatus | null>(null);

  const filteredBarangays = barangays.filter((b) => {
    const matchesSeverity = filterSeverity === 'ALL' || b.warningStatus === filterSeverity;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getPassabilityBadge = (passability: BarangayStatus['roadPassability']) => {
    switch (passability) {
      case 'SUBMERGED_BOATS_ONLY':
      case 'IMPASSABLE':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: 'Submerged (Rescue Boats Only)'
        };
      case 'NOT_PASSABLE_LIGHT':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'Not Passable to Light Vehicles'
        };
      case 'PASSABLE_HEAVY_ONLY':
        return {
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          label: 'High-Clearance Trucks Only'
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'Passable to All Vehicles'
        };
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarangay) return;
    onUpdateBarangay(editingBarangay.id, {
      floodHeightInches: editingBarangay.floodHeightInches,
      roadPassability: editingBarangay.roadPassability,
      warningStatus: editingBarangay.warningStatus,
      trend: editingBarangay.trend
    });
    setEditingBarangay(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              Vulnerable Barangay Status Deck & Road Passability
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Calumpit low-lying riverside delta communities • Live flood depths, road clearance, and evacuation routing
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {onOpenEvacuationModal && (
            <button
              onClick={() => onOpenEvacuationModal('Frances')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Evacuation Navigator</span>
            </button>
          )}

          <input
            type="text"
            placeholder="Search barangay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full sm:w-40"
          />

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({barangays.length})
            </button>
            <button
              onClick={() => setFilterSeverity('RED')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'RED'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Red ({barangays.filter((b) => b.warningStatus === 'RED').length})
            </button>
            <button
              onClick={() => setFilterSeverity('ORANGE')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'ORANGE'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Orange ({barangays.filter((b) => b.warningStatus === 'ORANGE').length})
            </button>
            <button
              onClick={() => setFilterSeverity('YELLOW')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterSeverity === 'YELLOW'
                  ? 'bg-yellow-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yellow ({barangays.filter((b) => b.warningStatus === 'YELLOW').length})
            </button>
          </div>
        </div>
      </div>

      {/* Barangay Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredBarangays.map((brgy) => {
          const passability = getPassabilityBadge(brgy.roadPassability);
          const isRed = brgy.warningStatus === 'RED';
          const isOrange = brgy.warningStatus === 'ORANGE';

          return (
            <div
              key={brgy.id}
              id={`brgy-card-${brgy.id}`}
              className={`bg-slate-950/70 border rounded-xl p-3.5 flex flex-col justify-between transition-all hover:border-slate-700 shadow-md ${
                isRed
                  ? 'border-red-500/60 shadow-red-950/30'
                  : isOrange
                  ? 'border-amber-500/50 shadow-amber-950/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 tracking-tight">
                        Brgy. {brgy.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isRed
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : isOrange
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                        }`}
                      >
                        {brgy.warningStatus} ALERT
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>Trend:</span>
                      <span
                        className={`font-semibold flex items-center gap-0.5 ${
                          brgy.trend === 'RISING'
                            ? 'text-red-400'
                            : brgy.trend === 'RECEDING'
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {brgy.trend === 'RISING' && <TrendingUp className="w-3 h-3" />}
                        {brgy.trend === 'RECEDING' && <TrendingDown className="w-3 h-3" />}
                        {brgy.trend === 'STABLE' && <Minus className="w-3 h-3" />}
                        {brgy.trend}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenEvacuationModal && (
                      <button
                        onClick={() => onOpenEvacuationModal(brgy.name)}
                        className="p-1.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
                        title={`View Evacuation Corridor for ${brgy.name}`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingBarangay(brgy)}
                      className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                      title="Update Status / Field Report"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Flood Depth Meter */}
                <div className="my-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Inundation Height</span>
                    <span className="font-mono text-slate-400 text-[11px]">{brgy.floodHeightMeters}m</span>
                  </div>
                  <div className="text-xl font-black font-mono mt-0.5 text-slate-100 flex items-baseline gap-1">
                    <span
                      className={
                        isRed ? 'text-red-400' : isOrange ? 'text-amber-300' : 'text-yellow-300'
                      }
                    >
                      {brgy.floodHeightInches}"
                    </span>
                    <span className="text-xs text-slate-400 font-normal">inches depth</span>
                  </div>
                  {/* Visual Water Level Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isRed ? 'bg-red-500' : isOrange ? 'bg-amber-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(100, (brgy.floodHeightInches / 48) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Road Passability Badge */}
                <div
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${passability.bg}`}
                >
                  <Car className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{passability.label}</span>
                </div>

                {/* Evacuation Center & Population */}
                <div className="grid grid-cols-2 gap-2 text-xs my-2.5">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>At Risk</span>
                    </div>
                    <div className="font-bold font-mono text-slate-200 mt-0.5">
                      {brgy.populationAtRisk.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Home className="w-3 h-3 text-indigo-400" />
                      <span>Affected HH</span>
                    </div>
                    <div className="font-bold font-mono text-slate-200 mt-0.5">
                      {brgy.householdsAffected.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Evacuation Center status */}
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 truncate max-w-[170px]">
                      <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{brgy.evacuationCenter.name}</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">
                      {brgy.evacuationCenter.currentOccupancy} / {brgy.evacuationCenter.capacity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Safe Route Guide Button */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {brgy.keyVulnerabilities.slice(0, 1).map((vuln, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 truncate max-w-[150px]"
                    >
                      {vuln}
                    </span>
                  ))}
                </div>

                {onOpenEvacuationModal && (
                  <button
                    onClick={() => onOpenEvacuationModal(brgy.name)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span>Safe Route</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Barangay Status Modal */}
      {editingBarangay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Update Brgy. {editingBarangay.name} Flood Status</span>
              </h4>
              <button
                onClick={() => setEditingBarangay(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Flood Height Inches */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Flood Inundation Height (Inches): {editingBarangay.floodHeightInches}"
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={editingBarangay.floodHeightInches}
                  onChange={(e) =>
                    setEditingBarangay({
                      ...editingBarangay,
                      floodHeightInches: Number(e.target.value)
                    })
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0" (Dry)</span>
                  <span>24" (Knee-deep)</span>
                  <span>36" (Waist-deep)</span>
                  <span>60" (Roof-level)</span>
                </div>
              </div>

              {/* Warning Level */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Warning Status</label>
                <select
                  value={editingBarangay.warningStatus}
                  onChange={(e) =>
                    setEditingBarangay({
                      ...editingBarangay,
                      warningStatus: e.target.value as AlertSeverity
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium"
                >
                  <option value="NORMAL">NORMAL (Green)</option>
                  <option value="YELLOW">YELLOW (Alert Level 1 - Threatening)</option>
                  <option value="ORANGE">ORANGE (Alert Level 2 - Pre-Evacuation)</option>
                  <option value="RED">RED (Alert Level 3 - Critical Evacuation)</option>
                </select>
              </div>

              {/* Road Passability */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Road Passability</label>
                <select
                  value={editingBarangay.roadPassability}
                  onChange={(e) =>
                    setEditingBarangay({
                      ...editingBarangay,
                      roadPassability: e.target.value as BarangayStatus['roadPassability']
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium"
                >
                  <option value="PASSABLE_ALL">Passable to All Vehicles</option>
                  <option value="PASSABLE_HEAVY_ONLY">Passable to Heavy Vehicles Only</option>
                  <option value="NOT_PASSABLE_LIGHT">Not Passable to Light Vehicles</option>
                  <option value="SUBMERGED_BOATS_ONLY">Submerged / Rescue Boats Only</option>
                  <option value="IMPASSABLE">Totally Impassable</option>
                </select>
              </div>

              {/* Trend */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Flood Level Trend</label>
                <select
                  value={editingBarangay.trend}
                  onChange={(e) =>
                    setEditingBarangay({
                      ...editingBarangay,
                      trend: e.target.value as BarangayStatus['trend']
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium"
                >
                  <option value="RISING">Rising</option>
                  <option value="STABLE">Stable</option>
                  <option value="RECEDING">Receding</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBarangay(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
