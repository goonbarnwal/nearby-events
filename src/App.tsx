import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { CategoryPills } from './components/CategoryPills';
import { EventCard } from './components/EventCard';
import { SidebarWidgets } from './components/SidebarWidgets';
import { EventDetailsModal } from './components/EventDetailsModal';
import { MapView } from './components/MapView';
import { CreateEventModal } from './components/CreateEventModal';
import { MyEventsView } from './components/MyEventsView';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AiRecommendationsModal } from './components/AiRecommendationsModal';
import { Footer } from './components/Footer';
import { EventItem, FilterState, UserLocation, User } from './types';
import { INITIAL_EVENTS } from './data/mockEvents';
import { fetchEvents, reverseGeocode, searchLocation, createEvent, getCurrentUser } from './services/api';
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
    locationQuery: '',
    category: 'All',
    dateFilter: 'all',
    radiusKm: 100,
    priceType: 'all',
    sortBy: 'distance',
  });

  // Events Database
  const [allEvents, setAllEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [visibleCount, setVisibleCount] = useState(5);

  // User state, Bookmarks, Registrations
  const [user, setUser] = useState<User | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['pune-1', 'pune-3']);
  const [registeredIds, setRegisteredIds] = useState<string[]>(['pune-2']);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [aiRecsModalOpen, setAiRecsModalOpen] = useState(false);

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

  // 1. Browser Geolocation API detection on initial mount
  useEffect(() => {
    handleRequestLocation();
  }, []);

  // 2. Fetch fresh events whenever location or filter category changes
  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, [location.city, filters.category]);

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

  // Create Event Handler
  const handleCreateEventSubmit = async (eventData: Partial<EventItem>) => {
    const created = await createEvent(eventData);
    if (created) {
      setAllEvents((prev) => [created, ...prev]);
      setCreateModalOpen(false);
      setActiveTab('home');
    }
  };

  // City Selector from Popular Cities
  const handleSelectCity = async (cityName: string) => {
    if (!cityName) {
      setFilters((prev) => ({ ...prev, locationQuery: '', category: 'All' }));
      return;
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
        onLogout={() => {
          localStorage.removeItem('nearevent_jwt');
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
              
              {/* Left Column (Main Events List ~68% width) */}
              <div className="lg:col-span-8 space-y-4">
                
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Upcoming Events
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
                    />
                  ))}

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
                  onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
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
            bookmarkedIds={bookmarkedIds}
            registeredIds={registeredIds}
            user={user}
            onViewDetails={(evt) => setSelectedEvent(evt)}
            onToggleBookmark={handleToggleBookmark}
            onCreateNewClick={() => setCreateModalOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
        onOpenAuth={() => setAuthModalOpen(true)}
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
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setAuthModalOpen(false);
          }}
        />
      )}

      {createModalOpen && (
        <CreateEventModal
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateEventSubmit}
        />
      )}

      {adminModalOpen && (
        <AdminPanelModal
          events={allEvents}
          onClose={() => setAdminModalOpen(false)}
          onApproveEvent={(id) => {
            setAllEvents((prev) =>
              prev.map((e) => (e.id === id ? { ...e, status: 'approved' } : e))
            );
          }}
          onRejectEvent={(id) => {
            setAllEvents((prev) => prev.filter((e) => e.id !== id));
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

    </div>
  );
}
