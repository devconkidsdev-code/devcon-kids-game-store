import React from 'react';
import { Particle } from '../types';

interface FloatingParticlesProps {
  particles: Particle[];
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ particles }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute font-black select-none pointer-events-none drop-shadow-md text-xs sm:text-sm"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            color: p.color,
            opacity: p.alpha,
            transform: `translate(-50%, -50%) scale(${0.8 + (1 - p.life / p.maxLife) * 0.4})`,
            transition: 'opacity 50ms linear',
          }}
        >
          {p.text || '✨'}
        </div>
      ))}
    </div>
  );
};
