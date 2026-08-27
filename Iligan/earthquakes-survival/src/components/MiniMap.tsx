import React from 'react';
import { MAP_HEIGHT, MAP_WIDTH } from '../utils/mapData';

interface MiniMapProps {
  playerPos: { x: number; y: number; angle: number };
  safeZone: { x: number; y: number; width: number; height: number };
  survivorsCount: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  playerPos,
  safeZone,
}) => {
  const mapScaleW = 160 / MAP_WIDTH;
  const mapScaleH = 120 / MAP_HEIGHT;

  const playerRadarX = playerPos.x * mapScaleW;
  const playerRadarY = playerPos.y * mapScaleH;

  const szRadarX = safeZone.x * mapScaleW;
  const szRadarY = safeZone.y * mapScaleH;
  const szRadarW = safeZone.width * mapScaleW;
  const szRadarH = safeZone.height * mapScaleH;

  return (
    <div className="relative w-[160px] h-[120px] bg-[#1a1a1a]/95 border-2 border-orange-600/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Grid crosshairs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:16px_16px]" />

      {/* Radar sweep animation */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(234,88,12,0.15)_360deg)] animate-[spin_4s_linear_infinite] pointer-events-none origin-center" />

      {/* Safe Zone */}
      <div
        className="absolute bg-green-500/30 border border-green-400 rounded-xs animate-pulse flex items-center justify-center"
        style={{
          left: `${szRadarX}px`,
          top: `${szRadarY}px`,
          width: `${szRadarW}px`,
          height: `${szRadarH}px`,
        }}
      >
        <span className="text-[6px] font-black text-green-300 tracking-tighter">SAFE</span>
      </div>

      {/* Enterable Metro Shelter Radar Marker */}
      <div
        className="absolute bg-cyan-500/30 border border-cyan-400 rounded-xs flex items-center justify-center"
        style={{
          left: `${620 * mapScaleW}px`,
          top: `${490 * mapScaleH}px`,
          width: `${380 * mapScaleW}px`,
          height: `${210 * mapScaleH}px`,
        }}
        title="Metro Disaster Shelter (Enterable)"
      >
        <span className="text-[5px] font-black text-cyan-300 tracking-tighter">SHELTER</span>
      </div>

      {/* Player Vehicle Marker */}
      <div
        className="absolute w-3 h-3 -ml-1.5 -mt-1.5 z-20 flex items-center justify-center"
        style={{
          left: `${playerRadarX}px`,
          top: `${playerRadarY}px`,
          transform: `rotate(${playerPos.angle}rad)`,
        }}
      >
        <div className="w-2.5 h-2.5 bg-orange-500 border border-white rounded-full shadow-[0_0_8px_#ea580c]" />
        <div className="absolute w-1 h-3 bg-yellow-300 top-0 left-1 origin-bottom rounded-full" />
      </div>

      {/* Map Badge */}
      <div className="absolute bottom-1 right-1.5 text-[8px] font-mono text-gray-400 font-semibold tracking-wider uppercase">
        GPS RADAR
      </div>
    </div>
  );
};
