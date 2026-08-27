import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CuratedItinerary, Landmark, AIGeneratedItinerary, AIPrefsForm } from '../types';
import { CURATED_ITINERARIES, BUKIDNON_LANDMARKS } from '../data/bukidnonData';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Navigation, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  ChevronRight, 
  Compass, 
  Route,
  ArrowRight,
  Bot,
  Zap,
  Coffee,
  Mountain,
  Flame,
  Tent,
  Heart,
  DollarSign,
  Info,
  RefreshCw,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Utensils
} from 'lucide-react';
import { soundscape } from '../utils/soundscape';

interface TripPlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItinerary: CuratedItinerary | null;
  onSelectItinerary: (itinerary: CuratedItinerary | null) => void;
  customSavedLandmarkIds: string[];
  onRemoveFromCustom: (landmarkId: string) => void;
  onSelectLandmark: (landmark: Landmark) => void;
  onOpenBookingForItinerary: (title: string, landmarks: Landmark[]) => void;
}

const TRAVEL_STYLES = [
  { id: 'Adventure & Thrills', label: 'Adventure & Ziplines', icon: Zap, desc: 'Dahilayan dual zipline, alpine coaster & Atugan canyon' },
  { id: 'Trekking & Peaks', label: 'Mountain Peaks & Ridges', icon: Mountain, desc: 'Mt. Kitanglad, Capistrano crags & sea-of-clouds ridges' },
  { id: 'Tribal & Culture', label: '7 Tribes & Heritage', icon: Sparkles, desc: 'Talaandig soil painting, Kaamulan park & Locsin monastery' },
  { id: 'Coffee & Nature Chill', label: 'Highland Coffee & Lakes', icon: Coffee, desc: 'Arabica coffee trails, Lake Apo balsa & pine cafes' },
  { id: 'Agro-Farms & Family', label: 'Agro-Farms & Ranches', icon: Tent, desc: 'Del Monte pineapples, Impasug-ong ranch & BAFF organic farm' },
  { id: 'Romantic Escapade', label: 'Romantic Mountain Escape', icon: Heart, desc: 'Sunset lakes, quiet pine chalets & starlit glamping' },
];

