import { PathConfig, Obstacle, ObstacleType, PathIndex } from '../types/game';

export const PATH_CONFIGS: Record<PathIndex, PathConfig> = {
  0: {
    id: 0,
    name: 'Rapid Rapids',
    subtitle: 'Rushing Torrent (+25% Speed)',
    speedMultiplier: 1.25,
    color: '#0284c7',
    waterColor: '#0369a1',
    description: 'Fastest current with treacherous rocks, mines and whirlpools. High risk, high reward!',
    dangerLevel: 'High',
    perk: '+25% Speed Boost'
  },
  1: {
    id: 1,
    name: 'Standard Stream',
    subtitle: 'Balanced Cruise (1.0x Speed)',
    speedMultiplier: 1.0,
    color: '#0d9488',
    waterColor: '#0f766e',
    description: 'Steady current with buoys, alligators, gold stars and turbo pads.',
    dangerLevel: 'Medium',
    perk: 'Turbo Boosts & Stars'
  },
  2: {
    id: 2,
    name: 'Serene Shallows',
    subtitle: 'Smooth Waters (0.85x Speed)',
    speedMultiplier: 0.85,
    color: '#10b981',
    waterColor: '#047857',
    description: 'Calm and wide with gentle lily pads and fewer hazards. Great for preserving lives!',
    dangerLevel: 'Low',
    perk: 'Safe & Life Preserver'
  }
};

export const TRACK_LENGTH = 3200; // Total track length in world coordinates

/**
 * Intelligent Obstacle Course Generator
 * Creates well-spaced, rhythmic challenge sections across the 3 river paths.
 * Guarantees that there is always at least one navigable safe lane at every point,
 * while creating exciting slalom patterns, chokepoints, and high-speed decision gates.
 */
