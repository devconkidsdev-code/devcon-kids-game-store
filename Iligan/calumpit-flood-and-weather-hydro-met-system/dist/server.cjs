var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/data/mockData.ts
var INITIAL_STATIONS = [
  {
    id: "stn-10-caniogan",
    name: "WL Station 10 (Caniogan Bridge)",
    code: "CBFMMP-STN10",
    type: "RIVER_GAUGE",
    river: "Bagbag River (Angat-Pampanga Confluence)",
    coordinates: [14.9125, 120.768],
    currentWaterLevel: 2.85,
    // Current reading in meters
    staffGaugeMax: 3.5,
    normalLevel: 1.2,
    yellowLevel: 1.5,
    orangeLevel: 2.5,
    redLevel: 3.5,
    floodTrend: "RISING",
    rainRateMmHr: 14.2,
    rain24hMm: 68.5,
    rain3DayMm: 142,
    lastUpdated: "Just now (Live)",
    status: "ONLINE",
    details: "Primary physical 3.5m staff gauge monitored under Bulacan PDRRMO CBFMMP. Critical bottleneck for Angat River discharge entering Pampanga River."
  },
  {
    id: "stn-11-calumpit-bridge",
    name: "WL Station 11 (Calumpit Bridge)",
    code: "CBFMMP-STN11",
    type: "RIVER_GAUGE",
    river: "Pampanga Main Delta Channel (Calizon)",
    coordinates: [14.9189, 120.7628],
    currentWaterLevel: 2.7,
    staffGaugeMax: 4,
    normalLevel: 1.1,
    yellowLevel: 1.6,
    orangeLevel: 2.6,
    redLevel: 3.6,
    floodTrend: "RISING",
    rainRateMmHr: 15,
    rain24hMm: 72,
    rain3DayMm: 148.5,
    lastUpdated: "1 min ago",
    status: "ONLINE",
    details: "Monitors the Pampanga river main flow under the MacArthur Highway crossing. Captures upstream runoff from Candaba Swamp."
  },
  {
    id: "stn-sulipan",
    name: "PAGASA Sulipan Telemetry Station",
    code: "DOST-PAG-SLP",
    type: "PAGASA_STATION",
    river: "Pampanga River Delta",
    coordinates: [14.9385, 120.757],
    currentWaterLevel: 3.1,
    normalLevel: 1.5,
    yellowLevel: 2.2,
    orangeLevel: 3,
    redLevel: 4,
    floodTrend: "RISING",
    rainRateMmHr: 18.5,
    rain24hMm: 84,
    rain3DayMm: 165,
    lastUpdated: "2 mins ago",
    status: "ONLINE",
    details: "DOST-PAGASA National Hydro-Met Observing Network. Boundary station between Apalit, Pampanga and Calumpit, Bulacan."
  },
  {
    id: "stn-arayat",
    name: "PAGASA Arayat Station",
    code: "DOST-PAG-ARY",
    type: "PAGASA_STATION",
    river: "Upper Pampanga River Basin",
    coordinates: [15.148, 120.771],
    currentWaterLevel: 5.4,
    normalLevel: 4,
    yellowLevel: 6,
    orangeLevel: 7.5,
    redLevel: 8.5,
    floodTrend: "RISING",
    rainRateMmHr: 22,
    rain24hMm: 110.5,
    rain3DayMm: 195,
    lastUpdated: "5 mins ago",
    status: "ONLINE",
    details: "Early warning upstream headwater station. High discharge here cascades to Calumpit within 8-12 hours."
  },
  {
    id: "pws-iangel23",
    name: "Claro M. Recto PWS (Station ID: IANGEL23)",
    code: "PWS-IANGEL23",
    type: "WEATHER_STATION",
    coordinates: [14.916, 120.765],
    temperature: 26.4,
    humidity: 94,
    pressureInHg: 29.62,
    pressureHpa: 1003,
    windSpeedKmh: 28,
    windDirection: "WSW (Habagat Monsoon)",
    windGustKmh: 46,
    dewPoint: 25.3,
    rainRateMmHr: 16.8,
    rain24hMm: 74.2,
    rain3DayMm: 152,
    lastUpdated: "Real-time (15s)",
    status: "ONLINE",
    details: "High-precision Personal Weather Station deployed at Poblacion/Claro M. Recto corridor. Provides hyper-local barometric pressure and gust data."
  },
  {
    id: "stn-tidal-manila-bay",
    name: "Manila Bay Delta Tidal Node",
    code: "NAMRIA-TIDE-MB",
    type: "TIDAL_GAUGE",
    coordinates: [14.832, 120.728],
    currentWaterLevel: 1.42,
    // Tide height above MSL
    floodTrend: "RISING",
    lastUpdated: "Live Tidal Feed",
    status: "ONLINE",
    details: "Tidal gauge at mouth of Hagonoy-Labangan delta. High tide acts as a hydraulic dam, impeding river drainage from Calumpit."
  }
];
var INITIAL_TIDAL_DATA = {
  currentTideMsl: 1.42,
  // meters
  tideState: "FLOODING_HIGH",
  nextHighTideTime: "14:45 (2:45 PM)",
  nextHighTideHeight: 1.68,
  nextLowTideTime: "21:10 (9:10 PM)",
  nextLowTideHeight: 0.18,
  tideInfluenceFactor: 0.88
  // 88% backing up flow
};
var INITIAL_DAM_STATUS = [
  {
    name: "Angat Dam",
    location: "Norzagaray, Bulacan (Upstream headwaters)",
    waterLevel: 211.85,
    spillingLevel: 212,
    normalHighWaterLevel: 210,
    gatesOpen: 2,
    totalGateOpeningMeters: 1.5,
    dischargeRateCms: 280,
    // m³/s
    trend: "RISING",
    warningLevel: "SPILLING_ALERT",
    estimatedArrivalToCalumpitHours: 7.5
  },
  {
    name: "Bustos Dam (Afterbay)",
    location: "Baliuag / Bustos, Bulacan",
    waterLevel: 17.65,
    spillingLevel: 17.5,
    normalHighWaterLevel: 17.3,
    gatesOpen: 4,
    totalGateOpeningMeters: 4,
    dischargeRateCms: 450,
    // m³/s
    trend: "RISING",
    warningLevel: "SPILLING_ALERT",
    estimatedArrivalToCalumpitHours: 3
  }
];
var INITIAL_BARANGAYS = [
  {
    id: "brgy-san-miguel",
    name: "San Miguel",
    coordinates: [14.908, 120.752],
    floodHeightInches: 26,
    floodHeightMeters: 0.66,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 4210,
    householdsAffected: 940,
    evacuationCenter: {
      name: "San Miguel Barangay Covered Court",
      capacity: 350,
      currentOccupancy: 210,
      status: "OPEN"
    },
    keyVulnerabilities: ["Low river embankment along Bagbag River", "Water hyacinth backflow", "Submerged access road"],
    lastUpdate: "5 mins ago"
  },
  {
    id: "brgy-frances",
    name: "Frances",
    coordinates: [14.931, 120.764],
    floodHeightInches: 38,
    floodHeightMeters: 0.96,
    trend: "RISING",
    warningStatus: "RED",
    roadPassability: "SUBMERGED_BOATS_ONLY",
    populationAtRisk: 5120,
    householdsAffected: 1180,
    evacuationCenter: {
      name: "Frances National High School (2F/3F)",
      capacity: 600,
      currentOccupancy: 490,
      status: "OPEN"
    },
    keyVulnerabilities: ["Direct Pampanga River frontage", "Tidal backflood entrapment", "Islanded community"],
    lastUpdate: "2 mins ago"
  },
  {
    id: "brgy-meysulao",
    name: "Meysulao",
    coordinates: [14.945, 120.778],
    floodHeightInches: 34,
    floodHeightMeters: 0.86,
    trend: "RISING",
    warningStatus: "RED",
    roadPassability: "SUBMERGED_BOATS_ONLY",
    populationAtRisk: 3850,
    householdsAffected: 820,
    evacuationCenter: {
      name: "Meysulao Elementary School Multi-Purpose Bldg",
      capacity: 400,
      currentOccupancy: 310,
      status: "OPEN"
    },
    keyVulnerabilities: ["Candaba Swamp catch-basin overflow", "Agricultural submerged areas", "Deep street flooding"],
    lastUpdate: "4 mins ago"
  },
  {
    id: "brgy-piocruzcosa",
    name: "Piocruzcosa",
    coordinates: [14.902, 120.783],
    floodHeightInches: 18,
    floodHeightMeters: 0.45,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "PASSABLE_HEAVY_ONLY",
    populationAtRisk: 3100,
    householdsAffected: 620,
    evacuationCenter: {
      name: "Piocruzcosa Civic Center",
      capacity: 300,
      currentOccupancy: 115,
      status: "OPEN"
    },
    keyVulnerabilities: ["Tributary backflow", "Low elevation residential alleys"],
    lastUpdate: "10 mins ago"
  },
  {
    id: "brgy-calizon",
    name: "Calizon",
    coordinates: [14.921, 120.76],
    floodHeightInches: 30,
    floodHeightMeters: 0.76,
    trend: "RISING",
    warningStatus: "RED",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 3450,
    householdsAffected: 780,
    evacuationCenter: {
      name: "Calizon Chapel & Community Center",
      capacity: 250,
      currentOccupancy: 220,
      status: "OPEN"
    },
    keyVulnerabilities: ["Adjacent to Station 11 Calumpit Bridge", "Confluence turbulence", "Severed bypass route"],
    lastUpdate: "3 mins ago"
  },
  {
    id: "brgy-gugo",
    name: "Gugo",
    coordinates: [14.928, 120.748],
    floodHeightInches: 22,
    floodHeightMeters: 0.56,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 2800,
    householdsAffected: 590,
    evacuationCenter: {
      name: "Gugo Elementary School",
      capacity: 300,
      currentOccupancy: 140,
      status: "OPEN"
    },
    keyVulnerabilities: ["Labangan Channel backwash", "Fishpond overflow"],
    lastUpdate: "8 mins ago"
  },
  {
    id: "brgy-gatbuca",
    name: "Gatbuca",
    coordinates: [14.935, 120.774],
    floodHeightInches: 28,
    floodHeightMeters: 0.71,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 4600,
    householdsAffected: 980,
    evacuationCenter: {
      name: "Gatbuca Barangay Hall Complex",
      capacity: 450,
      currentOccupancy: 280,
      status: "OPEN"
    },
    keyVulnerabilities: ["MacArthur Highway approach flooding", "River bend scour"],
    lastUpdate: "6 mins ago"
  },
  {
    id: "brgy-poblacion",
    name: "Poblacion",
    coordinates: [14.9175, 120.7655],
    floodHeightInches: 12,
    floodHeightMeters: 0.3,
    trend: "RISING",
    warningStatus: "YELLOW",
    roadPassability: "PASSABLE_ALL",
    populationAtRisk: 6200,
    householdsAffected: 450,
    evacuationCenter: {
      name: "Calumpit Municipal Gymnasium (MDRRMO HQ)",
      capacity: 800,
      currentOccupancy: 120,
      status: "OPEN"
    },
    keyVulnerabilities: ["Commercial area water pooling", "Public market drainage backflow"],
    lastUpdate: "1 min ago"
  },
  {
    id: "brgy-caniogan",
    name: "Caniogan",
    coordinates: [14.912, 120.7705],
    floodHeightInches: 24,
    floodHeightMeters: 0.61,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 3900,
    householdsAffected: 720,
    evacuationCenter: {
      name: "Caniogan Elementary School",
      capacity: 350,
      currentOccupancy: 190,
      status: "OPEN"
    },
    keyVulnerabilities: ["Bridge approach flooding", "Bagbag River surge zone"],
    lastUpdate: "7 mins ago"
  },
  {
    id: "brgy-bulusan",
    name: "Bulusan",
    coordinates: [14.941, 120.769],
    floodHeightInches: 29,
    floodHeightMeters: 0.74,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 2700,
    householdsAffected: 560,
    evacuationCenter: {
      name: "Bulusan Multi-Purpose Center",
      capacity: 250,
      currentOccupancy: 175,
      status: "OPEN"
    },
    keyVulnerabilities: ["Marshland fringe", "Delta overflow"],
    lastUpdate: "12 mins ago"
  },
  {
    id: "brgy-corazon",
    name: "Corazon",
    coordinates: [14.915, 120.756],
    floodHeightInches: 20,
    floodHeightMeters: 0.51,
    trend: "RISING",
    warningStatus: "ORANGE",
    roadPassability: "NOT_PASSABLE_LIGHT",
    populationAtRisk: 3100,
    householdsAffected: 610,
    evacuationCenter: {
      name: "Corazon Covered Court",
      capacity: 280,
      currentOccupancy: 110,
      status: "OPEN"
    },
    keyVulnerabilities: ["River bend backwater", "Drainage blockage"],
    lastUpdate: "9 mins ago"
  },
  {
    id: "brgy-sapang-bayan",
    name: "Sapang Bayan",
    coordinates: [14.898, 120.749],
    floodHeightInches: 32,
    floodHeightMeters: 0.81,
    trend: "RISING",
    warningStatus: "RED",
    roadPassability: "SUBMERGED_BOATS_ONLY",
    populationAtRisk: 4100,
    householdsAffected: 890,
    evacuationCenter: {
      name: "Sapang Bayan Integrated School",
      capacity: 400,
      currentOccupancy: 330,
      status: "OPEN"
    },
    keyVulnerabilities: ["Direct tidal ingress channel", "Hagonoy boundary lowest depression"],
    lastUpdate: "3 mins ago"
  }
];
var GENERATE_HYDRO_TIMESERIES = () => {
  const points = [];
  const now = /* @__PURE__ */ new Date();
  for (let i = 48; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1e3);
    const hourLabel = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    const hoursFromStart = 48 - i;
    const tideSin = Math.sin(hoursFromStart / 12.42 * 2 * Math.PI);
    const tidalComponent = 0.45 * tideSin;
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
    const cumulative24h = Math.min(188, 25 + (48 - i) * 1.6);
    const baseRiver = 1.1 + (48 - i) / 48 * 1.55;
    const confluenceLevel = Number((baseRiver + tidalComponent + hourlyRain * 0.015).toFixed(2));
    points.push({
      timestamp: t.toISOString(),
      hourLabel,
      hourlyRainMm: Number(hourlyRain.toFixed(1)),
      cumulative24hRainMm: Number(cumulative24h.toFixed(1)),
      riverLevelMeters: Number(baseRiver.toFixed(2)),
      tidalComponentMeters: Number(tidalComponent.toFixed(2)),
      confluenceEffectiveLevelMeters: confluenceLevel,
      yellowThreshold: 1.5,
      orangeThreshold: 2.5,
      redThreshold: 3.5
    });
  }
  return points;
};
var HISTORICAL_CORRELATION_DATA = [
  { rainfall3DayMm: 35, riverDeltaDepthM: 1.3, date: "Nov 12, 2024" },
  { rainfall3DayMm: 48, riverDeltaDepthM: 1.45, date: "Dec 05, 2024" },
  { rainfall3DayMm: 62, riverDeltaDepthM: 1.7, date: "Jun 18, 2025" },
  { rainfall3DayMm: 75, riverDeltaDepthM: 1.95, date: "Jul 04, 2025" },
  { rainfall3DayMm: 90, riverDeltaDepthM: 2.25, date: "Jul 22, 2025" },
  { rainfall3DayMm: 110, riverDeltaDepthM: 2.6, date: "Aug 14, 2025" },
  { rainfall3DayMm: 125, riverDeltaDepthM: 2.85, date: "Sep 02, 2025" },
  { rainfall3DayMm: 140, riverDeltaDepthM: 3.1, date: "Oct 19, 2025" },
  { rainfall3DayMm: 160, riverDeltaDepthM: 3.45, date: "Jul 28, 2026", eventLabel: "Typhoon Enhanced Habagat Band 1" },
  { rainfall3DayMm: 175, riverDeltaDepthM: 3.75, date: "Aug 04, 2026", eventLabel: "Confluence Spill Surge" },
  { rainfall3DayMm: 188, riverDeltaDepthM: 4.12, date: "Aug 09, 2026", eventLabel: "HISTORICAL MONSOON PEAK (188mm / 4.12m)" },
  { rainfall3DayMm: 80, riverDeltaDepthM: 2.05, date: "Aug 14, 2026" },
  { rainfall3DayMm: 142, riverDeltaDepthM: 2.85, date: "Current Event (Aug 18, 2026)", eventLabel: "ACTIVE FLOOD EVENT" }
];
var INITIAL_SHINE_REPORTS = [
  {
    id: "shine-001",
    schoolName: "Frances National High School",
    observerName: "Mark Lester Santos (Grade 11 SHINe Club Lead)",
    gaugeReadingMm: 34.5,
    timestamp: "15 mins ago",
    rainfallType: "HEAVY",
    turbidityObserved: "HEAVILY_SILTED",
    waterHyacinthClogging: true,
    fieldNotes: "Heavy accumulation of water hyacinths (water lilies) under the Frances footbridge structure. Water level on concrete embankment is 4 inches below road level.",
    verified: true
  },
  {
    id: "shine-002",
    schoolName: "Frances Elementary School",
    observerName: "Althea Ramos (SHINe Science Observer)",
    gaugeReadingMm: 32,
    timestamp: "35 mins ago",
    rainfallType: "HEAVY",
    turbidityObserved: "MURKY_BROWN",
    waterHyacinthClogging: true,
    fieldNotes: "School ground courtyard flooded by 8 inches of backwater from Pampanga River. Manual rain cylinder emptied at 14:00H.",
    verified: true
  },
  {
    id: "shine-003",
    schoolName: "Meysulao Elementary School",
    observerName: "Teacher Danica Cruz (SHINe Adviser)",
    gaugeReadingMm: 28,
    timestamp: "1 hour ago",
    rainfallType: "MODERATE",
    turbidityObserved: "HEAVILY_SILTED",
    waterHyacinthClogging: false,
    fieldNotes: "Main road outside school is submerged. Only elevated rescue trucks and motorized bankas can navigate.",
    verified: true
  },
  {
    id: "shine-004",
    schoolName: "Calumpit National High School (Poblacion)",
    observerName: "Joshua De Guzman (SHINe Student Scout)",
    gaugeReadingMm: 22.5,
    timestamp: "2 hours ago",
    rainfallType: "MODERATE",
    turbidityObserved: "MURKY_BROWN",
    waterHyacinthClogging: false,
    fieldNotes: "Rainfall steady. Drainage canals flowing rapidly towards Bagbag River tributary.",
    verified: true
  }
];
var INITIAL_ALERT_DISPATCHES = [
  {
    id: "dispatch-001",
    timestamp: "10 mins ago",
    alertLevel: "ORANGE",
    title: "MDRRMO Pre-Evacuation Advisory: Confluence Spill Threat",
    messageTagalog: "BABALA NG MDRRMO CALUMPIT (ORANGE ALERT): Ang antas ng tubig sa Caniogan Bridge (Bagbag River) ay umabot sa 2.85 metro. Inaasahan ang pagtaas pa dahil sa pagpapakawala ng Bustos Dam at paparating na high tide (14:45H). Hinihikayat ang mga residente sa Brgy. Frances, San Miguel, Meysulao, at Calizon na maghanda ng emergency go-bag at lumipat sa evacuation centers.",
    messageEnglish: "CALUMPIT MDRRMO WARNING (ORANGE ALERT): Water level at Caniogan Bridge has reached 2.85 meters. Further rise expected due to Bustos Dam discharge and incoming Manila Bay high tide. Pre-evacuation advised for Frances, San Miguel, Meysulao, and Calizon.",
    targetRecipients: ["All 29 BDRRMC Captains", "Calumpit Rescue 911 Operations", "Bulacan PDRRMO Dispatch", "Registered Community Responders (4,820 SMS)"],
    channels: ["SMS_TWILIO", "EMAIL_SENDGRID", "SIREN_BROADCAST", "VHF_RADIO"],
    triggeredBy: "Automated Threshold: Caniogan Gauge > 2.50m (Current: 2.85m)",
    status: "SENT"
  },
  {
    id: "dispatch-002",
    timestamp: "3 hours ago",
    alertLevel: "YELLOW",
    title: "PAGASA / PDRRMO Hydro-Met Advisory - Heavy Rainfall Band",
    messageTagalog: "ALERTO LEVEL 1 (DILAW): Tuloy-tuloy na pag-ulan dulot ng Habagat. 24-hr cumulative rainfall lumampas sa 50mm. Maging alerto sa pagbaha sa mabababang lugar.",
    messageEnglish: "ALERT LEVEL 1 (YELLOW): Continuous Habagat monsoon rainfall exceeding 50mm in 24 hours. Low-lying riverside barangays advised to monitor water gauges.",
    targetRecipients: ["BDRRMC Action Officers", "Public Advisory Board"],
    channels: ["SMS_TWILIO", "EMAIL_SENDGRID"],
    triggeredBy: "PAGASA 24h Cumulative Rain > 50mm",
    status: "SENT"
  }
];

