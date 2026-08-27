import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_STATIONS,
  INITIAL_TIDAL_DATA,
  INITIAL_DAM_STATUS,
  INITIAL_BARANGAYS,
  GENERATE_HYDRO_TIMESERIES,
  HISTORICAL_CORRELATION_DATA,
  INITIAL_SHINE_REPORTS,
  INITIAL_ALERT_DISPATCHES
} from './src/data/mockData.js';
import { AlertSeverity, BarangayStatus, ShineReport, AlertDispatchPayload } from './src/types.js';

// In-memory state for live operations & simulation
let stations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
let tidalData = JSON.parse(JSON.stringify(INITIAL_TIDAL_DATA));
let damStatus = JSON.parse(JSON.stringify(INITIAL_DAM_STATUS));
let barangays: BarangayStatus[] = JSON.parse(JSON.stringify(INITIAL_BARANGAYS));
let shineReports: ShineReport[] = JSON.parse(JSON.stringify(INITIAL_SHINE_REPORTS));
let alertDispatches: AlertDispatchPayload[] = JSON.parse(JSON.stringify(INITIAL_ALERT_DISPATCHES));
let activeScenario: string = 'MONSOON_CONFLUENCE_HIGH_TIDE';

// Helper for Gemini AI client with lazy initialization & resilient fallbacks
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Resilient Gemini text generator with model fallback list
async function generateGeminiContentWithFallback(
  prompt: string,
  isJson: boolean = false
): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    try {
      const config: Record<string, any> = {};
      if (isJson) {
        config.responseMimeType = 'application/json';
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      // Gracefully handle high demand / temporary availability spikes without crashing
      const statusCode = err?.status || err?.error?.code || err?.code;
      if (statusCode === 503 || statusCode === 429 || statusCode === 500) {
        // Try next model in candidate list
        continue;
      }
      // If unauthorized or other errors, break and allow deterministic fallback
      break;
    }
  }

  return null;
}

