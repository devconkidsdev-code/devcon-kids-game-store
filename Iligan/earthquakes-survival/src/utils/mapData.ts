import { Building, NPCCar, Obstacle, Road, SafeZone, Survivor } from '../types/game';

export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 2400;

export const INITIAL_SAFE_ZONE: SafeZone = {
  x: 1450,
  y: 1050,
  width: 320,
  height: 280,
  name: 'EMERGENCY RELIEF BASE #1',
};

export const INITIAL_ROADS: Road[] = [
  // Major East-West Arteries
  { x: 0, y: 350, width: 3200, height: 140, direction: 'horizontal', name: 'North Boulevard' },
  { x: 0, y: 1100, width: 1450, height: 160, direction: 'horizontal', name: 'Central Disaster Relief Expressway (West)' },
  { x: 1770, y: 1100, width: 1430, height: 160, direction: 'horizontal', name: 'Central Disaster Relief Expressway (East)' },
  { x: 0, y: 1850, width: 3200, height: 140, direction: 'horizontal', name: 'South Coast Highway' },

  // Major North-South Arteries
  { x: 450, y: 0, width: 140, height: 2400, direction: 'vertical', name: 'West Industrial Avenue' },
  { x: 1050, y: 0, width: 150, height: 2400, direction: 'vertical', name: 'Civic Center Way' },
  { x: 2050, y: 0, width: 150, height: 2400, direction: 'vertical', name: 'Metro Plaza Boulevard' },
  { x: 2650, y: 0, width: 140, height: 2400, direction: 'vertical', name: 'East Bay Avenue' },

  // Connecting Secondary Streets & Alleyways
  { x: 450, y: 700, width: 2200, height: 100, direction: 'horizontal', name: 'Pine Street' },
  { x: 450, y: 1500, width: 2200, height: 100, direction: 'horizontal', name: 'Market Street' },
  { x: 1550, y: 0, width: 120, height: 1050, direction: 'vertical', name: 'Hospital North Approach' },
  { x: 1550, y: 1330, width: 120, height: 1070, direction: 'vertical', name: 'Hospital South Approach' },

  // Plazas and Parking Lots
  { x: 1400, y: 1000, width: 420, height: 380, direction: 'plaza', name: 'Central Safe Zone Hospital Hub' },
  { x: 150, y: 150, width: 250, height: 160, direction: 'plaza', name: 'West Park Depot' },
  { x: 2820, y: 150, width: 260, height: 160, direction: 'plaza', name: 'East Heliport' },
  { x: 150, y: 2050, width: 250, height: 200, direction: 'plaza', name: 'Harbor Parking' },
  { x: 2820, y: 2050, width: 260, height: 200, direction: 'plaza', name: 'East Plaza' }
];