// server.ts
var stations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
var tidalData = JSON.parse(JSON.stringify(INITIAL_TIDAL_DATA));
var damStatus = JSON.parse(JSON.stringify(INITIAL_DAM_STATUS));
var barangays = JSON.parse(JSON.stringify(INITIAL_BARANGAYS));
var shineReports = JSON.parse(JSON.stringify(INITIAL_SHINE_REPORTS));
var alertDispatches = JSON.parse(JSON.stringify(INITIAL_ALERT_DISPATCHES));
var activeScenario = "MONSOON_CONFLUENCE_HIGH_TIDE";
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
async function generateGeminiContentWithFallback(prompt, isJson = false) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  for (const model of candidateModels) {
    try {
      const config = {};
      if (isJson) {
        config.responseMimeType = "application/json";
      }
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      const statusCode = err?.status || err?.error?.code || err?.code;
      if (statusCode === 503 || statusCode === 429 || statusCode === 500) {
        continue;
      }
      break;
    }
  }
  return null;
}
function calculateMunicipalityAlertLevel() {
  const canioganStn = stations.find((s) => s.id === "stn-10-caniogan");
  const canioganLevel = canioganStn?.currentWaterLevel ?? 0;
  const pws = stations.find((s) => s.id === "pws-iangel23");
  const rain24h = pws?.rain24hMm ?? 68;
  if (canioganLevel >= 3.5 || rain24h >= 100) {
    return {
      level: "RED",
      reason: `CRITICAL FLOOD EVENT: Caniogan Gauge at ${canioganLevel.toFixed(2)}m (Threshold \u2265 3.50m) or 24-hr Rain (${rain24h}mm \u2265 100mm). Immediate evacuation mandatory for low-lying riverside communities.`
    };
  }
  if (canioganLevel >= 2.5 || rain24h >= 50) {
    return {
      level: "ORANGE",
      reason: `PRE-EVACUATION WARNING: Caniogan Gauge at ${canioganLevel.toFixed(2)}m (Threshold \u2265 2.50m) or 24-hr Rain (${rain24h}mm \u2265 50mm). Rising rapidly with confluence backflood & tidal ingress.`
    };
  }
  if (canioganLevel >= 1.5 || rain24h >= 30) {
    return {
      level: "YELLOW",
      reason: `THREATENING FLOOD LEVEL: Caniogan Gauge at ${canioganLevel.toFixed(2)}m (Threshold \u2265 1.50m) or 24-hr Rain (${rain24h}mm \u2265 30mm). Flooding threatening in low-lying riverside areas.`
    };
  }
  return {
    level: "NORMAL",
    reason: "Water levels within normal baseline capacity (<1.5m staff gauge). Regular monitoring active."
  };
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", serverTime: (/* @__PURE__ */ new Date()).toISOString(), municipality: "Calumpit, Bulacan" });
  });
  app.get("/api/telemetry/live", (req, res) => {
    const alert = calculateMunicipalityAlertLevel();
    res.json({
      stations,
      tidalData,
      damStatus,
      overallAlert: alert,
      activeScenario,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/telemetry/timeseries", (req, res) => {
    const timeseries = GENERATE_HYDRO_TIMESERIES();
    res.json({
      timeseries,
      correlationData: HISTORICAL_CORRELATION_DATA,
      correlationIndexR: 0.83,
      historicalPeakNote: "August 9, 2026 Monsoon Peak: 188mm 3-Day Rain -> 4.12m Delta Depth"
    });
  });
  app.get("/api/barangays", (req, res) => {
    res.json({
      barangays,
      totalPopulationAtRisk: barangays.reduce((acc, b) => acc + b.populationAtRisk, 0),
      totalHouseholdsAffected: barangays.reduce((acc, b) => acc + b.householdsAffected, 0),
      totalEvacueesSheltered: barangays.reduce((acc, b) => acc + b.evacuationCenter.currentOccupancy, 0),
      evacuationCapacityTotal: barangays.reduce((acc, b) => acc + b.evacuationCenter.capacity, 0)
    });
  });
  app.post("/api/barangays/update", (req, res) => {
    const { id, floodHeightInches, roadPassability, warningStatus, trend } = req.body;
    const brgy = barangays.find((b) => b.id === id);
    if (!brgy) {
      return res.status(404).json({ error: "Barangay not found" });
    }
    if (floodHeightInches !== void 0) {
      brgy.floodHeightInches = floodHeightInches;
      brgy.floodHeightMeters = Number((floodHeightInches * 0.0254).toFixed(2));
    }
    if (roadPassability) brgy.roadPassability = roadPassability;
    if (warningStatus) brgy.warningStatus = warningStatus;
    if (trend) brgy.trend = trend;
    brgy.lastUpdate = "Just now (MDRRMO update)";
    res.json({ success: true, barangay: brgy });
  });
  app.get("/api/shine/reports", (req, res) => {
    res.json({ reports: shineReports });
  });
  app.post("/api/shine/submit", (req, res) => {
    const { schoolName, observerName, gaugeReadingMm, rainfallType, turbidityObserved, waterHyacinthClogging, fieldNotes } = req.body;
    if (!schoolName || !observerName || gaugeReadingMm === void 0) {
      return res.status(400).json({ error: "Missing required SHINe observation parameters." });
    }
    const newReport = {
      id: `shine-${Date.now()}`,
      schoolName,
      observerName,
      gaugeReadingMm: Number(gaugeReadingMm),
      timestamp: "Just now (Live student field report)",
      rainfallType: rainfallType || "MODERATE",
      turbidityObserved: turbidityObserved || "MURKY_BROWN",
      waterHyacinthClogging: Boolean(waterHyacinthClogging),
      fieldNotes: fieldNotes || "Standard manual gauge reading logged.",
      verified: true
    };
    shineReports.unshift(newReport);
    res.json({ success: true, report: newReport });
  });
  app.get("/api/alerts/history", (req, res) => {
    res.json({ dispatches: alertDispatches });
  });
  app.post("/api/alerts/dispatch", (req, res) => {
    const { alertLevel, title, messageTagalog, messageEnglish, targetRecipients, channels, triggeredBy } = req.body;
    const newDispatch = {
      id: `dispatch-${Date.now()}`,
      timestamp: "Just now (Broadcasted)",
      alertLevel: alertLevel || "ORANGE",
      title: title || "MDRRMO Emergency Flood Advisory",
      messageTagalog: messageTagalog || "BABALA: Inaatasan ang lahat ng barangay na mag-antabay.",
      messageEnglish: messageEnglish || "WARNING: Emergency flood alert active for Calumpit riverside zones.",
      targetRecipients: targetRecipients || ["All 29 Calumpit BDRRMC Captains", "Calumpit Rescue 911 Operations"],
      channels: channels || ["SMS_TWILIO", "EMAIL_SENDGRID", "SIREN_BROADCAST"],
      triggeredBy: triggeredBy || "Manual Operator / Telemetry Override",
      status: "SENT"
    };
    alertDispatches.unshift(newDispatch);
    res.json({ success: true, dispatch: newDispatch });
  });
  app.post("/api/simulation/set-scenario", (req, res) => {
    const { scenario } = req.body;
    activeScenario = scenario;
    const caniogan = stations.find((s) => s.id === "stn-10-caniogan");
    const calumpitBr = stations.find((s) => s.id === "stn-11-calumpit-bridge");
    const sulipan = stations.find((s) => s.id === "stn-sulipan");
    const pws = stations.find((s) => s.id === "pws-iangel23");
    if (scenario === "RED_EXTREME_MONSOON") {
      if (caniogan) {
        caniogan.currentWaterLevel = 3.65;
        caniogan.floodTrend = "RISING";
        caniogan.rain24hMm = 145;
      }
      if (calumpitBr) {
        calumpitBr.currentWaterLevel = 3.75;
        calumpitBr.floodTrend = "RISING";
      }
      if (sulipan) {
        sulipan.currentWaterLevel = 4.15;
        sulipan.floodTrend = "RISING";
      }
      if (pws) {
        pws.rain24hMm = 145;
        pws.rainRateMmHr = 35;
        pws.windGustKmh = 68;
      }
      tidalData.currentTideMsl = 1.72;
      tidalData.tideState = "FLOODING_HIGH";
      damStatus[0].dischargeRateCms = 500;
      damStatus[0].gatesOpen = 4;
      damStatus[1].dischargeRateCms = 650;
      damStatus[1].gatesOpen = 6;
      barangays.forEach((b) => {
        if (["brgy-frances", "brgy-san-miguel", "brgy-meysulao", "brgy-calizon", "brgy-sapang-bayan"].includes(b.id)) {
          b.warningStatus = "RED";
          b.floodHeightInches = Math.max(36, b.floodHeightInches + 12);
          b.roadPassability = "SUBMERGED_BOATS_ONLY";
        } else {
          b.warningStatus = "ORANGE";
          b.floodHeightInches = Math.max(20, b.floodHeightInches + 8);
          b.roadPassability = "NOT_PASSABLE_LIGHT";
        }
      });
    } else if (scenario === "YELLOW_THREATENING") {
      if (caniogan) {
        caniogan.currentWaterLevel = 1.85;
        caniogan.floodTrend = "RISING";
        caniogan.rain24hMm = 42;
      }
      if (calumpitBr) {
        calumpitBr.currentWaterLevel = 1.9;
        calumpitBr.floodTrend = "RISING";
      }
      if (sulipan) {
        sulipan.currentWaterLevel = 2.4;
        sulipan.floodTrend = "RISING";
      }
      if (pws) {
        pws.rain24hMm = 42;
        pws.rainRateMmHr = 9;
      }
      damStatus[0].dischargeRateCms = 120;
      damStatus[0].gatesOpen = 1;
      damStatus[1].dischargeRateCms = 200;
      damStatus[1].gatesOpen = 2;
      barangays.forEach((b) => {
        b.warningStatus = ["brgy-frances", "brgy-san-miguel", "brgy-meysulao"].includes(b.id) ? "YELLOW" : "NORMAL";
        b.floodHeightInches = Math.min(12, b.floodHeightInches);
        b.roadPassability = "PASSABLE_ALL";
      });
    } else if (scenario === "NORMAL_BASELINE") {
      if (caniogan) {
        caniogan.currentWaterLevel = 1.15;
        caniogan.floodTrend = "RECEDING";
        caniogan.rain24hMm = 12;
      }
      if (calumpitBr) {
        calumpitBr.currentWaterLevel = 1.05;
        calumpitBr.floodTrend = "RECEDING";
      }
      if (sulipan) {
        sulipan.currentWaterLevel = 1.45;
        sulipan.floodTrend = "RECEDING";
      }
      if (pws) {
        pws.rain24hMm = 12;
        pws.rainRateMmHr = 0;
        pws.windGustKmh = 18;
      }
      tidalData.currentTideMsl = 0.65;
      tidalData.tideState = "EBBING_LOW";
      damStatus[0].dischargeRateCms = 0;
      damStatus[0].gatesOpen = 0;
      damStatus[1].dischargeRateCms = 50;
      damStatus[1].gatesOpen = 1;
      barangays.forEach((b) => {
        b.warningStatus = "NORMAL";
        b.floodHeightInches = 0;
        b.floodHeightMeters = 0;
        b.roadPassability = "PASSABLE_ALL";
      });
    } else {
      stations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
      tidalData = JSON.parse(JSON.stringify(INITIAL_TIDAL_DATA));
      damStatus = JSON.parse(JSON.stringify(INITIAL_DAM_STATUS));
      barangays = JSON.parse(JSON.stringify(INITIAL_BARANGAYS));
    }
    res.json({
      success: true,
      scenario: activeScenario,
      overallAlert: calculateMunicipalityAlertLevel()
    });
  });
  app.post("/api/ai/situation-assessment", async (req, res) => {
    const alert = calculateMunicipalityAlertLevel();
    const caniogan = stations.find((s) => s.id === "stn-10-caniogan");
    const pws = stations.find((s) => s.id === "pws-iangel23");
    const angat = damStatus.find((d) => d.name.includes("Angat"));
    const bustos = damStatus.find((d) => d.name.includes("Bustos"));
    const contextPrompt = `You are the Lead Hydro-Meteorologist and Chief Operations Officer for Calumpit MDRRMO / Bulacan PDRRMO in the Philippines.
Analyze the following live telemetry and physical confluence dynamics for Calumpit, Bulacan:
- Municipality Alert Level: ${alert.level} (${alert.reason})
- WL Station 10 (Caniogan Bridge, Bagbag River Staff Gauge): ${caniogan?.currentWaterLevel ?? 2.85}m (Max: 3.50m)
- Claro M. Recto PWS (IANGEL23): 24h Rain ${pws?.rain24hMm ?? 74}mm, Hourly Rate ${pws?.rainRateMmHr ?? 16.8}mm/hr, Barometric Pressure: ${pws?.pressureInHg ?? 29.62} inHg, Wind Gusts: ${pws?.windGustKmh ?? 46} km/h
- Angat Dam: Discharge ${angat?.dischargeRateCms ?? 280} m\xB3/s with ${angat?.gatesOpen ?? 2} gates open (Arrival: ${angat?.estimatedArrivalToCalumpitHours ?? 7.5}h)
- Bustos Dam: Discharge ${bustos?.dischargeRateCms ?? 450} m\xB3/s with ${bustos?.gatesOpen ?? 4} gates open (Arrival: ${bustos?.estimatedArrivalToCalumpitHours ?? 3}h)
- Manila Bay Tidal Delta: Current Tide ${tidalData.currentTideMsl}m MSL (${tidalData.tideState}), Next High Tide at ${tidalData.nextHighTideTime} (${tidalData.nextHighTideHeight}m)
- Most critical barangays: San Miguel, Frances, Meysulao, Calizon, Sapang Bayan

Please generate a professional, structured JSON assessment formatted as follows:
{
  "title": "Calumpit MDRRMO Hydro-Met Situation Assessment & Confluence Analysis",
  "overallThreatLevel": "${alert.level}",
  "executiveSummary": "A concise executive briefing on the compounding effect of Angat/Bustos releases + Pampanga backfloods + Manila Bay tidal bottleneck.",
  "confluenceDynamics": "Physical breakdown of the Bagbag River bottleneck where Angat meets Pampanga River in Calumpit.",
  "tidalWindowAdvisory": "Tactical timing regarding the high-tide peak window when flood drainage will be blocked.",
  "highRiskBarangays": ["List of priority barangays needing immediate rescue boats / evacuation"],
  "recommendedMdrrmoActions": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "publicAdvisoryTagalog": "Clear Tagalog public advisory for broadcast via radio, megaphones, and SMS blast."
}`;
    const aiGeneratedText = await generateGeminiContentWithFallback(contextPrompt, true);
    if (aiGeneratedText) {
      try {
        const parsed = JSON.parse(aiGeneratedText);
        return res.json({ report: parsed, source: "GEMINI_AI" });
      } catch (parseErr) {
      }
    }
    const fallbackReport = {
      title: "Calumpit MDRRMO Hydro-Met Confluence & Tidal Delta Assessment",
      overallThreatLevel: alert.level,
      executiveSummary: `Calumpit is undergoing dual-action confluence surge. Upstream discharges from Bustos Dam (${bustos?.dischargeRateCms || 450} m\xB3/s) and Angat Dam are entering the Bagbag River channel while the Pampanga main delta is swollen by Candaba Swamp runoff. Concurrently, Manila Bay tidal ingress (+${tidalData.currentTideMsl}m MSL) acts as a hydraulic wall, elevating Caniogan Bridge staff gauge to ${caniogan?.currentWaterLevel || 2.85}m.`,
      confluenceDynamics: "The Bagbag River serves as the sole relief tributary carrying Angat water into the Pampanga River right at Calumpit. Because the Pampanga River delta at Sulipan is already at 3.10m, backflooding is reversing flow into San Miguel, Calizon, and Frances.",
      tidalWindowAdvisory: `High tide crest will peak at ${tidalData.nextHighTideTime} at +${tidalData.nextHighTideHeight}m MSL. Drainage will drop to near zero for a 3.5-hour window. Water levels in riverside barangays are projected to rise by an additional 4 to 8 inches during this peak.`,
      highRiskBarangays: [
        "Frances (Islanded, road submerged - rescue boats only)",
        "San Miguel (Bagbag embankment overtop risk)",
        "Meysulao (Deep agricultural basin backflow)",
        "Calizon (Confluence turbulence at MacArthur Bridge approach)",
        "Sapang Bayan (Direct tidal corridor)"
      ],
      recommendedMdrrmoActions: [
        "Preposition motorized rescue fiberglass boats (BDRRMC Calumpit Rescue 911) at Frances & Meysulao access points.",
        "Enforce mandatory evacuation for families residing within 20 meters of the Bagbag and Pampanga riverbanks.",
        "Issue road closure warning along Calumpit-Hagonoy coastal artery and deploy DPWH / PNP traffic controllers.",
        "Activate School Evacuation Centers (Frances NHS 2F/3F and Calumpit Municipal Gym) with generator backup."
      ],
      publicAdvisoryTagalog: "BABALA SA MGA RESIDENTE NG CALUMPIT: Patuloy ang pagtaas ng tubig sa Bagbag at Pampanga River dahil sa ulan at pagpapakawala ng Bustos Dam. Sasabay ang high tide sa ganap na 2:45 PM. Mangyaring lumikas na ang mga nasa tabing-ilog sa Frances, San Miguel, Meysulao, at Calizon. Ihanda ang mga gamot at mahahalagang dokumento.",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    res.json({ report: fallbackReport, source: "DETERMINISTIC_HYDRO_ENGINE" });
  });
  app.post("/api/ai/ask", async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }
    const systemPrompt = `You are the Expert Hydro-Met Disaster Advisory Agent for Calumpit, Bulacan, Philippines.
Calumpit has a unique geography: confluence of Angat River (via Bagbag River) and Pampanga River, low-lying delta basin, vulnerable to Manila Bay tidal backflood, Candaba Swamp outflow, and Bustos/Angat Dam releases.
Current Caniogan gauge is 2.85m (staff capacity 3.50m), Claro M. Recto PWS 24h rain is 74.2mm.
Provide a clear, accurate, actionable response formatted with bullet points where appropriate, explaining hydrological mechanics or disaster response protocols clearly.`;
    const aiAnswer = await generateGeminiContentWithFallback(`${systemPrompt}

User Question: ${question}`);
    if (aiAnswer) {
      return res.json({ answer: aiAnswer, source: "GEMINI_AI" });
    }
    res.json({
      answer: `**Hydro-Met Advisory for Calumpit:**
Regarding "${question}":
- **Confluence Mechanics:** Calumpit acts as the primary drainage funnel for both the Pampanga Basin and the Angat River system via the Bagbag channel.
- **Tidal Lock:** When Manila Bay enters high tide, outward flow through the Labangan Channel halts, causing water to push backwards into San Miguel, Frances, and Meysulao.
- **Recommended Protocol:** Always monitor Station 10 (Caniogan Bridge 3.5m gauge). Levels exceeding 2.50m trigger Orange Alert pre-evacuations.`,
      source: "DETERMINISTIC_HYDRO_ENGINE"
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Calumpit Hydro-Met Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
