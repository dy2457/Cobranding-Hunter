import React, { useState } from 'react';
import { CobrandingCase, GroundingMetadata, formatCaseToMarkdown } from '../types';

interface ReviewBoardProps {
  newCases: CobrandingCase[];
  existingCases: CobrandingCase[];
  metadata?: GroundingMetadata;
  onConfirm: (selectedCases: CobrandingCase[]) => void;
  onDiscardAll: () => void;
}

export const ReviewBoard: React.FC<ReviewBoardProps> = ({ newCases, existingCases, metadata, onConfirm, onDiscardAll }) => {
  // By default select all new cases
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

  // Helper to check duplicates
  const isDuplicate = (newCase: CobrandingCase) => {
    return existingCases.some(existing => 
      existing.productName.toLowerCase() === newCase.productName.toLowerCase() ||
      existing.projectName.toLowerCase() === newCase.projectName.toLowerCase()
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-24 px-4 animate-fade-in-up">
      <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 overflow-hidden mb-8">
        
        {/* Header Section with Vibrant Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          {/* Abstract pattern */}
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
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
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

                    {/* Duplicate Warning */}
                    {isDup && (
                      <div className="absolute top-6 left-6 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-amber-200 uppercase tracking-wide">
                        ⚠️ Potential Duplicate
                      </div>
                    )}

                    <div className="mt-2 pr-12">
                      <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-3">
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">{c.projectName}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{c.date}</span>
                      </div>
                      
                      <div className="flex gap-2 mb-4">
                         <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                           {c.productName}
                         </span>
                         <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">
                           {c.partnerIntro.substring(0, 30)}...
                         </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-6 leading-relaxed border-l-2 border-indigo-200 pl-4">
                        {c.insight}
                      </p>
                      
                      <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 font-mono overflow-hidden border border-slate-100 opacity-80 group-hover:opacity-100 transition-opacity">
                        {formatCaseToMarkdown(c).substring(0, 200)}...
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