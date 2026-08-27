import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { THE_SEVEN_TRIBES, BUKIDNON_DELICACIES } from '../data/bukidnonData';
import { TribalCommunity } from '../types';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Music, 
  Shield, 
  BookOpen, 
  Heart, 
  Coffee, 
  Award,
  Volume2
} from 'lucide-react';
import { soundscape } from '../utils/soundscape';

interface CulturePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CulturePassportModal({ isOpen, onClose }: CulturePassportModalProps) {
  const [activeTab, setActiveTab] = useState<'tribes' | 'kaamulan' | 'delicacies'>('tribes');
  const [selectedTribe, setSelectedTribe] = useState<TribalCommunity>(THE_SEVEN_TRIBES[0]);
  const [isTribalDrumming, setIsTribalDrumming] = useState(false);

  if (!isOpen) return null;

  const toggleTribalBeat = () => {
    const nextState = !isTribalDrumming;
    setIsTribalDrumming(nextState);
    soundscape.setTribalBeat(nextState);
    if (nextState && !soundscape.getIsPlaying()) {
      soundscape.start();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/65 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          id="culture-passport-modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-3xl bg-[#FDFCF0] border border-[#799F0C]/20 rounded-3xl shadow-2xl overflow-hidden text-[#2D3436] z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#799F0C]/20 bg-[#1E392A] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#799F0C] flex items-center justify-center shadow-lg text-2xl">
                🪘
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-[#A7C957]">
                    Sacred Indigenous Heritage
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold border border-white/20">
                    7 Tribes
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">The Bukidnon Cultural Passport</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tribal Drum Beat Rhythm Button */}
              <button
                onClick={toggleTribalBeat}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isTribalDrumming
                    ? 'bg-[#799F0C] text-white border-[#A7C957] shadow-lg shadow-[#799F0C]/40 animate-pulse'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
                title="Toggle Kaamulan Tribal Rhythm Beat"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isTribalDrumming ? 'Drum Beat: ON' : 'Tribal Beat'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#799F0C]/15 bg-[#F5F9E8] p-2 gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('tribes')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'tribes'
                  ? 'bg-[#1E392A] text-white shadow-md'
                  : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white/60'
              }`}
            >
              <span>🪶 The 7 Indigenous Tribes</span>
            </button>
            <button
              onClick={() => setActiveTab('kaamulan')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'kaamulan'
                  ? 'bg-[#1E392A] text-white shadow-md'
                  : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white/60'
              }`}
            >
              <span>🎭 Kaamulan Festival Lore</span>
            </button>
            <button
              onClick={() => setActiveTab('delicacies')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'delicacies'
                  ? 'bg-[#1E392A] text-white shadow-md'
                  : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white/60'
              }`}
            >
              <span>🍍 Flavors & Delicacies</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'tribes' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tribes Selector List */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-[#4A5A40] tracking-wider">
                    Select Tribe to Explore:
                  </span>
                  <div className="space-y-1.5">
                    {THE_SEVEN_TRIBES.map((tribe) => {
                      const isSelected = selectedTribe.id === tribe.id;
                      return (
                        <button
                          key={tribe.id}
                          onClick={() => {
                            setSelectedTribe(tribe);
                            soundscape.playInteractivePop();
                          }}
                          className={`w-full text-left p-3 rounded-2xl border transition-all text-xs flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1E392A] border-[#1E392A] text-white font-bold shadow-md'
                              : 'bg-white hover:bg-[#F5F9E8] border-[#799F0C]/15 text-[#2D3436]'
                          }`}
                        >
                          <span>{tribe.name}</span>
                          <span className={isSelected ? 'text-[#A7C957]' : 'text-[#799F0C]'}>➔</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Tribe Detail Card */}
                <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-[#799F0C]/20 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-[#799F0C]">
                        Ancestral Custodians
                      </span>
                      <h3 className="text-xl font-extrabold text-[#1E392A]">{selectedTribe.name}</h3>
                      <p className="text-xs text-[#4A5A40] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#799F0C]" />
                        {selectedTribe.territory}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#2D3436] leading-relaxed">
                    {selectedTribe.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#799F0C]/15 text-xs">
                    <div className="bg-[#F5F9E8] p-3 rounded-xl border border-[#799F0C]/15">
                      <span className="text-[10px] uppercase font-bold text-[#799F0C] flex items-center gap-1 mb-1">
                        <Music className="w-3.5 h-3.5 text-[#799F0C]" />
                        Sacred Instrument
                      </span>
                      <p className="font-semibold text-[#1E392A]">{selectedTribe.musicalInstrument}</p>
                    </div>

                    <div className="bg-[#FFF9EB] p-3 rounded-xl border border-[#FF9F1C]/20">
                      <span className="text-[10px] uppercase font-bold text-[#FF9F1C] flex items-center gap-1 mb-1">
                        <Shield className="w-3.5 h-3.5 text-[#FF9F1C]" />
                        Sacred Symbol
                      </span>
                      <p className="font-semibold text-[#1E392A]">{selectedTribe.sacredSymbol}</p>
                    </div>
                  </div>

                  <div className="bg-[#F5F9E8] p-3.5 rounded-2xl border border-[#799F0C]/25">
                    <span className="text-[10px] uppercase font-bold text-[#799F0C] flex items-center gap-1 mb-1">
                      <Award className="w-3.5 h-3.5 text-[#799F0C]" />
                      Distinct Cultural Tradition
                    </span>
                    <p className="text-xs text-[#2D3436] font-medium">{selectedTribe.distinctTradition}</p>
                  </div>

                  {selectedTribe.soilPaintingCraft && (
                    <div className="bg-[#FFF9EB] p-3.5 rounded-2xl border border-[#FF9F1C]/25">
                      <span className="text-[10px] uppercase font-bold text-[#FF9F1C] flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
                        Soil Art Mastery
                      </span>
                      <p className="text-xs text-[#2D3436]">{selectedTribe.soilPaintingCraft}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'kaamulan' && (
              <div className="space-y-5">
                <div className="relative rounded-3xl overflow-hidden bg-[#1E392A] p-6 text-white shadow-md border border-[#799F0C]/30">
                  <span className="px-3 py-1 rounded-full bg-[#799F0C] text-white font-bold text-xs uppercase tracking-wider">
                    The Only Authentic Ethnic Festival in the Philippines
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3">Kaamulan Festival</h3>
                  <p className="text-xs sm:text-sm text-stone-200 mt-2 max-w-xl leading-relaxed">
                    Held annually in Malaybalay City, Kaamulan gathers the 7 indigenous tribes of Bukidnon to perform sacred harvest rituals, peace pacts, and ancestral dances in authentic hand-woven regalia.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-2xl border border-[#799F0C]/15 shadow-xs">
                    <div className="text-xl mb-2">🥁</div>
                    <h4 className="font-bold text-[#1E392A] mb-1">Authentic Rituals</h4>
                    <p className="text-[#4A5A40] leading-relaxed">
                      Every chant, drum beat, and dance step is performed by native elders following uncompromised customary traditions.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#799F0C]/15 shadow-xs">
                    <div className="text-xl mb-2">🎨</div>
                    <h4 className="font-bold text-[#1E392A] mb-1">Sinukba Regalia</h4>
                    <p className="text-[#4A5A40] leading-relaxed">
                      Geometric red, black, and white embroidered costumes adorned with brass bells, wild feathers, and beadwork.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#799F0C]/15 shadow-xs">
                    <div className="text-xl mb-2">🕊️</div>
                    <h4 className="font-bold text-[#1E392A] mb-1">Tampuda hu Balagon</h4>
                    <p className="text-[#4A5A40] leading-relaxed">
                      The ancient rattan-cutting peace pact resolving historical disputes and uniting all highlands under shared harmony.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delicacies' && (
              <div className="space-y-4">
                <p className="text-xs text-[#4A5A40]">
                  Known as the "Food Basket of Mindanao", Bukidnon is famous for volcanic-soil organic produce and artisanal roasts:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BUKIDNON_DELICACIES.map((delicacy, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-2xl border border-[#799F0C]/15 shadow-xs flex items-start gap-3"
                    >
                      <div className="text-3xl p-2 rounded-2xl bg-[#F5F9E8] border border-[#799F0C]/20 flex-shrink-0">
                        {delicacy.icon}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#799F0C]">{delicacy.origin}</span>
                        <h4 className="text-sm font-bold text-[#1E392A] mt-0.5">{delicacy.name}</h4>
                        <p className="text-xs text-[#4A5A40] mt-1 leading-relaxed">{delicacy.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
