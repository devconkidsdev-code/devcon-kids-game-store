import { ChapterData, LevelData } from '../types/game';

export const CHAPTERS_DATA: ChapterData[] = [
  {
    id: 1,
    name: "Uh... We're Losing Water!",
    subtitle: 'Every Drop Counts!',
    description: 'Learn basic movement, discover household leaks, stop runaway faucets, and protect the Big Blue Tank.',
    locationName: 'Splashville Village Green',
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    colorTheme: 'from-blue-400 to-cyan-500',
    bgGradient: 'bg-gradient-to-b from-sky-100 via-blue-50 to-emerald-50',
    badge: '💧 Chapter 1',
  },
  {
    id: 2,
    name: 'The Village Is Thirsty',
    subtitle: 'Sharing Is Caring',
    description: 'Help thirsty crops, satisfy Moo-Moo the cow, keep the pigs clean efficiently, and balance village water shares.',
    locationName: 'Sunny Meadow Pastures',
    levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    colorTheme: 'from-amber-400 to-emerald-500',
    bgGradient: 'bg-gradient-to-b from-amber-50 via-lime-50 to-emerald-50',
    badge: '🐮 Chapter 2',
  },
  {
    id: 3,
    name: 'Drought Alert!',
    subtitle: 'Professor Croak’s Forecast',
    description: 'Survive scorching heatwaves, prevent reservoir evaporation, and manage deep groundwater aquifers wisely.',
    locationName: 'Sunbaked Hills & Weather Station',
    levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    colorTheme: 'from-orange-400 to-rose-500',
    bgGradient: 'bg-gradient-to-b from-orange-100 via-amber-50 to-yellow-50',
    badge: '☀️ Chapter 3',
  },
  {
    id: 4,
    name: 'The Great Water Mystery',
    subtitle: 'Detective Bloop on the Case',
    description: 'Water is vanishing without a trace! Follow wet footprints, inspect hidden pipe mazes, and catch the Drippies.',
    locationName: 'Cobblestone Alleys & Underground Pipes',
    levels: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    colorTheme: 'from-indigo-400 to-purple-500',
    bgGradient: 'bg-gradient-to-b from-indigo-50 via-purple-50 to-blue-50',
    badge: '🔍 Chapter 4',
  },
  {
    id: 5,
    name: 'Pollution Problems',
    subtitle: 'Clean Water = Safe Water',
    description: 'Stop Mr. Sludge’s careless factory runoff, build multi-layer bio-filters, and restore river aquatic wildlife.',
    locationName: 'Sludge River & Industrial Outskirts',
    levels: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    colorTheme: 'from-emerald-500 to-teal-600',
    bgGradient: 'bg-gradient-to-b from-teal-50 via-emerald-50 to-cyan-50',
    badge: '🌿 Chapter 5',
  },
  {
    id: 6,
    name: 'Farm Frenzy',
    subtitle: 'Smart Agriculture & Drip Irrigation',
    description: 'Replace wasteful sprinklers with micro-drip emitters, test soil moisture sensors, and plant drought-resilient crops.',
    locationName: 'Bramble Berry Orchards & Farmland',
    levels: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    colorTheme: 'from-lime-500 to-green-600',
    bgGradient: 'bg-gradient-to-b from-lime-50 via-emerald-50 to-green-50',
    badge: '🌾 Chapter 6',
  },
  {
    id: 7,
    name: 'Rainy Day Heroes',
    subtitle: 'Harvesting the Storm',
    description: 'Install rooftop gutters, set up rain barrel networks, restore sponge wetlands, and celebrate with the Rain Dance!',
    locationName: 'Raincloud Ridge & Wetland Sponges',
    levels: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    colorTheme: 'from-cyan-400 to-blue-600',
    bgGradient: 'bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-100',
    badge: '🌧️ Chapter 7',
  },
  {
    id: 8,
    name: 'The City Drinks Too Much',
    subtitle: 'Splash City Expansion',
    description: 'Tackle big-city water demand with smart meters, fix leaky civic fountains, and stop marathon car-washing.',
    locationName: 'Splash City Plaza & Water Tower',
    levels: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
    colorTheme: 'from-violet-400 to-fuchsia-500',
    bgGradient: 'bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50',
    badge: '🏙️ Chapter 8',
  },
  {
    id: 9,
    name: 'The Last Days',
    subtitle: 'Critical Decisions & Drought Defense',
    description: 'With the Big Blue Tank critically low, make high-stakes conservation choices to keep homes and clinics supplied.',
    locationName: 'Desolation Pass & Village Clinic',
    levels: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
    colorTheme: 'from-rose-400 to-amber-600',
    bgGradient: 'bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50',
    badge: '⏳ Chapter 9',
  },
  {
    id: 10,
    name: 'THE GREAT WATER PANIC',
    subtitle: 'The Grand Finale — The Last Drop',
    description: 'Unite every conservation system, protect the final drops of water, and welcome the long-awaited rainy season!',
    locationName: 'The Great Reservoir & Village Heart',
    levels: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100],
    colorTheme: 'from-sky-500 to-indigo-700',
    bgGradient: 'bg-gradient-to-b from-sky-100 via-blue-100 to-indigo-100',
    badge: '🌟 Chapter 10',
  },
];

