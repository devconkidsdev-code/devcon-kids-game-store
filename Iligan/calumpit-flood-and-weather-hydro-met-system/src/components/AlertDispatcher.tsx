import React, { useState } from 'react';
import { AlertDispatchPayload, AlertSeverity } from '../types';
import { Megaphone, Send, Siren, Mail, Smartphone, Radio, CheckCircle2, AlertTriangle, ShieldAlert, Clock, UserCheck } from 'lucide-react';

interface AlertDispatcherProps {
  currentAlertLevel: AlertSeverity;
  canioganLevel: number;
  rain24hMm: number;
  dispatches: AlertDispatchPayload[];
  onDispatchAlert: (dispatch: Partial<AlertDispatchPayload>) => void;
}

export const AlertDispatcher: React.FC<AlertDispatcherProps> = ({
  currentAlertLevel,
  canioganLevel,
  rain24hMm,
  dispatches,
  onDispatchAlert
}) => {
  const [selectedLevel, setSelectedLevel] = useState<AlertSeverity>(currentAlertLevel);
  const [title, setTitle] = useState(
    currentAlertLevel === 'RED'
      ? 'CRITICAL FLOOD EVENT: Immediate Mandatory Evacuation'
      : currentAlertLevel === 'ORANGE'
      ? 'MDRRMO Pre-Evacuation Alert: Confluence Backflood Active'
      : 'MDRRMO Flood Advisory (Yellow Warning)'
  );

  const [messageTagalog, setMessageTagalog] = useState(
    currentAlertLevel === 'RED'
      ? 'MAHIGPIT NA BABALA NG MDRRMO CALUMPIT: Umabot na sa kritikal na 3.5m ang Caniogan Bridge gauge at patuloy ang pag-apaw ng Bagbag at Pampanga River. Agarang lumikas ang lahat ng residente sa tabing-ilog at mabababang lugar (Frances, San Miguel, Meysulao, Calizon, Sapang Bayan, Gatbuca). Tumawag sa Calumpit Rescue 911 para sa tulong.'
      : currentAlertLevel === 'ORANGE'
      ? 'BABALA NG MDRRMO (ORANGE ALERT): Ang antas ng tubig sa Caniogan Bridge ay umabot sa 2.85m kasabay ng pagpapakawala ng Bustos Dam at parating na high tide. Maghanda ng emergency go-bag at lumipat sa mga nakatalagang evacuation center ang mga taga-Frances, San Miguel, at Meysulao.'
      : 'ALERTO LEVEL 1 (DILAW): Tuloy-tuloy na pag-ulan dulot ng Habagat. Maging alerto sa posibleng pagbaha sa mabababang barangay.'
  );

  const [messageEnglish, setMessageEnglish] = useState(
    currentAlertLevel === 'RED'
      ? 'CALUMPIT MDRRMO CRITICAL FLOOD WARNING: Immediate evacuation recommended for riverside and delta communities. Station 10 gauge exceeded critical capacity (>3.5m). Contact Rescue 911.'
      : currentAlertLevel === 'ORANGE'
      ? 'CALUMPIT MDRRMO PRE-EVACUATION ALERT: River levels rising rapidly due to confluence bottleneck. High-risk barangays (Frances, San Miguel, Meysulao, Calizon) advised to pre-evacuate.'
      : 'CALUMPIT FLOOD ADVISORY: Monitoring Yellow warning status. Low-lying riverside areas stay alert.'
  );

  const [channels, setChannels] = useState<AlertDispatchPayload['channels']>([
    'SMS_TWILIO',
    'EMAIL_SENDGRID',
    'SIREN_BROADCAST',
    'VHF_RADIO'
  ]);

  const [targetRecipients, setTargetRecipients] = useState<string[]>([
    'All 29 Calumpit BDRRMC Captains',
    'Calumpit Rescue 911 Operations Command',
    'Bulacan PDRRMO Emergency Operations Center',
    'Barangay Frances & San Miguel Responders',
    'Registered Community Mobile Numbers (SMS Blast: 4,820 recipients)'
  ]);

  const [isDispatching, setIsDispatching] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Sync preset templates when alert level changes
  const handleLevelChange = (level: AlertSeverity) => {
    setSelectedLevel(level);
    if (level === 'RED') {
      setTitle('CRITICAL FLOOD EVENT: Immediate Mandatory Evacuation');
      setMessageTagalog('MAHIGPIT NA BABALA NG MDRRMO CALUMPIT: Umabot na sa kritikal na 3.5m ang Caniogan Bridge gauge at patuloy ang pag-apaw ng Bagbag at Pampanga River. Agarang lumikas ang lahat ng residente sa tabing-ilog at mabababang lugar (Frances, San Miguel, Meysulao, Calizon, Sapang Bayan, Gatbuca). Tumawag sa Calumpit Rescue 911 para sa tulong.');
      setMessageEnglish('CALUMPIT MDRRMO CRITICAL FLOOD WARNING: Immediate evacuation recommended for riverside and delta communities. Station 10 gauge exceeded critical capacity (>3.5m). Contact Rescue 911.');
    } else if (level === 'ORANGE') {
      setTitle('MDRRMO Pre-Evacuation Alert: Confluence Backflood Active');
      setMessageTagalog('BABALA NG MDRRMO (ORANGE ALERT): Ang antas ng tubig sa Caniogan Bridge ay umabot sa 2.85m kasabay ng pagpapakawala ng Bustos Dam at parating na high tide. Maghanda ng emergency go-bag at lumipat sa mga nakatalagang evacuation center ang mga taga-Frances, San Miguel, at Meysulao.');
      setMessageEnglish('CALUMPIT MDRRMO PRE-EVACUATION ALERT: River levels rising rapidly due to confluence bottleneck. High-risk barangays (Frances, San Miguel, Meysulao, Calizon) advised to pre-evacuate.');
    } else if (level === 'YELLOW') {
      setTitle('MDRRMO Flood Advisory (Yellow Warning)');
      setMessageTagalog('ALERTO LEVEL 1 (DILAW): Tuloy-tuloy na pag-ulan dulot ng Habagat. Maging alerto sa posibleng pagbaha sa mabababang barangay.');
      setMessageEnglish('CALUMPIT FLOOD ADVISORY: Monitoring Yellow warning status. Low-lying riverside areas stay alert.');
    } else {
      setTitle('MDRRMO All-Clear / Baseline Weather Advisory');
      setMessageTagalog('ABISO: Normal ang antas ng tubig sa lahat ng ilog sa Calumpit. Regular na pagsubaybay ay nananatiling aktibo.');
      setMessageEnglish('ADVISORY: Normal water levels in all Calumpit rivers. Routine monitoring continues.');
    }
  };

  const handleToggleChannel = (channel: AlertDispatchPayload['channels'][number]) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);

    setTimeout(() => {
      onDispatchAlert({
        alertLevel: selectedLevel,
        title,
        messageTagalog,
        messageEnglish,
        targetRecipients,
        channels,
        triggeredBy: `Manual Operator Dispatch / Current Caniogan Level: ${canioganLevel.toFixed(2)}m`
      });

      setIsDispatching(false);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    }, 800);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Smart Alert Dispatch Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
                Multi-Channel Gateway
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated SMS (Twilio), SendGrid Email, VHF Radio, and Physical Sirens for Calumpit BDRRMC Network
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Dispatch Compose Form */}
        <div className="lg:col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-red-400" />
              <span>Compose Emergency Broadcast</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Threshold: {canioganLevel.toFixed(2)}m / {rain24hMm}mm
            </span>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-lg text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Broadcast successfully triggered across {channels.length} channels to {targetRecipients.length} groups!
              </span>
            </div>
          )}

          <form onSubmit={handleDispatch} className="space-y-3.5 text-xs">
            {/* Alert Severity Buttons */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Select Alert Protocol Tier
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLevelChange('NORMAL')}
                  className={`py-2 px-2 rounded-lg font-bold border transition-all text-center ${
                    selectedLevel === 'NORMAL'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  NORMAL
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange('YELLOW')}
                  className={`py-2 px-2 rounded-lg font-bold border transition-all text-center ${
                    selectedLevel === 'YELLOW'
                      ? 'bg-yellow-500 text-yellow-950 border-yellow-300 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  YELLOW (1)
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange('ORANGE')}
                  className={`py-2 px-2 rounded-lg font-bold border transition-all text-center ${
                    selectedLevel === 'ORANGE'
                      ? 'bg-amber-500 text-amber-950 border-amber-300 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  ORANGE (2)
                </button>
                <button
                  type="button"
                  onClick={() => handleLevelChange('RED')}
                  className={`py-2 px-2 rounded-lg font-bold border transition-all text-center ${
                    selectedLevel === 'RED'
                      ? 'bg-red-600 text-white border-red-400 font-black animate-pulse'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  RED (3)
                </button>
              </div>
            </div>

            {/* Advisory Title */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Advisory Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Tagalog Broadcast Message */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tagalog Broadcast Body (Public Megaphone & SMS Blast)
              </label>
              <textarea
                rows={3}
                required
                value={messageTagalog}
                onChange={(e) => setMessageTagalog(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-medium focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>

            {/* English Executive Advisory */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                English Dispatch Body (PDRRMO / National Agencies / SendGrid Email)
              </label>
              <textarea
                rows={2}
                required
                value={messageEnglish}
                onChange={(e) => setMessageEnglish(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>

            {/* Channels Selection */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Dispatch Channels Active</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleChannel('SMS_TWILIO')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    channels.includes('SMS_TWILIO')
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS (Twilio)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChannel('EMAIL_SENDGRID')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    channels.includes('EMAIL_SENDGRID')
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email (SendGrid)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChannel('SIREN_BROADCAST')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    channels.includes('SIREN_BROADCAST')
                      ? 'bg-red-600/20 text-red-300 border-red-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <Siren className="w-3.5 h-3.5" />
                  <span>Municipal Siren</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleChannel('VHF_RADIO')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    channels.includes('VHF_RADIO')
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>VHF 142.500</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDispatching}
              className={`w-full py-2.5 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                selectedLevel === 'RED'
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30 font-black uppercase tracking-wide animate-siren'
                  : selectedLevel === 'ORANGE'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
              }`}
            >
              {isDispatching ? (
                <span>Transmitting Alerts Across Gateways...</span>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  <span>
                    Execute {selectedLevel} Alert Broadcast ({channels.length} Channels)
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Dispatch Audit Log & Recipient Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Target Group Checklist */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target BDRRMC Recipients</span>
            </h4>
            <div className="mt-2.5 space-y-1.5 text-xs text-slate-300">
              {targetRecipients.map((recip, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/60 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                  <span>{recip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Dispatches Feed */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recent Alert Broadcasts ({dispatches.length})</span>
            </h4>
            <div className="mt-2.5 space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {dispatches.map((disp) => (
                <div
                  key={disp.id}
                  className="bg-slate-900 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      disp.alertLevel === 'RED'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : disp.alertLevel === 'ORANGE'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}>
                      {disp.alertLevel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{disp.timestamp}</span>
                  </div>
                  <div className="font-semibold text-slate-200 text-xs">{disp.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{disp.messageTagalog}"
                  </p>
                  <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1">
                    <span>Trigger:</span>
                    <span className="text-slate-400 truncate">{disp.triggeredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
