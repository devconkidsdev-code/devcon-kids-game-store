import { Incident } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-101',
    reportCode: 'ALT-2026-8821',
    title: 'Flooding reported in Tibanga',
    type: 'Flooding',
    severity: 'HIGH',
    urgency: 'URGENT',
    status: 'Under Review',
    location: {
      name: 'Tibanga Highway intersection near MSU-IIT',
      barangay: 'Tibanga',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2412,
        lng: 124.2443,
        formatted: '8.2412° N, 124.2443° E'
      },
      mapX: 42,
      mapY: 34
    },
    summary: 'Road possibly blocked due to rapidly rising floodwater reaching waist level.',
    citizenDescription: 'Water is rising super fast right along the highway near the convenience store. Cars cannot pass anymore and two tricycles are stranded. People need guidance.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '12 min ago',
    reportedTimestamp: Date.now() - 12 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Urban Flash Flood',
      confidence: 0.94,
      severityAssessment: 'HIGH',
      severityReasoning: 'Water depth estimated at >0.7m over major arterial road with active vehicular blockage.',
      extractedLocation: 'Tibanga National Highway, near Andres Bonifacio Ave',
      keyHazards: ['Stranded light vehicles', 'Submerged drainage inlets', 'Impassable arterial road'],
      suggestedAction: 'Deploy CDRRMO traffic detour and dispatch Water Rescue Team Alpha.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '12 min ago'
    },
    assignedUnit: {
      id: 'unit-qrf-1',
      name: 'CDRRMO Rescue Unit 1',
      agency: 'City Disaster Risk Reduction Office',
      contact: '(063) 221-4444',
      status: 'En Route',
      eta: '8 mins'
    },
    timeline: [
      {
        id: 't-1',
        time: '12 min ago',
        title: 'Report Submitted',
        description: 'Citizen submitted photo with GPS geo-tag from Mobile App.',
        author: 'Citizen #892',
        type: 'report'
      },
      {
        id: 't-2',
        time: '11 min ago',
        title: 'AI Processing Complete',
        description: 'Image and text parsed. High severity flag generated. 94% confidence.',
        author: 'Alertify AI Core',
        type: 'ai_analysis'
      },
      {
        id: 't-3',
        time: '7 min ago',
        title: 'Responder Triage',
        description: 'Assigned CDRRMO Rescue Unit 1 for site verification and rerouting.',
        author: 'Officer R. Mendoza (Dispatch)',
        type: 'unit_assigned'
      }
    ]
  },
  {
    id: 'inc-102',
    reportCode: 'ALT-2026-8819',
    title: 'Road blocked near Hinaplanon',
    type: 'Road Obstruction',
    severity: 'MEDIUM',
    urgency: 'NEEDS_ATTENTION',
    status: 'Verified',
    location: {
      name: 'Hinaplanon Bridge Approach Road',
      barangay: 'Hinaplanon',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2495,
        lng: 124.2571,
        formatted: '8.2495° N, 124.2571° E'
      },
      mapX: 62,
      mapY: 28
    },
    summary: 'Debris and fallen acacia branch blocking one side of the northbound lane.',
    citizenDescription: 'Big branch fell across the road after strong gusts of wind. One lane is completely blocked, creating heavy bottleneck traffic.',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '28 min ago',
    reportedTimestamp: Date.now() - 28 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Vegetation Obstruction',
      confidence: 0.91,
      severityAssessment: 'MEDIUM',
      severityReasoning: 'Single lane blockage on secondary road. No structural collapse or reported casualties.',
      extractedLocation: 'Hinaplanon Bridge northbound lane',
      keyHazards: ['Single-lane head-on traffic hazard', 'Blind corner visibility reduced'],
      suggestedAction: 'Dispatch City Engineering chainsaw team for road clearing.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '27 min ago'
    },
    assignedUnit: {
      id: 'unit-dpwh-3',
      name: 'City Engineering Clearing Team B',
      agency: 'Iligan City Engineering Office',
      contact: '(063) 223-1200',
      status: 'On Scene',
      eta: 'Active'
    },
    verifiedBy: 'Insp. G. Navarro',
    timeline: [
      {
        id: 't-21',
        time: '28 min ago',
        title: 'Report Received',
        description: 'Citizen report received via Web Portal with attached photo.',
        author: 'Citizen #412',
        type: 'report'
      },
      {
        id: 't-22',
        time: '20 min ago',
        title: 'Verified by Dispatch',
        description: 'Verified with Barangay Hinaplanon tanod on duty.',
        author: 'Insp. G. Navarro',
        type: 'verified'
      }
    ]
  },
  {
    id: 'inc-103',
    reportCode: 'ALT-2026-8815',
    title: 'Landslide reported in Purok 6',
    type: 'Landslide',
    severity: 'HIGH',
    urgency: 'URGENT',
    status: 'Responding',
    location: {
      name: 'Purok 6 hillside access road, Pugaan',
      barangay: 'Pugaan',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2120,
        lng: 124.2810,
        formatted: '8.2120° N, 124.2810° E'
      },
      mapX: 78,
      mapY: 65
    },
    summary: 'Slope soil erosion and boulder slide covering access road. 12 households isolated.',
    citizenDescription: 'Hill collapsed behind the chapel. Road is totally covered with mud and heavy rocks. No one can drive through to get to town.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '45 min ago',
    reportedTimestamp: Date.now() - 45 * 60 * 1000,
    source: 'Barangay Scout',
    aiAnalysis: {
      incidentType: 'Hillside Mass Soil Movement',
      confidence: 0.96,
      severityAssessment: 'HIGH',
      severityReasoning: 'Critical access road cut off. Continued soil instability observed due to persistent rain.',
      extractedLocation: 'Upper Pugaan, Purok 6 slope',
      keyHazards: ['Isolated community', 'Secondary landslide risk', 'Utility poles destabilized'],
      suggestedAction: 'Immediate heavy equipment dispatch; alert Barangay Evacuation Marshals.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '44 min ago'
    },
    assignedUnit: {
      id: 'unit-qrf-2',
      name: 'Heavy Equipment Response Alpha',
      agency: 'DPWH District 1 & CDRRMO',
      contact: '(063) 221-9988',
      status: 'On Scene',
      eta: 'In progress'
    },
    verifiedBy: 'Capt. A. Balindong',
    timeline: [
      {
        id: 't-31',
        time: '45 min ago',
        title: 'Priority Report Ingested',
        description: 'Barangay Scout triggered priority alert via radio patch.',
        author: 'Scout J. Datu',
        type: 'report'
      },
      {
        id: 't-32',
        time: '35 min ago',
        title: 'Heavy Equipment Dispatched',
        description: 'Backhoe and payloaders en route from DPWH depot.',
        author: 'Chief of Operations',
        type: 'unit_assigned'
      },
      {
        id: 't-33',
        time: '15 min ago',
        title: 'Status Updated: Responding',
        description: 'On-site excavation underway; perimeter cordoned off.',
        author: 'Field Commander',
        type: 'status_change'
      }
    ]
  },
  {
    id: 'inc-104',
    reportCode: 'ALT-2026-8812',
    title: 'Water level rising in Suarez',
    type: 'Flooding',
    severity: 'MEDIUM',
    urgency: 'MONITOR',
    status: 'Under Review',
    location: {
      name: 'Sitio Riverside, Barangay Suarez',
      barangay: 'Suarez',
      city: 'Iligan City',
      coordinates: {
        lat: 8.1980,
        lng: 124.2150,
        formatted: '8.1980° N, 124.2150° E'
      },
      mapX: 25,
      mapY: 72
    },
    summary: 'Riverbank water level is 0.4 meters below critical threshold; steady drizzle.',
    citizenDescription: 'The creek by the footbridge is creeping up fast compared to this morning. Water is muddy brown with tree logs floating down.',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '1 hr ago',
    reportedTimestamp: Date.now() - 60 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Riverine Water Level Elevation',
      confidence: 0.88,
      severityAssessment: 'MEDIUM',
      severityReasoning: 'Water is approaching warning gauge level 2, but has not yet breached containment dikes.',
      extractedLocation: 'Sitio Riverside footbridge, Suarez',
      keyHazards: ['Potential riverbank overflow', 'Debris collision with footbridge'],
      suggestedAction: 'Maintain telemetry camera monitoring and issue orange advisory to lower Puroks.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '58 min ago'
    },
    timeline: [
      {
        id: 't-41',
        time: '1 hr ago',
        title: 'Report Logged',
        description: 'Water gauge snapshot uploaded by resident.',
        author: 'Citizen #771',
        type: 'report'
      },
      {
        id: 't-42',
        time: '50 min ago',
        title: 'Telemetry Cross-Reference',
        description: 'Automated gauge confirmed 2.3m river stage level.',
        author: 'Alertify Sensor Bridge',
        type: 'ai_analysis'
      }
    ]
  },
  {
    id: 'inc-105',
    reportCode: 'ALT-2026-8808',
    title: 'Minor flooding near Barangay San Miguel',
    type: 'Flooding',
    severity: 'LOW',
    urgency: 'MONITOR',
    status: 'Reported',
    location: {
      name: 'San Miguel Elementary School access road',
      barangay: 'San Miguel',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2340,
        lng: 124.2380,
        formatted: '8.2340° N, 124.2380° E'
      },
      mapX: 38,
      mapY: 48
    },
    summary: 'Ankle-deep rainwater pooling in school perimeter due to clogged ditch.',
    citizenDescription: 'Water is about 4 inches deep on the side street. Light vehicles can still easily pass, but pedestrians need rain boots.',
    imageUrl: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '1.5 hrs ago',
    reportedTimestamp: Date.now() - 90 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Localized Drainage Pooling',
      confidence: 0.95,
      severityAssessment: 'LOW',
      severityReasoning: 'Superficial pooling < 15cm; no residential structures at risk.',
      extractedLocation: 'San Miguel School Road',
      keyHazards: ['Slippery pavement', 'Pedestrian inconvenience'],
      suggestedAction: 'Notify Barangay maintenance crew for routine ditch clearing.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '1.5 hrs ago'
    },
    timeline: [
      {
        id: 't-51',
        time: '1.5 hrs ago',
        title: 'Report Ingested',
        description: 'Report filed by school guard on duty.',
        author: 'Citizen #339',
        type: 'report'
      }
    ]
  },
  {
    id: 'inc-106',
    reportCode: 'ALT-2026-8801',
    title: 'Road obstruction cleared in Pala-o',
    type: 'Road Obstruction',
    severity: 'MEDIUM',
    urgency: 'RESOLVED',
    status: 'Resolved',
    location: {
      name: 'Pala-o Market Outer Ring',
      barangay: 'Pala-o',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2250,
        lng: 124.2490,
        formatted: '8.2250° N, 124.2490° E'
      },
      mapX: 48,
      mapY: 52
    },
    summary: 'Fallen billboard frame and cable clutter successfully removed; road reopened.',
    citizenDescription: 'The large tarpaulin steel sign that fell during the squall has been cut and towed away. Traffic is flowing normally now.',
    imageUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '2.5 hrs ago',
    reportedTimestamp: Date.now() - 150 * 60 * 1000,
    source: 'Hotline Report',
    aiAnalysis: {
      incidentType: 'Structural Signboard Collapse',
      confidence: 0.93,
      severityAssessment: 'MEDIUM',
      severityReasoning: 'Metallic debris formerly obstructed commercial lane; now resolved by DPWH crew.',
      extractedLocation: 'Pala-o Market junction',
      keyHazards: ['Formerly electrocution hazard, cleared'],
      suggestedAction: 'Case archived; normal traffic restored.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '2.4 hrs ago'
    },
    assignedUnit: {
      id: 'unit-dpwh-1',
      name: 'City Quick Clearance Team 1',
      agency: 'Iligan City Engineering',
      contact: '(063) 223-1200',
      status: 'Standby'
    },
    verifiedBy: 'Engr. D. Tolentino',
    timeline: [
      {
        id: 't-61',
        time: '2.5 hrs ago',
        title: 'Report Logged',
        description: 'Vendor called hotline reporting fallen commercial sign.',
        author: 'Hotline Operator',
        type: 'report'
      },
      {
        id: 't-62',
        time: '1.8 hrs ago',
        title: 'Clearance Operations',
        description: 'Crew cut steel frame and cleared electrical cables.',
        author: 'Engr. D. Tolentino',
        type: 'status_change'
      },
      {
        id: 't-63',
        time: '40 min ago',
        title: 'Incident Resolved',
        description: 'All debris removed. Lanes fully reopened to public.',
        author: 'Engr. D. Tolentino',
        type: 'resolved'
      }
    ]
  },
  {
    id: 'inc-107',
    reportCode: 'ALT-2026-8798',
    title: 'Fallen power line across highway in Tambacan',
    type: 'Power Hazard',
    severity: 'HIGH',
    urgency: 'URGENT',
    status: 'Responding',
    location: {
      name: 'Tambacan Coastal Highway near Purok 3',
      barangay: 'Tambacan',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2315,
        lng: 124.2320,
        formatted: '8.2315° N, 124.2320° E'
      },
      mapX: 30,
      mapY: 42
    },
    summary: 'Live high-voltage electrical cable snapped and sparking on wet asphalt.',
    citizenDescription: 'Sparks are flying from the black wire hanging on the street! A motorcycle almost hit it. Please send ILPI or fire department right away.',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '18 min ago',
    reportedTimestamp: Date.now() - 18 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Live Electrical Wire Hazard',
      confidence: 0.97,
      severityAssessment: 'HIGH',
      severityReasoning: 'Exposed live power distribution cable in contact with wet surface presents immediate electrocution risk.',
      extractedLocation: 'Tambacan Coastal Road Purok 3',
      keyHazards: ['Active electrical arcing', 'Electrocution hazard on wet pavement', 'Fire ignition risk'],
      suggestedAction: 'Immediate feeder de-energization by ILPI Power Dispatch; police isolation perimeter.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '17 min ago'
    },
    assignedUnit: {
      id: 'unit-ilpi-1',
      name: 'ILPI Emergency Feeder Unit 4',
      agency: 'Iligan Light & Power Inc.',
      contact: '(063) 221-2555',
      status: 'On Scene',
      eta: 'Isolated'
    },
    verifiedBy: 'Fire Officer 2 C. Alonto',
    timeline: [
      {
        id: 't-71',
        time: '18 min ago',
        title: 'Emergency Citizen Alert',
        description: 'Citizen report with photo of active sparks.',
        author: 'Citizen #905',
        type: 'report'
      },
      {
        id: 't-72',
        time: '14 min ago',
        title: 'Grid Segment De-energized',
        description: 'ILPI confirmed Feeder 4 breaker tripped remotely.',
        author: 'ILPI Grid Control',
        type: 'status_change'
      }
    ]
  },
  {
    id: 'inc-108',
    reportCode: 'ALT-2026-8792',
    title: 'Bridge structural crack on Mandulog Bridge',
    type: 'Infrastructure Damage',
    severity: 'HIGH',
    urgency: 'NEEDS_ATTENTION',
    status: 'Under Review',
    location: {
      name: 'Mandulog 1 Bridge Pier 3',
      barangay: 'San Roque',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2610,
        lng: 124.2680,
        formatted: '8.2610° N, 124.2680° E'
      },
      mapX: 68,
      mapY: 18
    },
    summary: 'Visible vertical fissure on concrete bridge abutment following surge currents.',
    citizenDescription: 'Noticeable gap and cracked concrete near the river pier after the strong current hit the foundation pillar this morning.',
    imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '52 min ago',
    reportedTimestamp: Date.now() - 52 * 60 * 1000,
    source: 'SMS Gateway',
    aiAnalysis: {
      incidentType: 'Bridge Structural Compromise',
      confidence: 0.89,
      severityAssessment: 'HIGH',
      severityReasoning: 'Abutment crack may threaten load-bearing capacity for heavy transport vehicles under continuing water velocity.',
      extractedLocation: 'Mandulog Bridge #1, San Roque span',
      keyHazards: ['Structural instability', 'Heavy vehicle load risk'],
      suggestedAction: 'Impose temporary 10-ton weight restriction; deploy structural engineering survey team.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '50 min ago'
    },
    assignedUnit: {
      id: 'unit-dpwh-eng',
      name: 'DPWH Bridge Structural Assessment Team',
      agency: 'DPWH Region X Bridge Division',
      contact: '(063) 221-7000',
      status: 'En Route',
      eta: '15 mins'
    },
    timeline: [
      {
        id: 't-81',
        time: '52 min ago',
        title: 'SMS Report & Photo Link',
        description: 'Submitted by passing truck driver via SMS MMS link.',
        author: 'Citizen #108',
        type: 'report'
      }
    ]
  },
  {
    id: 'inc-109',
    reportCode: 'ALT-2026-8785',
    title: 'Storm surge alert near coastal Purok Baybay',
    type: 'Storm Surge',
    severity: 'MEDIUM',
    urgency: 'NEEDS_ATTENTION',
    status: 'Verified',
    location: {
      name: 'Purok Baybay Seawall',
      barangay: 'Santa Filomena',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2700,
        lng: 124.2480,
        formatted: '8.2700° N, 124.2480° E'
      },
      mapX: 50,
      mapY: 12
    },
    summary: 'Waves overtopping seawall reaching beachfront stilt houses at high tide.',
    citizenDescription: 'Strong waves splashing over the concrete barrier. Water is entering the frontline fishing cottages. Fishermen have moved their bancas.',
    imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '1.1 hrs ago',
    reportedTimestamp: Date.now() - 66 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Coastal Overtopping',
      confidence: 0.92,
      severityAssessment: 'MEDIUM',
      severityReasoning: 'Wave splash reaching coastal residential perimeter during astronomical high tide.',
      extractedLocation: 'Sta. Filomena coastal strip',
      keyHazards: ['Damage to light material houses', 'Debris wave impacts'],
      suggestedAction: 'Advise pre-emptive relocation of seafront families to Barangay Evacuation Center.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '1.1 hrs ago'
    },
    assignedUnit: {
      id: 'unit-coastguard-1',
      name: 'Philippine Coast Guard Substation Iligan',
      agency: 'PCG Northern Mindanao',
      contact: '(063) 221-3333',
      status: 'On Scene'
    },
    verifiedBy: 'Barangay Captain R. Tan',
    timeline: [
      {
        id: 't-91',
        time: '1.1 hrs ago',
        title: 'Coastal Alert Triggered',
        description: 'Barangay watchman reported wave crest heights >2.5m.',
        author: 'Citizen #650',
        type: 'report'
      }
    ]
  },
  {
    id: 'inc-110',
    reportCode: 'ALT-2026-8778',
    title: 'Culvert blockage causing water pooling in Tubod',
    type: 'Flooding',
    severity: 'LOW',
    urgency: 'MONITOR',
    status: 'Under Review',
    location: {
      name: 'Tubod Highway near Market Culvert',
      barangay: 'Tubod',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2180,
        lng: 124.2380,
        formatted: '8.2180° N, 124.2380° E'
      },
      mapX: 36,
      mapY: 60
    },
    summary: 'Plastic debris and silt accumulating at culvert entrance; water backing up 15cm.',
    citizenDescription: 'Trash got stuck in the main drainage grill so the street is starting to pool water. If heavy rain continues it might get deeper.',
    hasImage: false,
    reportedAt: '2.1 hrs ago',
    reportedTimestamp: Date.now() - 126 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Drainage Channel Sedimentation',
      confidence: 0.87,
      severityAssessment: 'LOW',
      severityReasoning: 'Early stage hydraulic constriction. No structural or safety threat if desilted promptly.',
      extractedLocation: 'Tubod drainage channel grid 4',
      keyHazards: ['Localized gutter overflow', 'Stagnant water'],
      suggestedAction: 'Route to Barangay Eco-Waste De-clogging team for morning schedule.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '2.1 hrs ago'
    },
    timeline: [
      {
        id: 't-101',
        time: '2.1 hrs ago',
        title: 'Report Logged',
        description: 'Citizen report without image, verified via GPS.',
        author: 'Citizen #281',
        type: 'report'
      }
    ]
  },
  {
    id: 'inc-111',
    reportCode: 'ALT-2026-8770',
    title: 'Flash flood advisory along Ditucalan stream',
    type: 'Flooding',
    severity: 'HIGH',
    urgency: 'URGENT',
    status: 'Verified',
    location: {
      name: 'Ditucalan Upstream Hydro Basin',
      barangay: 'Ditucalan',
      city: 'Iligan City',
      coordinates: {
        lat: 8.1850,
        lng: 124.2610,
        formatted: '8.1850° N, 124.2610° E'
      },
      mapX: 58,
      mapY: 82
    },
    summary: 'Rapid mountain runoff swollen upstream river width by 40%; muddy debris torrent.',
    citizenDescription: 'The river coming from Maria Cristina falls basin is roaring and overflowed onto the agricultural plots. Two farm sheds are flooded.',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '35 min ago',
    reportedTimestamp: Date.now() - 35 * 60 * 1000,
    source: 'Barangay Scout',
    aiAnalysis: {
      incidentType: 'Mountain Runoff Flash Flood',
      confidence: 0.96,
      severityAssessment: 'HIGH',
      severityReasoning: 'High volume upland watershed runoff carrying logs and topsoil downstream toward inhabited basins.',
      extractedLocation: 'Ditucalan Upstream Basin Zone 1',
      keyHazards: ['Downstream flash surge', 'Agricultural field inundation', 'Footbridge washaway risk'],
      suggestedAction: 'Sound Barangay siren warning; prepare downstream lowlands for staged evacuation.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '34 min ago'
    },
    assignedUnit: {
      id: 'unit-qrf-3',
      name: 'CDRRMO Water Rescue Team Delta',
      agency: 'CDRRMO Search & Rescue',
      contact: '(063) 221-4444',
      status: 'Dispatched',
      eta: '12 mins'
    },
    verifiedBy: 'Barangay Kagawad M. Lucman',
    timeline: [
      {
        id: 't-111',
        time: '35 min ago',
        title: 'Priority Runoff Alert',
        description: 'Barangay scout logged high velocity current reading.',
        author: 'Scout E. Cabili',
        type: 'report'
      }
    ]
  },
  {
    id: 'inc-112',
    reportCode: 'ALT-2026-8762',
    title: 'Debris cleared from drainage in Mahayahay',
    type: 'Road Obstruction',
    severity: 'LOW',
    urgency: 'RESOLVED',
    status: 'Resolved',
    location: {
      name: 'Mahayahay Main Avenue Drainage',
      barangay: 'Mahayahay',
      city: 'Iligan City',
      coordinates: {
        lat: 8.2290,
        lng: 124.2540,
        formatted: '8.2290° N, 124.2540° E'
      },
      mapX: 54,
      mapY: 46
    },
    summary: 'Community and sanitation team cleared clogged tree branches and trash from storm canal.',
    citizenDescription: 'The water subsided completely after the drainage grates were cleaned out by the barangay team.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
    hasImage: true,
    reportedAt: '3.2 hrs ago',
    reportedTimestamp: Date.now() - 192 * 60 * 1000,
    source: 'Citizen App',
    aiAnalysis: {
      incidentType: 'Drainage Restoration',
      confidence: 0.94,
      severityAssessment: 'LOW',
      severityReasoning: 'Water flow capacity restored to 100%. No lingering flood hazards.',
      extractedLocation: 'Mahayahay Avenue Canal 2',
      keyHazards: ['None - Resolved'],
      suggestedAction: 'Case verified as closed.',
      modelName: 'Alertify Vision-L1 (Gemini 2.5 Flash Disaster Parser)',
      analyzedAt: '3.1 hrs ago'
    },
    verifiedBy: 'Barangay Kagawad T. Santos',
    timeline: [
      {
        id: 't-121',
        time: '3.2 hrs ago',
        title: 'Report Closed',
        description: 'Barangay verified free-flowing storm drainage.',
        author: 'T. Santos',
        type: 'resolved'
      }
    ]
  }
];
