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
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(events[0] || null);

  // Synchronize initial selected event if current one is not in events list
  useEffect(() => {
    if (events.length > 0 && (!selectedEvent || !events.find(e => e.id === selectedEvent.id))) {
      setSelectedEvent(events[0]);
    }
  }, [events]);

  // Map initialization - Runs once on mount or when userLocation dramatically changes
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
      zoom: 11,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Trigger map container resize calculation after mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation.latitude, userLocation.longitude]);

  // Update Markers whenever events or selectedEvent changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    (Object.values(markersRef.current) as L.Marker[]).forEach((m) => m.remove());
    markersRef.current = {};

    if (events.length === 0) return;

    const bounds = L.latLngBounds([]);

    events.forEach((evt) => {
      if (evt.latitude && evt.longitude) {
        const isSelected = selectedEvent?.id === evt.id;

        const customIcon = L.divIcon({
          className: 'custom-event-pin',
          html: `<div style="background-color: ${
            isSelected ? '#1d4ed8' : '#2563eb'
          }; width: ${isSelected ? '36px' : '28px'}; height: ${
            isSelected ? '36px' : '28px'
          }; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;"><div style="background-color: white; width: ${
            isSelected ? '12px' : '8px'
          }; height: ${
            isSelected ? '12px' : '8px'
          }; border-radius: 50%;"></div></div>`,
          iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
          iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        });

        const marker = L.marker([evt.latitude, evt.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedEvent(evt);
          map.panTo([evt.latitude, evt.longitude], { animate: true });
        });

        markersRef.current[evt.id] = marker;
        bounds.extend([evt.latitude, evt.longitude]);
      }
    });

    // Optionally fit bounds if multiple events exist
    if (events.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (events.length === 1 && events[0].latitude) {
      map.setView([events[0].latitude, events[0].longitude], 13);
    }
  }, [events, selectedEvent?.id]);

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
        <div className="lg:col-span-8 h-full relative min-h-[350px]">
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
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
                onClick={() => {
                  setSelectedEvent(evt);
                  if (mapInstanceRef.current && evt.latitude && evt.longitude) {
                    mapInstanceRef.current.panTo([evt.latitude, evt.longitude], { animate: true });
                  }
                }}
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

