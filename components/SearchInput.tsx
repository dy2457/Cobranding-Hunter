import React, { useState, useEffect } from 'react';
import { AppState, ResearchConfig, TrendConfig, MatchConfig } from '../types';
import { generateSmartIPList, generateSmartBrandList, generateSmartTrendTopics } from '../services/geminiService';

interface SearchInputProps {
  onStartResearch: (config: ResearchConfig) => void;
  onStartTrendAnalysis: (config: TrendConfig) => void;
  onStartIPScout: (ipName: string) => void;
  onStartMatchmaking: (config: MatchConfig) => void;
  appState: AppState;
}

const BRAND_CATEGORIES = [
  { id: 'tech', label: 'Tech', icon: '💻', gradient: 'from-blue-400 to-cyan-300', brands: ['Insta360', 'DJI', 'Apple', 'Samsung', 'Nothing', 'Sony'] },
  { id: 'fashion', label: 'Fashion', icon: '👟', gradient: 'from-fuchsia-500 to-pink-500', brands: ['Nike', 'Adidas', 'Lululemon', 'Gentle Monster', 'Supreme'] },
  { id: 'food', label: 'F&B', icon: '🍔', gradient: 'from-orange-400 to-amber-300', brands: ['Starbucks', 'McDonald\'s', 'KFC', 'Heytea', 'Manner'] },
  { id: 'beauty', label: 'Beauty', icon: '💄', gradient: 'from-rose-400 to-red-300', brands: ['L\'Oreal', 'Fenty', 'Aesop', 'Florasis', 'Jo Malone'] },
  { id: 'auto', label: 'Auto', icon: '🚗', gradient: 'from-emerald-400 to-teal-300', brands: ['Tesla', 'BYD', 'Porsche', 'NIO', 'Xiaomi Auto'] }
];

const IP_CATEGORIES = [
  { id: 'anime', label: 'Anime', icon: '🎌', gradient: 'from-violet-500 to-purple-500', brands: ['One Piece', 'Naruto', 'Evangelion', 'Chiikawa', 'Pokemon'] },
  { id: 'games', label: 'Gaming', icon: '🎮', gradient: 'from-indigo-500 to-blue-500', brands: ['Genshin', 'LoL', 'Mario', 'Zelda', 'Elden Ring'] },
  { id: 'art', label: 'Art', icon: '🎨', gradient: 'from-yellow-400 to-orange-500', brands: ['Van Gogh', 'Louvre', 'KAWS', 'TeamLab', 'MOMA'] },
  { id: 'stars', label: 'KOL', icon: '🌟', gradient: 'from-pink-500 to-rose-500', brands: ['BTS', 'Blackpink', 'Travis Scott', 'Faker', 'Taylor Swift'] }
];

const DEFAULT_PLATFORMS = [
  "Google Search", "Official Sites", "Tech News", "Instagram/X", "Reddit", "Xiaohongshu"
];

const TREND_PRESETS = [
  { title: "🔥 2025 Top 10 IPs", query: "Top 10 most valuable and trending IPs for co-branding in 2025" },
  { title: "👾 Gen Z Favorites", query: "Most popular brands, games, and anime among Gen Z in 2024-2025" },
  { title: "💻 Tech x Lifestyle", query: "Best lifestyle and art IPs suitable for consumer electronics co-branding" },
  { title: "🇨🇳 China Trends", query: "Hottest trending IPs (Guochao, Anime) on Xiaohongshu right now" }
];

type SearchMode = 'BRAND' | 'TREND' | 'SCOUT' | 'MATCH';
type ResearchType = 'BRAND_TARGET' | 'IP_TARGET';

