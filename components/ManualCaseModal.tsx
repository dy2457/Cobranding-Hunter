
import React, { useState, useEffect } from 'react';
import { CobrandingCase, CobrandingRight } from '../types';
import { generateCaseFromKeyword, AutoCompleteResult } from '../services/geminiService';

interface ManualCaseModalProps {
  onSave: (c: CobrandingCase) => void;
  onClose: () => void;
}

const DEFAULT_CASE: CobrandingCase = {
  projectName: '',
  brandName: '',
  industry: '',
  date: '',
  productName: '',
  partnerIntro: '',
  campaignSlogan: '',
  impactResult: '',
  visualStyle: '',
  keyVisualUrl: '',
  rights: [{ title: '', description: '' }],
  insight: '',
  platformSource: 'Manual Entry',
  sourceUrls: []
};

export const ManualCaseModal: React.FC<ManualCaseModalProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState<CobrandingCase>(DEFAULT_CASE);
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState<AutoCompleteResult | null>(null);
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleAiAutoComplete = async () => {
    if (!keyword.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateCaseFromKeyword(keyword, formData);
      setReviewData(result);
      
      // Default selection logic
      const initialSelection: Record<string, boolean> = {};
      Object.keys(result.suggestedPatch).forEach(key => {
        const currentValue = (formData as any)[key];
        const hasCurrentValue = currentValue && (Array.isArray(currentValue) ? currentValue.length > 0 : currentValue.toString().trim() !== '');
        
        // Auto-select if current is empty and confidence is decent (assume decent if not provided)
        const confidence = result.confidence ? (result.confidence as any)[key] : 1.0;
        if (!hasCurrentValue && confidence > 0.4) {
          initialSelection[key] = true;
        } else {
          initialSelection[key] = false;
        }
      });
      setSelectedFields(initialSelection);
    } catch (e) {
      alert("AI 补全失败，请重试或手动输入。");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestions = () => {
    if (!reviewData) return;
    const newFormData = { ...formData };
    Object.keys(selectedFields).forEach(key => {
      if (selectedFields[key]) {
        (newFormData as any)[key] = (reviewData.suggestedPatch as any)[key];
      }
    });
    setFormData(newFormData);
    setReviewData(null);
  };

  const updateField = (field: keyof CobrandingCase, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRight = () => {
    setFormData(prev => ({ ...prev, rights: [...prev.rights, { title: '', description: '' }] }));
  };

  const updateRight = (index: number, field: keyof CobrandingRight, value: string) => {
    const newRights = [...formData.rights];
    newRights[index] = { ...newRights[index], [field]: value };
    setFormData(prev => ({ ...prev, rights: newRights }));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      
      {/* --- REVIEW MODAL (OVERLAY) --- */}
      {reviewData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-white/20 backdrop-blur-xl animate-scale-in">
          <div className="bg-white/90 rounded-[40px] shadow-2xl border border-white w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-bold text-slate-900">审核 AI 补全建议</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">请选择您想要应用的字段</p>
               </div>
               <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                     <input 
                       type="checkbox" 
                       checked={allowOverwrite} 
                       onChange={e => {
                         const val = e.target.checked;
                         setAllowOverwrite(val);
                         if (val) {
                           // If toggle on, select everything available
                           const all: Record<string, boolean> = {};
                           Object.keys(reviewData.suggestedPatch).forEach(k => all[k] = true);
                           setSelectedFields(all);
                         }
                       }}
                       className="w-4 h-4 rounded border-slate-300 text-[#b5004a] focus:ring-[#b5004a]" 
                     />
                     <span className="text-xs font-bold text-slate-600">允许覆盖已有内容</span>
                  </label>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-6">
               {reviewData.warnings && reviewData.warnings.length > 0 && (
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">AI 提示 / 警告</p>
                    {reviewData.warnings.map((w, i) => <p key={i} className="text-xs text-amber-900 font-medium">• {w}</p>)}
                 </div>
               )}

               <div className="space-y-4">
                  {Object.entries(reviewData.suggestedPatch).map(([key, value]) => {
                    const currentValue = (formData as any)[key];
                    const hasCurrent = currentValue && currentValue.toString().trim() !== '';
                    const confidence = (reviewData.confidence as any)?.[key] || 1.0;
                    
                    // Skip internal fields or keys with no patch
                    if (!value) return null;

                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all ${selectedFields[key] ? 'bg-[#b5004a]/5 border-[#b5004a]' : 'bg-white border-slate-100 opacity-60'}`}
                        onClick={() => setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }))}
                      >
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{key}</span>
                            <div className="flex items-center gap-2">
                               {confidence < 0.6 && <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">低置信度</span>}
                               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedFields[key] ? 'bg-[#b5004a] border-[#b5004a]' : 'border-slate-200'}`}>
                                  {selectedFields[key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                               </div>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <span className="text-[9px] font-bold text-slate-300 block mb-1">当前值</span>
                               <p className="text-xs text-slate-500 truncate">{hasCurrent ? (Array.isArray(currentValue) ? `[${currentValue.length} items]` : currentValue.toString()) : '(空)'}</p>
                            </div>
                            <div>
                               <span className="text-[9px] font-bold text-slate-400 block mb-1">AI 建议</span>
                               <p className="text-xs text-slate-900 font-bold">{Array.isArray(value) ? `[${value.length} items]` : value.toString()}</p>
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>

               {reviewData.sources && reviewData.sources.length > 0 && (
                 <div className="pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">参考来源</p>
                    <div className="flex flex-wrap gap-2">
                       {reviewData.sources.map((s, i) => (
                         <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#b5004a] bg-pink-50 px-3 py-1 rounded-full hover:bg-pink-100 transition-colors">
                            {s.title || 'Source'}
                         </a>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <footer className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
               <button onClick={() => setReviewData(null)} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600">取消</button>
               <button onClick={applySuggestions} className="px-10 py-3 bg-[#b5004a] text-white rounded-2xl font-bold shadow-lg shadow-pink-100 hover:-translate-y-0.5 transition-all">
                  确认应用选中字段
               </button>
            </footer>
          </div>
        </div>
      )}

      {/* --- MAIN FORM MODAL --- */}
      <div className="bg-white rounded-[48px] shadow-2xl border border-white w-full max-w-4xl flex flex-col h-full max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <header className="px-10 py-8 border-b border-slate-50 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
           <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">手动录入联名案例</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">录入精准数据或使用 AI 辅助补全</p>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="relative group w-full md:w-80">
                 <input 
                   type="text" 
                   value={keyword}
                   onChange={e => setKeyword(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleAiAutoComplete()}
                   placeholder="输入搜索关键词 (如: 原神 x KFC)"
                   className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs focus:ring-2 focus:ring-[#b5004a]/20 transition-all focus:bg-white"
                 />
                 <button 
                   onClick={handleAiAutoComplete}
                   disabled={isLoading || !keyword}
                   className="absolute right-2 top-2 bottom-2 px-4 bg-[#b5004a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#91003a] disabled:opacity-30 flex items-center gap-2 transition-all active:scale-95"
                 >
                    {isLoading ? <span className="animate-spin text-sm">⏳</span> : '✨ AI 智能补全'}
                 </button>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">✕</button>
           </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
           
           {/* Section 1: Basic Info */}
           <div>
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 border-l-4 border-slate-100 pl-4">基本信息 / Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">项目名称*</label>
                    <input value={formData.projectName} onChange={e => updateField('projectName', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">发起品牌*</label>
                    <input value={formData.brandName} onChange={e => updateField('brandName', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">行业类别</label>
                    <input value={formData.industry || ''} onChange={e => updateField('industry', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all" placeholder="如: 科技, 美妆..."/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">合作品牌*</label>
                    <input value={formData.partnerIntro} onChange={e => updateField('partnerIntro', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">项目时间*</label>
                    <input value={formData.date} onChange={e => updateField('date', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all" placeholder="YYYY.MM"/>
                 </div>
              </div>
           </div>

           {/* Section 2: Details */}
           <div>
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 border-l-4 border-slate-100 pl-4">细节与成效 / Details & Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">涉及产品*</label>
                    <input value={formData.productName} onChange={e => updateField('productName', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Slogan</label>
                    <input value={formData.campaignSlogan || ''} onChange={e => updateField('campaignSlogan', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">视觉风格</label>
                    <input value={formData.visualStyle || ''} onChange={e => updateField('visualStyle', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">成效/热度</label>
                    <input value={formData.impactResult || ''} onChange={e => updateField('impactResult', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">参考图 URL</label>
                    <input value={formData.keyVisualUrl || ''} onChange={e => updateField('keyVisualUrl', e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 focus:bg-white transition-all"/>
                 </div>
              </div>
           </div>

           {/* Section 3: Rights (Dynamic) */}
           <div>
              <div className="flex justify-between items-center mb-6 border-l-4 border-slate-100 pl-4">
                 <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">联名权益 / Rights</h3>
                 <button onClick={addRight} className="text-xs font-bold text-[#b5004a] bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100">+ 添加权益</button>
              </div>
              <div className="space-y-4">
                 {formData.rights.map((right, idx) => (
                   <div key={idx} className="flex gap-4 items-start bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group/right">
                      <div className="flex-1 space-y-4">
                         <input 
                           value={right.title} 
                           onChange={e => updateRight(idx, 'title', e.target.value)} 
                           placeholder="权益标题 (如: 限量礼盒)"
                           className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold border border-slate-100 focus:ring-1 focus:ring-[#b5004a]"
                         />
                         <textarea 
                           value={right.description} 
                           onChange={e => updateRight(idx, 'description', e.target.value)} 
                           placeholder="权益描述..."
                           className="w-full bg-white rounded-xl px-4 py-3 text-sm font-medium border border-slate-100 focus:ring-1 focus:ring-[#b5004a] min-h-[80px] resize-none"
                         />
                      </div>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, rights: prev.rights.filter((_, i) => i !== idx) }))}
                        className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover/right:opacity-100 transition-opacity"
                      >✕</button>
                   </div>
                 ))}
              </div>
           </div>

           {/* Section 4: Insight */}
           <div>
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 border-l-4 border-slate-100 pl-4">案例洞察 / Insight</h3>
              <textarea 
                value={formData.insight} 
                onChange={e => updateField('insight', e.target.value)} 
                className="w-full p-6 bg-slate-50 rounded-[32px] border border-slate-100 font-medium text-slate-800 focus:bg-white transition-all min-h-[160px] resize-none"
                placeholder="请录入对此联名案例的商业洞察或分析..."
              />
           </div>

        </div>

        {/* Modal Footer */}
        <footer className="px-10 py-8 border-t border-slate-50 bg-white flex justify-end gap-4 shrink-0">
           <button onClick={onClose} className="px-8 py-4 text-slate-400 font-bold text-sm">取消</button>
           <button 
             onClick={() => onSave(formData)} 
             disabled={!formData.projectName || !formData.brandName || !formData.date}
             className="px-16 py-4 bg-slate-900 text-white rounded-3xl font-bold shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:hover:translate-y-0"
           >
              确认入库
           </button>
        </footer>
      </div>
    </div>
  );
};
