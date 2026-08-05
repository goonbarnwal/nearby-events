import React, { useState } from 'react';
import { Bookmark, Sparkles, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { EventItem } from '../types';
import { formatDateParts } from '../utils/distance';

interface SidebarWidgetsProps {
  upcomingEvents: EventItem[];
  onViewDetails: (event: EventItem) => void;
  onSelectCity: (cityName: string) => void;
  onOpenAiRecommendations: () => void;
  bookmarkedIds: string[];
  onToggleBookmark: (eventId: string, e: React.MouseEvent) => void;
  onSelectCategory?: (category: string) => void;
  currentCity?: string;
  currentCategory?: string;
}

export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
  upcomingEvents,
  onViewDetails,
  onSelectCity,
  onOpenAiRecommendations,
  bookmarkedIds,
  onToggleBookmark,
  onSelectCategory,
  currentCity,
  currentCategory,
}) => {
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  const mainCategories = [
    'Tech',
    'Hackathon',
    'Workshop',
    'Music',
    'Sports',
    'Business',
    'Food',
  ];

  const extraCategories = [
    'Comedy',
    'Startup',
    'Community',
    'Exhibition',
  ];

  const isExtraActive = currentCategory && extraCategories.some(c => c.toLowerCase() === currentCategory.toLowerCase());
  const isExpanded = showMoreCategories || isExtraActive;

  const popularCities = [
    'Pune',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
  ];

  return (
    <div className="space-y-6">
      
      {/* Widget 1: Popular Categories */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Popular Categories
          </h2>
          {isExtraActive && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {currentCategory}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {mainCategories.map((cat) => {
            const isCatActive =
              currentCategory && currentCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                id={`cat-link-${cat.toLowerCase()}`}
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className={`w-full flex items-center justify-between py-2.5 text-xs sm:text-sm font-medium px-2 rounded-lg transition-colors text-left group cursor-pointer ${
                  isCatActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/80'
                }`}
              >
                <span>{cat}</span>
                <ChevronRight className={`w-4 h-4 transition-all ${isCatActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5'}`} />
              </button>
            );
          })}

          {/* Expanded Extra Categories */}
          {isExpanded && extraCategories.map((cat) => {
            const isCatActive =
              currentCategory && currentCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                id={`cat-link-${cat.toLowerCase()}`}
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className={`w-full flex items-center justify-between py-2.5 text-xs sm:text-sm font-medium px-2 rounded-lg transition-colors text-left group cursor-pointer ${
                  isCatActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{cat}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-all ${isCatActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5'}`} />
              </button>
            );
          })}

          {/* Toggle More / Less Categories Button */}
          <button
            type="button"
            id="cat-link-more"
            onClick={() => setShowMoreCategories(!showMoreCategories)}
            className={`w-full flex items-center justify-between py-2.5 text-xs sm:text-sm font-semibold px-2 rounded-lg transition-colors text-left cursor-pointer ${
              isExpanded ? 'text-blue-600 hover:bg-blue-50/50' : 'text-blue-600 hover:bg-slate-50'
            }`}
          >
            <span>{isExpanded ? 'Show Less' : 'More'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Widget 2: Popular Cities */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-3">
          Popular Cities
        </h2>

        <div className="divide-y divide-slate-100">
          {popularCities.map((cityName) => {
            const isCityActive =
              currentCity && currentCity.toLowerCase().includes(cityName.toLowerCase());

            return (
              <button
                key={cityName}
                id={`city-link-${cityName.toLowerCase()}`}
                onClick={() => onSelectCity(cityName)}
                className={`w-full flex items-center justify-between py-2.5 text-xs sm:text-sm font-medium px-2 rounded-lg transition-colors text-left group ${
                  isCityActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50/80'
                }`}
              >
                <span>{cityName}</span>
                <ChevronRight className={`w-4 h-4 transition-all ${isCityActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Widget 3: AI Recommendations Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/50 rounded-2xl border border-blue-100 p-5 shadow-2xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-blue-950 tracking-tight">AI Event Suggestions</h2>
        </div>

        <p className="text-xs font-medium text-slate-600 mb-3.5">
          Get Gemini AI recommendations tailored for your location.
        </p>

        <button
          id="btn-get-ai-recommendations"
          onClick={onOpenAiRecommendations}
          className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Get AI Suggestions</span>
        </button>
      </div>

    </div>
  );
};
