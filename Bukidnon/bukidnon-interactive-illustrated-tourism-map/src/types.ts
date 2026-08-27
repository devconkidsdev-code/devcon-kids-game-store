export type CategoryType = 
  | 'all'
  | 'mountains'
  | 'adventure'
  | 'farms'
  | 'waterfalls'
  | 'culture'
  | 'coffee_dining';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  description: string;
}

export type MunicipalityId =
  | 'manolo_fortich'
  | 'sumilao'
  | 'impasug_ong'
  | 'malaybalay'
  | 'lantapan'
  | 'valencia'
  | 'maramag'
  | 'quezon'
  | 'don_carlos'
  | 'talakag'
  | 'pangantucan'
  | 'san_fernando'
  | 'baungon'
  | 'malitbog'
  | 'kibawe'
  | 'damulog'
  | 'cabanglasan';

export interface Municipality {
  id: MunicipalityId;
  name: string;
  nickname: string;
  tagline: string;
  mapCoords: { x: number; y: number }; // Percentage on map canvas
  elevation: string;
  district: 'North Bukidnon' | 'Central Bukidnon' | 'South Bukidnon';
}

export interface Landmark {
  id: string;
  title: string;
  tagline: string;
  municipalityId: MunicipalityId;
  municipalityName: string;
  category: CategoryType;
  coords: { x: number; y: number }; // 0 to 1000 coordinate space
  elevation: string;
  bestTime: string;
  travelTimeFromCDO: string;
  highlights: string[];
  description: string;
  tribalLore?: string;
  activities: string[];
  imageUrl: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  entryFee: string;
  contactNumber?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Technical';
  funFact: string;
  iconType: 
    | 'pineapple'
    | 'zipline'
    | 'mountain'
    | 'ranch'
    | 'monastery'
    | 'lake'
    | 'waterfall'
    | 'volcano'
    | 'statue'
    | 'culture'
    | 'cave'
    | 'farm'
    | 'coffee'
    | 'camp'
    | 'bridge'
    | 'spring'
    | 'dam'
    | 'forest';
}

export interface AnimatedVehicle {
  id: string;
  type: 'jeepney' | 'pineapple_truck' | 'tour_van' | 'adventure_4x4';
  roadPathId: string;
  duration: number; // seconds
  color: string;
  label: string;
}

export interface ItineraryItem {
  landmarkId: string;
  day: number;
  timeSlot: 'Morning' | 'Afternoon' | 'Sunset/Night';
  activityNotes: string;
}

export interface CuratedItinerary {
  id: string;
  title: string;
  durationDays: number;
  difficulty: 'Relaxed' | 'Active' | 'High Adventure' | 'Cultural Immersion';
  description: string;
  landmarkIds: string[];
  recommendedSeason: string;
  tags: string[];
}

export interface AIStopPlan {
  landmarkId?: string;
  landmarkTitle: string;
  municipality: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Sunset/Night';
  activityDescription: string;
  travelTip: string;
  mealRecommendation: string;
  entranceFee: string;
}

export interface AIDayPlan {
  day: number;
  dayTitle: string;
  areaFocus: string;
  stops: AIStopPlan[];
}

export interface AIGeneratedItinerary {
  title: string;
  tagline: string;
  durationDays: number;
  difficulty: 'Relaxed' | 'Active' | 'High Adventure' | 'Cultural Immersion';
  recommendedSeason: string;
  estimatedTotalCostPerPerson: string;
  packingAdvice: string[];
  weatherAdvisory: string;
  curatedLandmarkIds: string[];
  days: AIDayPlan[];
  aiSummary: string;
  generatedBy: string;
}

export interface AIPrefsForm {
  durationDays: number;
  travelStyle: string;
  startPoint: string;
  pace: string;
  budget: string;
  groupType: string;
  specialNotes: string;
}

export interface TribalCommunity {
  id: string;
  name: string;
  territory: string;
  distinctTradition: string;
  musicalInstrument: string;
  sacredSymbol: string;
  description: string;
  soilPaintingCraft?: string;
}

export interface BookingRequest {
  landmarkId: string;
  landmarkTitle: string;
  serviceType: 'Eco Tour' | 'Trek Guide' | 'Park Pass' | 'Farmstay' | 'Coffee Tasting' | 'Camp Rental';
  date: string;
  guests: number;
  leadName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}
