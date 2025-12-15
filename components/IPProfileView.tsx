import React from 'react';
import { IPProfile } from '../types';

interface IPProfileViewProps {
  profile: IPProfile;
  onClose: () => void;
}

export const IPProfileView: React.FC<IPProfileViewProps> = ({ profile, onClose }) => {
  return (
    <div className="max-w-5xl mx-auto pb-20 mt-28 px-4 animate-fade-in-up">
      {/* Header Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/60 relative overflow-hidden mb-8">
         <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors z-20">✕</button>
         
         <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest text-white shadow-lg ${
                      profile.commercialTier === 'S' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      profile.commercialTier === 'A' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                      'bg-slate-500'
                  }`}>
                    Tier {profile.commercialTier}
                  </span>
                  <div className="flex gap-2">
                     {profile.tags.map(tag => (
                       <span key={tag} className="px-2 py-1 bg-white/50 rounded-md text-[10px] font-bold text-slate-500 uppercase">{tag}</span>
                     ))}
                  </div>
               </div>

               <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">{profile.name}</h2>
               <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">{profile.description}</p>
            </div>
            
            <div className="w-full md:w-80 bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-inner">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Values</h3>
               <div className="flex flex-wrap gap-2">
                  {profile.coreValues.map((val, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md">{val}</span>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Audience Stats */}
         <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>👥 Audience DNA</span>
            </h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Age Range</span>
                  <span className="text-xl font-bold text-slate-900">{profile.audienceDemographics.ageRange}</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Gender Split</span>
                  <span className="text-xl font-bold text-slate-900">{profile.audienceDemographics.genderSplit}</span>
               </div>
               <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 block ml-1">Key Interests</span>
                  <div className="flex flex-wrap gap-2">
                     {profile.audienceDemographics.keyInterests.map((int, i) => (
                        <span key={i} className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-sm font-bold">{int}</span>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Commercial & Risk */}
         <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm relative overflow-hidden">
               <h3 className="text-xl font-bold text-slate-900 mb-4">⚠️ Risk Assessment</h3>
               <p className="text-slate-600 leading-relaxed font-medium">{profile.riskAssessment}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
               <h3 className="text-xl font-bold text-slate-900 mb-4">🏆 Notable Past Collabs</h3>
               <div className="flex flex-wrap gap-3">
                  {profile.pastCollabs.map((collab, i) => (
                     <span key={i} className="px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-800 border border-cyan-100 rounded-xl font-bold text-sm">
                        {collab}
                     </span>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
