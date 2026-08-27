import { Tile, OverheadLight, SpookyEyes } from '../types';

export class LightingEngine {
  private dustMotes: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

  constructor() {
    // Generate floating dust motes
    for (let i = 0; i < 50; i++) {
      this.dustMotes.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 + 2,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  /**
   * Lighting disabled per user request: Full clear visibility without flashlight beams or light cones
   */
  public renderLighting(
    _ctx: CanvasRenderingContext2D,
    _viewWidth: number,
    _viewHeight: number,
    _cameraX: number,
    _cameraY: number,
    _playerX: number,
    _playerY: number,
    _aimAngle: number,
    _hasNightVision: boolean,
    _ambientDarkness: number,
    _tiles: Tile[][],
    _tileSize: number,
    _overheadLights: OverheadLight[],
    spookyEyes: SpookyEyes[],
    _time: number
  ) {
    // Spooky eyes scurry when player is nearby
    spookyEyes.forEach(eyes => {
      if (eyes.isScared) return;
      const dx = eyes.x - _playerX;
      const dy = eyes.y - _playerY;
      const dist = Math.hypot(dx, dy);
      if (dist < 160) {
        eyes.isScared = true;
      }
    });
  }
}

