import { DisasterArea, Resident, Building } from '../types';

export function getTreatmentStepsForInjury(injuredType: Resident['injuredType'], requiredMedKits: number) {
  switch (injuredType) {
    case 'debris_trapped':
      return [
        { id: 'step_1', name: 'Clear Heavy Debris', actionDesc: 'Lift crushed timber and remove concrete chunks from legs', requiredKits: 0, completed: false },
        { id: 'step_2', name: 'Apply Trauma Bandage', actionDesc: 'Disinfect lacerations and apply pressure compression dressing', requiredKits: 1, completed: false },
        { id: 'step_3', name: 'Administer Pain Relief', actionDesc: 'Provide emergency analgesic ampoule and hydration solution', requiredKits: Math.max(0, requiredMedKits - 1), completed: false },
      ];
    case 'smoke_inhalation':
      return [
        { id: 'step_1', name: 'Secure Oxygen Mask', actionDesc: 'Attach portable high-flow respirator mask to clear airways', requiredKits: 1, completed: false },
        { id: 'step_2', name: 'Soot Clearing & Inhaler', actionDesc: 'Administer bronchodilator aerosol to relieve chest tightness', requiredKits: 0, completed: false },
        { id: 'step_3', name: 'Thermal Blanket & Water', actionDesc: 'Stabilize body temperature and provide clean electrolyte hydration', requiredKits: Math.max(0, requiredMedKits - 1), completed: false },
      ];
    case 'fracture':
      return [
        { id: 'step_1', name: 'Align & Splint Limb', actionDesc: 'Fasten rigid tactical splint around injured joint or bone', requiredKits: 1, completed: false },
        { id: 'step_2', name: 'Elastic Compression', actionDesc: 'Secure anatomical support wrap to immobilize fracture', requiredKits: 0, completed: false },
        { id: 'step_3', name: 'Mobility Assist Check', actionDesc: 'Assess nerve sensitivity and assist resident onto feet', requiredKits: Math.max(0, requiredMedKits - 1), completed: false },
      ];
    case 'exhaustion':
    default:
      return [
        { id: 'step_1', name: 'Emergency Electrolytes', actionDesc: 'Administer rapid absorption glucose and hydration pack', requiredKits: 1, completed: false },
        { id: 'step_2', name: 'Vital Monitor Check', actionDesc: 'Check blood pressure and stabilize irregular heart rhythms', requiredKits: 0, completed: false },
        { id: 'step_3', name: 'Revitalizing Stimulant', actionDesc: 'Provide thermal insulated foil and energy restoration bar', requiredKits: Math.max(0, requiredMedKits - 1), completed: false },
      ];
  }
}

