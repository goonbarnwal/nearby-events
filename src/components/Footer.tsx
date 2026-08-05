import React from 'react';
import { Calendar, Compass, Shield, Heart, Github, Twitter, Linkedin, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onOpenAuth?: () => void;
  onOpenAbout?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAuth,
  onOpenAbout,
  onOpenTerms,
  onOpenPrivacy,
}) => {
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

            <button
              id="btn-footer-about-us"
              onClick={onOpenAbout}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 cursor-pointer block"
            >
              Learn More About NearEvent →
            </button>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2.5 text-xs">
              {['Hackathon', 'Tech', 'Music', 'Business', 'Sports', 'Food'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory?.(cat)}
                    className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {cat} Events
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Major Tech Hubs */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Top Tech Hubs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Pune (IEEE, PCCOE, Lavasa)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Mumbai (BKC, Jio World)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Bengaluru (Indiranagar, Koramangala)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Delhi NCR (Pragati Maidan)</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Hyderabad (T-Hub 2.0)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NearEvent. Official Tech, Hackathon & Community Events Directory.</p>
          <div className="flex items-center gap-4">
            <button
              id="btn-footer-about"
              onClick={onOpenAbout}
              className="hover:text-slate-300 cursor-pointer transition-colors"
            >
              About
            </button>
            <button
              id="btn-footer-privacy"
              onClick={onOpenPrivacy}
              className="hover:text-slate-300 cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <button
              id="btn-footer-terms"
              onClick={onOpenTerms}
              className="hover:text-slate-300 cursor-pointer transition-colors"
            >
              Terms of Service
            </button>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