// Evaluate current municipality-wide alert level based on criteria
function calculateMunicipalityAlertLevel(): { level: AlertSeverity; reason: string } {
  const canioganStn = stations.find((s: { id: string }) => s.id === 'stn-10-caniogan');
  const canioganLevel = canioganStn?.currentWaterLevel ?? 0;
  const pws = stations.find((s: { id: string }) => s.id === 'pws-iangel23');
  const rain24h = pws?.rain24hMm ?? 68;

  if (canioganLevel >= 3.50 || rain24h >= 100) {
    return {
      level: 'RED',
      reason: `CRITICAL FLOOD EVENT: Caniogan Gauge at ${canioganLevel.toFixed(2)}m (Threshold ≥ 3.50m) or 24-hr Rain (${rain24h}mm ≥ 100mm). Immediate evacuation mandatory for low-lying riverside communities.`
    };
  }
  if (canioganLevel >= 2.50 || rain24h >= 50) {
    return {
      level: 'ORANGE',
      reason: `PRE-EVACUATION WARNING: Caniogan Gauge at ${canioganLevel.toFixed(2)}m (Threshold ≥ 2.50m) or 24-hr Rain (${rain24h}mm ≥ 50mm). Rising rapidly with confluence backflood & tidal ingress.`
    };
  }
  if (canioganLevel >= 1.50 || rain24h >= 30) {
    return {
      level: 'YELLOW',
      reason: `THREATENING FLOOD LEVEL: Caniogan Gauge at ${canioganLevel.toFixed(2)}m (Threshold ≥ 1.50m) or 24-hr Rain (${rain24h}mm ≥ 30mm). Flooding threatening in low-lying riverside areas.`
    };
  }
  return {
    level: 'NORMAL',
    reason: 'Water levels within normal baseline capacity (<1.5m staff gauge). Regular monitoring active.'
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString(), municipality: 'Calumpit, Bulacan' });
  });

  // Telemetry Live
  app.get('/api/telemetry/live', (req, res) => {
    const alert = calculateMunicipalityAlertLevel();
    res.json({
      stations,
      tidalData,
      damStatus,
      overallAlert: alert,
      activeScenario,
      timestamp: new Date().toISOString()
    });
  });

  // Timeseries & Hydro Chart Data
  app.get('/api/telemetry/timeseries', (req, res) => {
    const timeseries = GENERATE_HYDRO_TIMESERIES();
    res.json({
      timeseries,
      correlationData: HISTORICAL_CORRELATION_DATA,
      correlationIndexR: 0.83,
      historicalPeakNote: 'August 9, 2026 Monsoon Peak: 188mm 3-Day Rain -> 4.12m Delta Depth'
    });
  });

  // Barangay statuses
  app.get('/api/barangays', (req, res) => {
    res.json({
      barangays,
      totalPopulationAtRisk: barangays.reduce((acc, b) => acc + b.populationAtRisk, 0),
      totalHouseholdsAffected: barangays.reduce((acc, b) => acc + b.householdsAffected, 0),
      totalEvacueesSheltered: barangays.reduce((acc, b) => acc + b.evacuationCenter.currentOccupancy, 0),
      evacuationCapacityTotal: barangays.reduce((acc, b) => acc + b.evacuationCenter.capacity, 0)
    });
  });

  // Update specific barangay status
  app.post('/api/barangays/update', (req, res) => {
    const { id, floodHeightInches, roadPassability, warningStatus, trend } = req.body;
    const brgy = barangays.find(b => b.id === id);
    if (!brgy) {
      return res.status(404).json({ error: 'Barangay not found' });
    }
    if (floodHeightInches !== undefined) {
      brgy.floodHeightInches = floodHeightInches;
      brgy.floodHeightMeters = Number((floodHeightInches * 0.0254).toFixed(2));
    }
    if (roadPassability) brgy.roadPassability = roadPassability;
    if (warningStatus) brgy.warningStatus = warningStatus;
    if (trend) brgy.trend = trend;
    brgy.lastUpdate = 'Just now (MDRRMO update)';

    res.json({ success: true, barangay: brgy });
  });

  // SHINe Volunteer Reports
  app.get('/api/shine/reports', (req, res) => {
    res.json({ reports: shineReports });
  });

  app.post('/api/shine/submit', (req, res) => {
    const { schoolName, observerName, gaugeReadingMm, rainfallType, turbidityObserved, waterHyacinthClogging, fieldNotes } = req.body;
    
    if (!schoolName || !observerName || gaugeReadingMm === undefined) {
      return res.status(400).json({ error: 'Missing required SHINe observation parameters.' });
    }

    const newReport: ShineReport = {
      id: `shine-${Date.now()}`,
      schoolName,
      observerName,
      gaugeReadingMm: Number(gaugeReadingMm),
      timestamp: 'Just now (Live student field report)',
      rainfallType: rainfallType || 'MODERATE',
      turbidityObserved: turbidityObserved || 'MURKY_BROWN',
      waterHyacinthClogging: Boolean(waterHyacinthClogging),
      fieldNotes: fieldNotes || 'Standard manual gauge reading logged.',
      verified: true
    };

    shineReports.unshift(newReport);
    res.json({ success: true, report: newReport });
  });

  // Alerts Dispatch
  app.get('/api/alerts/history', (req, res) => {
    res.json({ dispatches: alertDispatches });
  });

  app.post('/api/alerts/dispatch', (req, res) => {
    const { alertLevel, title, messageTagalog, messageEnglish, targetRecipients, channels, triggeredBy } = req.body;

    const newDispatch: AlertDispatchPayload = {
      id: `dispatch-${Date.now()}`,
      timestamp: 'Just now (Broadcasted)',
      alertLevel: alertLevel || 'ORANGE',
      title: title || 'MDRRMO Emergency Flood Advisory',
      messageTagalog: messageTagalog || 'BABALA: Inaatasan ang lahat ng barangay na mag-antabay.',
      messageEnglish: messageEnglish || 'WARNING: Emergency flood alert active for Calumpit riverside zones.',
      targetRecipients: targetRecipients || ['All 29 Calumpit BDRRMC Captains', 'Calumpit Rescue 911 Operations'],
      channels: channels || ['SMS_TWILIO', 'EMAIL_SENDGRID', 'SIREN_BROADCAST'],
      triggeredBy: triggeredBy || 'Manual Operator / Telemetry Override',
      status: 'SENT'
    };

    alertDispatches.unshift(newDispatch);
    res.json({ success: true, dispatch: newDispatch });
  });

  // Scenario Simulator
  app.post('/api/simulation/set-scenario', (req, res) => {
    const { scenario } = req.body;
    activeScenario = scenario;

    const caniogan = stations.find((s: { id: string }) => s.id === 'stn-10-caniogan');
    const calumpitBr = stations.find((s: { id: string }) => s.id === 'stn-11-calumpit-bridge');
    const sulipan = stations.find((s: { id: string }) => s.id === 'stn-sulipan');
    const pws = stations.find((s: { id: string }) => s.id === 'pws-iangel23');

    if (scenario === 'RED_EXTREME_MONSOON') {
      if (caniogan) { caniogan.currentWaterLevel = 3.65; caniogan.floodTrend = 'RISING'; caniogan.rain24hMm = 145; }
      if (calumpitBr) { calumpitBr.currentWaterLevel = 3.75; calumpitBr.floodTrend = 'RISING'; }
      if (sulipan) { sulipan.currentWaterLevel = 4.15; sulipan.floodTrend = 'RISING'; }
      if (pws) { pws.rain24hMm = 145; pws.rainRateMmHr = 35.0; pws.windGustKmh = 68; }
      tidalData.currentTideMsl = 1.72;
      tidalData.tideState = 'FLOODING_HIGH';
      damStatus[0].dischargeRateCms = 500; damStatus[0].gatesOpen = 4;
      damStatus[1].dischargeRateCms = 650; damStatus[1].gatesOpen = 6;
      barangays.forEach(b => {
        if (['brgy-frances', 'brgy-san-miguel', 'brgy-meysulao', 'brgy-calizon', 'brgy-sapang-bayan'].includes(b.id)) {
          b.warningStatus = 'RED';
          b.floodHeightInches = Math.max(36, b.floodHeightInches + 12);
          b.roadPassability = 'SUBMERGED_BOATS_ONLY';
        } else {
          b.warningStatus = 'ORANGE';
          b.floodHeightInches = Math.max(20, b.floodHeightInches + 8);
          b.roadPassability = 'NOT_PASSABLE_LIGHT';
        }
      });
    } else if (scenario === 'YELLOW_THREATENING') {
      if (caniogan) { caniogan.currentWaterLevel = 1.85; caniogan.floodTrend = 'RISING'; caniogan.rain24hMm = 42; }
      if (calumpitBr) { calumpitBr.currentWaterLevel = 1.90; calumpitBr.floodTrend = 'RISING'; }
      if (sulipan) { sulipan.currentWaterLevel = 2.40; sulipan.floodTrend = 'RISING'; }
      if (pws) { pws.rain24hMm = 42; pws.rainRateMmHr = 9.0; }
      damStatus[0].dischargeRateCms = 120; damStatus[0].gatesOpen = 1;
      damStatus[1].dischargeRateCms = 200; damStatus[1].gatesOpen = 2;
      barangays.forEach(b => {
        b.warningStatus = ['brgy-frances', 'brgy-san-miguel', 'brgy-meysulao'].includes(b.id) ? 'YELLOW' : 'NORMAL';
        b.floodHeightInches = Math.min(12, b.floodHeightInches);
        b.roadPassability = 'PASSABLE_ALL';
      });
    } else if (scenario === 'NORMAL_BASELINE') {
      if (caniogan) { caniogan.currentWaterLevel = 1.15; caniogan.floodTrend = 'RECEDING'; caniogan.rain24hMm = 12; }
      if (calumpitBr) { calumpitBr.currentWaterLevel = 1.05; calumpitBr.floodTrend = 'RECEDING'; }
      if (sulipan) { sulipan.currentWaterLevel = 1.45; sulipan.floodTrend = 'RECEDING'; }
      if (pws) { pws.rain24hMm = 12; pws.rainRateMmHr = 0; pws.windGustKmh = 18; }
      tidalData.currentTideMsl = 0.65;
      tidalData.tideState = 'EBBING_LOW';
      damStatus[0].dischargeRateCms = 0; damStatus[0].gatesOpen = 0;
      damStatus[1].dischargeRateCms = 50; damStatus[1].gatesOpen = 1;
      barangays.forEach(b => {
        b.warningStatus = 'NORMAL';
        b.floodHeightInches = 0;
        b.floodHeightMeters = 0;
        b.roadPassability = 'PASSABLE_ALL';
      });
    } else {
      // DEFAULT / MONSOON_CONFLUENCE_HIGH_TIDE
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

  // AI Situation Assessment
  app.post('/api/ai/situation-assessment', async (req, res) => {
    const alert = calculateMunicipalityAlertLevel();
    const caniogan = stations.find((s: { id: string }) => s.id === 'stn-10-caniogan');
    const pws = stations.find((s: { id: string }) => s.id === 'pws-iangel23');
    const angat = damStatus.find((d: { name: string }) => d.name.includes('Angat'));
    const bustos = damStatus.find((d: { name: string }) => d.name.includes('Bustos'));
    
    const contextPrompt = `You are the Lead Hydro-Meteorologist and Chief Operations Officer for Calumpit MDRRMO / Bulacan PDRRMO in the Philippines.
Analyze the following live telemetry and physical confluence dynamics for Calumpit, Bulacan:
- Municipality Alert Level: ${alert.level} (${alert.reason})
- WL Station 10 (Caniogan Bridge, Bagbag River Staff Gauge): ${caniogan?.currentWaterLevel ?? 2.85}m (Max: 3.50m)
- Claro M. Recto PWS (IANGEL23): 24h Rain ${pws?.rain24hMm ?? 74}mm, Hourly Rate ${pws?.rainRateMmHr ?? 16.8}mm/hr, Barometric Pressure: ${pws?.pressureInHg ?? 29.62} inHg, Wind Gusts: ${pws?.windGustKmh ?? 46} km/h
- Angat Dam: Discharge ${angat?.dischargeRateCms ?? 280} m³/s with ${angat?.gatesOpen ?? 2} gates open (Arrival: ${angat?.estimatedArrivalToCalumpitHours ?? 7.5}h)
- Bustos Dam: Discharge ${bustos?.dischargeRateCms ?? 450} m³/s with ${bustos?.gatesOpen ?? 4} gates open (Arrival: ${bustos?.estimatedArrivalToCalumpitHours ?? 3.0}h)
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
        return res.json({ report: parsed, source: 'GEMINI_AI' });
      } catch (parseErr) {
        // Fall through to deterministic report if JSON parsing fails
      }
    }

    // High-precision deterministic hydro-meteorological analysis fallback
    const fallbackReport = {
      title: 'Calumpit MDRRMO Hydro-Met Confluence & Tidal Delta Assessment',
      overallThreatLevel: alert.level,
      executiveSummary: `Calumpit is undergoing dual-action confluence surge. Upstream discharges from Bustos Dam (${bustos?.dischargeRateCms || 450} m³/s) and Angat Dam are entering the Bagbag River channel while the Pampanga main delta is swollen by Candaba Swamp runoff. Concurrently, Manila Bay tidal ingress (+${tidalData.currentTideMsl}m MSL) acts as a hydraulic wall, elevating Caniogan Bridge staff gauge to ${caniogan?.currentWaterLevel || 2.85}m.`,
      confluenceDynamics: 'The Bagbag River serves as the sole relief tributary carrying Angat water into the Pampanga River right at Calumpit. Because the Pampanga River delta at Sulipan is already at 3.10m, backflooding is reversing flow into San Miguel, Calizon, and Frances.',
      tidalWindowAdvisory: `High tide crest will peak at ${tidalData.nextHighTideTime} at +${tidalData.nextHighTideHeight}m MSL. Drainage will drop to near zero for a 3.5-hour window. Water levels in riverside barangays are projected to rise by an additional 4 to 8 inches during this peak.`,
      highRiskBarangays: [
        'Frances (Islanded, road submerged - rescue boats only)',
        'San Miguel (Bagbag embankment overtop risk)',
        'Meysulao (Deep agricultural basin backflow)',
        'Calizon (Confluence turbulence at MacArthur Bridge approach)',
        'Sapang Bayan (Direct tidal corridor)'
      ],
      recommendedMdrrmoActions: [
        'Preposition motorized rescue fiberglass boats (BDRRMC Calumpit Rescue 911) at Frances & Meysulao access points.',
        'Enforce mandatory evacuation for families residing within 20 meters of the Bagbag and Pampanga riverbanks.',
        'Issue road closure warning along Calumpit-Hagonoy coastal artery and deploy DPWH / PNP traffic controllers.',
        'Activate School Evacuation Centers (Frances NHS 2F/3F and Calumpit Municipal Gym) with generator backup.'
      ],
      publicAdvisoryTagalog: 'BABALA SA MGA RESIDENTE NG CALUMPIT: Patuloy ang pagtaas ng tubig sa Bagbag at Pampanga River dahil sa ulan at pagpapakawala ng Bustos Dam. Sasabay ang high tide sa ganap na 2:45 PM. Mangyaring lumikas na ang mga nasa tabing-ilog sa Frances, San Miguel, Meysulao, at Calizon. Ihanda ang mga gamot at mahahalagang dokumento.',
      generatedAt: new Date().toISOString()
    };

    res.json({ report: fallbackReport, source: 'DETERMINISTIC_HYDRO_ENGINE' });
  });

  // AI Interactive Q&A for Disaster Managers
  app.post('/api/ai/ask', async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const systemPrompt = `You are the Expert Hydro-Met Disaster Advisory Agent for Calumpit, Bulacan, Philippines.
Calumpit has a unique geography: confluence of Angat River (via Bagbag River) and Pampanga River, low-lying delta basin, vulnerable to Manila Bay tidal backflood, Candaba Swamp outflow, and Bustos/Angat Dam releases.
Current Caniogan gauge is 2.85m (staff capacity 3.50m), Claro M. Recto PWS 24h rain is 74.2mm.
Provide a clear, accurate, actionable response formatted with bullet points where appropriate, explaining hydrological mechanics or disaster response protocols clearly.`;

    const aiAnswer = await generateGeminiContentWithFallback(`${systemPrompt}\n\nUser Question: ${question}`);
    if (aiAnswer) {
      return res.json({ answer: aiAnswer, source: 'GEMINI_AI' });
    }

    res.json({
      answer: `**Hydro-Met Advisory for Calumpit:**\nRegarding "${question}":\n- **Confluence Mechanics:** Calumpit acts as the primary drainage funnel for both the Pampanga Basin and the Angat River system via the Bagbag channel.\n- **Tidal Lock:** When Manila Bay enters high tide, outward flow through the Labangan Channel halts, causing water to push backwards into San Miguel, Frances, and Meysulao.\n- **Recommended Protocol:** Always monitor Station 10 (Caniogan Bridge 3.5m gauge). Levels exceeding 2.50m trigger Orange Alert pre-evacuations.`,
      source: 'DETERMINISTIC_HYDRO_ENGINE'
    });
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calumpit Hydro-Met Server running on port ${PORT}`);
  });
}

startServer();