export function getBuildingRepairPhases(type: Building['type'], requiredMaterials: number) {
  const m1 = Math.max(1, Math.floor(requiredMaterials / 3));
  const m2 = Math.max(1, Math.floor(requiredMaterials / 3));
  const m3 = Math.max(1, requiredMaterials - m1 - m2);

  switch (type) {
    case 'hospital':
      return [
        { id: 'ph_1', name: 'Clear Bay Debris & Scaffolding', actionDesc: 'Remove shattered canopy rubble and erect reinforced support jacks', requiredMaterials: m1, completed: false },
        { id: 'ph_2', name: 'Rewire Emergency Generators', actionDesc: 'Reconnect intensive care power bus and backup oxygen lines', requiredMaterials: m2, completed: false },
        { id: 'ph_3', name: 'Sterilize & Seal Triage Wing', actionDesc: 'Install tempered glass windows and activate rooftop trauma beacon', requiredMaterials: m3, completed: false },
      ];
    case 'fire_station':
      return [
        { id: 'ph_1', name: 'Unjam Hangar Blast Doors', actionDesc: 'Cut buckled steel rebar and clear exit ramp for rescue engines', requiredMaterials: m1, completed: false },
        { id: 'ph_2', name: 'Repair High-Band Antenna', actionDesc: 'Align emergency communications dish and link satellite transceiver', requiredMaterials: m2, completed: false },
        { id: 'ph_3', name: 'Charge Water & Foam Hydrants', actionDesc: 'Reinforce primary pressurized manifold and test siren relay', requiredMaterials: m3, completed: false },
      ];
    case 'power_plant':
      return [
        { id: 'ph_1', name: 'Contain Electrical Arcs', actionDesc: 'Insulate ruptured capacitor banks and clear burnt grounding coils', requiredMaterials: m1, completed: false },
        { id: 'ph_2', name: 'Replace Step-Up Transformers', actionDesc: 'Crane heavy copper windings into housing and bolt safety breakers', requiredMaterials: m2, completed: false },
        { id: 'ph_3', name: 'Energize Regional Sub-Grid', actionDesc: 'Synchronize turbine frequency and illuminate street grid nodes', requiredMaterials: m3, completed: false },
      ];
    case 'school':
      return [
        { id: 'ph_1', name: 'Structural Truss Reinforcement', actionDesc: 'Prop up sagging gymnasium ceiling with high-tensile alloy beams', requiredMaterials: m1, completed: false },
        { id: 'ph_2', name: 'Clear Mud & Glaze Classrooms', actionDesc: 'Extract flood sludge and replace shattered double-pane windows', requiredMaterials: m2, completed: false },
        { id: 'ph_3', name: 'Safe Evacuation Bell & Roof', actionDesc: 'Install weather-sealed solar tiles and ring school resumption chime', requiredMaterials: m3, completed: false },
      ];
    case 'water_tower':
      return [
        { id: 'ph_1', name: 'Weld Reservoir Tank Fissures', actionDesc: 'Seal high-pressure steel tank seams with arc welding torches', requiredMaterials: m1, completed: false },
        { id: 'ph_2', name: 'Replace Filtration Impellers', actionDesc: 'Install fresh ceramic filter cartridges and intake booster pump', requiredMaterials: m2, completed: false },
        { id: 'ph_3', name: 'Pressurize Aqueduct Main', actionDesc: 'Test clean water pressure and open municipal distribution valves', requiredMaterials: m3, completed: false },
      ];
    case 'city_hall':
    case 'library':
    case 'residential':
    default:
      return [
        { id: 'ph_1', name: 'Shoring & Rubble Removal', actionDesc: 'Extract collapsed masonry and hoist load-bearing steel scaffolding', requiredMaterials: m1, completed: false },
        { id: 'ph_2', name: 'Rebuild Facade & Framework', actionDesc: 'Lay reinforced insulating blocks and restore internal electrical risers', requiredMaterials: m2, completed: false },
        { id: 'ph_3', name: 'Exterior Glazing & Illumination', actionDesc: 'Fit architectural weather seal and illuminate golden restored sconces', requiredMaterials: m3, completed: false },
      ];
  }
}

