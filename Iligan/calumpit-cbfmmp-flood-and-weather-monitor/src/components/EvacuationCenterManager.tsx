import React, { useState } from 'react';
import { Home, Users, CheckCircle2, AlertTriangle, Navigation, Phone, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { BarangayFloodInfo, EvacuationCenter } from '../types/flood';

interface EvacuationCenterManagerProps {
  evacuationCenters: EvacuationCenter[];
  barangays: BarangayFloodInfo[];
  selectedBarangay: BarangayFloodInfo | null;
  language: 'tl' | 'en';
  onSelectBarangay: (b: BarangayFloodInfo) => void;
}

export const EvacuationCenterManager: React.FC<EvacuationCenterManagerProps> = ({
  evacuationCenters,
  barangays,
  selectedBarangay,
  language,
  onSelectBarangay
}) => {
  const [selectedOriginId, setSelectedOriginId] = useState<string>(selectedBarangay?.id || 'meysulao');

  const originBarangay = barangays.find(b => b.id === selectedOriginId) || barangays[0];
  const targetCenter = evacuationCenters.find(ec => ec.id === originBarangay.nearestEvacuationCenterId) || evacuationCenters[0];

  const getRouteGuidance = (b: BarangayFloodInfo, ec: EvacuationCenter) => {
    if (b.roadPassability === 'impassable_boats_only') {
      return {
        mode: language === 'tl' ? 'Pagsagip gamit ang Rubber Boat / Amphibian' : 'Rubber Boat / Amphibian Rescue Only',
        warning: language === 'tl'
          ? `LUBOG ANG KALSONG PAMBAYAN (${b.floodDepthFeet} ft). Huwag maglakad o magmaneho. Tumawag sa MDRRMO para sa rescue boat papuntang ${ec.name}.`
          : `ROAD IS SUBMERGED (${b.floodDepthFeet} ft). Do not attempt walking or driving. Wait for MDRRMO rescue boat staging to ${ec.name}.`,
        steps: [
          language === 'tl' ? `Umakyat sa mataas na palapag o bubong kung kinakailangan habang naghihintay ng rescue boat.` : `Move to 2nd floor or elevated roof platform if water rises above waist.`,
          language === 'tl' ? `Isara ang main electrical breaker at dalhin ang Go-Bag.` : `Switch off main electrical circuit breaker and take waterproof Go-Bag.`,
          language === 'tl' ? `Magtungo sa designated boat loading point sa elevated perimeter.` : `Board official Calumpit Rescue boat toward ${ec.name}.`
        ]
      };
    }

    return {
      mode: language === 'tl' ? 'Mataas na Sasakyan o Paglalakad sa Elevated Dike' : 'High-Clearance Vehicle / Elevated Dike Walkway',
      warning: language === 'tl'
        ? `Mag-ingat sa mga lubak at mabilis na agos sa gilid ng kalsada papuntang ${ec.name}.`
        : `Drive with high-clearance truck or walk in groups along elevated dikes to ${ec.name}.`,
      steps: [
        language === 'tl' ? `Umalis habang maliwanag pa at hindi pa lumalampas sa 2 talampakan ang baha.` : `Evacuate before nighttime and prior to water reaching 2ft threshold.`,
        language === 'tl' ? `Tahakin ang MacArthur Highway / Elevated Provincial Bypass.` : `Follow MacArthur Highway / elevated bypass toward ${ec.address}.`,
        language === 'tl' ? `Magparehistro sa MDRRMO reception desk sa ${ec.name}.` : `Register with the DSWD/MDRRMO desk at ${ec.name}.`
      ]
    };
  };

  const routeGuidance = getRouteGuidance(originBarangay, targetCenter);

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Interactive Evacuation Route Finder */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {language === 'tl' ? 'Tagahanap ng Ligtas na Ruta sa Paglikas' : 'Interactive Evacuation Route Planner'}
            </h3>
            <p className="text-xs text-neutral-400">
              {language === 'tl'
                ? 'Piliin ang iyong barangay upang makita ang pinakamalapit at ligtas na evacuation shelter.'
                : 'Select resident location to view safe high-ground route avoiding flooded choke points.'}
            </p>
          </div>
        </div>

        {/* Origin Barangay Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              {language === 'tl' ? 'Kasalukuyang Barangay ng Residente' : 'Resident Origin Barangay'}:
            </label>
            <select
              id="origin-barangay-select"
              value={selectedOriginId}
              onChange={(e) => {
                setSelectedOriginId(e.target.value);
                const b = barangays.find(item => item.id === e.target.value);
                if (b) onSelectBarangay(b);
              }}
              className="w-full bg-neutral-950 border border-neutral-700 text-white py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:border-cyan-500 font-medium"
            >
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  Barangay {b.name} ({b.floodDepthFeet > 0 ? `${b.floodDepthFeet}ft Baha` : 'Ligtas'})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              {language === 'tl' ? 'Itinalagang Ligtas na Evacuation Center' : 'Designated High-Ground Shelter'}:
            </label>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-700 flex items-center justify-between text-sm">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-emerald-400" />
                {targetCenter.name}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {targetCenter.barangay} • Cap: {targetCenter.capacityPersons}
              </span>
            </div>
          </div>
        </div>

        {/* Route Guidance Card */}
        <div className={`p-4 rounded-xl border ${
          originBarangay.status === 'red'
            ? 'bg-red-950/30 border-red-700/60'
            : 'bg-neutral-800/40 border-neutral-700/40'
        }`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'tl' ? 'Paraan ng Paglikas' : 'Recommended Evacuation Mode'}: {routeGuidance.mode}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Hotline: {targetCenter.contactNumber}
            </span>
          </div>

          <p className="text-xs font-medium text-white mb-3 bg-black/40 p-2.5 rounded-lg border border-neutral-700/60">
            {routeGuidance.warning}
          </p>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              {language === 'tl' ? 'Mga Hakbang sa Paglikas' : 'Step-by-Step Evacuation Protocol'}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {routeGuidance.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Evacuation Centers Status & Capacity Directory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'tl' ? 'Talaan ng mga Evacuation Centers sa Calumpit' : 'Calumpit Evacuation Centers Capacity'}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'tl'
                  ? 'Kasalukuyang bilang ng mga lumikas, pasilidad, generator, at medikal na suporta'
                  : 'Live occupancy rates, emergency facilities, and medical presence'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evacuationCenters.map((ec) => {
            const occupancyPct = Math.round((ec.currentOccupancy / ec.capacityPersons) * 100);
            const isNearFull = occupancyPct >= 85;

            return (
              <div
                key={ec.id}
                id={`ec-card-${ec.id}`}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                        Barangay {ec.barangay}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {ec.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                        {ec.address}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      isNearFull
                        ? 'bg-red-950 text-red-300 border-red-600'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    }`}>
                      {occupancyPct}% {language === 'tl' ? 'Puno' : 'Full'}
                    </span>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="my-3 space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-400">
                        {language === 'tl' ? 'Nakatira' : 'Occupancy'}:{' '}
                        <strong className="text-white">{ec.currentOccupancy}</strong> / {ec.capacityPersons}
                      </span>
                      <span className={isNearFull ? 'text-red-400' : 'text-emerald-400'}>
                        {ec.capacityPersons - ec.currentOccupancy} {language === 'tl' ? 'bakante' : 'slots left'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isNearFull
                            ? 'bg-red-500'
                            : occupancyPct > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Facilities Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ec.facilities.map((fac, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {fac}
                      </span>
                    ))}
                    {ec.petFriendly && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        🐾 Pet-Friendly
                      </span>
                    )}
                    {ec.medicalTeamOnsite && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        🩺 Medical Team
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Phone & Accessibility */}
                <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <Phone className="w-3 h-3" />
                    {ec.contactNumber}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {ec.isAccessible ? (
                      <span className="text-emerald-400">● {language === 'tl' ? 'Madaling Mapasok' : 'Accessible'}</span>
                    ) : (
                      <span className="text-red-400">● {language === 'tl' ? 'Bangka ang gamit' : 'Boats Only'}</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
