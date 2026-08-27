import { useState } from 'react';
import { 
  CategoryType, 
  CuratedItinerary, 
  Landmark 
} from './types';
import { 
  BUKIDNON_LANDMARKS, 
  CURATED_ITINERARIES 
} from './data/bukidnonData';
import { HeaderNav } from './components/HeaderNav';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { BukidnonIllustratedMap } from './components/BukidnonIllustratedMap';
import { AttractionModal } from './components/AttractionModal';
import { TripPlannerDrawer } from './components/TripPlannerDrawer';
import { CulturePassportModal } from './components/CulturePassportModal';
import { BookingModal } from './components/BookingModal';

export default function App() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'sunny' | 'misty' | 'golden' | 'night'>('sunny');
  
  // Trip planner & Itinerary state
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<CuratedItinerary | null>(CURATED_ITINERARIES[0]);
  const [customSavedLandmarkIds, setCustomSavedLandmarkIds] = useState<string[]>([
    'dahilayan_adventure',
    'del_monte_plantation',
    'communal_ranch',
    'monastery_transfiguration',
    'lake_apo_crater',
  ]);

  // Modals state
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{
    landmark: Landmark | null;
    customTitle?: string;
    customLandmarks?: Landmark[];
  } | null>(null);

  // Toggle landmark in custom itinerary
  const handleToggleItinerary = (landmarkId: string) => {
    setCustomSavedLandmarkIds((prev) =>
      prev.includes(landmarkId)
        ? prev.filter((id) => id !== landmarkId)
        : [...prev, landmarkId]
    );
  };

  const handleRemoveFromCustom = (landmarkId: string) => {
    setCustomSavedLandmarkIds((prev) => prev.filter((id) => id !== landmarkId));
  };

  // Open booking modal for single landmark
  const handleOpenBooking = (landmark: Landmark) => {
    setBookingTarget({ landmark });
  };

  // Open booking modal for curated/custom multi-stop itinerary
  const handleOpenBookingForItinerary = (title: string, landmarks: Landmark[]) => {
    setBookingTarget({
      landmark: null,
      customTitle: title,
      customLandmarks: landmarks,
    });
  };

  // Active itinerary IDs currently drawn on the map
  const activeItineraryIds = selectedItinerary
    ? selectedItinerary.landmarkIds
    : customSavedLandmarkIds;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF0] text-[#2D3436] font-sans selection:bg-[#799F0C] selection:text-white">
      {/* Top Header Navigation & Live Weather */}
      <HeaderNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTripPlanner={() => setIsTripPlannerOpen(true)}
        onOpenPassport={() => setIsPassportOpen(true)}
        savedItineraryCount={customSavedLandmarkIds.length}
      />

      {/* Floating Dynamic Category Pill Bar */}
      <div className="bg-[#FDFCF0]/90 border-b border-[#799F0C]/15 backdrop-blur-md z-30 shadow-xs">
        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Centerpiece Hero: The 3D Illustrated Animated Bukidnon Map */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <BukidnonIllustratedMap
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          activeLandmark={activeLandmark}
          onSelectLandmark={setActiveLandmark}
          activeItineraryIds={activeItineraryIds}
          timeOfDay={timeOfDay}
          onTimeOfDayChange={setTimeOfDay}
          onOpenBooking={handleOpenBooking}
          onOpenPassport={() => setIsPassportOpen(true)}
        />
      </main>

      {/* Attraction Full Details Popup Modal */}
      <AttractionModal
        landmark={activeLandmark}
        onClose={() => setActiveLandmark(null)}
        onOpenBooking={handleOpenBooking}
        isSavedInItinerary={
          activeLandmark ? customSavedLandmarkIds.includes(activeLandmark.id) : false
        }
        onToggleItinerary={handleToggleItinerary}
      />

      {/* Trip Planner Slide-Over Drawer */}
      <TripPlannerDrawer
        isOpen={isTripPlannerOpen}
        onClose={() => setIsTripPlannerOpen(false)}
        selectedItinerary={selectedItinerary}
        onSelectItinerary={setSelectedItinerary}
        customSavedLandmarkIds={customSavedLandmarkIds}
        onRemoveFromCustom={handleRemoveFromCustom}
        onSelectLandmark={(lm) => {
          setActiveLandmark(lm);
          setIsTripPlannerOpen(false);
        }}
        onOpenBookingForItinerary={handleOpenBookingForItinerary}
      />

      {/* 7 Tribes Cultural Passport Modal */}
      <CulturePassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />

      {/* Eco-Tour & Travel Permit Booking Modal */}
      <BookingModal
        isOpen={bookingTarget !== null}
        onClose={() => setBookingTarget(null)}
        landmark={bookingTarget?.landmark || null}
        customTitle={bookingTarget?.customTitle}
        customLandmarks={bookingTarget?.customLandmarks}
      />
    </div>
  );
}
