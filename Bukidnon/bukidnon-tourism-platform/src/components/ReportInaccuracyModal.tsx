import React, { useState } from 'react';
import { TouristSpot, InaccuracyReport } from '../types';
import { X, Flag, AlertTriangle, CheckCircle2, Send, ShieldAlert } from 'lucide-react';

interface ReportInaccuracyModalProps {
  spot: TouristSpot;
  onClose: () => void;
  onSubmitReport: (report: InaccuracyReport) => void;
}

export const ReportInaccuracyModal: React.FC<ReportInaccuracyModalProps> = ({
  spot,
  onClose,
  onSubmitReport
}) => {
  const [category, setCategory] = useState<InaccuracyReport['category']>('price');
  const [details, setDetails] = useState('');
  const [reportedBy, setReportedBy] = useState('Tourist Visitor');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    const newReport: InaccuracyReport = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      spotId: spot.id,
      spotName: spot.name,
      category,
      details: details.trim(),
      reportedBy: reportedBy.trim() || 'Anonymous Tourist',
      reportedAt: 'Just now',
      status: 'pending'
    };

    onSubmitReport(newReport);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Report Inaccurate Tourism Info</h2>
              <p className="text-xs text-amber-300/80">Help keep Bukidnon’s official database 100% truthful</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs text-slate-200">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Attraction</span>
                <span className="font-bold text-white text-sm">{spot.name}</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">{spot.municipality}</span>
            </div>

            {/* Category Selector */}
            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InaccuracyReport['category'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="price">Incorrect Entrance / Activity Fee</option>
                <option value="hours">Incorrect Operating Hours / Schedule</option>
                <option value="closed">Attraction is Actually Closed on Site</option>
                <option value="location">Incorrect Address / Map Coordinates</option>
                <option value="weather">Outdated Trail Weather / Road Condition</option>
                <option value="contact">Wrong Contact Number or Email</option>
                <option value="description">Inaccurate Description / Missing Info</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Describe What Is Incorrect
              </label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g. On-site staff charged ₱200 instead of ₱150, or bridge access was blocked by roadwork..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Your Name */}
            <div>
              <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Your Name / Handle (Optional)
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Maria (Verified Visitor)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Your report will be sent to the Bukidnon Provincial Tourism Admin and the registered spot owner for immediate verification.
              </span>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verification Report</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report Submitted to Tourism Admin</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Thank you for safeguarding the accuracy of Bukidnon's tourism network. Our admin desk is reviewing the report with the spot owner.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
