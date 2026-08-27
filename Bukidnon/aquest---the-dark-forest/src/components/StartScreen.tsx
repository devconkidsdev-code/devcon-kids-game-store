import React, { useState, useRef } from 'react';
import { Play, Shield, Compass, Eye, Sparkles, Clock, Home, Skull, Volume2, Upload, Check } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customInfo, setCustomInfo] = useState(soundEngine.getCustomJumpscareInfo());
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Loading...');
    const success = await soundEngine.setCustomJumpscareAudio(file, file.name);
    if (success) {
      setCustomInfo(soundEngine.getCustomJumpscareInfo());
      setUploadStatus('Loaded!');
      setTimeout(() => setUploadStatus(null), 2500);
      soundEngine.playJumpscare();
    } else {
      setUploadStatus('Failed format');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleTestJumpscare = () => {
    soundEngine.init();
    soundEngine.playJumpscare();
  };

  return (
    <div id="start-screen" className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 z-40 text-neutral-100 overflow-y-auto">
      {/* Background eerie gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.15)_0%,rgba(0,0,0,0.95)_70%)] pointer-events-none" />

      {/* Main card */}
      <div className="relative max-w-xl w-full flex flex-col items-center text-center space-y-5 bg-neutral-950/80 p-7 rounded-2xl border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-['VT323',monospace] text-xl tracking-widest uppercase">
            <span>●</span> THE HORROR QUEST <span>●</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-red-600 font-['Creepster',cursive] tracking-wider drop-shadow-[0_4px_16px_rgba(220,38,38,0.6)] animate-pulse">
            AQUEST
          </h1>
          <p className="text-neutral-400 font-['VT323',monospace] text-2xl tracking-wide">
            Escape the shadows of the cursed forest
          </p>
        </div>

        {/* Story / Concept Brief */}
        <div className="bg-neutral-900/90 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-300 text-left space-y-2 leading-relaxed">
          <p className="font-semibold text-amber-300 flex items-center gap-2 text-base font-['VT323',monospace] text-xl">
            <Compass className="w-5 h-5 text-amber-400 inline" /> OBJECTIVE & SURVIVAL
          </p>
          <p>
            You are a lost boy in a blue shirt with a flashlight. Locate each <span className="text-cyan-400 font-bold">Holy Water Bucket</span> in the forest and <span className="text-amber-300 font-bold">deliver it safely back to the House</span> within the <span className="text-red-400 font-bold">5-Minute limit</span>.
          </p>
          <div className="space-y-1.5 text-xs pt-1.5 border-t border-neutral-800/80">
            <p className="text-cyan-300/90 flex items-start gap-2">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Stealth Flashlight:</strong> The creatures <em>cannot locate you in the dark</em> unless you shine your flashlight on them or expose yourself! Toggle light with [F] to sneak past.</span>
            </p>
            <p className="text-red-400/90 flex items-start gap-2">
              <Skull className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span><strong>Multiplying Horrors:</strong> Stalkers multiply with every level cleared (1 in Stage 1, up to 5 in Stage 5). Beware terrifying jumpscares if caught!</span>
            </p>
            <p className="text-amber-400/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Creature Stamina:</strong> Creatures burn stamina when chasing you. When exhausted, they stop to rest and breathe, giving you time to escape.</span>
            </p>
          </div>
        </div>

        {/* Jumpscare Audio Customizer Row */}
        <div className="w-full bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex items-center justify-between text-left gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Skull className="w-4 h-4 text-red-500 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-['VT323',monospace] text-base text-neutral-300 font-semibold flex items-center gap-1.5">
                <span>CAPTURED JUMPSCARE SOUND:</span>
                <span className="text-neutral-400 truncate max-w-[140px] font-normal">{customInfo.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-['VT323',monospace] text-sm rounded-lg border border-neutral-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-cyan-400" />
              <span>{uploadStatus || 'Change Sound'}</span>
            </button>
            <button
              type="button"
              onClick={handleTestJumpscare}
              className="py-1 px-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-['VT323',monospace] text-sm rounded-lg border border-red-800/80 transition flex items-center gap-1 cursor-pointer"
              title="Test Jumpscare Audio"
            >
              <Volume2 className="w-3 h-3" />
              <span>TEST</span>
            </button>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full text-xs">
          <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col items-center">
            <span className="font-['VT323',monospace] text-lg text-amber-400">W / A / S / D</span>
            <span className="text-neutral-400 text-[11px]">Move Boy</span>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col items-center">
            <span className="font-['VT323',monospace] text-lg text-amber-400">MOUSE</span>
            <span className="text-neutral-400 text-[11px]">Aim Flashlight</span>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col items-center">
            <span className="font-['VT323',monospace] text-lg text-amber-400">F KEY</span>
            <span className="text-neutral-400 text-[11px]">Toggle Light</span>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col items-center">
            <span className="font-['VT323',monospace] text-lg text-amber-400">P / ESC</span>
            <span className="text-neutral-400 text-[11px]">Pause Menu</span>
          </div>
        </div>

        {/* Begin Quest CTA Button */}
        <button
          id="btn-begin-quest"
          onClick={onStart}
          className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-2xl font-bold font-['VT323',monospace] tracking-wider text-black bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play className="w-6 h-6 mr-2 fill-current" />
          <span>BEGIN THE QUEST</span>
        </button>

        {/* Footer Hint */}
        <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-neutral-400" /> 3 Lives</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-amber-400" /> Deliver to House</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-400" /> 5-Min Timer</span>
        </div>
      </div>
    </div>
  );
};
