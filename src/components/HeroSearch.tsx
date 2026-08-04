import React from 'react';
import { MapPin, Search, Calendar as CalendarIcon, ChevronDown, LocateFixed, Loader2, X } from 'lucide-react';
import { FilterState, UserLocation } from '../types';

interface HeroSearchProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  location: UserLocation;
  onRequestLocation: () => void;
  isLocating: boolean;
  onExecuteSearch: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  filters,
  setFilters,
  location,
  onRequestLocation,
  isLocating,
  onExecuteSearch,
  searchInputRef,
}) => {
  const categoriesList = [
    'All Categories',
    'Tech',
    'Hackathon',
    'Workshop',
    'Music',
    'Sports',
    'Business',
    'Food',
    'Comedy',
    'Exhibition',
    'Startup',
  ];

  return (
    <div className="pt-8 pb-6">
      {/* Headings */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
          Discover Events
          <br />
          Near You
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-xl">
          Find tech events, concerts, workshops, hackathons and more happening around you.
        </p>
      </div>

      {/* Hero Search Box Card */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
          
          {/* Location Field */}
          <div className="md:col-span-3 relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/10">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
            <input
              id="input-location"
              type="text"
              aria-label="Location"
              value={filters.locationQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, locationQuery: e.target.value }))}
              onFocus={(e) => e.target.select()}
              placeholder="Search city or location..."
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {filters.locationQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, locationQuery: '' }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0 mr-1 transition-colors"
                title="Clear location"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="btn-detect-location"
              type="button"
              onClick={() => {
                onRequestLocation();
                setFilters((prev) => ({ ...prev, locationQuery: location.city || 'Pune' }));
              }}
              disabled={isLocating}
              aria-label="Detect my current location"
              className="p-1 text-blue-600 hover:text-blue-800 rounded-xl transition-colors shrink-0"
              title="Detect my current location"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <LocateFixed className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>

          {/* Search Query Field */}
          <div className="md:col-span-4 relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/10">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              id="input-search-events"
              ref={searchInputRef}
              type="text"
              aria-label="Search events, venues..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && onExecuteSearch()}
              placeholder="Search events, venues..."
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2 relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/10">
            <select
              id="select-category"
              aria-label="Filter events by category"
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-transparent text-sm font-medium text-slate-700 cursor-pointer focus:outline-none appearance-none pr-6"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? 'All' : cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
          </div>

          {/* Date Selector */}
          <div className="md:col-span-2 relative flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl px-3.5 py-2.5 transition-all focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/10">
            <select
              id="select-date-filter"
              aria-label="Filter events by date"
              value={filters.dateFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFilter: e.target.value }))}
              className="w-full bg-transparent text-sm font-medium text-slate-700 cursor-pointer focus:outline-none appearance-none pr-6"
            >
              <option value="all">Select Date</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
            <CalendarIcon className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3" />
          </div>

          {/* Search Button */}
          <div className="md:col-span-1">
            <button
              id="btn-hero-search"
              onClick={onExecuteSearch}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5"
            >
              Search
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
