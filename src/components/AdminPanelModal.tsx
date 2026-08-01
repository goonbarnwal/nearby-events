import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Shield, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { EventItem } from '../types';
import { fetchPendingEvents, approveEvent, rejectEvent, deleteEvent } from '../services/api';

interface AdminPanelModalProps {
  events: EventItem[];
  onClose: () => void;
  onApproveEvent: (id: string) => void;
  onRejectEvent: (id: string) => void;
  onRefreshEvents?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  events,
  onClose,
  onApproveEvent,
  onRejectEvent,
  onRefreshEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [pendingList, setPendingList] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPending = async () => {
    setLoading(true);
    const data = await fetchPendingEvents();
    setPendingList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    await approveEvent(id);
    onApproveEvent(id);
    setPendingList((prev) => prev.filter((e) => e.id !== id));
    if (onRefreshEvents) onRefreshEvents();
  };

  const handleReject = async (id: string) => {
    await rejectEvent(id);
    onRejectEvent(id);
    setPendingList((prev) => prev.filter((e) => e.id !== id));
    if (onRefreshEvents) onRefreshEvents();
  };

  const handleDeleteApproved = async (id: string) => {
    await deleteEvent(id);
    onRejectEvent(id);
    if (onRefreshEvents) onRefreshEvents();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button
          id="btn-close-admin-panel"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Moderation Dashboard</h2>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Review pending user submissions, approve events to publish on NearEvent, or manage live listings.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({pendingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Live Approved Events ({events.length})</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-500">
                Loading pending event submissions...
              </div>
            ) : pendingList.length > 0 ? (
              pendingList.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {evt.category} • {evt.city}
                      </span>
                      {evt.createdByEmail && (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          Created by: <span className="font-semibold text-slate-700">{evt.createdByEmail}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {evt.venue} • {evt.startDate} ({evt.timeString})
                    </p>
                    {evt.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 pt-1">{evt.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200">
                    <button
                      onClick={() => handleApprove(evt.id)}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 shadow-2xs transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(evt.id)}
                      className="px-3.5 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 p-8 text-center rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-700">No pending approvals</p>
                <p className="text-xs text-slate-500 mt-1">All user-submitted events have been reviewed!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {evt.category} • {evt.city}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                    <p className="text-xs text-slate-500">{evt.venue} • {evt.startDate}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteApproved(evt.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 p-8 text-center rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-700">No active events</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