export const INITIAL_BUILDINGS: Building[] = [
  // Sector 1 (Top-Left)
  { id: 'b1', x: 80, y: 60, width: 320, height: 240, name: 'Northwest Tech Tower', roofColor: '#334155', wallColor: '#1e293b', damaged: true, damageLevel: 2 },
  { id: 'b2', x: 620, y: 60, width: 380, height: 240, name: 'City Hall Annex', roofColor: '#475569', wallColor: '#334155', damaged: true, damageLevel: 1 },
  { id: 'b3', x: 80, y: 520, width: 320, height: 140, name: 'Residential Block A', roofColor: '#64748b', wallColor: '#475569', damaged: true, damageLevel: 3 },
  // ENTERABLE BUILDING 1: Metro Disaster Shelter & Relief Depot (Direct entrance on Pine Street)
  {
    id: 'b4',
    x: 620,
    y: 490,
    width: 380,
    height: 210,
    name: 'Metro Disaster Shelter & Relief Depot',
    roofColor: '#0369a1',
    wallColor: '#075985',
    damaged: false,
    damageLevel: 0,
    isEnterable: true,
    entrance: { x: 740, y: 700, width: 140, height: 40, side: 'bottom' }
  },

  // Sector 2 (Top-Right)
  { id: 'b5', x: 2240, y: 60, width: 360, height: 240, name: 'Metropolitan Bank', roofColor: '#0f172a', wallColor: '#020617', damaged: true, damageLevel: 2 },
  { id: 'b6', x: 2820, y: 350, width: 300, height: 300, name: 'Oceanview Suites', roofColor: '#1e293b', wallColor: '#0f172a', damaged: true, damageLevel: 1 },
  { id: 'b7', x: 2240, y: 520, width: 360, height: 140, name: 'East Cinema Center', roofColor: '#b91c1c', wallColor: '#991b1b', damaged: true, damageLevel: 3 },

  // Sector 3 (Mid-Left)
  { id: 'b8', x: 80, y: 830, width: 320, height: 230, name: 'St. Mary High School', roofColor: '#047857', wallColor: '#065f46', damaged: true, damageLevel: 2 },
  { id: 'b9', x: 620, y: 830, width: 380, height: 230, name: 'West Commercial Hub', roofColor: '#475569', wallColor: '#334155', damaged: true, damageLevel: 1 },
  { id: 'b10', x: 80, y: 1290, width: 320, height: 170, name: 'Subway Terminal', roofColor: '#334155', wallColor: '#1e293b', damaged: true, damageLevel: 3 },
  { id: 'b11', x: 620, y: 1290, width: 380, height: 170, name: 'Westside Logistics', roofColor: '#d97706', wallColor: '#b45309', damaged: true, damageLevel: 2 },

  // Sector 4 (Mid-Right)
  { id: 'b12', x: 2240, y: 830, width: 360, height: 230, name: 'District Police Dept', roofColor: '#1e3a8a', wallColor: '#172554', damaged: true, damageLevel: 1 },
  { id: 'b13', x: 2820, y: 830, width: 300, height: 230, name: 'Harbor Shipping Corp', roofColor: '#475569', wallColor: '#334155', damaged: true, damageLevel: 2 },
  { id: 'b14', x: 2240, y: 1290, width: 360, height: 170, name: 'Apex Electronics Lab', roofColor: '#0f172a', wallColor: '#020617', damaged: true, damageLevel: 2 },
  { id: 'b15', x: 2820, y: 1290, width: 300, height: 170, name: 'Grand Central Pharmacy', roofColor: '#059669', wallColor: '#047857', damaged: true, damageLevel: 1 },

  // Sector 5 (Bottom-Left)
  { id: 'b16', x: 80, y: 1630, width: 320, height: 180, name: 'South Garden Apartments', roofColor: '#64748b', wallColor: '#475569', damaged: true, damageLevel: 3 },
  { id: 'b17', x: 620, y: 1630, width: 380, height: 180, name: 'Transit Bus Depot', roofColor: '#e11d48', wallColor: '#be123c', damaged: true, damageLevel: 2 },
  { id: 'b18', x: 80, y: 2020, width: 320, height: 280, name: 'South Warehouse 7', roofColor: '#334155', wallColor: '#1e293b', damaged: true, damageLevel: 2 },
  { id: 'b19', x: 620, y: 2020, width: 380, height: 280, name: 'Water Filtration Plant', roofColor: '#0284c7', wallColor: '#0369a1', damaged: true, damageLevel: 1 },

  // Sector 6 (Bottom-Right)
  { id: 'b20', x: 2240, y: 1630, width: 360, height: 180, name: 'Coastal Hotel Resort', roofColor: '#1e293b', wallColor: '#0f172a', damaged: true, damageLevel: 2 },
  { id: 'b21', x: 2820, y: 1630, width: 300, height: 180, name: 'Seaside Supermarket', roofColor: '#10b981', wallColor: '#047857', damaged: true, damageLevel: 3 },
  { id: 'b22', x: 2240, y: 2020, width: 360, height: 280, name: 'Naval Engineering Hub', roofColor: '#334155', wallColor: '#1e293b', damaged: true, damageLevel: 1 },
  { id: 'b23', x: 2820, y: 2020, width: 300, height: 280, name: 'East Freight Depot', roofColor: '#d97706', wallColor: '#b45309', damaged: true, damageLevel: 2 },

  // Central North & South Complexes
  { id: 'b24', x: 1230, y: 60, width: 280, height: 240, name: 'University Science Hall', roofColor: '#4338ca', wallColor: '#312e81', damaged: true, damageLevel: 2 },
  { id: 'b25', x: 1710, y: 60, width: 300, height: 240, name: 'Civic Library & Archive', roofColor: '#92400e', wallColor: '#78350f', damaged: true, damageLevel: 1 },
  { id: 'b26', x: 1230, y: 520, width: 280, height: 140, name: 'North Medical Clinic', roofColor: '#059669', wallColor: '#047857', damaged: true, damageLevel: 2 },
  // ENTERABLE BUILDING 2: Fire Station #4 & Emergency Bay
  {
    id: 'b27',
    x: 1710,
    y: 490,
    width: 300,
    height: 210,
    name: 'Fire Station #4 & Rescue Bay',
    roofColor: '#dc2626',
    wallColor: '#991b1b',
    damaged: false,
    damageLevel: 0,
    isEnterable: true,
    entrance: { x: 1790, y: 700, width: 130, height: 40, side: 'bottom' }
  },

  { id: 'b28', x: 1230, y: 1630, width: 280, height: 180, name: 'Community Center', roofColor: '#475569', wallColor: '#334155', damaged: true, damageLevel: 2 },
  { id: 'b29', x: 1710, y: 1630, width: 300, height: 180, name: 'Red Cross Warehouse', roofColor: '#be123c', wallColor: '#9f1239', damaged: true, damageLevel: 1 },
  { id: 'b30', x: 1230, y: 2020, width: 280, height: 280, name: 'South Power Substation', roofColor: '#ca8a04', wallColor: '#a16207', damaged: true, damageLevel: 3 },
  { id: 'b31', x: 1710, y: 2020, width: 300, height: 280, name: 'Metro Railway Sheds', roofColor: '#334155', wallColor: '#1e293b', damaged: true, damageLevel: 2 }
];

