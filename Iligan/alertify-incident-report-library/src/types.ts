export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export type Urgency = 'URGENT' | 'NEEDS_ATTENTION' | 'MONITOR' | 'RESOLVED';

export type IncidentStatus = 'Reported' | 'Under Review' | 'Verified' | 'Responding' | 'Resolved';

export type IncidentType = 
  | 'Flooding'
  | 'Landslide'
  | 'Road Obstruction'
  | 'Infrastructure Damage'
  | 'Power Hazard'
  | 'Storm Surge'
  | 'Evacuation Need';

export type FilterCategory = 
  | 'All'
  | 'High Severity'
  | 'Medium'
  | 'Low'
  | 'Active'
  | 'Resolved'
  | 'Needs Review';

export type SortOption = 'priority' | 'recent' | 'severity' | 'location';

export interface LocationInfo {
  name: string;
  barangay: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted: string;
  };
  mapX: number; // 0 - 100 percentage on visual map
  mapY: number; // 0 - 100 percentage on visual map
}

export interface AIAnalysis {
  incidentType: string;
  confidence: number; // 0.0 - 1.0
  severityAssessment: Severity;
  severityReasoning: string;
  extractedLocation: string;
  keyHazards: string[];
  suggestedAction: string;
  modelName: string;
  analyzedAt: string;
}

export interface AssignedUnit {
  id: string;
  name: string;
  agency: string;
  contact: string;
  status: 'Dispatched' | 'On Scene' | 'En Route' | 'Standby';
  eta?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  author: string;
  type: 'report' | 'ai_analysis' | 'status_change' | 'unit_assigned' | 'verified' | 'resolved';
}

export interface Incident {
  id: string;
  reportCode: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  urgency: Urgency;
  status: IncidentStatus;
  location: LocationInfo;
  summary: string;
  citizenDescription: string;
  imageUrl?: string;
  hasImage: boolean;
  reportedAt: string;
  reportedTimestamp: number;
  source: 'Citizen App' | 'SMS Gateway' | 'Hotline Report' | 'Barangay Scout';
  aiAnalysis: AIAnalysis;
  assignedUnit?: AssignedUnit;
  verifiedBy?: string;
  timeline: TimelineEvent[];
}
