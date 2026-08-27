import { Room } from '../types';

import breakRoomImg from '../assets/images/break_room_1786687497676.jpg';
import hallwayImg from '../assets/images/hallway_1786687532757.jpg';
import officeEntranceImg from '../assets/images/office_entrance_1786687549652.jpg';
import storageRoomImg from '../assets/images/storage_room_1786687517152.jpg';
import monsterImg from '../assets/images/monster_overlay_1786687600081.jpg';

const roomImages: Record<Room, string> = {
  break_room: breakRoomImg,
  storage_room: storageRoomImg,
  hallway: hallwayImg,
  office_entrance: officeEntranceImg,
};

const roomNames: Record<Room, string> = {
  break_room: 'CAM 01 - Break Room',
  storage_room: 'CAM 02 - Storage',
  hallway: 'CAM 03 - Hallway',
  office_entrance: 'CAM 04 - Office Entrance',
};

interface CameraViewProps {
  activeCamera: Room;
  monsterPosition: Room | 'office' | null;
}

export function CameraView({ activeCamera, monsterPosition }: CameraViewProps) {
  const hasMonster = activeCamera === monsterPosition;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-75"
        style={{ backgroundImage: `url(${roomImages[activeCamera]})` }}
      />
      
      {/* Monster Overlay */}
      {hasMonster && (
        <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-multiply pointer-events-none">
          <img src={monsterImg} alt="" className="w-full h-full object-cover grayscale contrast-150" />
        </div>
      )}
      
      {/* Recording indicator */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-50">
        <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626] animate-pulse"></div>
        <span className="font-mono text-xs tracking-widest text-red-600 uppercase font-bold drop-shadow-md">Live Feed</span>
      </div>
      
      {/* Camera Meta */}
      <div className="absolute top-8 right-8 z-50 text-right font-mono text-[10px] opacity-40 leading-tight uppercase tracking-tighter text-[#D1D1D1]">
        ISO 3200 <br/> f/1.8 <br/> 1/60s
      </div>

      {/* Camera Label */}
      <div className="absolute bottom-8 right-8 z-50 text-right">
        <p className="font-mono text-[10px] opacity-40 uppercase tracking-[0.2em] text-[#D1D1D1] mb-1">St. Jude's Sanatorium</p>
        <span className="text-white font-serif text-2xl tracking-wider drop-shadow-md">
          {roomNames[activeCamera]}
        </span>
      </div>
      
      {/* Grain & Effects */}
      <div className="static-overlay" />
      <div className="vignette" />
      <div className="crt" />
    </div>
  );
}
