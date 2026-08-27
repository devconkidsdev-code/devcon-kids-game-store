import React, { useState } from 'react';
import { TouristSpot, InaccuracyReport, Booking } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Users, 
  Calendar, 
  Search, 
  Edit, 
  Trash2, 
  Bell, 
  Plus, 
  Check, 
  Flag,
  CloudRain,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  spots: TouristSpot[];
  reports: InaccuracyReport[];
  bookings: Booking[];
  hasWeatherAlert: boolean;
  onToggleWeatherAlert: () => void;
  onUpdateSpot: (updatedSpot: TouristSpot) => void;
  onResolveReport: (reportId: string, resolutionAction: 'resolved' | 'dismissed') => void;
  onViewSpot: (spot: TouristSpot) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  spots,
  reports,
  bookings,
  hasWeatherAlert,
  onToggleWeatherAlert,
  onUpdateSpot,
  onResolveReport,
  onViewSpot
}) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'reports' | 'stats'>('spots');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSpot, setEditingSpot] = useState<TouristSpot | null>(null);

  // Statistics calculation
  const totalSpots = spots.length;
  const openSpots = spots.filter((s) => s.operatingStatus === 'open').length;
  const limitedSpots = spots.filter((s) => s.operatingStatus === 'limited').length;
  const closedSpots = spots.filter((s) => s.operatingStatus === 'closed').length;
  const totalVisitorsToday = spots.reduce((sum, s) => sum + s.currentVisitorsToday, 0);
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const filteredSpots = spots.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleVerification = (spot: TouristSpot) => {
    const updated = {
      ...spot,
      isVerified: !spot.isVerified,
      lastUpdated: 'Just now',
      updatedBy: 'Bukidnon Tourism Admin'
    };
    onUpdateSpot(updated);
  };

  const handleSaveSpotEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpot) return;
    onUpdateSpot({
      ...editingSpot,
      lastUpdated: 'Just now',
      updatedBy: 'Bukidnon Tourism Admin Desk'
    });
    setEditingSpot(null);
    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-lg">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 uppercase">
                Provincial Tourism Office
              </span>
              <span className="text-xs text-slate-400">Province of Bukidnon LGU Portal</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Admin Governance & Verification Desk
            </h1>
            <p className="text-xs text-indigo-300/80">
              Audit attraction data, manage crowdsourced reports & broadcast provincial safety alerts
            </p>
          </div>
        </div>

        {/* Weather Alert Emergency Toggle */}
        <button
          onClick={onToggleWeatherAlert}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition shadow-lg ${
            hasWeatherAlert
              ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-amber-900/40'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <CloudRain className="w-4 h-4 text-amber-400" />
          <span>{hasWeatherAlert ? 'Provincial Alert Active' : 'Broadcast Road Advisory'}</span>
        </button>
      </div>

      {/* Provincial KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Total Verified Spots
          </span>
          <div className="text-2xl font-black text-white">{totalSpots} Attractions</div>
          <span className="text-[11px] text-emerald-400">Across 20 Municipalities</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Operational Status Grid
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <span className="text-emerald-400">🟢 {openSpots}</span>
            <span className="text-amber-400">🟡 {limitedSpots}</span>
            <span className="text-red-400">🔴 {closedSpots}</span>
          </div>
          <span className="text-[11px] text-slate-400">Real-time sync</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Daily Visitor Check-ins
          </span>
          <div className="text-2xl font-black text-indigo-400">{totalVisitorsToday} Pax</div>
          <span className="text-[11px] text-slate-400">Across all gateways</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
            Inaccuracy Reports
          </span>
          <div className="text-2xl font-black text-amber-400">{pendingReports.length} Pending</div>
          <span className="text-[11px] text-amber-300/80">Crowdsourced review queue</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('spots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'spots'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Registered Attractions ({spots.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Verification Queue</span>
            {pendingReports.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {pendingReports.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'spots' && (
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search spots, municipal..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Spot Directory & Admin Controls */}
      {activeTab === 'spots' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Attraction</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Operating Status</th>
                  <th className="py-3 px-4">Access Road</th>
                  <th className="py-3 px-4">Entrance Fee</th>
                  <th className="py-3 px-4">LGU Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSpots.map((spot) => (
                  <tr key={spot.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2.5">
                      <img
                        src={spot.images[0]}
                        alt={spot.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-bold">{spot.name}</div>
                        <div className="text-[10px] text-slate-400">{spot.category}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium">{spot.municipality}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          spot.operatingStatus === 'open'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : spot.operatingStatus === 'limited'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-red-950 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {spot.operatingStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          spot.accessibilityStatus === 'accessible'
                            ? 'text-emerald-400'
                            : spot.accessibilityStatus === 'limited'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {spot.accessibilityStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {spot.entranceFee === 0 ? 'FREE' : `₱${spot.entranceFee}`}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleVerification(spot)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                          spot.isVerified
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span>{spot.isVerified ? 'LGU Verified' : 'Unverified'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewSpot(spot)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="View public profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-300" />
                        </button>
                        <button
                          onClick={() => setEditingSpot(spot)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 text-indigo-300 transition border border-slate-700"
                          title="Edit administrative metadata"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Crowdsourced Inaccuracy Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No reports filed yet. All tourism data is operating smoothly!
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                      Category: {r.category}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {r.spotName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Reported by {r.reportedBy} ({r.reportedAt})
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    "{r.details}"
                  </p>

                  <div className="text-[10px] text-slate-400">
                    Report ID: {r.id} • Status: <strong className="text-amber-400 uppercase">{r.status}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => onResolveReport(r.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => onResolveReport(r.id, 'resolved')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Verify & Resolve</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Spot Editing Admin Modal */}
      {editingSpot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSpotEdit}
            className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-xs text-slate-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Administrative Edit: {editingSpot.name}</h3>
              <button
                type="button"
                onClick={() => setEditingSpot(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Attraction Name</label>
              <input
                type="text"
                value={editingSpot.name}
                onChange={(e) => setEditingSpot({ ...editingSpot, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Municipality</label>
                <input
                  type="text"
                  value={editingSpot.municipality}
                  onChange={(e) => setEditingSpot({ ...editingSpot, municipality: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 font-bold block mb-1">Entrance Fee (PHP)</label>
                <input
                  type="number"
                  value={editingSpot.entranceFee}
                  onChange={(e) => setEditingSpot({ ...editingSpot, entranceFee: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Official Description</label>
              <textarea
                rows={3}
                value={editingSpot.description}
                onChange={(e) => setEditingSpot({ ...editingSpot, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSpot(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Save LGU Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
