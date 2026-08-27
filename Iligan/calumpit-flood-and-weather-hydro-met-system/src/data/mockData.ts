import { TelemetryStation, BarangayStatus, HydroTimeseriesPoint, CorrelationDataPoint, ShineReport, TidalData, DamStatus, AlertDispatchPayload } from '../types';

export const INITIAL_STATIONS: TelemetryStation[] = [
  {
    id: 'stn-10-caniogan',
    name: 'WL Station 10 (Caniogan Bridge)',
    code: 'CBFMMP-STN10',
    type: 'RIVER_GAUGE',
    river: 'Bagbag River (Angat-Pampanga Confluence)',
    coordinates: [14.9125, 120.7680],
    currentWaterLevel: 2.85, // Current reading in meters
    staffGaugeMax: 3.50,
    normalLevel: 1.20,
    yellowLevel: 1.50,
    orangeLevel: 2.50,
    redLevel: 3.50,
    floodTrend: 'RISING',
    rainRateMmHr: 14.2,
    rain24hMm: 68.5,
    rain3DayMm: 142.0,
    lastUpdated: 'Just now (Live)',
    status: 'ONLINE',
    details: 'Primary physical 3.5m staff gauge monitored under Bulacan PDRRMO CBFMMP. Critical bottleneck for Angat River discharge entering Pampanga River.'
  },
  {
    id: 'stn-11-calumpit-bridge',
    name: 'WL Station 11 (Calumpit Bridge)',
    code: 'CBFMMP-STN11',
    type: 'RIVER_GAUGE',
    river: 'Pampanga Main Delta Channel (Calizon)',
    coordinates: [14.9189, 120.7628],
    currentWaterLevel: 2.70,
    staffGaugeMax: 4.00,
    normalLevel: 1.10,
    yellowLevel: 1.60,
    orangeLevel: 2.60,
    redLevel: 3.60,
    floodTrend: 'RISING',
    rainRateMmHr: 15.0,
    rain24hMm: 72.0,
    rain3DayMm: 148.5,
    lastUpdated: '1 min ago',
    status: 'ONLINE',
    details: 'Monitors the Pampanga river main flow under the MacArthur Highway crossing. Captures upstream runoff from Candaba Swamp.'
  },
  {
    id: 'stn-sulipan',
    name: 'PAGASA Sulipan Telemetry Station',
    code: 'DOST-PAG-SLP',
    type: 'PAGASA_STATION',
    river: 'Pampanga River Delta',
    coordinates: [14.9385, 120.7570],
    currentWaterLevel: 3.10,
    normalLevel: 1.50,
    yellowLevel: 2.20,
    orangeLevel: 3.00,
    redLevel: 4.00,
    floodTrend: 'RISING',
    rainRateMmHr: 18.5,
    rain24hMm: 84.0,
    rain3DayMm: 165.0,
    lastUpdated: '2 mins ago',
    status: 'ONLINE',
    details: 'DOST-PAGASA National Hydro-Met Observing Network. Boundary station between Apalit, Pampanga and Calumpit, Bulacan.'
  },
  {
    id: 'stn-arayat',
    name: 'PAGASA Arayat Station',
    code: 'DOST-PAG-ARY',
    type: 'PAGASA_STATION',
    river: 'Upper Pampanga River Basin',
    coordinates: [15.1480, 120.7710],
    currentWaterLevel: 5.40,
    normalLevel: 4.00,
    yellowLevel: 6.00,
    orangeLevel: 7.50,
    redLevel: 8.50,
    floodTrend: 'RISING',
    rainRateMmHr: 22.0,
    rain24hMm: 110.5,
    rain3DayMm: 195.0,
    lastUpdated: '5 mins ago',
    status: 'ONLINE',
    details: 'Early warning upstream headwater station. High discharge here cascades to Calumpit within 8-12 hours.'
  },
  {
    id: 'pws-iangel23',
    name: 'Claro M. Recto PWS (Station ID: IANGEL23)',
    code: 'PWS-IANGEL23',
    type: 'WEATHER_STATION',
    coordinates: [14.9160, 120.7650],
    temperature: 26.4,
    humidity: 94,
    pressureInHg: 29.62,
    pressureHpa: 1003.0,
    windSpeedKmh: 28,
    windDirection: 'WSW (Habagat Monsoon)',
    windGustKmh: 46,
    dewPoint: 25.3,
    rainRateMmHr: 16.8,
    rain24hMm: 74.2,
    rain3DayMm: 152.0,
    lastUpdated: 'Real-time (15s)',
    status: 'ONLINE',
    details: 'High-precision Personal Weather Station deployed at Poblacion/Claro M. Recto corridor. Provides hyper-local barometric pressure and gust data.'
  },
  {
    id: 'stn-tidal-manila-bay',
    name: 'Manila Bay Delta Tidal Node',
    code: 'NAMRIA-TIDE-MB',
    type: 'TIDAL_GAUGE',
    coordinates: [14.8320, 120.7280],
    currentWaterLevel: 1.42, // Tide height above MSL
    floodTrend: 'RISING',
    lastUpdated: 'Live Tidal Feed',
    status: 'ONLINE',
    details: 'Tidal gauge at mouth of Hagonoy-Labangan delta. High tide acts as a hydraulic dam, impeding river drainage from Calumpit.'
  }
];