export const INITIAL_OBSTACLES: Obstacle[] = [
  // Road Cracks / Fissures
  { id: 'obs1', x: 520, y: 400, width: 80, height: 35, type: 'fissure', rotation: 0.2 },
  { id: 'obs2', x: 1120, y: 750, width: 90, height: 40, type: 'fissure', rotation: -0.3 },
  { id: 'obs3', x: 2120, y: 1180, width: 85, height: 35, type: 'fissure', rotation: 0.1 },
  { id: 'obs4', x: 800, y: 1180, width: 100, height: 40, type: 'fissure', rotation: -0.2 },
  { id: 'obs5', x: 2720, y: 420, width: 80, height: 35, type: 'fissure', rotation: 0.4 },
  { id: 'obs6', x: 1600, y: 1920, width: 95, height: 40, type: 'fissure', rotation: -0.15 },

  // Rubble & Collapsed Walls blocking lanes
  { id: 'obs7', x: 250, y: 390, width: 65, height: 45, type: 'rubble_pile', rotation: 0 },
  { id: 'obs8', x: 850, y: 380, width: 75, height: 50, type: 'rubble_pile', rotation: 0.1 },
  { id: 'obs9', x: 2400, y: 400, width: 70, height: 50, type: 'rubble_pile', rotation: -0.2 },
  { id: 'obs10', x: 510, y: 950, width: 60, height: 45, type: 'rubble_pile', rotation: 0.3 },
  { id: 'obs11', x: 2110, y: 1550, width: 65, height: 50, type: 'rubble_pile', rotation: 0 },
  { id: 'obs12', x: 2710, y: 1910, width: 70, height: 45, type: 'rubble_pile', rotation: -0.1 },
  { id: 'obs13', x: 850, y: 1910, width: 80, height: 55, type: 'rubble_pile', rotation: 0.2 },

  // Abandoned Broken Cars
  { id: 'obs14', x: 1110, y: 410, width: 55, height: 32, type: 'broken_car', rotation: 0.8, color: '#ef4444' },
  { id: 'obs15', x: 2100, y: 430, width: 58, height: 32, type: 'broken_car', rotation: -0.5, color: '#3b82f6' },
  { id: 'obs16', x: 500, y: 1540, width: 55, height: 30, type: 'broken_car', rotation: 1.2, color: '#eab308' },
  { id: 'obs17', x: 2710, y: 1160, width: 58, height: 32, type: 'broken_car', rotation: -0.9, color: '#10b981' },
  { id: 'obs18', x: 1120, y: 1700, width: 55, height: 30, type: 'broken_car', rotation: 0.4, color: '#8b5cf6' },

  // Fallen Electric Poles & Barricades
  { id: 'obs19', x: 1350, y: 740, width: 70, height: 25, type: 'fallen_tree', rotation: 0.5 },
  { id: 'obs20', x: 1850, y: 740, width: 65, height: 25, type: 'barricade', rotation: -0.1 },
  { id: 'obs21', x: 1350, y: 1540, width: 60, height: 25, type: 'barricade', rotation: 0 },
  { id: 'obs22', x: 1850, y: 1540, width: 70, height: 25, type: 'fallen_tree', rotation: -0.4 },

  // Splashing Hydrants
  { id: 'obs23', x: 470, y: 720, width: 24, height: 24, type: 'hydrant', rotation: 0 },
  { id: 'obs24', x: 2670, y: 720, width: 24, height: 24, type: 'hydrant', rotation: 0 },
  { id: 'obs25', x: 470, y: 1520, width: 24, height: 24, type: 'hydrant', rotation: 0 },
  { id: 'obs26', x: 2670, y: 1520, width: 24, height: 24, type: 'hydrant', rotation: 0 }
];

