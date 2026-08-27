import React, { useMemo } from 'react';
import { GameState, LevelDefinition, TileType, BoxEntity, PlantEntity, DewdropEntity } from '../types';
import { motion } from 'motion/react';
import { Sparkles, Droplets, Zap, ShieldAlert } from 'lucide-react';

interface BoardProps {
  state: GameState;
  level: LevelDefinition;
  onMove: (dx: number, dy: number) => void;
  onTileClick: (x: number, y: number) => void;
}

export const Board: React.FC<BoardProps> = ({ state, level, onMove, onTileClick }) => {
  const { player, grid, boxes, plants, dewdrops, gatesOpen } = state;
  const width = level.width;
  const height = level.height;

  // Compute tile dimensions to fit screen nicely
  const cellSize = useMemo(() => {
    const maxDim = Math.max(width, height);
    if (maxDim <= 6) return 66;
    if (maxDim <= 8) return 56;
    if (maxDim <= 10) return 48;
    return 42;
  }, [width, height]);

  // Biome specific color palettes and textures in Vibrant Palette theme
  const biomeTheme = useMemo(() => {
    switch (level.biome) {
      case 'meadow':
        return {
          frameBg: 'bg-[#8B5E34] border-[#6F4E27]',
          gridBg: 'bg-[#5D3A1A]/90 border-[#432912]',
          grass: 'bg-emerald-500 border-b-4 border-emerald-600 shadow-sm text-white',
          wall: 'bg-[#A67C52] border-b-4 border-[#5D3A1A] text-amber-100',
          accent: 'emerald',
        };
      case 'canyon':
        return {
          frameBg: 'bg-[#8B5E34] border-[#6F4E27]',
          gridBg: 'bg-[#5D3A1A]/90 border-[#432912]',
          grass: 'bg-amber-600 border-b-4 border-amber-700 shadow-sm text-white',
          wall: 'bg-[#9C5821] border-b-4 border-[#633511] text-amber-200',
          accent: 'amber',
        };
      case 'bamboo':
        return {
          frameBg: 'bg-[#406343] border-[#283e2a]',
          gridBg: 'bg-[#1b2b1d]/90 border-[#121c13]',
          grass: 'bg-teal-600 border-b-4 border-teal-700 shadow-sm text-white',
          wall: 'bg-[#2E5E4E] border-b-4 border-[#1B3B30] text-teal-200',
          accent: 'teal',
        };
      case 'highlands':
        return {
          frameBg: 'bg-[#4A4E69] border-[#22223B]',
          gridBg: 'bg-[#181829]/90 border-[#11111d]',
          grass: 'bg-indigo-600 border-b-4 border-indigo-700 shadow-sm text-white',
          wall: 'bg-slate-700 border-b-4 border-slate-900 text-indigo-200',
          accent: 'indigo',
        };
      case 'sanctuary':
        return {
          frameBg: 'bg-[#5B3E75] border-[#3C284E]',
          gridBg: 'bg-[#251833]/90 border-[#191022]',
          grass: 'bg-teal-500 border-b-4 border-teal-600 shadow-sm text-white',
          wall: 'bg-purple-800 border-b-4 border-purple-950 text-purple-200',
          accent: 'purple',
        };
    }
  }, [level.biome]);

  // Touch swipe support
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        onMove(dx > 0 ? 1 : -1, 0);
      } else {
        onMove(0, dy > 0 ? 1 : -1);
      }
    }
    touchStartRef.current = null;
  };

  // Render ground tile visual
  const renderTileVisual = (tile: TileType, x: number, y: number) => {
    switch (tile) {
      case 'wall':
        return (
          <div className={`w-full h-full rounded-xl flex items-center justify-center font-bold text-xs select-none shadow-sm ${biomeTheme.wall}`}>
            <div className="w-2/3 h-2/3 rounded-lg bg-black/10 flex items-center justify-center border border-white/20">
              <span className="opacity-60 text-[10px]">▲</span>
            </div>
          </div>
        );
      case 'water_deep':
        return (
          <div className="w-full h-full rounded-xl bg-blue-500/80 border-4 border-blue-400/80 shadow-inner flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/60 to-cyan-300/40 animate-pulse" />
            <div className="w-3 h-3 bg-white/40 rounded-full opacity-60 animate-ping" />
          </div>
        );
      case 'water_spring':
        return (
          <div className="w-full h-full rounded-xl bg-cyan-500 border-4 border-cyan-200 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
            <Droplets className="w-4 h-4 text-white animate-bounce" />
            <span className="text-[8px] font-black uppercase tracking-wider text-white">Spring</span>
          </div>
        );
      case 'canal_empty':
        return (
          <div className="w-full h-full rounded-xl bg-stone-700/80 border-2 border-stone-600 shadow-inner flex items-center justify-center">
            <div className="w-4/5 h-4/5 border-2 border-dashed border-stone-500/60 rounded-lg" />
          </div>
        );
      case 'ice':
        return (
          <div className="w-full h-full rounded-xl bg-cyan-100 border-2 border-cyan-300 shadow-inner flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white/60 rounded-lg flex items-center justify-center border border-cyan-200">
              <span className="text-cyan-700 font-black text-xs select-none">❄</span>
            </div>
          </div>
        );
      case 'mud':
        return (
          <div className="w-full h-full rounded-xl bg-amber-900 border-b-4 border-amber-950 shadow-inner flex items-center justify-center">
            <span className="text-amber-600 font-bold text-xs select-none">●●</span>
          </div>
        );
      case 'bridge_wood':
        return (
          <div className="w-full h-full rounded-xl bg-amber-600 border-y-2 border-amber-800 shadow flex flex-col justify-between p-1">
            <div className="h-1 bg-amber-800 rounded-sm" />
            <div className="h-1 bg-amber-400 rounded-sm" />
            <div className="h-1 bg-amber-800 rounded-sm" />
          </div>
        );
      case 'plate_red':
        return (
          <div className="w-full h-full rounded-xl bg-red-900 border-2 border-red-500 flex items-center justify-center">
            <div className="w-3/5 h-3/5 rounded-full bg-red-500 border-2 border-red-200 shadow-md flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        );
      case 'plate_blue':
        return (
          <div className="w-full h-full rounded-xl bg-blue-900 border-2 border-blue-500 flex items-center justify-center">
            <div className="w-3/5 h-3/5 rounded-full bg-blue-500 border-2 border-blue-200 shadow-md flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        );
      case 'plate_yellow':
        return (
          <div className="w-full h-full rounded-xl bg-amber-900 border-2 border-amber-500 flex items-center justify-center">
            <div className="w-3/5 h-3/5 rounded-full bg-amber-400 border-2 border-amber-100 shadow-md flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        );
      case 'gate_red':
        return gatesOpen.red ? (
          <div className="w-full h-full rounded-xl bg-red-900/30 border-2 border-dashed border-red-400/60 flex items-center justify-center">
            <span className="text-red-300 text-[9px] font-black">OPEN</span>
          </div>
        ) : (
          <div className="w-full h-full rounded-xl bg-red-600 border-b-4 border-red-800 shadow-md flex items-center justify-center font-black text-white text-xs">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
        );
      case 'gate_blue':
        return gatesOpen.blue ? (
          <div className="w-full h-full rounded-xl bg-blue-900/30 border-2 border-dashed border-blue-400/60 flex items-center justify-center">
            <span className="text-blue-300 text-[9px] font-black">OPEN</span>
          </div>
        ) : (
          <div className="w-full h-full rounded-xl bg-blue-600 border-b-4 border-blue-800 shadow-md flex items-center justify-center font-black text-white text-xs">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
        );
      case 'gate_yellow':
        return gatesOpen.yellow ? (
          <div className="w-full h-full rounded-xl bg-amber-900/30 border-2 border-dashed border-amber-400/60 flex items-center justify-center">
            <span className="text-amber-300 text-[9px] font-black">OPEN</span>
          </div>
        ) : (
          <div className="w-full h-full rounded-xl bg-amber-500 border-b-4 border-amber-700 shadow-md flex items-center justify-center font-black text-slate-900 text-xs">
            <ShieldAlert className="w-4 h-4 text-slate-900" />
          </div>
        );
      case 'portal_a':
        return (
          <div className="w-full h-full rounded-xl bg-purple-900 border-2 border-purple-400 flex items-center justify-center relative overflow-hidden">
            <div className="w-3/4 h-3/4 rounded-full bg-purple-600 border-2 border-purple-200 animate-spin flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="absolute bottom-0.5 text-[8px] font-black text-purple-200">A</span>
          </div>
        );
      case 'portal_b':
        return (
          <div className="w-full h-full rounded-xl bg-fuchsia-900 border-2 border-fuchsia-400 flex items-center justify-center relative overflow-hidden">
            <div className="w-3/4 h-3/4 rounded-full bg-fuchsia-600 border-2 border-fuchsia-200 animate-spin flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="absolute bottom-0.5 text-[8px] font-black text-fuchsia-200">B</span>
          </div>
        );
      case 'purifier':
        return (
          <div className="w-full h-full rounded-xl bg-teal-800 border-2 border-teal-300 flex flex-col items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-200 animate-pulse" />
            <span className="text-[7px] font-black text-white uppercase">Pure</span>
          </div>
        );
      case 'grass':
      default:
        return (
          <div className={`w-full h-full rounded-xl flex items-center justify-center transition-all ${biomeTheme.grass}`}>
            {(x + y) % 3 === 0 && (
              <span className="text-white/30 text-[11px] select-none">☘</span>
            )}
          </div>
        );
    }
  };

  return (
    <div
      id="game-board-container"
      className="relative flex items-center justify-center select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Signature Terracotta Bezel from Vibrant Theme */}
      <div className={`relative p-4 sm:p-5 rounded-[32px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] border-8 ${biomeTheme.frameBg}`}>
        <div
          id="puzzle-grid"
          className={`relative grid p-2.5 rounded-2xl border-2 transition-all ${biomeTheme.gridBg}`}
          style={{
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
            gap: '4px',
          }}
        >
          {/* Background Grid Cells */}
          {grid.map((row, y) =>
            row.map((tile, x) => (
              <div
                key={`cell-${x}-${y}`}
                id={`tile-${x}-${y}`}
                onClick={() => onTileClick(x, y)}
                className="relative cursor-pointer transition-transform hover:scale-[1.03] active:scale-95"
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                {renderTileVisual(tile, x, y)}
              </div>
            ))
          )}

          {/* Dewdrops */}
          {dewdrops.map(dewdrop => {
            if (dewdrop.collected) return null;
            return (
              <motion.div
                key={`dewdrop-${dewdrop.id}`}
                id={`dewdrop-${dewdrop.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.18, 1], y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute pointer-events-none z-10 flex items-center justify-center"
                style={{
                  left: `${dewdrop.x * (cellSize + 4) + 10}px`,
                  top: `${dewdrop.y * (cellSize + 4) + 10}px`,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-200 border-2 border-white shadow-lg shadow-cyan-400/60 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-blue-900 animate-spin" />
                </div>
              </motion.div>
            );
          })}

          {/* Plants / Targets */}
          {plants.map(plant => (
            <div
              key={`plant-${plant.id}`}
              id={`plant-${plant.id}`}
              className="absolute pointer-events-none z-20 flex flex-col items-center justify-center"
              style={{
                left: `${plant.x * (cellSize + 4) + 10}px`,
                top: `${plant.y * (cellSize + 4) + 10}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            >
              {plant.isWatered ? (
                // Watered Blooming State
                <motion.div
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="flex flex-col items-center justify-center"
                >
                  {plant.type === 'ancient_tree' ? (
                    <div className="text-3xl filter drop-shadow-lg animate-pulse">🌳</div>
                  ) : plant.type === 'lotus' ? (
                    <div className="text-2xl filter drop-shadow-md animate-bounce">🪷</div>
                  ) : plant.type === 'cactus' ? (
                    <div className="text-2xl filter drop-shadow-md animate-bounce">🌵</div>
                  ) : (
                    <div className="text-2xl filter drop-shadow-md animate-bounce">🌸</div>
                  )}
                  <div className="flex gap-0.5 mt-0.5">
                    <span className="text-[8px] font-black text-white bg-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-300 shadow-sm">
                      BLOOM
                    </span>
                  </div>
                </motion.div>
              ) : (
                // Thirsty / Withered State
                <div className="flex flex-col items-center justify-center opacity-90">
                  <div className="text-xl filter grayscale contrast-125 opacity-75">
                    {plant.type === 'ancient_tree' ? '🪵' : plant.type === 'cactus' ? '🌵' : '🥀'}
                  </div>
                  {plant.requiredWater > 1 && (
                    <div className="flex gap-0.5 mt-0.5 bg-slate-900/80 px-1.5 py-0.5 rounded-full border border-cyan-400">
                      <Droplets className="w-2.5 h-2.5 text-cyan-300" />
                      <span className="text-[8px] font-bold text-cyan-200">
                        {plant.currentWater}/{plant.requiredWater}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pushable Boxes */}
          {boxes.map(box => (
            <motion.div
              key={`box-${box.id}`}
              id={`box-${box.id}`}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute pointer-events-none z-30 flex items-center justify-center"
              style={{
                left: `${box.x * (cellSize + 4) + 10}px`,
                top: `${box.y * (cellSize + 4) + 10}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            >
              {box.type === 'water' && (
                <div className="w-4/5 h-4/5 rounded-xl bg-blue-500 border-4 border-blue-300 shadow-lg shadow-blue-500/40 flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <div className="w-2.5 h-2.5 bg-white/40 rounded-full animate-pulse mb-0.5" />
                  <div className="text-[8px] font-black tracking-wider text-white uppercase">H2O</div>
                </div>
              )}

              {box.type === 'empty_crate' && (
                <div className="w-4/5 h-4/5 rounded-xl bg-[#A67C52] border-b-4 border-[#5D3A1A] shadow-md flex flex-col items-center justify-center text-amber-100">
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-amber-300/80 rounded-lg flex items-center justify-center">
                    <span className="text-[8px] font-black text-amber-200">CRATE</span>
                  </div>
                </div>
              )}

              {box.type === 'rock' && (
                <div className="w-4/5 h-4/5 rounded-xl bg-slate-500 border-b-4 border-slate-700 shadow-lg flex flex-col items-center justify-center text-white">
                  <div className="w-3/4 h-3/4 bg-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-[8px] font-black text-slate-200">STONE</span>
                  </div>
                </div>
              )}

              {box.type === 'ice_block' && (
                <div className="w-4/5 h-4/5 rounded-xl bg-cyan-200 border-2 border-white shadow-lg shadow-cyan-300/50 flex flex-col items-center justify-center text-cyan-900">
                  <span className="text-xs font-black">❄</span>
                  <span className="text-[7px] font-bold uppercase">ICE</span>
                </div>
              )}
            </motion.div>
          ))}

          {/* Player Gardener Sprite */}
          <motion.div
            id="player-avatar"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="absolute pointer-events-none z-40 flex items-center justify-center"
            style={{
              left: `${player.x * (cellSize + 4) + 10}px`,
              top: `${player.y * (cellSize + 4) + 10}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }}
          >
            <div className="w-5/6 h-5/6 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 border-2 border-white shadow-xl shadow-orange-500/50 flex flex-col items-center justify-center relative">
              <div className="text-base select-none">
                {player.dir === 'up' ? '🧑‍🌾' : player.dir === 'down' ? '🧑‍🌾' : player.dir === 'left' ? '👈' : '👉'}
              </div>
              <div className="absolute -bottom-1 bg-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-300">
                <span className="text-[6px] font-black text-white">GARDENER</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
