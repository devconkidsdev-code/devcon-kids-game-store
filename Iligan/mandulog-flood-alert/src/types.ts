export type AlertLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface HardwareStatus {
  esp32: 'CONNECTED' | 'DISCONNECTED';
  rainSensor: 'WORKING' | 'ERROR';
  waterLevelSensor: 'WORKING' | 'ERROR';
  velocitySensor: 'WORKING' | 'ERROR';
  lora: 'CONNECTED' | 'DISCONNECTED';
  gateway: 'ONLINE' | 'OFFLINE';
  lastPacketTime: string;
  packetSuccessRate: number;
  internet: 'ONLINE' | 'OFFLINE';
}

export interface SensorData {
  rainfall1h: number; // mm
  rainfall3h: number;
  rainfall6h: number;
  rainfall24h: number;
  currentRiverLevel: number; // meters
  rateOfRise: number; // m/hour
  waterVelocity: number; // m/s
  trend: 'STABLE' | 'RISING' | 'RAPIDLY RISING' | 'FALLING';
  timestamp: string;
}

export interface HistoricalDataPoint {
  time: string;
  level: number;
  velocity: number;
}

export interface ForecastData {
  time: string;
  type: 'OBSERVED' | 'CURRENT' | 'FORECAST';
  level: number;
}

export interface ForecastResult {
  dataPoints: ForecastData[];
  plus1h: number;
  plus3h: number;
  plus6h: number;
  probability: number;
  riskLevel: AlertLevel;
  confidence: number;
}

export interface EvacuationCenter {
  name: string;
  distance: number; // km
  capacity: number;
  contact: string;
  lat: number;
  lng: number;
}

export interface UserProfile {
  name: string;
  mobile: string;
  barangay: string;
  purok: string;
}
