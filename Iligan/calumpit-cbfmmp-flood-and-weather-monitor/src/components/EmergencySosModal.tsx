import React, { useState } from 'react';
import { X, LifeBuoy, AlertTriangle, Phone, CheckCircle2, MapPin, Users, HeartPulse, Send } from 'lucide-react';
import { BarangayFloodInfo, EmergencyRescueRequest } from '../types/flood';
import { CALUMPIT_BARANGAY_NAMES, CALUMPIT_HOTLINES } from '../data/calumpitData';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBarangay: BarangayFloodInfo | null;
  language: 'tl' | 'en';
  onSubmitRequest: (req: EmergencyRescueRequest) => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  selectedBarangay,
  language,
  onSubmitRequest
}) => {
  const [barangay, setBarangay] = useState(selectedBarangay?.name || 'Meysulao');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [headcount, setHeadcount] = useState(3);
  const [hasSeniors, setHasSeniors] = useState(false);
  const [hasInfants, setHasInfants] = useState(false);
  const [hasMedicalEmergency, setHasMedicalEmergency] = useState(false);
  const [isStrandedOnRoof, setIsStrandedOnRoof] = useState(false);
  const [floodDepthFeet, setFloodDepthFeet] = useState(selectedBarangay?.floodDepthFeet || 4);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactNumber.trim() || !exactLocation.trim()) return;

    const id = `SOS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRequest: EmergencyRescueRequest = {
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      barangay,
      contactName,
      contactNumber,
      exactLocation,
      headcount,
      hasSeniors,
      hasInfants,
      hasMedicalEmergency,
      isStrandedOnRoof,
      floodDepthFeet,
      status: 'pending',
      notes
    };

    onSubmitRequest(newRequest);
    setTicketId(id);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-red-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-8 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/30 ring-2 ring-red-400">
                <LifeBuoy className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {language === 'tl' ? 'Paghiling ng Saklolo / Rescue SOS' : 'Emergency Rescue & Evacuation Request'}
                </h3>
                <p className="text-xs text-red-300">
                  {language === 'tl'
                    ? 'Direktang ipapadala sa Calumpit MDRRMO Rescue Dispatch & Incident Command'
                    : 'Direct transmission to Calumpit MDRRMO Emergency Operations Center'}
                </p>
              </div>
            </div>

            {/* Emergency Hotline Reminder */}
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                {language === 'tl' ? 'MDRRMO 24/7 Hotline:' : 'MDRRMO 24/7 Hotline:'} <strong>(044) 913-7288</strong>
              </span>
              <a
                href="tel:09178007288"
                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] uppercase tracking-wider"
              >
                Call Now
              </a>
            </div>

            {/* SOS Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Barangay & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-300 block mb-1">
                    {language === 'tl' ? 'Barangay sa Calumpit' : 'Barangay'}: *
                  </label>
                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  >
                    {CALUMPIT_BARANGAY_NAMES.map((b) => (
                      <option key={b} value={b}>Barangay {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-300 block mb-1">
                    {language === 'tl' ? 'Tinatayang Lalim ng Baha (talampakan)' : 'Flood Depth (feet)'}:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={floodDepthFeet}
                    onChange={(e) => setFloodDepthFeet(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Exact Address / Landmark */}
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">
                  {language === 'tl' ? 'Eksaktong Lokasyon / Landmark / Purok' : 'Exact Location / Landmark / House # / Purok'}: *
                </label>
                <input
                  type="text"
                  placeholder={language === 'tl' ? 'Hal. Purok 3, tabi ng kapilya, dilaw na bubong...' : 'e.g. Purok 3, near chapel, yellow roof...'}
                  value={exactLocation}
                  onChange={(e) => setExactLocation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Contact Person & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-300 block mb-1">
                    {language === 'tl' ? 'Pangalan ng Makikipag-ugnayan' : 'Contact Person Name'}: *
                  </label>
                  <input
                    type="text"
                    placeholder="Juan dela Cruz"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-300 block mb-1">
                    {language === 'tl' ? 'Numero ng Telepono / Mobile' : 'Contact Mobile Number'}: *
                  </label>
                  <input
                    type="tel"
                    placeholder="0917-XXX-XXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              {/* Headcount */}
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">
                  {language === 'tl' ? 'Bilang ng mga Tao / Residente na Sasagipin' : 'Number of Persons to Rescue'}: ({headcount})
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Vulnerabilities & Special Conditions */}
              <div>
                <span className="font-semibold text-neutral-300 block mb-1.5">
                  {language === 'tl' ? 'Kondisyon at Prayoridad ng Pamilya' : 'Priority Circumstances'}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSeniors}
                      onChange={(e) => setHasSeniors(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>{language === 'tl' ? 'May Matanda / PWD' : 'Senior / PWD'}</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasInfants}
                      onChange={(e) => setHasInfants(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>{language === 'tl' ? 'May Sanggol / Bata' : 'Infants / Children'}</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMedicalEmergency}
                      onChange={(e) => setHasMedicalEmergency(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span className="text-red-400 font-bold">{language === 'tl' ? 'Kailangan ng Gamot/O2' : 'Medical Emergency'}</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isStrandedOnRoof}
                      onChange={(e) => setIsStrandedOnRoof(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span className="text-red-400 font-bold">{language === 'tl' ? 'Nasa Bubong / Taas' : 'Stranded on Roof'}</span>
                  </label>
                </div>
              </div>

              {/* Urgent Notes */}
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">
                  {language === 'tl' ? 'Iba pang Mahalagang Impormasyon' : 'Additional Notes / Instructions'}:
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'tl' ? 'Hal. May alagang hayop, mabilis ang agos ng tubig...' : 'e.g. Rapid river current, pets on roof...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Submit Button */}
              <button
                id="submit-sos-request-btn"
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'tl' ? 'Ipadala ang Emergency Rescue Request' : 'Transmit SOS Rescue Dispatch'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                DISPATCH TICKET #{ticketId}
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {language === 'tl' ? 'Naipadala ang Hiling ng Pagsagip!' : 'SOS Rescue Request Dispatched!'}
              </h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto mt-2 leading-relaxed">
                {language === 'tl'
                  ? `Nai-log na ang inyong hiling sa Calumpit Incident Management System para sa Barangay ${barangay}. Manatili sa mataas at ligtas na lugar.`
                  : `Your request has been logged into the Calumpit MDRRMO rescue queue for Barangay ${barangay}. Please keep your mobile phone on standby.`}
              </p>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-left text-xs space-y-1.5 text-neutral-300">
              <div><strong>{language === 'tl' ? 'Pangalan' : 'Contact'}:</strong> {contactName} ({contactNumber})</div>
              <div><strong>{language === 'tl' ? 'Lokasyon' : 'Location'}:</strong> {exactLocation}, Brgy. {barangay}</div>
              <div><strong>{language === 'tl' ? 'Bilang ng Tao' : 'Headcount'}:</strong> {headcount} katao</div>
              {isStrandedOnRoof && <div className="text-red-400 font-bold">⚠️ Stranded on Roof (High Priority)</div>}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition"
            >
              {language === 'tl' ? 'Isara' : 'Close Window'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
