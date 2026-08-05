import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Laptop,
  Code,
  Wrench,
  Music2,
  Trophy,
  Briefcase,
  UtensilsCrossed,
  ChevronDown,
  Sparkles,
  Laugh,
  Rocket,
  Palette,
} from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const mainPills = [
    { label: 'All', icon: SlidersHorizontal },
    { label: 'Tech', icon: Laptop },
    { label: 'Hackathon', icon: Code },
    { label: 'Workshop', icon: Wrench },
    { label: 'Music', icon: Music2 },
    { label: 'Sports', icon: Trophy },
    { label: 'Business', icon: Briefcase },
    { label: 'Food', icon: UtensilsCrossed },
  ];

  const extraCategories = [
    { label: 'Comedy', icon: Laugh },
    { label: 'Startup', icon: Rocket },
    { label: 'Exhibition', icon: Palette },
    { label: 'Community', icon: Sparkles },
  ];

  return (
    <div className="py-4">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth">
        {mainPills.map((pill) => {
          const IconComponent = pill.icon;
          const isSelected =
            selectedCategory === pill.label ||
            (pill.label === 'All' && (selectedCategory === '' || selectedCategory === 'All'));

          return (
            <button
              key={pill.label}
              id={`pill-category-${pill.label.toLowerCase()}`}
              onClick={() => onSelectCategory(pill.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}

        {/* More Categories Dropdown Pill */}
        <div className="relative shrink-0">
          {moreDropdownOpen && (
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMoreDropdownOpen(false)}
            />
          )}
          
          {(() => {
            const isExtraSelected = extraCategories.some(
              (c) => c.label.toLowerCase() === selectedCategory?.toLowerCase()
            );

            return (
              <button
                id="btn-category-more"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                aria-label="More categories dropdown"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border cursor-pointer ${
                  isExtraSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{isExtraSelected ? `More (${selectedCategory})` : 'More'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isExtraSelected ? 'text-white' : 'text-slate-500'
                  } ${moreDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
            );
          })()}

          {moreDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-1.5 space-y-1">
              {extraCategories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = selectedCategory?.toLowerCase() === cat.label.toLowerCase();

                return (
                  <button
                    key={cat.label}
                    onClick={() => {
                      onSelectCategory(cat.label);
                      setMoreDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <CatIcon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
