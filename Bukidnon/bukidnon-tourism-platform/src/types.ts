export type OperatingStatus = 'open' | 'limited' | 'closed';
export type AccessibilityStatus = 'accessible' | 'limited' | 'inaccessible';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'rejected';
export type UserRole = 'tourist' | 'owner' | 'admin';

export type SpotCategory = 'Adventure' | 'Mountain/Hiking' | 'Waterfalls' | 'Nature & Lakes' | 'Agro-Farms' | 'Cultural/Heritage' | 'Springs & Resorts' | 'Scenic Overlooks';

export interface ActivityFee {
  id: string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
}

export interface WeatherInfo {
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Windy';
  temp: number; // in Celsius
  rainProbability: number; // 0 - 100
  humidity: number; // percentage
  windSpeed: number; // km/h
  warning?: string;
}

export interface TouristSpot {
  id: number;
  name: string;
  tagline: string;
  category: 'Adventure' | 'Mountain/Hiking' | 'Waterfalls' | 'Nature & Lakes' | 'Agro-Farms' | 'Cultural/Heritage' | 'Springs & Resorts' | 'Scenic Overlooks';
  municipality: string;
  address: string;
  coords: { x: number; y: number }; // SVG map normalized coords (0-500 x, 0-600 y)
  latLng: { lat: number; lng: number };
  description: string;
  history?: string;
  images: string[];
  contactPhone: string;
  contactEmail: string;
  website?: string;
  operatingHours: string;
  entranceFee: number;
  childFee?: number;
  seniorFee?: number;
  activityFees: ActivityFee[];
  activities: string[];
  amenities: string[];
  estimatedVisitDuration: string; // e.g. "3-4 hours", "Full day"
  maxDailyCapacity: number;
  currentVisitorsToday: number;
  
  // Real-Time Trust & Operational Status
  operatingStatus: OperatingStatus;
  operatingStatusReason?: string;
  accessibilityStatus: AccessibilityStatus;
  accessibilityReason?: string;
  weather: WeatherInfo;
  
  lastUpdated: string; // e.g. "Aug 15, 2026, 9:30 AM"
  updatedBy: string; // e.g. "Dahilayan Admin Staff (Owner)"
  ownerId: number;
  ownerName: string;
  
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  isRainAffected: boolean;
  bestTimeToVisit: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  spotId: number;
  spotName: string;
  spotImage: string;
  touristName: string;
  touristEmail: string;
  touristPhone: string;
  visitDate: string;
  timeSlot: string;
  visitorsCount: number;
  selectedActivities: string[];
  specialRequests?: string;
  totalAmount: number;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt: string;
  qrCodeUrl?: string;
}

export interface InaccuracyReport {
  id: string;
  spotId: number;
  spotName: string;
  category: 'price' | 'hours' | 'closed' | 'location' | 'contact' | 'description' | 'weather' | 'other';
  details: string;
  reportedBy: string;
  reportedAt: string;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface OwnerProfile {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  spotId: number;
  spotName: string;
  isVerified: boolean;
  joinedDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  suggestions?: string[];
  spotCards?: number[];
  budgetBreakdown?: {
    travelers: number;
    days: number;
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    entrance: number;
    total: number;
  };
  itinerarySuggestion?: {
    title: string;
    days: {
      day: number;
      theme: string;
      stops: { time: string; spotName: string; activity: string }[];
    }[];
  };
  navigationAdvice?: {
    origin: string;
    destination: string;
    distance: string;
    time: string;
    roadCondition: string;
  };
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  durationMins: number;
  trafficStatus: 'smooth' | 'moderate' | 'heavy' | 'affected_by_weather';
  warning?: string;
  waypoints: string[];
  pathPoints: { x: number; y: number }[];
}

export interface ItineraryPlan {
  id: string;
  title: string;
  travelersCount: number;
  startDate: string;
  days: {
    dayNumber: number;
    date: string;
    items: {
      id: string;
      time: string;
      spotId: number;
      notes: string;
    }[];
  }[];
}
