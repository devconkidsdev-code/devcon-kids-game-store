import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, RefreshCw, User, ArrowLeft, Zap } from 'lucide-react';
import { CharacterConfig, CharacterGender, HairStyle } from '../types';
import {
  CHARACTER_PRESETS,
  DEFAULT_BOY_CHARACTER,
  DEFAULT_GIRL_CHARACTER,
  HAIR_COLORS,
  HEADBAND_COLORS,
  JERSEY_COLORS,
  JERSEY_NUMBERS,
  SKIN_TONES,
} from '../game/characterPresets';
import { GameRenderer } from '../game/renderer';

interface CustomizeModalProps {
  initialCharacter: CharacterConfig;
  onSaveCharacter: (char: CharacterConfig) => void;
  onBack: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  initialCharacter,
  onSaveCharacter,
  onBack,
}) => {
  const [character, setCharacter] = useState<CharacterConfig>(initialCharacter);
  const [activeTab, setActiveTab] = useState<'gender' | 'hair' | 'outfit' | 'identity'>('gender');
  const [previewPose, setPreviewPose] = useState<'running' | 'jumping' | 'sliding'>('running');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Canvas Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      GameRenderer.drawPreviewCharacter(
        ctx,
        canvas.width,
        canvas.height,
        character,
        elapsed,
        previewPose
      );
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [character, previewPose]);

  const handleGenderChange = (gender: CharacterGender) => {
    if (gender === 'girl') {
      setCharacter({
        ...DEFAULT_GIRL_CHARACTER,
        name: character.name === 'Alexander' ? 'Alexandra' : character.name,
      });
    } else {
      setCharacter({
        ...DEFAULT_BOY_CHARACTER,
        name: character.name === 'Alexandra' ? 'Alexander' : character.name,
      });
    }
  };

  const handleApplyPreset = (preset: CharacterConfig) => {
    setCharacter(preset);
  };

  const isGirl = character.gender === 'girl';

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-300 select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#050805]/95 border border-emerald-500/40 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-white flex flex-col gap-5 overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        {/* Background Watermark */}
        <div className="absolute -bottom-6 -right-6 text-emerald-950/20 font-black text-8xl sm:text-9xl pointer-events-none tracking-tighter select-none">
          RUNNER
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 bg-black/60 hover:bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-400 transition-all active:scale-95 cursor-pointer"
              title="Back to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-emerald-400 font-bold">
                  PROVINCE ATHLETE REGISTRY
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                CUSTOMIZE CHARACTER
              </h2>
            </div>
          </div>

          {/* Quick Gender Pill Toggle */}
          <div className="flex items-center bg-black/60 border border-emerald-500/30 rounded-full p-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <button
              onClick={() => handleGenderChange('boy')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                character.gender === 'boy'
                  ? 'bg-emerald-400 text-black shadow-[0_0_12px_#10b981]'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              <span>👦</span> BOY
            </button>
            <button
              onClick={() => handleGenderChange('girl')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                character.gender === 'girl'
                  ? 'bg-emerald-400 text-black shadow-[0_0_12px_#10b981]'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              <span>👧</span> GIRL
            </button>
          </div>
        </div>

        {/* Main Content Grid: Left Preview + Right Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Column: Live Animated Character Preview */}
          <div className="lg:col-span-5 flex flex-col items-center gap-3 bg-black/60 border border-emerald-500/25 p-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="w-full flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                Live Preview
              </span>
              <span className="text-zinc-400 font-mono text-[10px]">
                {character.gender === 'girl' ? 'FEMALE ATHLETE' : 'MALE ATHLETE'}
              </span>
            </div>

            {/* Canvas Preview Container */}
            <div className="relative w-full h-44 sm:h-52 bg-gradient-to-b from-[#0a140a] to-[#040804] rounded-xl overflow-hidden border border-emerald-500/30 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={280}
                height={190}
                className="w-full h-full block"
              />

              {/* Status Badge */}
              <div className="absolute top-2 left-2 bg-black/70 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px] font-mono text-emerald-300 uppercase tracking-widest">
                #{character.jerseyNumber || '01'} {character.name}
              </div>
            </div>

            {/* Pose Test Buttons */}
            <div className="flex items-center gap-2 w-full justify-center">
              <button
                onClick={() => setPreviewPose('running')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  previewPose === 'running'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-black/40 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Run
              </button>
              <button
                onClick={() => setPreviewPose('jumping')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  previewPose === 'jumping'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-black/40 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Jump
              </button>
              <button
                onClick={() => setPreviewPose('sliding')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  previewPose === 'sliding'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-black/40 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                Slide
              </button>
            </div>

            {/* Presets Quick Pick Row */}
            <div className="w-full mt-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1.5 block">
                Quick Character Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {CHARACTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.config)}
                    className={`px-2.5 py-1.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      character.name === preset.config.name && character.gender === preset.config.gender
                        ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-black/40 border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-950/30'
                    }`}
                  >
                    <span className="truncate">
                      {preset.config.gender === 'girl' ? '👧' : '👦'} {preset.name}
                    </span>
                    {character.name === preset.config.name && character.gender === preset.config.gender && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls & Tabs */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-emerald-500/20 pb-2">
              <button
                onClick={() => setActiveTab('gender')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'gender'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Gender & Body
              </button>
              <button
                onClick={() => setActiveTab('hair')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'hair'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Hair & Head
              </button>
              <button
                onClick={() => setActiveTab('outfit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'outfit'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Jersey & Gear
              </button>
              <button
                onClick={() => setActiveTab('identity')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'identity'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Name & Title
              </button>
            </div>

            {/* TAB 1: Gender & Skin Tone */}
            {activeTab === 'gender' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Runner Gender
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGenderChange('boy')}
                      className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                        character.gender === 'boy'
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-2xl">👦</span>
                      <div>
                        <div className="font-black text-sm text-white">Boy Runner</div>
                        <div className="text-[10px] text-zinc-400">Alexander build & frame</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleGenderChange('girl')}
                      className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                        character.gender === 'girl'
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-2xl">👧</span>
                      <div>
                        <div className="font-black text-sm text-white">Girl Runner</div>
                        <div className="text-[10px] text-zinc-400">Alexandra / Maya build & frame</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Skin Tone Swatches */}
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Skin Tone Palette
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SKIN_TONES.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setCharacter({ ...character, skinTone: st.color })}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          character.skinTone === st.color
                            ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="text-xs font-semibold text-zinc-200">{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Hair Style & Colors */}
            {activeTab === 'hair' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Hairstyle
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'spiky' as HairStyle, label: 'Spiky Champion', icon: '⚡' },
                      { id: 'ponytail' as HairStyle, label: 'High Ponytail', icon: '🎀' },
                      { id: 'long_braid' as HairStyle, label: 'Running Braid', icon: '🌾' },
                      { id: 'short_fade' as HairStyle, label: 'Modern Fade', icon: '✂️' },
                      { id: 'curly_afro' as HairStyle, label: 'Curly Afro', icon: '✨' },
                    ].map((hs) => (
                      <button
                        key={hs.id}
                        onClick={() => setCharacter({ ...character, hairStyle: hs.id })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          character.hairStyle === hs.id
                            ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-black/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-base">{hs.icon}</span>
                        <span className="text-xs font-bold">{hs.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Colors */}
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Hair Color
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.id}
                        onClick={() => setCharacter({ ...character, hairColor: hc.color })}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          character.hairColor === hc.color
                            ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: hc.color }}
                        />
                        <span className="text-[11px] font-semibold text-zinc-200 truncate">{hc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headband / Ribbon */}
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Headband / Ribbon Accessory
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HEADBAND_COLORS.map((hb) => (
                      <button
                        key={hb.id}
                        onClick={() => setCharacter({ ...character, headbandColor: hb.color })}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          character.headbandColor === hb.color
                            ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: hb.color === 'transparent' ? '#333' : hb.color }}
                        />
                        <span className="text-[11px] font-semibold text-zinc-200 truncate">{hb.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Jersey & Gear */}
            {activeTab === 'outfit' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                {/* Jersey Color */}
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Jersey Top Color
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {JERSEY_COLORS.map((jc) => (
                      <button
                        key={jc.id}
                        onClick={() => setCharacter({ ...character, jerseyColor: jc.color })}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          character.jerseyColor === jc.color
                            ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: jc.color }}
                        />
                        <span className="text-[11px] font-semibold text-zinc-200 truncate">{jc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jersey Number */}
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Jersey Number
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {JERSEY_NUMBERS.map((num) => (
                      <button
                        key={num}
                        onClick={() => setCharacter({ ...character, jerseyNumber: num })}
                        className={`w-11 h-10 rounded-xl border font-mono font-black text-sm flex items-center justify-center transition-all cursor-pointer ${
                          character.jerseyNumber === num
                            ? 'bg-emerald-400 text-black border-white shadow-[0_0_12px_#10b981]'
                            : 'bg-black/40 border-zinc-800 text-zinc-300 hover:border-emerald-500/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shorts & Shoes quick pairing */}
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">
                    Shorts & Running Shoes
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Pro Dark', shorts: '#18181B', shoes: '#FFFFFF' },
                      { label: 'Ocean Blue', shorts: '#1565C0', shoes: '#ECEFF1' },
                      { label: 'Neon Emerald', shorts: '#064E3B', shoes: '#FDE047' },
                    ].map((gear, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          setCharacter({
                            ...character,
                            shortsColor: gear.shorts,
                            shoesColor: gear.shoes,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          character.shortsColor === gear.shorts
                            ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-black/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {gear.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Identity (Name & Title) */}
            {activeTab === 'identity' && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1.5 block">
                    Runner Name
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={character.name}
                    onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                    className="w-full bg-black/60 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-white font-bold tracking-wide focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    placeholder="Alexander / Alexandra / Maya"
                  />
                </div>

                <div>
                  <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1.5 block">
                    Province Title / Epithet
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    value={character.title}
                    onChange={(e) => setCharacter({ ...character, title: e.target.value })}
                    className="w-full bg-black/60 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-white font-semibold tracking-wide focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    placeholder="e.g. Fastest Man in the Province"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-emerald-500/20 pt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => handleGenderChange(character.gender)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Default
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaveCharacter(character)}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Confirm & Select Runner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
