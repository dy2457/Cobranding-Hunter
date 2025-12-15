import React, { useState, useEffect } from 'react';
import { CobrandingCase, formatCaseToMarkdown, NotebookData, TrendItem } from '../types';
import { InfographicDashboard } from './InfographicDashboard';

interface NotebookProps {
  notebook: NotebookData;
  onRename: (id: string, newName: string) => void;
  onDeleteCase: (index: number) => void;
  onDeleteTrend?: (index: number) => void;
  onBack: () => void;
  hasPendingReview?: boolean;
}

export const Notebook: React.FC<NotebookProps> = ({ notebook, onRename, onDeleteCase, onDeleteTrend, onBack, hasPendingReview }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(notebook.name);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    setEditedName(notebook.name);
  }, [notebook.name]);

  const handleCopy = (c: CobrandingCase, idx: number) => {
    const text = formatCaseToMarkdown(c);
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const saveName = () => {
    if (editedName.trim()) {
      onRename(notebook.id, editedName);
    } else {
      setEditedName(notebook.name);
    }
    setIsEditingName(false);
  };

  const BackButton = () => (
    <button onClick={onBack} className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors ${hasPendingReview ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
       {hasPendingReview ? (
         <>
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Return to Review
         </>
       ) : (
         <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
         </>
       )}
    </button>
  );

  const isEmpty = notebook.cases.length === 0 && (!notebook.trends || notebook.trends.length === 0);
  const isReport = notebook.type === 'report';

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto mt-32 text-center py-24 bg-white/50 backdrop-blur-md rounded-[40px] border border-dashed border-slate-300 animate-fade-in">
         <div className="text-6xl mb-6 opacity-30">📓</div>
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Notebook is Empty</h2>
         <p className="text-slate-500 mb-8">Go find some awesome co-branding cases!</p>
         <div className="flex justify-center">
            <BackButton />
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 mt-28 px-4 animate-fade-in-up">
      {/* Analytics Overlay */}
      {showAnalytics && <InfographicDashboard notebook={notebook} onClose={() => setShowAnalytics(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-24 z-30 bg-white/80 backdrop-blur-xl py-4 rounded-[20px] px-6 border border-white/50 shadow-sm transition-all">
        <div className="flex items-center gap-6">
           <BackButton />
           <div>
              {isEditingName ? (
                <input 
                  autoFocus
                  className="text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                />
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                   <h2 className="text-2xl font-bold text-slate-900">{notebook.name}</h2>
                   <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
              )}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                 {isReport ? 'Trend Report' : 'Case Collection'} • {isReport ? notebook.trends?.length || 0 : notebook.cases.length} Items
              </p>
           </div>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => setShowAnalytics(true)}
             className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             Analytics
           </button>
        </div>
      </div>

      {/* TRENDS LIST VIEW */}
      {isReport && notebook.trends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {notebook.trends.map((item, index) => (
             <div key={index} className="bg-white/80 backdrop-blur-sm rounded-[24px] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all relative group">
                <button 
                  onClick={() => onDeleteTrend && onDeleteTrend(index)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{item.ipName}</h3>
                      <span className="text-xs font-bold text-slate-500 uppercase">{item.category}</span>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{item.reason}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                       <span className="font-bold text-slate-400 block mb-1">Audience</span>
                       <span className="font-medium text-slate-800">{item.targetAudience}</span>
                    </div>
                    <div>
                       <span className="font-bold text-slate-400 block mb-1">Compatibility</span>
                       <span className="font-medium text-slate-800">{item.compatibility}</span>
                    </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* CASES LIST VIEW */}
      {!isReport && (
        <div className="grid grid-cols-1 gap-8">
          {notebook.cases.map((c, index) => (
            <div key={index} className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Action Buttons */}
              <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                  <button 
                    onClick={() => handleCopy(c, index)}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {copiedIndex === index ? 'Copied!' : 'Copy Markdown'}
                  </button>
                  <button 
                    onClick={() => onDeleteCase(index)}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-6">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{c.projectName}</h3>
                <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{c.date}</span>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Brand Product</span>
                    <span className="text-sm font-bold text-indigo-900">{c.productName}</span>
                  </div>
                  <div className="px-4 py-2 bg-fuchsia-50 rounded-xl border border-fuchsia-100">
                    <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest block mb-1">Partner IP</span>
                    <span className="text-sm font-bold text-fuchsia-900">{c.partnerIntro.substring(0, 40)}{c.partnerIntro.length > 40 && '...'}</span>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> Insight
                    </h4>
                    <p className="text-slate-600 leading-relaxed font-medium mb-6 bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-400">
                      {c.insight}
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> Key Rights & Mechanics
                    </h4>
                    <ul className="space-y-3">
                      {c.rights.map((r, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <span className="font-bold text-indigo-600 mr-2 min-w-[20px]">{i + 1}.</span>
                          <span><strong className="text-slate-900">{r.title}:</strong> {r.description}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
                 
                 <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Source Links</h4>
                    <div className="flex flex-col gap-2">
                       {c.sourceUrls && c.sourceUrls.length > 0 ? c.sourceUrls.map((url, i) => (
                         <a 
                           key={i} 
                           href={url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all truncate"
                         >
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                           <span className="truncate">{new URL(url).hostname}</span>
                           <span className="text-slate-300 ml-auto">↗</span>
                         </a>
                       )) : <span className="text-slate-300 text-xs italic">No links available</span>}
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};