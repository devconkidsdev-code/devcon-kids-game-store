import { BoatCustomization, CharacterGender } from '../types/game';

export const BOAT_TYPES: { id: BoatCustomization['boatType']; name: string; icon: string; perk: string }[] = [
  { id: 'speedboat', name: 'Speedboat Classic', icon: '🚤', perk: 'Smooth steering & balanced acceleration' },
  { id: 'jetski', name: 'Wave Runner Jet Ski', icon: '🌊', perk: 'Quick lane transition speed' },
  { id: 'hovercraft', name: 'Aero Hovercraft', icon: '💨', perk: 'Drift stability & soft landing' },
  { id: 'dragonboat', name: 'Dragon Cruiser', icon: '🐉', perk: 'High top speed momentum' }
];

export interface CharacterOption {
  id: string;
  name: string;
  gender: CharacterGender;
  emoji: string;
  title: string;
  hairColor: string;
  jacketColor: string;
  description: string;
}

export const CHARACTER_OPTIONS: CharacterOption[] = [
  // Woman Captains & Racers
  {
    id: 'woman_captain',
    name: 'Captain Maya',
    gender: 'woman',
    emoji: '👩‍✈️',
    title: 'Grand Helmswoman',
    hairColor: '#451a03', // Brunette
    jacketColor: '#ef4444',
    description: 'Expert navigator who mastered the swiftest river currents.'
  },
  {
    id: 'woman_racer',
    name: 'Racer Mia',
    gender: 'woman',
    emoji: '🏎️',
    title: 'Speedway Champion',
    hairColor: '#ca8a04', // Blonde
    jacketColor: '#ec4899',
    description: 'Fearless speedster known for split-second reaction turns.'
  },
  {
    id: 'woman_sailor',
    name: 'Sailor Sarah',
    gender: 'woman',
    emoji: '🏄‍♀️',
    title: 'Wave Surfer',
    hairColor: '#dc2626', // Auburn / Red
    jacketColor: '#06b6d4',
    description: 'Agile river racer with incredible balance and stamina.'
  },
  {
    id: 'woman_diver',
    name: 'Skipper Emma',
    gender: 'woman',
    emoji: '🤿',
    title: 'Rapids Specialist',
    hairColor: '#1e293b', // Black
    jacketColor: '#10b981',
    description: 'Calm under pressure with eagle-eyed hazard detection.'
  },

  // Man Captains & Racers
  {
    id: 'man_captain',
    name: 'Captain Leo',
    gender: 'man',
    emoji: '👨‍✈️',
    title: 'Veteran Skipper',
    hairColor: '#451a03', // Brown
    jacketColor: '#2563eb',
    description: 'Seasoned boat captain with unmatched slalom control.'
  },
  {
    id: 'man_racer',
    name: 'Racer Jack',
    gender: 'man',
    emoji: '🏎️',
    title: 'Turbo Ace',
    hairColor: '#ca8a04', // Blonde
    jacketColor: '#f59e0b',
    description: 'High-octane racer who pushes turbo boosters to the absolute max.'
  },
  {
    id: 'man_sailor',
    name: 'Sailor Alex',
    gender: 'man',
    emoji: '🏄‍♂️',
    title: 'River Maverick',
    hairColor: '#1e293b', // Black
    jacketColor: '#8b5cf6',
    description: 'Bold speed fanatic adept at dodging submerged river rocks.'
  },
  {
    id: 'man_diver',
    name: 'Skipper Ethan',
    gender: 'man',
    emoji: '🤿',
    title: 'Current Master',
    hairColor: '#78350f', // Chestnut
    jacketColor: '#059669',
    description: 'Calculated tactician who finds the smoothest water lines.'
  }
];

export const CHARACTER_AVATARS = CHARACTER_OPTIONS;

export const DEFAULT_PLAYER_1: BoatCustomization = {
  id: 'player1',
  name: 'Red Boat',
  gender: 'woman',
  boatColor: '#ef4444', // Vibrant Red
  trimColor: '#fee2e2', // Light Red / White trim
  boatType: 'speedboat',
  character: 'woman_captain',
  characterName: 'Captain Maya'
};

export const DEFAULT_PLAYER_2: BoatCustomization = {
  id: 'player2',
  name: 'Blue Boat',
  gender: 'man',
  boatColor: '#2563eb', // Royal Blue
  trimColor: '#dbeafe', // Light Blue / White trim
  boatType: 'speedboat',
  character: 'man_captain',
  characterName: 'Captain Leo'
};