export const INITIAL_TIDAL_DATA: TidalData = {
  currentTideMsl: 1.42, // meters
  tideState: 'FLOODING_HIGH',
  nextHighTideTime: '14:45 (2:45 PM)',
  nextHighTideHeight: 1.68,
  nextLowTideTime: '21:10 (9:10 PM)',
  nextLowTideHeight: 0.18,
  tideInfluenceFactor: 0.88 // 88% backing up flow
};

export const INITIAL_DAM_STATUS: DamStatus[] = [
  {
    name: 'Angat Dam',
    location: 'Norzagaray, Bulacan (Upstream headwaters)',
    waterLevel: 211.85,
    spillingLevel: 212.00,
    normalHighWaterLevel: 210.00,
    gatesOpen: 2,
    totalGateOpeningMeters: 1.5,
    dischargeRateCms: 280, // m³/s
    trend: 'RISING',
    warningLevel: 'SPILLING_ALERT',
    estimatedArrivalToCalumpitHours: 7.5
  },
  {
    name: 'Bustos Dam (Afterbay)',
    location: 'Baliuag / Bustos, Bulacan',
    waterLevel: 17.65,
    spillingLevel: 17.50,
    normalHighWaterLevel: 17.30,
    gatesOpen: 4,
    totalGateOpeningMeters: 4.0,
    dischargeRateCms: 450, // m³/s
    trend: 'RISING',
    warningLevel: 'SPILLING_ALERT',
    estimatedArrivalToCalumpitHours: 3.0
  }
];

