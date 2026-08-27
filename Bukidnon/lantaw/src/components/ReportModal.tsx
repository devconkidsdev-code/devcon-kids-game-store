import React, { useState } from 'react';
import { TouristSpot, SpotReport, ReportCategory } from '../types';
import { X, Flag, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  spot: TouristSpot | null;
  onClose: () => void;
  onSubmitReport: (report: SpotReport) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  spot,
  onClose,
  onSubmitReport,
}) => {
  if (!spot) return null;

  const [category, setCategory] = useState<ReportCategory>('Incorrect operating hours');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Juan Dela Cruz');
  const [reporterEmail, setReporterEmail] = useState('juan.delacruz@gmail.com');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: SpotReport = {
      id: `rep-${Date.now()}`,
      spotId: spot.id,
      spotName: spot.name,
      reporterName,
      reporterEmail,
      category,
      description,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onSubmitReport(newReport);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="report-info-modal"
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl border border-amber-200">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Report Inaccurate Information</h2>
              <p className="text-xs text-slate-500">{spot.name} • Provincial Tourism Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Report Transmitted to Tourism Desk</h3>
            <p className="text-xs text-slate-600">
              Thank you for helping keep Bukidnon's tourism data accurate and trustworthy. Our administrative desk will verify this with the registered owner.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value="Incorrect operating hours">Incorrect Operating Hours</option>
                <option value="Incorrect price">Incorrect Prices or Entrance Fees</option>
                <option value="Tourist spot is closed">Attraction is Closed / Not Operating</option>
                <option value="Road condition changed">Road Condition or Accessibility Changed</option>
                <option value="Incorrect location">Incorrect Location or Contact Info</option>
                <option value="Other">Other Inaccurate Detail</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Detailed Description of Discrepancy</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs correction based on your recent visit..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
