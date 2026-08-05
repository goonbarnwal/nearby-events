import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { EventCard } from './components/EventCard';
import { SidebarWidgets } from './components/SidebarWidgets';
import { EventDetailsModal } from './components/EventDetailsModal';
import { MapView } from './components/MapView';
import { CreateEventModal } from './components/CreateEventModal';
import { MyEventsView } from './components/MyEventsView';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AiRecommendationsModal } from './components/AiRecommendationsModal';
import { AboutModal } from './components/AboutModal';
import { TermsModal } from './components/TermsModal';
import { Footer } from './components/Footer';
import { EventItem, FilterState, UserLocation, User } from './types';
import { INITIAL_EVENTS } from './data/mockEvents';
import { fetchEvents, reverseGeocode, searchLocation, createEvent, getCurrentUser, fetchMyCreatedEvents, updateEvent, deleteEvent, logoutUser } from './services/api';
import { ChevronDown, SlidersHorizontal, MapPin } from 'lucide-react';

export default function App() {
  // Navigation & View tab state
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'map' | 'create' | 'my-events'>('home');

  // User Location State (Default Pune)
  const [location, setLocation] = useState<UserLocation>({
    latitude: 18.5204,
    longitude: 73.8567,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    isDetected: false,
  });
  const [isLocating, setIsLocating] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    locationQuery: 'Pune',
    category: 'All',
    dateFilter: 'all',
    radiusKm: 100,
    priceType: 'all',
    sortBy: 'distance',
  });

  // Events Database
  const [allEvents, setAllEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [myCreatedEvents, setMyCreatedEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  // User state, Bookmarks, Registrations
  const [user, setUser] = useState<User | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['pune-1', 'pune-3']);
  const [registeredIds, setRegisteredIds] = useState<string[]>(['pune-2']);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [aiRecsModalOpen, setAiRecsModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms');

  const handleOpenAuthWithMessage = (msg?: string) => {
    setAuthModalMessage(msg);
    setAuthModalOpen(true);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 0. Restore user session from JWT on mount
  useEffect(() => {
    const token = localStorage.getItem('nearevent_jwt');
    if (token) {
      getCurrentUser(token).then((u) => {
        if (u) setUser(u);
      });
    }
  }, []);

  // Local Storage Helpers for Created Events
  const getLocalCreatedEvents = (): EventItem[] => {
    try {
      const raw = localStorage.getItem('nearevent_local_created_events');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalCreatedEvents = (events: EventItem[]) => {
    try {
      localStorage.setItem('nearevent_local_created_events', JSON.stringify(events));
    } catch (err) {
      console.warn('Failed to save local created events:', err);
    }
  };

  // Refresh user created events
  const refreshUserCreatedEvents = async () => {
    const localEvts = getLocalCreatedEvents();
    let serverEvts: EventItem[] = [];
    if (user) {
      serverEvts = await fetchMyCreatedEvents();
    }
    const evtMap = new Map<string, EventItem>();
    localEvts.forEach((e) => evtMap.set(e.id, e));
    serverEvts.forEach((e) => evtMap.set(e.id, e));
    setMyCreatedEvents(Array.from(evtMap.values()));
  };

  useEffect(() => {
    refreshUserCreatedEvents();
  }, [user, activeTab]);

  // 1. Browser Geolocation API detection on initial mount
  useEffect(() => {
    handleRequestLocation();
  }, []);

  // 2. Fetch fresh events function
  const loadEventsData = async () => {
    const data = await fetchEvents({
      lat: location.latitude,
      lon: location.longitude,
      city: location.city,
      category: filters.category,
      search: filters.searchQuery,
      radiusKm: filters.radiusKm,
      dateFilter: filters.dateFilter,
    });

    if (data) {
      setAllEvents(data);
    }
  };

  // 2. Fetch fresh events whenever location, coordinates, or filter category changes
  useEffect(() => {
    loadEventsData();
  }, [location.city, location.latitude, location.longitude, filters.category, filters.dateFilter]);

  const [locationError, setLocationError] = useState<string | null>(null);

  // Handle Geolocation Request
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Defaulting to Pune.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const locData = await reverseGeocode(lat, lon);
        setLocation(locData);
        setFilters((prev) => ({ ...prev, locationQuery: locData.city }));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation position error:', err);
        setIsLocating(false);
        setLocationError('Could not access current location. Searching Pune by default.');
      },
      { timeout: 8000 }
    );
  };

  // Execute Search by Manual Location Input or Query
  const handleExecuteSearch = async () => {
    if (filters.locationQuery && filters.locationQuery !== location.city) {
      const geoResult = await searchLocation(filters.locationQuery);
      if (geoResult) {
        setLocation({
          latitude: geoResult.latitude,
          longitude: geoResult.longitude,
          city: geoResult.city,
          state: geoResult.state,
          country: geoResult.country,
          isDetected: true,
        });
      }
    }

    const results = await fetchEvents({
      lat: location.latitude,
      lon: location.longitude,
      city: filters.locationQuery || location.city,
      category: filters.category,
      search: filters.searchQuery,
      radiusKm: filters.radiusKm,
      dateFilter: filters.dateFilter,
    });

    if (results) {
      setAllEvents(results);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  // Register Event
  const handleRegister = (eventId: string) => {
    if (!registeredIds.includes(eventId)) {
      setRegisteredIds((prev) => [...prev, eventId]);
    }
  };

  // Create or Update Event Handler
  const handleCreateEventSubmit = async (eventData: Partial<EventItem>) => {
    if (editingEvent) {
      const updated = await updateEvent(editingEvent.id, eventData);
      const targetEvt: EventItem = updated || ({ ...editingEvent, ...eventData } as EventItem);

      setAllEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? targetEvt : e)));
      setMyCreatedEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? targetEvt : e)));

      const updatedLocal = getLocalCreatedEvents().map((e) => (e.id === editingEvent.id ? targetEvt : e));
      saveLocalCreatedEvents(updatedLocal);

      setEditingEvent(null);
      setCreateModalOpen(false);
      refreshUserCreatedEvents();
      loadEventsData();
    } else {
      const created = await createEvent(eventData);
      const newEvt: EventItem = created || ({
        id: `user-${Date.now()}`,
        title: eventData.title || 'Community Event',
        description: eventData.description || '',
        category: eventData.category || 'Tech',
        subtype: eventData.subtype || 'Meetup',
        venue: eventData.venue || 'City Center',
        address: eventData.address || '',
        city: eventData.city || 'Pune',
        state: eventData.state || 'Maharashtra',
        country: eventData.country || 'India',
        latitude: eventData.latitude || 18.5204,
        longitude: eventData.longitude || 73.8567,
        startDate: eventData.startDate || new Date().toISOString().split('T')[0],
        timeString: eventData.timeString || '10:00 AM',
        organizer: eventData.organizer || (user?.name || 'Community Organizer'),
        price: eventData.price || 0,
        currency: 'INR',
        registrationUrl: eventData.registrationUrl || 'https://near-event.app',
        imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        status: 'pending',
        source: 'user',
        tags: eventData.tags || ['Community'],
        createdByEmail: user?.email,
      } as EventItem);

      if (newEvt.status === 'approved') {
        setAllEvents((prev) => [newEvt, ...prev]);
      }
      setMyCreatedEvents((prev) => [newEvt, ...prev.filter((e) => e.id !== newEvt.id)]);

      const currentLocal = getLocalCreatedEvents();
      saveLocalCreatedEvents([newEvt, ...currentLocal.filter((e) => e.id !== newEvt.id)]);

      setCreateModalOpen(false);
      setActiveTab('my-events');
      refreshUserCreatedEvents();
      loadEventsData();
    }
  };

  // Edit Event Click Handler
  const handleEditEventClick = (event: EventItem) => {
    setEditingEvent(event);
    setCreateModalOpen(true);
  };

  // Delete Event Handler
  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
      setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
      setMyCreatedEvents((prev) => prev.filter((e) => e.id !== eventId));

      const updatedLocal = getLocalCreatedEvents().filter((e) => e.id !== eventId);
      saveLocalCreatedEvents(updatedLocal);

      refreshUserCreatedEvents();
      loadEventsData();
    }
  };

  // Category Selector
  const handleSelectCategory = (catName: string) => {
    const targetCat = catName === 'All Categories' ? 'All' : catName;
    setFilters((prev) => ({ ...prev, category: targetCat }));
    setVisibleCount(5);
    if (activeTab !== 'home' && activeTab !== 'events') {
      setActiveTab('home');
    }
  };

  // City Selector from Popular Cities
  const handleSelectCity = async (cityName: string) => {
    if (!cityName) {
      setFilters((prev) => ({ ...prev, locationQuery: '', category: 'All' }));
      return;
    }

    setVisibleCount(5);
    if (activeTab !== 'home' && activeTab !== 'events') {
      setActiveTab('home');
    }

    const geo = await searchLocation(cityName);
    if (geo) {
      setLocation({
        latitude: geo.latitude,
        longitude: geo.longitude,
        city: geo.city,
        state: geo.state,
        country: geo.country,
        isDetected: true,
      });
      setFilters((prev) => ({ ...prev, locationQuery: geo.city }));
    }
  };

  // Focus Search Input
  const handleTriggerSearchFocus = () => {
    setActiveTab('home');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Separate upcoming list for sidebar
  const upcomingEvents = allEvents.filter((e) => e.isUpcoming || e.id.includes('pune-5') || e.id.includes('pune-6'));

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-slate-900">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        user={user}
        onLogout={async () => {
          await logoutUser();
          setUser(null);
        }}
        onTriggerSearchFocus={handleTriggerSearchFocus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Navigation Tab Switching Views */}
        {activeTab === 'home' && (
          <>
            {/* Hero Section & Search Bar */}
            <HeroSearch
              filters={filters}
              setFilters={setFilters}
              location={location}
              onRequestLocation={handleRequestLocation}
              isLocating={isLocating}
              onExecuteSearch={handleExecuteSearch}
              searchInputRef={searchInputRef}
            />

            {/* 2-Column Grid Layout matching screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              
              {/* Left Column (Main Events List ~68% width) */}
              <div className="lg:col-span-8 space-y-4">
                
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center justify-between">
                  <span>Upcoming Events</span>
                  {filters.category !== 'All' && filters.category !== '' && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Category: {filters.category}
                    </span>
                  )}
                </h2>

                {/* Event Cards Grouped Card Box */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                  {allEvents.slice(0, visibleCount).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onViewDetails={(evt) => setSelectedEvent(evt)}
                      isBookmarked={bookmarkedIds.includes(event.id)}
                      onToggleBookmark={handleToggleBookmark}
                      isRegistered={registeredIds.includes(event.id)}
                      onRegister={handleRegister}
                      user={user}
                      onOpenAuth={() => handleOpenAuthWithMessage('Please log in or create an account to register for events.')}
                    />
                  ))}

                  {allEvents.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      <p className="font-semibold text-sm">No events found matching your filter.</p>
                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, category: 'All', searchQuery: '' }));
                        }}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}

                  {/* Load More Button */}
                  {visibleCount < allEvents.length && (
                    <button
                      id="btn-load-more-events"
                      onClick={() => setVisibleCount((prev) => prev + 5)}
                      className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border-t border-slate-100"
                    >
                      <span>Load More Events</span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column (Sidebar Widgets ~32% width) */}
              <div className="lg:col-span-4">
                <SidebarWidgets
                  upcomingEvents={upcomingEvents}
                  onViewDetails={(evt) => setSelectedEvent(evt)}
                  onSelectCity={handleSelectCity}
                  onOpenAiRecommendations={() => setAiRecsModalOpen(true)}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  onSelectCategory={handleSelectCategory}
                  currentCity={location.city}
                  currentCategory={filters.category}
                />
              </div>

            </div>
          </>
        )}

        {/* View 2: Full Events Catalogue */}
        {activeTab === 'events' && (
          <div className="py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Events Catalogue</h1>
                <p className="text-xs text-slate-500 font-medium">Browse and search events worldwide</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={(evt) => setSelectedEvent(evt)}
                  isBookmarked={bookmarkedIds.includes(event.id)}
                  onToggleBookmark={handleToggleBookmark}
                  isRegistered={registeredIds.includes(event.id)}
                  onRegister={handleRegister}
                  user={user}
                  onOpenAuth={() => handleOpenAuthWithMessage('Please log in or create an account to register for events.')}
                />
              ))}
            </div>
          </div>
        )}

        {/* View 3: Map View */}
        {activeTab === 'map' && (
          <MapView
            events={allEvents}
            userLocation={location}
            onViewDetails={(evt) => setSelectedEvent(evt)}
          />
        )}

        {/* View 4: Create Event View */}
        {activeTab === 'create' && (
          <div className="max-w-xl mx-auto py-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
              <h1 className="text-2xl font-extrabold text-slate-900">Publish Your Event</h1>
              <p className="text-xs text-slate-500 font-medium">Fill out the form below to publish your event on NearEvent.</p>
              {user ? (
                <button
                  id="btn-open-create-modal"
                  onClick={() => setCreateModalOpen(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Open Event Creation Form
                </button>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <p className="text-xs text-amber-800 font-medium">You must be logged in to create and publish events.</p>
                  <button
                    id="btn-create-login-prompt"
                    onClick={() => setAuthModalOpen(true)}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Log In to Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 5: My Events Dashboard */}
        {activeTab === 'my-events' && (
          <MyEventsView
            allEvents={allEvents}
            myCreatedEvents={myCreatedEvents}
            bookmarkedIds={bookmarkedIds}
            registeredIds={registeredIds}
            user={user}
            onViewDetails={(evt) => setSelectedEvent(evt)}
            onToggleBookmark={handleToggleBookmark}
            onCreateNewClick={() => {
              if (!user) {
                setAuthModalOpen(true);
              } else {
                setEditingEvent(null);
                setCreateModalOpen(true);
              }
            }}
            onEditEvent={handleEditEventClick}
            onDeleteEvent={handleDeleteEvent}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenTerms={() => {
          setTermsTab('terms');
          setTermsModalOpen(true);
        }}
        onOpenPrivacy={() => {
          setTermsTab('privacy');
          setTermsModalOpen(true);
        }}
      />

      {/* MODALS */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isBookmarked={bookmarkedIds.includes(selectedEvent.id)}
          onToggleBookmark={(id) => handleToggleBookmark(id)}
          isRegistered={registeredIds.includes(selectedEvent.id)}
          onRegister={handleRegister}
          user={user}
          onOpenAuth={() => handleOpenAuthWithMessage('Please log in or create an account to register for events.')}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => {
            setAuthModalOpen(false);
            setAuthModalMessage(undefined);
          }}
          initialMessage={authModalMessage}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setAuthModalOpen(false);
            setAuthModalMessage(undefined);
          }}
        />
      )}

      {createModalOpen && (
        <CreateEventModal
          onClose={() => {
            setCreateModalOpen(false);
            setEditingEvent(null);
          }}
          onSubmit={handleCreateEventSubmit}
          eventToEdit={editingEvent}
        />
      )}

      {adminModalOpen && (
        <AdminPanelModal
          events={allEvents}
          onClose={() => setAdminModalOpen(false)}
          onApproveEvent={() => {
            loadEventsData();
            refreshUserCreatedEvents();
          }}
          onRejectEvent={() => {
            loadEventsData();
            refreshUserCreatedEvents();
          }}
          onRefreshEvents={() => {
            loadEventsData();
            refreshUserCreatedEvents();
          }}
        />
      )}

      {aiRecsModalOpen && (
        <AiRecommendationsModal
          events={allEvents}
          city={location.city}
          onClose={() => setAiRecsModalOpen(false)}
          onViewDetails={(evt) => setSelectedEvent(evt)}
        />
      )}

      {aboutModalOpen && (
        <AboutModal
          onClose={() => setAboutModalOpen(false)}
        />
      )}

      {termsModalOpen && (
        <TermsModal
          onClose={() => setTermsModalOpen(false)}
          initialTab={termsTab}
        />
      )}

    </div>
  );
}
