import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Filter } from 'lucide-react';
import { EventItem, UserLocation } from '../types';

interface MapViewProps {
  events: EventItem[];
  userLocation: UserLocation;
  onViewDetails: (event: EventItem) => void;
}

export const MapView: React.FC<MapViewProps> = ({ events, userLocation, onViewDetails }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(events[0] || null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = userLocation.latitude || 18.5204;
    const initialLon = userLocation.longitude || 73.8567;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 12,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add Markers for events
    events.forEach((evt) => {
      const customIcon = L.divIcon({
        className: 'custom-event-pin',
        html: `<div style="background-color: ${
          selectedEvent?.id === evt.id ? '#1d4ed8' : '#2563eb'
        }; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: justify-center; cursor: pointer;"><div style="background-color: white; width: 10px; height: 10px; border-radius: 50%; margin: auto;"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([evt.latitude, evt.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedEvent(evt);
      });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events, userLocation, selectedEvent?.id]);

  return (
    <div className="py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Event Map</h2>
          <p className="text-xs text-slate-500 font-medium">
            Explore live events happening nearby on OpenStreetMap. Click any pin to inspect details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 h-full relative">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>

        {/* Sidebar Selected Event Card */}
        <div className="lg:col-span-4 p-5 bg-slate-50 border-l border-slate-200 overflow-y-auto space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Selected Pin Details
          </h3>

          {selectedEvent ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 relative">
                <img
                  src={selectedEvent.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded-md uppercase">
                  {selectedEvent.category}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedEvent.title}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  📍 {selectedEvent.venue}, {selectedEvent.city}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  🕒 {selectedEvent.timeString}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {selectedEvent.price === 0 ? 'FREE' : `₹${selectedEvent.price}`}
                </span>
                <button
                  id={`btn-map-card-view-${selectedEvent.id}`}
                  onClick={() => onViewDetails(selectedEvent)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click a pin on the map to inspect the event details.</p>
          )}

          {/* List of events on map */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-600">Events on Map ({events.length})</p>
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedEvent?.id === evt.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <p className="font-bold truncate">{evt.title}</p>
                <p className="text-[11px] text-slate-500">{evt.city} | {evt.category}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
