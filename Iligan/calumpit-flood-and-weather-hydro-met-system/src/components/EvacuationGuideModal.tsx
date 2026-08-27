import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BarangayStatus, EvacuationCenterDetail, SafeRoute } from '../types';
import { EVACUATION_CENTERS, SAFE_ROUTES } from '../data/mockData';
import {
  X,
  MapPin,
  Navigation,
  Shield,
  Phone,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  Truck,
  Building,
  Zap,
  Activity,
  Layers,
  Copy,
  Check,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface EvacuationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  barangays: BarangayStatus[];
  initialBarangayName?: string;
}

export const EvacuationGuideModal: React.FC<EvacuationGuideModalProps> = ({
  isOpen,
  onClose,
  barangays,
  initialBarangayName
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs for Leaflet
  const evacCentersLayerRef = useRef<L.LayerGroup | null>(null);
  const safeRoutesLayerRef = useRef<L.LayerGroup | null>(null);
  const stagingPointsLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardZonesLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedBarangayName, setSelectedBarangayName] = useState<string>(
    initialBarangayName || 'Frances'
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-frances-boat');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('evac-frances-nhs');
  const [copied, setCopied] = useState(false);

  // Layer Visibility States
  const [showEvacCenters, setShowEvacCenters] = useState(true);
  const [showSafeRoutes, setShowSafeRoutes] = useState(true);
  const [showStagingPoints, setShowStagingPoints] = useState(true);
  const [showHazardZones, setShowHazardZones] = useState(true);

  const activeRoute = SAFE_ROUTES.find((r) => r.id === selectedRouteId) || SAFE_ROUTES[0];
  const activeCenter = EVACUATION_CENTERS.find((c) => c.id === selectedCenterId) || EVACUATION_CENTERS[0];

  // If initial barangay changes, update selected
  useEffect(() => {
    if (initialBarangayName) {
      setSelectedBarangayName(initialBarangayName);
      const matchedRoute = SAFE_ROUTES.find(
        (r) => r.originBarangay.toLowerCase() === initialBarangayName.toLowerCase()
      );
      if (matchedRoute) {
        setSelectedRouteId(matchedRoute.id);
        setSelectedCenterId(matchedRoute.destinationCenterId);
      }
    }
  }, [initialBarangayName]);

  // When barangay selector changes, find corresponding route and center
  const handleBarangayChange = (brgyName: string) => {
    setSelectedBarangayName(brgyName);
    const matchedRoute = SAFE_ROUTES.find(
      (r) => r.originBarangay.toLowerCase() === brgyName.toLowerCase()
    );
    if (matchedRoute) {
      setSelectedRouteId(matchedRoute.id);
      setSelectedCenterId(matchedRoute.destinationCenterId);
      if (mapInstanceRef.current && matchedRoute.pathCoordinates.length > 0) {
        mapInstanceRef.current.flyTo(matchedRoute.pathCoordinates[0], 14, { duration: 1.2 });
      }
    } else {
      // Default to municipal gym
      setSelectedCenterId('evac-mun-gym');
    }
  };

  // Copy tactical advisory for megaphone/SMS broadcast
  const handleCopyAdvisory = () => {
    const text = `🚨 [CALUMPIT BDRRMC EVACUATION ROUTE ADVISORY - BRGY. ${selectedBarangayName.toUpperCase()}]
Destination Shelter: ${activeCenter.name}
Safe Route: ${activeRoute.name}
Travel Method: ${activeRoute.routeType.replace(/_/g, ' ')} (${activeRoute.distanceKm} km ~ ${activeRoute.estimatedTravelTimeMins} mins)
Tagalog Guidance: ${activeRoute.instructionsTagalog}
Shelter Contact: ${activeCenter.contactPerson} (${activeCenter.contactNumber})
Emergency Hotline: 911 / Calumpit MDRRMO Operations`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Allow modal DOM to render before initializing map
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        return;
      }

      const map = L.map(mapContainerRef.current, {
        center: [14.922, 120.764],
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Carto basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // River overlays
      const pampangaRiver = L.polyline(
        [
          [14.955, 120.752],
          [14.9385, 120.757],
          [14.931, 120.764],
          [14.9189, 120.7628],
          [14.91, 120.755],
          [14.895, 120.748],
          [14.88, 120.74]
        ],
        { color: '#1e40af', weight: 8, opacity: 0.6 }
      ).addTo(map);
      pampangaRiver.bindTooltip('Pampanga River Channel', { className: 'bg-slate-900 text-blue-300 text-xs' });

      const bagbagRiver = L.polyline(
        [
          [14.902, 120.805],
          [14.908, 120.785],
          [14.9125, 120.768],
          [14.915, 120.763],
          [14.9189, 120.7628]
        ],
        { color: '#0e7490', weight: 6, opacity: 0.65, dashArray: '6, 4' }
      ).addTo(map);
      bagbagRiver.bindTooltip('Bagbag River (Angat Confluence Channel)', { className: 'bg-slate-900 text-cyan-300 text-xs' });

      // Create Layer Groups
      const evacLayer = L.layerGroup().addTo(map);
      const routesLayer = L.layerGroup().addTo(map);
      const stagingLayer = L.layerGroup().addTo(map);
      const hazardLayer = L.layerGroup().addTo(map);

      evacCentersLayerRef.current = evacLayer;
      safeRoutesLayerRef.current = routesLayer;
      stagingPointsLayerRef.current = stagingLayer;
      hazardZonesLayerRef.current = hazardLayer;

      mapInstanceRef.current = map;

      // Force resize calculation
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Synchronize Layer Groups when layers, filters, or selections change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const evacLayer = evacCentersLayerRef.current;
    const routesLayer = safeRoutesLayerRef.current;
    const stagingLayer = stagingPointsLayerRef.current;
    const hazardLayer = hazardZonesLayerRef.current;

    // 1. Evacuation Centers Layer
    if (evacLayer) {
      evacLayer.clearLayers();
      if (showEvacCenters) {
        EVACUATION_CENTERS.forEach((center) => {
          const isSelected = center.id === selectedCenterId;
          const pct = Math.round((center.currentOccupancy / center.capacity) * 100);
          const isHighCapacity = pct < 70;

          const customIcon = L.divIcon({
            className: 'custom-evac-pin',
            html: `
              <div style="
                background: ${isSelected ? '#10b981' : isHighCapacity ? '#059669' : '#d97706'};
                width: ${isSelected ? '32px' : '26px'};
                height: ${isSelected ? '32px' : '26px'};
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
                border: 2px solid ${isSelected ? '#a7f3d0' : 'white'};
                box-shadow: 0 0 ${isSelected ? '16px #10b981' : '8px rgba(0,0,0,0.6)'};
                cursor: pointer;
                transition: all 0.2s;
              ">
                ⌂
              </div>
            `,
            iconSize: isSelected ? [32, 32] : [26, 26],
            iconAnchor: isSelected ? [16, 16] : [13, 13]
          });

          const marker = L.marker(center.coordinates, { icon: customIcon }).addTo(evacLayer);

          marker.on('click', () => {
            setSelectedCenterId(center.id);
            // Also select a route that targets this center if available
            const matchingRoute = SAFE_ROUTES.find((r) => r.destinationCenterId === center.id);
            if (matchingRoute) {
              setSelectedRouteId(matchingRoute.id);
              setSelectedBarangayName(matchingRoute.originBarangay);
            }
          });

          const popupContent = `
            <div class="p-2 space-y-1.5 text-xs text-slate-200">
              <div class="font-bold text-emerald-400 text-sm">${center.name}</div>
              <div class="text-[11px] text-slate-300">${center.structureType} (${center.elevationMslMeters}m MSL Elevation)</div>
              <div class="bg-slate-900 p-2 rounded border border-slate-800 space-y-1 my-1">
                <div class="flex justify-between font-mono">
                  <span>Occupancy:</span>
                  <span class="font-bold ${pct > 80 ? 'text-amber-400' : 'text-emerald-300'}">${center.currentOccupancy} / ${center.capacity} (${pct}%)</span>
                </div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full rounded-full" style="width: ${pct}%"></div>
                </div>
              </div>
              <div class="text-[11px] text-slate-400">📞 Contact: ${center.contactPerson} (${center.contactNumber})</div>
            </div>
          `;

          marker.bindPopup(popupContent, { className: 'bg-slate-950 border-slate-700' });
        });
      }
    }

    // 2. Safe Routes Layer
    if (routesLayer) {
      routesLayer.clearLayers();
      if (showSafeRoutes) {
        SAFE_ROUTES.forEach((route) => {
          const isSelected = route.id === selectedRouteId;
          const isBoat = route.routeType === 'BOAT_RESCUE_CHANNEL';
          const isElevated = route.routeType === 'ELEVATED_CAUSEWAY';

          let routeColor = isBoat ? '#06b6d4' : isElevated ? '#a855f7' : '#10b981';
          if (route.status === 'CAUTION_RISING_WATER') routeColor = '#f59e0b';

          const polyline = L.polyline(route.pathCoordinates, {
            color: routeColor,
            weight: isSelected ? 6 : 4,
            opacity: isSelected ? 1.0 : 0.65,
            dashArray: isBoat ? '8, 6' : isElevated ? '4, 4' : undefined
          }).addTo(routesLayer);

          polyline.on('click', () => {
            setSelectedRouteId(route.id);
            setSelectedBarangayName(route.originBarangay);
            setSelectedCenterId(route.destinationCenterId);
          });

          polyline.bindTooltip(`
            <div class="text-xs p-1">
              <div class="font-bold text-slate-100">${route.name}</div>
              <div class="text-cyan-400 font-mono">${route.distanceKm} km • ~${route.estimatedTravelTimeMins} mins</div>
              <div class="text-emerald-400 text-[10px] mt-0.5">Click to view turn-by-turn guidance</div>
            </div>
          `, { className: 'bg-slate-950 border-slate-700 text-slate-200' });
        });
      }
    }

    // 3. Staging Points Layer
    if (stagingLayer) {
      stagingLayer.clearLayers();
      if (showStagingPoints) {
        SAFE_ROUTES.forEach((route) => {
          const isSelected = route.id === selectedRouteId;
          route.stagingPoints.forEach((sp) => {
            let iconText = '⛟';
            let bgHex = '#3b82f6';
            if (sp.type === 'BOAT_LAUNCH') {
              iconText = '⚓';
              bgHex = '#06b6d4';
            } else if (sp.type === 'MEDICAL_POST') {
              iconText = '+';
              bgHex = '#ef4444';
            }

            const stagingIcon = L.divIcon({
              className: 'custom-staging-pin',
              html: `
                <div style="
                  background: ${bgHex};
                  width: ${isSelected ? '24px' : '18px'};
                  height: ${isSelected ? '24px' : '18px'};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: ${isSelected ? '11px' : '9px'};
                  border: 1.5px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.6);
                  cursor: pointer;
                ">
                  ${iconText}
                </div>
              `,
              iconSize: isSelected ? [24, 24] : [18, 18],
              iconAnchor: isSelected ? [12, 12] : [9, 9]
            });

            const marker = L.marker(sp.coordinates, { icon: stagingIcon }).addTo(stagingLayer);
            marker.bindTooltip(`
              <div class="text-xs p-1">
                <div class="font-bold text-slate-100">${sp.name}</div>
                <div class="text-amber-300 font-mono text-[10px] uppercase">${sp.type.replace(/_/g, ' ')}</div>
              </div>
            `, { className: 'bg-slate-950 border-slate-700 text-slate-200' });
          });
        });
      }
    }

    // 4. Hazard Zones & Inundated Road Bottlenecks Layer
    if (hazardLayer) {
      hazardLayer.clearLayers();
      if (showHazardZones) {
        // Frances islanded hazard zone
        L.circle([14.931, 120.764], {
          radius: 500,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '5, 5'
        }).bindTooltip('Frances Islanded Hazard Zone (Road Submerged - Rescue Boat Only)', { className: 'bg-slate-950 text-red-300 text-xs' }).addTo(hazardLayer);

        // Caniogan Bridge Overtopping Risk Area
        L.circle([14.9125, 120.768], {
          radius: 350,
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.2,
          weight: 2
        }).bindTooltip('Bagbag Riverbank Overtopping Zone (Caniogan)', { className: 'bg-slate-950 text-amber-300 text-xs' }).addTo(hazardLayer);

        // Meysulao deep basin overflow
        L.circle([14.945, 120.778], {
          radius: 450,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.22,
          weight: 2,
          dashArray: '5, 5'
        }).bindTooltip('Meysulao Agricultural Basin Spill (Use North Elevated Causeway Only)', { className: 'bg-slate-950 text-red-300 text-xs' }).addTo(hazardLayer);
      }
    }
  }, [
    isOpen,
    showEvacCenters,
    showSafeRoutes,
    showStagingPoints,
    showHazardZones,
    selectedRouteId,
    selectedCenterId
  ]);

  if (!isOpen) return null;

  // Aggregate evacuation capacity metrics
  const totalCapacity = EVACUATION_CENTERS.reduce((a, b) => a + b.capacity, 0);
  const totalOccupancy = EVACUATION_CENTERS.reduce((a, b) => a + b.currentOccupancy, 0);
  const capacityPct = Math.round((totalOccupancy / totalCapacity) * 100);

  return (
    <div
      id="evacuation-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="evacuation-guide-modal-container"
        className="relative w-full max-w-7xl max-h-[95vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  BDRRMC Evacuation Center & Safe Route Navigator
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Active GIS Layer Groups
                </span>
              </div>
              <p className="text-xs text-slate-400">
                High-ground evacuation corridors, amphibious rescue routes, and live shelter capacities for Calumpit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAdvisory}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Copy tactical broadcast instructions"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Tactical Advisory'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">Active Shelters</span>
              <span className="font-bold text-slate-200">{EVACUATION_CENTERS.length} Designated Centers</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">Overall Capacity</span>
              <span className="font-bold font-mono text-slate-200">
                {totalOccupancy} / {totalCapacity} ({capacityPct}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">Designated Safe Corridors</span>
              <span className="font-bold text-slate-200">{SAFE_ROUTES.length} Verified Arterials</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px] block">BDRRMC Rescue Staging</span>
              <span className="font-bold text-amber-300">Amphibious & Truck Hubs Active</span>
            </div>
          </div>
        </div>

        {/* Main Content: Split Grid Map + Tactical Routing Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[520px]">
          {/* Left / Center: Interactive Leaflet Map with Layer Controls (7 cols) */}
          <div className="lg:col-span-7 relative flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Map Filter Layer Toggles Bar */}
            <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-10 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>GIS Layer Toggles:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setShowEvacCenters(!showEvacCenters)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-all ${
                    showEvacCenters
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 shadow-sm shadow-emerald-900/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Evacuation Centers</span>
                </button>

                <button
                  onClick={() => setShowSafeRoutes(!showSafeRoutes)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-all ${
                    showSafeRoutes
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-900/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Safe Routes</span>
                </button>

                <button
                  onClick={() => setShowStagingPoints(!showStagingPoints)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-all ${
                    showStagingPoints
                      ? 'bg-purple-950/80 text-purple-300 border-purple-700 shadow-sm shadow-purple-900/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>Rescue Staging Posts</span>
                </button>

                <button
                  onClick={() => setShowHazardZones(!showHazardZones)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-all ${
                    showHazardZones
                      ? 'bg-red-950/80 text-red-300 border-red-700 shadow-sm shadow-red-900/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span>Hazard Spill Zones</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative flex-1 min-h-[380px] lg:min-h-[480px]">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Legend Overlay */}
              <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-xl text-[11px] space-y-1.5 backdrop-blur-md max-w-[240px] pointer-events-none">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Routing Legend</span>
                  <span className="text-[9px] text-cyan-400 font-mono">CALUMPIT GIS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                  <span className="text-slate-300">High-Ground Road</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-cyan-400 rounded"></span>
                  <span className="text-slate-300">Amphibious Boat Corridor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-purple-500 rounded"></span>
                  <span className="text-slate-300">Elevated Causeway</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600 flex items-center justify-center text-[9px] text-white font-bold">⌂</span>
                  <span className="text-slate-300">Evacuation Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-slate-300">Submerged / Imminent Hazard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tactical Route Guidance & BDRRMC Instructions (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 flex flex-col justify-between overflow-y-auto max-h-[580px] p-4 sm:p-5 space-y-4">
            {/* Origin Barangay Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Select Origin Community (Barangay):</span>
                <span className="text-[10px] font-normal text-cyan-400">Step 1 of 2</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {['Frances', 'Meysulao', 'San Miguel', 'Calizon', 'Sapang Bayan', 'Poblacion'].map((name) => {
                  const isSelected = selectedBarangayName.toLowerCase() === name.toLowerCase();
                  const brgyData = barangays.find((b) => b.name.toLowerCase() === name.toLowerCase());
                  const isRed = brgyData?.warningStatus === 'RED';

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleBarangayChange(name)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/90'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span>{name}</span>
                        {isRed && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {brgyData ? `${brgyData.floodHeightInches}" Flood` : 'Riverside'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Route Details Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3.5 text-xs">
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                    <Navigation className="w-4 h-4" />
                    <span>{activeRoute.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Recommended Primary Evacuation Path for Brgy. {activeRoute.originBarangay}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border uppercase shrink-0 ${
                    activeRoute.routeType === 'BOAT_RESCUE_CHANNEL'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : activeRoute.routeType === 'ELEVATED_CAUSEWAY'
                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {activeRoute.routeType.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Metrics: Distance, ETA, Elevation */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Corridor Length</span>
                  <span className="text-sm font-bold font-mono text-slate-200">{activeRoute.distanceKm} km</span>
                </div>

                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transit Time</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">~{activeRoute.estimatedTravelTimeMins} mins</span>
                </div>

                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Route Status</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {activeRoute.status === 'SAFE_PASSABLE' ? 'ACTIVE & CLEAR' : 'CAUTION RISING'}
                  </span>
                </div>
              </div>

              {/* Strategic Advantage */}
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg text-[11px] text-emerald-200 flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block mb-0.5">Hydrological Clearance Advantage:</span>
                  <span>{activeRoute.elevationAdvantage}</span>
                </div>
              </div>

              {/* Tagalog Megaphone / Radio Instructions */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" /> Gabay sa Paglikas (Tagalog Broadcast)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">BDRRMC Megaphone Guide</span>
                </div>
                <p className="text-slate-300 italic leading-relaxed text-[11px]">
                  "{activeRoute.instructionsTagalog}"
                </p>
              </div>

              {/* English Operational Instructions */}
              <div className="space-y-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block">Operational Field Protocol:</span>
                <p className="leading-relaxed">{activeRoute.instructionsEnglish}</p>
              </div>

              {/* Staging Points Along Route */}
              <div>
                <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider block mb-1.5">
                  Rescue Staging & Triage Checkpoints
                </span>
                <div className="space-y-1.5">
                  {activeRoute.stagingPoints.map((sp, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 font-medium">{sp.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                        {sp.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Destination Shelter Information */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400">Target Evacuation Facility</span>
                  <h4 className="text-sm font-bold text-slate-100">{activeCenter.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {activeCenter.structureType} • Elevation: {activeCenter.elevationMslMeters}m MSL
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {activeCenter.capacity - activeCenter.currentOccupancy} Slots Available
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {activeCenter.currentOccupancy} / {activeCenter.capacity} Capacity
                  </p>
                </div>
              </div>

              {/* Shelter Key Amenities */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{activeCenter.generatorStandby ? 'Standby Generator Active' : 'Solar Backup'}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-1.5 text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{activeCenter.medicalPostActive ? 'RHU Medical Post Online' : 'First Aid Kit Station'}</span>
                </div>
              </div>

              {/* Shelter Commander Contact */}
              <div className="bg-emerald-950/20 border border-emerald-800/30 p-2.5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 text-[11px] block">{activeCenter.contactPerson}</span>
                    <span className="text-[10px] text-slate-400">Camp Management Officer</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300">{activeCenter.contactNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>
              Calumpit MDRRMO • Bulacan PDRRMO Emergency Evacuation Routing System • Coordinate with BDRRMC Captains
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyAdvisory}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
              <span>{copied ? 'Advisory Copied!' : 'Broadcast Route Instructions'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors text-xs"
            >
              Close Navigator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
