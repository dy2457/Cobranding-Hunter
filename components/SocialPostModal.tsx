
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { NotebookData } from '../types';

interface SocialPostModalProps {
  notebook: NotebookData;
  title: string;
  content: string;
  isLoading: boolean;
  onRegenerate: () => void;
  onClose: () => void;
}

// XHS standard is 3:4. (540x720)
const TIMELINE_ITEMS_PER_PAGE = 3;
const LIST_ITEMS_PER_PAGE = 2; 

export const SocialPostModal: React.FC<SocialPostModalProps> = ({ notebook, title, content, isLoading, onRegenerate, onClose }) => {
  const [layout, setLayout] = useState<'timeline' | 'list'>('timeline');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Body scroll lock effect
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [layout]);

  const itemsPerPage = layout === 'timeline' ? TIMELINE_ITEMS_PER_PAGE : LIST_ITEMS_PER_PAGE;
  const totalCases = notebook.cases.length;
  const totalPages = Math.ceil(totalCases / itemsPerPage);
  
  const currentCases = notebook.cases.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(captureRef.current, {
        scale: 3, 
        backgroundColor: '#ffffff', 
        useCORS: true,
        logging: false,
        width: 540,
        height: 720,
      });
      
      const link = document.createElement('a');
      link.download = `xhs_post_${notebook.name.replace(/\s+/g, '_')}_p${page}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("Capture failed:", err);
      alert("Oops! Could not generate image.");
    } finally {
      setIsCapturing(false);
    }
  };

  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setPage(p => Math.max(1, p - 1));

  const DataField = ({ label, value, isLink = false, fullWidth = false }: { label: string, value: string, isLink?: boolean, fullWidth?: boolean }) => (
    <div className={`mb-2 flex ${fullWidth ? 'flex-col' : 'flex-row items-baseline'}`}>
       <span className={`text-[9px] font-black text-slate-300 shrink-0 uppercase tracking-tighter ${fullWidth ? 'mb-0.5' : 'w-16'}`}>{label}</span>
       {isLink ? (
         <span className="text-[9px] text-[#b5004a] font-mono underline opacity-70 break-all leading-tight">{value}</span>
       ) : (
         <span className={`text-[11px] font-bold text-slate-800 leading-tight flex-1 ${fullWidth ? '' : 'truncate'}`}>{value}</span>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-200/60 backdrop-blur-md flex flex-col pt-32 pb-10 px-6 overflow-y-auto animate-fade-in font-sans custom-scrollbar">
      
      {/* --- VERTICAL STACKED POP-UP CARD --- */}
      <div className="bg-white rounded-[48px] shadow-[0_48px_160px_-24px_rgba(0,0,0,0.15)] w-full max-w-5xl mx-auto flex flex-col border border-white relative shrink-0 overflow-hidden mb-10">
        
        {/* Internal Header Area */}
        <header className="h-24 bg-white border-b border-slate-50 flex items-center justify-between px-10 shrink-0 z-20">
           <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#b5004a] tracking-widest uppercase">Content Lab</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">发布素材预览</h2>
              </div>
              <div className="h-10 w-px bg-slate-100 mx-2"></div>
              <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 border border-slate-100">
                 <button 
                  onClick={() => setLayout('timeline')} 
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${layout === 'timeline' ? 'bg-white text-[#b5004a] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    ⏱ 时间轴
                 </button>
                 <button 
                  onClick={() => setLayout('list')} 
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${layout === 'list' ? 'bg-white text-[#b5004a] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    🃏 列表
                 </button>
              </div>
           </div>

           {/* Pagination Center */}
           <div className="flex items-center gap-6">
              <button 
                onClick={prevPage} 
                disabled={page === 1} 
                className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-20 hover:border-[#b5004a] hover:text-[#b5004a] transition-all shadow-sm active:scale-95"
              >
                ←
              </button>
              <div className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black tracking-[0.3em] tabular-nums shadow-xl">
                  {page} / {totalPages}
              </div>
              <button 
                onClick={nextPage} 
                disabled={page === totalPages} 
                className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-20 hover:border-[#b5004a] hover:text-[#b5004a] transition-all shadow-sm active:scale-95"
              >
                →
              </button>
           </div>

           <button 
             onClick={onClose} 
             className="px-6 py-3 rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 flex items-center gap-2 transition-all border border-slate-100 text-xs font-bold active:scale-95"
           >
              关闭预览 ✕
           </button>
        </header>

        {/* --- BODY AREA (VERTICAL STACK) --- */}
        <div className="flex flex-col bg-[#FAFBFE]">
          
          {/* TOP SECTION: 3:4 Canvas Workspace */}
          <div className="w-full bg-[#FAFBFE] border-b border-slate-100 py-12 px-6 flex flex-col items-center justify-center relative">
              <div className="text-center mb-8">
                 <h3 className="text-lg font-bold text-slate-900 mb-1">封面与配图生成</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">3:4 Poster Canvas</p>
              </div>

              {/* --- THE 3:4 RATIO CANVAS (540x720) --- */}
              <div 
                ref={captureRef}
                className="bg-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col shrink-0 relative mb-8"
                style={{ width: '540px', height: '720px' }}
              >
                 {/* Background Aura */}
                 <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#b5004a]/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-[80px] pointer-events-none"></div>

                 {/* Canvas Top Bar */}
                 <div className="p-8 pb-5 border-b border-slate-50 flex justify-between items-end relative z-10 bg-white/80 backdrop-blur-sm">
                    <div className="max-w-[85%]">
                       <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 bg-[#b5004a] rounded-[7px] flex items-center justify-center p-1 shadow-sm">
                               <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M22 84 Q 32 84 38 76 L 34 86 Z" />
                                  <circle cx="26" cy="86" r="6" />
                                  <path d="M32 76 C 20 48, 30 25, 55 25 C 80 25, 95 45, 90 60 C 85 75, 65 65, 55 65 C 45 65, 40 75, 32 76 Z" />
                                  <circle cx="72" cy="48" r="5" />
                               </svg>
                          </div>
                          <span className="text-[9px] font-black text-slate-900 tracking-tight uppercase">IP 鲸选站 · Intelligence Report</span>
                       </div>
                       <h1 className="text-[22px] font-bold text-slate-900 leading-[1.2] tracking-tight">{notebook.name}</h1>
                    </div>
                    <div className="text-[9px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">P.{page}</div>
                 </div>

                 {/* Canvas Content Area */}
                 <div className="flex-1 px-8 pt-6 pb-4 relative z-10 overflow-hidden">
                    {layout === 'timeline' ? (
                      <div className="relative border-l-[1.5px] border-slate-100 ml-2 space-y-6">
                         {currentCases.map((c, i) => (
                            <div key={i} className="relative pl-7 animate-fade-in-up" style={{ animationDelay: `${i * 120}ms` }}>
                               <div className="absolute -left-[6px] top-4 w-3 h-3 rounded-full border-[2.5px] border-white bg-[#b5004a] shadow-sm z-10"></div>
                               <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100/50">
                                  <h3 className="text-sm font-bold text-slate-900 mb-3 truncate">{c.projectName}</h3>
                                  <div className="space-y-0.5">
                                    <DataField label="时间：" value={c.date} />
                                    <DataField label="合作：" value={`${c.brandName} x ${c.partnerIntro}`} />
                                    <div className="bg-white/90 p-3 rounded-xl border border-slate-100/50 mt-2 shadow-sm">
                                       <p className="text-[10px] font-bold text-slate-500 leading-relaxed line-clamp-3 italic opacity-80">{c.insight}</p>
                                    </div>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                    ) : (
                      <div className="space-y-5">
                         {currentCases.map((c, i) => (
                            <div key={i} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden ring-1 ring-slate-900/5 h-[285px] animate-fade-in-up" style={{ animationDelay: `${i * 120}ms` }}>
                               <div className="mb-4">
                                  <span className="text-[8px] font-black text-[#b5004a] uppercase tracking-widest block mb-1">Intelligence Report</span>
                                  <h3 className="text-xl font-bold text-slate-900 leading-tight truncate">{c.projectName}</h3>
                                </div>
                               <div className="space-y-0.5 bg-slate-50/60 rounded-2xl p-4 border border-slate-100/30 mb-4">
                                 <DataField label="时间：" value={c.date} />
                                 <DataField label="合作：" value={`${c.brandName} x ${c.partnerIntro}`} />
                               </div>
                               <div className="px-1">
                                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed line-clamp-3">{c.insight}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {/* Canvas Bottom Bar */}
                 <div className="px-8 py-6 bg-slate-50/40 border-t border-slate-50 flex justify-between items-center relative z-10">
                    <div className="flex gap-2.5">
                       {[...Array(totalPages)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-400 ${i + 1 === page ? 'bg-[#b5004a] scale-150' : 'bg-slate-200'}`}></div>
                       ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-slate-300 tracking-[0.2em] uppercase">Co-Brand Hunter Report</span>
                      <div className="w-4 h-px bg-slate-200"></div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()}</span>
                    </div>
                 </div>
              </div>

              {/* Float Save Button below Canvas */}
              <button 
                onClick={handleDownload}
                disabled={isCapturing}
                className="px-16 py-6 bg-slate-900 hover:bg-black text-white rounded-[28px] font-bold shadow-2xl hover:-translate-y-2 transition-all flex items-center gap-5 active:scale-95 border border-white/10 ring-8 ring-white/20"
              >
                {isCapturing ? <span className="animate-spin text-2xl">⏳</span> : <span className="text-2xl">📸</span>}
                <div className="flex flex-col items-start text-left">
                  <span className="text-base tracking-tight leading-none mb-0.5">保存当前配图</span>
                  <span className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Capture 3:4 Image</span>
                </div>
              </button>
          </div>

          {/* BOTTOM SECTION: Copywriting Sidebar (Now Full Width below) */}
          <div className="w-full bg-white flex flex-col border-t border-slate-100 shadow-[0_-20px_80px_-24px_rgba(0,0,0,0.06)] relative z-10">
            <div className="p-10 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <span className="text-3xl">✍️</span>
                 <div className="flex flex-col">
                   <h3 className="font-bold text-slate-900 tracking-tight text-xl">小红书文案建议</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Caption Intelligence</span>
                 </div>
               </div>
               
               <button 
                 onClick={onRegenerate}
                 disabled={isLoading}
                 className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:border-[#b5004a] hover:text-[#b5004a] transition-all shadow-sm active:scale-95 disabled:opacity-50"
               >
                 <span className={`${isLoading ? 'animate-spin' : ''}`}>🔄</span>
                 重新生成文案
               </button>
            </div>

            <div className="p-10 bg-white">
               {isLoading ? (
                 <div className="max-w-4xl mx-auto space-y-10 animate-pulse">
                    <div className="space-y-3">
                      <div className="h-3 bg-slate-100 rounded-full w-24"></div>
                      <div className="h-14 bg-slate-50 rounded-2xl w-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 bg-slate-100 rounded-full w-24"></div>
                      <div className="h-64 bg-slate-50 rounded-[48px] w-full"></div>
                    </div>
                 </div>
               ) : (
                 <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4 block">爆款标题建议</label>
                      <div className="text-2xl font-bold text-slate-900 border-l-[6px] border-[#b5004a] pl-6 py-5 bg-slate-50/50 rounded-r-[32px] leading-tight shadow-sm">
                        {title}
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4 block">正文内容</label>
                      <div className="whitespace-pre-wrap text-[15px] text-slate-600 font-medium leading-relaxed bg-white p-10 rounded-[48px] border border-slate-100 shadow-inner min-h-[400px]">
                        {content}
                      </div>
                   </div>
                 </div>
               )}
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/20 flex justify-center">
               <button 
                 onClick={handleCopy} 
                 disabled={isLoading}
                 className={`w-full max-w-2xl py-6 rounded-[28px] font-bold shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 text-lg ${copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-[#b5004a] hover:bg-[#91003a] text-white shadow-pink-100'}`}
               >
                 {copied ? (
                   <>
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                     <span>文案已复制到剪贴板</span>
                   </>
                 ) : (
                   <>
                     <span>复制全文文案</span>
                     <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                   </>
                 )}
               </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* Bottom Spacer for Modal Scrolling */}
      <div className="h-20 shrink-0"></div>
    </div>
  );
};
