import React from 'react';
import { Bookmark, Clock, MapPin, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { EventItem, User } from '../types';
import { formatDateParts } from '../utils/distance';
import { getCleanRegistrationUrl } from '../utils/urlSanitizer';

interface EventCardProps {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: string, e: React.MouseEvent) => void;
  isRegistered?: boolean;
  onRegister?: (eventId: string) => void;
  onEdit?: (event: EventItem) => void;
  onDelete?: (eventId: string) => void;
  showStatusBadge?: boolean;
  user?: User | null;
  onOpenAuth?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  isBookmarked,
  onToggleBookmark,
  isRegistered = false,
  onRegister,
  onEdit,
  onDelete,
  showStatusBadge = false,
  user,
  onOpenAuth,
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

            {/* Category & Subtype Badges & Status */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
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

              {event.source === 'ticketmaster' && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100 flex items-center gap-1">
                  ⚡ Ticketmaster Live API
                </span>
              )}

              {/* Status Badge */}
              {showStatusBadge && event.status && (
                event.status === 'pending' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 font-bold text-[10px] flex items-center gap-1">
                    <span>⏳ Pending Approval</span>
                  </span>
                ) : event.status === 'rejected' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200/90 font-bold text-[10px] flex items-center gap-1">
                    <span>✕ Rejected by Admin</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold text-[10px] flex items-center gap-1">
                    <span>✓ Approved & Live</span>
                  </span>
                )
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
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Distance Tag */}
          {event.distanceKm !== undefined && (
            <span className="text-xs font-semibold text-slate-500">
              {event.distanceKm} km
            </span>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              id={`btn-edit-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
              title="Edit Event Details"
              aria-label="Edit Event Details"
            >
              <Edit className="w-3.5 h-3.5 stroke-[2]" />
              <span>Edit</span>
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              id={`btn-delete-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
              title="Delete Event"
              aria-label="Delete Event"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
              <span>Delete</span>
            </button>
          )}

          {/* Direct External Link Button (Requires Authentication) */}
          <button
            id={`btn-register-link-${event.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                if (onOpenAuth) onOpenAuth();
                return;
              }
              const targetUrl = getCleanRegistrationUrl(event.registrationUrl, event.category, event.title);
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isRegistered
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Open official event registration link"
          >
            <span>{isRegistered ? 'Registered ✓' : 'Register'}</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

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
            aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
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
