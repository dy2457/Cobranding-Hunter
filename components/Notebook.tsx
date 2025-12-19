
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CobrandingCase, 
  formatCaseToPlainText, 
  NotebookData, 
  generateNotebookMarkdown, 
  generateNotebookHtml, 
  generateNotebookMindmap 
} from '../types';
import { InfographicDashboard } from './InfographicDashboard';
import { SocialPostModal } from './SocialPostModal';
import { ManualCaseModal } from './ManualCaseModal';
import { generateSocialPostText } from '../services/geminiService';
import { useAppStore } from '../store/useAppStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NotebookProps {
  notebook: NotebookData;
  onUpdate: (id: string, updates: Partial<NotebookData>) => void;
  onReorderCases: (newCases: CobrandingCase[]) => void;
  onDeleteCase: (index: number) => void;
  onDeleteTrend?: (index: number) => void;
  onBack: () => void;
  hasPendingReview?: boolean;
}

// --- Impact Score Heuristic ---
const getImpactScore = (res?: string) => {
  if (!res || res === 'N/A') return 0;
  const s = res.toLowerCase();
  if (s.includes('爆款') || s.includes('high') || s.includes('高') || s.includes('s级')) return 3;
  if (s.includes('中') || s.includes('mid')) return 2;
  return 1;
};

