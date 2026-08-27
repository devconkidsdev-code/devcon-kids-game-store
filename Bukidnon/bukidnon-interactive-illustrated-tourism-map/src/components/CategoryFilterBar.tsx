import React from 'react';
import { CategoryType } from '../types';
import { CATEGORIES } from '../data/bukidnonData';
import { 
  Sparkles, 
  Mountain, 
  Compass, 
  Wheat, 
  Droplets, 
  Landmark as LandmarkIcon, 
  Coffee 
} from 'lucide-react';
import { soundscape } from '../utils/soundscape';

interface CategoryFilterBarProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

export function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const getIcon = (id: CategoryType) => {
    switch (id) {
      case 'mountains':
        return <Mountain className="w-3.5 h-3.5" />;
      case 'adventure':
        return <Compass className="w-3.5 h-3.5" />;
      case 'farms':
        return <Wheat className="w-3.5 h-3.5" />;
      case 'waterfalls':
        return <Droplets className="w-3.5 h-3.5" />;
      case 'culture':
        return <LandmarkIcon className="w-3.5 h-3.5" />;
      case 'coffee_dining':
        return <Coffee className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getDotColor = (id: CategoryType) => {
    switch (id) {
      case 'mountains':
        return 'bg-[#799F0C]';
      case 'adventure':
        return 'bg-[#FF9F1C]';
      case 'farms':
        return 'bg-[#F5B041]';
      case 'waterfalls':
        return 'bg-[#3498DB]';
      case 'culture':
        return 'bg-[#8E44AD]';
      case 'coffee_dining':
        return 'bg-[#BC4749]';
      default:
        return 'bg-[#799F0C]';
    }
  };

  return (
    <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-2.5 px-4 gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const dotColor = getDotColor(cat.id);
        return (
          <button
            key={cat.id}
            id={`category-filter-${cat.id}`}
            onClick={() => {
              onSelectCategory(cat.id);
              soundscape.playInteractivePop();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shadow-xs ${
              isSelected
                ? 'bg-[#1E392A] text-white shadow-md shadow-[#1E392A]/20 scale-105'
                : 'bg-white hover:bg-[#F5F9E8] text-[#4A5A40] hover:text-[#1E392A] border border-[#799F0C]/15 hover:border-[#799F0C]/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#A7C957]' : dotColor}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

