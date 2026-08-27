import React, { useState } from 'react';
import { CheckSquare, Square, Shield, AlertTriangle, Droplets, Zap, HeartPulse, Sparkles } from 'lucide-react';

interface SafetyChecklistProps {
  language: 'tl' | 'en';
}

export const SafetyChecklist: React.FC<SafetyChecklistProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'gobag' | 'preflood' | 'duringflood' | 'postflood'>('gobag');

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'water': true,
    'food': true,
    'firstaid': false,
    'flashlight': true,
    'radio': false,
    'powerbank': true,
    'docs': false,
    'clothes': false,
    'whistle': false,
    'cash': false
  });

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const goBagItems = [
    { key: 'water', en: '1 Gallon drinking water per person/day (3-day supply)', tl: 'Inuming tubig (1 galon bawat tao kada araw, para sa 3 araw)' },
    { key: 'food', en: 'Ready-to-eat non-perishable canned food & biscuits', tl: 'Pagkaing de-lata, biskwit, at pagkaing hindi madaling masira' },
    { key: 'firstaid', en: 'First Aid Kit (Bandages, Betadine, Paracetamol, maintenance meds)', tl: 'First Aid Kit (Gasa, gamot sa lagnat, maintenance meds tulad ng maintenance sa alta presyon)' },
    { key: 'flashlight', en: 'Waterproof Flashlight & extra batteries', tl: 'Waterproof na Flashlight at ekstrang baterya' },
    { key: 'radio', en: 'Battery-operated / hand-crank AM/FM radio for alerts', tl: 'Radyong de-baterya para sa balita at abiso ng MDRRMO' },
    { key: 'powerbank', en: 'Fully charged 20,000mAh mobile power bank', tl: 'Naka-charge na Power Bank para sa cellphone' },
    { key: 'docs', en: 'Important documents in sealed waterproof ziplock bags', tl: 'Mahahalagang dokumento (Birth cert, titulo) sa waterproof plastic pouch' },
    { key: 'clothes', en: 'Change of dry clothes, raincoats, and thermal blankets', tl: 'Pamalit na damit, kapote, at kumot' },
    { key: 'whistle', en: 'Emergency whistle for acoustic rescue signaling', tl: 'Pito (Whistle) para sa pagtawag ng saklolo sa baha' },
    { key: 'cash', en: 'Emergency cash in small denominations', tl: 'Kaunting perang barya at maliliit na papel' }
  ];

  const preFloodProtocols = [
    { title: language === 'tl' ? 'Patayin ang Kuryente' : 'Switch Off Main Breakers', desc: language === 'tl' ? 'Ibaba ang main electrical circuit breaker bago pumasok ang tubig baha sa tahanan.' : 'Switch off main electrical breaker before floodwaters reach wall sockets.' },
    { title: language === 'tl' ? 'Itaas ang mga Gamit' : 'Elevate Appliances & Belongings', desc: language === 'tl' ? 'Ilagay sa ikalawang palapag ang refrigerator, TV, kama, at mahahalagang gamit.' : 'Move refrigerators, electronics, and bedding to upper floors.' },
    { title: language === 'tl' ? 'Alamin ang Sirena ng CBFMMP' : 'Monitor CBFMMP Sirens', desc: language === 'tl' ? 'Makinig sa tunog ng sirena sa inyong barangay para sa mandatory evacuation.' : 'Listen for continuous pulsing sirens indicating forced evacuation.' },
    { title: language === 'tl' ? 'Ihanda ang Alagang Hayop' : 'Secure Pets & Livestock', desc: language === 'tl' ? 'Huwag iwang nakatali ang mga aso, pusa, o hayop. Dalhin sila sa elevated safe grounds.' : 'Untie animals and bring pets to pet-friendly municipal evacuation shelters.' }
  ];

  const duringFloodProtocols = [
    { title: language === 'tl' ? 'Iwasan ang Leptospirosis' : 'Prevent Leptospirosis', desc: language === 'tl' ? 'Huwag lumusong sa baha nang walang bota. Kung may sugat, uminom agad ng Doxycycline ayon sa payo ng doktor.' : 'Never wade barefoot in floodwaters contaminated with rat urine. Consult doctor for prophylaxis.' },
    { title: language === 'tl' ? 'Huwag Maglakad sa Malakas na Agos' : 'Never Walk in Strong Currents', desc: language === 'tl' ? 'Kahit 6 na pulgadang mabilis na agos ng tubig ay kayang magpatumba ng tao.' : 'Just 6 inches of rapid water current can sweep an adult off their feet.' },
    { title: language === 'tl' ? 'Iwasan ang Nakabiting Kable' : 'Stay Clear of Downed Wires', desc: language === 'tl' ? 'Maaaring may live kuryente ang tubig sa paligid ng nakabagsak na linya ng Meralco.' : 'Submerged transformers and downed wires can electrify standing water.' },
    { title: language === 'tl' ? 'Umakyat sa Bubong kung Lalampas sa Tao' : 'Move to Roof if Inundated', desc: language === 'tl' ? 'Kung aabot na sa leeg ang baha, umakyat sa bubong at magwagayway ng matingkad na tela para sa rescue boat.' : 'If water submerges the 2nd floor, move to roof and wave bright fabric for rescue boats.' }
  ];

  const postFloodProtocols = [
    { title: language === 'tl' ? 'Suriin ang Linya ng Kuryente' : 'Inspect Electrical Wiring', desc: language === 'tl' ? 'Huwag bubuksan ang kuryente hangga\'t hindi nasusuri ng lisensyadong elektrisyan kung tuyo na ang mga outlet.' : 'Do not turn on main power until inspected and dried by a licensed electrician.' },
    { title: language === 'tl' ? 'Pakuluan ang Tubig Inumin' : 'Boil All Drinking Water', desc: language === 'tl' ? 'Pakuluan ang tubig nang hindi bababa sa 3 minuto bago inumin dahil sa posibleng kontaminasyon ng poso.' : 'Boil tap/well water for at least 3 minutes to kill coliform & waterborne bacteria.' },
    { title: language === 'tl' ? 'Linisin at I-disinfect ang Bahay' : 'Disinfect Sludge and Silt', desc: language === 'tl' ? 'Gumamit ng bleach (chlorine solution) sa paghuhugas ng putik at sahig upang mapuksa ang mikrobyo.' : 'Scrub flood silt and mud with chlorine bleach solution to eliminate mold and pathogens.' }
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 shadow-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {language === 'tl' ? 'Gabay sa Kaligtasan at Go-Bag Checklist' : 'Resident Flood Safety & Emergency Go-Bag'}
            </h3>
            <p className="text-xs text-neutral-400">
              {language === 'tl'
                ? 'Mga opisyal na tagubilin ng Calumpit MDRRMO para sa bago, habang, at pagkatapos ng baha'
                : 'Actionable protocols for Calumpit households from MDRRMO Bulacan'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('gobag')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'gobag' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Go-Bag (Checklist)
          </button>
          <button
            onClick={() => setActiveTab('preflood')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'preflood' ? 'bg-cyan-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Bago Bumaha' : 'Pre-Flood'}
          </button>
          <button
            onClick={() => setActiveTab('duringflood')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'duringflood' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Habang Bumabaha' : 'During Flood'}
          </button>
          <button
            onClick={() => setActiveTab('postflood')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'postflood' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {language === 'tl' ? 'Pagkatapos' : 'Post-Flood'}
          </button>
        </div>
      </div>

      {/* Tab Content 1: Go-Bag Interactive Checklist */}
      {activeTab === 'gobag' && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-300">
              {language === 'tl' ? 'Naihandang Gamit:' : 'Go-Bag Readiness'}:{' '}
              <strong className="text-emerald-400 font-mono">
                {Object.values(checkedItems).filter(Boolean).length} / {goBagItems.length}
              </strong>
            </span>
            <span className="text-neutral-400">
              {Math.round((Object.values(checkedItems).filter(Boolean).length / goBagItems.length) * 100)}% Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {goBagItems.map((item) => {
              const isChecked = checkedItems[item.key] || false;
              return (
                <div
                  key={item.key}
                  onClick={() => toggleCheck(item.key)}
                  className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition select-none ${
                    isChecked
                      ? 'bg-emerald-950/25 border-emerald-700/60 text-neutral-200'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <button className="mt-0.5 text-emerald-400 shrink-0">
                    {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-neutral-600" />}
                  </button>
                  <span className={isChecked ? 'line-through text-neutral-400 font-normal' : 'font-medium text-white'}>
                    {language === 'tl' ? item.tl : item.en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Pre-Flood Protocols */}
      {activeTab === 'preflood' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {preFloodProtocols.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                {p.title}
              </div>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 3: During Flood Protocols */}
      {activeTab === 'duringflood' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {duringFloodProtocols.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-red-950/20 border border-red-800/40 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                {p.title}
              </div>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 4: Post-Flood Protocols */}
      {activeTab === 'postflood' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {postFloodProtocols.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Droplets className="w-4 h-4 text-amber-400" />
                {p.title}
              </div>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
