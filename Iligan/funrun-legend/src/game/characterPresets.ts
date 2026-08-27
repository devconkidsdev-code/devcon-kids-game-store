import { CharacterConfig } from '../types';

export const DEFAULT_BOY_CHARACTER: CharacterConfig = {
  gender: 'boy',
  name: 'Alexander',
  title: 'Province Speedster',
  skinTone: '#E0A96D', // warm Filipino tan
  hairColor: '#212121', // jet black
  hairStyle: 'spiky',
  jerseyColor: '#1E88E5', // vibrant Philippine Blue
  jerseyNumber: '01',
  headbandColor: '#D32F2F', // Champion Red
  shortsColor: '#1565C0',
  shoesColor: '#ECEFF1',
};

export const DEFAULT_GIRL_CHARACTER: CharacterConfig = {
  gender: 'girl',
  name: 'Alexandra',
  title: 'Province Windrunner',
  skinTone: '#E0A96D',
  hairColor: '#1C1917',
  hairStyle: 'ponytail',
  jerseyColor: '#10B981', // Neon Emerald
  jerseyNumber: '07',
  headbandColor: '#F59E0B', // Sunburst Gold
  shortsColor: '#064E3B',
  shoesColor: '#FFFFFF',
};

export const CHARACTER_PRESETS: { id: string; name: string; label: string; config: CharacterConfig }[] = [
  {
    id: 'alexander',
    name: 'Alexander',
    label: 'Alexander (Boy - Speedster)',
    config: DEFAULT_BOY_CHARACTER,
  },
  {
    id: 'alexandra',
    name: 'Alexandra',
    label: 'Alexandra (Girl - Windrunner)',
    config: DEFAULT_GIRL_CHARACTER,
  },
  {
    id: 'maya',
    name: 'Maya',
    label: 'Maya (Girl - Dash Queen)',
    config: {
      gender: 'girl',
      name: 'Maya',
      title: 'Province Dash Queen',
      skinTone: '#C27C4E',
      hairColor: '#3E2723',
      hairStyle: 'long_braid',
      jerseyColor: '#E11D48', // Crimson Rose
      jerseyNumber: '10',
      headbandColor: '#38BDF8', // Sky Blue
      shortsColor: '#881337',
      shoesColor: '#FDE047',
    },
  },
  {
    id: 'leo',
    name: 'Leo',
    label: 'Leo (Boy - Lightning Kid)',
    config: {
      gender: 'boy',
      name: 'Leo',
      title: 'Province Lightning Kid',
      skinTone: '#F5D0A9',
      hairColor: '#78350F',
      hairStyle: 'short_fade',
      jerseyColor: '#F59E0B', // Amber Flame
      jerseyNumber: '99',
      headbandColor: '#10B981', // Emerald
      shortsColor: '#78350F',
      shoesColor: '#18181B',
    },
  },
  {
    id: 'tala',
    name: 'Tala',
    label: 'Tala (Girl - Star Sprinter)',
    config: {
      gender: 'girl',
      name: 'Tala',
      title: 'Celestial Star Sprinter',
      skinTone: '#8D5524',
      hairColor: '#172554',
      hairStyle: 'curly_afro',
      jerseyColor: '#8B5CF6', // Royal Violet
      jerseyNumber: '88',
      headbandColor: '#F43F5E', // Rose
      shortsColor: '#4C1D95',
      shoesColor: '#38BDF8',
    },
  },
];

export const SKIN_TONES = [
  { id: 'fair', label: 'Fair Sun', color: '#F5D0A9' },
  { id: 'warm_tan', label: 'Warm Kayumanggi', color: '#E0A96D' },
  { id: 'bronze', label: 'Golden Bronze', color: '#C27C4E' },
  { id: 'deep_tan', label: 'Deep Island Tone', color: '#8D5524' },
  { id: 'espresso', label: 'Espresso Glow', color: '#5C381E' },
];

export const HAIR_COLORS = [
  { id: 'jet_black', label: 'Jet Black', color: '#18181B' },
  { id: 'dark_brown', label: 'Dark Brown', color: '#3E2723' },
  { id: 'chestnut', label: 'Chestnut', color: '#78350F' },
  { id: 'golden_sun', label: 'Sun Gold', color: '#D97706' },
  { id: 'crimson_flame', label: 'Crimson', color: '#DC2626' },
  { id: 'electric_blue', label: 'Electric Blue', color: '#2563EB' },
  { id: 'emerald_green', label: 'Emerald', color: '#059669' },
];

export const JERSEY_COLORS = [
  { id: 'ph_blue', label: 'Province Blue', color: '#1E88E5' },
  { id: 'emerald', label: 'Neon Emerald', color: '#10B981' },
  { id: 'crimson', label: 'Blaze Crimson', color: '#E11D48' },
  { id: 'amber_gold', label: 'Solar Amber', color: '#F59E0B' },
  { id: 'royal_purple', label: 'Royal Violet', color: '#8B5CF6' },
  { id: 'cyan_glow', label: 'Ocean Cyan', color: '#06B6D4' },
  { id: 'stealth_dark', label: 'Stealth Black', color: '#27272A' },
  { id: 'pure_white', label: 'Flash White', color: '#F8FAFC' },
];

export const HEADBAND_COLORS = [
  { id: 'red', label: 'Champion Red', color: '#D32F2F' },
  { id: 'emerald', label: 'Emerald Glow', color: '#10B981' },
  { id: 'gold', label: 'Sunburst Gold', color: '#F59E0B' },
  { id: 'sky_blue', label: 'Sky Blue', color: '#38BDF8' },
  { id: 'pink_rose', label: 'Hot Pink', color: '#EC4899' },
  { id: 'white', label: 'Bandana White', color: '#F1F5F9' },
  { id: 'none', label: 'No Headband', color: 'transparent' },
];

export const JERSEY_NUMBERS = ['01', '07', '10', '11', '23', '77', '88', '99'];
