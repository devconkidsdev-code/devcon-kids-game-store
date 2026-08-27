import React from 'react';
import { BoatCustomization, GameSettings, CharacterGender } from '../types/game';
import { CHARACTER_OPTIONS } from '../utils/playerPresets';
import { X, Settings, Users, Sliders } from 'lucide-react';

interface GameSettingsModalProps {
  settings: GameSettings;
  p1Custom: BoatCustomization;
  p2Custom: BoatCustomization;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onUpdateP1: (newP1: BoatCustomization) => void;
  onUpdateP2: (newP2: BoatCustomization) => void;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#ef4444', // Vibrant Red
  '#2563eb', // Royal Blue
  '#16a34a', // Emerald Green
  '#eab308', // Gold / Yellow
  '#9333ea', // Deep Purple
  '#06b6d4', // Bright Cyan
  '#ea580c', // Bright Orange
  '#ec4899'  // Hot Pink
];

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  settings,
  p1Custom,
  p2Custom,
  onUpdateSettings,
  onUpdateP1,
  onUpdateP2,
  onClose
}) => {
  const handleGenderChange = (player: 'p1' | 'p2', gender: CharacterGender) => {
    const defaultChar = CHARACTER_OPTIONS.find(c => c.gender === gender);
    if (!defaultChar) return;

    if (player === 'p1') {
      onUpdateP1({
        ...p1Custom,
        gender,
        character: defaultChar.id,
        characterName: defaultChar.name
      });
    } else {
      onUpdateP2({
        ...p2Custom,
        gender,
        character: defaultChar.id,
        characterName: defaultChar.name
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-sky-900 border-4 border-sky-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl text-white flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-yellow-400" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tight text-white">GAME OPTIONS & RACERS</h2>
              <p className="text-xs text-sky-200 font-bold uppercase tracking-wider">Customize Captains, Gender & Boats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-sky-800 hover:bg-sky-700 text-sky-300 hover:text-white transition-all cursor-pointer border-2 border-sky-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Racing Mode Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-black uppercase text-yellow-300 tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <span>RACE FORMAT</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ mode: 'turn_based' })}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                settings.mode === 'turn_based'
                  ? 'bg-sky-800 border-yellow-400 ring-4 ring-yellow-400/30 text-white shadow-xl'
                  : 'bg-white/10 border-white/15 text-sky-200 hover:bg-white/20'
              }`}
            >
              <span className="font-black text-sm text-yellow-300 uppercase">⏱️ STAGGERED CHAMPIONSHIP</span>
              <span className="text-[11px] leading-snug font-bold opacity-90 text-sky-100">
                Red Boat runs first, then Blue Boat chases the live Ghost boat. Round 2 reverses starting order!
              </span>
            </button>

            <button
              onClick={() => onUpdateSettings({ mode: 'simultaneous' })}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                settings.mode === 'simultaneous'
                  ? 'bg-sky-800 border-yellow-400 ring-4 ring-yellow-400/30 text-white shadow-xl'
                  : 'bg-white/10 border-white/15 text-sky-200 hover:bg-white/20'
              }`}
            >
              <span className="font-black text-sm text-yellow-300 uppercase">⚡ LIVE SIMULTANEOUS DUEL</span>
              <span className="text-[11px] leading-snug font-bold opacity-90 text-sky-100">
                Both boats race simultaneously side-by-side on screen (WASD vs Arrow keys).
              </span>
            </button>
          </div>
        </div>

        {/* Race Timer Duration */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-black uppercase text-yellow-300 tracking-widest flex items-center gap-2">
            <Sliders className="w-4 h-4 text-yellow-400" />
            <span>RACE COUNTDOWN DURATION</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[30, 40, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateSettings({ roundDuration: sec })}
                className={`py-3 rounded-2xl border-2 text-center font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  settings.roundDuration === sec
                    ? 'bg-yellow-400 text-sky-950 border-yellow-300 shadow-lg border-b-6 border-yellow-600'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {sec} SECONDS {sec === 40 ? '(DEFAULT)' : sec === 30 ? '(BLITZ)' : '(RELAXED)'}
              </button>
            ))}
          </div>
        </div>

        {/* Player 1 (Red Boat) Customizer */}
        <div className="bg-red-950/40 border-2 border-red-500/60 rounded-3xl p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-red-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🚤</span> RED BOAT (PLAYER 1)
            </span>
            <input
              type="text"
              value={p1Custom.name}
              onChange={(e) => onUpdateP1({ ...p1Custom, name: e.target.value })}
              placeholder="Red Boat"
              className="bg-black/50 border-2 border-red-400/80 rounded-xl px-3 py-1 text-xs text-white font-black max-w-[150px]"
            />
          </div>

          {/* Gender Selector */}
          <div>
            <span className="text-[11px] text-red-200 font-bold block mb-1">Select Character Gender:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange('p1', 'woman')}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                  p1Custom.gender === 'woman'
                    ? 'bg-red-600 text-white border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                    : 'bg-black/40 text-red-200 border-white/15 hover:bg-black/60'
                }`}
              >
                <span className="text-base">👩</span>
                <span>WOMAN CAPTAIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('p1', 'man')}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                  p1Custom.gender === 'man'
                    ? 'bg-red-600 text-white border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                    : 'bg-black/40 text-red-200 border-white/15 hover:bg-black/60'
                }`}
              >
                <span className="text-base">👨</span>
                <span>MAN CAPTAIN</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Captain Avatar Picker */}
            <div>
              <span className="text-[11px] text-red-200 font-bold block mb-1">Choose Captain Persona:</span>
              <div className="grid grid-cols-2 gap-2">
                {CHARACTER_OPTIONS.filter(c => c.gender === (p1Custom.gender || 'woman')).map((char) => (
                  <button
                    key={char.id}
                    onClick={() => onUpdateP1({ ...p1Custom, character: char.id, characterName: char.name })}
                    className={`p-2 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                      p1Custom.character === char.id
                        ? 'bg-red-700 border-yellow-400 shadow-md scale-102 ring-2 ring-yellow-400/40'
                        : 'bg-black/40 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{char.emoji}</span>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-black text-white truncate">{char.name}</span>
                      <span className="text-[9px] text-red-200 font-bold truncate">{char.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Boat Color picker */}
            <div>
              <span className="text-[11px] text-red-200 font-bold block mb-1">Boat Hull Color:</span>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateP1({ ...p1Custom, boatColor: c })}
                    className={`w-7 h-7 rounded-full border-3 transition-all cursor-pointer ${
                      p1Custom.boatColor === c ? 'border-white scale-110 shadow-lg ring-2 ring-yellow-400' : 'border-black/40'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 (Blue Boat) Customizer */}
        <div className="bg-blue-950/40 border-2 border-blue-500/60 rounded-3xl p-5 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
              <span>🚤</span> BLUE BOAT (PLAYER 2)
            </span>
            <input
              type="text"
              value={p2Custom.name}
              onChange={(e) => onUpdateP2({ ...p2Custom, name: e.target.value })}
              placeholder="Blue Boat"
              className="bg-black/50 border-2 border-blue-400/80 rounded-xl px-3 py-1 text-xs text-white font-black max-w-[150px]"
            />
          </div>

          {/* Gender Selector */}
          <div>
            <span className="text-[11px] text-blue-200 font-bold block mb-1">Select Character Gender:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGenderChange('p2', 'woman')}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                  p2Custom.gender === 'woman'
                    ? 'bg-blue-600 text-white border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                    : 'bg-black/40 text-blue-200 border-white/15 hover:bg-black/60'
                }`}
              >
                <span className="text-base">👩</span>
                <span>WOMAN CAPTAIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('p2', 'man')}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                  p2Custom.gender === 'man'
                    ? 'bg-blue-600 text-white border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                    : 'bg-black/40 text-blue-200 border-white/15 hover:bg-black/60'
                }`}
              >
                <span className="text-base">👨</span>
                <span>MAN CAPTAIN</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Captain Avatar Picker */}
            <div>
              <span className="text-[11px] text-blue-200 font-bold block mb-1">Choose Captain Persona:</span>
              <div className="grid grid-cols-2 gap-2">
                {CHARACTER_OPTIONS.filter(c => c.gender === (p2Custom.gender || 'man')).map((char) => (
                  <button
                    key={char.id}
                    onClick={() => onUpdateP2({ ...p2Custom, character: char.id, characterName: char.name })}
                    className={`p-2 rounded-2xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                      p2Custom.character === char.id
                        ? 'bg-blue-700 border-yellow-400 shadow-md scale-102 ring-2 ring-yellow-400/40'
                        : 'bg-black/40 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{char.emoji}</span>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-black text-white truncate">{char.name}</span>
                      <span className="text-[9px] text-blue-200 font-bold truncate">{char.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Boat Color picker */}
            <div>
              <span className="text-[11px] text-blue-200 font-bold block mb-1">Boat Hull Color:</span>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdateP2({ ...p2Custom, boatColor: c })}
                    className={`w-7 h-7 rounded-full border-3 transition-all cursor-pointer ${
                      p2Custom.boatColor === c ? 'border-white scale-110 shadow-lg ring-2 ring-yellow-400' : 'border-black/40'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save & Close Button with Chunky 3D Arcade Styling */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-lg italic border-b-6 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-xl cursor-pointer"
        >
          SAVE & RETURN TO GAME
        </button>

      </div>
    </div>
  );
};
