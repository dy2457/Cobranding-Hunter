import React from 'react';
import { CobrandingCase, exportNotebookToMarkdown, formatCaseToMarkdown, NotebookData } from '../types';

interface NotebookProps {
  notebook: NotebookData;
  onDeleteCase: (index: number) => void;
  onBack: () => void;
  hasPendingReview?: boolean;
}

export const Notebook: React.FC<NotebookProps> = ({ notebook, onDeleteCase, onBack, hasPendingReview }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (c: CobrandingCase, idx: number) => {
    const text = formatCaseToMarkdown(c);
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    const text = exportNotebookToMarkdown(notebook);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.name.replace(/\s+/g, '_')}_Report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const BackButton = () => (
    <button onClick={onBack} className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors ${hasPendingReview ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'text-gray-600 hover:bg-gray-100 border-gray-200'}`}>
       {hasPendingReview ? (
         <>
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Return to Review
         </>
       ) : (
         <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to List
         </>
       )}
    </button>
  );

  if (notebook.cases.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
         <div className="text-6xl mb-4">📓</div>
         <h2 className="text-xl font-bold text-gray-900">This Notebook is Empty</h2>
         <p className="text-gray-500 mb-8">Start a new research to collect cases for "{notebook.name}".</p>
         <button onClick={onBack} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
            {hasPendingReview ? 'Return to Review' : 'Back to Notebooks'}
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-40">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{notebook.name}</h2>
          <p className="text-sm text-gray-500">{notebook.cases.length} cases collected</p>
        </div>
        <div className="flex gap-3">
           <BackButton />
           <button onClick={handleExport} className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold shadow hover:bg-gray-800 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Export Markdown
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {notebook.cases.map((data, index) => (
          <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 group relative">
            <button 
              onClick={() => onDeleteCase(index)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Delete Case"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                  Case #{index + 1}
                </span>
                <span className="text-xs text-gray-500 font-mono bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-1 rounded">
                  {data.date}
                </span>
            </div>

            <div className="space-y-6">
                {/* Title & Copy */}
                <div className="flex justify-between items-start pr-10">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{data.productName}</h3>
                    <button
                        onClick={() => handleCopy(data, index)}
                        className={`text-xs font-bold px-3 py-1 rounded border transition-colors ${copiedIndex === index ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-400 border-gray-200 hover:text-gray-900'}`}
                    >
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Project Overview */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-900 mb-2">Project Overview</p>
                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">{data.projectName}</p>
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                       <div className="min-w-fit px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">Partner</div>
                       <p className="text-gray-500 text-xs italic">{data.partnerIntro}</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <p className="font-semibold text-indigo-900 mb-4">Co-branding Rights</p>
                    <ul className="space-y-4">
                        {data.rights.map((right, idx) => (
                        <li key={idx} className="relative pl-4 border-l-2 border-indigo-200">
                            <h4 className="font-bold text-gray-900 text-xs mb-1">{right.title}</h4>
                            <p className="text-gray-600 text-xs leading-relaxed">{right.description}</p>
                        </li>
                        ))}
                    </ul>
                    </div>
                    
                    <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 flex flex-col">
                    <p className="font-semibold text-purple-900 mb-3">AI Insight</p>
                    <p className="text-purple-800 text-sm leading-relaxed">{data.insight}</p>
                    </div>
                </div>

                {/* Footer: Sources & Visuals */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                   <div className="flex-grow">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Verified Sources</h4>
                        <div className="flex flex-wrap gap-2">
                        {data.sourceUrls && data.sourceUrls.length > 0 ? data.sourceUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-500 rounded text-[10px] hover:bg-indigo-50 hover:text-indigo-600 transition-colors truncate max-w-[250px] inline-block">
                                {new URL(url).hostname.replace('www.', '')}
                            </a>
                        )) : (
                            <span className="text-gray-400 text-xs">No specific sources cited.</span>
                        )}
                        </div>
                   </div>

                   <div className="flex-shrink-0">
                       <a 
                          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(data.projectName + ' ' + data.productName)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm group/btn"
                        >
                          <svg className="w-5 h-5 text-indigo-400 group-hover/btn:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Find Key Visuals
                        </a>
                   </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};