// --- Lightbox Component ---
const Lightbox = ({ url, onClose }: { url: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4 md:p-12 cursor-zoom-out"
      onClick={onClose}
    >
      <button 
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
        onClick={onClose}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <img 
        src={url} 
        alt="Preview" 
        className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-zoom-in cursor-default" 
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// --- Sortable Item Component ---
const SortableCaseCard = ({ 
  c, 
  id, 
  index,
  onCopy, 
  onDelete, 
  onPreview,
  onUpdateImage,
  copiedIndex 
}: { 
  c: CobrandingCase; 
  id: string;
  index: number;
  onCopy: () => void; 
  onDelete: () => void; 
  onPreview: (url: string) => void;
  onUpdateImage: (url: string) => void;
  copiedIndex: string | null;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState(c.keyVisualUrl || '');

  const googleImgLink = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(c.projectName + ' ' + c.brandName + ' ' + c.partnerIntro + ' official')}`;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#b5004a]/20 transition-all duration-300 group relative overflow-hidden break-inside-avoid ${isDragging ? 'opacity-50 grayscale scale-[0.98]' : ''}`}
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#b5004a] to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-8 left-8 p-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity no-print"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-12a2 2 0 10.001 4.001A2 2 0 0013 2zm0 6a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" /></svg>
      </div>

      <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300 no-print z-20">
          <button 
            onClick={onCopy}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {copiedIndex === id ? '已复制' : '复制'}
          </button>
          <button 
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          >
            ✕
          </button>
      </div>

      <div className="mt-2 pr-4 pl-0 md:pl-10">
          <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                 {c.industry && <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{c.industry}</span>}
                 {c.visualStyle && <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">{c.visualStyle}</span>}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{c.projectName}</h3>
              {c.campaignSlogan && c.campaignSlogan !== 'N/A' && (
                <p className="text-lg font-bold text-[#b5004a] italic font-serif">“{c.campaignSlogan}”</p>
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
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">信息来源</span>
                <span className="text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 inline-block">{c.platformSource || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">成效/热度</span>
                <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-block">{c.impactResult || 'N/A'}</span>
              </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 案例洞察
              </h4>
              <p className="text-base text-slate-700 leading-relaxed font-medium bg-white border-l-4 border-[#b5004a] pl-4 py-2">
                {c.insight}
              </p>
            </div>
            
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 视觉参考
              </h4>
              <div 
                className={`relative aspect-[4/3] rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${c.keyVisualUrl ? 'cursor-zoom-in' : 'cursor-default'}`}
                onClick={() => c.keyVisualUrl && onPreview(c.keyVisualUrl)}
              >
                {c.keyVisualUrl ? (
                  <img src={c.keyVisualUrl} alt="Visual" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">暂无图片</span>
                  </div>
                )}
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingImage(!isEditingImage); }}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors backdrop-blur-sm no-print"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>

              {isEditingImage && (
                <div className="flex gap-2 animate-fade-in no-print">
                  <input 
                    type="text" 
                    value={newImageUrl} 
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="粘贴图片URL..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#b5004a]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdateImage(newImageUrl);
                        setIsEditingImage(false);
                      }
                    }}
                  />
                  <button 
                    onClick={() => { onUpdateImage(newImageUrl); setIsEditingImage(false); }}
                    className="px-3 py-1.5 bg-[#b5004a] text-white text-[10px] font-bold rounded-lg"
                  >
                    保存
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> 联名权益
            </h4>
            <ul className="space-y-2">
              {c.rights.map((r, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600">
                  <span className="font-bold text-[#b5004a] mr-2 min-w-[20px]">{i + 1}.</span>
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-[#b5004a] rounded-xl font-bold text-xs transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                搜索更多图源 (Google) ↗
              </a>
              
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">| 来源: {c.platformSource}</span>
              {c.sourceUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-[#b5004a] hover:underline">
                  Link {i+1}
                </a>
              ))}
          </div>
      </div>
    </div>
  );
};

export const Notebook: React.FC<NotebookProps> = ({ 
  notebook, 
  onUpdate, 
  onReorderCases,
  onDeleteCase, 
  onDeleteTrend, 
  onBack, 
  hasPendingReview 
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(notebook.name);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'impact'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // Social Post State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialData, setSocialData] = useState({ title: '', content: '' });

  const addManualCaseToStore = useAppStore(state => state.addManualCase);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setEditedName(notebook.name);
  }, [notebook.name]);

  // --- Dynamic Metadata Extraction ---
  const uniqueIndustries = useMemo(() => {
    const set = new Set(notebook.cases.map(c => c.industry).filter(Boolean));
    return Array.from(set) as string[];
  }, [notebook.cases]);

  const uniquePlatforms = useMemo(() => {
    const set = new Set(notebook.cases.map(c => c.platformSource).filter(Boolean));
    return Array.from(set) as string[];
  }, [notebook.cases]);

  // --- Processed Case List ---
  const processedCases = useMemo(() => {
    let list = notebook.cases.map((c, originalIndex) => ({ ...c, originalIndex }));

    // 1. Filtering
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.projectName.toLowerCase().includes(q) || 
        c.brandName.toLowerCase().includes(q) ||
        c.partnerIntro.toLowerCase().includes(q)
      );
    }
    if (selectedIndustries.length > 0) {
      list = list.filter(c => c.industry && selectedIndustries.includes(c.industry));
    }
    if (selectedPlatforms.length > 0) {
      list = list.filter(c => c.platformSource && selectedPlatforms.includes(c.platformSource));
    }

    // 2. Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') return b.originalIndex - a.originalIndex;
      if (sortBy === 'oldest') return a.originalIndex - b.originalIndex;
      if (sortBy === 'impact') return getImpactScore(b.impactResult) - getImpactScore(a.impactResult);
      return 0;
    });

    return list;
  }, [notebook.cases, sortBy, searchTerm, selectedIndustries, selectedPlatforms]);

  const handleCopy = (c: CobrandingCase, id: string) => {
    const text = formatCaseToPlainText(c);
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      // Find indexes in the source array
      const oldIndex = notebook.cases.findIndex((_, i) => `case-${i}` === active.id);
      const newIndex = notebook.cases.findIndex((_, i) => `case-${i}` === over?.id);
      const newCases = arrayMove(notebook.cases, oldIndex, newIndex);
      onReorderCases(newCases);
    }
  };

  const updateCaseImage = (originalIndex: number, url: string) => {
    const newCases = [...notebook.cases];
    newCases[originalIndex] = { ...newCases[originalIndex], keyVisualUrl: url };
    onReorderCases(newCases);
  };

  const saveName = () => {
    if (editedName.trim()) onUpdate(notebook.id, { name: editedName });
    else setEditedName(notebook.name);
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

  const handleGenerateSocialPost = async (forceRegenerate = false) => {
    setShowExportMenu(false);
    setShowSocialModal(true);
    if (!forceRegenerate && notebook.socialCopy) {
      setSocialData({ title: notebook.socialCopy.title, content: notebook.socialCopy.content });
      setSocialLoading(false);
      return;
    }
    setSocialLoading(true);
    try {
       const mdContent = generateNotebookMarkdown(notebook);
       const textResult = await generateSocialPostText(mdContent);
       const newCopy = { title: textResult.title, content: textResult.content, generatedAt: Date.now() };
       onUpdate(notebook.id, { socialCopy: newCopy });
       setSocialData({ title: textResult.title, content: textResult.content });
    } catch (e) {
      console.error("Social Gen Error", e);
      setSocialData({ title: "生成失败", content: "抱歉，由于网络或API限制，文案生成失败。请重试。" });
    } finally {
      setSocialLoading(false);
    }
  };

  const toggleFilter = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) setter(list.filter(x => x !== item));
    else setter([...list, item]);
  };

  const BackButton = () => (
    <button onClick={onBack} className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-colors ${hasPendingReview ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
       {hasPendingReview ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>返回审核</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>返回</>}
    </button>
  );

  const isEmpty = notebook.cases.length === 0 && (!notebook.trends || notebook.trends.length === 0);
  const isReport = notebook.type === 'report';

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto mt-8 text-center py-24 bg-white/50 backdrop-blur-md rounded-[40px] border border-dashed border-slate-300 animate-fade-in">
         <div className="text-6xl mb-6 opacity-30">📓</div>
         <h2 className="text-2xl font-bold text-slate-800 mb-2">灵感库为空</h2>
         <p className="text-slate-500 mb-8">快去发掘一些精彩的联名案例吧！</p>
         <div className="flex justify-center gap-4">
            <BackButton />
            {!isReport && <button onClick={() => setShowManualModal(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs">+ 手动录入案例</button>}
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up print:pt-0 print:max-w-full">
      <style>{`
        @media print {
          header, footer, button, .no-print, .control-bar { display: none !important; }
          .print-full { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          body { background: white !important; }
          .break-inside-avoid { page-break-inside: avoid; }
        }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.3s ease-out; }
      `}</style>

      {showAnalytics && <InfographicDashboard notebook={notebook} onClose={() => setShowAnalytics(false)} />}
      {previewUrl && <Lightbox url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      {showSocialModal && <SocialPostModal notebook={notebook} title={socialData.title} content={socialData.content} isLoading={socialLoading} onRegenerate={() => handleGenerateSocialPost(true)} onClose={() => setShowSocialModal(false)} />}
      {showManualModal && <ManualCaseModal onSave={(c) => { addManualCaseToStore(notebook.id, c); setShowManualModal(false); }} onClose={() => setShowManualModal(false)} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sticky top-24 z-30 bg-white/80 backdrop-blur-xl py-4 rounded-[20px] px-6 border border-white/50 shadow-sm transition-all no-print">
        <div className="flex items-center gap-6">
           <BackButton />
           <div className="flex-1">
              {isEditingName ? (
                <input autoFocus className="text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-[#b5004a] focus:outline-none w-full" value={editedName} onChange={e => setEditedName(e.target.value)} onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()} />
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                   <h2 className="text-2xl font-bold text-slate-900 line-clamp-1">{notebook.name}</h2>
                   <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
              )}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isReport ? '趋势报告' : '案例合集'} • {notebook.cases.length} Items</p>
           </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0 relative">
           {!isReport && <button onClick={() => setShowManualModal(true)} className="px-5 py-2.5 bg-white text-[#b5004a] border border-pink-100 rounded-xl font-bold text-xs hover:bg-pink-50 transition-all flex items-center gap-2">+ 录入案例</button>}
           <button onClick={() => setShowAnalytics(true)} className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>数据看板
           </button>
           
           <div className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">导出报告<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                   <div className="p-1">
                      <button onClick={() => handleGenerateSocialPost(false)} className="w-full text-left px-4 py-3 text-sm font-bold text-[#b5004a] hover:bg-pink-50 rounded-lg flex items-center gap-3 border-b border-slate-100"><span className="text-lg">📕</span> 小红书图文</button>
                      <button onClick={handleExportMarkdown} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3"><span className="text-lg">📝</span> Markdown</button>
                      <button onClick={handleExportWord} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3"><span className="text-lg">📄</span> Word文档</button>
                      <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3"><span className="text-lg">🖨</span> PDF / Print</button>
                      <button onClick={handleExportMindmap} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-3"><span className="text-lg">🧠</span> Mindmap (.txt)</button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* --- Control Bar & Filters --- */}
      {!isReport && (
        <div className="control-bar mb-8 space-y-4 no-print animate-fade-in">
           <div className="flex flex-col md:flex-row gap-4 items-center bg-white/40 p-4 rounded-3xl border border-white/60 backdrop-blur-md shadow-sm">
              <div className="relative flex-1 w-full">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                 <input 
                   type="text" 
                   value={searchTerm} 
                   onChange={e => setSearchTerm(e.target.value)} 
                   placeholder="搜寻案例或品牌..." 
                   className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#b5004a]/10"
                 />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">排序:</span>
                 <select 
                   value={sortBy} 
                   onChange={e => setSortBy(e.target.value as any)}
                   className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b5004a]/10 cursor-pointer"
                 >
                    <option value="newest">最新优先</option>
                    <option value="oldest">最早优先</option>
                    <option value="impact">成效/热度 (高至低)</option>
                 </select>
              </div>
           </div>

           {/* Filter Tags */}
           <div className="flex flex-col gap-3">
              {uniqueIndustries.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 shrink-0">行业</span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueIndustries.map(ind => (
                      <button 
                        key={ind} 
                        onClick={() => toggleFilter(selectedIndustries, ind, setSelectedIndustries)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${selectedIndustries.includes(ind) ? 'bg-[#b5004a] text-white border-[#b5004a] shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {uniquePlatforms.length > 0 && (
                <div className="flex items-start gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 shrink-0">平台</span>
                  <div className="flex flex-wrap gap-2">
                    {uniquePlatforms.map(plt => (
                      <button 
                        key={plt} 
                        onClick={() => toggleFilter(selectedPlatforms, plt, setSelectedPlatforms)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${selectedPlatforms.includes(plt) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                      >
                        {plt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(selectedIndustries.length > 0 || selectedPlatforms.length > 0 || searchTerm) && (
                <button onClick={() => { setSelectedIndustries([]); setSelectedPlatforms([]); setSearchTerm(''); }} className="text-[10px] font-bold text-[#b5004a] hover:underline w-fit">清除所有筛选</button>
              )}
           </div>
        </div>
      )}

      {isReport && notebook.trends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {notebook.trends.map((item, index) => (
             <div key={index} className="bg-white/80 backdrop-blur-sm rounded-[24px] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all relative group break-inside-avoid">
                <button onClick={() => onDeleteTrend && onDeleteTrend(index)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all no-print">✕</button>
                <div className="flex items-center gap-3 mb-4 pr-10">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{item.ipName}</h3>
                      <div className="flex gap-2 mt-1">
                         <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{item.category}</span>
                         {item.momentum && <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.momentum === 'Peaking' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.momentum}</span>}
                      </div>
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{item.reason}</p>
                {item.buzzwords && item.buzzwords.length > 0 && (
                   <div className="mb-4 flex flex-wrap gap-2">
                      {item.buzzwords.map((bw, i) => <span key={i} className="text-[10px] font-bold border border-slate-200 rounded-full px-2 py-1 text-slate-500">#{bw}</span>)}
                   </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                    <div><span className="font-bold text-slate-400 block mb-1">受众群体</span><span className="font-medium text-slate-800">{item.targetAudience}</span></div>
                    <div><span className="font-bold text-slate-400 block mb-1">兼容性</span><span className="font-medium text-slate-800">{item.compatibility}</span></div>
                </div>
             </div>
           ))}
        </div>
      )}

      {!isReport && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {processedCases.length === 0 ? (
             <div className="text-center py-20 bg-white/30 rounded-[32px] border border-dashed border-slate-200">
                <span className="text-4xl block mb-4">🕵️‍♂️</span>
                <p className="text-slate-400 font-bold">没有符合筛选条件的案例</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              <SortableContext items={processedCases.map(c => `case-${c.originalIndex}`)} strategy={verticalListSortingStrategy}>
                {processedCases.map((c) => (
                  <SortableCaseCard 
                    key={`case-${c.originalIndex}`}
                    id={`case-${c.originalIndex}`}
                    c={c}
                    index={c.originalIndex}
                    onCopy={() => handleCopy(c, `case-${c.originalIndex}`)}
                    onDelete={() => onDeleteCase(c.originalIndex)}
                    onPreview={setPreviewUrl}
                    onUpdateImage={(url) => updateCaseImage(c.originalIndex, url)}
                    copiedIndex={copiedIndex}
                  />
                ))}
              </SortableContext>
            </div>
          )}
        </DndContext>
      )}
    </div>
  );
};
