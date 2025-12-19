
import React from 'react';
import { IPProfile, GroundingMetadata } from '../types';

interface IPProfileViewProps {
  profile: IPProfile;
  metadata?: GroundingMetadata;
  onClose: () => void;
}

export const IPProfileView: React.FC<IPProfileViewProps> = ({ profile, metadata, onClose }) => {
  return (
    <div className="max-w-6xl mx-auto pb-20 mt-28 px-4 animate-fade-in-up">
      
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-[#b5004a] to-rose-600 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-8 text-white">
         <button 
           onClick={onClose} 
           className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-[#b5004a] transition-all z-20"
         >
           ✕
         </button>
         
         <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/3"></div>

         <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-[#b5004a] shadow-sm`}>
                 Tier {profile.commercialAnalysis.tier}
               </span>
               <span className="px-3 py-1 bg-black/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                  {profile.meta.originMedium}
               </span>
               <span className="px-3 py-1 bg-black/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                  {profile.meta.currentStatus}
               </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 text-white">{profile.meta.ipName}</h2>
            <p className="text-sm font-medium text-pink-100 uppercase tracking-widest mb-8 opacity-90">版权方: {profile.meta.rightsHolder}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-white/20 pt-6">
               <div>
                  <span className="text-xs font-bold text-pink-200 uppercase tracking-widest block mb-1">品牌原型</span>
                  <span className="text-lg font-bold">{profile.commercialAnalysis.brandArchetype}</span>
               </div>
               <div>
                  <span className="text-xs font-bold text-pink-200 uppercase tracking-widest block mb-1">市场势能</span>
                  <span className="text-lg font-bold">{profile.commercialAnalysis.marketMomentum}</span>
               </div>
               <div>
                  <span className="text-xs font-bold text-pink-200 uppercase tracking-widest block mb-1">核心受众</span>
                  <span className="text-lg font-bold">{profile.commercialAnalysis.coreAudience.primaryGen}</span>
               </div>
               <div>
                  <span className="text-xs font-bold text-pink-200 uppercase tracking-widest block mb-1">性别偏好</span>
                  <span className="text-lg font-bold">{profile.commercialAnalysis.coreAudience.genderSkew}</span>
               </div>
            </div>
         </div>
      </div>

      {/* 2. CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
         
         {/* LEFT COLUMN (Strategy) */}
         <div className="space-y-6">
             {/* Audience */}
             <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">👥</span> 受众画像 DNA
                </h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {profile.commercialAnalysis.coreAudience.psychographics}
                </p>
             </div>

             {/* Strategic Fit */}
             <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                   <span className="text-xl">🧩</span> 策略契合度
                 </h3>
                 
                 <div className="mb-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">营销钩子</span>
                    <p className="text-base font-bold text-[#b5004a] italic">"{profile.strategicFit.marketingHooks}"</p>
                 </div>

                 <div className="space-y-3">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                       <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">最佳适配行业</span>
                       <div className="flex flex-wrap gap-1">
                          {profile.strategicFit.bestIndustries?.map((ind, i) => (
                             <span key={i} className="text-xs font-bold text-emerald-800 bg-white px-2 py-1 rounded shadow-sm">{ind}</span>
                          ))}
                       </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                       <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest block mb-1">避雷行业</span>
                       <div className="flex flex-wrap gap-1">
                          {profile.strategicFit.avoidIndustries?.map((ind, i) => (
                             <span key={i} className="text-xs font-bold text-red-800 bg-white px-2 py-1 rounded shadow-sm">{ind}</span>
                          ))}
                       </div>
                    </div>
                 </div>
             </div>

              {/* Risks */}
             {profile.commercialAnalysis.riskFactors && profile.commercialAnalysis.riskFactors.length > 0 && (
               <div className="bg-amber-50 rounded-[24px] p-6 border border-amber-100">
                  <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">⚠️ 风险提示</h3>
                  <ul className="space-y-2">
                    {profile.commercialAnalysis.riskFactors.map((risk, i) => (
                      <li key={i} className="text-sm font-bold text-amber-900 flex items-start gap-2">
                        <span className="text-amber-500">•</span> {risk}
                      </li>
                    ))}
                  </ul>
               </div>
             )}
         </div>

         {/* RIGHT COLUMN (Design & History) */}
         <div className="lg:col-span-2 space-y-6">

             {/* Design Language */}
             <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-xl">🎨</span> 视觉设计语言
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">核心色盘</h4>
                       <div className="flex flex-wrap gap-2 mb-6">
                          {profile.designElements.keyColors?.map((color, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">{color}</span>
                          ))}
                       </div>

                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">材质与纹理</h4>
                       <div className="flex flex-wrap gap-2">
                          {profile.designElements.texturesAndMaterials?.map((tex, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">{tex}</span>
                          ))}
                       </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">标志性元素</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {profile.designElements.iconography?.map((icon, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-xs font-medium">{icon}</span>
                          ))}
                       </div>

                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Signature Quote</h4>
                       <blockquote className="text-sm font-serif italic text-slate-800 border-l-4 border-[#b5004a] pl-4 py-1">
                          "{profile.designElements.signatureQuotes?.[0] || 'No specific quote found.'}"
                       </blockquote>
                    </div>
                 </div>
             </div>

             {/* Collab History */}
             <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-xl">📜</span> 历史联名记录
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{profile.collabHistory?.length || 0}</span>
                   </h3>
                </div>
                
                <div className="overflow-hidden">
                   <div className="hidden sm:grid grid-cols-12 gap-4 pb-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                      <div className="col-span-2">时间</div>
                      <div className="col-span-3">品牌</div>
                      <div className="col-span-3">产品</div>
                      <div className="col-span-4">成效</div>
                   </div>

                   <div className="space-y-2 mt-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {profile.collabHistory?.map((collab, i) => (
                         <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                            {/* Mobile View */}
                            <div className="sm:hidden flex justify-between items-center col-span-1 mb-1">
                               <span className="text-xs font-mono font-bold text-slate-400">{collab.time}</span>
                               <span className="text-xs font-bold text-slate-900">{collab.brand}</span>
                            </div>
                            
                            {/* Desktop Columns */}
                            <div className="col-span-1 sm:col-span-2 text-xs font-mono font-bold text-slate-500 hidden sm:block">{collab.time}</div>
                            <div className="col-span-1 sm:col-span-3 font-bold text-slate-800 text-sm hidden sm:block">{collab.brand}</div>
                            <div className="col-span-1 sm:col-span-3">
                               <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600 inline-block">{collab.product}</span>
                            </div>
                            <div className="col-span-1 sm:col-span-4 text-xs text-slate-500 flex justify-between items-center gap-2">
                               <span className="line-clamp-2">{collab.marketEffect}</span>
                               {collab.link && (
                                   <a href={collab.link} target="_blank" rel="noreferrer" className="text-[#b5004a] hover:text-pink-700 shrink-0 bg-pink-50 p-1.5 rounded-lg">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                   </a>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Upcoming */}
             {profile.upcomingTimeline && profile.upcomingTimeline.length > 0 && (
                <div className="bg-indigo-50 rounded-[24px] p-6 border border-indigo-100">
                   <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-4">📅 未来大事件</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.upcomingTimeline.map((evt, i) => (
                         <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-100/50 shadow-sm">
                            <span className="font-mono font-bold text-indigo-500 text-xs bg-indigo-50 px-2 py-1 rounded">{evt.date}</span>
                            <span className="font-bold text-slate-700 text-sm">{evt.event}</span>
                         </div>
                      ))}
                   </div>
                </div>
             )}

         </div>
      </div>
      
      {/* Sources Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Intelligence Sources</p>
         <div className="flex flex-wrap gap-2">
            {metadata?.groundingChunks?.map((chunk, i) => (
                <a key={i} href={chunk.web?.uri} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-500 hover:text-[#b5004a] bg-white border border-slate-200 hover:border-[#b5004a] px-3 py-1.5 rounded-full transition-all">
                   {chunk.web?.title || 'Web Source'}
                </a>
            ))}
         </div>
      </div>
    </div>
  );
};
