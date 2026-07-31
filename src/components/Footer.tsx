import React from 'react';
import { Calendar, Compass, Shield, Heart, Github, Twitter, Linkedin, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onOpenAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAuth }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand & Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Near<span className="text-blue-500">Event</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover official hackathons, AI conferences, tech meetups, live music concerts, and business summits happening right around you across India.
            </p>

            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2.5 text-xs">
              {['Hackathon', 'Tech', 'Music', 'Business', 'Sports', 'Food'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory?.(cat)}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {cat} Events
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Major Tech Hubs */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Top Tech Hubs</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Pune (IEEE, PCCOE, Lavasa)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Mumbai (BKC, Jio World)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Bengaluru (Indiranagar, Koramangala)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Delhi NCR (Pragati Maidan)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Hyderabad (T-Hub 2.0)</span>
              </li>
            </ul>
          </div>

          {/* Organizer & Account */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">For Organizers</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Hosting a hackathon, tech conference or meetup? Post your event for developers and tech enthusiasts.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Submit Event
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NearEvent. Official Tech, Hackathon & Community Events Directory.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
