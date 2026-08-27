import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TelemetryStation, BarangayStatus, AlertSeverity } from '../types';
import { EVACUATION_CENTERS, SAFE_ROUTES } from '../data/mockData';
import {
  MapPin,
  Layers,
  Info,
  Navigation,
  AlertTriangle,
  Eye,
  ShieldAlert,
  Waves,
  CheckCircle2,
  ChevronRight,
  Compass,
  Building,
  Phone
} from 'lucide-react';

interface ConfluenceMapProps {
  stations: TelemetryStation[];
  barangays: BarangayStatus[];
  onSelectBarangay: (barangay: BarangayStatus) => void;
  onSelectStation: (station: TelemetryStation) => void;
  onOpenEvacuationModal?: (barangayName?: string) => void;
}

export const ConfluenceMap: React.FC<ConfluenceMapProps> = ({
  stations,
  barangays,
  onSelectBarangay,
  onSelectStation,
  onOpenEvacuationModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);
  const barangaysLayerRef = useRef<L.LayerGroup | null>(null);
  const evacLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedItem, setSelectedItem] = useState<{
    type: 'STATION' | 'BARANGAY' | 'EVAC_CENTER' | 'SAFE_ROUTE';
    data: any;
  } | null>(null);

  const [filterMode, setFilterMode] = useState<
    'ALL' | 'EVAC_ROUTES' | 'CRITICAL_ONLY' | 'STATIONS_ONLY'
  >('ALL');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Calumpit Bagbag-Pampanga Confluence
    const map = L.map(mapContainerRef.current, {
      center: [14.920, 120.765],
      zoom: 13,
      minZoom: 11,
      maxZoom: 17,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // River Confluence Polylines
    // 1. Bagbag River (Angat Confluence Channel)
    const bagbagRiver = L.polyline(
      [
        [14.902, 120.805], // Upstream Pulilan/Baliuag
        [14.908, 120.785],
        [14.9125, 120.7680], // Stn 10 Caniogan Bridge
        [14.915, 120.763],
        [14.9189, 120.7628] // Meets Pampanga River at Calumpit Bridge
      ],
      { color: '#06b6d4', weight: 6, opacity: 0.85, dashArray: '8, 4' }
    ).addTo(map);
    bagbagRiver.bindTooltip('Bagbag River (Angat Confluence Channel)', {
      permanent: false,
      className: 'bg-slate-900 text-cyan-300 font-mono text-xs border-cyan-800'
    });

    // 2. Pampanga River Main Channel (Flowing south from Sulipan/Candaba)
    const pampangaRiver = L.polyline(
      [
        [14.955, 120.752], // From Apalit
        [14.9385, 120.7570], // Sulipan Stn
        [14.931, 120.764], // Frances
        [14.9189, 120.7628], // Confluence Point
        [14.910, 120.755], // Downstream towards Hagonoy / Labangan
        [14.895, 120.748],
        [14.880, 120.740] // Outlet towards Manila Bay
      ],
      { color: '#3b82f6', weight: 8, opacity: 0.85 }
    ).addTo(map);
    pampangaRiver.bindTooltip('Pampanga River (Lower Delta Channel)', {
      permanent: false,
      className: 'bg-slate-900 text-blue-300 font-mono text-xs border-blue-800'
    });

    // Dedicated Leaflet Layer Groups for clear separation
    const stationsLayer = L.layerGroup().addTo(map);
    const barangaysLayer = L.layerGroup().addTo(map);
    const evacLayer = L.layerGroup().addTo(map);
    const routesLayer = L.layerGroup().addTo(map);

    stationsLayerRef.current = stationsLayer;
    barangaysLayerRef.current = barangaysLayer;
    evacLayerRef.current = evacLayer;
    routesLayerRef.current = routesLayer;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Layer Groups when data or filterMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const stationsLayer = stationsLayerRef.current;
    const barangaysLayer = barangaysLayerRef.current;
    const evacLayer = evacLayerRef.current;
    const routesLayer = routesLayerRef.current;

    if (!map || !stationsLayer || !barangaysLayer || !evacLayer || !routesLayer) return;

    stationsLayer.clearLayers();
    barangaysLayer.clearLayers();
    evacLayer.clearLayers();
    routesLayer.clearLayers();

    // 1. Telemetry Stations Layer
    if (filterMode === 'ALL' || filterMode === 'STATIONS_ONLY') {
      stations.forEach((stn) => {
        const isCaniogan = stn.id === 'stn-10-caniogan';
        const isPws = stn.type === 'WEATHER_STATION';

        let markerColor = '#06b6d4';
        if (isCaniogan)
          markerColor =
            stn.currentWaterLevel && stn.currentWaterLevel >= 3.5
              ? '#ef4444'
              : stn.currentWaterLevel && stn.currentWaterLevel >= 2.5
              ? '#f59e0b'
              : '#06b6d4';
        if (isPws) markerColor = '#818cf8';

        const customIcon = L.divIcon({
          className: 'custom-station-pin',
          html: `
            <div style="
              background: ${markerColor};
              width: ${isCaniogan ? '28px' : '22px'};
              height: ${isCaniogan ? '28px' : '22px'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              border: 2px solid white;
              box-shadow: 0 0 14px ${markerColor};
              cursor: pointer;
            ">
              ${isPws ? 'P' : isCaniogan ? '10' : 'S'}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(stn.coordinates, { icon: customIcon }).addTo(stationsLayer);

        marker.on('click', () => {
          setSelectedItem({ type: 'STATION', data: stn });
          onSelectStation(stn);
        });

        marker.bindTooltip(
          `
          <div class="text-xs p-1">
            <div class="font-bold text-slate-100">${stn.name}</div>
            <div class="text-cyan-400 font-mono">${stn.river || stn.type}</div>
            ${
              stn.currentWaterLevel !== undefined
                ? `<div class="text-amber-300 font-bold font-mono mt-0.5">Level: ${stn.currentWaterLevel.toFixed(
                    2
                  )}m (Max: ${stn.staffGaugeMax || 3.5}m)</div>`
                : ''
            }
          </div>
        `,
          { className: 'bg-slate-900 text-slate-200 border-slate-700' }
        );
      });
    }

    // 2. Vulnerable Barangays Layer
    if (filterMode === 'ALL' || filterMode === 'CRITICAL_ONLY') {
      barangays.forEach((brgy) => {
        if (
          filterMode === 'CRITICAL_ONLY' &&
          brgy.warningStatus !== 'RED' &&
          brgy.warningStatus !== 'ORANGE'
        ) {
          return;
        }

        let bgHex = '#10b981';
        if (brgy.warningStatus === 'RED') bgHex = '#ef4444';
        else if (brgy.warningStatus === 'ORANGE') bgHex = '#f59e0b';
        else if (brgy.warningStatus === 'YELLOW') bgHex = '#eab308';

        // Add semi-transparent flood risk circle
        L.circle(brgy.coordinates, {
          radius: brgy.warningStatus === 'RED' ? 450 : brgy.warningStatus === 'ORANGE' ? 350 : 250,
          color: bgHex,
          fillColor: bgHex,
          fillOpacity: brgy.warningStatus === 'RED' ? 0.28 : 0.15,
          weight: 1.5
        }).addTo(barangaysLayer);

        const brgyIcon = L.divIcon({
          className: 'custom-brgy-pin',
          html: `
            <div style="
              background: ${bgHex};
              padding: 2px 7px;
              border-radius: 9999px;
              color: white;
              font-weight: bold;
              font-size: 10px;
              font-family: monospace;
              border: 1px solid rgba(255,255,255,0.7);
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
              white-space: nowrap;
              cursor: pointer;
            ">
              ${brgy.name}: ${brgy.floodHeightInches}"
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        });

        const marker = L.marker(brgy.coordinates, { icon: brgyIcon }).addTo(barangaysLayer);

        marker.on('click', () => {
          setSelectedItem({ type: 'BARANGAY', data: brgy });
          onSelectBarangay(brgy);
        });
      });
    }

    // 3. Evacuation Centers Layer
    if (filterMode === 'ALL' || filterMode === 'EVAC_ROUTES') {
      EVACUATION_CENTERS.forEach((center) => {
        const pct = Math.round((center.currentOccupancy / center.capacity) * 100);

        const evacIcon = L.divIcon({
          className: 'custom-evac-map-pin',
          html: `
            <div style="
              background: #059669;
              width: 26px;
              height: 26px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
              border: 2px solid #a7f3d0;
              box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
              cursor: pointer;
            ">
              ⌂
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(center.coordinates, { icon: evacIcon }).addTo(evacLayer);

        marker.on('click', () => {
          setSelectedItem({ type: 'EVAC_CENTER', data: center });
        });

        marker.bindTooltip(
          `
          <div class="text-xs p-1 space-y-1">
            <div class="font-bold text-emerald-400">${center.name}</div>
            <div class="text-slate-300 font-mono text-[11px]">${center.structureType}</div>
            <div class="text-cyan-300 font-mono font-bold">Occupancy: ${center.currentOccupancy} / ${center.capacity} (${pct}%)</div>
            <div class="text-emerald-300 text-[10px]">Click to inspect shelter details</div>
          </div>
        `,
          { className: 'bg-slate-950 text-slate-200 border-slate-700' }
        );
      });

      // 4. Safe Routes Layer
      SAFE_ROUTES.forEach((route) => {
        const isBoat = route.routeType === 'BOAT_RESCUE_CHANNEL';
        const isElevated = route.routeType === 'ELEVATED_CAUSEWAY';
        const routeColor = isBoat ? '#06b6d4' : isElevated ? '#a855f7' : '#10b981';

        const polyline = L.polyline(route.pathCoordinates, {
          color: routeColor,
          weight: 4,
          opacity: 0.8,
          dashArray: isBoat ? '6, 6' : isElevated ? '4, 4' : undefined
        }).addTo(routesLayer);

        polyline.on('click', () => {
          setSelectedItem({ type: 'SAFE_ROUTE', data: route });
        });

        polyline.bindTooltip(
          `
          <div class="text-xs p-1">
            <div class="font-bold text-emerald-300">${route.name}</div>
            <div class="text-cyan-400 font-mono">${route.distanceKm} km • ~${route.estimatedTravelTimeMins} mins</div>
            <div class="text-[10px] text-slate-300 mt-0.5">${route.routeType.replace(/_/g, ' ')}</div>
          </div>
        `,
          { className: 'bg-slate-950 text-slate-200 border-slate-700' }
        );
      });
    }
  }, [stations, barangays, filterMode]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Top Map Controls */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Angat-Pampanga Confluence & Barangay Flood GIS
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Leaflet GIS • Bagbag River Bottleneck • Evacuation Layer Groups
            </p>
          </div>
        </div>

        {/* Action Button & Filter Layers */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenEvacuationModal && (
            <button
              onClick={() => onOpenEvacuationModal()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Evacuation & Safe Routes Navigator</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'ALL'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setFilterMode('EVAC_ROUTES')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'EVAC_ROUTES'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Evac & Routes
            </button>
            <button
              onClick={() => setFilterMode('CRITICAL_ONLY')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'CRITICAL_ONLY'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Critical Risk
            </button>
            <button
              onClick={() => setFilterMode('STATIONS_ONLY')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'STATIONS_ONLY'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stations
            </button>
          </div>
        </div>
      </div>

      {/* Map + Detail Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
        {/* Map View */}
        <div className="lg:col-span-3 relative h-[420px] lg:h-[500px]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Legend Overlay */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 shadow-lg text-[11px] space-y-1.5 backdrop-blur-sm pointer-events-none max-w-[210px]">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
              GIS Layer Groups
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-cyan-400 rounded"></span>
              <span className="text-slate-300">Bagbag River (Angat)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-blue-500 rounded"></span>
              <span className="text-slate-300">Pampanga Main Delta</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600 flex items-center justify-center text-[9px] text-white font-bold">⌂</span>
              <span className="text-slate-300">Evacuation Center</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-400 rounded"></span>
              <span className="text-slate-300">Safe High-Ground Route</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-300">Red Alert Barangay</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">CBFMMP River Gauges</span>
            </div>
          </div>
        </div>

        {/* Selected Inspector Drawer */}
        <div className="bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  {selectedItem.type === 'STATION'
                    ? 'Telemetry Station'
                    : selectedItem.type === 'EVAC_CENTER'
                    ? 'Evacuation Facility'
                    : selectedItem.type === 'SAFE_ROUTE'
                    ? 'Designated Safe Route'
                    : 'Barangay Risk Profile'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    'warningStatus' in selectedItem.data &&
                    selectedItem.data.warningStatus === 'RED'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : selectedItem.type === 'EVAC_CENTER'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {'warningStatus' in selectedItem.data
                    ? selectedItem.data.warningStatus
                    : selectedItem.type === 'EVAC_CENTER'
                    ? 'OPEN'
                    : 'ACTIVE'}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-100">
                  {selectedItem.data.name}
                </h4>
                {'details' in selectedItem.data && selectedItem.data.details && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {selectedItem.data.details}
                  </p>
                )}
                {'structureType' in selectedItem.data && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedItem.data.structureType} ({selectedItem.data.elevationMslMeters}m MSL)
                  </p>
                )}
              </div>

              {/* Station Specific Metrics */}
              {selectedItem.type === 'STATION' && (
                <div className="space-y-2 text-xs">
                  {'currentWaterLevel' in selectedItem.data &&
                    selectedItem.data.currentWaterLevel !== undefined && (
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Current Water Level</span>
                        <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                          {selectedItem.data.currentWaterLevel.toFixed(2)}m
                          {'staffGaugeMax' in selectedItem.data && (
                            <span className="text-xs text-slate-400 font-normal">
                              {' '}
                              / {selectedItem.data.staffGaugeMax}m Max Gauge
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {'rain24hMm' in selectedItem.data && (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between">
                      <span className="text-slate-400">24-Hr Cumulative Rain</span>
                      <span className="font-bold font-mono text-slate-200">
                        {selectedItem.data.rain24hMm} mm
                      </span>
                    </div>
                  )}

                  {'rainRateMmHr' in selectedItem.data && (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Instant Rain Rate</span>
                      <span className="font-bold font-mono text-cyan-400">
                        {selectedItem.data.rainRateMmHr} mm/h
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Barangay Specific Metrics */}
              {selectedItem.type === 'BARANGAY' && 'floodHeightInches' in selectedItem.data && (
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Flood Inundation Height</span>
                    <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                      {selectedItem.data.floodHeightInches} inches
                      <span className="text-xs text-slate-400 font-normal">
                        {' '}
                        ({selectedItem.data.floodHeightMeters}m)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Road Passability</span>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {selectedItem.data.roadPassability.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Evacuation Center</span>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {selectedItem.data.evacuationCenter.name}
                    </div>
                    <div className="text-[11px] text-cyan-400 mt-0.5 font-mono">
                      Occupancy: {selectedItem.data.evacuationCenter.currentOccupancy} /{' '}
                      {selectedItem.data.evacuationCenter.capacity}
                    </div>
                  </div>

                  {onOpenEvacuationModal && (
                    <button
                      onClick={() => onOpenEvacuationModal(selectedItem.data.name)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>View Safe Evacuation Path</span>
                    </button>
                  )}
                </div>
              )}

              {/* Evac Center Specific Metrics */}
              {selectedItem.type === 'EVAC_CENTER' && (
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Shelter Capacity</span>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                      {selectedItem.data.currentOccupancy} / {selectedItem.data.capacity} (
                      {selectedItem.data.capacity - selectedItem.data.currentOccupancy} Available)
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Contact Officer</span>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {selectedItem.data.contactPerson}
                    </div>
                    <div className="text-[11px] text-cyan-400 font-mono">
                      {selectedItem.data.contactNumber}
                    </div>
                  </div>

                  {onOpenEvacuationModal && (
                    <button
                      onClick={() => onOpenEvacuationModal(selectedItem.data.barangay)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Open Turn-by-Turn Navigator</span>
                    </button>
                  )}
                </div>
              )}

              {/* Safe Route Specific Metrics */}
              {selectedItem.type === 'SAFE_ROUTE' && (
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Route Type & Distance</span>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {selectedItem.data.routeType.replace(/_/g, ' ')} ({selectedItem.data.distanceKm} km)
                    </div>
                    <div className="text-cyan-400 font-mono text-[11px]">
                      Est. Time: ~{selectedItem.data.estimatedTravelTimeMins} mins
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Tagalog Instructions</span>
                    <p className="text-slate-300 italic text-[11px] mt-1 leading-relaxed">
                      "{selectedItem.data.instructionsTagalog}"
                    </p>
                  </div>

                  {onOpenEvacuationModal && (
                    <button
                      onClick={() => onOpenEvacuationModal(selectedItem.data.originBarangay)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Open Full Guidance Modal</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 my-auto">
              <MapPin className="w-8 h-8 mb-2 text-slate-600 animate-pulse" />
              <p className="text-xs font-semibold text-slate-300">Click any Station, Barangay, or Evac Route</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Inspect local staff gauge readings, confluence flood depths, and designated safe evacuation routes.
              </p>
              {onOpenEvacuationModal && (
                <button
                  onClick={() => onOpenEvacuationModal()}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Launch Evacuation Navigator</span>
                </button>
              )}
            </div>
          )}

          {/* Calumpit Confluence Info Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Waves className="w-3.5 h-3.5" />
              <span>Confluence Bottleneck Note</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Angat River meets Pampanga River via the Bagbag channel. When Pampanga basin fills, Angat release cannot discharge and backs up into Calumpit center.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
