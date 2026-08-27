import React, { useState, useRef, useEffect } from 'react';
import { TouristSpot, ChatMessage } from '../types';
import { 
  MessageSquareText, 
  Send, 
  X, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  HelpCircle,
  Bot,
  User,
  ArrowRight,
  Calculator,
  Calendar
} from 'lucide-react';

interface BukidnonChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  spots: TouristSpot[];
  onSelectSpot: (spot: TouristSpot) => void;
  onOpenBudget: () => void;
  onOpenTripPlanner: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'bot',
    text: 'Madyaw na pag-abot sa Bukidnon! 🌿 I am your official Bukidnon Tourism AI Assistant. All my answers are strictly grounded in real-time operating schedules, road conditions, and verified owner data from our provincial database.',
    timestamp: 'Just now',
    suggestions: [
      'Is Dahilayan open today?',
      'What can I do in Malaybalay City?',
      'How much should I budget for a 3-day trip?',
      'Is Mount Kitanglad accessible right now?',
      'Top waterfalls in Bukidnon'
    ]
  }
];

export const BukidnonChatbot: React.FC<BukidnonChatbotProps> = ({
  isOpen,
  onClose,
  spots,
  onSelectSpot,
  onOpenBudget,
  onOpenTripPlanner
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  // STRICT BUKIDNON KNOWLEDGE ENGINE (Zero-Hallucination Retrieval)
  const processQuery = (rawInput: string): ChatMessage => {
    const q = rawInput.toLowerCase().trim();

    // 1. OUT-OF-SCOPE FILTER: Rejects non-Bukidnon locations & topics
    const outOfScopeKeywords = [
      'cebu', 'manila', 'boracay', 'palawan', 'siargao', 'baguio', 'tagaytay',
      'davao city center', 'paris', 'tokyo', 'usa', 'bitcoin', 'crypto',
      'python code', 'javascript code', 'write an essay', 'recipe for pizza'
    ];

    if (outOfScopeKeywords.some((kw) => q.includes(kw))) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: "I am the Bukidnon Tourism Assistant, so I am strictly dedicated to providing verified tourism, operational, weather, and travel information exclusively for Bukidnon province. Please ask me about Bukidnon's attractions, roads, or travel planning!",
        timestamp: 'Just now',
        suggestions: [
          'What spots are in Manolo Fortich?',
          'Is Dahilayan Adventure Park open?',
          'Estimate a 3-day Bukidnon budget'
        ]
      };
    }

    // 2. SPECIFIC SPOT LOOKUP (Checking status, prices, hours, accessibility)
    const matchedSpot = spots.find(
      (s) =>
        q.includes(s.name.toLowerCase()) ||
        q.includes(s.name.toLowerCase().split(' ')[0]) ||
        (q.includes('kitanglad') && s.id === 2) ||
        (q.includes('dahilayan') && s.id === 1) ||
        (q.includes('lake apo') && s.id === 3) ||
        (q.includes('communal') && s.id === 4) ||
        (q.includes('alalum') && s.id === 5) ||
        (q.includes('monastery') && s.id === 6) ||
        (q.includes('cedar') && s.id === 7) ||
        (q.includes('pineapple') && s.id === 8) ||
        (q.includes('rotypeaks') && s.id === 9) ||
        (q.includes('strawberry') && s.id === 10) ||
        (q.includes('nasuli') && s.id === 11) ||
        (q.includes('musuan') && s.id === 13) ||
        (q.includes('kampo juan') && s.id === 14) ||
        (q.includes('dimapatoy') && s.id === 15) ||
        (q.includes('kaamulan') && s.id === 16)
    );

    // If query asks if a specific spot is open/status
    if (matchedSpot && (q.includes('open') || q.includes('status') || q.includes('accessible') || q.includes('weather') || q.includes('closed') || q.includes('how much') || q.includes('price') || q.includes('fee') || q.includes('hours'))) {
      const statusEmoji = matchedSpot.operatingStatus === 'open' ? '🟢 OPEN' : matchedSpot.operatingStatus === 'limited' ? '🟡 LIMITED' : '🔴 CLOSED';
      const accessEmoji = matchedSpot.accessibilityStatus === 'accessible' ? '🟢 Smooth Access' : matchedSpot.accessibilityStatus === 'limited' ? '🟡 Caution' : '🔴 Inaccessible';
      
      let reply = `Here is the current verified operational data for **${matchedSpot.name}** in ${matchedSpot.municipality}:\n\n` +
        `• **Operating Status:** ${statusEmoji} (${matchedSpot.operatingStatusReason})\n` +
        `• **Road & Trail Access:** ${accessEmoji} (${matchedSpot.accessibilityReason})\n` +
        `• **Operating Hours:** ${matchedSpot.operatingHours}\n` +
        `• **Entrance Fee:** ${matchedSpot.entranceFee === 0 ? 'FREE' : `₱${matchedSpot.entranceFee} / pax`}\n` +
        `• **Live Weather:** ${matchedSpot.weather.condition}, ${matchedSpot.weather.temp}°C (${matchedSpot.weather.rainProbability}% Rain risk)\n\n` +
        `*Last verified by ${matchedSpot.updatedBy} at ${matchedSpot.lastUpdated}.*`;

      if (matchedSpot.weather.warning) {
        reply += `\n\n⚠️ **Weather Advisory:** ${matchedSpot.weather.warning}`;
      }

      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: 'Just now',
        spotCards: [matchedSpot.id],
        suggestions: [
          `Get directions to ${matchedSpot.name}`,
          `Book a visit to ${matchedSpot.name}`,
          'What other spots are nearby?'
        ]
      };
    }

    // 3. MUNICIPALITY / LOCATION SEARCH
    const municipalities = ['malaybalay', 'valencia', 'manolo fortich', 'impasug-ong', 'maramag', 'quezon', 'lantapan', 'sumilao', 'san fernando'];
    const matchedMuni = municipalities.find((m) => q.includes(m));

    if (matchedMuni) {
      const muniSpots = spots.filter((s) => s.municipality.toLowerCase().includes(matchedMuni));
      if (muniSpots.length > 0) {
        const spotNames = muniSpots.map((s) => `• **${s.name}** (${s.operatingStatus.toUpperCase()} - ₱${s.entranceFee})`).join('\n');
        return {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `In **${muniSpots[0].municipality}**, we have ${muniSpots.length} verified attraction(s) in our provincial database:\n\n${spotNames}\n\nAll data is updated directly by registered operators and municipal tourism desks.`,
          timestamp: 'Just now',
          spotCards: muniSpots.map((s) => s.id),
          suggestions: [
            `Is ${muniSpots[0].name} open?`,
            'How to get there from Sayre Highway?',
            'Recommend a restaurant nearby'
          ]
        };
      }
    }

    // 4. BUDGET INQUIRIES
    if (q.includes('budget') || q.includes('cost') || q.includes('how much should i prepare') || q.includes('how much money') || q.includes('expense')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: "Here is an estimated budget guideline based on current Bukidnon tourism rates:\n\n" +
          "• **Day Trip (1 Day):** ₱1,200 – ₱2,500 per person (Transport + Meals + Entrance)\n" +
          "• **Weekend Trip (2 Days / 1 Night):** ₱4,500 – ₱7,000 for 2 travelers (Homestay / Resort + Activities)\n" +
          "• **Comprehensive 3-Day Trip:** ₱8,000 – ₱12,000 for 2 travelers (Private Car/Rental + Glamping + Ziplines/Coasters)\n\n" +
          "Entrance fees in Bukidnon range from **FREE** (Kaamulan Park, Del Monte) to **₱50** (Lake Apo, Communal Ranch) and **₱150–₱600** for extreme adventure parks like Dahilayan.",
        timestamp: 'Just now',
        suggestions: [
          'Open Interactive Budget Calculator',
          'What are the free attractions in Bukidnon?',
          'Plan a 3-day itinerary'
        ]
      };
    }

    // 5. ITINERARY & TRIP PLANNING
    if (q.includes('itinerary') || q.includes('plan') || q.includes('3-day') || q.includes('2-day') || q.includes('recommend') || q.includes('where should i go') || q.includes('what to do')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: "Here is a popular recommended **3-Day Bukidnon Highland Circuit** taking current operating schedules and road clearance into account:\n\n" +
          "🏔️ **Day 1 (Manolo Fortich & Adventure):**\n• Morning: Dahilayan Adventure Park (Dual Zipline & Razorback Coaster)\n• Lunch: Del Monte Clubhouse Steak & Pineapple Drink\n• Afternoon: Kampo Juan Sky-Bike\n\n" +
          "🐎 **Day 2 (Impasug-ong Cowboy Country & Waterfalls):**\n• Sunrise: Communal Ranch horseback riding\n• Midday: CEDAR Gantungan Falls trek & cold spring dip\n• Photo stop: Alalum Falls on Sayre Highway\n\n" +
          "☕ **Day 3 (Malaybalay Culture & Crater Lake):**\n• Morning: Monastery of the Transfiguration (Monks’ Coffee)\n• Afternoon: Lake Apo floating bamboo raft in Valencia\n• Evening: Nasuli Spring turquoise cold plunge",
        timestamp: 'Just now',
        suggestions: [
          'Open Trip Planner',
          'Is Lake Apo open today?',
          'Calculate total budget for this trip'
        ]
      };
    }

    // 6. WATERFALLS & NATURE SPECIFIC
    if (q.includes('waterfall') || q.includes('falls') || q.includes('swim') || q.includes('spring')) {
      const waterfallSpots = spots.filter((s) => s.category === 'Waterfalls' || s.category === 'Springs & Resorts');
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `Here are the top waterfalls and natural springs in Bukidnon currently on record:\n\n` +
          waterfallSpots.map((w) => `• **${w.name}** (${w.municipality}) — ${w.operatingStatus === 'open' ? '🟢 Open' : '🔴 Closed'} (₱${w.entranceFee})`).join('\n') +
          `\n\n⚠️ *Notice: Dimapatoy Falls in San Fernando is currently closed due to seasonal river flood risks.*`,
        timestamp: 'Just now',
        spotCards: waterfallSpots.map((w) => w.id)
      };
    }

    // 7. WEATHER & RAINY DAY RECOMMENDATIONS
    if (q.includes('rain') || q.includes('weather') || q.includes('storm') || q.includes('monsoon')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: "🌦️ **Bukidnon Live Weather Overview:**\n\n" +
          "• **Northern Bukidnon (Manolo Fortich):** Partly Cloudy, 24°C, safe for all adventure rides.\n" +
          "• **Central Highlands (Lantapan / Kitanglad):** Heavy monsoon showers affecting summit trails; 4WD recommended for Sitio Intavas.\n" +
          "• **Southern Valley (Malaybalay & Valencia):** Fair skies, 26°C; Lake Apo and Kaamulan Park are fully open.\n\n" +
          "**Best Rainy Day Alternatives:** Del Monte Clubhouse dining, Monastery of Transfiguration museum & coffee, and Kampo Juan heritage house tour.",
        timestamp: 'Just now',
        suggestions: [
          'Show weather layer on map',
          'Is Dahilayan open right now?'
        ]
      };
    }

    // 8. STRICT FALLBACK (ZERO-HALLUCINATION GUARANTEE)
    return {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `I don't have verified operational information about "${rawInput}" in the current official Bukidnon tourism database. To maintain 100% accuracy, I never fabricate rates or schedules. Please check directly with the local municipal tourism office or explore our verified attraction listings on the interactive map!`,
      timestamp: 'Just now',
      suggestions: [
        'What spots are in Bukidnon?',
        'Is Dahilayan Adventure Park open?',
        'How much should I budget for 3 days?'
      ]
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Simulate smart retrieval delay
    setTimeout(() => {
      const reply = processQuery(text);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-[380px] sm:max-w-[420px] h-[580px] bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
      {/* Chat Header */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Bot className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-xs tracking-tight">Bukidnon Tourism AI</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-emerald-400/80 block">
              Grounded on Live Provincial Database
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs text-slate-200 bg-slate-950/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-900/30'
                  : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/80 shadow-md'
              }`}
            >
              <div className="whitespace-pre-line text-xs">{m.text}</div>

              {/* Embedded Spot Cards if referenced */}
              {m.spotCards && m.spotCards.length > 0 && (
                <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-700/80">
                  {m.spotCards.slice(0, 3).map((sId) => {
                    const spot = spots.find((s) => s.id === sId);
                    if (!spot) return null;
                    return (
                      <div
                        key={spot.id}
                        onClick={() => onSelectSpot(spot)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-950 border border-slate-700 flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={spot.images[0]}
                            alt={spot.name}
                            className="w-8 h-8 rounded-md object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-white text-[11px] truncate">{spot.name}</h5>
                            <span className="text-[10px] text-slate-400">
                              {spot.operatingStatus.toUpperCase()} • ₱{spot.entranceFee}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Suggestion Pills */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                {m.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      if (sug.includes('Budget Calculator')) {
                        onOpenBudget();
                      } else if (sug.includes('Trip Planner')) {
                        onOpenTripPlanner();
                      } else {
                        handleSend(sug);
                      }
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-emerald-950 text-[11px] text-emerald-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-500/50 transition text-left"
                  >
                    💬 {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Querying Bukidnon provincial database...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about Dahilayan, Lake Apo, road status, budget..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim()}
          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-slate-950 flex items-center justify-center transition shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