export const INITIAL_SURVIVORS: Survivor[] = [
  // SPECIAL: Inside Enterable Metro Disaster Shelter & Relief Depot (b4: x: 620..1000, y: 490..700)
  { id: 's_in1', x: 700, y: 550, name: 'Dr. Alan (Surgeon)', type: 'medic', rescued: false, delivered: false, wavePhase: 0.1, dialogue: 'Thank God! The shelter ceiling was shaking!', avatarColor: '#10b981', shirtColor: '#059669', isTrapped: true },
  { id: 's_in2', x: 810, y: 540, name: 'Little Lily', type: 'child', rescued: false, delivered: false, wavePhase: 1.8, dialogue: 'You drove right inside to save us!', avatarColor: '#ec4899', shirtColor: '#f43f5e', isTrapped: true },
  { id: 's_in3', x: 920, y: 570, name: 'Volunteer Sam', type: 'man', rescued: false, delivered: false, wavePhase: 2.5, dialogue: 'All our medical supplies are packed!', avatarColor: '#f59e0b', shirtColor: '#2563eb', isTrapped: true },
  { id: 's_in4', x: 720, y: 640, name: 'Grandpa Arthur', type: 'elderly', rescued: false, delivered: false, wavePhase: 3.2, dialogue: 'I was resting in the shelter ward!', avatarColor: '#a855f7', shirtColor: '#64748b', isTrapped: true },
  { id: 's_in5', x: 900, y: 640, name: 'Nurse Chloe', type: 'medic', rescued: false, delivered: false, wavePhase: 0.9, dialogue: 'Ready to load emergency patients!', avatarColor: '#10b981', shirtColor: '#0d9488', isTrapped: true },

  // SPECIAL: Inside Enterable Fire Station #4 (b27: x: 1710..2010, y: 490..700)
  { id: 's_in6', x: 1780, y: 560, name: 'Captain Dave', type: 'man', rescued: false, delivered: false, wavePhase: 1.4, dialogue: 'Station bay doors got jammed! Thanks for coming in!', avatarColor: '#ef4444', shirtColor: '#dc2626', isTrapped: true },
  { id: 's_in7', x: 1910, y: 580, name: 'Firefighter Emily', type: 'woman', rescued: false, delivered: false, wavePhase: 2.9, dialogue: 'Hop in! Let’s get to the Safe Zone!', avatarColor: '#f97316', shirtColor: '#ea580c', isTrapped: true },

  // Sector 1: Northwest (near Tech Tower & Market)
  { id: 's1', x: 220, y: 330, name: 'Marcus', type: 'man', rescued: false, delivered: false, wavePhase: 0, dialogue: 'HELP! Over here!', avatarColor: '#f59e0b', shirtColor: '#3b82f6' },
  { id: 's2', x: 420, y: 220, name: 'Dr. Elena', type: 'medic', rescued: false, delivered: false, wavePhase: 1.2, dialogue: 'Rescue team! Thank goodness!', avatarColor: '#ec4899', shirtColor: '#10b981' },
  { id: 's3', x: 780, y: 320, name: 'Tommy', type: 'child', rescued: false, delivered: false, wavePhase: 2.1, dialogue: 'Please save me!', avatarColor: '#f97316', shirtColor: '#e11d48' },
  { id: 's4', x: 180, y: 470, name: 'Arthur', type: 'elderly', rescued: false, delivered: false, wavePhase: 0.8, dialogue: 'I cannot walk fast!', avatarColor: '#a855f7', shirtColor: '#64748b' },
  { id: 's5', x: 520, y: 620, name: 'Sarah', type: 'woman', rescued: false, delivered: false, wavePhase: 3.4, dialogue: 'Here! Over by the sign!', avatarColor: '#06b6d4', shirtColor: '#f43f5e' },

  // Sector 2: Northeast (near Bank & Cinema)
  { id: 's6', x: 2150, y: 320, name: 'Victor', type: 'man', rescued: false, delivered: false, wavePhase: 1.5, dialogue: 'Rubble collapsed our door!', avatarColor: '#eab308', shirtColor: '#2563eb' },
  { id: 's7', x: 2480, y: 320, name: 'Maya', type: 'woman', rescued: false, delivered: false, wavePhase: 0.4, dialogue: 'SOS! Please pick me up!', avatarColor: '#ec4899', shirtColor: '#9333ea' },
  { id: 's8', x: 2780, y: 240, name: 'Nurse Chloe', type: 'medic', rescued: false, delivered: false, wavePhase: 2.8, dialogue: 'I have medical kits with me!', avatarColor: '#10b981', shirtColor: '#059669' },
  { id: 's9', x: 2950, y: 470, name: 'Grandpa Joe', type: 'elderly', rescued: false, delivered: false, wavePhase: 4.1, dialogue: 'Bless you, rescue team!', avatarColor: '#f97316', shirtColor: '#475569' },
  { id: 's10', x: 2120, y: 630, name: 'Leo', type: 'child', rescued: false, delivered: false, wavePhase: 1.9, dialogue: 'I am scared! Help!', avatarColor: '#3b82f6', shirtColor: '#f59e0b' },

  // Sector 3: West Central (near School & Subway)
  { id: 's11', x: 420, y: 920, name: 'David', type: 'man', rescued: false, delivered: false, wavePhase: 0.7, dialogue: 'Look out for the tremor cracks!', avatarColor: '#14b8a6', shirtColor: '#3b82f6' },
  { id: 's12', x: 220, y: 1080, name: 'Clara', type: 'woman', rescued: false, delivered: false, wavePhase: 2.4, dialogue: 'Take me to the Safe Zone!', avatarColor: '#d946ef', shirtColor: '#f43f5e' },
  { id: 's13', x: 780, y: 1080, name: 'Grandma Rose', type: 'elderly', rescued: false, delivered: false, wavePhase: 1.1, dialogue: 'My knees hurt from the quake!', avatarColor: '#a855f7', shirtColor: '#94a3b8' },
  { id: 's14', x: 520, y: 1220, name: 'Lucas', type: 'child', rescued: false, delivered: false, wavePhase: 3.1, dialogue: 'Big rescue truck! Here!', avatarColor: '#f97316', shirtColor: '#0ea5e9' },
  { id: 's15', x: 180, y: 1420, name: 'Dr. Harris', type: 'medic', rescued: false, delivered: false, wavePhase: 0.2, dialogue: 'Need evacuation to base camp!', avatarColor: '#10b981', shirtColor: '#16a34a' },

  // Sector 4: East Central (near Police & Pharmacy)
  { id: 's16', x: 2150, y: 1080, name: 'Officer Dan', type: 'man', rescued: false, delivered: false, wavePhase: 1.6, dialogue: 'Clear the avenue to hospital!', avatarColor: '#3b82f6', shirtColor: '#1d4ed8' },
  { id: 's17', x: 2450, y: 1080, name: 'Zoe', type: 'woman', rescued: false, delivered: false, wavePhase: 2.7, dialogue: 'Hurry! Another aftershock coming!', avatarColor: '#ec4899', shirtColor: '#db2777' },
  { id: 's18', x: 2950, y: 1080, name: 'George', type: 'elderly', rescued: false, delivered: false, wavePhase: 0.9, dialogue: 'Thank heavens you arrived!', avatarColor: '#f59e0b', shirtColor: '#334155' },
  { id: 's19', x: 2120, y: 1420, name: 'Mia', type: 'child', rescued: false, delivered: false, wavePhase: 3.8, dialogue: 'Pick me up, mister!', avatarColor: '#8b5cf6', shirtColor: '#fbbf24' },
  { id: 's20', x: 2750, y: 1420, name: 'Nurse Kim', type: 'medic', rescued: false, delivered: false, wavePhase: 1.3, dialogue: 'All safe zone beds are ready!', avatarColor: '#10b981', shirtColor: '#0d9488' },

  // Sector 5: Southwest (near South Garden & Warehouses)
  { id: 's21', x: 220, y: 1820, name: 'James', type: 'man', rescued: false, delivered: false, wavePhase: 0.5, dialogue: 'South bridge is shaking!', avatarColor: '#f59e0b', shirtColor: '#dc2626' },
  { id: 's22', x: 420, y: 1720, name: 'Aria', type: 'woman', rescued: false, delivered: false, wavePhase: 2.2, dialogue: 'I have three neighbors behind me!', avatarColor: '#ec4899', shirtColor: '#8b5cf6' },
  { id: 's23', x: 780, y: 1820, name: 'Sammy', type: 'child', rescued: false, delivered: false, wavePhase: 3.6, dialogue: 'Mister rescue driver!', avatarColor: '#06b6d4', shirtColor: '#f97316' },
  { id: 's24', x: 200, y: 2200, name: 'Captain Bill', type: 'elderly', rescued: false, delivered: false, wavePhase: 1.7, dialogue: 'Port warehouse flooded with debris!', avatarColor: '#64748b', shirtColor: '#1e293b' },
  { id: 's25', x: 520, y: 2200, name: 'Paramedic Raj', type: 'medic', rescued: false, delivered: false, wavePhase: 2.9, dialogue: 'I will assist in the truck!', avatarColor: '#10b981', shirtColor: '#059669' },

  // Sector 6: Southeast (near Coastal Resort & Freight)
  { id: 's26', x: 2150, y: 1820, name: 'Carlos', type: 'man', rescued: false, delivered: false, wavePhase: 0.3, dialogue: 'Over here! Near the palm tree!', avatarColor: '#eab308', shirtColor: '#0284c7' },
  { id: 's27', x: 2480, y: 1820, name: 'Lilly', type: 'woman', rescued: false, delivered: false, wavePhase: 1.8, dialogue: 'Drive fast! The ground is cracking!', avatarColor: '#f43f5e', shirtColor: '#e11d48' },
  { id: 's28', x: 2950, y: 1820, name: 'Walter', type: 'elderly', rescued: false, delivered: false, wavePhase: 4.2, dialogue: 'Good lad! Get us to safety!', avatarColor: '#a855f7', shirtColor: '#475569' },
  { id: 's29', x: 2120, y: 2200, name: 'Noah', type: 'child', rescued: false, delivered: false, wavePhase: 2.5, dialogue: 'I want to go to the safe camp!', avatarColor: '#3b82f6', shirtColor: '#eab308' },
  { id: 's30', x: 2750, y: 2200, name: 'Dr. Chen', type: 'medic', rescued: false, delivered: false, wavePhase: 0.9, dialogue: 'Relief convoy incoming!', avatarColor: '#10b981', shirtColor: '#15803d' },

  // Central Sector (North & South Approaches)
  { id: 's31', x: 1350, y: 320, name: 'Gabriel', type: 'man', rescued: false, delivered: false, wavePhase: 1.4, dialogue: 'Direct path to Base #1 is open!', avatarColor: '#f59e0b', shirtColor: '#2563eb', isRunning: true, runSpeed: 1.6, facingAngle: Math.PI / 2 },
  { id: 's32', x: 1850, y: 320, name: 'Hannah', type: 'woman', rescued: false, delivered: false, wavePhase: 2.0, dialogue: 'Please! We are stranded!', avatarColor: '#ec4899', shirtColor: '#7c3aed', isRunning: true, runSpeed: 1.4, facingAngle: Math.PI / 2 },
  { id: 's33', x: 1350, y: 880, name: 'Grandma Beth', type: 'elderly', rescued: false, delivered: false, wavePhase: 3.3, dialogue: 'We saw the emergency lights!', avatarColor: '#a855f7', shirtColor: '#64748b', isRunning: true, runSpeed: 0.9, facingAngle: Math.PI / 2 },
  { id: 's34', x: 1850, y: 880, name: 'Toby', type: 'child', rescued: false, delivered: false, wavePhase: 0.6, dialogue: 'Save me and my friends!', avatarColor: '#f97316', shirtColor: '#ef4444', isRunning: true, runSpeed: 1.8, facingAngle: Math.PI / 2 },
  { id: 's35', x: 1350, y: 1720, name: 'Lucas Jr', type: 'child', rescued: false, delivered: false, wavePhase: 1.1, dialogue: 'Over here by the community center!', avatarColor: '#3b82f6', shirtColor: '#10b981', isRunning: true, runSpeed: 1.7, facingAngle: -Math.PI / 2 },
  { id: 's36', x: 1850, y: 1720, name: 'Nurse Sophie', type: 'medic', rescued: false, delivered: false, wavePhase: 2.6, dialogue: 'More evacuees arriving!', avatarColor: '#10b981', shirtColor: '#047857', isRunning: true, runSpeed: 1.5, facingAngle: -Math.PI / 2 },

  // Evacuating Civilian Groups (Running along evacuation sidewalks to Safe Zone)
  { id: 'evac1', x: 1200, y: 1140, name: 'Evacuee Kyle', type: 'man', rescued: false, delivered: false, wavePhase: 0.5, dialogue: 'Running to Base #1!', avatarColor: '#3b82f6', shirtColor: '#0284c7', isRunning: true, runSpeed: 1.5, facingAngle: 0 },
  { id: 'evac2', x: 1250, y: 1155, name: 'Evacuee Maria', type: 'woman', rescued: false, delivered: false, wavePhase: 1.7, dialogue: 'Safe Zone is right ahead!', avatarColor: '#ec4899', shirtColor: '#f43f5e', isRunning: true, runSpeed: 1.6, facingAngle: 0 },
  { id: 'evac3', x: 2000, y: 1140, name: 'Evacuee Ben', type: 'man', rescued: false, delivered: false, wavePhase: 2.3, dialogue: 'Keep moving everyone!', avatarColor: '#eab308', shirtColor: '#ca8a04', isRunning: true, runSpeed: 1.4, facingAngle: Math.PI },
  { id: 'evac4', x: 1950, y: 1155, name: 'Evacuee Tina', type: 'woman', rescued: false, delivered: false, wavePhase: 3.1, dialogue: 'Evacuate immediately!', avatarColor: '#10b981', shirtColor: '#059669', isRunning: true, runSpeed: 1.5, facingAngle: Math.PI }
];

