import React, { useState } from 'react';
import { ShineReport } from '../types';
import { GraduationCap, Send, Droplets, AlertCircle, CheckCircle2, User, Clock, FileText, Search } from 'lucide-react';

interface ShinePortalProps {
  reports: ShineReport[];
  onSubmitReport: (report: Partial<ShineReport>) => void;
}

export const ShinePortal: React.FC<ShinePortalProps> = ({
  reports,
  onSubmitReport
}) => {
  const [schoolName, setSchoolName] = useState('Frances National High School');
  const [observerName, setObserverName] = useState('');
  const [gaugeReadingMm, setGaugeReadingMm] = useState<number | ''>('');
  const [rainfallType, setRainfallType] = useState<ShineReport['rainfallType']>('HEAVY');
  const [turbidityObserved, setTurbidityObserved] = useState<ShineReport['turbidityObserved']>('MURKY_BROWN');
  const [waterHyacinthClogging, setWaterHyacinthClogging] = useState(true);
  const [fieldNotes, setFieldNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observerName || gaugeReadingMm === '') return;

    onSubmitReport({
      schoolName,
      observerName,
      gaugeReadingMm: Number(gaugeReadingMm),
      rainfallType,
      turbidityObserved,
      waterHyacinthClogging,
      fieldNotes
    });

    setSubmittedSuccess(true);
    setObserverName('');
    setGaugeReadingMm('');
    setFieldNotes('');
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const filteredReports = reports.filter((r) =>
    r.schoolName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.observerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.fieldNotes.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              School Hydrological Information Network (SHINe)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                Bulacan PDRRMO Grassroots Network
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Community rainfall and river observation logging by student observers & local science clubs
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left Form: Manual Observation Submission */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-teal-400" />
              <span>Submit SHINe Observation</span>
            </h4>
            <span className="text-[11px] text-teal-400 font-mono">Manual Gauge</span>
          </div>

          {submittedSuccess && (
            <div className="p-3 bg-teal-950/60 border border-teal-700/60 rounded-lg text-xs text-teal-200 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Observation logged and submitted to MDRRMO telemetry stream!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* School Selector */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">School / Observer Station</label>
              <select
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
              >
                <option value="Frances National High School">Frances National High School (SHINe Club)</option>
                <option value="Frances Elementary School">Frances Elementary School (Pampanga Riverside)</option>
                <option value="Meysulao Elementary School">Meysulao Elementary School (Candaba Basin)</option>
                <option value="San Miguel Elementary School">San Miguel Elementary School (Bagbag River)</option>
                <option value="Calumpit National High School">Calumpit National High School (Poblacion)</option>
                <option value="Calumpit Central School">Calumpit Central School</option>
              </select>
            </div>

            {/* Observer Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Student Observer / Teacher Adviser Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos (Grade 10 Lead)"
                value={observerName}
                onChange={(e) => setObserverName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Gauge Reading (mm) */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Manual Rain Gauge Cylinder Reading (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0"
                  placeholder="e.g. 35.5"
                  value={gaugeReadingMm}
                  onChange={(e) => setGaugeReadingMm(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 pr-10 text-slate-200 font-mono focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 font-mono text-xs">mm</span>
              </div>
            </div>

            {/* Rainfall Type & Turbidity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Rainfall Intensity</label>
                <select
                  value={rainfallType}
                  onChange={(e) => setRainfallType(e.target.value as ShineReport['rainfallType'])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="LIGHT">Light Drizzle</option>
                  <option value="MODERATE">Moderate Rain</option>
                  <option value="HEAVY">Heavy Downpour</option>
                  <option value="TORRENTIAL">Torrential Storm</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">River Turbidity</label>
                <select
                  value={turbidityObserved}
                  onChange={(e) => setTurbidityObserved(e.target.value as ShineReport['turbidityObserved'])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="CLEAR">Clear</option>
                  <option value="MURKY_BROWN">Murky Brown</option>
                  <option value="HEAVILY_SILTED">Heavily Silted (Mudflow)</option>
                </select>
              </div>
            </div>

            {/* Water Hyacinth Clogging checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="hyacinth-check"
                checked={waterHyacinthClogging}
                onChange={(e) => setWaterHyacinthClogging(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-600 accent-teal-500 cursor-pointer"
              />
              <label htmlFor="hyacinth-check" className="text-slate-300 cursor-pointer text-xs">
                Water Hyacinths (Water Lilies) clogging bridges / waterways
              </label>
            </div>

            {/* Field Notes */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Field Observation Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Water is 5 inches below the concrete levee, heavy hyacinth build-up under the footbridge..."
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log SHINe Field Report</span>
            </button>
          </form>
        </div>

        {/* Right Feed: Verified Student Observations Log */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Volunteer Observer Feed ({filteredReports.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  School-based ground-truth observations validating automated radar & satellite feeds
                </p>
              </div>

              <div className="relative w-full sm:w-44">
                <input
                  type="text"
                  placeholder="Filter reports..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Reports List */}
            <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{report.schoolName}</span>
                        {report.verified && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                            Verified Observer
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-teal-400" />
                        <span>{report.observerName}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{report.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black font-mono text-teal-300">
                        {report.gaugeReadingMm.toFixed(1)} <span className="text-xs text-slate-400 font-normal">mm</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Manual Rain Reading</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    "{report.fieldNotes}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Rain: <strong className="text-cyan-300">{report.rainfallType}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Turbidity: <strong className="text-amber-300">{report.turbidityObserved.replace(/_/g, ' ')}</strong>
                    </span>
                    {report.waterHyacinthClogging && (
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60">
                        ⚠️ Water Hyacinths Clogging Channel
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
            SHINe is recognized by DOST-PAGASA & Bulacan PDRRMO as an official youth citizen-science disaster risk reduction component.
          </div>
        </div>
      </div>
    </div>
  );
};