export const INITIAL_BARANGAYS: BarangayStatus[] = [
  {
    id: 'brgy-san-miguel',
    name: 'San Miguel',
    coordinates: [14.9080, 120.7520],
    floodHeightInches: 26,
    floodHeightMeters: 0.66,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 4210,
    householdsAffected: 940,
    evacuationCenter: {
      name: 'San Miguel Barangay Covered Court',
      capacity: 350,
      currentOccupancy: 210,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Low river embankment along Bagbag River', 'Water hyacinth backflow', 'Submerged access road'],
    lastUpdate: '5 mins ago'
  },
  {
    id: 'brgy-frances',
    name: 'Frances',
    coordinates: [14.9310, 120.7640],
    floodHeightInches: 38,
    floodHeightMeters: 0.96,
    trend: 'RISING',
    warningStatus: 'RED',
    roadPassability: 'SUBMERGED_BOATS_ONLY',
    populationAtRisk: 5120,
    householdsAffected: 1180,
    evacuationCenter: {
      name: 'Frances National High School (2F/3F)',
      capacity: 600,
      currentOccupancy: 490,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Direct Pampanga River frontage', 'Tidal backflood entrapment', 'Islanded community'],
    lastUpdate: '2 mins ago'
  },
  {
    id: 'brgy-meysulao',
    name: 'Meysulao',
    coordinates: [14.9450, 120.7780],
    floodHeightInches: 34,
    floodHeightMeters: 0.86,
    trend: 'RISING',
    warningStatus: 'RED',
    roadPassability: 'SUBMERGED_BOATS_ONLY',
    populationAtRisk: 3850,
    householdsAffected: 820,
    evacuationCenter: {
      name: 'Meysulao Elementary School Multi-Purpose Bldg',
      capacity: 400,
      currentOccupancy: 310,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Candaba Swamp catch-basin overflow', 'Agricultural submerged areas', 'Deep street flooding'],
    lastUpdate: '4 mins ago'
  },
  {
    id: 'brgy-piocruzcosa',
    name: 'Piocruzcosa',
    coordinates: [14.9020, 120.7830],
    floodHeightInches: 18,
    floodHeightMeters: 0.45,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'PASSABLE_HEAVY_ONLY',
    populationAtRisk: 3100,
    householdsAffected: 620,
    evacuationCenter: {
      name: 'Piocruzcosa Civic Center',
      capacity: 300,
      currentOccupancy: 115,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Tributary backflow', 'Low elevation residential alleys'],
    lastUpdate: '10 mins ago'
  },
  {
    id: 'brgy-calizon',
    name: 'Calizon',
    coordinates: [14.9210, 120.7600],
    floodHeightInches: 30,
    floodHeightMeters: 0.76,
    trend: 'RISING',
    warningStatus: 'RED',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 3450,
    householdsAffected: 780,
    evacuationCenter: {
      name: 'Calizon Chapel & Community Center',
      capacity: 250,
      currentOccupancy: 220,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Adjacent to Station 11 Calumpit Bridge', 'Confluence turbulence', 'Severed bypass route'],
    lastUpdate: '3 mins ago'
  },
  {
    id: 'brgy-gugo',
    name: 'Gugo',
    coordinates: [14.9280, 120.7480],
    floodHeightInches: 22,
    floodHeightMeters: 0.56,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 2800,
    householdsAffected: 590,
    evacuationCenter: {
      name: 'Gugo Elementary School',
      capacity: 300,
      currentOccupancy: 140,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Labangan Channel backwash', 'Fishpond overflow'],
    lastUpdate: '8 mins ago'
  },
  {
    id: 'brgy-gatbuca',
    name: 'Gatbuca',
    coordinates: [14.9350, 120.7740],
    floodHeightInches: 28,
    floodHeightMeters: 0.71,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 4600,
    householdsAffected: 980,
    evacuationCenter: {
      name: 'Gatbuca Barangay Hall Complex',
      capacity: 450,
      currentOccupancy: 280,
      status: 'OPEN'
    },
    keyVulnerabilities: ['MacArthur Highway approach flooding', 'River bend scour'],
    lastUpdate: '6 mins ago'
  },
  {
    id: 'brgy-poblacion',
    name: 'Poblacion',
    coordinates: [14.9175, 120.7655],
    floodHeightInches: 12,
    floodHeightMeters: 0.30,
    trend: 'RISING',
    warningStatus: 'YELLOW',
    roadPassability: 'PASSABLE_ALL',
    populationAtRisk: 6200,
    householdsAffected: 450,
    evacuationCenter: {
      name: 'Calumpit Municipal Gymnasium (MDRRMO HQ)',
      capacity: 800,
      currentOccupancy: 120,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Commercial area water pooling', 'Public market drainage backflow'],
    lastUpdate: '1 min ago'
  },
  {
    id: 'brgy-caniogan',
    name: 'Caniogan',
    coordinates: [14.9120, 120.7705],
    floodHeightInches: 24,
    floodHeightMeters: 0.61,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 3900,
    householdsAffected: 720,
    evacuationCenter: {
      name: 'Caniogan Elementary School',
      capacity: 350,
      currentOccupancy: 190,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Bridge approach flooding', 'Bagbag River surge zone'],
    lastUpdate: '7 mins ago'
  },
  {
    id: 'brgy-bulusan',
    name: 'Bulusan',
    coordinates: [14.9410, 120.7690],
    floodHeightInches: 29,
    floodHeightMeters: 0.74,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 2700,
    householdsAffected: 560,
    evacuationCenter: {
      name: 'Bulusan Multi-Purpose Center',
      capacity: 250,
      currentOccupancy: 175,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Marshland fringe', 'Delta overflow'],
    lastUpdate: '12 mins ago'
  },
  {
    id: 'brgy-corazon',
    name: 'Corazon',
    coordinates: [14.9150, 120.7560],
    floodHeightInches: 20,
    floodHeightMeters: 0.51,
    trend: 'RISING',
    warningStatus: 'ORANGE',
    roadPassability: 'NOT_PASSABLE_LIGHT',
    populationAtRisk: 3100,
    householdsAffected: 610,
    evacuationCenter: {
      name: 'Corazon Covered Court',
      capacity: 280,
      currentOccupancy: 110,
      status: 'OPEN'
    },
    keyVulnerabilities: ['River bend backwater', 'Drainage blockage'],
    lastUpdate: '9 mins ago'
  },
  {
    id: 'brgy-sapang-bayan',
    name: 'Sapang Bayan',
    coordinates: [14.8980, 120.7490],
    floodHeightInches: 32,
    floodHeightMeters: 0.81,
    trend: 'RISING',
    warningStatus: 'RED',
    roadPassability: 'SUBMERGED_BOATS_ONLY',
    populationAtRisk: 4100,
    householdsAffected: 890,
    evacuationCenter: {
      name: 'Sapang Bayan Integrated School',
      capacity: 400,
      currentOccupancy: 330,
      status: 'OPEN'
    },
    keyVulnerabilities: ['Direct tidal ingress channel', 'Hagonoy boundary lowest depression'],
    lastUpdate: '3 mins ago'
  }
];

// 72-Hour Hydro-Meteorological Timeseries with Tidal Ripple overlay
export const GENERATE_HYDRO_TIMESERIES = (): HydroTimeseriesPoint[] => {
  const points: HydroTimeseriesPoint[] = [];
  const now = new Date();
  
  for (let i = 48; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const hourLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Simulate tidal ripple (12.42 hour lunar cycle)
    const hoursFromStart = 48 - i;
    const tideSin = Math.sin((hoursFromStart / 12.42) * 2 * Math.PI);
    const tidalComponent = 0.45 * tideSin; // +/- 0.45m tidal fluctuation
    
    // Rainfall progression modeling heavy monsoon bands
    let hourlyRain = 0;
    if (i <= 36 && i >= 20) {
      hourlyRain = Math.max(0, 8 + Math.sin(i * 0.5) * 6 + Math.random() * 4);
    } else if (i < 20 && i >= 6) {
      hourlyRain = Math.max(0, 14 + Math.cos(i * 0.4) * 8 + Math.random() * 6);
    } else if (i < 6) {
      hourlyRain = Math.max(0, 16 + Math.random() * 7);
    } else {
      hourlyRain = Math.max(0, 2 + Math.random() * 3);
    }
    
    // Cumulative 24h rain
    const cumulative24h = Math.min(188, 25 + (48 - i) * 1.6);
    
    // River level baseline rising with upstream Angat/Bustos releases + local rain
    const baseRiver = 1.10 + ((48 - i) / 48) * 1.55; // rises from 1.10m to 2.65m
    const confluenceLevel = Number((baseRiver + tidalComponent + (hourlyRain * 0.015)).toFixed(2));
    
    points.push({
      timestamp: t.toISOString(),
      hourLabel,
      hourlyRainMm: Number(hourlyRain.toFixed(1)),
      cumulative24hRainMm: Number(cumulative24h.toFixed(1)),
      riverLevelMeters: Number(baseRiver.toFixed(2)),
      tidalComponentMeters: Number(tidalComponent.toFixed(2)),
      confluenceEffectiveLevelMeters: confluenceLevel,
      yellowThreshold: 1.50,
      orangeThreshold: 2.50,
      redThreshold: 3.50
    });
  }
  return points;
};

// Historical Correlation Dataset: 3-Day Cumulative Rainfall (mm) vs River Delta Depth (m) [R = 0.83]
export const HISTORICAL_CORRELATION_DATA: CorrelationDataPoint[] = [
  { rainfall3DayMm: 35, riverDeltaDepthM: 1.30, date: 'Nov 12, 2024' },
  { rainfall3DayMm: 48, riverDeltaDepthM: 1.45, date: 'Dec 05, 2024' },
  { rainfall3DayMm: 62, riverDeltaDepthM: 1.70, date: 'Jun 18, 2025' },
  { rainfall3DayMm: 75, riverDeltaDepthM: 1.95, date: 'Jul 04, 2025' },
  { rainfall3DayMm: 90, riverDeltaDepthM: 2.25, date: 'Jul 22, 2025' },
  { rainfall3DayMm: 110, riverDeltaDepthM: 2.60, date: 'Aug 14, 2025' },
  { rainfall3DayMm: 125, riverDeltaDepthM: 2.85, date: 'Sep 02, 2025' },
  { rainfall3DayMm: 140, riverDeltaDepthM: 3.10, date: 'Oct 19, 2025' },
  { rainfall3DayMm: 160, riverDeltaDepthM: 3.45, date: 'Jul 28, 2026', eventLabel: 'Typhoon Enhanced Habagat Band 1' },
  { rainfall3DayMm: 175, riverDeltaDepthM: 3.75, date: 'Aug 04, 2026', eventLabel: 'Confluence Spill Surge' },
  { rainfall3DayMm: 188, riverDeltaDepthM: 4.12, date: 'Aug 09, 2026', eventLabel: 'HISTORICAL MONSOON PEAK (188mm / 4.12m)' },
  { rainfall3DayMm: 80, riverDeltaDepthM: 2.05, date: 'Aug 14, 2026' },
  { rainfall3DayMm: 142, riverDeltaDepthM: 2.85, date: 'Current Event (Aug 18, 2026)', eventLabel: 'ACTIVE FLOOD EVENT' }
];

export const INITIAL_SHINE_REPORTS: ShineReport[] = [
  {
    id: 'shine-001',
    schoolName: 'Frances National High School',
    observerName: 'Mark Lester Santos (Grade 11 SHINe Club Lead)',
    gaugeReadingMm: 34.5,
    timestamp: '15 mins ago',
    rainfallType: 'HEAVY',
    turbidityObserved: 'HEAVILY_SILTED',
    waterHyacinthClogging: true,
    fieldNotes: 'Heavy accumulation of water hyacinths (water lilies) under the Frances footbridge structure. Water level on concrete embankment is 4 inches below road level.',
    verified: true
  },
  {
    id: 'shine-002',
    schoolName: 'Frances Elementary School',
    observerName: 'Althea Ramos (SHINe Science Observer)',
    gaugeReadingMm: 32.0,
    timestamp: '35 mins ago',
    rainfallType: 'HEAVY',
    turbidityObserved: 'MURKY_BROWN',
    waterHyacinthClogging: true,
    fieldNotes: 'School ground courtyard flooded by 8 inches of backwater from Pampanga River. Manual rain cylinder emptied at 14:00H.',
    verified: true
  },
  {
    id: 'shine-003',
    schoolName: 'Meysulao Elementary School',
    observerName: 'Teacher Danica Cruz (SHINe Adviser)',
    gaugeReadingMm: 28.0,
    timestamp: '1 hour ago',
    rainfallType: 'MODERATE',
    turbidityObserved: 'HEAVILY_SILTED',
    waterHyacinthClogging: false,
    fieldNotes: 'Main road outside school is submerged. Only elevated rescue trucks and motorized bankas can navigate.',
    verified: true
  },
  {
    id: 'shine-004',
    schoolName: 'Calumpit National High School (Poblacion)',
    observerName: 'Joshua De Guzman (SHINe Student Scout)',
    gaugeReadingMm: 22.5,
    timestamp: '2 hours ago',
    rainfallType: 'MODERATE',
    turbidityObserved: 'MURKY_BROWN',
    waterHyacinthClogging: false,
    fieldNotes: 'Rainfall steady. Drainage canals flowing rapidly towards Bagbag River tributary.',
    verified: true
  }
];

export const INITIAL_ALERT_DISPATCHES: AlertDispatchPayload[] = [
  {
    id: 'dispatch-001',
    timestamp: '10 mins ago',
    alertLevel: 'ORANGE',
    title: 'MDRRMO Pre-Evacuation Advisory: Confluence Spill Threat',
    messageTagalog: 'BABALA NG MDRRMO CALUMPIT (ORANGE ALERT): Ang antas ng tubig sa Caniogan Bridge (Bagbag River) ay umabot sa 2.85 metro. Inaasahan ang pagtaas pa dahil sa pagpapakawala ng Bustos Dam at paparating na high tide (14:45H). Hinihikayat ang mga residente sa Brgy. Frances, San Miguel, Meysulao, at Calizon na maghanda ng emergency go-bag at lumipat sa evacuation centers.',
    messageEnglish: 'CALUMPIT MDRRMO WARNING (ORANGE ALERT): Water level at Caniogan Bridge has reached 2.85 meters. Further rise expected due to Bustos Dam discharge and incoming Manila Bay high tide. Pre-evacuation advised for Frances, San Miguel, Meysulao, and Calizon.',
    targetRecipients: ['All 29 BDRRMC Captains', 'Calumpit Rescue 911 Operations', 'Bulacan PDRRMO Dispatch', 'Registered Community Responders (4,820 SMS)'],
    channels: ['SMS_TWILIO', 'EMAIL_SENDGRID', 'SIREN_BROADCAST', 'VHF_RADIO'],
    triggeredBy: 'Automated Threshold: Caniogan Gauge > 2.50m (Current: 2.85m)',
    status: 'SENT'
  },
  {
    id: 'dispatch-002',
    timestamp: '3 hours ago',
    alertLevel: 'YELLOW',
    title: 'PAGASA / PDRRMO Hydro-Met Advisory - Heavy Rainfall Band',
    messageTagalog: 'ALERTO LEVEL 1 (DILAW): Tuloy-tuloy na pag-ulan dulot ng Habagat. 24-hr cumulative rainfall lumampas sa 50mm. Maging alerto sa pagbaha sa mabababang lugar.',
    messageEnglish: 'ALERT LEVEL 1 (YELLOW): Continuous Habagat monsoon rainfall exceeding 50mm in 24 hours. Low-lying riverside barangays advised to monitor water gauges.',
    targetRecipients: ['BDRRMC Action Officers', 'Public Advisory Board'],
    channels: ['SMS_TWILIO', 'EMAIL_SENDGRID'],
    triggeredBy: 'PAGASA 24h Cumulative Rain > 50mm',
    status: 'SENT'
  }
];

export const EVACUATION_CENTERS = [
  {
    id: 'evac-mun-gym',
    name: 'Calumpit Municipal Gymnasium (MDRRMO Incident Command)',
    barangay: 'Poblacion',
    coordinates: [14.9175, 120.7655] as [number, number],
    capacity: 800,
    currentOccupancy: 120,
    status: 'OPEN' as const,
    structureType: 'Municipal Gymnasium (Elevated Concrete Floor)',
    elevationMslMeters: 6.8,
    contactPerson: 'Engr. Ryan De Jesus (MDRRMO Chief)',
    contactNumber: '(044) 911-CALUMPIT / 0917-889-MDRR',
    amenities: ['Emergency Standby Generator (50kVA)', 'Rural Health Unit (RHU) Medical Station', 'Clean Potable Water Filtration Unit', 'Relief Pack Distribution Center', 'Child & Women Friendly Space', 'Lactation Station'],
    medicalPostActive: true,
    generatorStandby: true,
    reliefGoodsStockCount: 1450
  },
  {
    id: 'evac-frances-nhs',
    name: 'Frances National High School (2F/3F Resilience Complex)',
    barangay: 'Frances',
    coordinates: [14.9310, 120.7640] as [number, number],
    capacity: 600,
    currentOccupancy: 490,
    status: 'OPEN' as const,
    structureType: 'Multi-Storey School Building (Upper Floors Only)',
    elevationMslMeters: 5.4,
    contactPerson: 'Kapitan Danilo Santos (BDRRMC Frances)',
    contactNumber: '0922-456-7891',
    amenities: ['2F & 3F Elevated Classrooms (Flood-Safe)', 'Solar Emergency Battery Lighting', 'Motorized Rescue Boat Dock', 'First Aid Trauma Station'],
    medicalPostActive: true,
    generatorStandby: true,
    reliefGoodsStockCount: 380
  },
  {
    id: 'evac-meysulao-elem',
    name: 'Meysulao Elementary School Multi-Purpose Hall',
    barangay: 'Meysulao',
    coordinates: [14.9450, 120.7780] as [number, number],
    capacity: 400,
    currentOccupancy: 310,
    status: 'OPEN' as const,
    structureType: 'Elevated Multi-Purpose Academic Building',
    elevationMslMeters: 4.8,
    contactPerson: 'Kapitana Elena Cruz (BDRRMC Meysulao)',
    contactNumber: '0918-765-4321',
    amenities: ['Reinforced Concrete Stage Area', 'Mobile Water Filtration Bladder', 'Community Kitchen', 'Radio Comms VHF Node'],
    medicalPostActive: false,
    generatorStandby: true,
    reliefGoodsStockCount: 220
  },
  {
    id: 'evac-gatbuca-complex',
    name: 'Gatbuca Barangay Hall & Covered Evacuation Center',
    barangay: 'Gatbuca',
    coordinates: [14.9350, 120.7740] as [number, number],
    capacity: 450,
    currentOccupancy: 280,
    status: 'OPEN' as const,
    structureType: 'Elevated Civic Center & Barangay Compound',
    elevationMslMeters: 5.9,
    contactPerson: 'Kagawad Roberto Mendoza',
    contactNumber: '0933-112-9988',
    amenities: ['Direct MacArthur Highway Access', 'Heavy Truck Offloading Bay', '24/7 Security & PNP Substation', 'Portable Toilets & WASH Facilities'],
    medicalPostActive: true,
    generatorStandby: true,
    reliefGoodsStockCount: 650
  },
  {
    id: 'evac-caniogan-elem',
    name: 'Caniogan Elementary School (Upper Building)',
    barangay: 'Caniogan',
    coordinates: [14.9120, 120.7705] as [number, number],
    capacity: 350,
    currentOccupancy: 190,
    status: 'OPEN' as const,
    structureType: 'School Building (Second Floor)',
    elevationMslMeters: 5.5,
    contactPerson: 'Kapitan Jose Mari Garcia',
    contactNumber: '0919-334-5566',
    amenities: ['Emergency Genset', 'Clean Water Reservoir Tank', 'BDRRMC Flood Monitoring Post'],
    medicalPostActive: true,
    generatorStandby: true,
    reliefGoodsStockCount: 410
  },
  {
    id: 'evac-san-miguel-court',
    name: 'San Miguel Civic Court & Pastoral Center',
    barangay: 'San Miguel',
    coordinates: [14.9080, 120.7520] as [number, number],
    capacity: 350,
    currentOccupancy: 210,
    status: 'OPEN' as const,
    structureType: 'Covered Court & Elevated Parish Hall',
    elevationMslMeters: 4.9,
    contactPerson: 'Kapitan Rolando Reyes',
    contactNumber: '0920-554-1122',
    amenities: ['Elevated Stage Platform', 'Mobile Feeding Program Station', 'Rescue Boat Slipway Access'],
    medicalPostActive: false,
    generatorStandby: true,
    reliefGoodsStockCount: 290
  },
  {
    id: 'evac-sapang-bayan',
    name: 'Sapang Bayan Integrated School Multi-Level',
    barangay: 'Sapang Bayan',
    coordinates: [14.8980, 120.7490] as [number, number],
    capacity: 400,
    currentOccupancy: 330,
    status: 'OPEN' as const,
    structureType: '3-Storey Typhoon-Resistant School Building',
    elevationMslMeters: 5.2,
    contactPerson: 'Kagawad Antonio Perez',
    contactNumber: '0927-665-8899',
    amenities: ['Solar Power Array', 'Rainwater Harvesting Treatment Unit', 'Amphibious Vehicle Staging Area'],
    medicalPostActive: true,
    generatorStandby: true,
    reliefGoodsStockCount: 310
  }
];

export const SAFE_ROUTES = [
  {
    id: 'route-frances-boat',
    name: 'Frances Islanded Sector $\\rightarrow$ Poblacion MDRRMO Command via Rescue Boat Corridor',
    originBarangay: 'Frances',
    destinationCenterId: 'evac-mun-gym',
    destinationCenterName: 'Calumpit Municipal Gymnasium',
    routeType: 'BOAT_RESCUE_CHANNEL' as const,
    pathCoordinates: [
      [14.9310, 120.7640],
      [14.9260, 120.7635],
      [14.9210, 120.7630],
      [14.9180, 120.7650],
      [14.9175, 120.7655]
    ] as [number, number][],
    distanceKm: 2.2,
    estimatedTravelTimeMins: 18,
    status: 'SAFE_PASSABLE' as const,
    elevationAdvantage: 'Deep navigable waterway bypass avoiding submerged MacArthur bridge bottlenecks.',
    instructionsTagalog: 'Sumakay sa motorized fiberglass rescue banka ng BDRRMC Frances sa Frances River Landing. Mag-navigate timog patungong Pampanga River Main Channel patungong Poblacion Municipal Pier. Mahigpit na ipinagbabawal ang paglalakad sa baha dahil sa malakas na agos ng Pampanga river.',
    instructionsEnglish: 'Board BDRRMC Frances motorized rescue boat at Frances River Landing. Navigate south along the Pampanga River corridor directly to Poblacion Municipal Pier. Walking or wading is strictly prohibited due to swift 1.2m/s river currents.',
    stagingPoints: [
      { name: 'Frances River Landing (Boat Launch)', coordinates: [14.9310, 120.7640] as [number, number], type: 'BOAT_LAUNCH' as const },
      { name: 'Calumpit Bridge Rescue Hub (VHF Relay)', coordinates: [14.9189, 120.7628] as [number, number], type: 'MEDICAL_POST' as const },
      { name: 'Poblacion Municipal Dock (Safe Disembarkation)', coordinates: [14.9175, 120.7655] as [number, number], type: 'TRUCK_PICKUP' as const }
    ]
  },
  {
    id: 'route-meysulao-to-gatbuca',
    name: 'Meysulao North Causeway $\\rightarrow$ Gatbuca Complex via MacArthur Elevated Corridor',
    originBarangay: 'Meysulao',
    destinationCenterId: 'evac-gatbuca-complex',
    destinationCenterName: 'Gatbuca Barangay Hall Complex',
    routeType: 'ELEVATED_CAUSEWAY' as const,
    pathCoordinates: [
      [14.9450, 120.7780],
      [14.9410, 120.7765],
      [14.9375, 120.7750],
      [14.9350, 120.7740]
    ] as [number, number][],
    distanceKm: 1.4,
    estimatedTravelTimeMins: 12,
    status: 'SAFE_PASSABLE' as const,
    elevationAdvantage: 'Raised concrete causeway 1.5m above surrounding agricultural flood basins.',
    instructionsTagalog: 'Lumakad o sumakay sa mga military 6x6 rescue truck sa Meysulao North Causeway. Manatili sa gitna ng sementadong kalsada patungong Gatbuca Hall. Huwag dumaan sa mga gilid ng palayan.',
    instructionsEnglish: 'Proceed along the elevated Meysulao North Causeway towards Gatbuca. Military 6x6 rescue trucks and high-clearance vehicles are operating continuous shuttle runs.',
    stagingPoints: [
      { name: 'Meysulao School Staging (Truck Pickup)', coordinates: [14.9450, 120.7780] as [number, number], type: 'TRUCK_PICKUP' as const },
      { name: 'Gatbuca Causeway Checkpoint (WASH & Medical)', coordinates: [14.9350, 120.7740] as [number, number], type: 'MEDICAL_POST' as const }
    ]
  },
  {
    id: 'route-san-miguel-to-caniogan',
    name: 'San Miguel Riverside $\\rightarrow$ Caniogan Elementary School via High-Ground Artery',
    originBarangay: 'San Miguel',
    destinationCenterId: 'evac-caniogan-elem',
    destinationCenterName: 'Caniogan Elementary School',
    routeType: 'ROAD_HIGH_GROUND' as const,
    pathCoordinates: [
      [14.9080, 120.7520],
      [14.9095, 120.7580],
      [14.9110, 120.7640],
      [14.9120, 120.7705]
    ] as [number, number][],
    distanceKm: 2.1,
    estimatedTravelTimeMins: 15,
    status: 'CAUTION_RISING_WATER' as const,
    elevationAdvantage: 'Avoids low Bagbag dike road; connects through Caniogan high-ground residential ridge.',
    instructionsTagalog: 'Umiwas sa Bagbag Riverbank trail na may banta ng overtopping. Gamitin ang panloob na Caniogan Ridge Road papasok sa Caniogan Elementary School 2F building.',
    instructionsEnglish: 'Avoid the Bagbag riverbank road which is at risk of overtopping. Follow the Caniogan Ridge Road inland directly to Caniogan Elementary School.',
    stagingPoints: [
      { name: 'San Miguel Chapel Pickup Post', coordinates: [14.9080, 120.7520] as [number, number], type: 'TRUCK_PICKUP' as const },
      { name: 'Caniogan Bridge North Staging', coordinates: [14.9125, 120.7680] as [number, number], type: 'BOAT_LAUNCH' as const }
    ]
  },
  {
    id: 'route-calizon-to-gym',
    name: 'Calizon $\\rightarrow$ Poblacion Municipal Gym via High-Ground MacArthur Bypass',
    originBarangay: 'Calizon',
    destinationCenterId: 'evac-mun-gym',
    destinationCenterName: 'Calumpit Municipal Gymnasium',
    routeType: 'ROAD_HIGH_GROUND' as const,
    pathCoordinates: [
      [14.9210, 120.7600],
      [14.9195, 120.7620],
      [14.9180, 120.7640],
      [14.9175, 120.7655]
    ] as [number, number][],
    distanceKm: 0.9,
    estimatedTravelTimeMins: 8,
    status: 'SAFE_PASSABLE' as const,
    elevationAdvantage: 'High elevation approach to Town Center; monitored by PNP traffic marshals.',
    instructionsTagalog: 'Dumiretso sa Calumpit Town Plaza Bypass patungong Municipal Gym. Ang daan ay binabantayan ng PNP Calumpit at MDRRMO marshals.',
    instructionsEnglish: 'Follow the Calumpit Town Plaza Bypass directly to the Municipal Gymnasium. Path is elevated and safeguarded by PNP traffic marshals.',
    stagingPoints: [
      { name: 'Calizon Bridge Approach Post', coordinates: [14.9210, 120.7600] as [number, number], type: 'TRUCK_PICKUP' as const },
      { name: 'Municipal Gym Main Triage Gate', coordinates: [14.9175, 120.7655] as [number, number], type: 'MEDICAL_POST' as const }
    ]
  },
  {
    id: 'route-sapang-bayan-boat',
    name: 'Sapang Bayan Tidal Corridor $\\rightarrow$ Sapang Bayan Integrated School 3F',
    originBarangay: 'Sapang Bayan',
    destinationCenterId: 'evac-sapang-bayan',
    destinationCenterName: 'Sapang Bayan Integrated School',
    routeType: 'BOAT_RESCUE_CHANNEL' as const,
    pathCoordinates: [
      [14.8980, 120.7490],
      [14.9000, 120.7500],
      [14.9015, 120.7510],
      [14.8980, 120.7490]
    ] as [number, number][],
    distanceKm: 0.8,
    estimatedTravelTimeMins: 10,
    status: 'SAFE_PASSABLE' as const,
    elevationAdvantage: 'Vertical evacuation into 3-Storey reinforced school complex above Manila Bay tidal surge.',
    instructionsTagalog: 'Magsagawa ng vertical evacuation sa 2nd at 3rd floor ng Sapang Bayan Integrated School. Huwag lumusong sa tidal channel dahil sa paparating na high tide.',
    instructionsEnglish: 'Execute vertical evacuation to the 2nd and 3rd floors of Sapang Bayan Integrated School. Do not attempt road crossing during Manila Bay high tide surge.',
    stagingPoints: [
      { name: 'Sapang Bayan River Landing Pier', coordinates: [14.8980, 120.7490] as [number, number], type: 'BOAT_LAUNCH' as const }
    ]
  }
];

