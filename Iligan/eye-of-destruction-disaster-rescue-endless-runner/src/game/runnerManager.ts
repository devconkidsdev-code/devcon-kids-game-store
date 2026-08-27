import { Lane, ObstacleType, CollectibleType, RunnerObstacle, RunnerCollectible } from '../types';
import { Game3DEngine } from './threeEngine';
import { sound } from '../audio/soundEffects';

export class RunnerManager {
  private engine: Game3DEngine;
  public obstacles: RunnerObstacle[] = [];
  public collectibles: RunnerCollectible[] = [];
  private nextObstacleId: number = 1;
  private nextCollectibleId: number = 1;
  private spawnTimer: number = 0;
  private lastSpawnZ: number = -40;
  private invulnerableTimer: number = 0;

  constructor(engine: Game3DEngine) {
    this.engine = engine;
  }

  public reset(startDistance: number = 0) {
    // Clear existing meshes
    this.obstacles.forEach((obs) => this.engine.removeObstacleMesh(obs.id));
    this.collectibles.forEach((col) => this.engine.removeCollectibleMesh(col.id));
    this.obstacles = [];
    this.collectibles = [];
    this.lastSpawnZ = -40;
    this.spawnTimer = 0;
    this.invulnerableTimer = 0;
  }

  /**
   * Spawns obstacles and collectibles along the 3 lanes ahead of the player
   */
  public update(
    delta: number,
    speed: number,
    playerLane: Lane,
    playerX: number,
    playerY: number,
    isJumping: boolean,
    isSliding: boolean,
    hasShield: boolean,
    onCrash: () => void,
    onCollect: (type: CollectibleType) => void,
    distanceRemaining: number
  ) {
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
    }

    // Move obstacles towards player (+Z direction)
    const moveZ = speed * delta;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.z += moveZ;

      const mesh = (this.engine as any).obstacleMeshes?.get(obs.id);
      if (mesh) {
        mesh.position.z = obs.z;
      }

      // Collision Check when close to player (z between -2.2 and 1.8)
      if (!obs.passed && obs.z > -2.2 && obs.z < 1.8) {
        const laneX = obs.lane * 3.5;
        const xDist = Math.abs(playerX - laneX);

        if (xDist < 1.6) {
          // Check clearance based on obstacle type and player actions
          let hit = false;

          if (obs.type === 'RUBBLE_PILE' || obs.type === 'ROAD_BARRIER' || obs.type === 'CRACKED_FISSURE_JUMP') {
            // Can be avoided by JUMPING over (playerY > 1.2)
            if (!isJumping && playerY < 1.1) {
              hit = true;
            }
          } else if (obs.type === 'FALLEN_SIGN_SLIDE' || obs.type === 'ELECTRIC_HAZARD_SLIDE') {
            // Can be avoided by SLIDING under (isSliding)
            if (!isSliding) {
              hit = true;
            }
          } else if (obs.type === 'OVERTURNED_CAR') {
            // Tall obstacle - must change lane or have great jump height
            if (playerY < 1.8) {
              hit = true;
            }
          }

          if (hit && this.invulnerableTimer <= 0) {
            obs.passed = true;
            this.invulnerableTimer = 1.5;
            onCrash();
          }
        }
      }

      if (obs.z > 2.0) {
        obs.passed = true;
      }

