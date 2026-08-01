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
  onOpenAuth?: () => void;
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
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'registered' | 'created'>('created');

  const bookmarkedEvents = allEvents.filter((e) => bookmarkedIds.includes(e.id));
  const registeredEvents = allEvents.filter((e) => registeredIds.includes(e.id));
  
  // Combine myCreatedEvents, localStorage, and user created fallback
  const getLocalCreatedEvents = (): EventItem[] => {
    try {
      const raw = localStorage.getItem('nearevent_local_created_events');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const localCreatedEvents = getLocalCreatedEvents();
  const createdEventsMap = new Map<string, EventItem>();

  // 1. Local storage created events
  localCreatedEvents.forEach((e) => createdEventsMap.set(e.id, e));

  // 2. Props myCreatedEvents
  myCreatedEvents.forEach((e) => createdEventsMap.set(e.id, e));

  // 3. Fallback matching allEvents by source or createdByEmail
  allEvents.forEach((e) => {
    if (e.source === 'user' || (user && e.createdByEmail && e.createdByEmail.toLowerCase() === user.email.toLowerCase())) {
      if (!createdEventsMap.has(e.id)) {
        createdEventsMap.set(e.id, e);
      }
    }
  });

  const createdEventsList = Array.from(createdEventsMap.values());

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
          <div className="space-y-4">
            {/* Status Guide Info Banner */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Event Approval & Moderation Status Guide:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5 bg-white/90 p-2 rounded-xl border border-blue-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span><strong>⏳ Pending:</strong> Submitted & awaiting Admin review</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/90 p-2 rounded-xl border border-blue-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span><strong>✓ Approved:</strong> Published & visible to nearby users</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/90 p-2 rounded-xl border border-blue-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                  <span><strong>✕ Rejected:</strong> Declined by Admin</span>
                </div>
              </div>
            </div>

            {!user && (
              <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-900">Log in to keep events synced</p>
                  <p className="text-amber-800">Please log in or register so your created events stay saved under your account.</p>
                </div>
                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-2xs"
                  >
                    Log In / Register
                  </button>
                )}
              </div>
            )}

            {createdEventsList.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                {createdEventsList.map((event) => (
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
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 text-center rounded-3xl border border-slate-200 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-slate-700">No events created yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "Create New Event" to publish your first community event on NearEvent.
                  </p>
                </div>
                <button
                  onClick={onCreateNewClick}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Event</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
