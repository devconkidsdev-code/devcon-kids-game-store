import React, { useState } from 'react';
import { X, Phone, Copy, Check, ShieldAlert, PhoneCall } from 'lucide-react';
import { CALUMPIT_HOTLINES } from '../data/calumpitData';

interface HotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'tl' | 'en';
}

export const HotlineModal: React.FC<HotlineModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-8 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {language === 'tl' ? 'Mga Emergency Hotline sa Calumpit' : 'Calumpit Emergency Contacts Directory'}
            </h3>
            <p className="text-xs text-neutral-400">
              {language === 'tl'
                ? '24/7 Operations Center ng MDRRMO, PDRRMC, BFP, PNP, at Rescue 911'
                : 'Direct 24/7 emergency dispatch lines for Calumpit & Bulacan'}
            </p>
          </div>
        </div>

        {/* Hotlines List */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {CALUMPIT_HOTLINES.map((hotline, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <h4 className="font-bold text-white text-sm">
                  {hotline.name}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  {hotline.description}
                </p>
                <span className="text-emerald-400 font-mono font-bold text-xs mt-1 block">
                  {hotline.number}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(hotline.number)}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                  title="Copy number"
                >
                  {copiedNumber === hotline.number ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={`tel:${hotline.number.replace(/[^0-9]/g, '')}`}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 text-center">
          {language === 'tl'
            ? 'Para sa banta sa buhay, agad tumawag sa pinakamalapit na responders.'
            : 'For immediate life-threatening situations, dial Calumpit Rescue 911.'}
        </div>
      </div>
    </div>
  );
};
