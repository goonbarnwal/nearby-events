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
                  <span>1. Information Collection & Use</span>
                </h3>
                <p>
                  NearEvent collects user account details (name, email) when you register or sign in, and optional device geolocation coordinates solely to calculate physical distances to nearby event venues and display localized event recommendations.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Google AdSense & Third-Party Cookies Disclosure</span>
                </h3>
                <p>
                  NearEvent uses Google AdSense and third-party advertising partners to serve ads when you visit our website.
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs pl-2">
                  <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to NearEvent or other websites.</li>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.</li>
                  <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutads.info</a>.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>3. Cookies & Browser Preferences</span>
                </h3>
                <p>
                  NearEvent uses secure client storage (cookies & local storage) to maintain your login session, saved event bookmarks, registered event passes, and cookie consent preferences across visits.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>4. Data Rights & Contact Information</span>
                </h3>
                <p>
                  You have the right to inspect, update, or request the deletion of your personal data at any time. For privacy inquiries, data deletion requests, or publisher questions, contact us at: <a href="mailto:contact@nearevent.app" className="text-blue-600 font-bold hover:underline">contact@nearevent.app</a>.
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
