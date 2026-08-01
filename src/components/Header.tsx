import React, { useState } from 'react';
import { MapPin, Search, User, Plus, Calendar, Map, Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  activeTab: 'home' | 'events' | 'map' | 'create' | 'my-events';
  setActiveTab: (tab: 'home' | 'events' | 'map' | 'create' | 'my-events') => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  user: UserType | null;
  onLogout: () => void;
  onTriggerSearchFocus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenAdmin,
  user,
  onLogout,
  onTriggerSearchFocus,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-blue-600 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Near<span className="text-blue-600">Event</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">Discover Events Near You</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-700">
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`py-5 transition-all relative ${
                activeTab === 'home'
                  ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              id="nav-events"
              onClick={() => setActiveTab('events')}
              className={`py-5 transition-all relative ${
                activeTab === 'events'
                  ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Events
            </button>
            <button
              id="nav-map"
              onClick={() => setActiveTab('map')}
              className={`py-5 transition-all relative ${
                activeTab === 'map'
                  ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              id="nav-create"
              onClick={() => setActiveTab('create')}
              className={`py-5 transition-all relative ${
                activeTab === 'create'
                  ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Create Event
            </button>
            <button
              id="nav-my-events"
              onClick={() => setActiveTab('my-events')}
              className={`py-5 transition-all relative ${
                activeTab === 'my-events'
                  ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              My Events
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="btn-header-search"
              onClick={onTriggerSearchFocus}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors mr-1"
              title="Search"
              aria-label="Search events"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button
                    id="btn-admin-panel"
                    onClick={onOpenAdmin}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Admin
                  </button>
                )}
                <div className={`flex items-center gap-2 ${user.role === 'admin' ? 'pl-2 border-l border-slate-200' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">{user.name}</span>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-50"
                    title="Logout"
                    aria-label="Logout of account"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  id="btn-login"
                  onClick={onOpenAuth}
                  className="px-5 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
                >
                  Login
                </button>
                <button
                  id="btn-signup"
                  onClick={onOpenAuth}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-xs"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'events' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => { setActiveTab('map'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'map' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => { setActiveTab('create'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'create' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
              }`}
            >
              Create Event
            </button>
            <button
              onClick={() => { setActiveTab('my-events'); setMobileMenuOpen(false); }}
              className={`px-4 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'my-events' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
              }`}
            >
              My Events
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold text-slate-800">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="py-2.5 text-center text-sm font-medium border border-slate-200 rounded-xl text-slate-800"
                >
                  Login
                </button>
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="py-2.5 text-center text-sm font-semibold bg-blue-600 text-white rounded-xl"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
