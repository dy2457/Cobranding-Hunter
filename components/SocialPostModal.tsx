
import React, { useState } from 'react';

interface SocialPostModalProps {
  title: string;
  content: string;
  imageUrl: string;
  isLoading: boolean;
  onClose: () => void;
}

export const SocialPostModal: React.FC<SocialPostModalProps> = ({ title, content, imageUrl, isLoading, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `xhs_post_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Visual Preview (3:4 Ratio) */}
        <div className="w-full md:w-1/2 bg-slate-100 flex items-center justify-center p-8 relative overflow-hidden group">
           {isLoading ? (
             <div className="flex flex-col items-center">
               <div className="w-12 h-12 border-4 border-slate-300 border-t-[#b5004a] rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 font-medium text-sm animate-pulse">Generating Visuals (Nano Banana)...</p>
             </div>
           ) : imageUrl ? (
             <div className="relative shadow-2xl rounded-xl overflow-hidden aspect-[3/4] w-full max-w-sm border-[8px] border-white transform transition-transform duration-500 hover:scale-[1.02]">
                <img src={imageUrl} alt="Generated Social Card" className="w-full h-full object-cover" />
                
                {/* Logo Overlay (Simulated) */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-[#b5004a] flex items-center justify-center text-white font-bold text-xs">
                     IP
                   </div>
                </div>

                 {/* Download Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button 
                     onClick={handleDownload}
                     className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Download Image
                   </button>
                </div>
             </div>
           ) : (
             <div className="text-slate-400 italic">No image generated.</div>
           )}
        </div>

        {/* Right: Text Content */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#b5004a]/5">
             <div className="flex items-center gap-2">
                <span className="text-xl">📕</span>
                <h3 className="font-bold text-[#b5004a] tracking-wide">Xiaohongshu Generator</h3>
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             {isLoading ? (
               <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-32 bg-slate-50 rounded w-full mt-6"></div>
               </div>
             ) : (
               <>
                 <div className="mb-6">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Title</label>
                    <div className="text-xl font-bold text-slate-900 border-l-4 border-[#b5004a] pl-4 py-1">
                      {title}
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Caption</label>
                    <div className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                      {content}
                    </div>
                 </div>
               </>
             )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
               Close
             </button>
             <button 
               onClick={handleCopy} 
               disabled={isLoading}
               className="px-8 py-3 bg-[#b5004a] text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2"
             >
               {copied ? 'Copied!' : 'Copy Text'}
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};
