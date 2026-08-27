import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, MessageSquare, Compass, Waves, CheckCircle2 } from 'lucide-react';
import { BarangayFloodInfo, DamStatus, RiverStation, TideData, WeatherData } from '../types/flood';

interface AiSafetyAdvisorProps {
  telemetry: {
    weather: WeatherData;
    riverStations: RiverStation[];
    dams: DamStatus[];
    tide: TideData;
    barangays: BarangayFloodInfo[];
  };
  selectedBarangay: BarangayFloodInfo | null;
  language: 'tl' | 'en';
}

interface AiAssessment {
  summary: string;
  crestProjection: string;
  highRiskBarangays: string[];
  damDischargeImpact: string;
  tidalInfluence: string;
  actionableAdvice: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiSafetyAdvisor: React.FC<AiSafetyAdvisorProps> = ({
  telemetry,
  selectedBarangay,
  language
}) => {
  const [assessment, setAssessment] = useState<AiAssessment | null>(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'tl'
        ? 'Magandang araw! Ako si Alerto Calumpit, ang iyong AI Safety & Rescue Advisor mula sa CBFMMP. Mayroon ka bang katanungan tungkol sa lebel ng baha, evacuation routes, o paghahanda sa iyong barangay?'
        : 'Hello! I am Alerto Calumpit, your CBFMMP AI Safety & Rescue Advisor. Ask me anything about river crest levels, dam release timings, evacuation protocols, or neighborhood flood risks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch AI Telemetry Synthesis
  const generateAssessment = async () => {
    setLoadingAssessment(true);
    setAssessmentError(null);
    try {
      const res = await fetch('/api/gemini/flood-risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetry,
          language
        })
      });

      if (!res.ok) throw new Error('Failed to generate risk synthesis');
      const data = await res.json();
      setAssessment(data);
    } catch (err) {
      console.error(err);
      setAssessmentError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingAssessment(false);
    }
  };

  useEffect(() => {
    generateAssessment();
  }, [language]);

  // Handle Resident Chat Query
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/gemini/resident-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: textToSend,
          residentBarangay: selectedBarangay ? selectedBarangay.name : 'Calumpit',
          currentContext: {
            floodDepthFeet: selectedBarangay?.floodDepthFeet || 0,
            weather: telemetry.weather,
            bustosDischarge: telemetry.dams.find(d => d.name.includes('Bustos'))?.dischargeRate || 0,
            tide: telemetry.tide
          },
          language
        })
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || (language === 'tl' ? 'Pasensya na, subukang muli mamaya o tumawag agad sa Calumpit MDRRMO sa 0917-800-MDRR.' : 'Please try again or call Calumpit MDRRMO directly at 0917-800-MDRR.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: language === 'tl'
          ? 'Hindi makakonekta sa AI server. Tumawag agad sa Calumpit MDRRMO: (044) 913-7288 para sa agarang saklolo.'
          : 'Unable to reach AI server. Please contact Calumpit MDRRMO Hotline: (044) 913-7288 directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickPrompts = language === 'tl' ? [
    'Baha na sa Meysulao at Frances, saan ang ligtas na daan?',
    'Paano maghanda bago magpakawala ang Bustos Dam?',
    'Ano ang dapat gawin kung may sanggol at matanda sa bahay habang tumataas ang baha?',
    'Paano maiwasan ang leptospirosis sa maruming tubig baha?'
  ] : [
    'What is the safest evacuation route from Meysulao / Frances?',
    'How does Bustos Dam release affect the Pampanga River confluence?',
    'What emergency steps should I take if flood is waist-high with seniors at home?',
    'What should I pack in my flood emergency Go-Bag?'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: AI Multi-Sensor Flood Risk Assessment (5 cols) */}
      <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  {language === 'tl' ? 'Pagsusuri ng AI sa Panganib ng Baha' : 'AI Hydrological Risk Synthesis'}
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Gemini 3.7 Flash • CBFMMP Engine
                </span>
              </div>
            </div>
            <button
              id="refresh-ai-assessment-btn"
              onClick={generateAssessment}
              disabled={loadingAssessment}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition disabled:opacity-50"
              title="Refresh AI synthesis"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAssessment ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {loadingAssessment ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-400">
                {language === 'tl'
                  ? 'Sinusuri ang live telemetry ng ilog, dam, ulan, at taob...'
                  : 'Synthesizing live river gauges, dam discharge, rainfall & tidal dynamics...'}
              </p>
            </div>
          ) : assessment ? (
            <div className="space-y-3.5 text-xs">
              
              {/* Executive Summary */}
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 leading-relaxed font-medium">
                {assessment.summary}
              </div>

              {/* River Crest & High Tide Forecast */}
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                  {language === 'tl' ? 'Pagtaya sa Pagtaas ng Ilog (Crest Projection)' : 'River Crest Forecast'}:
                </span>
                <p className="text-neutral-200 leading-relaxed">
                  {assessment.crestProjection}
                </p>
              </div>

              {/* Dam & Tidal Dynamics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-0.5">
                    {language === 'tl' ? 'Epekto ng Dam' : 'Dam Spill Impact'}
                  </span>
                  <p className="text-neutral-300 text-[11px] leading-snug">
                    {assessment.damDischargeImpact}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-0.5">
                    {language === 'tl' ? 'Epekto ng Taob' : 'Tidal Backflow'}
                  </span>
                  <p className="text-neutral-300 text-[11px] leading-snug">
                    {assessment.tidalInfluence}
                  </p>
                </div>
              </div>

              {/* Actionable Directives */}
              {assessment.actionableAdvice && assessment.actionableAdvice.length > 0 && (
                <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {language === 'tl' ? 'Mga Agarang Aksyon sa Residente' : 'Immediate Resident Safety Directives'}:
                  </span>
                  <ul className="space-y-1.5 pl-4 list-disc text-neutral-300">
                    {assessment.actionableAdvice.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              {assessmentError || 'Click refresh to synthesize current flood telemetry.'}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 text-center">
          {language === 'tl'
            ? 'Awtomatikong nakikipag-ugnayan sa Calumpit MDRRMO Command Center'
            : 'Synchronized with Calumpit MDRRMO Incident Command System'}
        </div>
      </div>

      {/* RIGHT COLUMN: "Alerto Calumpit" AI Resident Chat (7 cols) */}
      <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-md flex flex-col justify-between min-h-[520px]">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Alerto Calumpit — 24/7 AI Safety Advisor
                </h3>
                <span className="text-xs text-neutral-400">
                  {language === 'tl'
                    ? 'Magtanong tungkol sa baha sa iyong barangay, rescue, at evacuation'
                    : 'Interactive emergency guidance & localized safety advice'}
                </span>
              </div>
            </div>

            {selectedBarangay && (
              <span className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-cyan-300 border border-neutral-700 font-medium">
                Brgy. {selectedBarangay.name}
              </span>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="mb-3">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-1.5">
              {language === 'tl' ? 'Madalas Itanong (I-click para ipadala)' : 'Quick Questions (Click to ask)'}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={chatLoading}
                  className="text-[11px] text-left px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 transition disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 py-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center space-x-2 p-3 bg-neutral-950 border border-neutral-800 rounded-xl max-w-xs text-xs text-neutral-400">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>{language === 'tl' ? 'Sumasagot si Alerto Calumpit...' : 'Alerto Calumpit is preparing guidance...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input Box */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-advisor-input"
              type="text"
              placeholder={language === 'tl' ? 'Magtanong kay Alerto Calumpit (hal. Ligtas ba ang MacArthur Highway?)...' : 'Ask emergency advisor (e.g. Is MacArthur Highway passable?)...'}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={chatLoading}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              id="ai-advisor-send-btn"
              type="submit"
              disabled={!inputQuery.trim() || chatLoading}
              className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-neutral-800 text-white rounded-lg transition shadow disabled:text-neutral-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