export const INITIAL_NPC_CARS: NPCCar[] = [
  // 1. Police Interceptor Cruiser #101 (Patrols North Boulevard & Civic Center Way)
  {
    id: 'npc_police1',
    name: 'Police Interceptor #101',
    x: 450,
    y: 390,
    angle: 0,
    speed: 3.8,
    targetSpeed: 4.2,
    maxSpeed: 4.8,
    width: 38,
    height: 68,
    type: 'police',
    color: '#0f172a',
    roofColor: '#ffffff',
    hasSiren: true,
    sirenPhase: 0,
    headlights: true,
    waypoints: [
      { x: 2600, y: 390 },
      { x: 2600, y: 1150 },
      { x: 1050, y: 1150 },
      { x: 1050, y: 390 }
    ],
    currentWaypointIndex: 0
  },

  // 2. Fire Engine Rescue #9 (Patrols East side down to South Coast Highway)
  {
    id: 'npc_fire1',
    name: 'Fire Rescue Engine #9',
    x: 2680,
    y: 750,
    angle: Math.PI / 2,
    speed: 3.2,
    targetSpeed: 3.5,
    maxSpeed: 3.8,
    width: 44,
    height: 86,
    type: 'fire_truck',
    color: '#dc2626',
    roofColor: '#991b1b',
    hasSiren: true,
    sirenPhase: 0.5,
    headlights: true,
    waypoints: [
      { x: 2680, y: 1880 },
      { x: 2100, y: 1880 },
      { x: 2100, y: 750 },
      { x: 2680, y: 750 }
    ],
    currentWaypointIndex: 0
  },

  // 3. City Evacuation Metro Bus (Transporting fleeing citizens along South Coast Highway to Safe Zone)
  {
    id: 'npc_bus1',
    name: 'Metro Evac Bus #42',
    x: 350,
    y: 1880,
    angle: 0,
    speed: 2.8,
    targetSpeed: 3.0,
    maxSpeed: 3.2,
    width: 46,
    height: 94,
    type: 'evacuation_bus',
    color: '#eab308',
    roofColor: '#fef08a',
    hasSiren: false,
    headlights: true,
    waypoints: [
      { x: 1550, y: 1880 },
      { x: 1550, y: 1250 },
      { x: 1550, y: 1880 },
      { x: 2900, y: 1880 },
      { x: 2900, y: 1150 },
      { x: 450, y: 1150 },
      { x: 450, y: 1880 }
    ],
    currentWaypointIndex: 0
  },

  // 4. Civilian Evacuation SUV (Family evacuating down Pine Street)
  {
    id: 'npc_suv1',
    name: 'Civilian Evac SUV',
    x: 1050,
    y: 730,
    angle: 0,
    speed: 3.4,
    targetSpeed: 3.6,
    maxSpeed: 4.0,
    width: 38,
    height: 66,
    type: 'civilian_suv',
    color: '#0284c7',
    roofColor: '#38bdf8',
    hasSiren: false,
    headlights: true,
    waypoints: [
      { x: 2000, y: 730 },
      { x: 2000, y: 1150 },
      { x: 1610, y: 1150 },
      { x: 500, y: 1150 },
      { x: 500, y: 730 }
    ],
    currentWaypointIndex: 0
  },

  // 5. Civilian Evac Sedan (Maroon sedan heading to hospital Safe Zone)
  {
    id: 'npc_sedan1',
    name: 'Civilian Sedan',
    x: 2100,
    y: 1530,
    angle: -Math.PI,
    speed: 3.1,
    targetSpeed: 3.4,
    maxSpeed: 3.8,
    width: 36,
    height: 62,
    type: 'civilian_sedan',
    color: '#9f1239',
    roofColor: '#881337',
    hasSiren: false,
    headlights: true,
    waypoints: [
      { x: 500, y: 1530 },
      { x: 500, y: 1150 },
      { x: 1500, y: 1150 },
      { x: 2100, y: 1150 },
      { x: 2100, y: 1530 }
    ],
    currentWaypointIndex: 0
  },

  // 6. Rapid Response Paramedic Backup Van
  {
    id: 'npc_amb2',
    name: 'Rapid Medic Van #2',
    x: 1580,
    y: 400,
    angle: Math.PI / 2,
    speed: 3.6,
    targetSpeed: 4.0,
    maxSpeed: 4.4,
    width: 40,
    height: 72,
    type: 'ambulance_npc',
    color: '#ffffff',
    roofColor: '#10b981',
    hasSiren: true,
    sirenPhase: 0.25,
    headlights: true,
    waypoints: [
      { x: 1580, y: 1100 },
      { x: 2650, y: 1100 },
      { x: 2650, y: 400 },
      { x: 1580, y: 400 }
    ],
    currentWaypointIndex: 0
  }
];

export const INITIAL_PLAYER_CAR = {
  x: 1610,
  y: 1200, // Starts right outside the Safe Zone ready to drive
  angle: -Math.PI / 2, // Facing North
  speed: 0,
  maxForwardSpeed: 7.6,
  maxReverseSpeed: -4.2,
  acceleration: 0.38,
  braking: 0.55,
  friction: 0.08,
  turnSpeed: 0.068,
  width: 44,
  height: 82,
  passengers: [],
  maxCapacity: 5,
  sirenActive: true,
  headlightsActive: true,
  boostAvailable: 100,
  isBoosting: false,
  collisionCooldown: 0,
  driverName: 'Jack Vance (Lead Rescuer)'
};
