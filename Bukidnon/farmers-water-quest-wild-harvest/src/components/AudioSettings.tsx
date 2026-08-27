import React, { useState } from 'react';
import { X, Volume2, VolumeX, Play, Sliders, Sparkles, Radio } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface AudioSettingsProps {
  onClose: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ onClose }) => {
  const [masterVol, setMasterVol] = useState(0.85);
  const [ambientVol, setAmbientVol] = useState(0.45);
  const [sfxVol, setSfxVol] = useState(0.9);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  const handleMasterChange = (v: number) => {
    setMasterVol(v);
    soundEngine.setMasterVolume(v);
  };

  const handleAmbientChange = (v: number) => {
    setAmbientVol(v);
    soundEngine.setAmbientVolume(v);
  };

  const handleSfxChange = (v: number) => {
    setSfxVol(v);
    soundEngine.setSfxVolume(v);
  };

  const handleMuteToggle = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  };

  return (
    <div
      id="audio-settings-backdrop"
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        id="audio-settings-card"
        className="bg-[#0a0f0a] border border-emerald-500/40 w-full max-w-md p-6 text-emerald-50 shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden relative font-mono"
      >
        {/* Tactical Grid Background Overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-5 pb-4 border-b border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold">
                ACOUSTIC SENSORY BUS
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white italic">
                REALISTIC SOUND STUDIO
              </h2>
            </div>
          </div>

          <button
            id="close-audio-settings-btn"
            onClick={onClose}
            className="w-8 h-8 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="relative z-10 space-y-4 mb-5 text-xs">
          <div className="bg-black/60 p-3 border border-emerald-500/30">
            <div className="flex justify-between font-semibold text-emerald-300 mb-1.5 uppercase">
              <span>Master Sensory Gain</span>
              <span className="text-white font-bold">{Math.round(masterVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVol}
              onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div className="bg-black/60 p-3 border border-emerald-500/30">
            <div className="flex justify-between font-semibold text-cyan-300 mb-1.5 uppercase">
              <span>Wilderness Ambiance (Wind, Rain, Swamp)</span>
              <span className="text-white font-bold">{Math.round(ambientVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVol}
              onChange={(e) => handleAmbientChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="bg-black/60 p-3 border border-emerald-500/30">
            <div className="flex justify-between font-semibold text-amber-300 mb-1.5 uppercase">
              <span>Bio-SFX (Footsteps, Springs, Roars)</span>
              <span className="text-white font-bold">{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* Realistic Sound Test Grid */}
        <div className="relative z-10 bg-black/60 p-3.5 border border-emerald-500/30 mb-5">
          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> SENSORY PREVIEW CHANNELS
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => soundEngine.playWaterCollect()}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-left flex items-center gap-2 border border-emerald-500/30 transition text-slate-200"
            >
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
              <span className="text-[11px] truncate">💧 Water Fill</span>
            </button>

            <button
              onClick={() => soundEngine.playPlantBloom()}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-left flex items-center gap-2 border border-emerald-500/30 transition text-slate-200"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />
              <span className="text-[11px] truncate">🌱 Plant Bloom</span>
            </button>

            <button
              onClick={() => soundEngine.playAnimalSound('timber_wolf', 'alert')}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-left flex items-center gap-2 border border-emerald-500/30 transition text-slate-200"
            >
              <Play className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-[11px] truncate">🐺 Wolf Howl</span>
            </button>

            <button
              onClick={() => soundEngine.playAnimalSound('grizzly_bear', 'alert')}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-left flex items-center gap-2 border border-emerald-500/30 transition text-slate-200"
            >
              <Play className="w-3 h-3 text-red-400 fill-red-400 shrink-0" />
              <span className="text-[11px] truncate">🐻 Bear Roar</span>
            </button>

            <button
              onClick={() => soundEngine.playFootstep('mud', true)}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-left flex items-center gap-2 border border-emerald-500/30 transition text-slate-200"
            >
              <Play className="w-3 h-3 text-orange-400 fill-orange-400 shrink-0" />
              <span className="text-[11px] truncate">🐾 Mud Step</span>
            </button>

            <button
              onClick={() => soundEngine.playFlareIgnite()}
              className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-left flex items-center gap-2 border border-emerald-500/30 transition text-slate-200"
            >
              <Play className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
              <span className="text-[11px] truncate">🔥 Flare Strike</span>
            </button>
          </div>
        </div>

        {/* Footer Mute Button */}
        <button
          onClick={handleMuteToggle}
          className={`relative z-10 w-full py-2.5 font-mono font-bold text-xs flex items-center justify-center gap-2 transition border uppercase tracking-wider ${
            isMuted
              ? 'bg-red-950/80 hover:bg-red-900/80 text-red-300 border-red-500/60'
              : 'bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_#10b981]'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isMuted ? 'TRANSMITTER MUTED (CLICK TO ACTIVATE)' : 'ACOUSTIC AUDIO ONLINE'}</span>
        </button>
      </div>
    </div>
  );
};
