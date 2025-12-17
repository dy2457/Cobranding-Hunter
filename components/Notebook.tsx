
import React, { useState, useEffect } from 'react';
import { CobrandingCase, formatCaseToPlainText, formatCaseToMarkdown, NotebookData, generateNotebookMarkdown, generateNotebookHtml, generateNotebookMindmap } from '../types';
import { InfographicDashboard } from './InfographicDashboard';
import { SocialPostModal } from './SocialPostModal';
import { generateSocialPostText, generateSocialPostImage } from '../services/geminiService';

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
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Social Post State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialData, setSocialData] = useState({ title: '', content: '', imageUrl: '' });

  useEffect(() => {
    setEditedName(notebook.name);
  }, [notebook.name]);

  const handleCopy = (c: CobrandingCase, idx: number) => {
    // Use formatCaseToPlainText for clean copy without Markdown tags
    const text = formatCaseToPlainText(c);
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

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => downloadFile(`${notebook.name}.md`, generateNotebookMarkdown(notebook), 'text/markdown');
  const handleExportWord = () => downloadFile(`${notebook.name}.doc`, generateNotebookHtml(notebook), 'application/msword');
  const handleExportMindmap = () => downloadFile(`${notebook.name}_mindmap.txt`, generateNotebookMindmap(notebook), 'text/plain');
  const handleExportPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const handleGenerateSocialPost = async () => {
    setShowExportMenu(false);
    setShowSocialModal(true);
    setSocialLoading(true);
    
    try {
       // 1. Prepare Content Summary
       const mdContent = generateNotebookMarkdown(notebook);
       
       // 2. Parallel Generation (Text & Image)
       const textPromise = generateSocialPostText(mdContent);
       const imagePromise = generateSocialPostImage(notebook.name + " " + (notebook.cases[0]?.insight || "Co-branding Analysis"));

       const [textResult, imageResult] = await Promise.all([textPromise, imagePromise]);

       setSocialData({
         title: textResult.title,
         content: textResult.content,
         imageUrl: imageResult
       });

    } catch (e) {
      console.error("Social Gen Error", e);
      setSocialData(prev => ({ ...prev, title: "Error", content: "Failed to generate content. Please try again." }));
    } finally {
      setSocialLoading(false);
    }
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
      <div className="max-w-4xl mx-auto mt-8 text-center py-24 bg-white/50 backdrop-blur-md rounded-[40px] border border-dashed border-slate-300 animate-fade-in">
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
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up print:pt-0 print:max-w-full">
      <style>{`
        @media print {
          header, footer, button, .no-print { display: none !important; }
          .print-full { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          body { background: white !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>

      {showAnalytics && <InfographicDashboard notebook={notebook} onClose={() => setShowAnalytics(false)} />}

      {showSocialModal && (
        <SocialPostModal 
          title={socialData.title}
          content={socialData.content}
          imageUrl={socialData.imageUrl}
          isLoading={socialLoading}
          onClose={() => setShowSocialModal(false)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sticky top-24 z-30 bg-white/80 backdrop-blur-xl py-4 rounded-[20px] px-6 border border-white/50 shadow-sm transition-all no-print">
        <div className="flex items-center gap-6">
           <BackButton />
           <div className="flex-1">
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
                   <h2 className="text-2xl font-bold text-slate-900 line-clamp-1">{notebook.name}</h2>
                   <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
              )}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                 {isReport ? 'Trend Report' : 'Case Collection'} • {isReport ? notebook.trends?.length || 0 : notebook.cases.length} Items
              </p>
           </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0 relative">
           <button 
             onClick={() => setShowAnalytics(true)}
             className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             Analytics
           </button>
           
           <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Export
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                   <div className="p-1">
                      {/* Social Post Button */}
                      <button onClick={handleGenerateSocialPost} className="w-full text-left px-4 py-3 text-sm font-bold text-[#b5004a] hover:bg-pink-50 rounded-lg flex items-center gap-3 border-b border-slate-100">
                        <span className="text-lg">📕</span> Xiaohongshu Post
                      </button>
                      
                      <button onClick={handleExportMarkdown} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                        <span className="text-lg">📝</span> Markdown
                      </button>
                      <button onClick={handleExportWord} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                        <span className="text-lg">📄</span> Word Doc
                      </button>
                      <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                        <span className="text-lg">🖨</span> PDF / Print
                      </button>
                       <button onClick={handleExportMindmap} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3">
                        <span className="text-lg">🧠</span> Mindmap (.txt)
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {isReport && notebook.trends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {notebook.trends.map((item, index) => (
             <div key={index} className="bg-white/80 backdrop-blur-sm rounded-[24px] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all relative group break-inside-avoid">
                <button 
                  onClick={() => onDeleteTrend && onDeleteTrend(index)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all no-print"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3 mb-4 pr-10">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{item.ipName}</h3>
                      <div className="flex gap-2 mt-1">
                         <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{item.category}</span>
                         {item.momentum && (
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.momentum === 'Peaking' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.momentum}</span>
                         )}
                      </div>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{item.reason}</p>
                
                {item.buzzwords && item.buzzwords.length > 0 && (
                   <div className="mb-4 flex flex-wrap gap-2">
                      {item.buzzwords.map((bw, i) => (
                         <span key={i} className="text-[10px] font-bold border border-slate-200 rounded-full px-2 py-1 text-slate-500">#{bw}</span>
                      ))}
                   </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
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

      {!isReport && (
        <div className="grid grid-cols-1 gap-8">
          {notebook.cases.map((c, index) => {
             const googleImgLink = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(c.projectName + ' ' + c.brandName + ' ' + c.partnerIntro + ' official')}`;
             
             return (
            <div key={index} className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group relative overflow-hidden break-inside-avoid">
              
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300 no-print z-20">
                  <button 
                    onClick={() => handleCopy(c, index)}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={() => onDeleteCase(index)}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
              </div>

              <div className="mt-2 pr-12">
                  <div className="mb-4">
                      <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{c.projectName}</h3>
                      {c.campaignSlogan && c.campaignSlogan !== 'N/A' && (
                        <p className="text-lg font-bold text-indigo-600 italic font-serif">“{c.campaignSlogan}”</p>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">项目时间</span>
                        <span className="text-base font-bold text-slate-800">{c.date}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">发起品牌</span>
                        <span className="text-base font-bold text-slate-800">{c.brandName}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">合作品牌</span>
                        <span className="text-base font-bold text-slate-800">{c.partnerIntro}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">涉及产品</span>
                        <span className="text-base font-bold text-slate-800">{c.productName}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">视觉风格</span>
                        <span className="text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{c.visualStyle || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">成效/热度</span>
                        <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-block">{c.impactResult || 'N/A'}</span>
                      </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 案例洞察
                    </h4>
                    <p className="text-base text-slate-700 leading-relaxed font-medium bg-white border-l-4 border-indigo-400 pl-4 py-2">
                      {c.insight}
                    </p>
                  </div>

                  <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 联名权益
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

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
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
                      
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">| 信息来源: {c.platformSource}</span>
                      {c.sourceUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-indigo-500 hover:underline">
                          Link {i+1}
                        </a>
                      ))}
                  </div>
              </div>
            </div>
             );
          })}
        </div>
      )}
    </div>
  );
};
