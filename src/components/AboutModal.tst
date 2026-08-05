import React from 'react';
import { X, Compass, CheckCircle2, ShieldCheck, Users, Zap, Heart, MapPin, Globe } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white relative shrink-0 rounded-t-3xl">
          <button
            id="btn-close-about-modal"
            onClick={onClose}
            aria-label="Close About modal"
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">About NearEvent</h2>
              <p className="text-xs text-blue-300 font-semibold">India's Tech, Hackathon & Community Events Directory</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Our Mission</span>
            </h3>
            <p>
              NearEvent was built to solve the fragmentation of tech and community event listings across India. Whether you are an AI developer looking for hackathons in Pune, a founder seeking startup summits in Mumbai, or a student looking for workshops in Bengaluru — NearEvent connects you directly to live, verified events around you.
            </p>
          </div>

          {/* Key Features Grid */}
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What Makes NearEvent Different</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Geo-Location Matching</span>
                </div>
                <p className="text-[11px] text-slate-500">Auto-detects your current city and calculates accurate physical distances to event venues.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Live Ticketmaster Integration</span>
                </div>
                <p className="text-[11px] text-slate-500">Fetches real-time concert and tech event data via official API integrations.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Moderation</span>
                </div>
                <p className="text-[11px] text-slate-500">Community submissions undergo strict verification before being published live.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>In-App Event Pass</span>
                </div>
                <p className="text-[11px] text-slate-500">Register directly inside NearEvent to save digital QR tickets to your personal My Events dashboard.</p>
              </div>
            </div>
          </div>

          {/* Supported Event Types */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">Supported Event Categories</h4>
            <p className="text-xs text-blue-800">
              Tech Conferences • Hackathons • Coding Workshops • AI & Machine Learning Summits • Live Music Concerts • Business Expo • Sports Tournaments • Standup Comedy
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>NearEvent v2.4 (Production Release)</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in India
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
