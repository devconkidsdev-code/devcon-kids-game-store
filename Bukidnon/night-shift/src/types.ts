export type Room = 'break_room' | 'storage_room' | 'hallway' | 'office_entrance';

export interface GameState {
  currentView: 'office' | 'cameras';
  activeCamera: Room;
  monsterPosition: Room | 'office' | null;
  doorLocked: boolean;
  powerLevel: number;
  time: number; // 12 to 6
  gameOver: boolean;
  gameWon: boolean;
  jumpscare: boolean;
}