// Helper to construct level data smoothly across all 100 levels
export const ALL_LEVELS: LevelData[] = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const chapter = Math.ceil(id / 10);
  const indexInChapter = (id - 1) % 10 + 1;

  // Chapter 1: 1-10
  if (chapter === 1) {
    const titles = [
      'The Dripping Faucet',
      'The Running Kitchen Tap',
      'The Leaky Garden Pipe',
      'Clucky’s 45-Minute Shower',
      'The Mystery of the Water Meter',
      'First Upgrade: The Aerator',
      'Countdown to the Dry Season',
      'The Mini-Heatwave',
      'Splashville Double Leak',
      'Every Drop Counts!',
    ];
    const types: LevelData['type'][] = [
      'action_patrol',
      'action_patrol',
      'pipe_puzzle',
      'action_patrol',
      'detective',
      'distribution',
      'action_patrol',
      'action_patrol',
      'pipe_puzzle',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 1 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'mayor_puddle',
          speakerName: 'Mayor Puddle',
          text: `Bloop! Welcome to Splashville! The Big Blue Tank only has 30 days of water left before rain arrives!`,
          expression: 'worried',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Don't worry Mayor! I'll investigate every pipe and stop all wasteful leaks!`,
          expression: 'happy',
        },
      ],
      storyOutro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `We saved thousands of drops! If everyone fixes simple leaks, a whole town can save millions of litres.`,
          expression: 'proud',
        },
      ],
      objectiveText: indexInChapter === 3 || indexInChapter === 9
        ? 'Rotate and connect the pipes to restore clean water without spilling a single drop!'
        : 'Patrol the area, turn off dripping taps, and collect stray water droplets before they evaporate!',
      educationalTitle: 'Household Leak Prevention',
      educationalLesson: 'A single faucet dripping once per second can waste over 3,000 gallons (11,000 litres) of freshwater every year!',
      targetWaterSaved: 50 + id * 20,
      initialWater: 1000 - id * 5,
      rewards: {
        ecoCoins: 40 + id * 5,
        drops: 30 + id * 2,
        unlockItemId: id === 5 ? 'hat_straw' : id === 10 ? 'backpack_bubble' : undefined,
      },
    };
  }

  // Chapter 2: 11-20
  if (chapter === 2) {
    const titles = [
      'Farmer Bramble’s Big Hose Mistake',
      'Moo-Moo’s Secret Sip',
      'Pippin’s Muddy Puddle Splash',
      'The Duck Pond Overflow',
      'Fair Shares for Four Paws',
      'The Village Kitchen Rush',
      'Animal Thirst Alert',
      'Moo-Moo Strikes Again!',
      'Pasture Irrigation Setup',
      'Sharing the Big Tank',
    ];
    const types: LevelData['type'][] = [
      'action_patrol',
      'detective',
      'action_patrol',
      'pipe_puzzle',
      'distribution',
      'action_patrol',
      'distribution',
      'action_patrol',
      'farm_irrigation',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 2 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'farmer_bramble',
          speakerName: 'Farmer Bramble',
          text: `My cows are thirsty and my tomatoes are droopy! Where do I hook up my giant hose?!`,
          expression: 'confused',
        },
        {
          speaker: 'moo_moo',
          speakerName: 'Moo-Moo the Cow',
          text: `Moooo! I only drank three bathtubs of emergency water... as a light snack!`,
          expression: 'mischievous',
        },
      ],
      storyOutro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Great teamwork! When we share water fairly between animals and crops, everyone stays healthy!`,
          expression: 'happy',
        },
      ],
      objectiveText: 'Balance water allocations across the farm, satisfy Moo-Moo without draining reserves, and fix leaky troughs!',
      educationalTitle: 'Agricultural Water Sharing',
      educationalLesson: 'Over 70% of all global freshwater is used in agriculture and livestock. Fair and efficient distribution is essential for food security!',
      targetWaterSaved: 200 + id * 25,
      initialWater: 900 - id * 4,
      rewards: {
        ecoCoins: 60 + id * 5,
        drops: 45 + id * 2,
        unlockItemId: id === 15 ? 'outfit_farmer' : id === 20 ? 'decor_cow_trough' : undefined,
      },
    };
  }

  // Chapter 3: 21-30
  if (chapter === 3) {
    const titles = [
      'Professor Croak’s Heatwave Alert',
      'The Evaporating Reservoir',
      'Shading the Village Well',
      'Groundwater Aquifer Pump',
      'The 40°C Scorcher',
      'Emergency Water Reserves',
      'Croak’s Weather Quiz',
      'Deep Well Pipe Puzzle',
      'Sun Shield Deployment',
      'Surviving the Heatwave',
    ];
    const types: LevelData['type'][] = [
      'action_patrol',
      'distribution',
      'action_patrol',
      'pipe_puzzle',
      'action_patrol',
      'distribution',
      'detective',
      'pipe_puzzle',
      'action_patrol',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 3 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'prof_croak',
          speakerName: 'Professor Croak',
          text: `RIBBIT! BREAKING NEWS! IT IS VERY, VERY HOT! The sun is drinking our reservoir like a giant straw!`,
          expression: 'shocked',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `We must cover open reservoirs, reduce midday watering, and protect our deep groundwater!`,
          expression: 'worried',
        },
      ],
      storyOutro: [
        {
          speaker: 'prof_croak',
          speakerName: 'Professor Croak',
          text: `Sensational save! Evaporation rates dropped 80% thanks to shade covers and smart timing!`,
          expression: 'proud',
        },
      ],
      objectiveText: 'Deploy reservoir shade covers, prevent midday evaporation, and pump groundwater sustainably without depleting aquifers!',
      educationalTitle: 'Heatwaves & Evaporation',
      educationalLesson: 'Watering plants early in the morning or late evening prevents up to 30% of water loss caused by rapid evaporation in high heat.',
      targetWaterSaved: 400 + id * 30,
      initialWater: 800 - id * 3,
      rewards: {
        ecoCoins: 90 + id * 5,
        drops: 60 + id * 2,
        unlockItemId: id === 25 ? 'hat_frog' : id === 30 ? 'decor_rain_barrel' : undefined,
      },
    };
  }

  // Chapter 4: 31-40
  if (chapter === 4) {
    const titles = [
      'The Mystery of the Vanishing Drops',
      'Following the Wet Footprints',
      'Underground Drippy Infestation',
      'The Clucky Interrogation',
      'Puddle Trail in the Alley',
      'The Subterranean Maze',
      'Catching the Mischievous Drippy',
      'The Suspicious Duck Convention',
      'Reconnecting the Main Conduit',
      'The Grand Leak Unmasked!',
    ];
    const types: LevelData['type'][] = [
      'detective',
      'detective',
      'action_patrol',
      'detective',
      'detective',
      'pipe_puzzle',
      'action_patrol',
      'detective',
      'pipe_puzzle',
      'detective',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 4 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `500 litres vanished last night! But nobody was using the taps... Let's search for clues!`,
          expression: 'mischievous',
        },
        {
          speaker: 'clucky',
          speakerName: 'Clucky the Chicken',
          text: `Bawk! It wasn't me! I was only practicing my synchronized swimming in the sink!`,
          expression: 'shocked',
        },
      ],
      storyOutro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Case closed! It wasn't one single thief—it was 12 tiny unnoticed pinhole leaks and a Drippy family!`,
          expression: 'happy',
        },
      ],
      objectiveText: 'Follow puddle tracks, interrogate suspects with funny clues, and repair hidden underground pipe fractures!',
      educationalTitle: 'Hidden Underground Leaks',
      educationalLesson: 'Municipal water systems often lose 20% to 40% of treated water underground before it ever reaches homes due to aging hidden pipes!',
      targetWaterSaved: 600 + id * 30,
      initialWater: 700 - id * 3,
      rewards: {
        ecoCoins: 110 + id * 5,
        drops: 75 + id * 2,
        unlockItemId: id === 35 ? 'hat_detective' : id === 40 ? 'accessory_glasses' : undefined,
      },
    };
  }

  // Chapter 5: 41-50
  if (chapter === 5) {
    const titles = [
      'The Murky Sludge River',
      'Mr. Sludge’s Oily Mistake',
      'Building the Sand & Gravel Bio-Filter',
      'Rescuing the Rainbow Trout',
      'Chemical Neutralization Puzzle',
      'Cleaning the Factory Pipes',
      'Eco-Trash Fishing Tournament',
      'Activated Charcoal Filtration',
      'The Reborn Sparkling Creek',
      'Mr. Sludge Goes Green!',
    ];
    const types: LevelData['type'][] = [
      'river_clean',
      'river_clean',
      'river_clean',
      'action_patrol',
      'pipe_puzzle',
      'pipe_puzzle',
      'river_clean',
      'river_clean',
      'river_clean',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 5 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'mr_sludge',
          speakerName: 'Mr. Sludge',
          text: `Why is everyone complaining? My purple factory sparkles make the river look trendy!`,
          expression: 'confused',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Mr. Sludge! Dirty water hurts the fish, poisons the soil, and cannot be used for drinking! Let's build a bio-filter!`,
          expression: 'worried',
        },
      ],
      storyOutro: [
        {
          speaker: 'mr_sludge',
          speakerName: 'Mr. Sludge',
          text: `Wow, look at those fish jumping! Clean water is so much nicer than purple sludge!`,
          expression: 'happy',
        },
      ],
      objectiveText: 'Remove floating debris, assemble multi-layer sand/gravel/charcoal filtration beds, and restore the river ecosystem!',
      educationalTitle: 'Water Pollution & Bio-Filtration',
      educationalLesson: 'Clean water is not just about quantity, but quality. Natural bio-filtration using sand, gravel, and wetlands purifies runoff naturally!',
      targetWaterSaved: 800 + id * 35,
      initialWater: 650 - id * 2,
      rewards: {
        ecoCoins: 130 + id * 5,
        drops: 90 + id * 2,
        unlockItemId: id === 45 ? 'outfit_scuba' : id === 50 ? 'decor_water_fountain' : undefined,
      },
    };
  }

  // Chapter 6: 51-60
  if (chapter === 6) {
    const titles = [
      'The Runaway Sprinkler Rodeo',
      'Installing Micro-Drip Irrigation',
      'Soil Moisture Sensor Grid',
      'Saving Farmer Bramble’s Carrots',
      'Mulching the Strawberry Patch',
      'Drought-Resilient Sorghum & Millet',
      'Irrigation Pipe Grid Alignment',
      'Night-Watering Schedule Setup',
      'The Automated Farm Hub',
      'Bountiful Harvest of Splashville',
    ];
    const types: LevelData['type'][] = [
      'action_patrol',
      'farm_irrigation',
      'farm_irrigation',
      'farm_irrigation',
      'action_patrol',
      'farm_irrigation',
      'pipe_puzzle',
      'distribution',
      'farm_irrigation',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 6 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'farmer_bramble',
          speakerName: 'Farmer Bramble',
          text: `My sprinkler broke loose and is doing spinning cartwheels across the cornfield!`,
          expression: 'shocked',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Time to switch to precision drip irrigation! It delivers water directly to crop roots with 95% efficiency!`,
          expression: 'proud',
        },
      ],
      storyOutro: [
        {
          speaker: 'farmer_bramble',
          speakerName: 'Farmer Bramble',
          text: `My crops are twice as green, and we used less than half the water! Pure magic!`,
          expression: 'excited',
        },
      ],
      objectiveText: 'Lay precision drip lines directly to thirsty plant roots, test soil moisture meters, and avoid wasteful surface flooding!',
      educationalTitle: 'Precision Drip Irrigation',
      educationalLesson: 'Drip irrigation delivers small drops directly to plant root zones, cutting agricultural water waste by 30% to 50% compared to open sprayers.',
      targetWaterSaved: 1000 + id * 35,
      initialWater: 600 - id * 2,
      rewards: {
        ecoCoins: 160 + id * 5,
        drops: 110 + id * 2,
        unlockItemId: id === 55 ? 'backpack_sunflower' : id === 60 ? 'decor_garden_bed' : undefined,
      },
    };
  }

  // Chapter 7: 61-70
  if (chapter === 7) {
    const titles = [
      'The Distant Thunder Clap',
      'Rooftop Gutter Installation',
      'The Village Rain Barrel Network',
      'Sponge Wetland Restoration',
      'Storm Runoff Diversion',
      'The Absurd Villager Rain Dance',
      'Catching the Flash Shower',
      'Connecting the Rain Cisterns',
      'Planting Deep-Rooted Willow Trees',
      'Harvesting 10,000 Litres of Sky Water',
    ];
    const types: LevelData['type'][] = [
      'rain_harvest',
      'rain_harvest',
      'rain_harvest',
      'river_clean',
      'pipe_puzzle',
      'rain_dance',
      'rain_harvest',
      'pipe_puzzle',
      'action_patrol',
      'rain_harvest',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 7 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'prof_croak',
          speakerName: 'Professor Croak',
          text: `RIBBIT! Storm clouds spotted over the ridge! Quick, do the secret frog rain dance!`,
          expression: 'excited',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Dancing is fun, but real preparation means connecting every roof gutter to our rain tanks before the drops fall!`,
          expression: 'happy',
        },
      ],
      storyOutro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `We caught every drop of the flash storm! Rainwater harvesting is like free clean water from the sky!`,
          expression: 'proud',
        },
      ],
      objectiveText: 'Snap roof downspouts to rain barrels, clear leaf filters, and direct storm overflow safely into natural sponge wetlands!',
      educationalTitle: 'Rainwater Harvesting & Sponge Wetlands',
      educationalLesson: 'Harvesting rain reduces reliance on reservoirs. Sponge wetlands absorb torrential rainfall, recharging groundwater and preventing floods!',
      targetWaterSaved: 1300 + id * 40,
      initialWater: 550 - id * 2,
      rewards: {
        ecoCoins: 180 + id * 5,
        drops: 130 + id * 2,
        unlockItemId: id === 65 ? 'hat_raincoat' : id === 70 ? 'decor_rainbow_bridge' : undefined,
      },
    };
  }

  // Chapter 8: 71-80
  if (chapter === 8) {
    const titles = [
      'Welcome to Splash City!',
      'The 24/7 Car Wash Marathon',
      'City Smart Water Meter Grid',
      'The Endless Plaza Fountain Leak',
      'High-Rise Pipe Pressure Puzzle',
      'Greywater Recycling Plant',
      'The Splash City Hydro-Audit',
      'Apartment Aerator Blitz',
      'Urban Drainage Upgrade',
      'Splash City Water Charter',
    ];
    const types: LevelData['type'][] = [
      'city_meters',
      'action_patrol',
      'city_meters',
      'detective',
      'pipe_puzzle',
      'river_clean',
      'city_meters',
      'action_patrol',
      'pipe_puzzle',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 8 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'mayor_puddle',
          speakerName: 'Mayor Puddle',
          text: `Look at this sparkling metropolis! But they use three times as much water per person as Splashville!`,
          expression: 'shocked',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Let's introduce smart meters, greywater recycling for toilets, and stop that guy washing his clean car for the 5th time today!`,
          expression: 'mischievous',
        },
      ],
      storyOutro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `Splash City cut its consumption by 40% without losing convenience! Modern recycling is the future!`,
          expression: 'proud',
        },
      ],
      objectiveText: 'Pinpoint urban meter spikes, install dual-flush regulators, and connect greywater recycling for cooling and landscaping!',
      educationalTitle: 'Urban Water Demand & Greywater Recycling',
      educationalLesson: 'Greywater from sinks and washing machines can be safely filtered and reused for toilet flushing and landscape irrigation, saving millions of litres.',
      targetWaterSaved: 1600 + id * 40,
      initialWater: 500 - id * 2,
      rewards: {
        ecoCoins: 210 + id * 5,
        drops: 150 + id * 2,
        unlockItemId: id === 75 ? 'outfit_superhero' : id === 80 ? 'decor_smart_meter' : undefined,
      },
    };
  }

  // Chapter 9: 81-90
  if (chapter === 9) {
    const titles = [
      'Day 25: The Red Reserve Warning',
      'The Village Clinic Priority',
      'Moo-Moo’s Rationing Agreement',
      'The Emergency Underground Well',
      'High-Temperature Evaporation Shield',
      'Community Kitchen Conservation',
      'Tough Choices at Sundown',
      'The Last Pipe Junction',
      'Protecting the Seed Bank',
      'Eve of the Great Rain',
    ];
    const types: LevelData['type'][] = [
      'distribution',
      'distribution',
      'action_patrol',
      'pipe_puzzle',
      'action_patrol',
      'distribution',
      'distribution',
      'pipe_puzzle',
      'distribution',
      'distribution',
    ];
    return {
      id,
      chapter,
      title: `Level ${id}: ${titles[indexInChapter - 1]}`,
      subtitle: `Chapter 9 • Lesson ${indexInChapter} of 10`,
      type: types[indexInChapter - 1],
      storyIntro: [
        {
          speaker: 'dr_flow',
          speakerName: 'Dr. Flow',
          text: `Bloop! The clinic needs guaranteed sterile water for medicines and sanitizing. We can't afford a single drop of waste!`,
          expression: 'worried',
        },
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `We will prioritize human health, essential crops, and animal welfare through strict daily budgeting!`,
          expression: 'proud',
        },
      ],
      storyOutro: [
        {
          speaker: 'bloop',
          speakerName: 'Bloop',
          text: `We made it through the hardest days with zero clinic disruptions and healthy villagers!`,
          expression: 'happy',
        },
      ],
      objectiveText: 'Manage strict daily water rations, prioritize healthcare and essential nutrition, and maintain community morale!',
      educationalTitle: 'Emergency Water Prioritization',
      educationalLesson: 'In severe droughts, communities must prioritize drinking, healthcare, and basic sanitation over non-essential activities.',
      targetWaterSaved: 2000 + id * 45,
      initialWater: 400 - id * 2,
      rewards: {
        ecoCoins: 240 + id * 5,
        drops: 180 + id * 2,
        unlockItemId: id === 85 ? 'accessory_halo' : id === 90 ? 'decor_ancient_willow' : undefined,
      },
    };
  }

  // Chapter 10: 91-100
  const ch10Titles = [
    'Day 29: Panic in the Streets',
    'Operation: Tighten Every Nut',
    'The Final Bio-Filter Stand',
    'The Forest Canopy Moisture Barrier',
    'The Mega-Drippy Showdown',
    'Mobilizing the Rain Collectors',
    'The Great Water Balance Matrix',
    'Splashville United Against Waste',
    'The Quiet Before the Storm',
    'THE LAST DROP (The Grand Finale)',
  ];
  const ch10Types: LevelData['type'][] = [
    'action_patrol',
    'pipe_puzzle',
    'river_clean',
    'action_patrol',
    'action_patrol',
    'rain_harvest',
    'distribution',
    'farm_irrigation',
    'detective',
    'boss_finale',
  ];

  return {
    id,
    chapter: 10,
    title: `Level ${id}: ${ch10Titles[indexInChapter - 1]}`,
    subtitle: id === 100 ? 'THE ULTIMATE WATER CONSERVATION CLIMAX' : `Chapter 10 • Final Arc ${indexInChapter}/10`,
    type: ch10Types[indexInChapter - 1],
    storyIntro: [
      {
        speaker: 'bloop',
        speakerName: 'Bloop',
        text: id === 100
          ? `This is it, Splashville! The Big Blue Tank is down to its last drops. We must execute everything we've learned!`
          : `Only 48 hours until the monsoon clouds arrive! Keep the lines sealed and tanks ready!`,
        expression: 'worried',
      },
      {
        speaker: 'moo_moo',
        speakerName: 'Moo-Moo the Cow',
        text: id === 100 ? `I promise not to take any emergency sips! Well... maybe one tiny lick?` : `Moooo! We believe in you, Bloop!`,
        expression: id === 100 ? 'mischievous' : 'happy',
      },
    ],
    storyOutro: [
      {
        speaker: 'bloop',
        speakerName: 'Bloop',
        text: id === 100
          ? `LOOK! A single raindrop fell! And another! THE RAINY SEASON IS HERE! WE DID IT, SPLASHVILLE!`
          : `All defenses are prepared! The sky is turning grey and sweet rain is in the air!`,
        expression: 'excited',
      },
    ],
    objectiveText: id === 100
      ? 'Survive the ultimate multi-stage water crisis: fix the final leak, distribute rations fairly, clean the reservoir, and welcome the rain!'
      : 'Unite all water systems, stop the final leaks, and hold the line until the clouds open!',
    educationalTitle: 'The Global Water Cycle & Every Drop Counts',
    educationalLesson: 'Freshwater makes up less than 1% of all water on Earth. Through conservation, efficient infrastructure, and stewardship, we ensure clean water for generations to come!',
    targetWaterSaved: 2500 + id * 50,
    initialWater: id === 100 ? 50 : 300,
    rewards: {
      ecoCoins: 300 + id * 10,
      drops: 250 + id * 5,
      unlockItemId: id === 100 ? 'crown_golden_drop' : undefined,
    },
  };
});
