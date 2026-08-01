import React, { useState } from 'react';
import { Bookmark, Calendar, User, Ticket, Plus } from 'lucide-react';
import { EventItem, User as UserType } from '../types';
import { EventCard } from './EventCard';

interface MyEventsViewProps {
  allEvents: EventItem[];
  myCreatedEvents: EventItem[];
  bookmarkedIds: string[];
  registeredIds: string[];
  user: UserType | null;
  onViewDetails: (event: EventItem) => void;
  onToggleBookmark: (eventId: string, e: React.MouseEvent) => void;
  onCreateNewClick: () => void;
  onEditEvent?: (event: EventItem) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const MyEventsView: React.FC<MyEventsViewProps> = ({
  allEvents,
  myCreatedEvents,
  bookmarkedIds,
  registeredIds,
  user,
  onViewDetails,
  onToggleBookmark,
  onCreateNewClick,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'registered' | 'created'>('bookmarks');

  const bookmarkedEvents = allEvents.filter((e) => bookmarkedIds.includes(e.id));
  const registeredEvents = allEvents.filter((e) => registeredIds.includes(e.id));
  const createdEventsList = myCreatedEvents.length > 0 ? myCreatedEvents : allEvents.filter((e) => e.source === 'user' || (user && e.createdByEmail === user.email));

  return (
    <div className="py-8 space-y-6">
      {/* Header Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {user ? user.name : 'Guest User'}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              {user ? user.email : 'Login to save your bookmarks & event registrations'}
            </p>
          </div>
        </div>

        <button
          onClick={onCreateNewClick}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'bookmarks'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Bookmarks ({bookmarkedEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'registered'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>My Registrations ({registeredEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('created')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'created'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Created Events ({createdEventsList.length})</span>
        </button>
      </div>

      {/* Tab Content List */}
      <div className="space-y-4">
        {activeTab === 'bookmarks' && (
          bookmarkedEvents.length > 0 ? (
            bookmarkedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={onViewDetails}
                isBookmarked={true}
                onToggleBookmark={onToggleBookmark}
              />
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-700">No saved bookmarks yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Browse nearby events and tap the bookmark icon to save them for later.
              </p>
            </div>
          )
        )}

        {activeTab === 'registered' && (
          registeredEvents.length > 0 ? (
            registeredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={onViewDetails}
                isBookmarked={bookmarkedIds.includes(event.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-700">No registered events yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When you click "Official Registration Link", your registered tickets appear here.
              </p>
            </div>
          )
        )}

        {activeTab === 'created' && (
          createdEventsList.length > 0 ? (
            createdEventsList.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={onViewDetails}
                isBookmarked={bookmarkedIds.includes(event.id)}
                onToggleBookmark={onToggleBookmark}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                showStatusBadge={true}
              />
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-700">No events created yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "Create New Event" to publish your first community event.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
