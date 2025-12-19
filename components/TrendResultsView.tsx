
import React, { useState } from 'react';
import { TrendItem, GroundingMetadata } from '../types';

interface TrendResultsViewProps {
  topic: string;
  trends: TrendItem[];
  metadata?: GroundingMetadata;
  onAnalyzeBrand: (brandName: string) => void;
  onSaveToNotebook: (selectedTrends: TrendItem[]) => void;
  onClose: () => void;
}

export const TrendResultsView: React.FC<TrendResultsViewProps> = ({ topic, trends, metadata, onAnalyzeBrand, onSaveToNotebook, onClose }) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleSave = () => {
    const selected = trends.filter((_, i) => selectedIndices.includes(i));
    onSaveToNotebook(selected);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-28 px-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8 sticky top-24 z-30 bg-white/80 backdrop-blur-xl py-4 rounded-[20px] px-6 border border-white/50 shadow-sm transition-all">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">趋势报告</span>
           </div>
           <h2 className="text-2xl font-bold text-slate-900 leading-tight">"{topic}"</h2>
        </div>
        <div className="flex gap-3">
          {selectedIndices.length > 0 && (
             <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-xs shadow-md animate-fade-in hover:-translate-y-0.5 transition-all"
             >
               保存报告 ({selectedIndices.length})
             </button>
          )}
          <button 
             onClick={onClose}
             className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-bold text-xs transition-colors"
          >
            关闭
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trends.map((item, index) => (
          <div 
             key={index} 
             onClick={() => toggleSelection(index)}
             className={`bg-white/80 backdrop-blur-sm rounded-[24px] p-8 shadow-sm border transition-all relative overflow-hidden cursor-pointer duration-300 ${selectedIndices.includes(index) ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-50 hover:shadow-xl hover:-translate-y-1'}`}
          >
             {/* Selection Checkbox */}
            <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-20 ${selectedIndices.includes(index) ? 'bg-purple-600 border-purple-600 scale-110' : 'border-slate-200 bg-white'}`}>
                {selectedIndices.includes(index) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>

             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="text-8xl font-bold text-purple-900">#{index + 1}</span>
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 pr-10">
                   <h3 className="text-2xl font-bold text-slate-900">{item.ipName}</h3>
                   <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">{item.category}</span>
                   {item.originCountry && (
                      <span className="text-xs font-bold text-slate-400">📍 {item.originCountry}</span>
                   )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.momentum && (
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                        item.momentum === 'Peaking' ? 'bg-red-50 text-red-600' : 
                        item.momentum === 'Emerging' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                     }`}>
                        🚀 {item.momentum} Momentum
                     </span>
                  )}
                  {item.commercialValue && (
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                        item.commercialValue === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                     }`}>
                        💎 {item.commercialValue} Value
                     </span>
                  )}
                </div>

                <div className="space-y-4">
                   <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                      <p className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-1">流行原因</p>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.reason}</p>
                   </div>
                   
                   {item.buzzwords && item.buzzwords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                         {item.buzzwords.map((bw, i) => (
                           <span key={i} className="px-2 py-1 bg-white border border-slate-100 rounded-md text-xs font-bold text-slate-500">#{bw}</span>
                         ))}
                      </div>
                   )}

                   <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">受众群体</p>
                         <p className="text-sm font-medium text-slate-800">{item.targetAudience}</p>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">兼容性</p>
                         <div className="flex flex-wrap gap-1">
                           {Array.isArray(item.compatibility) ? (
                              item.compatibility.map((c, i) => (
                                <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{c}</span>
                              ))
                           ) : (
                              <p className="text-sm font-medium text-slate-800 line-clamp-2">{item.compatibility}</p>
                           )}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                   <a 
                      href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.ipName + ' official art')}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-slate-400 hover:text-purple-600 flex items-center gap-2 transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     视觉参考
                   </a>

                   <button 
                      onClick={(e) => { e.stopPropagation(); onAnalyzeBrand(item.ipName); }}
                      className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-slate-200"
                   >
                     深度挖掘
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Sources Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Intelligence Sources</p>
         <div className="flex flex-wrap gap-2">
            {metadata?.groundingChunks?.map((chunk, i) => (
                <a key={i} href={chunk.web?.uri} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:underline bg-indigo-50 px-2 py-1 rounded">
                   {chunk.web?.title || 'Web Source'}
                </a>
            ))}
         </div>
      </div>
    </div>
  );
};
