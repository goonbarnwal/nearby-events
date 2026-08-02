import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  ExternalLink,
  Sparkles,
  Users,
  Building,
  Navigation,
  CheckCircle2,
  Copy,
  MessageCircle,
  Ticket,
  QrCode,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import L from 'leaflet';
import { EventItem } from '../types';
import { formatDateParts } from '../utils/distance';
import { generateAiSummary } from '../services/api';

interface EventDetailsModalProps {
  event: EventItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: string) => void;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  isBookmarked,
  onToggleBookmark,
  isRegistered,
  onRegister,
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (event) {
      setSummary(event.summary || null);
    }
  }, [event]);

  // Leaflet Mini Map Initialization
  useEffect(() => {
    if (event && mapContainerRef.current && !showTicket) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [event.latitude, event.longitude],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #2563eb; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;"><div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [event, showTicket]);

  if (!event) return null;

  const { month, day, dayOfWeek } = formatDateParts(event.startDate);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const result = await generateAiSummary(event.id, event.description);
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInstantRegister = () => {
    onRegister(event.id);
    setShowTicket(true);
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const locationStr = encodeURIComponent(`${event.venue}, ${event.city}`);
    const startDateFormatted = event.startDate.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${locationStr}&dates=${startDateFormatted}/${startDateFormatted}`;
  };

  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;

  const formattedRegUrl = event.registrationUrl
    ? event.registrationUrl.startsWith('http')
      ? event.registrationUrl
      : `https://${event.registrationUrl}`
    : '#';

  const ticketRefId = `NE-REG-2026-${Math.abs(event.id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0) % 89999 + 10000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative">
        
        {/* IF TICKET PASS IS ACTIVE */}
        {showTicket ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setShowTicket(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Card Container */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-blue-200" />
                  <span className="font-extrabold text-sm tracking-wider uppercase">NearEvent Pass</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/90 text-white font-extrabold text-[11px] rounded-full flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Entry Pass</span>
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Event Title</p>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1">
                  {event.title}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase">Date & Time</p>
                  <p className="text-xs font-bold text-white mt-0.5">{month} {day} • {event.timeString}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase">City & Venue</p>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">{event.venue}, {event.city}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase">Booking Ref</p>
                  <p className="text-xs font-mono font-bold text-emerald-300 mt-0.5">{ticketRefId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase">Pass Type</p>
                  <p className="text-xs font-bold text-white mt-0.5">{event.price === 0 ? 'Free Entry Pass' : `Paid Ticket (₹${event.price})`}</p>
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="bg-white text-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-900">Scan at Entry Gate</p>
                  <p className="text-[11px] font-semibold text-slate-500">Show this pass on your phone or print out</p>
                  <p className="text-[10px] font-mono text-blue-600 font-bold">{ticketRefId}</p>
                </div>
                <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>
            </div>

            {/* Ticket Action Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Pass</span>
              </button>

              <a
                href={formattedRegUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Open Platform Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* STANDARD DETAILS VIEW */
          <>
            {/* Header Image Banner */}
            <div className="relative h-48 sm:h-56 w-full bg-slate-100 overflow-hidden shrink-0">
              <img
                src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

              {/* Close Button */}
              <button
                id="btn-close-details-modal"
                onClick={onClose}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md transition-all"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Category Pill Tag */}
              <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow-xs">
                  {event.category}
                </span>
                {event.subtype && (
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-xs text-slate-900 font-bold text-xs rounded-lg shadow-xs">
                    {event.subtype}
                  </span>
                )}
                {event.source === 'ticketmaster' && (
                  <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1">
                    ⚡ Ticketmaster Live API
                  </span>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Title & Price */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {event.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Organized by {event.organizer}
                  </p>
                </div>

                <div className="shrink-0 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Entry Fee
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {event.price === 0 ? 'FREE' : `₹${event.price}`}
                  </span>
                </div>
              </div>

              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Date</p>
                    <p className="text-xs font-bold text-slate-800">
                      {month} {day}, {dayOfWeek}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Time</p>
                    <p className="text-xs font-bold text-slate-800">{event.timeString}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Venue</p>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {event.venue}, {event.city}, {event.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Summary Box */}
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Event Summary (Gemini)</span>
                  </div>
                  {!summary && (
                    <button
                      id="btn-generate-ai-summary"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      className="px-3 py-1 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
                    >
                      {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {summary || 'Click above to generate a quick AI overview of this event.'}
                </p>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">About the Event</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {event.description}
                </p>
              </div>

              {/* Location & Interactive Leaflet Map */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">Location & Directions</h3>
                  <a
                    href={googleDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>

                <div
                  ref={mapContainerRef}
                  className="h-40 w-full rounded-2xl border border-slate-200 overflow-hidden shadow-2xs relative"
                />
              </div>

              {/* Share & Add to Calendar Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${event.title} in ${event.city}: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Add to Google Calendar</span>
                </a>
              </div>

              {/* Action Buttons Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100">
                <button
                  id="btn-modal-bookmark"
                  onClick={() => onToggleBookmark(event.id)}
                  className={`sm:col-span-3 py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    isBookmarked
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                {/* Instant Registration Button */}
                <button
                  id="btn-modal-instant-register"
                  onClick={handleInstantRegister}
                  className="sm:col-span-5 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isRegistered ? '✓ View Ticket Pass' : 'Register & Get Pass'}</span>
                </button>

                {/* External Official Link Button */}
                <a
                  id="btn-modal-official-register"
                  href={formattedRegUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:col-span-4 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                  title="Open official portal website"
                >
                  <span>Portal Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};
