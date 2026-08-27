export type AlertSeverity = 'NORMAL' | 'YELLOW' | 'ORANGE' | 'RED';

export interface TelemetryStation {
  id: string;
  name: string;
  code: string;
  type: 'RIVER_GAUGE' | 'WEATHER_STATION' | 'PAGASA_STATION' | 'TIDAL_GAUGE' | 'DAM_MONITOR';
  river?: string;
  coordinates: [number, number]; // [lat, lng]
  currentWaterLevel?: number; // in meters
  staffGaugeMax?: number; // e.g. 3.5m for Caniogan
  normalLevel?: number;
  yellowLevel?: number;
  orangeLevel?: number;
  redLevel?: number;
  floodTrend?: 'RISING' | 'STABLE' | 'RECEDING';
  temperature?: number; // °C
  humidity?: number; // %
  pressureInHg?: number; // inHg
  pressureHpa?: number; // hPa
  windSpeedKmh?: number; // km/h
  windDirection?: string;
  windGustKmh?: number;
  dewPoint?: number; // °C
  rainRateMmHr?: number;
  rain24hMm?: number;
  rain3DayMm?: number;
  lastUpdated: string;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  details?: string;
}

export interface TidalData {
  currentTideMsl: number; // meters above MSL
  tideState: 'FLOODING_HIGH' | 'EBBING_LOW' | 'SLACK_HIGH' | 'SLACK_LOW';
  nextHighTideTime: string;
  nextHighTideHeight: number; // m
  nextLowTideTime: string;
  nextLowTideHeight: number; // m
  tideInfluenceFactor: number; // 0-1 scale impact on Bagbag/Pampanga confluence
}

export interface DamStatus {
  name: string;
  location: string;
  waterLevel: number; // meters
  spillingLevel: number; // meters
  normalHighWaterLevel: number; // meters
  gatesOpen: number;
  totalGateOpeningMeters: number;
  dischargeRateCms: number; // cubic meters per second (m³/s)
  trend: 'RISING' | 'STABLE' | 'RECEDING';
  warningLevel: 'NORMAL' | 'PREPARATION' | 'SPILLING_ALERT';
  estimatedArrivalToCalumpitHours: number;
}

export interface BarangayStatus {
  id: string;
  name: string;
  coordinates: [number, number];
  floodHeightInches: number;
  floodHeightMeters: number;
  trend: 'RISING' | 'STABLE' | 'RECEDING';
  warningStatus: AlertSeverity;
  roadPassability: 'PASSABLE_ALL' | 'PASSABLE_HEAVY_ONLY' | 'NOT_PASSABLE_LIGHT' | 'SUBMERGED_BOATS_ONLY' | 'IMPASSABLE';
  populationAtRisk: number;
  householdsAffected: number;
  evacuationCenter: {
    name: string;
    capacity: number;
    currentOccupancy: number;
    status: 'OPEN' | 'STANDBY' | 'FULL';
  };
  keyVulnerabilities: string[];
  lastUpdate: string;
}

export interface HydroTimeseriesPoint {
  timestamp: string;
  hourLabel: string;
  hourlyRainMm: number;
  cumulative24hRainMm: number;
  riverLevelMeters: number;
  tidalComponentMeters: number;
  confluenceEffectiveLevelMeters: number;
  yellowThreshold: number;
  orangeThreshold: number;
  redThreshold: number;
}

export interface CorrelationDataPoint {
  rainfall3DayMm: number;
  riverDeltaDepthM: number;
  date: string;
  eventLabel?: string;
}

export interface ShineReport {
  id: string;
  schoolName: string;
  observerName: string;
  gaugeReadingMm: number;
  timestamp: string;
  rainfallType: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TORRENTIAL';
  turbidityObserved: 'CLEAR' | 'MURKY_BROWN' | 'HEAVILY_SILTED';
  waterHyacinthClogging: boolean;
  fieldNotes: string;
  verified: boolean;
}

export interface AlertDispatchPayload {
  id: string;
  timestamp: string;
  alertLevel: AlertSeverity;
  title: string;
  messageTagalog: string;
  messageEnglish: string;
  targetRecipients: string[];
  channels: ('SMS_TWILIO' | 'EMAIL_SENDGRID' | 'SIREN_BROADCAST' | 'VHF_RADIO')[];
  triggeredBy: string;
  status: 'SENT' | 'SIMULATED_SUCCESS' | 'DISPATCHING';
}

export interface AISituationReport {
  title: string;
  overallThreatLevel: AlertSeverity;
  executiveSummary: string;
  confluenceDynamics: string;
  tidalWindowAdvisory: string;
  highRiskBarangays: string[];
  recommendedMdrrmoActions: string[];
  publicAdvisoryTagalog: string;
  generatedAt: string;
}

export interface EvacuationCenterDetail {
  id: string;
  name: string;
  barangay: string;
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  status: 'OPEN' | 'STANDBY' | 'FULL';
  structureType: string;
  elevationMslMeters: number;
  contactPerson: string;
  contactNumber: string;
  amenities: string[];
  medicalPostActive: boolean;
  generatorStandby: boolean;
  reliefGoodsStockCount: number;
}

export interface SafeRoute {
  id: string;
  name: string;
  originBarangay: string;
  destinationCenterId: string;
  destinationCenterName: string;
  routeType: 'ROAD_HIGH_GROUND' | 'ELEVATED_CAUSEWAY' | 'BOAT_RESCUE_CHANNEL';
  pathCoordinates: [number, number][];
  distanceKm: number;
  estimatedTravelTimeMins: number;
  status: 'SAFE_PASSABLE' | 'CAUTION_RISING_WATER' | 'SUBMERGED_CLOSED';
  elevationAdvantage: string;
  instructionsTagalog: string;
  instructionsEnglish: string;
  stagingPoints: {
    name: string;
    coordinates: [number, number];
    type: 'BOAT_LAUNCH' | 'TRUCK_PICKUP' | 'MEDICAL_POST';
  }[];
}

