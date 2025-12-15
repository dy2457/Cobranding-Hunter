import React from 'react';
import { CollectionType, NotebookData } from '../types';

interface NotebookListProps {
  notebooks: NotebookData[];
  onSelectNotebook: (id: string) => void;
  onCreateNotebook: (type: CollectionType) => void;
  onDeleteNotebook: (id: string) => void;
  onClose: () => void;
}

export const NotebookList: React.FC<NotebookListProps> = ({ notebooks, onSelectNotebook, onCreateNotebook, onDeleteNotebook, onClose }) => {
  const caseNotebooks = notebooks.filter(n => n.type === 'notebook');
  const trendReports = notebooks.filter(n => n.type === 'report');

  const Section = ({ title, type, items, icon, gradient }: { title: string, type: CollectionType, items: NotebookData[], icon: string, gradient: string }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
           <span className="bg-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-100">{icon}</span> {title}
        </h3>
        <button onClick={() => onCreateNotebook(type)} className="text-sm bg-slate-900 text-white hover:bg-black font-bold py-2.5 px-5 rounded-full transition-all hover:scale-105 shadow-lg active:scale-95">
             + New
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.length === 0 && (
           <div className="col-span-full py-12 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
              <p className="font-bold text-sm">Collection Empty</p>
           </div>
        )}
        
        {items.map(notebook => (
          <div 
            key={notebook.id} 
            onClick={() => onSelectNotebook(notebook.id)}
            className="group relative aspect-[4/5] bg-white rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
          >
             {/* Dynamic background blob */}
             <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-start">
                    <span className="text-4xl filter drop-shadow-sm">{type === 'report' ? '📉' : '📓'}</span>
                    <button 
                       onClick={(e) => { e.stopPropagation(); onDeleteNotebook(notebook.id); }}
                       className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-slate-300 hover:text-red-500 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm transform scale-90 group-hover:scale-100"
                    >
                       ✕
                    </button>
                 </div>
             </div>

             <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {notebook.name}
                </h3>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500 uppercase tracking-wide">
                     {type === 'report' ? `${notebook.trends?.length || 0} Trends` : `${notebook.cases.length} Cases`}
                   </span>
                   <span className="text-[10px] font-bold text-slate-300">
                     {new Date(notebook.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pt-32 pb-20 px-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Library</h2>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all hover:rotate-90">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <Section 
        title="Case Notebooks" 
        type="notebook" 
        items={caseNotebooks} 
        icon="⚡️" 
        gradient="from-indigo-400 to-cyan-300"
      />

      <Section 
        title="Trend Reports" 
        type="report" 
        items={trendReports} 
        icon="🔮" 
        gradient="from-fuchsia-400 to-rose-300"
      />
    </div>
  );
};