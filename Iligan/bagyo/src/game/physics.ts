import { DexterPlayer, Platform, Ladder, SupplyItem, Hazard, RescueBoat, Particle } from '../types';
import { soundManager } from '../audio/soundManager';

export const GRAVITY = 0.55;
export const WATER_GRAVITY = 0.12;
export const MAX_FALL_SPEED = 14;
export const WATER_MAX_FALL_SPEED = 3.5;
export const WALK_SPEED = 4.2;
export const SPRINT_SPEED = 6.8;
export const SWIM_SPEED_X = 3.2;
export const SWIM_SPEED_Y = 3.8;
export const JUMP_FORCE = -11.5;
export const CLIMB_SPEED = 4.0;

export interface UpdatePhysicsResult {
  collectedItem: SupplyItem | null;
  hitHazard: Hazard | null;
  electrocuted: boolean;
  livesLost: number;
  reachedBoat: boolean;
  drowned: boolean;
  spawnParticles: Particle[];
}

export function updatePhysics(
  player: DexterPlayer,
  keys: { up: boolean; down: boolean; left: boolean; right: boolean; sprint: boolean },
  waterLevel: number,
  platforms: Platform[],
  ladders: Ladder[],
  supplies: SupplyItem[],
  hazards: Hazard[],
  boat: RescueBoat,
  windForce: number,
  delta: number // in seconds
): UpdatePhysicsResult {
  const result: UpdatePhysicsResult = {
    collectedItem: null,
    hitHazard: null,
    electrocuted: false,
    livesLost: 0,
    reachedBoat: false,
    drowned: false,
    spawnParticles: [],
  };

  // Invulnerability timer countdown
  if (player.isInvulnerable) {
    player.invulnerableTimer -= delta;
    if (player.invulnerableTimer <= 0) {
      player.isInvulnerable = false;
    }
  }

  // Electrocuted animation timer
  if (player.isElectrocuted) {
    player.electrocutedTimer -= delta;
    if (player.electrocutedTimer <= 0) {
      player.isElectrocuted = false;
    }
  }

  // Check Water immersion
  const playerFeet = player.y + player.height;
  const playerHead = player.y;
  const playerMid = player.y + player.height * 0.5;

  const wasSwimming = player.isSwimming;
  player.isSwimming = playerFeet > waterLevel;
  player.isSubmerged = playerHead > waterLevel - 8;

  // Splash sound on entering water
  if (!wasSwimming && player.isSwimming) {
    soundManager.playSplash();
    for (let i = 0; i < 12; i++) {
      result.spawnParticles.push({
        x: player.x + player.width * 0.5 + (Math.random() * 20 - 10),
        y: waterLevel,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        size: Math.random() * 4 + 2,
        color: '#93c5fd',
        alpha: 0.8,
        life: 0,
        maxLife: 0.5,
        type: 'SPLASH',
      });
    }
  }

  // Oxygen handling
  if (player.isSubmerged) {
    // Deplete oxygen: ~10s default, ~18s with life vest
    const depletionRate = player.hasLifeVest ? 5.5 : 10.0;
    player.oxygen = Math.max(0, player.oxygen - depletionRate * delta);
    
    // Bubble particles
    if (Math.random() < 0.15) {
      result.spawnParticles.push({
        x: player.x + (player.facing === 'right' ? player.width - 4 : 4),
        y: player.y + 12,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 2 - 1,
        size: Math.random() * 3 + 2,
        color: '#bfdbfe',
        alpha: 0.7,
        life: 0,
        maxLife: 1.2,
        type: 'BUBBLE',
      });
    }

    if (player.oxygen <= 0) {
      result.drowned = true;
    }
  } else {
    // Replenish oxygen quickly when breathing air
    if (player.oxygen < 100) {
      if (player.oxygen < 30 && wasSwimming) {
        soundManager.playGasp();
      }
      player.oxygen = Math.min(100, player.oxygen + 45 * delta);
    }
  }

  // Stamina regeneration / consumption
  const isMoving = keys.left || keys.right || keys.up || keys.down;
  if (keys.sprint && isMoving && player.stamina > 5) {
    player.isSprinting = true;
    player.stamina = Math.max(0, player.stamina - 20 * delta);
  } else {
    player.isSprinting = false;
    player.stamina = Math.min(100, player.stamina + 15 * delta);
  }

  // Ladder Check
  let onLadder = false;
  let activeLadder: Ladder | null = null;
  for (const lad of ladders) {
    const xOverlap = player.x + player.width > lad.x - 6 && player.x < lad.x + lad.width + 6;
    // Allow vertical engagement from slightly above the ladder top (for descending) to the base
    const yOverlap = playerFeet >= lad.y - 12 && playerHead <= lad.y + lad.height + 8;
    if (xOverlap && yOverlap) {
      onLadder = true;
      activeLadder = lad;
      break;
    }
  }

  // If on ladder and pressing UP or DOWN, start climbing
  if (onLadder && (keys.up || keys.down)) {
    player.isClimbing = true;
  }
  // If player moves completely away from ladder
  if (!onLadder) {
    player.isClimbing = false;
  }

  // Update floating platforms (rise with flood water!)
  for (const p of platforms) {
    if (p.type === 'FLOATING' && p.origY !== undefined) {
      if (waterLevel < p.origY + p.height) {
        // Platform is buoyed by water
        p.y = waterLevel - p.height * 0.7;
      } else {
        p.y = p.origY;
      }
    }
  }

  // --- MOVEMENT LOGIC ---
  if (player.isClimbing) {
    player.vx = 0;
    player.vy = 0;
    if (keys.up) {
      player.vy = -CLIMB_SPEED;
    }
    if (keys.down) {
      player.vy = CLIMB_SPEED;
    }
    if (keys.left) {
      player.vx = -WALK_SPEED * 0.7;
      player.facing = 'left';
    }
    if (keys.right) {
      player.vx = WALK_SPEED * 0.7;
      player.facing = 'right';
    }

    // Reached above the ladder top onto the summit/roof
    if (activeLadder && playerFeet < activeLadder.y - 2 && keys.up) {
      player.isClimbing = false;
      player.isGrounded = true;
    }
    // Reached bottom of the ladder
    if (activeLadder && playerFeet > activeLadder.y + activeLadder.height + 6 && keys.down) {
      player.isClimbing = false;
    }
  } else if (player.isSwimming) {
    // Water Physics
    const speedMult = player.hasLifeVest ? 1.4 : 1.0;
    const sprintMult = player.isSprinting ? 1.3 : 1.0;
    const curSwimSpeedX = SWIM_SPEED_X * speedMult * sprintMult;
    const curSwimSpeedY = SWIM_SPEED_Y * speedMult * sprintMult;

    // Horizontal
    if (keys.left) {
      player.vx = -curSwimSpeedX;
      player.facing = 'left';
    } else if (keys.right) {
      player.vx = curSwimSpeedX;
      player.facing = 'right';
    } else {
      player.vx *= 0.85; // water drag
    }

    // Vertical / Buoyancy
    const naturalBuoyancy = player.hasLifeVest ? -1.8 : -0.6;
    if (keys.up) {
      player.vy = -curSwimSpeedY;
      // If at surface of water and pressing up, can leap slightly out of water
      if (playerFeet <= waterLevel + 16) {
        player.vy = JUMP_FORCE * 0.85;
      }
    } else if (keys.down) {
      player.vy = curSwimSpeedY * 0.8;
    } else {
      player.vy += naturalBuoyancy * 0.2;
      player.vy *= 0.88; // water drag
    }

    // Cap water speed
    player.vy = Math.max(-WATER_MAX_FALL_SPEED * 1.5, Math.min(WATER_MAX_FALL_SPEED, player.vy));

  } else {
    // Land / Air Physics
    const currentSpeed = (player.isSprinting ? SPRINT_SPEED : WALK_SPEED);

    if (keys.left) {
      player.vx = -currentSpeed;
      player.facing = 'left';
    } else if (keys.right) {
      player.vx = currentSpeed;
      player.facing = 'right';
    } else {
      player.vx *= player.isGrounded ? 0.65 : 0.92; // ground friction
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    // Apply Wind Push if high in air/exposed
    if (!player.isGrounded) {
      player.vx += windForce * 0.08;
    }

    // Jump
    if (keys.up && player.isGrounded) {
      player.vy = JUMP_FORCE;
      player.isGrounded = false;
      soundManager.playJump();
    }

    // Gravity
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
  }

  // --- COLLISION RESOLUTION ---
  // Horizontal Move
  player.x += player.vx;
  // Boundary limits
  player.x = Math.max(0, Math.min(1400 - player.width, player.x));

  // Vertical Move
  player.y += player.vy;
  player.isGrounded = false;

  // Platform collision
  for (const plat of platforms) {
    if (plat.type === 'CRUMBLING' && plat.durability !== undefined && plat.durability <= 0) {
      // Platform broken, ignore collision
      continue;
    }

    const prevY = player.y - player.vy;
    const playerBottom = player.y + player.height;
    const prevBottom = prevY + player.height;

    // Check if horizontally aligned
    if (player.x + player.width > plat.x && player.x < plat.x + plat.width) {
      // If Dexter is currently climbing a ladder, allow passing through platforms!
      if (player.isClimbing || onLadder) {
        if (keys.up || player.vy < 0) {
          // Climbing UP: Never hit ceiling from below.
          // Only land on platform if Dexter has climbed all the way to the top above the platform
          if (prevBottom <= plat.y + 4 && playerBottom >= plat.y && player.vy >= 0) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
          continue;
        }

        if (keys.down || player.vy > 0) {
          // Climbing DOWN: Pass directly down through any platform
          continue;
        }

        // Idle on ladder: maintain position without getting blocked or pushed by platform
        if (player.isClimbing) {
          continue;
        }
      }

      if (plat.type === 'ONE_WAY') {
        // Only land from above, unless pressing DOWN to drop through
        if (prevBottom <= plat.y + 4 && playerBottom >= plat.y && player.vy >= 0) {
          if (!keys.down) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
        }
      } else {
        // Solid / Slippery / Floating / Crumbling
        // Landing on top
        if (prevBottom <= plat.y + 8 && playerBottom >= plat.y && player.vy >= 0) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.isGrounded = true;

          // Crumbling decay
          if (plat.type === 'CRUMBLING' && plat.durability !== undefined) {
            plat.durability = Math.max(0, plat.durability - 80 * delta);
          }

          // Slippery roof effect
          if (plat.type === 'SLIPPERY' && !keys.left && !keys.right) {
            player.vx += player.facing === 'right' ? 0.3 : -0.3;
          }
        }
        // Hitting ceiling from below
        else if (prevY >= plat.y + plat.height - 4 && player.y <= plat.y + plat.height && player.vy < 0) {
          player.y = plat.y + plat.height;
          player.vy = 0;
        }
      }
    }
  }

  // Regrow crumbling platforms after some time
  for (const plat of platforms) {
    if (plat.type === 'CRUMBLING' && plat.durability !== undefined && plat.maxDurability !== undefined) {
      if (plat.durability <= 0) {
        plat.durability += 15 * delta;
        if (plat.durability >= plat.maxDurability) {
          plat.durability = plat.maxDurability;
        }
      }
    }
  }

  // Animation frame timing
  if (Math.abs(player.vx) > 0.5 || (player.isClimbing && Math.abs(player.vy) > 0.5)) {
    player.animationTimer += delta * 10;
    if (player.animationTimer > 1) {
      player.animationFrame = (player.animationFrame + 1) % 4;
      player.animationTimer = 0;
    }
  } else {
    player.animationFrame = 0;
  }

  // --- SUPPLY COLLECTION CHECK ---
  for (const item of supplies) {
    if (!item.collected) {
      const collides = (
        player.x < item.x + item.width &&
        player.x + player.width > item.x &&
        player.y < item.y + item.height &&
        player.y + player.height > item.y
      );

      if (collides) {
        item.collected = true;
        result.collectedItem = item;
        soundManager.playCollect(item.type);

        // Apply item immediate buffs
        if (item.type === 'LIFE_VEST') player.hasLifeVest = true;
        if (item.type === 'FLASHLIGHT') player.hasFlashlight = true;
        if (item.type === 'ROPE') player.hasRope = true;
        if (item.type === 'FIRST_AID') {
          player.stamina = 100;
          player.oxygen = Math.min(100, player.oxygen + 30);
          player.lives = Math.min(player.maxLives, (player.lives ?? 5) + 1);
        }
        if (item.type === 'WATER_BOTTLE' || item.type === 'CANNED_FOOD') {
          player.stamina = Math.min(100, player.stamina + 40);
        }

        // Spawn pickup spark particles
        for (let i = 0; i < 10; i++) {
          result.spawnParticles.push({
            x: item.x + item.width * 0.5,
            y: item.y + item.height * 0.5,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 2,
            size: Math.random() * 4 + 2,
            color: item.color,
            alpha: 1.0,
            life: 0,
            maxLife: 0.6,
            type: 'SPARK',
          });
        }
      }
    }
  }

  // --- HAZARD COLLISION CHECK ---
  for (const hazard of hazards) {
    if (hazard.active && !player.isInvulnerable) {
      // Electric hazard in water or direct contact
      const isSubmergedNearElectric = hazard.type === 'ELECTRIC' && waterLevel < hazard.y + 60 && playerFeet > waterLevel;
      const directOverlap = (
        player.x < hazard.x + hazard.width &&
        player.x + player.width > hazard.x &&
        player.y < hazard.y + hazard.height &&
        player.y + player.height > hazard.y
      );

      if (directOverlap || isSubmergedNearElectric) {
        result.hitHazard = hazard;

        if (hazard.type === 'ELECTRIC') {
          result.electrocuted = true;
          result.livesLost = 1;
          player.lives = Math.max(0, player.lives - 1);
          player.isElectrocuted = true;
          player.electrocutedTimer = 0.9;
          player.isInvulnerable = true;
          player.invulnerableTimer = 1.8;
          player.vy = -8;
          player.vx = player.facing === 'right' ? -7 : 7;
          player.stamina = Math.max(0, player.stamina - 30);
          player.oxygen = Math.max(0, player.oxygen - 15);

          // Electric zap sparks
          for (let i = 0; i < 18; i++) {
            result.spawnParticles.push({
              x: player.x + player.width * 0.5,
              y: player.y + player.height * 0.5,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12 - 2,
              size: Math.random() * 5 + 2,
              color: Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#facc15' : '#ffffff'),
              alpha: 1.0,
              life: 0,
              maxLife: 0.5,
              type: 'SPARK',
            });
          }
        } else {
          // Other physical hazards (falling debris, spikes)
          player.isInvulnerable = true;
          player.invulnerableTimer = 1.2;
          player.vy = -6;
          player.vx = player.facing === 'right' ? -5 : 5;
          player.stamina = Math.max(0, player.stamina - 20);
          player.oxygen = Math.max(0, player.oxygen - 10);

          for (let i = 0; i < 8; i++) {
            result.spawnParticles.push({
              x: player.x + player.width * 0.5,
              y: player.y + player.height * 0.5,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              size: Math.random() * 4 + 2,
              color: '#ef4444',
              alpha: 1.0,
              life: 0,
              maxLife: 0.4,
              type: 'SPARK',
            });
          }
        }
      }
    }
  }

  // --- RESCUE BOAT CHECK ---
  const boatOverlap = (
    player.x + player.width > boat.x + 20 &&
    player.x < boat.x + boat.width - 20 &&
    player.y + player.height > boat.y &&
    player.y < boat.y + boat.height + 40
  );

  if (boatOverlap) {
    result.reachedBoat = true;
    boat.isRescued = true;
  }

  return result;
}
