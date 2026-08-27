import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home, Music, Upload, Check, Skull } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface PauseModalProps {
  onResume: () => void;
  onRestartLevel: () => void;
  onMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartLevel,
  onMainMenu,
  isMuted,
  onToggleMute,
}) => {
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
      // Play a quick preview test
      soundEngine.playJumpscare();
    } else {
      setUploadStatus('Failed (Unsupported format)');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleTestJumpscare = () => {
    soundEngine.init();
    soundEngine.playJumpscare();
  };

  const handleResetSound = () => {
    soundEngine.resetJumpscareAudio();
    setCustomInfo(soundEngine.getCustomJumpscareInfo());
  };

  return (
    <div id="pause-modal" className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in select-none">
      <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 p-6 rounded-2xl shadow-2xl text-center space-y-5">
        <h2 className="text-4xl font-['Creepster',cursive] text-neutral-200 tracking-wider">
          GAME PAUSED
        </h2>

        {/* Custom Jumpscare Audio Panel */}
        <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-['VT323',monospace] text-base text-neutral-300">
              <Skull className="w-4 h-4 text-red-500" />
              <span className="font-bold text-red-400">JUMPSCARE SOUND (CAPTURED)</span>
            </div>
            {customInfo.hasCustom && (
              <span className="text-[10px] bg-red-950/80 border border-red-700/60 text-red-300 px-2 py-0.5 rounded flex items-center gap-1 font-['VT323',monospace] text-xs">
                <Check className="w-3 h-3 text-emerald-400" /> Custom Active
              </span>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 leading-tight">
            Active sound: <span className="text-neutral-200 font-semibold">{customInfo.name}</span>
          </p>

          <div className="flex items-center gap-2 pt-1">
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
              className="flex-1 py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-['VT323',monospace] text-base rounded-lg border border-neutral-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{uploadStatus || 'Load Audio File'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestJumpscare}
              className="py-1.5 px-3 bg-red-950/80 hover:bg-red-900/90 text-red-300 text-xs font-['VT323',monospace] text-base rounded-lg border border-red-800/80 transition flex items-center gap-1 cursor-pointer"
              title="Test Jumpscare Audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>TEST SOUND</span>
            </button>

            {customInfo.hasCustom && (
              <button
                type="button"
                onClick={handleResetSound}
                className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-[10px] font-['VT323',monospace] text-sm rounded-lg transition"
                title="Reset to Default Screech"
              >
                RESET
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            id="btn-pause-resume"
            onClick={onResume}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-black font-bold font-['VT323',monospace] text-2xl rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            id="btn-pause-mute"
            onClick={onToggleMute}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-['VT323',monospace] text-xl rounded-xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          <button
            id="btn-pause-restart"
            onClick={onRestartLevel}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-['VT323',monospace] text-xl rounded-xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RESTART STAGE</span>
          </button>

          <button
            id="btn-pause-menu"
            onClick={onMainMenu}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-['VT323',monospace] text-xl rounded-xl border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

