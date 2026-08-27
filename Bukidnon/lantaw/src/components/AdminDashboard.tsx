import React, { useState } from 'react';
import { TouristSpot, SpotReport, Booking } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  Sparkles,
  BarChart3,
  Flag
} from 'lucide-react';

interface AdminDashboardProps {
  spots: TouristSpot[];
  reports: SpotReport[];
  bookings: Booking[];
  onToggleVerification: (spotId: string) => void;
  onResolveReport: (reportId: string, resolution: 'resolved' | 'rejected', notes: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  spots,
  reports,
  bookings,
  onToggleVerification,
  onResolveReport,
}) => {
  const [activeTab, setActiveTab] = useState<'spots' | 'reports' | 'stats'>('spots');
  const [reportNoteModal, setReportNoteModal] = useState<SpotReport | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  const totalSpots = spots.length;
  const verifiedSpots = spots.filter((s) => s.isVerified).length;
  const closedSpots = spots.filter((s) => s.operatingStatus === 'closed').length;
  const pendingReports = reports.filter((r) => r.status === 'pending' || r.status === 'under_review').length;

  const handleResolveAction = (resolution: 'resolved' | 'rejected') => {
    if (!reportNoteModal) return;
    onResolveReport(reportNoteModal.id, resolution, adminNoteText || 'Reviewed and updated in accordance with spot owner validation.');
    setReportNoteModal(null);
    setAdminNoteText('');
  };

  return (
    <div id="admin-dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-600/20 text-sky-400 rounded-2xl border border-sky-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Provincial Tourism Administrative Console</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                Admin Officer
              </span>
            </div>
            <p className="text-xs text-stone-400">Bukidnon Provincial Tourism, Culture & Affairs Oversight Platform</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
          <button
            onClick={() => setActiveTab('spots')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'spots' ? 'bg-sky-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Spots ({totalSpots})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-sky-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Reports</span>
            {pendingReports > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] flex items-center justify-center font-bold">
                {pendingReports}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'stats' ? 'bg-sky-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            System Metrics
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Registered Attractions</div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalSpots} Spots</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">{verifiedSpots} Verified / Active</div>
        </div>

        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Registered Owners</div>
          <div className="text-2xl font-extrabold text-white mt-1">12 Owners</div>
          <div className="text-[10px] text-sky-400 mt-0.5">Highland LGU & Private</div>
        </div>

        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Platform Bookings</div>
          <div className="text-2xl font-extrabold text-white mt-1">{bookings.length} Bookings</div>
          <div className="text-[10px] text-amber-400 mt-0.5">{bookings.filter(b => b.status === 'pending').length} Pending Owner Action</div>
        </div>

        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Inaccuracy Reports</div>
          <div className="text-2xl font-extrabold text-white mt-1">{reports.length} Reports</div>
          <div className="text-[10px] text-rose-400 mt-0.5">{pendingReports} Awaiting Review</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: TOURIST SPOTS VERIFICATION LIST */}
      {/* ========================================================================= */}
      {activeTab === 'spots' && (
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300">
              Tourist Spot Verification & Operational Audit
            </h2>
            <span className="text-xs text-stone-400">
              Verified spots display the official blue badge to tourists
            </span>
          </div>

          <div className="space-y-3">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={spot.thumbnail}
                    alt={spot.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{spot.name}</span>
                      {spot.isVerified ? (
                        <span className="flex items-center gap-1 text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full border border-sky-600/40">
                          <ShieldCheck className="w-3 h-3 text-sky-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {spot.municipality} • Owner: <span className="text-stone-300">{spot.ownerName}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                      <span>Status: <strong className="text-emerald-400 uppercase">{spot.operatingStatus}</strong></span>
                      <span>•</span>
                      <span>Last updated: {spot.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => onToggleVerification(spot.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      spot.isVerified
                        ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-700'
                        : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{spot.isVerified ? 'Revoke Verification' : 'Approve & Verify'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: REPORTED INACCURATE INFORMATION */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              <span>Tourists' Inaccurate Information Reports</span>
            </h2>
            <span className="text-xs text-stone-400">
              Crowdsourced quality assurance submitted by active travelers
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">No reports recorded.</div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rep.spotName}</span>
                        <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-600/30">
                          {rep.category}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        Reported by {rep.reporterName} ({rep.reporterEmail}) on {rep.createdAt}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      rep.status === 'resolved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                        : rep.status === 'under_review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                        : 'bg-stone-800 text-stone-400'
                    }`}>
                      {rep.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-stone-200 bg-stone-900 p-2.5 rounded-xl">
                    "{rep.description}"
                  </p>

                  {rep.adminNotes && (
                    <div className="text-[11px] text-sky-300 bg-sky-950/40 p-2 rounded-lg border border-sky-800/40">
                      <strong>Admin Resolution Note:</strong> {rep.adminNotes}
                    </div>
                  )}

                  {rep.status !== 'resolved' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setReportNoteModal(rep)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
                      >
                        Review & Resolve Issue
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: METRICS & BROADCAST */}
      {/* ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300">
            Bukidnon Tourism Health & System Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-stone-300 uppercase">Operational Status Distribution</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-semibold">🟢 Open for Tourism</span>
                  <span className="font-bold text-white">{spots.filter(s => s.operatingStatus === 'open').length} Attractions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400 font-semibold">🟡 Limited / Weather Affected</span>
                  <span className="font-bold text-white">{spots.filter(s => s.operatingStatus === 'limited').length} Attractions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-400 font-semibold">🔴 Temporarily Closed</span>
                  <span className="font-bold text-white">{closedSpots} Attractions</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
              <h3 className="text-xs font-bold text-stone-300 uppercase">Municipal Geographic Coverage</h3>
              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Manolo Fortich Corridor</span>
                  <span className="font-bold text-white">2 Major Resorts</span>
                </div>
                <div className="flex justify-between">
                  <span>Impasug-ong & Sumilao</span>
                  <span className="font-bold text-white">4 Eco-Parks</span>
                </div>
                <div className="flex justify-between">
                  <span>Malaybalay City & Lantapan</span>
                  <span className="font-bold text-white">4 Cultural / Peaks</span>
                </div>
                <div className="flex justify-between">
                  <span>Valencia, Maramag & Quezon</span>
                  <span className="font-bold text-white">4 Lakes & Viewpoints</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Report Action Modal */}
      {reportNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl p-6 max-w-md w-full text-stone-100 space-y-4">
            <h3 className="text-base font-bold text-white">Resolve Report for {reportNoteModal.spotName}</h3>
            <p className="text-xs text-stone-300">
              Enter official administrative notes regarding the update or verification with the tourist spot owner:
            </p>
            <textarea
              value={adminNoteText}
              onChange={(e) => setAdminNoteText(e.target.value)}
              placeholder="e.g. Contacted owner and verified new trail conditions. Updated status accordingly."
              rows={3}
              className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReportNoteModal(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveAction('resolved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