export function TripPlannerDrawer({
  isOpen,
  onClose,
  selectedItinerary,
  onSelectItinerary,
  customSavedLandmarkIds,
  onRemoveFromCustom,
  onSelectLandmark,
  onOpenBookingForItinerary,
}: TripPlannerDrawerProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'curated' | 'custom'>('ai');

  // AI Planner Form State
  const [aiForm, setAiForm] = useState<AIPrefsForm>({
    durationDays: 3,
    travelStyle: 'Adventure & Thrills',
    startPoint: 'Cagayan de Oro (North Gateway via Sayre Highway)',
    pace: 'Balanced',
    budget: 'Moderate (₱5,000 - ₱7,500)',
    groupType: 'Friends / Adventurers',
    specialNotes: '',
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [aiResult, setAiResult] = useState<AIGeneratedItinerary | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const customLandmarks = customSavedLandmarkIds
    .map((id) => BUKIDNON_LANDMARKS.find((l) => l.id === id))
    .filter(Boolean) as Landmark[];

  // Call the server OpenRouter AI endpoint
  const handleGenerateAITrip = async () => {
    try {
      setIsGeneratingAI(true);
      setGenerationStep(1);
      soundscape.playInteractivePop();

      const stepTimer1 = setTimeout(() => setGenerationStep(2), 700);
      const stepTimer2 = setTimeout(() => setGenerationStep(3), 1400);

      const response = await fetch('/api/ai-trip-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays: aiForm.durationDays,
          travelStyle: aiForm.travelStyle,
          startPoint: aiForm.startPoint,
          pace: aiForm.pace,
          budget: aiForm.budget,
          groupType: aiForm.groupType,
          specialNotes: aiForm.specialNotes,
          mustVisitLandmarkIds: customSavedLandmarkIds,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        throw new Error('Failed to generate AI itinerary');
      }

      const data = await response.json();
      if (data.success && data.itinerary) {
        setAiResult(data.itinerary);
        setExpandedDay(1);
        soundscape.playEagleCall();
      }
    } catch (err) {
      console.error('AI Generation error:', err);
    } finally {
      setIsGeneratingAI(false);
      setGenerationStep(0);
    }
  };

  // Plot AI itinerary on the map
  const handlePlotAIOnMap = () => {
    if (!aiResult) return;
    const aiCurated: CuratedItinerary = {
      id: `ai_${Date.now()}`,
      title: aiResult.title,
      durationDays: aiResult.durationDays,
      difficulty: aiResult.difficulty,
      description: aiResult.tagline,
      landmarkIds: aiResult.curatedLandmarkIds,
      recommendedSeason: aiResult.recommendedSeason,
      tags: ['AI-Planned', aiForm.travelStyle, `${aiResult.durationDays} Days`],
    };
    onSelectItinerary(aiCurated);
    soundscape.playInteractivePop();
  };

  // Convert AI landmarks to real landmark objects for booking
  const handleBookAITour = () => {
    if (!aiResult) return;
    const bookedLandmarks = aiResult.curatedLandmarkIds
      .map((id) => BUKIDNON_LANDMARKS.find((l) => l.id === id))
      .filter(Boolean) as Landmark[];

    onOpenBookingForItinerary(aiResult.title, bookedLandmarks);
  };

  const handleShareOrCopy = () => {
    if (!aiResult) return;
    const summaryText = `🌲 ${aiResult.title} 🌲\n${aiResult.tagline}\n\nDuration: ${aiResult.durationDays} Days\nBudget: ${aiResult.estimatedTotalCostPerPerson}\n\nDays Breakdown:\n` +
      aiResult.days.map((d) => `Day ${d.day}: ${d.dayTitle}\n` + d.stops.map((s) => `• ${s.timeSlot}: ${s.landmarkTitle} (${s.municipality})`).join('\n')).join('\n\n') +
      `\n\nCurated with Bukidnon Interactive AI Explorer`;

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Slide-over Drawer Right */}
        <motion.div
          id="trip-planner-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#FDFCF0] border-l border-[#799F0C]/20 shadow-2xl flex flex-col z-10 text-[#2D3436]"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#799F0C]/20 flex items-center justify-between bg-[#1E392A] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#799F0C] flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white leading-none">Highlands Trip Architect</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF9F1C] text-white text-[9px] font-extrabold tracking-wider uppercase">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-[#A7C957] mt-1">OpenRouter AI & Smart Sayre Highway Itinerary Engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs (AI Generator vs Curated vs Custom) */}
          <div className="flex border-b border-[#799F0C]/15 bg-[#F5F9E8] p-2 gap-1.5">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-[#1E392A] text-white shadow-md'
                  : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#FF9F1C]" />
              <span>AI Trip Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('curated')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'curated'
                  ? 'bg-[#1E392A] text-white shadow-md'
                  : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#799F0C]" />
              <span>Curated ({CURATED_ITINERARIES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-[#1E392A] text-white shadow-md'
                  : 'text-[#4A5A40] hover:text-[#1E392A] hover:bg-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#799F0C]" />
              <span>Custom ({customLandmarks.length})</span>
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'ai' ? (
              <div className="space-y-5">
                {/* AI Configurator Form Card */}
                {!aiResult || isGeneratingAI ? (
                  <div className="p-5 rounded-3xl bg-white border border-[#799F0C]/25 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#F5F9E8] text-[#799F0C]">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-[#1E392A] uppercase tracking-wider">
                          Personalize Your Bukidnon Expedition
                        </h3>
                        <p className="text-[11px] text-[#4A5A40]">Powered by OpenRouter LLM & Real Topography</p>
                      </div>
                    </div>

                    {/* Duration Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-[#1E392A] mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#799F0C]" />
                          Trip Duration:
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#F5F9E8] text-[#799F0C] font-extrabold text-xs border border-[#799F0C]/25">
                          {aiForm.durationDays} Days / {aiForm.durationDays - 1} Nights
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={aiForm.durationDays}
                        onChange={(e) => setAiForm({ ...aiForm, durationDays: Number(e.target.value) })}
                        className="w-full h-2 bg-[#F5F9E8] rounded-lg appearance-none cursor-pointer accent-[#799F0C]"
                      />
                      <div className="flex justify-between text-[10px] text-[#4A5A40] mt-1 font-semibold">
                        <span>1 Day (Express)</span>
                        <span>3 Days (Classic Loop)</span>
                        <span>5 Days (Grand Expedition)</span>
                      </div>
                    </div>

                    {/* Travel Style Grid */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E392A] mb-2">
                        Choose Your Travel Style:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {TRAVEL_STYLES.map((style) => {
                          const Icon = style.icon;
                          const isSelected = aiForm.travelStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setAiForm({ ...aiForm, travelStyle: style.id })}
                              className={`p-2.5 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-[#F5F9E8] border-[#799F0C] ring-1 ring-[#799F0C]/40 text-[#1E392A]'
                                  : 'bg-white hover:bg-[#FDFCF0] border-[#799F0C]/20 text-[#4A5A40]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#799F0C]' : 'text-[#636E72]'}`} />
                                <span className="text-xs font-extrabold leading-tight">{style.label}</span>
                              </div>
                              <p className="text-[10px] text-[#636E72] line-clamp-1 leading-snug">{style.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Starting Point & Gateway */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1E392A] mb-1">
                          Arrival Gateway:
                        </label>
                        <select
                          value={aiForm.startPoint}
                          onChange={(e) => setAiForm({ ...aiForm, startPoint: e.target.value })}
                          className="w-full text-xs p-2 rounded-xl bg-[#F5F9E8] border border-[#799F0C]/25 text-[#1E392A] font-semibold focus:outline-none focus:border-[#799F0C]"
                        >
                          <option value="Cagayan de Oro (North Gateway via Sayre Highway)">CDO / North Gateway</option>
                          <option value="Davao City (South Gateway via BuDa Highway)">Davao / BuDa South</option>
                          <option value="Malaybalay City (Central Bukidnon Local Hub)">Malaybalay (Central Hub)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1E392A] mb-1">
                          Travel Pace:
                        </label>
                        <select
                          value={aiForm.pace}
                          onChange={(e) => setAiForm({ ...aiForm, pace: e.target.value })}
                          className="w-full text-xs p-2 rounded-xl bg-[#F5F9E8] border border-[#799F0C]/25 text-[#1E392A] font-semibold focus:outline-none focus:border-[#799F0C]"
                        >
                          <option value="Relaxed & Scenic">Relaxed & Scenic (1-2 stops/day)</option>
                          <option value="Balanced">Balanced (2-3 stops/day)</option>
                          <option value="Fast-Paced Action">Action-Packed (3-4 stops/day)</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Notes / Specific Wishes */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#1E392A] mb-1">
                        Specific Wishes or Diet/Interests (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Must include pine-view cafes, tribal soil painting, and cold springs"
                        value={aiForm.specialNotes}
                        onChange={(e) => setAiForm({ ...aiForm, specialNotes: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl bg-[#F5F9E8] border border-[#799F0C]/25 text-[#1E392A] placeholder:text-[#636E72]/60 focus:outline-none focus:border-[#799F0C]"
                      />
                    </div>

                    {/* Generate Button */}
                    <button
                      disabled={isGeneratingAI}
                      onClick={handleGenerateAITrip}
                      className="w-full py-3.5 rounded-2xl bg-[#1E392A] hover:bg-[#2D3436] text-white font-extrabold text-xs shadow-md shadow-[#1E392A]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FF9F1C]" />
                          <span>
                            {generationStep === 1 && 'Consulting OpenRouter Highlands AI...'}
                            {generationStep === 2 && 'Calculating Sayre Highway travel times...'}
                            {generationStep === 3 && 'Synthesizing authentic Bukidnon route...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#FF9F1C]" />
                          <span>Generate Custom AI Itinerary</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : null}

                {/* AI GENERATED RESULT VIEW */}
                {aiResult && !isGeneratingAI && (
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1E392A] to-[#2D3436] text-white shadow-lg space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#799F0C] text-white text-[10px] font-extrabold tracking-wide uppercase">
                              {aiResult.durationDays} Days • {aiResult.difficulty}
                            </span>
                            <span className="text-[10px] text-[#A7C957] font-semibold">
                              Est: {aiResult.estimatedTotalCostPerPerson}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-white leading-snug">
                            {aiResult.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => setAiResult(null)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                          title="Generate a new custom AI route"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>New</span>
                        </button>
                      </div>

                      <p className="text-xs text-[#F5F9E8] leading-relaxed">
                        {aiResult.tagline}
                      </p>

                      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-[#A7C957]">
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-[#FF9F1C]" />
                          {aiResult.generatedBy}
                        </span>
                        <span className="text-white/80">{aiResult.recommendedSeason}</span>
                      </div>
                    </div>

                    {/* Action Bar (Plot on Map, Book, Share) */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={handlePlotAIOnMap}
                        className="py-2.5 px-3 rounded-xl bg-[#799F0C] hover:bg-[#688a09] text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Plot on Map</span>
                      </button>

                      <button
                        onClick={handleBookAITour}
                        className="py-2.5 px-3 rounded-xl bg-[#1E392A] hover:bg-[#2D3436] text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FF9F1C]" />
                        <span>Book Tour</span>
                      </button>

                      <button
                        onClick={handleShareOrCopy}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#F5F9E8] text-[#1E392A] border border-[#799F0C]/25 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#799F0C]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-[#4A5A40]" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Weather & Highlands Advisory */}
                    <div className="p-3.5 rounded-2xl bg-[#FFF9EB] border border-[#FF9F1C]/30 text-xs text-[#2D3436] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#FF9F1C] font-bold text-[11px]">
                        <Info className="w-3.5 h-3.5" />
                        <span>Highland Weather & Packing Advisory:</span>
                      </div>
                      <p className="text-[11px] text-[#4A5A40] leading-relaxed">
                        {aiResult.weatherAdvisory}
                      </p>
                    </div>

                    {/* Days Accordion */}
                    <div className="space-y-3">
                      {aiResult.days.map((day) => {
                        const isDayOpen = expandedDay === day.day;
                        return (
                          <div
                            key={day.day}
                            className="rounded-2xl border border-[#799F0C]/25 bg-white shadow-xs overflow-hidden transition-all"
                          >
                            {/* Day Header Toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedDay(isDayOpen ? 0 : day.day)}
                              className="w-full p-3.5 flex items-center justify-between bg-[#F5F9E8] hover:bg-[#edf5db] transition-colors text-left"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-xl bg-[#799F0C] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                                  D{day.day}
                                </span>
                                <div>
                                  <h4 className="text-xs font-extrabold text-[#1E392A]">
                                    {day.dayTitle}
                                  </h4>
                                  <p className="text-[10px] text-[#4A5A40]">{day.areaFocus}</p>
                                </div>
                              </div>
                              {isDayOpen ? (
                                <ChevronUp className="w-4 h-4 text-[#4A5A40]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#4A5A40]" />
                              )}
                            </button>

                            {/* Day Stops Timeline */}
                            {isDayOpen && (
                              <div className="p-4 space-y-4 divide-y divide-[#799F0C]/15">
                                {day.stops.map((stop, sIdx) => {
                                  const matchingLandmark = BUKIDNON_LANDMARKS.find(
                                    (l) => l.id === stop.landmarkId || l.title.toLowerCase().includes(stop.landmarkTitle.toLowerCase())
                                  );

                                  return (
                                    <div key={sIdx} className={`space-y-2 ${sIdx > 0 ? 'pt-3' : ''}`}>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 rounded-md bg-[#1E392A] text-white text-[10px] font-bold">
                                            {stop.timeSlot}
                                          </span>
                                          <span className="text-xs font-extrabold text-[#1E392A]">
                                            {stop.landmarkTitle}
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-semibold text-[#799F0C]">
                                          {stop.municipality}
                                        </span>
                                      </div>

                                      <p className="text-xs text-[#2D3436] leading-relaxed">
                                        {stop.activityDescription}
                                      </p>

                                      {/* Practical Tips & Delicacies */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                        <div className="flex items-start gap-1.5 p-2 rounded-xl bg-[#F5F9E8] border border-[#799F0C]/15 text-[#1E392A]">
                                          <Utensils className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0 mt-0.5" />
                                          <div>
                                            <span className="font-bold text-[10px] block text-[#4A5A40]">Must-Try Food:</span>
                                            <span>{stop.mealRecommendation}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-start gap-1.5 p-2 rounded-xl bg-[#F5F9E8] border border-[#799F0C]/15 text-[#1E392A]">
                                          <Sparkles className="w-3.5 h-3.5 text-[#799F0C] shrink-0 mt-0.5" />
                                          <div>
                                            <span className="font-bold text-[10px] block text-[#4A5A40]">Travel Tip & Fee:</span>
                                            <span>{stop.travelTip} ({stop.entranceFee})</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Direct Map Focus button */}
                                      {matchingLandmark && (
                                        <button
                                          onClick={() => onSelectLandmark(matchingLandmark)}
                                          className="text-[11px] font-bold text-[#799F0C] hover:text-[#1E392A] flex items-center gap-1 pt-1 group"
                                        >
                                          <span>Locate {matchingLandmark.title} on Illustrated Map</span>
                                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Packing Checklist */}
                    <div className="p-4 rounded-2xl bg-white border border-[#799F0C]/20 shadow-xs space-y-2">
                      <span className="text-xs font-extrabold text-[#1E392A] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#799F0C]" />
                        Recommended Highlands Gear & Packing:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#4A5A40]">
                        {aiResult.packingAdvice.map((item, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-[#799F0C] font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'curated' ? (
              <div className="space-y-4">
                <p className="text-xs text-[#4A5A40] leading-relaxed">
                  Select a curated trail to highlight the sequential road route directly on your animated Bukidnon map:
                </p>

                {CURATED_ITINERARIES.map((itinerary) => {
                  const isSelected = selectedItinerary?.id === itinerary.id;
                  const itineraryLandmarks = itinerary.landmarkIds
                    .map((id) => BUKIDNON_LANDMARKS.find((l) => l.id === id))
                    .filter(Boolean) as Landmark[];

                  return (
                    <div
                      key={itinerary.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? 'bg-white border-[#799F0C] shadow-lg ring-1 ring-[#799F0C]/30'
                          : 'bg-white hover:bg-[#F5F9E8] border-[#799F0C]/20 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-[#F5F9E8] text-[#799F0C] text-[10px] font-bold border border-[#799F0C]/20">
                              {itinerary.durationDays} Days / {itinerary.durationDays - 1} Nights
                            </span>
                            <span className="text-[10px] text-[#4A5A40]">
                              {itinerary.difficulty}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-[#1E392A]">{itinerary.title}</h3>
                        </div>
                      </div>

                      <p className="text-xs text-[#2D3436] mt-2 leading-relaxed">
                        {itinerary.description}
                      </p>

                      {/* Stops Timeline Preview */}
                      <div className="mt-3 pt-3 border-t border-[#799F0C]/15 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-[#4A5A40] tracking-wider">
                          Itinerary Stops ({itineraryLandmarks.length} Destinations):
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {itineraryLandmarks.map((lm, idx) => (
                            <div
                              key={lm.id}
                              onClick={() => onSelectLandmark(lm)}
                              className="flex items-center justify-between p-2 rounded-xl bg-[#F5F9E8] hover:bg-white border border-[#799F0C]/15 hover:border-[#799F0C]/40 cursor-pointer group transition-all text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#799F0C] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                                  {idx + 1}
                                </span>
                                <span className="font-semibold text-[#1E392A] group-hover:text-[#799F0C]">
                                  {lm.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#4A5A40]">{lm.municipalityName}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Itinerary Action Buttons */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              onSelectItinerary(null);
                            } else {
                              onSelectItinerary(itinerary);
                              soundscape.playInteractivePop();
                            }
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#799F0C] text-white border-[#799F0C] shadow-sm'
                              : 'bg-[#F5F9E8] hover:bg-white text-[#1E392A] border-[#799F0C]/25'
                          }`}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Route Active on Map ✓' : 'Plot on Map'}</span>
                        </button>

                        <button
                          onClick={() => onOpenBookingForItinerary(itinerary.title, itineraryLandmarks)}
                          className="py-2 px-3 rounded-xl bg-[#1E392A] hover:bg-[#2D3436] text-white text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <span>Book Full Tour</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#A7C957]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {customLandmarks.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-3xl bg-white border border-dashed border-[#799F0C]/30 shadow-2xs">
                    <MapPin className="w-10 h-10 text-[#799F0C] mx-auto mb-3 opacity-60" />
                    <h3 className="text-sm font-extrabold text-[#1E392A]">Your Custom Trip is Empty</h3>
                    <p className="text-xs text-[#4A5A40] mt-1 max-w-xs mx-auto">
                      Click any landmark on the illustrated map and select "Save to Trip" to build your personalized Bukidnon route.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#4A5A40]">
                        {customLandmarks.length} landmarks plotted in sequence:
                      </span>
                    </div>

                    <div className="space-y-2">
                      {customLandmarks.map((lm, idx) => (
                        <div
                          key={lm.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#799F0C]/20 shadow-xs group"
                        >
                          <div
                            onClick={() => onSelectLandmark(lm)}
                            className="flex items-center gap-2.5 cursor-pointer flex-1"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#799F0C] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-extrabold text-[#1E392A] group-hover:text-[#799F0C] transition-colors">
                                {lm.title}
                              </h4>
                              <p className="text-[10px] text-[#4A5A40]">{lm.municipalityName} • {lm.elevation}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveFromCustom(lm.id)}
                            className="p-1.5 text-[#636E72] hover:text-[#BC4749] hover:bg-[#F5F9E8] rounded-lg transition-colors"
                            title="Remove from custom route"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onOpenBookingForItinerary('My Custom Bukidnon Expedition', customLandmarks)}
                      className="w-full py-3.5 rounded-2xl bg-[#799F0C] hover:bg-[#688a09] text-white font-extrabold text-xs shadow-md shadow-[#799F0C]/25 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Request Custom Guide & Travel Voucher</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