export const DISASTER_AREAS: DisasterArea[] = [
  {
    id: 1,
    name: "Harbor District & Coastal Boulevard",
    subtitle: "Sector 01 — Flooded Docks & Debris Highway",
    distanceToReach: 450,
    themeColor: "#0284c7",
    skyColor: "#334155",
    fogColor: "#1e293b",
    restoredSkyColor: "#38bdf8",
    restoredFogColor: "#bae6fd",
    storyBrief: "A ferocious tidal surge crashed through the coastal bay, battering the harbor piers and blocking the coastal express highway with overturned cargo and collapsed scaffolding.",
    isRestored: false,
    residents: [
      {
        id: "res_1_1",
        name: "Captain Douglas",
        role: "Dockmaster",
        story: "Trapped under a broken timber crane beam near the pier.",
        quote: "Rose! Thank heavens! The crane cables snapped when the storm struck... my leg is pinned!",
        position: [-6, 0, 8],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 20,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 118, oxygenLevel: 91, condition: 'CRITICAL' },
        thankYouQuote: "Rose, you lifted that monstrous beam like it was driftwood! I can stand on both feet again. God bless your courage!"
      },
      {
        id: "res_1_2",
        name: "Elena Fisher",
        role: "Marine Biologist",
        story: "Suffering from smoke inhalation near the burning dock office.",
        quote: "The generator backfired... I couldn't breathe. Bless you for the oxygen mask, Rose!",
        position: [7, 0, 12],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "smoke_inhalation",
        healthPercent: 30,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("smoke_inhalation", 1),
        vitalSigns: { heartRate: 104, oxygenLevel: 84, condition: 'CRITICAL' },
        thankYouQuote: "My lungs are clear, and I can breathe clean air again! Thank you for rushing into the smoke for me!"
      },
      {
        id: "res_1_3",
        name: "Leo Ramos",
        role: "Ferry Engineer",
        story: "Exhausted and dehydrated, holding emergency barrier.",
        quote: "I was trying to keep the water gates closed until my strength gave out. You're a true lifesaver!",
        position: [-10, 0, -6],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "exhaustion",
        healthPercent: 25,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("exhaustion", 1),
        vitalSigns: { heartRate: 98, oxygenLevel: 94, condition: 'CRITICAL' },
        thankYouQuote: "Those electrolytes worked miracles! I thought my strength was completely gone. Let's get this harbor running!"
      },
      {
        id: "res_1_4",
        name: "Grandma Nora",
        role: "Lighthouse Keeper",
        story: "Stumbled on shattered boardwalk stairs with a sprained ankle.",
        quote: "I was worried the beacon would go dark forever. Thank you, sweetheart!",
        position: [9, 0, -10],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "fracture",
        healthPercent: 35,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("fracture", 1),
        vitalSigns: { heartRate: 90, oxygenLevel: 96, condition: 'CRITICAL' },
        thankYouQuote: "That splint feels snug and pain-free, dear! Now nothing will keep me from tending the coastline!"
      }
    ],
    buildings: [
      {
        id: "bld_1_1",
        name: "Coastal Urgent Clinic",
        type: "hospital",
        position: [-12, 0, 6],
        rotation: 0.3,
        damageLevel: 100,
        requiredMaterials: 2,
        repairProgress: 0,
        isRepaired: false,
        description: "Roof collapsed and medical bay flooded with sea debris.",
        benefits: "Restores local triage & first aid dispatch.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("hospital", 2),
        inspection: {
          structuralDamage: "Severely fractured concrete canopy, shattered entrance facade, and seawater ingress in emergency ward.",
          utilityStatus: "Backup generator submerged; medical gas lines severed.",
          safetyHazard: "High risk of secondary ceiling collapse near intake desk.",
          reconstructionPlan: "Shoring load-bearing columns, pump floodwater, reconnect medical power, and install clean emergency glass."
        },
        celebrationQuote: "The clinic lights are shining! All coastal survivors now have a safe trauma station!"
      },
      {
        id: "bld_1_2",
        name: "Harbor Coastguard Tower",
        type: "fire_station",
        position: [12, 0, 4],
        rotation: -0.4,
        damageLevel: 100,
        requiredMaterials: 2,
        repairProgress: 0,
        isRepaired: false,
        description: "Observation deck cracked and emergency comms antenna snapped.",
        benefits: "Restores marine emergency communication grid.",
        structuralIntegrity: 20,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("fire_station", 2),
        inspection: {
          structuralDamage: "Observation crow's nest buckled at 45 degrees; steel stairs crushed by shipping container.",
          utilityStatus: "Radar array offline; radio transponder unresponsive.",
          safetyHazard: "Hanging cable harnesses sparking over fuel depot.",
          reconstructionPlan: "Straighten support mast, replace transmitter amplifier, and seal tower glass envelope."
        },
        celebrationQuote: "Coastguard radar is broadcasting again! Marine distress calls can now be answered!"
      },
      {
        id: "bld_1_3",
        name: "Lighthouse & Power Hub",
        type: "power_plant",
        position: [0, 0, -14],
        rotation: 0,
        damageLevel: 100,
        requiredMaterials: 3,
        repairProgress: 0,
        isRepaired: false,
        description: "Main power transformer ruptured, plunging the coastline into darkness.",
        benefits: "Restores harbor lights and beacon guidance.",
        structuralIntegrity: 10,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("power_plant", 3),
        inspection: {
          structuralDamage: "Transformer cooling radiator blown out; primary step-down bus scorched by saltwater short.",
          utilityStatus: "Total coastal blackout spanning 12 nautical miles.",
          safetyHazard: "Exposed 10kV copper busbars touching wet deck.",
          reconstructionPlan: "Discharge static capacitors, install replacement transformer block, and ignite the beacon Fresnel lens."
        },
        celebrationQuote: "The Great Lighthouse beacon is ablaze! The harbor waters are illuminated and safe!"
      }
    ]
  },
  {
    id: 2,
    name: "Downtown Metropolis & Central Avenue",
    subtitle: "Sector 02 — High-Rise Tremors & Collapsed Overpasses",
    distanceToReach: 600,
    themeColor: "#ea580c",
    skyColor: "#475569",
    fogColor: "#0f172a",
    restoredSkyColor: "#60a5fa",
    restoredFogColor: "#dbeafe",
    storyBrief: "High-magnitude structural shockwaves tore through the downtown core. Glass facades shattered onto the expressway, and overpass bridges buckled under the violent vortex.",
    isRestored: false,
    residents: [
      {
        id: "res_2_1",
        name: "Dr. Marcus Chen",
        role: "Trauma Surgeon",
        story: "Trapped behind collapsed emergency exit stairs.",
        quote: "Rose! Our medical supplies were buried in the rubble. Thank you for clearing the way!",
        position: [-8, 0, 10],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 25,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 110, oxygenLevel: 92, condition: 'CRITICAL' },
        thankYouQuote: "Rose, your quick response saved my hands! Now I can join you in treating the other survivors!"
      },
      {
        id: "res_2_2",
        name: "Maya Patel",
        role: "News Dispatcher",
        story: "Injured arm and stunned by fallen billboard frame.",
        quote: "I stayed on air to broadcast evacuation alerts until the tower buckled. You saved me!",
        position: [8, 0, 8],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "fracture",
        healthPercent: 30,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("fracture", 1),
        vitalSigns: { heartRate: 102, oxygenLevel: 95, condition: 'CRITICAL' },
        thankYouQuote: "The sling feels great. I'm already tuning the emergency dispatch frequency to tell everyone Rose is here!"
      },
      {
        id: "res_2_3",
        name: "Officer Brooks",
        role: "Traffic Warden",
        story: "Exhausted after directing hundreds of cars to safe zones.",
        quote: "My radio battery died and the dust was suffocating. I owe you my life, Rose!",
        position: [-10, 0, -8],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "smoke_inhalation",
        healthPercent: 20,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("smoke_inhalation", 1),
        vitalSigns: { heartRate: 115, oxygenLevel: 82, condition: 'CRITICAL' },
        thankYouQuote: "That respirator cleared my vision and throat in seconds. You're an absolute hero, Officer Rose!"
      },
      {
        id: "res_2_4",
        name: "Lucas Vance",
        role: "Architect",
        story: "Pinned under a fallen steel I-beam outside his studio.",
        quote: "The structural integrity gave out. You lifted the beam just in time!",
        position: [11, 0, -6],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 15,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 125, oxygenLevel: 89, condition: 'CRITICAL' },
        thankYouQuote: "I can feel my legs again! I'll hand you the master blueprints for the downtown high-rise repairs immediately!"
      }
    ],
    buildings: [
      {
        id: "bld_2_1",
        name: "St. Jude General Hospital",
        type: "hospital",
        position: [-14, 0, 6],
        rotation: 0.2,
        damageLevel: 100,
        requiredMaterials: 3,
        repairProgress: 0,
        isRepaired: false,
        description: "Front emergency canopy crushed and backup generators damaged.",
        benefits: "Enables major medical treatment for downtown citizens.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("hospital", 3),
        inspection: {
          structuralDamage: "Upper surgical suites breached by high wind gusts; primary trauma elevator shafts locked down.",
          utilityStatus: "Main oxygen manifold leaking at 40 PSI.",
          safetyHazard: "Falling curtain wall glass sheets over ambulance bay.",
          reconstructionPlan: "Secure perimeter scaffolding, seal upper glass curtain, and pressurize surgical oxygen tanks."
        },
        celebrationQuote: "St. Jude General is fully restored! All 50 ICU beds and emergency triage are accepting patients!"
      },
      {
        id: "bld_2_2",
        name: "Metropolis High-Rise Apartments",
        type: "residential",
        position: [14, 0, 8],
        rotation: -0.2,
        damageLevel: 100,
        requiredMaterials: 3,
        repairProgress: 0,
        isRepaired: false,
        description: "Cracked facade, blown-out windows, and damaged structural pillars.",
        benefits: "Provides safe shelter for 200 downtown families.",
        structuralIntegrity: 20,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("residential", 3),
        inspection: {
          structuralDamage: "Deep diagonal stress cracks across shear walls from 1st to 4th floor.",
          utilityStatus: "Domestic water main ruptured on ground floor.",
          safetyHazard: "Buckled entrance columns threatening residential foyer.",
          reconstructionPlan: "Epoxy-inject concrete fractures, install steel jacket columning, and replace triple-glazed windows."
        },
        celebrationQuote: "Metropolis Apartments are fortified and warm again! Families are returning safely inside!"
      },
      {
        id: "bld_2_3",
        name: "Central Transit Station",
        type: "city_hall",
        position: [0, 0, -16],
        rotation: 0,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Subway entrance blocked by twisted metal and shattered glass.",
        benefits: "Re-opens city transport artery for rescue fleets.",
        structuralIntegrity: 10,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("city_hall", 4),
        inspection: {
          structuralDamage: "Overhead steel arched canopy collapsed across subway mezzanine entrance.",
          utilityStatus: "Signaling grid tripped and traction power isolated.",
          safetyHazard: "Exposed electrified rails under puddle debris.",
          reconstructionPlan: "Clear train concourse rubble, hoist arched glass roof framework, and restore transit dispatch computers."
        },
        celebrationQuote: "The Central Transit hub is running! High-speed rescue convoys are flowing through the city!"
      }
    ]
  },
  {
    id: 3,
    name: "Industrial Sector & Power Grid",
    subtitle: "Sector 03 — Ruptured Transformers & Chemical Works",
    distanceToReach: 750,
    themeColor: "#eab308",
    skyColor: "#292524",
    fogColor: "#1c1917",
    restoredSkyColor: "#38bdf8",
    restoredFogColor: "#e0f2fe",
    storyBrief: "The industrial district sustained catastrophic transformer explosions. High-voltage arcs and toxic steam leaks have cut power to the entire region.",
    isRestored: false,
    residents: [
      {
        id: "res_3_1",
        name: "Chief Bradley",
        role: "Fire Brigade Captain",
        story: "Overcome by smoke while fighting electrical substation blaze.",
        quote: "Water couldn't stop the chemical fire... your foam extinguisher saved our squad!",
        position: [-7, 0, 10],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "smoke_inhalation",
        healthPercent: 25,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("smoke_inhalation", 1),
        vitalSigns: { heartRate: 112, oxygenLevel: 83, condition: 'CRITICAL' },
        thankYouQuote: "I can inhale without coughing up ash! My squad is ready to mobilize and assist your rebuilding!"
      },
      {
        id: "res_3_2",
        name: "Samira Koury",
        role: "Substation Chief",
        story: "Burn injuries from electrical arc flash.",
        quote: "I was isolating the main grid breaker when it surged. The burn salve works wonders, Rose!",
        position: [9, 0, 9],
        isRescued: false,
        requiredMedKits: 2,
        injuredType: "fracture",
        healthPercent: 15,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("fracture", 2),
        vitalSigns: { heartRate: 128, oxygenLevel: 91, condition: 'CRITICAL' },
        thankYouQuote: "The burning sensation is completely neutralized. I'll guide you through the circuit breakers to bring the substation online!"
      },
      {
        id: "res_3_3",
        name: "Kenji Sato",
        role: "Water Systems Engineer",
        story: "Trapped behind high pressure steam valve failure.",
        quote: "The valve was about to rupture the entire reservoir. Thank you for the emergency gear!",
        position: [-11, 0, -8],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 30,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 105, oxygenLevel: 93, condition: 'CRITICAL' },
        thankYouQuote: "You cut through that scalding steam pipe like a pro. The municipal water reservoir is safe thanks to you!"
      },
      {
        id: "res_3_4",
        name: "Zack Thorne",
        role: "Logistics Driver",
        story: "Fuel truck flipped over in heavy seismic tremor.",
        quote: "I thought the fuel tank would ignite any second. Rose, you're fearless!",
        position: [10, 0, -10],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 20,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 120, oxygenLevel: 90, condition: 'CRITICAL' },
        thankYouQuote: "That rescue winch saved my truck and my life! I have a whole cargo of spare construction parts for your repairs!"
      }
    ],
    buildings: [
      {
        id: "bld_3_1",
        name: "Regional Power Substation",
        type: "power_plant",
        position: [-13, 0, 5],
        rotation: 0.1,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Transformers scorched and distribution coils torn from sockets.",
        benefits: "Restores electrical energy to the entire metropolis.",
        structuralIntegrity: 10,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("power_plant", 4),
        inspection: {
          structuralDamage: "Exploded phase-3 transformer tanks; steel containment fence flattened.",
          utilityStatus: "500 Megawatt regional transmission line dead.",
          safetyHazard: "High inductive charge stored in auxiliary capacitor banks.",
          reconstructionPlan: "Erect protective blast wall, install oil-cooled transformer core, and engage high-voltage circuit switches."
        },
        celebrationQuote: "Power grid humming at 100% capacity! The entire industrial zone is electrified!"
      },
      {
        id: "bld_3_2",
        name: "Central Fire & Hazmat Station",
        type: "fire_station",
        position: [13, 0, 7],
        rotation: -0.1,
        damageLevel: 100,
        requiredMaterials: 3,
        repairProgress: 0,
        isRepaired: false,
        description: "Hangar doors crushed shut, trapping emergency rescue engines.",
        benefits: "Deploys hazmat teams and fire engines across sectors.",
        structuralIntegrity: 20,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("fire_station", 3),
        inspection: {
          structuralDamage: "Motorized hydraulic bay doors bent into inward parabolic curves.",
          utilityStatus: "Fire hose booster compressors uncoupled.",
          safetyHazard: "Fuel vapor accumulation in sealed bay.",
          reconstructionPlan: "Cut bay door track pins, install heavy-duty rolling shutter, and recharge foam pump tanks."
        },
        celebrationQuote: "Hazmat trucks and fire engines are rolling out! Emergency response time cut to zero!"
      },
      {
        id: "bld_3_3",
        name: "Municipal Water Treatment Plant",
        type: "water_tower",
        position: [0, 0, -15],
        rotation: 0,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Reservoir pumps fractured and filtration tanks leaking clean water.",
        benefits: "Restores clean drinking water supply to all citizens.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("water_tower", 4),
        inspection: {
          structuralDamage: "Intake turbine impellers shattered; clarifier basin cracked.",
          utilityStatus: "Chlorination and UV purification cycles halted.",
          safetyHazard: "10,000 gallons of clean water spilling onto foundation.",
          reconstructionPlan: "Replace high-flow impeller pumps, seal clarifier basin with waterproof membrane, and restart UV sterilizers."
        },
        celebrationQuote: "Crystal-pure drinking water is surging through every municipal tap in the city!"
      }
    ]
  },
  {
    id: 4,
    name: "Residential Hills & Community Valley",
    subtitle: "Sector 04 — Uprooted Woodlands & Mudslide Threat",
    distanceToReach: 900,
    themeColor: "#16a34a",
    skyColor: "#3f3f46",
    fogColor: "#27272a",
    restoredSkyColor: "#86efac",
    restoredFogColor: "#f0fdf4",
    storyBrief: "Giant storm gusts ripped through the hillside communities, toppling century-old pines into rooftops and washing debris down the residential canyon.",
    isRestored: false,
    residents: [
      {
        id: "res_4_1",
        name: "Principal Arthur Green",
        role: "School Principal",
        story: "Shielded school children from collapsing ceiling in gymnasium.",
        quote: "All 40 kids made it into the cellar safely. Rose, thank you for patching my arm!",
        position: [-8, 0, 9],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "fracture",
        healthPercent: 30,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("fracture", 1),
        vitalSigns: { heartRate: 98, oxygenLevel: 95, condition: 'CRITICAL' },
        thankYouQuote: "My arm is stable and painless now. The children are cheering for you, Rose! You're their real-life guardian!"
      },
      {
        id: "res_4_2",
        name: "Nurse Clara Evans",
        role: "Elderly Care Specialist",
        story: "Exhausted while evacuating wheelchair patients.",
        quote: "We couldn't climb the muddy slopes without your van's rescue winch. You're our angel!",
        position: [8, 0, 11],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "exhaustion",
        healthPercent: 20,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("exhaustion", 1),
        vitalSigns: { heartRate: 104, oxygenLevel: 92, condition: 'CRITICAL' },
        thankYouQuote: "That thermal blanket and glucose drink gave me back my strength! All our seniors are tucked in safely!"
      },
      {
        id: "res_4_3",
        name: "Tommy & Bella",
        role: "Students",
        story: "Cut off by a fallen oak tree across the school bridge.",
        quote: "Miss Rose! We were so scared the bridge would collapse. You're the best!",
        position: [-10, 0, -7],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 35,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 115, oxygenLevel: 97, condition: 'CRITICAL' },
        thankYouQuote: "You moved that gigantic tree and bandaged our scrapes! When we grow up, we want to be brave rescue heroes just like you!"
      },
      {
        id: "res_4_4",
        name: "Sergeant Diaz",
        role: "Park Ranger",
        story: "Injured by falling branches while setting up rescue tents.",
        quote: "The hillside mud is stabilizing now. Your medical kit stopped the bleeding!",
        position: [11, 0, -9],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "fracture",
        healthPercent: 25,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("fracture", 1),
        vitalSigns: { heartRate: 106, oxygenLevel: 94, condition: 'CRITICAL' },
        thankYouQuote: "The pressure bandage did the job! I'll coordinate the hillside trail clearance so we can rebuild the valley community!"
      }
    ],
    buildings: [
      {
        id: "bld_4_1",
        name: "Pine Ridge Elementary School",
        type: "school",
        position: [-14, 0, 6],
        rotation: 0.15,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Gymnasium roof shattered and classrooms covered in mud & branches.",
        benefits: "Reopens the safe education shelter for local families.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("school", 4),
        inspection: {
          structuralDamage: "Timber roof rafters snapped under fallen pine tree; library wall caved in.",
          utilityStatus: "Heating furnace offline; fire alarm circuits wet.",
          safetyHazard: "Unstable hanging ceiling tiles and glass shards.",
          reconstructionPlan: "Remove fallen tree trunk, install laminated timber trusses, insulate classrooms, and test school bell."
        },
        celebrationQuote: "The Pine Ridge School bell is ringing! Warm classrooms and laughter have returned to the valley!"
      },
      {
        id: "bld_4_2",
        name: "Valley Community Center",
        type: "residential",
        position: [14, 0, 6],
        rotation: -0.15,
        damageLevel: 100,
        requiredMaterials: 3,
        repairProgress: 0,
        isRepaired: false,
        description: "Porch collapsed and dining hall windows shattered by gale winds.",
        benefits: "Restores hot meals and shelter distribution.",
        structuralIntegrity: 20,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("residential", 3),
        inspection: {
          structuralDamage: "Covered timber porch crushed; kitchen exhaust hood bent.",
          utilityStatus: "Gas lines shut off by safety valves.",
          safetyHazard: "Mud seepage through kitchen flooring.",
          reconstructionPlan: "Rebuild treated cedar porch deck, seal weather envelope, and relight commercial soup kitchen stoves."
        },
        celebrationQuote: "Community Center kitchen is serving warm soup and blankets to all valley residents!"
      },
      {
        id: "bld_4_3",
        name: "Hillside Reservoir & Pump",
        type: "water_tower",
        position: [0, 0, -15],
        rotation: 0,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Water pressure tank ruptured by tumbling boulders.",
        benefits: "Restores high-pressure hydration to hillside homes.",
        structuralIntegrity: 10,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("water_tower", 4),
        inspection: {
          structuralDamage: "Concrete tank cradle displaced 6 inches down slope by soil erosion.",
          utilityStatus: "Pressure sensor wires cut by rockfall.",
          safetyHazard: "Slope soil saturation risk.",
          reconstructionPlan: "Anchor retaining gabions, weld steel tank cradle, and calibrate high-elevation booster pump."
        },
        celebrationQuote: "Hillside water pressure restored! Clear mountain spring water flows to every household!"
      }
    ]
  },
  {
    id: 5,
    name: "The Grand Civic Plaza & Eye of the Storm",
    subtitle: "Sector 05 — The Epicenter of Destruction",
    distanceToReach: 1100,
    themeColor: "#9333ea",
    skyColor: "#1e1b4b",
    fogColor: "#0f172a",
    restoredSkyColor: "#c084fc",
    restoredFogColor: "#faf5ff",
    storyBrief: "The core vortex of the disaster struck here. The Grand Municipal Tower, Emergency Headquarters, and City Square are in critical ruins. Rebuilding this sector will complete the total restoration of the entire city!",
    isRestored: false,
    residents: [
      {
        id: "res_5_1",
        name: "Mayor Victoria Vance",
        role: "City Mayor",
        story: "Trapped in the collapsed rotunda of City Hall.",
        quote: "Rose! We knew you wouldn't give up on our city. With your courage, we can rebuild stronger than ever!",
        position: [-6, 0, 10],
        isRescued: false,
        requiredMedKits: 2,
        injuredType: "debris_trapped",
        healthPercent: 15,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 2),
        vitalSigns: { heartRate: 122, oxygenLevel: 88, condition: 'CRITICAL' },
        thankYouQuote: "Rose, you've not only healed my injuries, you've healed the spirit of our entire civilization. I declare you the Grand Protector of the Metropolis!"
      },
      {
        id: "res_5_2",
        name: "Commander Sterling",
        role: "Disaster Relief Coordinator",
        story: "Injured while coordinating city-wide distress signals.",
        quote: "The final comms relay went silent when the storm vortex peaked. You saved our command team!",
        position: [8, 0, 10],
        isRescued: false,
        requiredMedKits: 2,
        injuredType: "fracture",
        healthPercent: 20,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("fracture", 2),
        vitalSigns: { heartRate: 114, oxygenLevel: 91, condition: 'CRITICAL' },
        thankYouQuote: "Arm and shoulder stabilized! All city sectors are transmitting green status codes thanks to your rescue vanguard!"
      },
      {
        id: "res_5_3",
        name: "Professor Ronald Sterling",
        role: "Meteorologist & Scientist",
        story: "Suffering from exhaustion after tracking the storm's vortex.",
        quote: "The Eye of Destruction is finally dissipating! Your rescue efforts have turned the tide!",
        position: [-10, 0, -8],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "exhaustion",
        healthPercent: 25,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("exhaustion", 1),
        vitalSigns: { heartRate: 100, oxygenLevel: 94, condition: 'CRITICAL' },
        thankYouQuote: "Atmospheric barometer readings are returning to normal! The storm vortex has collapsed into clear blue skies!"
      },
      {
        id: "res_5_4",
        name: "Officer June Morales",
        role: "Heroic Paramedic",
        story: "Gave her last oxygen tank to civilians before collapsing.",
        quote: "I held on hoping another hero would arrive... Rose, you're the true legend of this city!",
        position: [10, 0, -8],
        isRescued: false,
        requiredMedKits: 2,
        injuredType: "smoke_inhalation",
        healthPercent: 20,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("smoke_inhalation", 2),
        vitalSigns: { heartRate: 118, oxygenLevel: 85, condition: 'CRITICAL' },
        thankYouQuote: "Rose, you're an inspiration to every first-responder. Thank you for never turning back!"
      },
      {
        id: "res_5_5",
        name: "Little Sophie & Sparky",
        role: "Citizen & Pet",
        story: "Lost near the central plaza fountain ruins.",
        quote: "Miss Rose found Sparky and fixed my hurt knee! The sunshine is coming back!",
        position: [0, 0, 14],
        isRescued: false,
        requiredMedKits: 1,
        injuredType: "debris_trapped",
        healthPercent: 30,
        treatmentStage: 0,
        treatmentSteps: getTreatmentStepsForInjury("debris_trapped", 1),
        vitalSigns: { heartRate: 110, oxygenLevel: 98, condition: 'CRITICAL' },
        thankYouQuote: "Sparky is wagging his tail and my knee feels all better! Look Miss Rose, the fountain is splashing again!"
      }
    ],
    buildings: [
      {
        id: "bld_5_1",
        name: "Grand City Hall & Clocktower",
        type: "city_hall",
        position: [0, 0, -18],
        rotation: 0,
        damageLevel: 100,
        requiredMaterials: 5,
        repairProgress: 0,
        isRepaired: false,
        description: "The historical clocktower face cracked, grand columns toppled, and roof caved in.",
        benefits: "Restores the heartbeat and civic governance of the city.",
        structuralIntegrity: 10,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("city_hall", 5),
        inspection: {
          structuralDamage: "Historical Corinthian portico columns fractured into three sections; main clock mechanism jammed.",
          utilityStatus: "Grand rotunda chandelier collapsed onto executive council chamber floor.",
          safetyHazard: "Severe risk of clocktower spire collapse.",
          reconstructionPlan: "Hoist high-strength steel shoring, reconstruct marble columns, synchronize golden clock hands, and unveil the city crest."
        },
        celebrationQuote: "The Great City Hall Clock is striking the hour! The golden dome shines as a symbol of triumph!"
      },
      {
        id: "bld_5_2",
        name: "Metropolitan Central Trauma Center",
        type: "hospital",
        position: [-16, 0, 5],
        rotation: 0.25,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Helipad collapsed and emergency trauma wing severely compromised.",
        benefits: "Full city health rehabilitation network online.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("hospital", 4),
        inspection: {
          structuralDamage: "Rooftop medevac helipad frame cracked at landing pads; 3 ICU floors exposed to weather.",
          utilityStatus: "Central liquid oxygen tanks disconnected.",
          safetyHazard: "Hazardous medical equipment dangling from 4th floor.",
          reconstructionPlan: "Re-anchor helipad deck with titanium bolts, glaze all exterior windows, and activate city-wide medical network."
        },
        celebrationQuote: "Metropolitan Trauma Center is fully operational! Medevac helicopters are landing on the rooftop!"
      },
      {
        id: "bld_5_3",
        name: "Central Emergency Response HQ",
        type: "fire_station",
        position: [16, 0, 5],
        rotation: -0.25,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Communications satellite dish bent and garage entrance buried in rubble.",
        benefits: "City-wide automated disaster protection systems active.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("fire_station", 4),
        inspection: {
          structuralDamage: "Satellite dish bent 90 degrees; central command bunker blast door jammed.",
          utilityStatus: "City defense early-warning radar arrays disconnected.",
          safetyHazard: "Crushed transformer emitting ozone sparks outside entrance.",
          reconstructionPlan: "Craning satellite array into azimuth alignment, clear garage rubble, and activate automated warning sirens."
        },
        celebrationQuote: "Central Emergency HQ is in full command! All city sectors are synchronized under automated safety nets!"
      },
      {
        id: "bld_5_4",
        name: "Central Memorial Library & Heritage Hub",
        type: "library",
        position: [0, 0, 20],
        rotation: Math.PI,
        damageLevel: 100,
        requiredMaterials: 4,
        repairProgress: 0,
        isRepaired: false,
        description: "Classical marble arches fractured and archives exposed to elements.",
        benefits: "Preserves the cultural heart and knowledge of the restored city.",
        structuralIntegrity: 15,
        currentPhaseIndex: 0,
        repairPhases: getBuildingRepairPhases("library", 4),
        inspection: {
          structuralDamage: "Monumental stained glass dome shattered; classical marble entrance arch split.",
          utilityStatus: "Climate control archives offline.",
          safetyHazard: "Fallen marble arch blocks weighing over 4 tons.",
          reconstructionPlan: "Reassemble marble arch with internal steel tie rods, install UV-protective dome glass, and illuminate grand reading room."
        },
        celebrationQuote: "The Memorial Library & Heritage Hub is saved! Centuries of history and culture are preserved forever!"
      }
    ]
  }
];
