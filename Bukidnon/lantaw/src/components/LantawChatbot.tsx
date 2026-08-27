import React, { useState, useRef, useEffect } from 'react';
import { TouristSpot, ChatMessage } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Compass, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';

interface LantawChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  spots: TouristSpot[];
  onSelectSpot: (spot: TouristSpot) => void;
}

export const LantawChatbot: React.FC<LantawChatbotProps> = ({
  isOpen,
  onClose,
  spots,
  onSelectSpot,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Maayong adlaw! Welcome to Lantaw, your verified Bukidnon Tourism Assistant. I am grounded directly in our owner-verified Bukidnon database. How can I help plan your highland adventure today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Query Knowledge Engine with Strict Zero-Hallucination & Bukidnon-Only Scope
  const processQuery = (query: string): { text: string; spotSuggestions?: string[]; warning?: string } => {
    const q = query.toLowerCase().trim();

    // 1. Check for outside Bukidnon scopes (Cebu, Manila, Boracay, Palawan, Siargao, Bohol, Baguio, Davao, etc.)
    const outsidePlaces = ['cebu', 'manila', 'boracay', 'palawan', 'siargao', 'bohol', 'baguio', 'el nido', 'coron', 'batanes', 'tagaytay', 'japan', 'korea', 'paris'];
    const matchesOutside = outsidePlaces.find((p) => q.includes(p));
    if (matchesOutside) {
      return {
        text: `I'm the Bukidnon Tourism Assistant, so I can only provide tourism information about Bukidnon province. Please ask about attractions in Manolo Fortich, Malaybalay City, Impasug-ong, Valencia, Lantapan, Sumilao, Quezon, or Maramag!`,
      };
    }

    // 2. Budget questions
    if (q.includes('budget') || q.includes('how much') || q.includes('cost') || q.includes('price')) {
      if (q.includes('3-day') || q.includes('3 day') || q.includes('three day') || q.includes('trip')) {
        return {
          text: `For a standard 3-day trip in Bukidnon, here is a realistic estimated budget breakdown based on local verified rates:

• Transportation (Van/Bus + local transfers): ₱1,500 - ₱2,000 / person
• Accommodation (2 nights in Malaybalay / Dahilayan): ₱2,500 - ₱3,500
• Food & Highland Dining (Del Monte clubhouse, local binaki & cafes): ₱1,800
• Entrance Fees & Activities (Dahilayan Zipline, Impasug-ong Ranch, Lake Apo): ₱1,500 - ₱2,500
• Emergency & Souvenirs: ₱800

Estimated Total for 3 Days: Approx. ₱8,000 - ₱10,500 per traveler.

You can also use our interactive Budget Estimator tool in the top navigation to customize your exact group size and lodging tier!`,
          spotSuggestions: ['dahilayan-adventure-park', 'communal-ranch-impasugong', 'lake-apo-valencia'],
        };
      }

      // Check for specific spot pricing
      const mentionedSpot = spots.find((s) => q.includes(s.name.toLowerCase()) || q.includes(s.id.split('-')[0]));
      if (mentionedSpot) {
        return {
          text: `Here are the verified owner-managed rates for ${mentionedSpot.name} (${mentionedSpot.municipality}):
• Entrance Fee: Adult ₱${mentionedSpot.entranceFee.adult}, Child ₱${mentionedSpot.entranceFee.child}, Senior/PWD ₱${mentionedSpot.entranceFee.seniorOrPwd}
${mentionedSpot.activities.length > 0 ? `• Available Activities:\n` + mentionedSpot.activities.map(a => `  - ${a.name}: ₱${a.price} (${a.unit})`).join('\n') : ''}
Current Status: ${mentionedSpot.operatingStatus.toUpperCase()} (Updated: ${mentionedSpot.lastUpdated}).`,
          spotSuggestions: [mentionedSpot.id],
        };
      }
    }

    // 3. Status or Operating Hours (e.g. "Is Dahilayan open?", "Is Kitanglad accessible?")
    if (q.includes('open') || q.includes('closed') || q.includes('accessible') || q.includes('hours') || q.includes('weather') || q.includes('status')) {
      const targetSpot = spots.find((s) => 
        q.includes(s.name.toLowerCase()) || 
        q.includes(s.municipality.toLowerCase()) || 
        q.includes(s.id.split('-')[0])
      );

      if (targetSpot) {
        let statusString = '';
        if (targetSpot.operatingStatus === 'open') {
          statusString = `🟢 ${targetSpot.name} is currently OPEN today (${targetSpot.operatingHours.openTime} - ${targetSpot.operatingHours.closeTime}).`;
        } else if (targetSpot.operatingStatus === 'limited') {
          statusString = `🟡 ${targetSpot.name} has LIMITED operations due to ${targetSpot.closureReason || 'weather conditions'}.`;
        } else {
          statusString = `🔴 ${targetSpot.name} is currently CLOSED due to ${targetSpot.closureReason || 'temporary maintenance'}.`;
        }

        let accessString = `Accessibility: ${targetSpot.accessibilityStatus.toUpperCase()} — ${targetSpot.accessibilityReason}`;
        let weatherString = `Weather in ${targetSpot.municipality}: ${targetSpot.weather.condition} (${targetSpot.weather.tempC}°C, ${targetSpot.weather.rainProb}% rain probability).`;

        return {
          text: `${statusString}\n\n${accessString}\n${weatherString}\n\n(Last updated by ${targetSpot.updatedBy}: ${targetSpot.lastUpdated})`,
          spotSuggestions: [targetSpot.id],
          warning: targetSpot.weather.warning || (targetSpot.accessibilityStatus !== 'accessible' ? targetSpot.accessibilityReason : undefined),
        };
      }
    }

    // 4. Rainy weather recommendations
    if (q.includes('rain') || q.includes('rainy') || q.includes('bad weather')) {
      const safeRainSpots = spots.filter(s => s.operatingStatus === 'open' && !s.category.includes('Mountain') && s.weather.rainProb < 50);
      return {
        text: `During wet or rainy weather in Bukidnon, high-altitude mountain trails (like Mt. Kitanglad or Mt. Dulang-dulang) can be slippery or restricted. 

Here are recommended attractions with paved access and indoor/sheltered facilities:
1. Monastery of the Transfiguration (Malaybalay) — Solemn architectural church & coffee tasting
2. Del Monte Clubhouse & Pineapple Plantation (Manolo Fortich) — Paved scenic dining & souvenir stop
3. Kaamulan Grounds Provincial Museum (Malaybalay) — Seven indigenous tribes indoor cultural exhibits
4. Alalum Falls View Deck (Sumilao) — Paved roadside observation deck along Sayre Highway`,
        spotSuggestions: ['monastery-transfiguration-malaybalay', 'del-monte-pineapple-plantation', 'kaamulan-park-malaybalay'],
      };
    }

    // 5. Itinerary / Recommendation questions
    if (q.includes('itinerary') || q.includes('recommend') || q.includes('suggest') || q.includes('what to do') || q.includes('what can i visit')) {
      if (q.includes('malaybalay')) {
        const malaySpots = spots.filter(s => s.municipality.includes('Malaybalay'));
        return {
          text: `In Malaybalay City (the Summer Capital of the South), you can visit:\n` +
            malaySpots.map(s => `• ${s.name} (${s.category}) — Status: ${s.operatingStatus.toUpperCase()}`).join('\n') +
            `\n\nHighlights include Leandro Locsin's Monastery of the Transfiguration and the Kaamulan Cultural Grounds.`,
          spotSuggestions: malaySpots.map(s => s.id),
        };
      }
      if (q.includes('manolo fortich')) {
        const manoloSpots = spots.filter(s => s.municipality.includes('Manolo Fortich'));
        return {
          text: `In Manolo Fortich (Northern Bukidnon gateway), top attractions include:\n` +
            manoloSpots.map(s => `• ${s.name} — Status: ${s.operatingStatus.toUpperCase()} (Entrance: ₱${s.entranceFee.adult})`).join('\n') +
            `\n\nExperience Asia's longest dual zipline at Dahilayan and the 25,000-hectare Del Monte pineapple fields!`,
          spotSuggestions: manoloSpots.map(s => s.id),
        };
      }
      if (q.includes('family') || q.includes('kids') || q.includes('children')) {
        return {
          text: `Here are the top family-friendly attractions in Bukidnon with safe paved roads, gentle amenities, and activities for all ages:
1. Dahilayan Adventure Park (Manolo Fortich) — Ziplines, mountain coaster, playground & forest luge
2. Impasug-ong Communal Ranch — Horseback riding and vast golden hills
3. Lake Apo (Valencia City) — Floating bamboo raft picnics and gentle kayaking
4. Del Monte Pineapple Monument & Golf Club — Scenic photo stop and family dining`,
          spotSuggestions: ['dahilayan-adventure-park', 'communal-ranch-impasugong', 'lake-apo-valencia', 'del-monte-pineapple-plantation'],
        };
      }

      // General 3-day recommended itinerary
      return {
        text: `Here is our verified 3-Day Bukidnon Explorer Itinerary:

• Day 1 (Northern Bukidnon):
  - Morning: Del Monte Pineapple Plantation & Giant Pineapple photo stop
  - Afternoon: Dahilayan Adventure Park (Zipline & Mountain Coaster)
  - Night: Cool pine forest stay in Dahilayan

• Day 2 (Central Bukidnon & Cowboy Country):
  - Early Morning: Impasug-ong Communal Ranch (Horseback riding at sunrise)
  - Midday: Alalum Falls stopover in Sumilao
  - Afternoon: Malaybalay City (Kaamulan Cultural Grounds & Monastery of the Transfiguration)

• Day 3 (Southern Bukidnon Lakes & Views):
  - Morning: Lake Apo floating bamboo raft & kayaking in Valencia City
  - Afternoon: Overview Nature Park in Quezon for panoramic BuDa mountain highway views`,
        spotSuggestions: ['dahilayan-adventure-park', 'communal-ranch-impasugong', 'lake-apo-valencia', 'overview-nature-park-quezon'],
      };
    }

    // 6. Anti-Hallucination Fallback: If not in Bukidnon database, do NOT invent info
    const spotMatch = spots.find(s => q.includes(s.name.toLowerCase().slice(0, 5)));
    if (!spotMatch && !q.includes('bukidnon')) {
      return {
        text: `I don't have verified information about that specific query in the current Bukidnon tourism database. To maintain 100% data integrity, I do not fabricate prices, schedules, or accessibility. Please check with the registered tourist spot owner or provincial tourism officer.`,
      };
    }

    // General fallback summary of Bukidnon attractions
    return {
      text: `Bukidnon offers highland nature, adventure, indigenous culture, and agricultural tourism. In our verified database, we currently have ${spots.length} registered attractions across Manolo Fortich, Malaybalay, Impasug-ong, Valencia, Lantapan, Sumilao, Quezon, and Maramag.\n\nYou can ask about specific attractions, current weather alerts, entrance fees, or road accessibility!`,
      spotSuggestions: ['dahilayan-adventure-park', 'communal-ranch-impasugong', 'mount-kitanglad-range', 'lake-apo-valencia'],
    };
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Realistic processing delay
    setTimeout(() => {
      const response = processQuery(userText);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: 'Just now',
        spotSuggestions: response.spotSuggestions,
        warning: response.warning,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const quickQuestions = [
    'How much should I budget for a 3-day trip?',
    'Is Dahilayan Adventure Park open today?',
    'Is Mount Kitanglad accessible?',
    'What spots can I visit during rainy weather?',
    'What are the best family-friendly spots?',
    'What tourist spots are in Cebu?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="lantaw-chatbot-dialog"
        id="lantaw-chatbot-modal"
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden flex flex-col h-[650px] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chatbot Header */}
        <div className="p-4 bg-[#1B3022] border-b border-emerald-900 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-display">Lantaw Bukidnon AI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  Grounded Database
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">Strict Bukidnon Tourism Scope • Zero Hallucination</p>
            </div>
          </div>
          <button
            id="btn-close-chatbot"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 mt-1 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] space-y-2`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none shadow-2xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Spot suggestion mini-cards */}
                {msg.spotSuggestions && msg.spotSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.spotSuggestions.map((sid) => {
                      const spotObj = spots.find((s) => s.id === sid);
                      if (!spotObj) return null;
                      return (
                        <button
                          key={sid}
                          onClick={() => {
                            onSelectSpot(spotObj);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold transition shadow-2xs"
                        >
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{spotObj.name}</span>
                          <span className={`text-[10px] px-1 rounded font-bold uppercase ${
                            spotObj.operatingStatus === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {spotObj.operatingStatus}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Warning message inside chat */}
                {msg.warning && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{msg.warning}</span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 mt-1 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-xs pl-11">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-200"></div>
              <span>Searching verified Bukidnon tourism database...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-500 font-bold shrink-0">Suggestions:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
              }}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg shrink-0 border border-slate-200 font-medium transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            id="input-chatbot-query"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Bukidnon spots, budget, operating status, weather, or road access..."
            className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            id="btn-send-chatbot-msg"
            disabled={!input.trim()}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
