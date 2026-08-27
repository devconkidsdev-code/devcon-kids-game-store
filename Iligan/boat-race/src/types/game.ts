export type PathIndex = 0 | 1 | 2; // 0: Upper (Rapids), 1: Middle (Standard), 2: Lower (Shallows)

export interface PathConfig {
  id: PathIndex;
  name: string;
  subtitle: string;
  speedMultiplier: number;
  color: string;
  waterColor: string;
  description: string;
  dangerLevel: 'High' | 'Medium' | 'Low';
  perk: string;
}

export type ObstacleType = 
  | 'rock' 
  | 'whirlpool' 
  | 'mine' 
  | 'log' 
  | 'buoy' 
  | 'alligator' 
  | 'duck_family' 
  | 'lilypad' 
  | 'sandbar'
  | 'star'
  | 'turbo_pad';

export interface Obstacle {
  id: string;
  x: number; // Distance down track (0 to TRACK_LENGTH)
  path: PathIndex;
  type: ObstacleType;
  width: number;
  height: number;
  isPickup?: boolean;
  collected?: boolean;
  active?: boolean;
  animationOffset: number;
  rotation?: number;
  speedY?: number; // for bobbing / moving hazards
}

export type CharacterGender = 'woman' | 'man';

export interface BoatCustomization {
  id: string;
  name: string;
  gender: CharacterGender;
  boatColor: string;
  trimColor: string;
  boatType: 'speedboat' | 'jetski' | 'hovercraft' | 'dragonboat';
  character: string;
  characterName: string;
}

export interface PlayerRunData {
  timeElapsed: number;
  timeLeft: number;
  livesRemaining: number;
  finished: boolean;
  dnf: boolean;
  distanceTraveled: number;
  obstaclesHit: number;
  starsCollected: number;
  pathSwitches: number;
  score: number;
  pathHistory: { t: number; x: number; path: PathIndex }[]; // for ghost replay
}

export interface RoundResult {
  roundNumber: 1 | 2;
  starterPlayerId: 'player1' | 'player2';
  player1Result: PlayerRunData;
  player2Result: PlayerRunData;
  winner: 'player1' | 'player2' | 'tie';
}

export type GamePhase = 
  | 'menu' 
  | 'round_intro' 
  | 'countdown' 
  | 'racing' 
  | 'paused' 
  | 'round_over' 
  | 'final_results';

export type RacingMode = 'turn_based' | 'simultaneous'; // turn-based staggered vs simultaneous 2-player

export interface GameSettings {
  roundDuration: number; // in seconds (e.g. 45)
  trackLength: number; // e.g. 3200
  soundEnabled: boolean;
  musicEnabled: boolean;
  mode: RacingMode;
  vsAI: boolean; // Player 2 controlled by AI in solo play
}
