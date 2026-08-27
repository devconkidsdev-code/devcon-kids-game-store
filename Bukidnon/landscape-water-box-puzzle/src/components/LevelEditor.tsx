import React, { useState } from 'react';
import { LevelDefinition, TileType, BoxType, PlantType } from '../types';
import { Play, Copy, Check, RotateCcw, Hammer } from 'lucide-react';

interface LevelEditorProps {
  onPlayCustomLevel: (level: LevelDefinition) => void;
  onClose: () => void;
}

type PaletteTool =
  | { kind: 'tile'; tile: TileType }
  | { kind: 'player' }
  | { kind: 'box'; boxType: BoxType }
  | { kind: 'plant'; plantType: PlantType }
  | { kind: 'dewdrop' }
  | { kind: 'erase' };

export const LevelEditor: React.FC<LevelEditorProps> = ({ onPlayCustomLevel, onClose }) => {
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(6);
  const [levelName, setLevelName] = useState('My Custom Oasis');
  const [biome, setBiome] = useState<'meadow' | 'canyon' | 'bamboo' | 'highlands' | 'sanctuary'>('meadow');

  const [grid, setGrid] = useState<TileType[][]>(() =>
    Array(6).fill(null).map((_, y) =>
      Array(8).fill(null).map((_, x) =>
        y === 0 || y === 5 || x === 0 || x === 7 ? 'wall' : 'grass'
      )
    )
  );

  const [playerStart, setPlayerStart] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [boxes, setBoxes] = useState<{ id: string; x: number; y: number; type: BoxType }[]>([
    { id: 'cb1', x: 2, y: 2, type: 'water' },
  ]);
  const [plants, setPlants] = useState<{ id: string; x: number; y: number; type: PlantType; requiredWater: number; currentWater: number; isWatered: boolean }[]>([
    { id: 'cp1', x: 5, y: 3, type: 'sprout', requiredWater: 1, currentWater: 0, isWatered: false },
  ]);
  const [dewdrops, setDewdrops] = useState<{ id: string; x: number; y: number; collected: boolean }[]>([]);

  const [selectedTool, setSelectedTool] = useState<PaletteTool>({ kind: 'tile', tile: 'wall' });
  const [copied, setCopied] = useState(false);

  // Resize grid
  const handleResize = (newW: number, newH: number) => {
    const w = Math.max(5, Math.min(12, newW));
    const h = Math.max(5, Math.min(10, newH));
    setWidth(w);
    setHeight(h);

    const newGrid: TileType[][] = Array(h).fill(null).map((_, y) =>
      Array(w).fill(null).map((_, x) => {
        if (grid[y] && grid[y][x]) return grid[y][x];
        if (y === 0 || y === h - 1 || x === 0 || x === w - 1) return 'wall';
        return 'grass';
      })
    );
    setGrid(newGrid);

    setBoxes(b => b.filter(box => box.x < w && box.y < h));
    setPlants(p => p.filter(plant => plant.x < w && plant.y < h));
    setDewdrops(d => d.filter(dew => dew.x < w && dew.y < h));
  };

  const handleCellClick = (x: number, y: number) => {
    if (selectedTool.kind === 'tile') {
      const next = grid.map((r, rY) =>
        r.map((c, cX) => (cX === x && rY === y ? selectedTool.tile : c))
      );
      setGrid(next);
    } else if (selectedTool.kind === 'player') {
      setPlayerStart({ x, y });
    } else if (selectedTool.kind === 'box') {
      setBoxes(prev => [
        ...prev.filter(b => !(b.x === x && b.y === y)),
        { id: `box_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, x, y, type: selectedTool.boxType },
      ]);
    } else if (selectedTool.kind === 'plant') {
      const reqWater = selectedTool.plantType === 'ancient_tree' ? 2 : 1;
      setPlants(prev => [
        ...prev.filter(p => !(p.x === x && p.y === y)),
        {
          id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          x,
          y,
          type: selectedTool.plantType,
          requiredWater: reqWater,
          currentWater: 0,
          isWatered: false,
        },
      ]);
    } else if (selectedTool.kind === 'dewdrop') {
      setDewdrops(prev => [
        ...prev.filter(d => !(d.x === x && d.y === y)),
        { id: `dew_${Date.now()}`, x, y, collected: false },
      ]);
    } else if (selectedTool.kind === 'erase') {
      setBoxes(prev => prev.filter(b => !(b.x === x && b.y === y)));
      setPlants(prev => prev.filter(p => !(p.x === x && p.y === y)));
      setDewdrops(prev => prev.filter(d => !(d.x === x && d.y === y)));
      const next = grid.map((r, rY) =>
        r.map((c, cX) => (cX === x && rY === y ? 'grass' : c))
      );
      setGrid(next);
    }
  };

  const handleTestPlay = () => {
    if (plants.length === 0) {
      alert('Please place at least one plant to water in your puzzle!');
      return;
    }
    const customLevel: LevelDefinition = {
      id: 999,
      name: levelName || 'Custom Oasis',
      biome,
      width,
      height,
      playerStart,
      grid,
      boxes,
      plants,
      dewdrops,
      parMoves: 20,
      hint: 'Your custom designed level! Water all flowers to bloom.',
    };
    onPlayCustomLevel(customLevel);
  };

  const handleExportJSON = () => {
    const customLevel: LevelDefinition = {
      id: 999,
      name: levelName,
      biome,
      width,
      height,
      playerStart,
      grid,
      boxes,
      plants,
      dewdrops,
      parMoves: 20,
    };
    navigator.clipboard.writeText(JSON.stringify(customLevel, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="level-editor-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl max-h-[95vh] bg-white border-4 border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <Hammer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-800">Landscape Level Builder</h2>
              <p className="text-xs text-slate-500 font-medium">Design, customize, and test your own water box puzzles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-level-json-btn"
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied!' : 'Export JSON'}</span>
            </button>

            <button
              id="play-custom-level-btn"
              onClick={handleTestPlay}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-transform active:scale-95 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Test & Play</span>
            </button>

            <button
              id="close-editor-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toolbar Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3 bg-emerald-50/60 p-3 rounded-2xl border-2 border-emerald-100 text-xs">
          <div>
            <label className="text-slate-600 font-bold block mb-1">Level Name</label>
            <input
              type="text"
              value={levelName}
              onChange={e => setLevelName(e.target.value)}
              className="w-full bg-white border-2 border-emerald-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1">Biome Theme</label>
            <select
              value={biome}
              onChange={e => setBiome(e.target.value as any)}
              className="w-full bg-white border-2 border-emerald-200 rounded-xl px-2 py-1.5 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="meadow">Sunny Meadow 🌱</option>
              <option value="canyon">Stone Canyon 🏜️</option>
              <option value="bamboo">Bamboo Grove 🎋</option>
              <option value="highlands">Mystic Highlands ⛰️</option>
              <option value="sanctuary">Zen Sanctuary 🪷</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1">Grid Size (W × H)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="5"
                max="12"
                value={width}
                onChange={e => handleResize(parseInt(e.target.value) || 6, height)}
                className="w-14 bg-white border-2 border-emerald-200 rounded-xl px-2 py-1.5 text-center text-slate-800 font-black"
              />
              <span className="text-slate-500 font-bold">×</span>
              <input
                type="number"
                min="5"
                max="10"
                value={height}
                onChange={e => handleResize(width, parseInt(e.target.value) || 5)}
                className="w-14 bg-white border-2 border-emerald-200 rounded-xl px-2 py-1.5 text-center text-slate-800 font-black"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setGrid(
                  Array(height).fill(null).map((_, y) =>
                    Array(width).fill(null).map((_, x) =>
                      y === 0 || y === height - 1 || x === 0 || x === width - 1 ? 'wall' : 'grass'
                    )
                  )
                );
                setBoxes([]);
                setPlants([{ id: 'p1', x: width - 2, y: height - 2, type: 'flower', requiredWater: 1, currentWater: 0, isWatered: false }]);
                setDewdrops([]);
              }}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Board</span>
            </button>
          </div>
        </div>

        {/* Palette Palette Row */}
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-2xl border-2 border-emerald-100 mb-3 text-xs shadow-xs">
          {/* Tiles */}
          {[
            { label: 'Wall', tool: { kind: 'tile', tile: 'wall' as TileType }, icon: '🪨' },
            { label: 'Grass', tool: { kind: 'tile', tile: 'grass' as TileType }, icon: '🟩' },
            { label: 'River', tool: { kind: 'tile', tile: 'water_deep' as TileType }, icon: '🌊' },
            { label: 'Spring', tool: { kind: 'tile', tile: 'water_spring' as TileType }, icon: '⛲' },
            { label: 'Ice', tool: { kind: 'tile', tile: 'ice' as TileType }, icon: '❄️' },
            { label: 'Mud', tool: { kind: 'tile', tile: 'mud' as TileType }, icon: '🟫' },
            { label: 'Bridge', tool: { kind: 'tile', tile: 'bridge_wood' as TileType }, icon: '🪵' },
            { label: 'Red Plate', tool: { kind: 'tile', tile: 'plate_red' as TileType }, icon: '🔴' },
            { label: 'Red Gate', tool: { kind: 'tile', tile: 'gate_red' as TileType }, icon: '🚪' },
            { label: 'Blue Plate', tool: { kind: 'tile', tile: 'plate_blue' as TileType }, icon: '🔵' },
            { label: 'Blue Gate', tool: { kind: 'tile', tile: 'gate_blue' as TileType }, icon: '🚪' },
            { label: 'Portal 1', tool: { kind: 'tile', tile: 'portal_a' as TileType }, icon: '🌀1' },
            { label: 'Portal 2', tool: { kind: 'tile', tile: 'portal_b' as TileType }, icon: '🌀2' },
            { label: 'Purifier', tool: { kind: 'tile', tile: 'purifier' as TileType }, icon: '✨' },
          ].map((item, idx) => {
            const isSelected = selectedTool.kind === 'tile' && selectedTool.tile === item.tool.tile;
            return (
              <button
                key={idx}
                onClick={() => setSelectedTool(item.tool as any)}
                className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50/50 border-emerald-100 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="w-px h-6 bg-slate-200 self-center mx-1" />

          {/* Entities */}
          {[
            { label: 'Player', tool: { kind: 'player' as const }, icon: '🧑‍🌾' },
            { label: 'Water Box', tool: { kind: 'box' as const, boxType: 'water' as BoxType }, icon: '💧' },
            { label: 'Crate', tool: { kind: 'box' as const, boxType: 'empty_crate' as BoxType }, icon: '📦' },
            { label: 'Stone', tool: { kind: 'box' as const, boxType: 'rock' as BoxType }, icon: '⬛' },
            { label: 'Ice Cube', tool: { kind: 'box' as const, boxType: 'ice_block' as BoxType }, icon: '🧊' },
            { label: 'Flower', tool: { kind: 'plant' as const, plantType: 'flower' as PlantType }, icon: '🌸' },
            { label: 'Lotus', tool: { kind: 'plant' as const, plantType: 'lotus' as PlantType }, icon: '🪷' },
            { label: 'Tree', tool: { kind: 'plant' as const, plantType: 'ancient_tree' as PlantType }, icon: '🌳' },
            { label: 'Dewdrop', tool: { kind: 'dewdrop' as const }, icon: '✨' },
            { label: 'Eraser', tool: { kind: 'erase' as const }, icon: '🧹' },
          ].map((item, idx) => {
            const isSelected =
              selectedTool.kind === item.tool.kind &&
              ('boxType' in item.tool ? (selectedTool as any).boxType === item.tool.boxType : true) &&
              ('plantType' in item.tool ? (selectedTool as any).plantType === item.tool.plantType : true);
            return (
              <button
                key={idx}
                onClick={() => setSelectedTool(item.tool as any)}
                className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border-2 transition-all ${
                  isSelected
                    ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                    : 'bg-amber-50/50 border-amber-100 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Grid Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-emerald-50/40 rounded-2xl border-2 border-emerald-100">
          <div
            className="grid gap-1 bg-[#8B5E34] p-3 rounded-2xl border-4 border-[#6F4E27] shadow-lg"
            style={{
              gridTemplateColumns: `repeat(${width}, 46px)`,
              gridTemplateRows: `repeat(${height}, 46px)`,
            }}
          >
            {grid.map((row, y) =>
              row.map((tile, x) => {
                const isPlayer = playerStart.x === x && playerStart.y === y;
                const box = boxes.find(b => b.x === x && b.y === y);
                const plant = plants.find(p => p.x === x && p.y === y);
                const dewdrop = dewdrops.find(d => d.x === x && d.y === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className="relative w-[46px] h-[46px] rounded-xl border border-white/20 bg-emerald-500 hover:scale-105 cursor-pointer flex items-center justify-center select-none text-xs transition-transform active:scale-95 overflow-hidden shadow-xs"
                  >
                    {/* Tile visual representation */}
                    {tile === 'wall' && <div className="w-full h-full bg-[#A67C52] flex items-center justify-center font-black text-amber-100">🪨</div>}
                    {tile === 'water_deep' && <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">🌊</div>}
                    {tile === 'water_spring' && <div className="w-full h-full bg-cyan-400 flex items-center justify-center text-cyan-950 font-black">⛲</div>}
                    {tile === 'ice' && <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-cyan-800">❄️</div>}
                    {tile === 'mud' && <div className="w-full h-full bg-amber-900 flex items-center justify-center text-amber-400">🟫</div>}
                    {tile === 'bridge_wood' && <div className="w-full h-full bg-amber-600 flex items-center justify-center text-white">🪵</div>}
                    {tile === 'plate_red' && <div className="w-full h-full bg-red-900 flex items-center justify-center text-white">🔴</div>}
                    {tile === 'gate_red' && <div className="w-full h-full bg-red-600 flex items-center justify-center text-white font-black">🚪R</div>}
                    {tile === 'plate_blue' && <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white">🔵</div>}
                    {tile === 'gate_blue' && <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black">🚪B</div>}
                    {tile === 'portal_a' && <div className="w-full h-full bg-purple-800 flex items-center justify-center text-white font-bold">🌀1</div>}
                    {tile === 'portal_b' && <div className="w-full h-full bg-fuchsia-800 flex items-center justify-center text-white font-bold">🌀2</div>}
                    {tile === 'purifier' && <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-bold">✨P</div>}

                    {/* Entities */}
                    {box && (
                      <div className="absolute inset-1 rounded-lg bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-black z-10 shadow-xs">
                        {box.type === 'water' ? '💧' : box.type === 'rock' ? '🪨' : box.type === 'ice_block' ? '🧊' : '📦'}
                      </div>
                    )}

                    {plant && (
                      <div className="absolute inset-1 rounded-lg bg-emerald-700 border-2 border-emerald-300 flex items-center justify-center text-sm z-10 shadow-xs">
                        {plant.type === 'ancient_tree' ? '🌳' : plant.type === 'lotus' ? '🪷' : '🌸'}
                      </div>
                    )}

                    {dewdrop && (
                      <div className="absolute inset-2 rounded-full bg-cyan-300 border-2 border-white flex items-center justify-center text-[8px] z-10 shadow-xs">
                        ✨
                      </div>
                    )}

                    {isPlayer && (
                      <div className="absolute inset-1 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-sm z-20 shadow-md">
                        🧑‍🌾
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
