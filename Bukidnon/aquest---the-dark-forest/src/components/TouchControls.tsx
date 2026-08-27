import React, { useRef, useState } from 'react';
import { Flashlight } from 'lucide-react';
import { Vector2D } from '../types';

interface TouchControlsProps {
  onMoveChange: (dir: Vector2D) => void;
  onFlashlightToggle: () => void;
  flashlightOn: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveChange,
  onFlashlightToggle,
  flashlightOn,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [touchPos, setTouchPos] = useState<Vector2D>({ x: 0, y: 0 });
  const [activeTouchId, setActiveTouchId] = useState<number | null>(null);

  const maxRadius = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const touch = e.changedTouches[0];
    setActiveTouchId(touch.identifier);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeTouchId === null || !joystickRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        setActiveTouchId(null);
        setTouchPos({ x: 0, y: 0 });
        onMoveChange({ x: 0, y: 0 });
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      setTouchPos({ x: 0, y: 0 });
      onMoveChange({ x: 0, y: 0 });
      return;
    }

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setTouchPos({ x: knobX, y: knobY });

    // Normalized vector for player movement
    onMoveChange({
      x: knobX / maxRadius,
      y: knobY / maxRadius,
    });
  };

  return (
    <div id="touch-controls" className="absolute inset-0 pointer-events-none z-30 select-none md:hidden">
      {/* Left side: Virtual Joystick */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="w-32 h-32 rounded-full bg-black/60 border-2 border-neutral-700/60 backdrop-blur-sm relative flex items-center justify-center touch-none shadow-2xl"
        >
          {/* Direction indicators */}
          <div className="absolute top-2 text-[10px] text-neutral-500 font-bold">W</div>
          <div className="absolute bottom-2 text-[10px] text-neutral-500 font-bold">S</div>
          <div className="absolute left-2 text-[10px] text-neutral-500 font-bold">A</div>
          <div className="absolute right-2 text-[10px] text-neutral-500 font-bold">D</div>

          {/* Joystick Knob */}
          <div
            className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-cyan-500/60 shadow-lg transition-transform duration-75 flex items-center justify-center"
            style={{
              transform: `translate(${touchPos.x}px, ${touchPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-cyan-400 opacity-70" />
          </div>
        </div>
      </div>

      {/* Right side: Flashlight Button */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-4 pointer-events-auto">
        <button
          id="btn-touch-flashlight"
          onClick={onFlashlightToggle}
          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all shadow-xl backdrop-blur-sm ${
            flashlightOn
              ? 'bg-amber-500/90 border-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
              : 'bg-black/60 border-neutral-700 text-neutral-400 active:scale-90'
          }`}
        >
          <Flashlight className="w-6 h-6" />
          <span className="text-[9px] font-bold mt-0.5">{flashlightOn ? 'LIGHT ON' : 'LIGHT OFF'}</span>
        </button>
      </div>
    </div>
  );
};