      // Remove obstacles behind camera (z > 25)
      if (obs.z > 25) {
        this.engine.removeObstacleMesh(obs.id);
        this.obstacles.splice(i, 1);
      }
    }

    // Move collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.z += moveZ;

      const mesh = (this.engine as any).collectibleMeshes?.get(col.id);
      if (mesh) {
        mesh.position.z = col.z;
      }

      // Collection Check (z between -2.5 and 2.0)
      if (!col.collected && col.z > -2.5 && col.z < 2.0) {
        const laneX = col.lane * 3.5;
        const xDist = Math.abs(playerX - laneX);

        if (xDist < 1.8) {
          col.collected = true;
          this.engine.removeCollectibleMesh(col.id);
          this.collectibles.splice(i, 1);
          onCollect(col.type);
          continue;
        }
      }

      // Remove behind camera
      if (col.z > 25) {
        this.engine.removeCollectibleMesh(col.id);
        this.collectibles.splice(i, 1);
      }
    }

    // Do not spawn obstacles if very close to stopping station (within 40m)
    if (distanceRemaining < 40) return;

    // Spawn new obstacles & collectibles forward
    this.spawnTimer += delta;
    if (this.spawnTimer > 0.85) {
      this.spawnTimer = 0;
      this.spawnPattern();
    }
  }

  /**
   * Generates exciting Subway Surfers style track patterns
   */
  private spawnPattern() {
    const lanes: Lane[] = [-1, 0, 1];
    const spawnZ = -80 - Math.random() * 20;

    const patternType = Math.floor(Math.random() * 6);

    if (patternType === 0) {
      // Single Rubble Barrier + Med Kit line in open lane
      const blockedLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.addObstacle('RUBBLE_PILE', blockedLane, spawnZ);

      const openLanes = lanes.filter((l) => l !== blockedLane);
      const rewardLane = openLanes[Math.floor(Math.random() * openLanes.length)];
      this.addCollectibleRow('MED_KIT', rewardLane, spawnZ, 3);
    } else if (patternType === 1) {
      // Overhead Highway Sign across 2 lanes (Must SLIDE or use third lane)
      const freeLane = lanes[Math.floor(Math.random() * lanes.length)];
      const slideLanes = lanes.filter((l) => l !== freeLane);

      slideLanes.forEach((l) => {
        this.addObstacle('FALLEN_SIGN_SLIDE', l, spawnZ);
      });

      this.addCollectibleRow('REPAIR_MATERIAL', freeLane, spawnZ, 3);
    } else if (patternType === 2) {
      // Overturned Disaster Car + Repair materials
      const carLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.addObstacle('OVERTURNED_CAR', carLane, spawnZ);

      const otherLanes = lanes.filter((l) => l !== carLane);
      this.addCollectible('COIN', otherLanes[0], spawnZ - 5);
      this.addCollectible('REPAIR_MATERIAL', otherLanes[1], spawnZ - 5);
    } else if (patternType === 3) {
      // Cracked Fissure Jump in center lane + High Shield powerup
      this.addObstacle('CRACKED_FISSURE_JUMP', 0, spawnZ);
      this.addCollectible('SHIELD', 0, spawnZ, 1.6); // Elevated above jump!

      this.addObstacle('ROAD_BARRIER', -1, spawnZ + 15);
      this.addCollectibleRow('MED_KIT', 1, spawnZ + 15, 2);
    } else if (patternType === 4) {
      // Double Road Barrier Trap (Requires fast lane reflex or Jump)
      const freeLane = lanes[Math.floor(Math.random() * lanes.length)];
      lanes.forEach((l) => {
        if (l !== freeLane) {
          this.addObstacle('ROAD_BARRIER', l, spawnZ);
        } else {
          this.addCollectible('NITRO', l, spawnZ);
        }
      });
    } else {
      // Electric hazard wire slide + Coin trail
      const wireLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.addObstacle('ELECTRIC_HAZARD_SLIDE', wireLane, spawnZ);

      const coinLane = lanes[(lanes.indexOf(wireLane) + 1) % 3];
      this.addCollectibleRow('COIN', coinLane, spawnZ, 4);
    }
  }

  private addObstacle(type: ObstacleType, lane: Lane, z: number) {
    const id = this.nextObstacleId++;
    this.obstacles.push({
      id,
      lane,
      z,
      type,
      passed: false,
    });
    this.engine.createObstacleMesh(type, lane, z, id);
  }

  private addCollectible(type: CollectibleType, lane: Lane, z: number, yOffset: number = 0) {
    const id = this.nextCollectibleId++;
    this.collectibles.push({
      id,
      lane,
      z,
      type,
      collected: false,
      yOffset,
    });
    this.engine.createCollectibleMesh(type, lane, z, id, yOffset);
  }

  private addCollectibleRow(type: CollectibleType, lane: Lane, startZ: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.addCollectible(type, lane, startZ - i * 6);
    }
  }
}
