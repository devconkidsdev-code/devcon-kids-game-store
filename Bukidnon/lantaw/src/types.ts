export type OperatingStatus = 'open' | 'limited' | 'closed';
export type ClosureReason = 
  | 'Heavy rain' 
  | 'Road conditions' 
  | 'Maintenance' 
  | 'Safety concerns' 
  | 'Holiday' 
  | 'Fully booked' 
  | 'Off-season'
  | 'Other';

export type AccessibilityStatus = 'accessible' | 'limited' | 'inaccessible';
export type AccessibilityReason = 
  | 'Clear paved road'
  | '4x4 vehicle required'
  | 'Heavy rainfall causing slippery trail'
  | 'Road construction on Sayre Highway bypass'
  | 'Landslide clearance in progress'
  | 'River crossing water level elevated'
  | 'Normal trail conditions'
  | 'Bridge maintenance';

export type SpotCategory = 
  | 'Adventure' 
  | 'Mountains & Trekking' 
  | 'Nature & Eco-parks' 
  | 'Waterfalls & Springs' 
  | 'Culture & Heritage' 
  | 'Agro-Tourism & Farms' 
  | 'Camping & Viewpoints';

export interface WeatherInfo {
  condition: 'Sunny' | 'Partly Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Foggy / Overcast' | 'Thunderstorm';
  tempC: number;
  rainProb: number;
  warning?: string;
  windKmh?: number;
}

export interface ActivityFee {
  name: string;
  price: number;
  unit: string; // e.g. 'per person', 'per ride', 'per tent'
  required?: boolean;
}

export interface TouristSpot {
  id: string;
  name: string;
  tagline: string;
  municipality: string; // e.g. 'Manolo Fortich', 'Malaybalay City', 'Valencia City', 'Impasug-ong', 'Lantapan', 'Maramag', 'Quezon', 'Pangantucan'
  locationDescription: string;
  category: SpotCategory;
  description: string;
  images: string[];
  thumbnail: string;
  
  // Coordinates for the visual illustrated map (in % 0-100 of map viewBox)
  mapCoordinates: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
  geoCoordinates: {
    lat: number;
    lng: number;
  };
  
  // Operational details (Owner-managed)
  operatingStatus: OperatingStatus;
  closureReason?: ClosureReason;
  operatingHours: {
    days: string;
    openTime: string;
    closeTime: string;
    notes?: string;
  };
  
  // Accessibility details
  accessibilityStatus: AccessibilityStatus;
  accessibilityReason?: AccessibilityReason | string;
  vehicleRequirement?: 'All vehicles' | 'Motorcycle / Sedan' | '4x4 / High Clearance' | 'Trek / Guide Required';
  
  // Weather
  weather: WeatherInfo;
  
  // Pricing & activities
  entranceFee: {
    adult: number;
    child: number;
    seniorOrPwd: number;
    foreign?: number;
  };
  activities: ActivityFee[];
  
  // Meta
  estimatedDuration: string; // e.g. '3-4 hours', 'Full Day', 'Overnight'
  capacity: {
    maxDaily: number;
    currentBookingsToday: number;
  };
  contact: {
    phone: string;
    email: string;
    facebookPage?: string;
  };
  requirements?: string[];
  
  // Trust & Verification
  isVerified: boolean;
  ownerId: string;
  ownerName: string;
  lastUpdated: string; // e.g. "August 15, 2026, 9:30 AM"
  updatedBy: string; // e.g. "Tourist Spot Owner"
  
  rating: number;
  reviewCount: number;
  featured?: boolean;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  referenceNumber: string;
  spotId: string;
  spotName: string;
  spotMunicipality: string;
  spotThumbnail: string;
  touristName: string;
  touristEmail: string;
  touristPhone: string;
  touristOrigin: string; // e.g. 'Manila', 'Cagayan de Oro', 'Davao City'
  visitDate: string;
  timeSlot: string;
  visitors: {
    adults: number;
    children: number;
    seniors: number;
  };
  selectedActivities: string[];
  totalAmount: number;
  status: BookingStatus;
  rejectionReason?: string;
  bookingDate: string;
  notes?: string;
  isPaidAtCounter: boolean;
}

export type ReportCategory = 
  | 'Incorrect price' 
  | 'Incorrect operating hours' 
  | 'Tourist spot is closed' 
  | 'Incorrect location' 
  | 'Incorrect contact information' 
  | 'Incorrect description' 
  | 'Road condition changed'
  | 'Other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';

export interface SpotReport {
  id: string;
  spotId: string;
  spotName: string;
  reporterName: string;
  reporterEmail: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface RouteStop {
  id: string;
  name: string;
  municipality: string;
  x: number;
  y: number;
}

export interface CalculatedRoute {
  origin: string;
  destination: TouristSpot;
  type: 'fastest' | 'shortest' | 'scenic';
  distanceKm: number;
  durationFormatted: string;
  estimatedFuelPhp: number;
  hasRoadWarning: boolean;
  warningDetails?: string;
  detourAvailable?: boolean;
  waypoints: { name: string; timeFromStart: string; distanceKm: number; note?: string }[];
  pathPoints: { x: number; y: number }[];
}

export interface BudgetEstimate {
  travelers: number;
  days: number;
  transportMode: 'Public Bus / Van' | 'Private Car Rental' | 'Motorcycle / Habal-habal' | 'Own Vehicle';
  transportCost: number;
  accommodationTier: 'Budget / Homestay' | 'Mid-range Resort' | 'Glamping / Premium Lodge';
  accommodationCost: number;
  foodCost: number;
  activityCost: number;
  entranceCost: number;
  emergencyFund: number;
  totalEstimated: number;
  perPersonCost: number;
}

export interface ItineraryItem {
  id: string;
  spotId: string;
  spotName: string;
  time: string;
  duration: string;
  notes: string;
  cost: number;
  status: OperatingStatus;
  accessibility: AccessibilityStatus;
  weather: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  date?: string;
  items: ItineraryItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  spotSuggestions?: string[]; // spot IDs mentioned for quick cards
  budgetBreakdown?: BudgetEstimate;
  warning?: string;
}

export type UserRole = 'tourist' | 'owner' | 'admin';
