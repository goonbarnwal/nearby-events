import React from 'react';
import { Bookmark, Clock, MapPin, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import { EventItem } from '../types';
import { formatDateParts } from '../utils/distance';

interface EventCardProps {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: string, e: React.MouseEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  isBookmarked,
  onToggleBookmark,
}) => {
  const { month, day, dayOfWeek } = formatDateParts(event.startDate);

  // Category badge color theme mapping
  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tech':
      case 'hackathon':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'workshop':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'business':
      case 'startup':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'music':
      case 'concert':
        return 'bg-pink-50 text-pink-600 border-pink-100';
      case 'sports':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'food':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id={`event-card-${event.id}`}
      onClick={() => onViewDetails(event)}
      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all duration-150 cursor-pointer group relative"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left Side: Date Box + Details */}
        <div className="flex items-start gap-4 sm:gap-6 w-full sm:w-auto min-w-0">
          
          {/* Date Badge Box */}
          <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-16 sm:h-18 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0 text-center py-1">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
              {month}
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 leading-none my-0.5">
              {day}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              {dayOfWeek}
            </span>
          </div>

          {/* Event Content Info */}
          <div className="space-y-1 flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-snug line-clamp-1">
              {event.title}
            </h3>

            {/* Category & Subtype Badges */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${getCategoryTheme(
                  event.category
                )}`}
              >
                {event.category}
              </span>
              {event.subtype && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
                  {event.subtype}
                </span>
              )}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.timeString}</span>
            </div>

            {/* Venue & City */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {event.venue}, {event.city}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Distance, Register Link & Bookmark */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Distance Tag */}
          {event.distanceKm !== undefined && (
            <span className="text-xs font-semibold text-slate-500">
              {event.distanceKm} km
            </span>
          )}

          {/* Direct Registration Link Button */}
          {event.registrationUrl && (
            <a
              id={`btn-register-link-${event.id}`}
              href={event.registrationUrl.startsWith('http') ? event.registrationUrl : `https://${event.registrationUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
              title="Open official registration link"
            >
              <span>Register</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
            </a>
          )}

          {/* Bookmark Icon Button */}
          <button
            id={`btn-bookmark-${event.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(event.id, e);
            }}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
          >
            <Bookmark
              className={`w-4 h-4 stroke-[2] ${
                isBookmarked ? 'fill-blue-600 text-blue-600' : ''
              }`}
            />
          </button>
        </div>

      </div>
    </div>
  );
};
