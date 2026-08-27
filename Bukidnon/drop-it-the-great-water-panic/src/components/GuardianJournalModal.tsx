import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, X, Lock, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { ALL_JOURNAL_ENTRIES } from '../data/journalData';
import { JournalCategory } from '../types/game';
import { soundManager } from '../utils/audio';

interface GuardianJournalModalProps {
  unlockedLevelMax: number;
  onClose: () => void;
}

export const GuardianJournalModal: React.FC<GuardianJournalModalProps> = ({
  unlockedLevelMax,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<typeof ALL_JOURNAL_ENTRIES[0] | null>(null);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Lessons', icon: '📚' },
    { id: 'leaks_and_waste', label: 'Leaks & Waste', icon: '🔧' },
    { id: 'groundwater_and_wells', label: 'Groundwater', icon: '🌊' },
    { id: 'river_and_pollution', label: 'Rivers & Pollution', icon: '🐟' },
    { id: 'farming_and_food', label: 'Sustainable Farming', icon: '🌾' },
    { id: 'rainwater_and_climate', label: 'Rain & Climate', icon: '🌧️' },
    { id: 'city_and_global', label: 'Urban & Global', icon: '🏙️' },
  ];

  const filteredEntries = ALL_JOURNAL_ENTRIES.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.realWorldFact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-emerald-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Guardian Bloop’s Water Knowledge Journal
              </h2>
              <p className="text-xs text-slate-500">
                100 Real-World Science & Conservation Lessons ({unlockedLevelMax} / 100 Unlocked)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="my-3 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search facts and tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                <span>{cat.icon} </span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Entry List + Detail View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 overflow-y-auto pr-1">
          {/* List of Entries */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredEntries.map((entry) => {
              const isUnlocked = entry.levelId <= unlockedLevelMax;
              const isSelected = selectedEntry?.id === entry.id;

              return (
                <button
                  key={entry.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedEntry(entry);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                      : isUnlocked
                      ? 'bg-white border-slate-200 hover:border-emerald-300'
                      : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      {entry.icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-700">
                        Lesson #{entry.levelId}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-1">
                        {isUnlocked ? entry.title : 'Locked Conservation Lesson'}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {isUnlocked ? entry.summary : `Complete Level ${entry.levelId} to unlock!`}
                      </p>
                    </div>
                  </div>

                  {!isUnlocked && <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>

          {/* Detailed Entry Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
            {selectedEntry && selectedEntry.levelId <= unlockedLevelMax ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    {selectedEntry.icon}
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700">
                      Lesson #{selectedEntry.levelId} • {selectedEntry.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {selectedEntry.title}
                    </h3>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedEntry.summary}
                </div>

                {/* Real World Scientific Fact */}
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <span className="text-[10px] font-black uppercase text-sky-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Real-World Hydrology Fact
                  </span>
                  <p className="text-xs text-sky-950 font-semibold mt-1">
                    {selectedEntry.realWorldFact}
                  </p>
                </div>

                {/* Actionable Bloop Tip */}
                <div className="p-3 bg-emerald-100/70 rounded-xl border border-emerald-300">
                  <span className="text-[10px] font-black uppercase text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Bloop’s Home Action Tip
                  </span>
                  <p className="text-xs text-emerald-950 font-bold mt-1">
                    {selectedEntry.actionableTip}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <BookOpen className="w-12 h-12 mb-2 text-slate-300" />
                <p className="text-xs font-bold">
                  Select an unlocked lesson on the left to read real-world water science!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
