export type AlertLevel = 'normal' | 'yellow' | 'orange' | 'red';

export type RoadPassability = 'all' | 'high_clearance' | 'light_vehicles_not_passable' | 'impassable_boats_only';

export interface RiverStation {
  id: string;
  name: string;
  river: string;
  currentLevel: number; // in meters
  normalLevel: number;
  alertLevel: number;
  warningLevel: number;
  criticalLevel: number;
  trend: 'rising' | 'steady' | 'falling';
  status: AlertLevel;
  rateOfRisePerHour: number; // in meters/hr
  lastUpdated: string;
  coordinates: { x: number; y: number };
}

export interface DamStatus {
  name: string;
  waterLevel: number; // in meters
  spillingLevel: number;
  gateOpenings: number; // meters or count
  dischargeRate: number; // m3/sec (cms)
  status: AlertLevel;
  warningIssued: boolean;
  targetRivers: string[];
}

export interface WeatherData {
  rainfallRate: number; // mm/hr
  rainfall24h: number; // mm
  heavyRainfallWarning: AlertLevel;
  tcwsSignal: number; // 0, 1, 2, 3, 4, 5
  monsoonStatus: string;
  windSpeedKmh: number;
  temperatureC: number;
  humidity: number;
  forecastSummary: string;
}

export interface TideData {
  highTideTime: string;
  highTideHeightM: number;
  lowTideTime: string;
  lowTideHeightM: number;
  isHighTideNow: boolean;
  backflowRisk: 'low' | 'moderate' | 'high' | 'severe';
}

export interface BarangayFloodInfo {
  id: string;
  name: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
  elevationCategory: 'Lowland/Basin' | 'Riverbank' | 'Midland' | 'Upland';
  floodDepthFeet: number;
  floodDepthMeters: number;
  status: AlertLevel;
  trend: 'rising' | 'steady' | 'receding';
  affectedFamilies: number;
  roadPassability: RoadPassability;
  criticalSpots: string[];
  evacuationStatus: 'normal' | 'voluntary' | 'preemptive' | 'mandatory';
  nearestEvacuationCenterId: string;
  sirenActive: boolean;
  coordinates: { x: number; y: number };
}

export interface EvacuationCenter {
  id: string;
  name: string;
  barangay: string;
  address: string;
  capacityPersons: number;
  currentOccupancy: number;
  isAccessible: boolean;
  facilities: string[];
  contactNumber: string;
  petFriendly: boolean;
  medicalTeamOnsite: boolean;
  coordinates: { x: number; y: number };
}

export interface EmergencyRescueRequest {
  id: string;
  timestamp: string;
  barangay: string;
  contactName: string;
  contactNumber: string;
  exactLocation: string;
  headcount: number;
  hasSeniors: boolean;
  hasInfants: boolean;
  hasMedicalEmergency: boolean;
  isStrandedOnRoof: boolean;
  floodDepthFeet: number;
  status: 'pending' | 'dispatched' | 'rescued';
  notes: string;
}

export interface ScenarioConfig {
  id: 'normal' | 'habagat_high_tide' | 'dam_release' | 'typhoon_severe';
  name: string;
  tagalogName: string;
  description: string;
  overallAlert: AlertLevel;
  weather: WeatherData;
  riverStations: RiverStation[];
  dams: DamStatus[];
  tide: TideData;
  barangays: BarangayFloodInfo[];
  evacuationCenters: EvacuationCenter[];
}
