import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';

interface TouchControlsProps {
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const maxRadius = 45;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      baseCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    setJoystickActive(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - baseCenterRef.current.x;
        const dy = touch.clientY - baseCenterRef.current.y;
        const dist = Math.hypot(dx, dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxRadius) {
          clampedX = (dx / dist) * maxRadius;
          clampedY = (dy / dist) * maxRadius;
        }

        setKnobPos({ x: clampedX, y: clampedY });

        // Update GameEngine Virtual Joystick
        engine.virtualJoystick.active = true;
        engine.virtualJoystick.x = clampedX / maxRadius;
        engine.virtualJoystick.y = clampedY / maxRadius;
        break;
      }
    }
  }, [engine, maxRadius]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setJoystickActive(false);
        setKnobPos({ x: 0, y: 0 });
        engine.virtualJoystick.active = false;
        engine.virtualJoystick.x = 0;
        engine.virtualJoystick.y = 0;
        break;
      }
    }
  }, [engine]);

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div className="absolute inset-0 pointer-events-none md:hidden z-30 select-none">
      {/* Left Bottom Virtual Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        className="absolute left-6 bottom-8 w-28 h-28 rounded-full bg-indigo-950/70 border-2 border-cyan-400/60 backdrop-blur-sm pointer-events-auto flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] touch-none"
      >
        <div
          className={`w-14 h-14 rounded-full transition-transform duration-75 shadow-lg border-2 ${
            joystickActive ? 'bg-cyan-400 border-white scale-110 shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'bg-indigo-800/80 border-cyan-500/50'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        />
      </div>

      {/* Right Bottom Sprint / Action Button */}
      <div className="absolute right-6 bottom-8 flex flex-col gap-3 pointer-events-auto">
        <button
          id="touch-sprint-btn"
          onTouchStart={() => {
            engine.keys['ShiftLeft'] = true;
          }}
          onTouchEnd={() => {
            engine.keys['ShiftLeft'] = false;
          }}
          className="w-20 h-20 rounded-full bg-yellow-400 active:bg-yellow-300 border-2 border-white text-indigo-950 font-black text-xs uppercase flex flex-col items-center justify-center shadow-[0_6px_0_#ca8a04] active:translate-y-1 active:shadow-[0_1px_0_#ca8a04] transition-all cursor-pointer"
        >
          <span className="text-2xl">⚡</span>
          <span className="tracking-wider">SPRINT</span>
        </button>
      </div>
    </div>
  );
};
