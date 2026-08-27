import { AlertLevel, EvacuationCenter, ForecastData, ForecastResult, SensorData, HistoricalDataPoint } from './types';

export const ALERT_MESSAGES: Record<AlertLevel, { title: string; bisaya: string; color: string; bgColor: string }> = {
  GREEN: {
    title: 'GREEN ALERT: NORMAL',
    bisaya: 'Luwas pa ang kahimtang sa suba. Padayon lang sa pagmonitor.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100 border-emerald-500',
  },
  YELLOW: {
    title: 'YELLOW ALERT: WATCH',
    bisaya: 'Luwas pa ang kahimtang sa suba, apan nagkataas ang lebel sa tubig. Padayon sa pagmonitor ug pag-andam.',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100 border-yellow-500',
  },
  ORANGE: {
    title: 'ORANGE ALERT: ALERT',
    bisaya: 'Nagpas-pas ang pagsaka sa lebel sa tubig. Posibleng maapektuhan ang inyong lugar. Pag-andam sa posibleng pagbalhin sa luwas nga lugar.',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100 border-orange-500',
  },
  RED: {
    title: 'RED ALERT: CRITICAL',
    bisaya: 'Kritikal ang kahimtang sa suba. Posibleng adunay pagbaha sa inyong lugar. Palihug sunda ang opisyal nga evacuation instructions ug adto sa gitudlong evacuation center.',
    color: 'text-red-800',
    bgColor: 'bg-red-100 border-red-600',
  },
};

export const EVACUATION_CENTERS: Record<string, EvacuationCenter[]> = {
  'Hinaplanon': [
    { name: 'Hinaplanon National High School', distance: 1.2, capacity: 500, contact: '0917-123-4567', lat: 8.2435, lng: 124.2541 },
    { name: 'Hinaplanon Barangay Hall Covered Court', distance: 0.5, capacity: 300, contact: '0918-987-6543', lat: 8.2412, lng: 124.2510 }
  ],
  'San Roque': [
    { name: 'San Roque Elementary School', distance: 0.8, capacity: 400, contact: '0919-555-1234', lat: 8.2389, lng: 124.2577 }
  ],
  'Mandulog': [
    { name: 'Mandulog Barangay Hall', distance: 0.3, capacity: 200, contact: '0920-111-2222', lat: 8.2460, lng: 124.2490 }
  ]
};

export const BARANGAYS = ['Hinaplanon', 'San Roque', 'Mandulog', 'Tubod', 'Mahayahay'];
export const PUROKS: Record<string, string[]> = {
  'Hinaplanon': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4 Riverside'],
  'San Roque': ['Purok 1', 'Purok 2', 'Purok 3'],
  'Mandulog': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4'],
  'Tubod': ['Purok 1', 'Purok 2', 'Purok 3'],
  'Mahayahay': ['Purok 1', 'Purok 2'],
};

// Thresholds for Mandulog River
export const THRESHOLDS = {
  YELLOW: 4.0, // meters
  ORANGE: 6.0, // meters
  RED: 8.0,    // meters
};

export const VELOCITY_THRESHOLDS = {
  MODERATE: 1.5, // m/s
  FAST: 3.0,     // m/s
  VERY_FAST: 4.5 // m/s
};

export const generateHistoricalData = (currentLevel: number, currentVelocity: number, hours: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const pastTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Add some random noise to make it look realistic, tending towards current
    const noiseLevel = (Math.random() - 0.5) * 0.5;
    const noiseVel = (Math.random() - 0.5) * 0.5;
    
    // Scale the values so they end at the current value
    const factor = i / hours; // 1 to 0
    const level = Math.max(0.5, currentLevel - (currentLevel * 0.3 * factor) + noiseLevel * (1 - factor));
    const velocity = Math.max(0.1, currentVelocity - (currentVelocity * 0.4 * factor) + noiseVel * (1 - factor));

    data.push({
      time: i === 0 ? 'NOW' : `-${i}h`,
      level: parseFloat(level.toFixed(2)),
      velocity: parseFloat(velocity.toFixed(2))
    });
  }
  
  // Ensure the last point is exactly the current values
  if (data.length > 0) {
    data[data.length - 1].level = currentLevel;
    data[data.length - 1].velocity = currentVelocity;
  }

  return data;
};

export const runAIForecast = (sensorData: SensorData): ForecastResult => {
  const now = new Date();
  const dataPoints: ForecastData[] = [];
  
  // Create mocked historical "OBSERVED" data points based on trend
  for (let i = 3; i > 0; i--) {
    const pastTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const pastLevel = Math.max(0.5, sensorData.currentRiverLevel - (sensorData.rateOfRise * i));
    dataPoints.push({
      time: `-${i}h`,
      type: 'OBSERVED',
      level: parseFloat(pastLevel.toFixed(2))
    });
  }

  // Current
  dataPoints.push({
    time: 'NOW',
    type: 'CURRENT',
    level: parseFloat(sensorData.currentRiverLevel.toFixed(2))
  });

  // Time-series impact simulation
  let projectedLevel = sensorData.currentRiverLevel;
  
  // Base rate from current trend
  let currentRate = sensorData.rateOfRise;
  
  // Additional impact from recent rainfall (simulating basin delay)
  const rainfallImpact = (sensorData.rainfall1h * 0.05) + (sensorData.rainfall3h * 0.02) + (sensorData.rainfall6h * 0.01);
  
  let plus1h = 0;
  let plus3h = 0;
  let plus6h = 0;

  for (let i = 1; i <= 6; i++) {
    const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    
    // Simulate diminishing impact over time if rain stops, or compounding if it continues
    currentRate = currentRate * 0.9 + rainfallImpact * (Math.max(0, 1 - i * 0.15));
    projectedLevel = projectedLevel + currentRate;
    
    if (projectedLevel < 0.5) projectedLevel = 0.5;

    dataPoints.push({
      time: `+${i}h`,
      type: 'FORECAST',
      level: parseFloat(projectedLevel.toFixed(2))
    });

    if (i === 1) plus1h = projectedLevel;
    if (i === 3) plus3h = projectedLevel;
    if (i === 6) plus6h = projectedLevel;
  }

  const maxProjected = Math.max(plus1h, plus3h, plus6h);
  
  let riskLevel: AlertLevel = 'GREEN';
  if (maxProjected >= THRESHOLDS.RED) riskLevel = 'RED';
  else if (maxProjected >= THRESHOLDS.ORANGE) riskLevel = 'ORANGE';
  else if (maxProjected >= THRESHOLDS.YELLOW) riskLevel = 'YELLOW';

  // Calculate probability based on risk thresholds and current trajectory
  let probability = 12; // Base
  if (riskLevel === 'YELLOW') probability = 45 + Math.random() * 15;
  if (riskLevel === 'ORANGE') probability = 75 + Math.random() * 10;
  if (riskLevel === 'RED') probability = 90 + Math.random() * 9;

  return {
    dataPoints,
    plus1h: parseFloat(plus1h.toFixed(2)),
    plus3h: parseFloat(plus3h.toFixed(2)),
    plus6h: parseFloat(plus6h.toFixed(2)),
    probability: Math.round(probability),
    riskLevel,
    confidence: Math.round(80 + Math.random() * 15) // 80-95%
  };
};
