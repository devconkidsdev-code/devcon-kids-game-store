import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Volume2, VolumeX, Music, X, RotateCcw, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onResetProgress,
}) => {
  const [sfxMuted, setSfxMuted] = useState(soundManager.isMutedState());
  const [musicMuted, setMusicMuted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleSfx = () => {
    const next = !sfxMuted;
    setSfxMuted(next);
    soundManager.setMuted(next);
  };

  const toggleMusic = () => {
    const next = !musicMuted;
    setMusicMuted(next);
    if (next) {
      soundManager.stopMusic();
    } else {
      soundManager.startMusic('village');
    }
  };

  const handleTestSound = () => {
    soundManager.playDrop();
    setTimeout(() => soundManager.playMoo(), 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-sky-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-800 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">Game Settings</h2>
              <p className="text-xs text-slate-500">Audio, Controls & Preferences</p>
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

        {/* Options List */}
        <div className="space-y-3.5 my-4">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-sky-600" />
              <div>
                <h4 className="text-xs font-black text-slate-800">Sound Effects (SFX)</h4>
                <span className="text-[10px] text-slate-500">Water drops, moo, repairs, pops</span>
              </div>
            </div>
            <button
              onClick={toggleSfx}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                !sfxMuted ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {!sfxMuted ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Music className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="text-xs font-black text-slate-800">Adaptive Soundtrack</h4>
                <span className="text-[10px] text-slate-500">Procedural cozy synthesizer chimes</span>
              </div>
            </div>
            <button
              onClick={toggleMusic}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                !musicMuted ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {!musicMuted ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Test Sound Button */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Audio Synth Test</span>
            <button
              onClick={handleTestSound}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-sky-700 font-black text-xs rounded-xl border border-slate-200 cursor-pointer"
            >
              Play Test Chime
            </button>
          </div>

          {/* Reset Save Data */}
          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-rose-950">Reset Game Progress</h4>
                <span className="text-[10px] text-rose-700 block">Clear saved stars and resources</span>
              </div>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Reset
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2 py-1 bg-red-700 text-white font-black text-xs rounded-lg cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
