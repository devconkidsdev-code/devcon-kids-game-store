import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Calumpit CBFMMP Early Warning & Mitigation System',
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(process.env.GEMINI_API_KEY)
  });
});

// API: AI Flood Risk Assessment Synthesizer
app.post('/api/gemini/flood-risk-assessment', async (req, res) => {
  try {
    const { telemetry, language = 'en' } = req.body;

    const ai = getAiClient();
    if (!ai) {
      // Fallback structured assessment if API key is not configured
      return res.json({
        summary: language === 'tl'
          ? "Matinding pagbabantay sa Calumpit dahil sa pagsasama ng Habagat at pagpapakawala ng tubig mula sa Bustos Dam. Pinapayuhan ang agarang paglikas sa mabababang barangay tulad ng Meysulao, Frances, at Gatbuca."
          : "Critical flood monitoring active across Calumpit basin. Confluence of Pampanga and Angat rivers combined with Bustos Dam spilling requires urgent preemptive evacuations in riverside and low-lying barangays.",
        crestProjection: "Pampanga river expected to crest within 4 to 6 hours during high tide peak.",
        highRiskBarangays: ["Meysulao", "Frances", "Gatbuca", "San Miguel", "Sapang Bayan", "Calizon", "Buguion"],
        damDischargeImpact: "Bustos Dam discharge is actively aggravating downstream water elevation by +0.15m/hr.",
        tidalInfluence: "Manila Bay high tide is hindering natural outflow through Labangan floodway.",
        actionableAdvice: [
          language === 'tl' ? "Itaas ang mga gamit at patayin ang main electrical switch bago pasukin ng baha." : "Elevate essential belongings and switch off main circuit breakers immediately.",
          language === 'tl' ? "Magtungo sa Calumpit Sports Complex o pinakamalapit na designated evacuation center." : "Proceed to Calumpit Sports Complex or nearest designated barangay shelter.",
          language === 'tl' ? "Ihanda ang Go-Bag na may malinis na tubig, pagkain, gamot, at dokumento." : "Keep emergency Go-Bags with potable water, non-perishables, medical kits, and sealed documents."
        ]
      });
    }

    const systemPrompt = `You are the Lead Hydrologist and Disaster Mitigation Officer for the Calumpit, Bulacan Community-Based Flood Mitigation Management Program (CBFMMP), in coordination with MDRRMO Calumpit, PAGASA-PRFFWC (Pampanga River Flood Forecasting & Warning Center), and PDRRMC Bulacan.
Analyze the provided real-time telemetry (River levels, Dam releases, Rainfall, High tide, and Barangay inundation status) and return a concise, high-impact assessment.

Output strictly valid JSON with this structure:
{
  "summary": "2-3 concise sentences summarizing the immediate risk and meteorological dynamics",
  "crestProjection": "River crest time estimate and water elevation trajectory",
  "highRiskBarangays": ["List", "of", "most", "vulnerable", "barangays"],
  "damDischargeImpact": "Analysis of Bustos/Ipo/Angat dam releases on Calumpit's river junction",
  "tidalInfluence": "Impact of Manila Bay high tide backflow on drainage and flood stagnation",
  "actionableAdvice": ["Step 1", "Step 2", "Step 3", "Step 4"]
}
${language === 'tl' ? 'All text values MUST be in clear, natural Tagalog/Filipino suitable for local residents and barangay captains.' : 'All text values MUST be in clear, professional English.'}`;

    const prompt = `Current Calumpit Telemetry:
${JSON.stringify(telemetry, null, 2)}

Provide the CBFMMP flood risk synthesis and actionable advisory.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error generating flood risk assessment:', error);
    res.status(500).json({
      error: 'Failed to generate AI assessment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: AI Resident Safety & Rescue Advisor Chat
app.post('/api/gemini/resident-advisor', async (req, res) => {
  try {
    const { userQuestion, residentBarangay, currentContext, language = 'tl' } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: language === 'tl'
          ? `Para sa inyong kaligtasan sa Barangay ${residentBarangay || 'Calumpit'}: Kung ang tubig ay patuloy na tumataas, agad makipag-ugnayan sa Calumpit MDRRMO sa (044) 913-7288 o 0917-800-MDRR. Ihanda ang inyong Go-Bag, patayin ang kuryente, at lumikas sa pinakamalapit na evacuation center habang passable pa ang daan.`
          : `For residents in Barangay ${residentBarangay || 'Calumpit'}: If water levels are rising rapidly, contact Calumpit MDRRMO at (044) 913-7288. Turn off main circuit breakers, secure emergency kits, and proceed to the designated high-ground shelter immediately.`
      });
    }

    const systemPrompt = `You are "Alerto Calumpit", the 24/7 AI Emergency Safety Advisor for residents of Calumpit, Bulacan, integrated with the Community-Based Flood Mitigation Management Program (CBFMMP) and MDRRMO Calumpit.

Calumpit Geography & Context:
- Calumpit is Bulacan's low-lying basin where the Pampanga River and Angat River converge, heavily affected by Bustos Dam spills and Manila Bay high tide backflow through Hagonoy/Labangan channels.
- Highly vulnerable barangays: Meysulao, Frances, Gatbuca, San Miguel, Sapang Bayan, Buguion, Calizon, Bulusan, Iba O'Este, Sucol.
- Primary Evacuation Centers: Calumpit Sports Complex (Poblacion), San Marcos National High School, Calumpit Central School (Balungao), St. John the Baptist Parish ground, Gatbuca Covered Court.
- Calumpit Emergency Hotlines: MDRRMO (044) 913-7288 / 0917-800-MDRR; Rescue 911 (044) 815-1199; PNP (044) 913-1110; BFP (044) 913-2222.

Guidelines:
1. Provide calm, direct, actionable, life-saving advice based on the user's barangay and current flood situation.
2. Prioritize safety: electrical breaker shutdown, preventing leptospirosis / contaminated water exposure, evacuation timing before roads submerge, care for seniors, infants, and pets.
3. Respond in ${language === 'tl' ? 'warm, clear, helpful Tagalog / Filipino' : 'clear, reassuring, professional English'}. Keep responses concise and highly legible with bullet points for action steps.`;

    const userPrompt = `Resident Barangay: ${residentBarangay || 'Unspecified Calumpit Barangay'}
Current Flood / Weather Context: ${JSON.stringify(currentContext)}
Resident Question / Concern: "${userQuestion}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error generating resident advisory:', error);
    res.status(500).json({
      error: 'Failed to generate resident advice',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`Calumpit CBFMMP Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
