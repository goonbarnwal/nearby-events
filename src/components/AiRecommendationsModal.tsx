import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Loader2, Star } from 'lucide-react';
import { EventItem, AIRecommendationResponse } from '../types';
import { getAiRecommendations } from '../services/api';

interface AiRecommendationsModalProps {
  events: EventItem[];
  city: string;
  onClose: () => void;
  onViewDetails: (event: EventItem) => void;
}

export const AiRecommendationsModal: React.FC<AiRecommendationsModalProps> = ({
  events,
  city,
  onClose,
  onViewDetails,
}) => {
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState<AIRecommendationResponse | null>(null);

  useEffect(() => {
    async function loadRecs() {
      setLoading(true);
      const res = await getAiRecommendations(['Tech', 'Hackathon', 'Music', 'Workshop'], city);
      setAiData(res);
      setLoading(false);
    }
    loadRecs();
  }, [city]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Recommendations</h2>
        </div>

        <p className="text-xs text-slate-500 font-medium mb-6">
          Powered by Gemini AI | Analyzing events near <span className="font-bold text-slate-800">{city}</span>
        </p>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Gemini is curating personalized events for you...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-slate-700 font-medium">
              ✨ {aiData?.overviewText}
            </div>

            <div className="space-y-3">
              {aiData?.recommendations.map((rec) => {
                const eventObj = events.find((e) => e.id === rec.eventId) || events[0];
                if (!eventObj) return null;

                return (
                  <div
                    key={rec.eventId}
                    onClick={() => {
                      onViewDetails(eventObj);
                      onClose();
                    }}
                    className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50 px-2.5 py-0.5 rounded-md">
                        {eventObj.category}
                      </span>
                      <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {rec.matchScore}% Match
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                      {eventObj.title}
                    </h3>

                    <p className="text-xs text-slate-600 font-normal italic">
                      "{rec.reason}"
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-medium">
                      <span>📍 {eventObj.venue}, {eventObj.city}</span>
                      <span className="text-blue-600 font-bold flex items-center gap-1">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
