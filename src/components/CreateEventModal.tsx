import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { EventItem } from '../types';

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (eventData: Partial<EventItem>) => void;
  eventToEdit?: EventItem | null;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSubmit, eventToEdit }) => {
  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    description: eventToEdit?.description || '',
    category: eventToEdit?.category || 'Tech',
    subtype: eventToEdit?.subtype || 'Conference',
    venue: eventToEdit?.venue || '',
    address: eventToEdit?.address || '',
    city: eventToEdit?.city || 'Pune',
    state: eventToEdit?.state || 'Maharashtra',
    country: eventToEdit?.country || 'India',
    startDate: eventToEdit?.startDate || new Date().toISOString().split('T')[0],
    timeString: eventToEdit?.timeString || '10:00 AM - 4:00 PM',
    organizer: eventToEdit?.organizer || '',
    price: eventToEdit?.price || 0,
    registrationUrl: eventToEdit?.registrationUrl || '',
    imageUrl: eventToEdit?.imageUrl || '',
    tags: eventToEdit?.tags ? eventToEdit.tags.join(', ') : 'Tech, Meetup',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.title.trim()) {
      setErrorMessage('Please enter an event title.');
      return;
    }

    if (!formData.venue.trim() || !formData.city.trim()) {
      setErrorMessage('Please enter the venue and city.');
      return;
    }

    if (!formData.registrationUrl.trim()) {
      setErrorMessage('Official registration link is required.');
      return;
    }

    let formattedUrl = formData.registrationUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (!formData.description.trim() || formData.description.trim().length < 15) {
      setErrorMessage('Event description is required (at least 15 characters).');
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      subtype: formData.subtype,
      venue: formData.venue.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      startDate: formData.startDate,
      timeString: formData.timeString,
      organizer: formData.organizer.trim() || 'Community Organizer',
      price: Number(formData.price),
      registrationUrl: formattedUrl,
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 relative flex flex-col">
        
        {/* Top Header */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200/80 relative shrink-0">
          <button
            id="btn-close-create-modal"
            onClick={onClose}
            aria-label="Close event creation modal"
            className="absolute top-6 right-6 p-2 rounded-full bg-white hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            {eventToEdit ? 'Edit Event Details' : 'Create New Event'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {eventToEdit ? 'Update the information for this event.' : 'Submit your community event or meetup to be listed on NearEvent.'}
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                >
                  <option value="Tech">Tech</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Business">Business</option>
                  <option value="Food">Food</option>
                  <option value="Comedy">Comedy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtype</label>
                <input
                  type="text"
                  value={formData.subtype}
                  onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                  placeholder="Event subtype (e.g. Meetup)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Venue & Address *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Enter venue & address"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                <input
                  type="text"
                  value={formData.timeString}
                  onChange={(e) => setFormData({ ...formData, timeString: e.target.value })}
                  placeholder="10:00 AM - 4:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Registration Link *</label>
              <input
                type="url"
                required
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://near-event.app/register/your-event"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Required. Must be a valid HTTP or HTTPS link.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
              <textarea
                rows={3}
                required
                minLength={15}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide event details, schedule, agenda, speaker info..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Required. At least 15 characters long.</p>
            </div>

            <div className="pt-2">
              <button
                id="btn-submit-create-event"
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                {eventToEdit ? 'Save Changes' : 'Submit & Publish Event'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

