
import React, { useState, useEffect } from 'react';

interface PromptInspectorProps {
  initialPrompt: string;
  title: string;
  onConfirm: (prompt: string) => void;
  onCancel: () => void;
}

export const PromptInspector: React.FC<PromptInspectorProps> = ({ initialPrompt, title, onConfirm, onCancel }) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl rounded-[24px] shadow-2xl border border-slate-700 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
           <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <h3 className="text-slate-200 font-mono text-sm ml-4 font-bold uppercase tracking-wider">
                <span className="text-indigo-400">root@gemini:</span>~/prompts/{title}
              </h3>
           </div>
           <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
              ✕
           </button>
        </div>

        {/* Warning / Info */}
        <div className="bg-indigo-900/20 px-6 py-3 border-b border-indigo-900/30 flex items-start gap-3">
           <span className="text-indigo-400 mt-0.5">ℹ️</span>
           <p className="text-xs text-indigo-200 font-mono leading-relaxed">
             <strong>Transparent AI Mode:</strong> This is the raw instruction set that will be sent to the Gemini model. 
             You can edit the prompt below to refine the output, but be careful not to break the JSON structure requirements.
           </p>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-slate-900">
           <textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             className="w-full h-full bg-transparent text-slate-300 font-mono text-sm p-6 resize-none focus:outline-none focus:bg-slate-800/30 transition-colors custom-scrollbar"
             spellCheck={false}
           />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-4">
           <button 
             onClick={onCancel}
             className="px-6 py-2.5 rounded-xl font-mono text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
           >
             CANCEL
           </button>
           <button 
             onClick={() => onConfirm(prompt)}
             className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-sm font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-600/20 transition-all flex items-center gap-2"
           >
             <span>EXECUTE_PROMPT()</span>
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </button>
        </div>
      </div>
    </div>
  );
};
