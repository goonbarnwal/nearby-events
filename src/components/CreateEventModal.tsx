import React, { useState } from 'react';
import { X } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.venue || !formData.city) return;

    onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      subtype: formData.subtype,
      venue: formData.venue,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      startDate: formData.startDate,
      timeString: formData.timeString,
      organizer: formData.organizer || 'Community Organizer',
      price: Number(formData.price),
      registrationUrl: formData.registrationUrl || 'https://near-event.app',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      tags: formData.tags.split(',').map((t) => t.trim()),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative">
        
        <button
          id="btn-close-create-modal"
          onClick={onClose}
          aria-label="Close event creation modal"
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
          {eventToEdit ? 'Edit Event Details' : 'Create New Event'}
        </h2>
        <p className="text-xs text-slate-500 font-medium mb-6">
          {eventToEdit ? 'Update the information for this event.' : 'Submit your community event or meetup to be listed on NearEvent.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Pune React Developers Meetup"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
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
                placeholder="e.g. Meetup / Workshop"
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
              placeholder="e.g. WeWork, Kalyani Nagar"
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
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
              <input
                type="date"
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
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Official Registration Link</label>
            <input
              type="url"
              value={formData.registrationUrl}
              onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
              placeholder="https://eventbrite.com/your-event"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain what attendees will learn or experience..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-submit-create-event"
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
            >
              {eventToEdit ? 'Save Changes' : 'Submit & Publish Event'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
