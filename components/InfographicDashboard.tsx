
import React, { useMemo } from 'react';
import { NotebookData, TrendItem, CobrandingCase } from '../types';

interface InfographicDashboardProps {
  notebook: NotebookData;
  onClose: () => void;
}

export const InfographicDashboard: React.FC<InfographicDashboardProps> = ({ notebook, onClose }) => {
  
  // --- DATA PROCESSING ---

  // 1. Timeline Data (Cases)
  const timelineData = useMemo(() => {
    if (!notebook.cases.length) return [];
    
    const timeMap: Record<string, number> = {};
    notebook.cases.forEach(c => {
      // Extract Year-Month (e.g., 2024.05)
      const match = c.date.match(/(\d{4})[./-](\d{2})/);
      if (match) {
        const key = `${match[1]}-${match[2]}`; // 2024-05
        timeMap[key] = (timeMap[key] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(timeMap).sort();
    return sortedKeys.map(k => ({ date: k, count: timeMap[k] }));
  }, [notebook.cases]);

  // 2. Category Data (Trends)
  const categoryData = useMemo(() => {
    if (!notebook.trends || !notebook.trends.length) return [];
    const catMap: Record<string, number> = {};
    notebook.trends.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + 1;
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [notebook.trends]);

  // 3. Keyword Extraction (Partner Intro)
  const keywordData = useMemo(() => {
     if (!notebook.cases.length) return [];
     const text = notebook.cases.map(c => c.partnerIntro + " " + c.productName).join(" ").toLowerCase();
     const words = text.split(/\W+/).filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'brand', 'collab'].includes(w));
     const freq: Record<string, number> = {};
     words.forEach(w => freq[w] = (freq[w] || 0) + 1);
     return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [notebook.cases]);

  const hasCases = notebook.cases.length > 0;
  const hasTrends = notebook.trends && notebook.trends.length > 0;

  // --- CHART HELPERS ---
  const maxTimeCount = Math.max(...timelineData.map(d => d.count), 1);
  const maxCatCount = Math.max(...categoryData.map(d => d.value), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Main Dashboard Card */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
           <div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 block">可视化情报</span>
             <h2 className="text-3xl font-bold text-slate-900">{notebook.name} <span className="text-slate-400 font-normal">数据分析</span></h2>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
             ✕
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* --- METRIC: TOTAL SCOPE --- */}
            <div className="col-span-1 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex flex-col">
                  <span className="text-4xl font-bold text-indigo-600 mb-1">{notebook.cases.length}</span>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">入库案例</span>
               </div>
               <div className="p-6 rounded-3xl bg-fuchsia-50 border border-fuchsia-100 flex flex-col">
                  <span className="text-4xl font-bold text-fuchsia-600 mb-1">{notebook.trends?.length || 0}</span>
                  <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">趋势信号</span>
               </div>
               <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col">
                  <span className="text-4xl font-bold text-emerald-600 mb-1">{categoryData.length}</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">覆盖行业</span>
               </div>
               <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col">
                  <span className="text-4xl font-bold text-orange-600 mb-1">{timelineData.length}</span>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">活跃月份</span>
               </div>
            </div>

            {/* --- CHART 1: TIMELINE VELOCITY (Area Chart) --- */}
            {hasCases && (
              <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                 <div className="flex justify-between items-end mb-8 relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">联名频率趋势</h3>
                      <p className="text-sm text-slate-400 mt-1">时间维度发布分布</p>
                    </div>
                 </div>

                 {/* Custom CSS Area Chart */}
                 <div className="h-48 flex items-end gap-2 relative z-10 pt-4">
                    {timelineData.map((item, i) => {
                      const heightPct = (item.count / maxTimeCount) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center group/bar relative">
                           {/* Tooltip */}
                           <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-20 pointer-events-none">
                              {item.date}: {item.count} Cases
                           </div>
                           
                           {/* Bar */}
                           <div 
                             style={{ height: `${heightPct}%` }} 
                             className="w-full min-w-[20px] bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-lg opacity-80 group-hover/bar:opacity-100 transition-all duration-500 relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/bar:translate-y-0 transition-transform duration-300"></div>
                           </div>
                           
                           {/* X-Axis Label */}
                           <span className="text-[10px] text-slate-400 mt-2 -rotate-45 origin-left whitespace-nowrap">{item.date}</span>
                        </div>
                      );
                    })}
                    {timelineData.length === 0 && <div className="w-full text-center text-slate-300 text-sm">No timeline data available.</div>}
                 </div>
                 
                 {/* Decorative Grid Lines */}
                 <div className="absolute inset-0 z-0 flex flex-col justify-between px-8 py-20 pointer-events-none">
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="w-full h-px bg-slate-50"></div>
                 </div>
              </div>
            )}

            {/* --- CHART 2: TOP KEYWORDS (List) --- */}
            {hasCases && (
               <div className="col-span-1 bg-slate-900 text-white rounded-3xl p-8 shadow-lg flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-40"></div>
                  
                  <h3 className="text-xl font-bold mb-6 relative z-10">高频关键词</h3>
                  <div className="space-y-4 relative z-10">
                     {keywordData.map((k, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <span className="text-2xl font-bold text-slate-700 w-6">0{i+1}</span>
                           <div className="flex-1">
                              <div className="flex justify-between text-sm font-bold mb-1">
                                 <span className="capitalize text-indigo-200">{k[0]}</span>
                                 <span className="text-slate-500">{k[1]}x</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                 <div style={{ width: `${(k[1] / keywordData[0][1]) * 100}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full"></div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* --- CHART 3: TREND ECOSYSTEM (Bubbles) --- */}
            {hasTrends && (
              <div className="col-span-1 lg:col-span-3 bg-gradient-to-br from-fuchsia-50 to-indigo-50 rounded-3xl p-8 border border-white shadow-inner relative overflow-hidden min-h-[300px]">
                 <h3 className="text-xl font-bold text-slate-900 mb-8 relative z-10">趋势生态分布</h3>
                 
                 <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                    {categoryData.map((cat, i) => {
                       // Size based on value relative to max
                       const size = 60 + ((cat.value / maxCatCount) * 100); 
                       return (
                          <div 
                            key={i}
                            style={{ width: size, height: size }}
                            className="rounded-full bg-white/60 backdrop-blur-md border border-white shadow-lg flex flex-col items-center justify-center text-center p-2 hover:scale-110 transition-transform duration-300 cursor-default group"
                          >
                             <span className="text-2xl mb-1 group-hover:-translate-y-1 transition-transform">
                               {['⚡️','🎨','🎮','👗','🍔'][i % 5]}
                             </span>
                             <span className="text-xs font-bold text-slate-800 leading-none">{cat.name}</span>
                             <span className="text-[10px] font-bold text-slate-400 mt-1">{cat.value} items</span>
                          </div>
                       );
                    })}
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
