import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark } from '../types';
import { 
  X, 
  MapPin, 
  Compass, 
  Clock, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  Info,
  DollarSign,
  Mountain
} from 'lucide-react';
import { soundscape } from '../utils/soundscape';

interface AttractionModalProps {
  landmark: Landmark | null;
  onClose: () => void;
  onOpenBooking: (landmark: Landmark) => void;
  isSavedInItinerary?: boolean;
  onToggleItinerary?: (landmarkId: string) => void;
}

export function AttractionModal({
  landmark,
  onClose,
  onOpenBooking,
  isSavedInItinerary = false,
  onToggleItinerary,
}: AttractionModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);

  if (!landmark) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNarrate = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingNarration) {
        window.speechSynthesis.cancel();
        setIsPlayingNarration(false);
      } else {
        const text = `${landmark.title}. ${landmark.tagline}. ${landmark.description}. ${landmark.tribalLore || ''}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingNarration(false);
        utterance.onerror = () => setIsPlayingNarration(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingNarration(true);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/65 backdrop-blur-sm">
        {/* Modal Backdrop Click */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          id="attraction-detail-modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-2xl bg-[#FDFCF0] border border-[#799F0C]/20 rounded-3xl shadow-2xl overflow-hidden text-[#2D3436] z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header Image with Gradient Overlays */}
          <div className="relative h-64 sm:h-72 w-full flex-shrink-0 overflow-hidden bg-stone-900">
            <img
              src={landmark.imageUrl}
              alt={landmark.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF0] via-black/20 to-black/50" />

            {/* Top Action Buttons (Close, Audio, Share, Save) */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#799F0C] text-white text-xs font-bold shadow-md">
                  {landmark.badge}
                </span>
                {landmark.difficulty && (
                  <span className="px-2.5 py-1 rounded-full bg-[#1E392A]/90 text-[#FDFCF0] text-xs font-semibold backdrop-blur-md border border-[#799F0C]/30 shadow-md">
                    {landmark.difficulty} Trek
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Audio Narration Guide */}
                <button
                  onClick={handleNarrate}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                    isPlayingNarration
                      ? 'bg-[#FF9F1C] text-white border-[#FF9F1C] animate-pulse'
                      : 'bg-white/90 text-[#1E392A] hover:bg-white border-[#799F0C]/20 shadow-md'
                  }`}
                  title="Audio Guide Narration"
                >
                  {isPlayingNarration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/90 hover:bg-white text-[#1E392A] border border-[#799F0C]/20 backdrop-blur-md transition-all shadow-md active:scale-95"
                  title="Copy link to landmark"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-white/90 hover:bg-white text-[#1E392A] border border-[#799F0C]/20 backdrop-blur-md transition-all shadow-md active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Title & Rating Banner */}
            <div className="absolute bottom-4 inset-x-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#799F0C] uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{landmark.municipalityName}, Bukidnon</span>
                <span>•</span>
                <span>{landmark.elevation}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E392A] leading-tight">
                {landmark.title}
              </h2>
            </div>
          </div>

          {/* Modal Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F9E8] p-3.5 rounded-2xl border border-[#799F0C]/15">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#4A5A40] font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#F5B041] fill-[#F5B041]" />
                  Visitor Rating
                </span>
                <span className="text-sm font-bold text-[#1E392A]">
                  {landmark.rating} <span className="text-xs font-normal text-[#4A5A40]">({landmark.reviewsCount})</span>
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#4A5A40] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#799F0C]" />
                  From CDO
                </span>
                <span className="text-sm font-bold text-[#1E392A] truncate">
                  {landmark.travelTimeFromCDO.split('(')[0]}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#4A5A40] font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#3498DB]" />
                  Best Time
                </span>
                <span className="text-sm font-bold text-[#1E392A] truncate">
                  {landmark.bestTime.split('(')[0]}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#4A5A40] font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#FF9F1C]" />
                  Entrance / Fee
                </span>
                <span className="text-sm font-bold text-[#1E392A] truncate">
                  {landmark.entryFee.split('/')[0]}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#4A5A40] mb-1.5">Overview</h3>
              <p className="text-[#2D3436] text-sm leading-relaxed">{landmark.description}</p>
            </div>

            {/* Key Highlights */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#1E392A] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#799F0C]" />
                Key Highlights & Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {landmark.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-[#799F0C]/15 text-xs text-[#2D3436]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#799F0C] flex-shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tribal Lore & Indigenous Cultural Heritage Connection */}
            {landmark.tribalLore && (
              <div className="bg-[#F5F9E8] p-4 rounded-2xl border border-[#799F0C]/25">
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#1E392A] mb-1.5 flex items-center gap-1.5">
                  <span>🪘</span>
                  Indigenous Tribal Lore & Sacred Wisdom
                </h3>
                <p className="text-xs text-[#4A5A40] leading-relaxed italic">
                  "{landmark.tribalLore}"
                </p>
              </div>
            )}

            {/* Fun Fact */}
            {landmark.funFact && (
              <div className="bg-[#FFF9EB] p-3.5 rounded-2xl border border-[#FF9F1C]/25 flex items-start gap-3">
                <div className="text-xl">💡</div>
                <div>
                  <h4 className="text-xs font-bold text-[#FF9F1C] uppercase tracking-wide">Did You Know?</h4>
                  <p className="text-xs text-[#2D3436] mt-0.5">{landmark.funFact}</p>
                </div>
              </div>
            )}

            {/* Activities Tag Cloud */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#4A5A40] mb-2">Available Activities</h3>
              <div className="flex flex-wrap gap-1.5">
                {landmark.activities.map((act, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-white text-[#1E392A] text-xs font-medium border border-[#799F0C]/15 shadow-2xs"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#799F0C]/15 flex items-center justify-between gap-3 flex-shrink-0">
            {/* Add to Itinerary Button */}
            {onToggleItinerary && (
              <button
                id="toggle-itinerary-modal-btn"
                onClick={() => {
                  onToggleItinerary(landmark.id);
                  soundscape.playInteractivePop();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                  isSavedInItinerary
                    ? 'bg-[#799F0C]/15 text-[#1E392A] border-[#799F0C]'
                    : 'bg-[#F5F9E8] hover:bg-white text-[#2D3436] border-[#799F0C]/25 hover:border-[#799F0C]'
                }`}
              >
                {isSavedInItinerary ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-[#799F0C]" />
                    <span>In Itinerary</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-[#4A5A40]" />
                    <span>Save to Trip</span>
                  </>
                )}
              </button>
            )}

            {/* Direct Booking / Permit Reservation Button */}
            <button
              id="book-landmark-btn"
              onClick={() => {
                onClose();
                onOpenBooking(landmark);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1E392A] hover:bg-[#2D3436] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#1E392A]/20 transition-transform active:scale-95"
            >
              <span>Book Pass / Guide Experience</span>
              <Sparkles className="w-4 h-4 text-[#A7C957]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
