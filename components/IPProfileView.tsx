
import React from 'react';
import { IPProfile, GroundingMetadata } from '../types';

interface IPProfileViewProps {
  profile: IPProfile;
  metadata?: GroundingMetadata;
  onClose: () => void;
}

export const IPProfileView: React.FC<IPProfileViewProps> = ({ profile, metadata, onClose }) => {
  return (
    <div className="max-w-7xl mx-auto pb-20 mt-28 px-4 animate-fade-in-up">
      {/* 1. HERO SECTION */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/60 relative overflow-hidden mb-8">
         <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors z-20">✕</button>
         
         <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
               <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest text-white shadow-lg ${
                      profile.commercialAnalysis.tier === 'S' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      profile.commercialAnalysis.tier === 'A' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                      'bg-slate-500'
                  }`}>
                    Tier {profile.commercialAnalysis.tier}
                  </span>
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest">
                     {profile.meta.originMedium}
                  </span>
                  <span className={`px-3 py-1 bg-white/50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest ${
                     profile.meta.currentStatus === 'Active' ? 'text-green-600' : 'text-slate-500'
                  }`}>
                     {profile.meta.currentStatus}
                  </span>
               </div>

               <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-4">{profile.meta.ipName}</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Rights Holder: {profile.meta.rightsHolder}</p>
               
               <div className="flex flex-wrap gap-2 mb-8">
                  {profile.commercialAnalysis.riskFactors?.map((risk, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold flex items-center gap-1">
                       ⚠️ {risk}
                    </span>
                  ))}
               </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-inner flex flex-col justify-center">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Brand Archetype</h3>
               <div className="text-center">
                  <span className="text-4xl block mb-2">👑</span>
                  <span className="text-2xl font-bold text-slate-900 block">{profile.commercialAnalysis.brandArchetype}</span>
               </div>
               <div className="mt-6 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Market Momentum</h3>
                  <div className="text-center font-bold text-indigo-600">{profile.commercialAnalysis.marketMomentum}</div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN CONTENT GRID (Consistent 1/3 | 2/3 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
         
         {/* LEFT COLUMN (1/3 Width) */}
         <div className="flex flex-col gap-6">
             
             {/* Audience DNA */}
             <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span>👥 Audience DNA</span>
                </h3>
                <div className="space-y-4">
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Primary Gen</span>
                      <span className="text-lg font-bold text-slate-900">{profile.commercialAnalysis.coreAudience.primaryGen}</span>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Gender Skew</span>
                      <span className="text-lg font-bold text-slate-900">{profile.commercialAnalysis.coreAudience.genderSkew}</span>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Psychographics</span>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{profile.commercialAnalysis.coreAudience.psychographics}</p>
                   </div>
                </div>
             </div>

             {/* Strategic Fit */}
             <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm">
                 <h3 className="text-xl font-bold text-slate-900 mb-6">🧩 Strategic Fit</h3>
                 
                 <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Marketing Hook</span>
                    <p className="text-lg font-bold text-indigo-600 italic">"{profile.strategicFit.marketingHooks}"</p>
                 </div>

                 <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                       <span className="text-xs font-bold text-green-700 uppercase tracking-widest block mb-2">Best Industries</span>
                       <ul className="text-sm font-bold text-slate-700 space-y-1">
                          {profile.strategicFit.bestIndustries?.map((ind, i) => <li key={i}>✓ {ind}</li>)}
                       </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                       <span className="text-xs font-bold text-red-700 uppercase tracking-widest block mb-2">Avoid</span>
                       <ul className="text-sm font-bold text-slate-700 space-y-1">
                          {profile.strategicFit.avoidIndustries?.map((ind, i) => <li key={i}>✕ {ind}</li>)}
                       </ul>
                    </div>
                 </div>
             </div>

              {/* Upcoming Events (Moved Here) */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[32px] p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">📅 Upcoming Events</h3>
                <div className="space-y-2">
                   {profile.upcomingTimeline?.map((evt, i) => (
                      <div key={i} className="flex items-center gap-4 bg-white/60 p-3 rounded-xl">
                         <span className="font-mono font-bold text-blue-600 text-sm">{evt.date}</span>
                         <span className="font-medium text-slate-700 text-sm leading-tight">{evt.event}</span>
                      </div>
                   ))}
                   {(!profile.upcomingTimeline || profile.upcomingTimeline.length === 0) && <p className="text-slate-500 text-sm">No upcoming events detected.</p>}
                </div>
             </div>

         </div>

         {/* RIGHT COLUMN (2/3 Width) */}
         <div className="flex flex-col gap-6">

             {/* Design & Aesthetics */}
             <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-30"></div>
                 
                 <h3 className="text-xl font-bold mb-6 relative z-10">🎨 Design Language & Aesthetics</h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Colors</h4>
                       <div className="flex flex-wrap gap-2 mb-6">
                          {profile.designElements.keyColors?.map((color, i) => (
                            <span key={i} className="px-3 py-1.5 border border-slate-700 rounded-lg text-sm font-mono">{color}</span>
                          ))}
                       </div>

                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Textures / Materials</h4>
                       <div className="flex flex-wrap gap-2">
                          {profile.designElements.texturesAndMaterials?.map((tex, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm">{tex}</span>
                          ))}
                       </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Iconography</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {profile.designElements.iconography?.map((icon, i) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 rounded-lg text-sm font-bold">{icon}</span>
                          ))}
                       </div>

                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Signature Quote</h4>
                       <blockquote className="text-lg font-serif italic text-slate-300 border-l-2 border-indigo-500 pl-4">
                          "{profile.designElements.signatureQuotes?.[0] || 'No specific quote found.'}"
                       </blockquote>
                    </div>
                 </div>
             </div>

             {/* Collab History (Takes 2/3 width now) */}
             <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-white/50 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      📜 Collab History
                      <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{profile.collabHistory?.length || 0} Cases</span>
                   </h3>
                </div>
                
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2 hidden sm:grid">
                   <div className="col-span-2">Time</div>
                   <div className="col-span-3">Brand</div>
                   <div className="col-span-3">Product</div>
                   <div className="col-span-4">Market Effect</div>
                </div>

                <div className="space-y-1 overflow-y-auto custom-scrollbar pr-2 flex-1">
                   {profile.collabHistory?.map((collab, i) => (
                      <div key={i} className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-all border-b border-slate-50 last:border-0">
                         {/* Mobile: Time & Product Row */}
                         <div className="sm:hidden flex justify-between items-center col-span-1">
                            <span className="text-xs font-mono font-bold text-slate-400">{collab.time}</span>
                            <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">{collab.product}</span>
                         </div>
                         
                         {/* Desktop Columns */}
                         <div className="col-span-1 sm:col-span-2 text-xs font-mono font-bold text-slate-400 pt-1 hidden sm:block">{collab.time}</div>
                         <div className="col-span-1 sm:col-span-3 font-bold text-slate-900 text-sm pt-0.5">{collab.brand}</div>
                         <div className="col-span-1 sm:col-span-3 hidden sm:block">
                            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 inline-block leading-tight">{collab.product}</span>
                         </div>
                         <div className="col-span-1 sm:col-span-4 text-xs text-slate-500 leading-relaxed italic flex justify-between items-start gap-2">
                            <span>{collab.marketEffect}</span>
                            {collab.link && (
                                <a href={collab.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-600 shrink-0" title="View Source">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>

         </div>
      </div>
      
      {/* Sources Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Intelligence Sources</p>
         <div className="flex flex-wrap gap-2">
            {metadata?.groundingChunks?.map((chunk, i) => (
                <a key={i} href={chunk.web?.uri} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:underline bg-indigo-50 px-2 py-1 rounded transition-colors">
                   {chunk.web?.title || 'Web Source'}
                </a>
            ))}
            {(!metadata?.groundingChunks || metadata.groundingChunks.length === 0) && (
                <span className="text-xs text-slate-400 italic">No direct sources found for this profile.</span>
            )}
         </div>
      </div>
    </div>
  );
};
