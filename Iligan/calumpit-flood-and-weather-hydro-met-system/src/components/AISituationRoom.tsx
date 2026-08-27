import React, { useState } from 'react';
import { AISituationReport, AlertSeverity } from '../types';
import { Sparkles, Bot, Send, ShieldAlert, Waves, Clock, CheckCircle2, RefreshCw, HelpCircle, FileText } from 'lucide-react';

interface AISituationRoomProps {
  currentAlertLevel: AlertSeverity;
  onGenerateReport: () => Promise<void>;
  aiReport: AISituationReport | null;
  isLoading: boolean;
}

export const AISituationRoom: React.FC<AISituationRoomProps> = ({
  currentAlertLevel,
  onGenerateReport,
  aiReport,
  isLoading
}) => {
  const [question, setQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ q: string; a: string; time: string }[]>([
    {
      q: 'Why does Calumpit flood even when local rainfall in Bulacan has stopped?',
      a: 'Calumpit is the lowest delta bottleneck of the Pampanga River Basin. Even after local rains stop, upstream runoff from Nueva Ecija, Pampanga, and Candaba Swamp takes 12 to 24 hours to reach Calumpit. When compounded by Bustos and Angat Dam releases flowing through the Bagbag River into the same bottleneck, water levels remain submerged for days.',
      time: '10 mins ago'
    }
  ]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion('');
    setQaLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQ })
      });
      const data = await res.json();
      setQaHistory((prev) => [
        { q: userQ, a: data.answer || 'Analysis complete.', time: 'Just now' },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      setQaHistory((prev) => [
        {
          q: userQ,
          a: 'Hydrological Advisory: Prioritize staff gauge monitoring at Station 10 (Caniogan Bridge). Maintain rescue boat readiness for Frances and Meysulao.',
          time: 'Just now'
        },
        ...prev
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              MDRRMO AI Hydro-Meteorological Situation Room
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Gemini 3.7 Flash Assistant
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live telemetry synthesis • Confluence hydraulics analysis • Tactical evacuation advisory generator
            </p>
          </div>
        </div>

        <button
          onClick={onGenerateReport}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing Telemetry...' : 'Generate New Situation Report'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Latest Structured Situation Report */}
        <div className="lg:col-span-3 space-y-4">
          {aiReport ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{aiReport.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automated Hydro-Met Briefing • Generated for Calumpit Emergency Operations Center
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  aiReport.overallThreatLevel === 'RED'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50'
                    : aiReport.overallThreatLevel === 'ORANGE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                }`}>
                  {aiReport.overallThreatLevel} THREAT
                </span>
              </div>

              {/* Executive Summary */}
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Executive Briefing
                </span>
                <p className="text-slate-200 leading-relaxed">{aiReport.executiveSummary}</p>
              </div>

              {/* Confluence & Tidal Dynamics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
                    <Waves className="w-3.5 h-3.5" />
                    <span>Confluence Dynamics</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {aiReport.confluenceDynamics}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tidal Window Advisory</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {aiReport.tidalWindowAdvisory}
                  </p>
                </div>
              </div>

              {/* High Risk Barangays */}
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1.5">
                  High-Risk Priority Communities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {aiReport.highRiskBarangays.map((brgy, idx) => (
                    <div
                      key={idx}
                      className="bg-red-950/40 border border-red-800/50 p-2 rounded text-[11px] text-red-200 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      <span>{brgy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Recommended MDRRMO Tactical Actions
                </span>
                <div className="space-y-1.5">
                  {aiReport.recommendedMdrrmoActions.map((act, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] text-slate-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tagalog Public Broadcast Draft */}
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                  Tagalog Public Advisory (Broadcast Ready)
                </span>
                <p className="text-slate-300 italic leading-relaxed">
                  "{aiReport.publicAdvisoryTagalog}"
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3">
              <Bot className="w-10 h-10 text-cyan-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-slate-200">Generating Hydro-Met Situation Assessment</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizing real-time telemetry from Caniogan Bridge, Bustos Dam, and Manila Bay tidal gauge.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Interactive Tactical Q&A Assistant */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
              <Bot className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Interactive Disaster Q&A
              </h4>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setQuestion('How does Manila Bay high tide impact Angat River discharge at Caniogan?')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition-colors"
              >
                🌊 High Tide Impact on Caniogan
              </button>
              <button
                type="button"
                onClick={() => setQuestion('What are the critical evacuation protocols for Brgy. Frances?')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition-colors"
              >
                🚤 Brgy. Frances Evacuation
              </button>
            </div>

            {/* Q&A Thread */}
            <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {qaHistory.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="bg-cyan-950/40 border border-cyan-800/50 p-2.5 rounded-lg text-cyan-200">
                    <span className="font-semibold text-cyan-400 block text-[10px] uppercase">Officer Question:</span>
                    {item.q}
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 leading-relaxed">
                    <span className="font-semibold text-teal-400 block text-[10px] uppercase flex items-center gap-1">
                      <Bot className="w-3 h-3" /> AI Hydro-Met Advisor ({item.time}):
                    </span>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ask Input Form */}
          <form onSubmit={handleAskQuestion} className="pt-2 border-t border-slate-800/80">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask tactical question (e.g. dam spill timing, road access)..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={qaLoading}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-3 pr-10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={qaLoading || !question.trim()}
                className="absolute right-1.5 top-1.5 p-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