export function generateTrackObstacles(trackLength: number = TRACK_LENGTH, seed: number = 42): Obstacle[] {
  const obstacles: Obstacle[] = [];
  let idCounter = 1;

  // Seeded pseudo-random generator
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Safe starting stretch and finish stretch
  const startSafe = 280;
  const finishSafe = trackLength - 220;

  // Track cursor for structured wave generation
  let currentX = startSafe;

  // Section 1: Warmup & Slalom Introduction (X: 280 to 750)
  // Clean single-lane obstacles spaced ~140-180m apart, teaching player lane transitions.
  while (currentX < 750) {
    const targetLane = Math.floor(rnd() * 3) as PathIndex;
    const obsType: ObstacleType = targetLane === 0 ? 'rock' : targetLane === 1 ? 'buoy' : 'lilypad';

    obstacles.push({
      id: `obs_${idCounter++}`,
      x: currentX,
      path: targetLane,
      type: obsType,
      width: 36,
      height: 36,
      animationOffset: rnd() * Math.PI * 2,
      rotation: rnd() * 30
    });

    // Reward adjacent open lane with a star
    const rewardLane = ((targetLane + 1) % 3) as PathIndex;
    obstacles.push({
      id: `star_${idCounter++}`,
      x: currentX + 35,
      path: rewardLane,
      type: 'star',
      width: 28,
      height: 28,
      isPickup: true,
      animationOffset: rnd() * Math.PI * 2
    });

    // Spacing between obstacle gates
    currentX += 140 + rnd() * 40;
  }

  // Section 2: Chokepoints & Path Divergence (X: 750 to 1450)
  // Two lanes blocked simultaneously, forcing precise lane switches. Spaced ~120-150m apart.
  while (currentX < 1450) {
    const openLane = Math.floor(rnd() * 3) as PathIndex; // Exactly one open lane
    const blockedLanes = ([0, 1, 2] as PathIndex[]).filter(l => l !== openLane);

    blockedLanes.forEach((lane, idx) => {
      let obsType: ObstacleType = 'rock';
      if (lane === 0) obsType = rnd() < 0.5 ? 'mine' : 'whirlpool';
      else if (lane === 1) obsType = rnd() < 0.5 ? 'alligator' : 'log';
      else obsType = rnd() < 0.5 ? 'sandbar' : 'duck_family';

      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX + (idx * 20), // slight stagger for natural look
        path: lane,
        type: obsType,
        width: 38,
        height: 34,
        animationOffset: rnd() * Math.PI * 2,
        rotation: obsType === 'log' ? (rnd() - 0.5) * 25 : 0
      });
    });

    // In open lane, add a Turbo Pad or Star
    if (rnd() < 0.55) {
      obstacles.push({
        id: `turbo_${idCounter++}`,
        x: currentX + 40,
        path: openLane,
        type: openLane === 1 ? 'turbo_pad' : 'star',
        width: 36,
        height: 30,
        isPickup: true,
        animationOffset: rnd() * Math.PI * 2
      });
    }

    currentX += 125 + rnd() * 35;
  }

  // Section 3: Rapid Slalom Speed Tunnel (X: 1450 to 2200)
  // Dynamic alternating sequence: Path 0 -> Path 1 -> Path 2 -> Path 1 -> Path 0
  // Rhythmic spacing with high-speed turbo boosts and stars in transition corridors.
  let slalomStep = 0;
  while (currentX < 2200) {
    const blockedLane = (slalomStep % 3) as PathIndex;
    const secondaryBlock = ((slalomStep + 2) % 3) as PathIndex;
    const sweetSpotLane = ((slalomStep + 1) % 3) as PathIndex;

    // Primary obstacle
    obstacles.push({
      id: `obs_${idCounter++}`,
      x: currentX,
      path: blockedLane,
      type: blockedLane === 0 ? 'mine' : blockedLane === 1 ? 'buoy' : 'sandbar',
      width: 38,
      height: 38,
      animationOffset: rnd() * Math.PI * 2
    });

    // Secondary obstacle spaced slightly ahead to create a weaving S-curve
    if (rnd() < 0.7) {
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX + 45,
        path: secondaryBlock,
        type: secondaryBlock === 0 ? 'rock' : secondaryBlock === 1 ? 'log' : 'lilypad',
        width: 40,
        height: 32,
        animationOffset: rnd() * Math.PI * 2
      });
    }

    // Sweet spot reward for skilled steering
    obstacles.push({
      id: `pickup_${idCounter++}`,
      x: currentX + 25,
      path: sweetSpotLane,
      type: rnd() < 0.4 ? 'turbo_pad' : 'star',
      width: 30,
      height: 30,
      isPickup: true,
      animationOffset: rnd() * Math.PI * 2
    });

    slalomStep++;
    currentX += 110 + rnd() * 30; // Crisp spacing for high-speed maneuvering
  }

  // Section 4: The Final Rapids Gauntlet (X: 2200 to finishSafe)
  // Challenging mixed hazards with spinning whirlpools, alligators, drifting logs, and mines!
  // Evenly spaced at 100-130m intervals to test reflexes and endurance.
  while (currentX < finishSafe) {
    const patternType = rnd();

    if (patternType < 0.4) {
      // Fork Gate: Rapids hazard (mine) and Shallows hazard (duck family), Middle stream is open with star
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX,
        path: 0,
        type: 'whirlpool',
        width: 46,
        height: 46,
        animationOffset: rnd() * Math.PI * 2
      });
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX + 20,
        path: 2,
        type: 'alligator',
        width: 52,
        height: 24,
        animationOffset: rnd() * Math.PI * 2
      });
      obstacles.push({
        id: `star_${idCounter++}`,
        x: currentX + 10,
        path: 1,
        type: 'star',
        width: 28,
        height: 28,
        isPickup: true,
        animationOffset: rnd() * Math.PI * 2
      });
    } else if (patternType < 0.75) {
      // Middle Stream Blocked: forcing choice between High-Speed Rapids (Path 0) or Calm Shallows (Path 2)
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX,
        path: 1,
        type: 'log',
        width: 52,
        height: 24,
        rotation: (rnd() - 0.5) * 20,
        animationOffset: rnd() * Math.PI * 2
      });

      // Rapids has a turbo pad with a nearby rock, Shallows has a safe star
      obstacles.push({
        id: `turbo_${idCounter++}`,
        x: currentX + 30,
        path: 0,
        type: 'turbo_pad',
        width: 36,
        height: 30,
        isPickup: true,
        animationOffset: rnd() * Math.PI * 2
      });
      obstacles.push({
        id: `star_${idCounter++}`,
        x: currentX + 30,
        path: 2,
        type: 'star',
        width: 28,
        height: 28,
        isPickup: true,
        animationOffset: rnd() * Math.PI * 2
      });
    } else {
      // Staggered Triple Gate (weaving test)
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX,
        path: 0,
        type: 'rock',
        width: 38,
        height: 38,
        animationOffset: rnd() * Math.PI * 2
      });
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX + 50,
        path: 1,
        type: 'buoy',
        width: 32,
        height: 32,
        animationOffset: rnd() * Math.PI * 2
      });
      obstacles.push({
        id: `obs_${idCounter++}`,
        x: currentX + 100,
        path: 2,
        type: 'sandbar',
        width: 50,
        height: 26,
        animationOffset: rnd() * Math.PI * 2
      });
      currentX += 50;
    }

    currentX += 115 + rnd() * 30;
  }

  // Sort by longitudinal X coordinate
  return obstacles.sort((a, b) => a.x - b.x);
}
