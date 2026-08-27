import React from 'react';
import { X, ShieldAlert, Cpu, HeartHandshake, Eye, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      id="about-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="about-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#12304A] text-white flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#12304A]">
                About Alertify
              </h2>
              <p className="text-[11px] text-[#64747F]">
                Civic Technology for AI-Powered Disaster Intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about modal"
            className="p-1.5 rounded-lg text-[#64747F] hover:text-[#12304A] hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm text-[#12304A] leading-relaxed">
          {/* Mission */}
          <div className="bg-[#12304A]/5 p-4 rounded-xl border border-[#168AAD]/20">
            <h3 className="font-bold text-sm text-[#12304A] mb-1.5">
              Turning Scattered Citizen Reports into Actionable Response Data
            </h3>
            <p className="text-xs text-[#64747F] leading-normal">
              During extreme weather and natural disasters, emergency dispatchers receive hundreds of unorganized calls, social media tags, and photos. Alertify transforms this noise into a structured, prioritized incident library.
            </p>
          </div>

          {/* Core Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-[#12304A]">
                <Cpu className="w-4 h-4 text-[#168AAD]" />
                <span>AI Structuring & Triage</span>
              </div>
              <p className="text-[11px] text-[#64747F]">
                Extracts incident type, depth, estimated severity, exact geo-coordinates, and urgency in milliseconds.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-[#12304A]">
                <HeartHandshake className="w-4 h-4 text-[#168AAD]" />
                <span>Human-in-the-Loop</span>
              </div>
              <p className="text-[11px] text-[#64747F]">
                Alertify does not replace emergency responders. It equips responders with clear summaries so commanders make faster, more informed decisions.
              </p>
            </div>
          </div>

          {/* 4-Step Mental Model */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#64747F] mb-2.5">
              Instant Comprehension Model
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-xs font-bold text-[#12304A]">1. WHAT</span>
                <span className="text-[10px] text-[#64747F]">Incident title</span>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                <span className="block text-xs font-bold text-[#DC2626]">2. SEVERITY</span>
                <span className="text-[10px] text-[#DC2626]/80">High · Med · Low</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <span className="block text-xs font-bold text-[#168AAD]">3. WHERE</span>
                <span className="text-[10px] text-[#168AAD]/80">Barangay & GPS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="block text-xs font-bold text-[#F28C28]">4. URGENCY</span>
                <span className="text-[10px] text-[#F28C28]/80">Urgent · Monitor</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-[#64747F] pt-2 border-t border-slate-200 flex items-center justify-between">
            <span>Alertify Civic Response Framework · Version 2.6</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-[#12304A] hover:bg-[#168AAD] text-white text-xs font-bold rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
