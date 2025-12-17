
import React, { useState } from 'react';
import { CobrandingCase, GroundingMetadata, formatCaseToPlainText } from '../types';

interface ReviewBoardProps {
  newCases: CobrandingCase[];
  existingCases: CobrandingCase[];
  metadata?: GroundingMetadata;
  onConfirm: (selectedCases: CobrandingCase[]) => void;
  onDiscardAll: () => void;
}

export const ReviewBoard: React.FC<ReviewBoardProps> = ({ newCases, existingCases, metadata, onConfirm, onDiscardAll }) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(newCases.map((_, i) => i));

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleConfirm = () => {
    const selected = newCases.filter((_, i) => selectedIndices.includes(i));
    onConfirm(selected);
  };

  const isDuplicate = (newCase: CobrandingCase) => {
    return existingCases.some(existing => 
      existing.productName.toLowerCase() === newCase.productName.toLowerCase() ||
      existing.projectName.toLowerCase() === newCase.projectName.toLowerCase()
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-24 px-4 animate-fade-in-up">
      <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 overflow-hidden mb-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-white tracking-tight">Mission Report</h2>
            <p className="text-indigo-100 text-sm mt-1 font-medium">Review findings before saving to your collection.</p>
          </div>
          <div className="flex gap-4 relative z-10">
             <button onClick={onDiscardAll} className="px-6 py-3 text-indigo-100 hover:text-white font-bold text-sm bg-white/10 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">Discard</button>
             <button 
                onClick={handleConfirm}
                className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm flex items-center gap-2"
             >
               <span>Save {selectedIndices.length} Cases</span>
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </button>
          </div>
        </div>

        {/* Source Intelligence */}
        <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-400"></span>
             Source Intelligence Scanned
           </h3>
           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
             {metadata?.groundingChunks?.map((chunk, i) => (
                <a 
                  key={i} 
                  href={chunk.web?.uri} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(chunk.web?.uri || 'http://google.com').hostname}`} alt="" className="w-3 h-3 mr-2 opacity-60"/>
                  <span className="truncate max-w-[200px]">{chunk.web?.title || 'Web Source'}</span>
                </a>
             )) || <span className="text-slate-400 text-sm italic">No direct sources returned by grounding.</span>}
           </div>
        </div>
        
        {/* Cases Grid */}
        <div className="p-8 bg-slate-100/50">
           <div className="grid grid-cols-1 gap-6">
              {newCases.map((c, idx) => {
                 const isDup = isDuplicate(c);
                 // Generate Google Image Search URL
                 const googleImgLink = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(c.projectName + ' ' + c.brandName + ' ' + c.partnerIntro + ' official')}`;

                 return (
                  <div 
                    key={idx} 
                    onClick={() => toggleSelection(idx)}
                    className={`relative bg-white rounded-3xl p-8 cursor-pointer transition-all duration-300 border-2 group ${selectedIndices.includes(idx) ? 'border-indigo-500 shadow-xl scale-[1.01] z-10' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-[1.005]'}`}
                  >
                    {/* Selection Checkbox */}
                    <div className={`absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedIndices.includes(idx) ? 'bg-indigo-600 border-indigo-600 scale-110' : 'border-slate-200 bg-slate-50'}`}>
                       {selectedIndices.includes(idx) && <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>

                    {isDup && (
                      <div className="absolute top-6 left-6 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-amber-200 uppercase tracking-wide">
                        ⚠️ Potential Duplicate
                      </div>
                    )}

                    <div className="mt-2 pr-12">
                      {/* 1. 项目概述 (Project Overview/Name) & Slogan */}
                      <div className="mb-4">
                         <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{c.projectName}</h3>
                         {c.campaignSlogan && c.campaignSlogan !== 'N/A' && (
                           <p className="text-lg font-bold text-indigo-600 italic font-serif">“{c.campaignSlogan}”</p>
                         )}
                      </div>

                      {/* 2-6. Core Metadata Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">项目时间 (Time)</span>
                            <span className="text-base font-bold text-slate-800">{c.date}</span>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">发起品牌 (Brand)</span>
                            <span className="text-base font-bold text-slate-800">{c.brandName}</span>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">合作品牌 (Partner)</span>
                            <span className="text-base font-bold text-slate-800">{c.partnerIntro}</span>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">涉及产品 (Product)</span>
                            <span className="text-base font-bold text-slate-800">{c.productName}</span>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">视觉风格 (Style)</span>
                            <span className="text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{c.visualStyle || 'N/A'}</span>
                         </div>
                         <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">成效/热度 (Impact)</span>
                            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-block">{c.impactResult || 'N/A'}</span>
                         </div>
                      </div>

                      {/* 11. 案例洞察 (Insight) */}
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 案例洞察 (Insight)
                        </h4>
                        <p className="text-base text-slate-700 leading-relaxed font-medium bg-white border-l-4 border-indigo-400 pl-4 py-2">
                          {c.insight}
                        </p>
                      </div>

                      {/* 9. 联名权益 (Rights) */}
                      <div className="mb-6">
                         <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 联名权益 (Rights)
                        </h4>
                        <ul className="space-y-2">
                          {c.rights.map((r, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600">
                              <span className="font-bold text-indigo-600 mr-2 min-w-[20px]">{i + 1}.</span>
                              <span><strong className="text-slate-900">{r.title}:</strong> {r.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 7-8. Reference Image & Sources */}
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                         {/* 7. 参考图 (Reference Image Jump) */}
                         <a 
                           href={googleImgLink}
                           target="_blank" 
                           rel="noreferrer"
                           onClick={(e) => e.stopPropagation()}
                           className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl font-bold text-xs transition-colors"
                         >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            参考图 (Google Photos) ↗
                         </a>
                         
                         {/* 8. 信息来源 (Sources) */}
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">| 信息来源: {c.platformSource}</span>
                         {c.sourceUrls.map((url, i) => (
                           <a key={i} href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-500 hover:underline">
                             Link {i+1}
                           </a>
                         ))}
                      </div>

                       <div className="mt-6 pt-4 border-t border-slate-100">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Text Preview</h4>
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                           <pre className="whitespace-pre-wrap font-mono text-xs text-slate-500 overflow-x-auto">
                              {formatCaseToPlainText(c).substring(0, 300)}...
                           </pre>
                         </div>
                       </div>

                    </div>
                  </div>
                 );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};
