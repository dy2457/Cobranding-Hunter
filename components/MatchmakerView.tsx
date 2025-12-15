import React from 'react';
import { MatchRecommendation, MatchConfig } from '../types';

interface MatchmakerViewProps {
  config: MatchConfig;
  recommendations: MatchRecommendation[];
  onClose: () => void;
}

export const MatchmakerView: React.FC<MatchmakerViewProps> = ({ config, recommendations, onClose }) => {
  const sortedRecs = [...recommendations].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="max-w-5xl mx-auto pb-20 mt-28 px-4 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-12">
         <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-500 mb-2 block">Matchmaker Results</span>
         <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Top Partners for {config.brandName}</h2>
         <p className="text-slate-500 max-w-xl mx-auto">Based on your goal "{config.campaignGoal}" targeting {config.targetAudience || 'your audience'}.</p>
         <button onClick={onClose} className="mt-8 px-8 py-2.5 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-full font-bold text-sm transition-all">
            Run New Match
         </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedRecs.map((rec, index) => (
          <div 
            key={index} 
            className="group relative bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
             {/* Score Badge */}
             <div className="absolute top-0 right-0 p-8">
                <div className="relative w-20 h-20 flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path 
                        className={rec.matchScore > 90 ? "text-pink-500" : rec.matchScore > 80 ? "text-purple-500" : "text-indigo-500"} 
                        strokeDasharray={`${rec.matchScore}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                      />
                   </svg>
                   <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-slate-900 leading-none">{rec.matchScore}%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Match</span>
                   </div>
                </div>
             </div>

             <div className="pr-20">
                <div className="flex items-center gap-3 mb-4">
                   <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">#{index + 1}</span>
                   <h3 className="text-2xl font-bold text-slate-900">{rec.ipName}</h3>
                   <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">{rec.category}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Why It Works</h4>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{rec.whyItWorks}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span>💡 Campaign Concept</span>
                      </h4>
                      <p className="text-sm text-slate-800 font-bold italic">"{rec.campaignIdea}"</p>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
