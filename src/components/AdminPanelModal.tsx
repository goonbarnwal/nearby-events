import React, { useState } from 'react';
import { X, Check, Trash2, Shield, AlertCircle } from 'lucide-react';
import { EventItem } from '../types';

interface AdminPanelModalProps {
  events: EventItem[];
  onClose: () => void;
  onApproveEvent: (id: string) => void;
  onRejectEvent: (id: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  events,
  onClose,
  onApproveEvent,
  onRejectEvent,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h2>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Approve, manage, or delete community submitted events.
        </p>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {evt.category} • {evt.city}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                <p className="text-xs text-slate-500">{evt.venue} • {evt.startDate}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onApproveEvent(evt.id)}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1 hover:bg-emerald-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => onRejectEvent(evt.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs rounded-xl flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
