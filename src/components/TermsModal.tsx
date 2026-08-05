import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative shrink-0 rounded-t-3xl">
          <button
            id="btn-close-terms-modal"
            onClick={onClose}
            aria-label="Close Terms modal"
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-extrabold text-white tracking-tight mb-3">Legal Policies & Standards</h2>

          {/* Toggle Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'terms' ? (
            <>
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>1. Terms of Usage</span>
                </h3>
                <p>
                  By accessing or using NearEvent, you agree to comply with these Terms of Service. NearEvent functions as an aggregator directory for tech meetups, hackathons, concerts, and workshops.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Event Listings & Community Submissions</span>
                </h3>
                <p>
                  Organizers submitting events must ensure all information (dates, venue address, registration links, and entry fees) is accurate and truthful. Deceptive, fraudulent, or illegal event submissions are strictly prohibited and will be rejected by our moderation team.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>3. Tickets & Disclaimers</span>
                </h3>
                <p>
                  NearEvent provides digital registration passes and ticket confirmations for community events. Official venue entry guidelines, security clearance, and event rescheduling are governed by the respective event organizers.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>1. Information Collection</span>
                </h3>
                <p>
                  NearEvent collects user account details (name, email) and optional device location data solely to calculate distances to nearby event venues.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Data Privacy Guarantee</span>
                </h3>
                <p>
                  We do NOT sell, rent, or trade your personal data to third-party marketers. Your location coordinates are processed in real-time on your browser to render distance metrics.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>3. Cookies & Preferences</span>
                </h3>
                <p>
                  NearEvent uses secure client storage to maintain your saved bookmarks, registered event passes, and dark/light theme preferences across visits.
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 text-slate-400 text-[11px] text-right">
            Last Updated: August 2026 • NearEvent Compliance Team
          </div>
        </div>

      </div>
    </div>
  );
};