export const SearchInput: React.FC<SearchInputProps> = ({ onStartResearch, onStartTrendAnalysis, onStartIPScout, onStartMatchmaking, appState }) => {
  const [mode, setMode] = useState<SearchMode>('BRAND');
  
  // Case Research State
  const [researchType, setResearchType] = useState<ResearchType>('BRAND_TARGET');
  const [brandName, setBrandName] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>(DEFAULT_PLATFORMS);
  const [activeCategory, setActiveCategory] = useState(BRAND_CATEGORIES[0].id);

  // Trend Research State
  const [isTrendPlanning, setIsTrendPlanning] = useState(false);
  const [trendTopic, setTrendTopic] = useState('');
  const [trendTimeScale, setTrendTimeScale] = useState('Last 1 Year');
  const [trendLimit, setTrendLimit] = useState(10);
  const [trendKeywords, setTrendKeywords] = useState<string[]>([]);
  
  // Scout State
  const [scoutIPName, setScoutIPName] = useState('');

  // Matchmaker State
  const [matchBrand, setMatchBrand] = useState('');
  const [matchIndustry, setMatchIndustry] = useState('');
  const [matchGoal, setMatchGoal] = useState('');
  const [matchAudience, setMatchAudience] = useState('');

  // Helper State
  const [helperQuery, setHelperQuery] = useState('');
  const [helperResults, setHelperResults] = useState<string[]>([]);
  const [isHelperLoading, setIsHelperLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Temporary Inputs
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    setHelperResults([]);
    if (researchType === 'BRAND_TARGET') setActiveCategory(BRAND_CATEGORIES[0].id);
    else setActiveCategory(IP_CATEGORIES[0].id);
  }, [researchType]);

  useEffect(() => {
    if (brandName) {
      setKeywords([`${brandName} cobranding`, `${brandName} collaboration`, `${brandName} 联名`, `${brandName} limited`]);
    }
  }, [brandName]);
  
  // Reset helper when mode changes
  useEffect(() => {
    setShowHelper(false);
    setHelperResults([]);
    setHelperQuery('');
  }, [mode]);

  const activeCategories = researchType === 'BRAND_TARGET' ? BRAND_CATEGORIES : IP_CATEGORIES;

  // Handlers
  const handleSmartHelperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperQuery.trim()) return;
    setIsHelperLoading(true);
    setHelperResults([]);
    try {
      let results = [];
      if (mode === 'TREND') {
         results = await generateSmartTrendTopics(helperQuery);
      } else {
         results = researchType === 'IP_TARGET' ? await generateSmartIPList(helperQuery) : await generateSmartBrandList(helperQuery);
      }
      setHelperResults(results);
    } catch (e) { console.error(e); } finally { setIsHelperLoading(false); }
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const val = newKeyword.trim();
    if (isPlanning) {
       if (!keywords.includes(val)) setKeywords([...keywords, val]);
    } else {
       if (!trendKeywords.includes(val)) setTrendKeywords([...trendKeywords, val]);
    }
    setNewKeyword('');
  };

  const removeKeyword = (val: string) => {
    if (isPlanning) {
      setKeywords(keywords.filter(k => k !== val));
    } else {
      setTrendKeywords(trendKeywords.filter(k => k !== val));
    }
  };

  const executeResearch = () => { onStartResearch({ brandName, keywords, platforms }); setIsPlanning(false); };
  
  const executeTrendSearch = () => { 
    onStartTrendAnalysis({ 
        topic: trendTopic, 
        timeScale: trendTimeScale, 
        limit: trendLimit, 
        keywords: trendKeywords, 
        platforms 
    }); 
    setIsTrendPlanning(false); 
  };

  const executeScout = () => {
    if (scoutIPName) onStartIPScout(scoutIPName);
  };

  const executeMatch = () => {
    if (matchBrand && matchIndustry && matchGoal) {
      onStartMatchmaking({
        brandName: matchBrand,
        industry: matchIndustry,
        campaignGoal: matchGoal,
        targetAudience: matchAudience
      });
    }
  };
  
  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const initTrendPlanning = (topic: string) => {
    setTrendTopic(topic);
    setIsTrendPlanning(true);
  };

  // --- CONFIG CARD VIEW ---
  if (isPlanning || isTrendPlanning) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-8 relative animate-fade-in-up">
        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 p-8 relative z-10 overflow-hidden">
             
             {/* Decorative Background Blob inside card */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-fuchsia-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-500 uppercase block mb-2">Configuration</span>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight line-clamp-2">
                    {isPlanning ? `Target: ${brandName}` : `Topic: ${trendTopic}`}
                </h2>
              </div>
              <button 
                onClick={() => { setIsPlanning(false); setIsTrendPlanning(false); }} 
                className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-8 relative z-10">
              
              {/* Trend Specific: Time & Limit */}
              {isTrendPlanning && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Time Horizon</label>
                        <div className="relative">
                            <select value={trendTimeScale} onChange={e => setTrendTimeScale(e.target.value)} className="w-full bg-transparent font-bold text-slate-700 text-lg appearance-none focus:outline-none cursor-pointer">
                                <option>Last 3 Months</option>
                                <option>Last 6 Months</option>
                                <option>Last 1 Year</option>
                                <option>2024-2025</option>
                                <option>All Time</option>
                            </select>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Discovery Limit: <span className="text-indigo-600 ml-1">{trendLimit}</span></label>
                        <input type="range" min="3" max="20" step="1" value={trendLimit} onChange={e => setTrendLimit(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"/>
                    </div>
                </div>
              )}

              {/* Keywords Section */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">
                  {isPlanning ? 'Strategy Keywords' : 'Context Tags'}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(isPlanning ? keywords : trendKeywords).map(k => (
                    <span key={k} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white border border-indigo-100 text-indigo-600 shadow-sm animate-fade-in group hover:border-indigo-300 select-none">
                      {k}
                      <button onClick={() => removeKeyword(k)} className="ml-2 text-indigo-300 group-hover:text-red-500 transition-colors">✕</button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddKeyword} className="relative group">
                  <input 
                    type="text" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder={isPlanning ? "Add keyword (e.g. 'Limited Edition')" : "Add context (e.g. 'Gen Z', 'Sustainable')"}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 transition-all focus:bg-white"
                  />
                  <button type="submit" disabled={!newKeyword} className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-black disabled:opacity-0 transition-all transform scale-95 hover:scale-100">
                    ADD +
                  </button>
                </form>
              </div>

              {/* Platforms Section */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Intelligence Sources</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_PLATFORMS.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${platforms.includes(p) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-inner' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}>
                      {p}
                    </button>
                  ))}
                  <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="+ URL..." 
                        className="px-4 py-2 rounded-xl text-sm border border-dashed border-slate-300 bg-transparent focus:outline-none focus:border-indigo-500 focus:bg-white w-32 transition-all font-medium text-slate-700 focus:w-48 placeholder-slate-400"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') {
                              setPlatforms([...platforms, e.currentTarget.value]);
                              e.currentTarget.value = '';
                            }
                        }}
                      />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                <button onClick={() => { setIsPlanning(false); setIsTrendPlanning(false); }} className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                    Back
                </button>
                <button 
                  onClick={isPlanning ? executeResearch : executeTrendSearch}
                  className="px-10 py-4 bg-gradient-to-r from-slate-900 to-black text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg flex items-center gap-3 active:scale-95"
                >
                  <span>{isPlanning ? 'Start Hunt' : 'Analyze'}</span>
                  <span className="text-xl animate-pulse">⚡️</span>
                </button>
              </div>
            </div>
        </div>
      </div>
    );
  }

  if (appState !== AppState.IDLE) return null;

  return (
    <div className="max-w-4xl mx-auto mt-24 animate-fade-in-up px-4">
      {/* 1. Mode Switcher (Grid for 4 modes) */}
      <div className="flex justify-center mb-12">
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[24px] grid grid-cols-2 md:grid-cols-4 gap-1 shadow-sm border border-white/50">
          {[
            { id: 'BRAND', label: 'Case Hunter', icon: '🔍' },
            { id: 'TREND', label: 'Trend Spotter', icon: '🔮' },
            { id: 'SCOUT', label: 'IP Scout', icon: '⚡️' },
            { id: 'MATCH', label: 'Matchmaker', icon: '🤝' },
          ].map((m) => (
             <button 
               key={m.id}
               onClick={() => setMode(m.id as SearchMode)} 
               className={`px-4 py-2.5 rounded-[20px] text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === m.id ? 'bg-black text-white shadow-md transform scale-105' : 'text-slate-500 hover:bg-white/50'}`}
             >
                <span className="opacity-80">{m.icon}</span> {m.label}
             </button>
          ))}
        </div>
      </div>

      {mode === 'BRAND' && (
        <div className="animate-fade-in">
          {/* Hero Search */}
          <div className="relative z-20 mb-10 group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none transition-transform group-focus-within:scale-110 duration-300">
               <span className="text-3xl opacity-40 grayscale group-focus-within:grayscale-0 group-focus-within:opacity-100">🔍</span>
            </div>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && brandName && setIsPlanning(true)}
              className="block w-full pl-20 pr-32 py-7 rounded-[40px] bg-white/80 backdrop-blur-xl border border-white text-2xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-lg hover:shadow-xl"
              placeholder={researchType === 'BRAND_TARGET' ? "Search Brands (e.g., Nike)..." : "Search IPs (e.g., One Piece)..."}
            />
            <div className="absolute right-4 top-4 bottom-4 flex items-center gap-2">
               <button 
                 onClick={() => setShowHelper(!showHelper)} 
                 className={`h-full aspect-square rounded-[20px] text-xl flex items-center justify-center transition-all ${showHelper ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-500'}`}
               >
                  ✨
               </button>
               <button 
                 disabled={!brandName} 
                 onClick={() => setIsPlanning(true)} 
                 className="h-full px-8 bg-slate-900 text-white rounded-[24px] font-bold hover:scale-105 hover:bg-black transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-md"
               >
                  GO
               </button>
            </div>
          </div>
          
          {/* Helper Panel */}
          {showHelper && (
            <div className="mb-8 bg-white/80 backdrop-blur-md rounded-[32px] p-6 animate-fade-in border border-white/50 shadow-sm">
               <div className="flex gap-4">
                  <input 
                    value={helperQuery} 
                    onChange={e => setHelperQuery(e.target.value)} 
                    placeholder="Describe a category (e.g. 'Top Chinese EV brands')"
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-colors"
                  />
                  <button onClick={handleSmartHelperSubmit} disabled={isHelperLoading} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-200">
                    {isHelperLoading ? 'Thinking...' : 'Generate'}
                  </button>
               </div>
               {helperResults.length > 0 && (
                 <div className="flex flex-wrap gap-3 mt-6">
                    {helperResults.map((r, i) => (
                       <button key={i} onClick={() => { setBrandName(r); setIsPlanning(true); }} className="px-5 py-2.5 bg-white rounded-xl text-sm font-bold shadow-sm hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all border border-slate-100">{r}</button>
                    ))}
                 </div>
               )}
            </div>
          )}

          {/* Categories */}
          <div className="mb-10 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
             <div className="flex justify-center gap-8 min-w-max px-4">
                {activeCategories.map(cat => (
                   <div key={cat.id} className="flex flex-col items-center gap-3 group cursor-pointer tap-active" onClick={() => setActiveCategory(cat.id)}>
                      <div className={`p-[3px] rounded-full bg-gradient-to-tr ${activeCategory === cat.id ? cat.gradient : 'from-slate-200 to-slate-200'} transition-all duration-300 group-hover:scale-105 shadow-sm`}>
                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl border-[3px] border-white">
                            {cat.icon}
                         </div>
                      </div>
                      <span className={`text-xs font-bold tracking-wide ${activeCategory === cat.id ? 'text-slate-900' : 'text-slate-400'}`}>{cat.label}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Quick Picks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
             {activeCategories.find(c => c.id === activeCategory)?.brands.map(brand => (
                <button 
                  key={brand} 
                  onClick={() => { setBrandName(brand); setIsPlanning(true); }}
                  className="bg-white/40 hover:bg-white/80 backdrop-blur-sm p-5 rounded-2xl text-left shadow-sm hover:shadow-lg transition-all border border-white/60 group"
                >
                   <span className="font-bold text-slate-800 group-hover:text-indigo-600 block mb-1 text-lg">{brand}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform inline-block">Quick Search &rarr;</span>
                </button>
             ))}
          </div>
        </div>
      )}

      {mode === 'TREND' && (
        <div className="animate-fade-in">
           <div className="relative z-20 mb-12">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                <span className="text-3xl">🔮</span>
            </div>
            <input
              type="text"
              value={trendTopic}
              onChange={(e) => setTrendTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && trendTopic && initTrendPlanning(trendTopic)}
              className="block w-full pl-20 pr-32 py-7 rounded-[40px] bg-white/80 backdrop-blur-xl border border-white text-xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:bg-white transition-all shadow-lg hover:shadow-xl"
              placeholder="Ask anything (e.g., 'Popular Sports IPs 2024')"
            />
            <div className="absolute right-4 top-4 bottom-4 flex items-center gap-2">
               <button disabled={!trendTopic} onClick={() => initTrendPlanning(trendTopic)} className="h-full px-8 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-[24px] font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-fuchsia-200">
                  Analyze
               </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {TREND_PRESETS.map((p, i) => (
                <button key={i} onClick={() => initTrendPlanning(p.query)} className="bg-white/60 hover:bg-white/90 backdrop-blur-sm p-6 rounded-[24px] text-left hover:scale-[1.02] transition-all border border-white/50 shadow-sm hover:shadow-md group">
                   <h3 className="text-lg font-bold text-slate-900 group-hover:text-fuchsia-600 transition-colors mb-2">{p.title}</h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">{p.query}</p>
                </button>
             ))}
          </div>
        </div>
      )}

      {mode === 'SCOUT' && (
        <div className="animate-fade-in text-center max-w-2xl mx-auto">
           <h2 className="text-3xl font-bold text-slate-900 mb-2">Deep IP Analysis</h2>
           <p className="text-slate-500 mb-8">Generate a comprehensive commercial profile for any Intellectual Property.</p>
           
           <div className="relative z-20 mb-8">
            <input
              type="text"
              value={scoutIPName}
              onChange={(e) => setScoutIPName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scoutIPName && executeScout()}
              className="block w-full px-8 py-6 rounded-[30px] bg-white/80 backdrop-blur-xl border border-white text-xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:bg-white transition-all shadow-lg text-center"
              placeholder="Enter IP Name (e.g. 'Labubu', 'Black Myth: Wukong')"
            />
           </div>
           
           <button 
             onClick={executeScout} 
             disabled={!scoutIPName}
             className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg disabled:opacity-50"
           >
             Scout IP ⚡️
           </button>
        </div>
      )}

      {mode === 'MATCH' && (
        <div className="animate-fade-in max-w-2xl mx-auto">
           <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-lg border border-white/60">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Collaboration Matchmaker</h2>
               <p className="text-slate-500 text-sm mt-1">AI-powered partner recommendations for your brand.</p>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Your Brand/Product</label>
                   <input value={matchBrand} onChange={e => setMatchBrand(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. 'Manner Coffee'"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Industry</label>
                    <input value={matchIndustry} onChange={e => setMatchIndustry(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. 'Beverage'"/>
                  </div>
                   <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Target Audience</label>
                    <input value={matchAudience} onChange={e => setMatchAudience(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. 'Gen Z Students'"/>
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Campaign Goal / Occasion</label>
                   <input value={matchGoal} onChange={e => setMatchGoal(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. 'Summer Refresh Campaign'"/>
                </div>
             </div>

             <div className="mt-8 flex justify-center">
                <button 
                  onClick={executeMatch} 
                  disabled={!matchBrand || !matchIndustry || !matchGoal}
                  className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Find My Match 🤝
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};