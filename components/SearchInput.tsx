
import React, { useState, useEffect } from 'react';
import { AppState, ResearchConfig, TrendConfig, MatchConfig } from '../types';
import { generateSmartIPList, generateSmartBrandList, generateSmartTrendTopics, getBrandSearchPrompt, getTrendAnalysisPrompt, getIPScoutPrompt, getMatchmakingPrompt } from '../services/geminiService';
import { PromptInspector } from './PromptInspector';

interface SearchInputProps {
  onStartResearch: (config: ResearchConfig, prompt?: string) => void;
  onStartTrendAnalysis: (config: TrendConfig, prompt?: string) => void;
  onStartIPScout: (ipName: string, prompt?: string) => void;
  onStartMatchmaking: (config: MatchConfig, prompt?: string) => void;
  appState: AppState;
}

interface QuickPickItem {
  name: string;
  query: string;
  desc: string;
}

const BRAND_CATEGORIES = [
  { 
    id: 'tech', 
    label: 'Tech', 
    icon: '💻', 
    gradient: 'from-blue-400 to-cyan-300', 
    brands: [
      { name: 'DJI 大疆', query: 'DJI', desc: 'Drones & Camera Systems' },
      { name: 'Insta360 影石', query: 'Insta360', desc: '360° Action Cameras' },
      { name: 'Nothing', query: 'Nothing Tech', desc: 'Transparent Design Tech' },
      { name: 'Xiaomi 小米', query: 'Xiaomi', desc: 'Smart Home & AIoT' },
      { name: 'Apple 苹果', query: 'Apple', desc: 'Premium Consumer Tech' },
      { name: 'Sony 索尼', query: 'Sony', desc: 'Entertainment & Sensors' },
      { name: 'Tesla 特斯拉', query: 'Tesla', desc: 'EV & Clean Energy' },
      { name: 'Dyson 戴森', query: 'Dyson', desc: 'High-end Appliances' },
      { name: 'Nintendo 任天堂', query: 'Nintendo', desc: 'Gaming & Family Fun' },
      { name: 'Samsung 三星', query: 'Samsung', desc: 'Mobile & Displays' },
      { name: 'Anker 安克', query: 'Anker', desc: 'Charging & Accessories' },
      { name: 'Bose', query: 'Bose', desc: 'Premium Audio' }
    ] 
  },
  { 
    id: 'fashion', 
    label: 'Fashion', 
    icon: '👟', 
    gradient: 'from-fuchsia-500 to-pink-500', 
    brands: [
      { name: 'Gentle Monster', query: 'Gentle Monster', desc: 'Avant-Garde Eyewear' },
      { name: 'Lululemon', query: 'Lululemon', desc: 'Yoga & Athleisure' },
      { name: 'Arc\'teryx 始祖鸟', query: 'Arc\'teryx', desc: 'High-End Outdoor' },
      { name: 'Maison Margiela', query: 'Maison Margiela', desc: 'Deconstructivist Luxury' },
      { name: 'Crocs', query: 'Crocs', desc: 'Customizable Clogs' },
      { name: 'Rimowa', query: 'Rimowa', desc: 'Aluminum Luggage' },
      { name: 'Salomon', query: 'Salomon', desc: 'Trail Running & Gorpcore' },
      { name: 'Supreme', query: 'Supreme', desc: 'Streetwear Icon' },
      { name: 'Birkenstock', query: 'Birkenstock', desc: 'Classic Sandals' },
      { name: 'Jacquemus', query: 'Jacquemus', desc: 'Modern French Fashion' },
      { name: 'Uniqlo 优衣库', query: 'Uniqlo', desc: 'LifeWear Essentials' },
      { name: 'Nike', query: 'Nike', desc: 'Sportswear Giant' }
    ] 
  },
  { 
    id: 'food', 
    label: 'F&B', 
    icon: '🍔', 
    gradient: 'from-orange-400 to-amber-300', 
    brands: [
      { name: 'Manner Coffee', query: 'Manner Coffee', desc: 'Boutique Coffee Chain' },
      { name: 'Heytea 喜茶', query: 'Heytea', desc: 'New Style Tea' },
      { name: 'Starbucks 星巴克', query: 'Starbucks', desc: 'Coffee Culture' },
      { name: 'Oatly', query: 'Oatly', desc: 'Oat Milk Pioneer' },
      { name: 'Shake Shack', query: 'Shake Shack', desc: 'Modern Burger Stand' },
      { name: 'Blue Bottle', query: 'Blue Bottle', desc: 'Specialty Coffee' },
      { name: 'KFC 肯德基', query: 'KFC', desc: 'Localization Master' },
      { name: 'McDonald\'s 麦当劳', query: 'McDonald\'s', desc: 'Fast Food Icon' },
      { name: 'Moutai 茅台', query: 'Moutai', desc: 'Luxury Baijiu' },
      { name: 'Haidilao 海底捞', query: 'Haidilao', desc: 'Hot Pot Service' },
      { name: 'Coca-Cola 可口可乐', query: 'Coca-Cola', desc: 'Beverage Legend' },
      { name: 'Oreo 奥利奥', query: 'Oreo', desc: 'Cookie & Snacks' }
    ] 
  },
  { 
    id: 'beauty', 
    label: 'Beauty', 
    icon: '💄', 
    gradient: 'from-rose-400 to-red-300', 
    brands: [
      { name: 'Aesop 伊索', query: 'Aesop', desc: 'Plant-based Care' },
      { name: 'Florasis 花西子', query: 'Florasis', desc: 'Eastern Aesthetics' },
      { name: 'Fenty Beauty', query: 'Fenty Beauty', desc: 'Inclusive Makeup' },
      { name: 'Le Labo', query: 'Le Labo', desc: 'Niche Fragrance' },
      { name: 'La Mer 海蓝之谜', query: 'La Mer', desc: 'Luxury Skincare' },
      { name: '3CE', query: '3CE', desc: 'K-Beauty Stylenanda' },
      { name: 'L\'Oreal 欧莱雅', query: 'L\'Oreal', desc: 'Beauty Giant' },
      { name: 'Tamburins', query: 'Tamburins', desc: 'Artistic Fragrance' },
      { name: 'Perfect Diary 完美日记', query: 'Perfect Diary', desc: 'C-Beauty Trend' },
      { name: 'Jo Malone', query: 'Jo Malone', desc: 'British Scent' },
      { name: 'SK-II', query: 'SK-II', desc: 'Prestige Skincare' },
      { name: 'Dyson Hair', query: 'Dyson Hair', desc: 'Hair Tech' }
    ] 
  },
  { 
    id: 'auto', 
    label: 'Auto', 
    icon: '🚗', 
    gradient: 'from-emerald-400 to-teal-300', 
    brands: [
      { name: 'Xiaomi Auto 小米汽车', query: 'Xiaomi Auto', desc: 'Smart EV Ecosystem' },
      { name: 'NIO 蔚来', query: 'NIO', desc: 'Premium Smart EV' },
      { name: 'Porsche 保时捷', query: 'Porsche', desc: 'Luxury Sports Cars' },
      { name: 'BYD 比亚迪', query: 'BYD', desc: 'EV Market Leader' },
      { name: 'Tesla 特斯拉', query: 'Tesla', desc: 'EV Pioneer' },
      { name: 'XPeng 小鹏', query: 'XPeng', desc: 'AI Driving Tech' },
      { name: 'Zeekr 极氪', query: 'Zeekr', desc: 'Performance EV' },
      { name: 'Li Auto 理想', query: 'Li Auto', desc: 'Family Smart SUV' },
      { name: 'Mercedes-Benz', query: 'Mercedes-Benz', desc: 'Luxury Heritage' },
      { name: 'BMW', query: 'BMW', desc: 'Driving Pleasure' },
      { name: 'Audi', query: 'Audi', desc: 'Tech & Design' },
      { name: 'Wuling 五菱', query: 'Wuling', desc: 'Micro EV Culture' }
    ] 
  }
];

const IP_CATEGORIES = [
  { 
    id: 'anime', 
    label: 'Anime', 
    icon: '🎌', 
    gradient: 'from-violet-500 to-purple-500', 
    brands: [
      { name: 'One Piece 航海王', query: 'One Piece', desc: 'Adventure Epic' },
      { name: 'Evangelion EVA', query: 'Evangelion', desc: 'Mecha Aesthetics' },
      { name: 'Chiikawa 吉伊卡哇', query: 'Chiikawa', desc: 'Viral Cute Mascot' },
      { name: 'Pokémon 宝可梦', query: 'Pokemon', desc: 'Global Franchise' },
      { name: 'Spy x Family', query: 'Spy x Family', desc: 'Action Comedy' },
      { name: 'Doraemon 哆啦A梦', query: 'Doraemon', desc: 'Retro Nostalgia' },
      { name: 'Gundam 高达', query: 'Gundam', desc: 'Mecha Model Hobby' },
      { name: 'Studio Ghibli 吉卜力', query: 'Studio Ghibli', desc: 'Fantasy Art' },
      { name: 'Naruto 火影忍者', query: 'Naruto', desc: 'Ninja Saga' },
      { name: 'Demon Slayer 鬼灭', query: 'Demon Slayer', desc: 'Modern Hit' },
      { name: 'Hello Kitty', query: 'Hello Kitty', desc: 'Sanrio Icon' },
      { name: 'Hatsune Miku 初音', query: 'Hatsune Miku', desc: 'Virtual Idol' }
    ] 
  },
  { 
    id: 'games', 
    label: 'Gaming', 
    icon: '🎮', 
    gradient: 'from-indigo-500 to-blue-500', 
    brands: [
      { name: 'Genshin Impact 原神', query: 'Genshin Impact', desc: 'Open World RPG' },
      { name: 'Black Myth: Wukong', query: 'Black Myth: Wukong', desc: 'Chinese Action AAA' },
      { name: 'League of Legends', query: 'League of Legends', desc: 'Esports MOBA' },
      { name: 'Elden Ring', query: 'Elden Ring', desc: 'Dark Fantasy' },
      { name: 'Super Mario', query: 'Super Mario', desc: 'Platformer Icon' },
      { name: 'Zelda', query: 'The Legend of Zelda', desc: 'Adventure Classic' },
      { name: 'Minecraft', query: 'Minecraft', desc: 'Sandbox Creative' },
      { name: 'Cyberpunk 2077', query: 'Cyberpunk 2077', desc: 'Sci-Fi Aesthetics' },
      { name: 'Honor of Kings 王者荣耀', query: 'Honor of Kings', desc: 'Mobile Social' },
      { name: 'Final Fantasy', query: 'Final Fantasy', desc: 'RPG Visuals' },
      { name: 'Animal Crossing', query: 'Animal Crossing', desc: 'Cozy Sim' },
      { name: 'PlayStation', query: 'PlayStation', desc: 'Gaming Brand' }
    ] 
  },
  { 
    id: 'art', 
    label: 'Art', 
    icon: '🎨', 
    gradient: 'from-yellow-400 to-orange-500', 
    brands: [
      { name: 'Van Gogh 梵高', query: 'Van Gogh', desc: 'Post-Impressionist' },
      { name: 'KAWS', query: 'KAWS', desc: 'Street Pop Art' },
      { name: 'TeamLab', query: 'TeamLab', desc: 'Digital Interactive' },
      { name: 'Louvre 卢浮宫', query: 'The Louvre', desc: 'Classic Museum' },
      { name: 'Monet 莫奈', query: 'Claude Monet', desc: 'Impressionism' },
      { name: 'MoMA', query: 'MoMA', desc: 'Modern Art' },
      { name: 'Keith Haring', query: 'Keith Haring', desc: 'Graffiti Art' },
      { name: 'Yayoi Kusama 草间弥生', query: 'Yayoi Kusama', desc: 'Polka Dot Art' },
      { name: 'British Museum', query: 'British Museum', desc: 'History & Culture' },
      { name: 'Andy Warhol', query: 'Andy Warhol', desc: 'Pop Art Icon' },
      { name: 'Basquiat', query: 'Basquiat', desc: 'Neo-Expressionism' },
      { name: 'Pantone', query: 'Pantone', desc: 'Color Authority' }
    ] 
  },
  { 
    id: 'stars', 
    label: 'KOL', 
    icon: '🌟', 
    gradient: 'from-pink-500 to-rose-500', 
    brands: [
      { name: 'BTS 防弹少年团', query: 'BTS', desc: 'K-Pop Global' },
      { name: 'Blackpink', query: 'Blackpink', desc: 'Girl Group Icon' },
      { name: 'Travis Scott', query: 'Travis Scott', desc: 'Hip-Hop & Fashion' },
      { name: 'Faker', query: 'Faker', desc: 'Esports Legend' },
      { name: 'Taylor Swift', query: 'Taylor Swift', desc: 'Pop Megastar' },
      { name: 'Jackson Wang 王嘉尔', query: 'Jackson Wang', desc: 'Music & Streetwear' },
      { name: 'G-Dragon', query: 'G-Dragon', desc: 'K-Pop Fashion' },
      { name: 'Jay Chou 周杰伦', query: 'Jay Chou', desc: 'Mandopop King' },
      { name: 'Kim Kardashian', query: 'Kim Kardashian', desc: 'Reality & Business' },
      { name: 'MrBeast', query: 'MrBeast', desc: 'YouTube Philanthropy' },
      { name: 'Eileen Gu 谷爱凌', query: 'Eileen Gu', desc: 'Winter Sports' },
      { name: 'Kanye West (Ye)', query: 'Kanye West', desc: 'Design & Music' }
    ] 
  }
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

// --- Extracted HelperPanel Component ---
interface HelperPanelProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmit: (e: React.FormEvent | React.KeyboardEvent) => void;
  isLoading: boolean;
  mode: SearchMode;
  results: string[];
  onResultClick: (result: string) => void;
}

const HelperPanel: React.FC<HelperPanelProps> = ({ query, onQueryChange, onSubmit, isLoading, mode, results, onResultClick }) => (
    <div className="mb-8 bg-white/80 backdrop-blur-md rounded-[32px] p-6 animate-fade-in border border-white/50 shadow-sm mt-4">
       <div className="flex gap-4">
          <input 
            value={query} 
            onChange={e => onQueryChange(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
            placeholder={
                mode === 'TREND' ? "Describe a topic (e.g. 'Future of Retail')..." :
                mode === 'SCOUT' ? "Describe category (e.g. 'Popular Sci-Fi IPs')..." :
                "Describe a category (e.g. 'Luxury Car Brands')..."
            }
            className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-colors"
          />
          <button onClick={onSubmit} disabled={isLoading} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-200">
            {isLoading ? 'Thinking...' : 'Generate'}
          </button>
       </div>
       {results.length > 0 && (
         <div className="flex flex-wrap gap-3 mt-6">
            {results.map((r, i) => (
               <button key={i} onClick={() => onResultClick(r)} className="px-5 py-2.5 bg-white rounded-xl text-sm font-bold shadow-sm hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all border border-slate-100">{r}</button>
            ))}
         </div>
       )}
    </div>
);

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

  // Prompt Inspector State
  const [inspectorState, setInspectorState] = useState<{
    isOpen: boolean;
    prompt: string;
    actionType: 'RESEARCH' | 'TREND' | 'SCOUT' | 'MATCH' | null;
  }>({ isOpen: false, prompt: '', actionType: null });

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
  const handleSmartHelperSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!helperQuery.trim()) return;
    setIsHelperLoading(true);
    setHelperResults([]);
    try {
      let results = [];
      if (mode === 'TREND') {
         results = await generateSmartTrendTopics(helperQuery);
      } else if (mode === 'SCOUT') {
         results = await generateSmartIPList(helperQuery);
      } else if (mode === 'MATCH') {
         results = await generateSmartBrandList(helperQuery);
      } else {
         // BRAND mode
         results = researchType === 'IP_TARGET' ? await generateSmartIPList(helperQuery) : await generateSmartBrandList(helperQuery);
      }
      setHelperResults(results);
    } catch (e) { console.error(e); } finally { setIsHelperLoading(false); }
  };

  const handleHelperResultClick = (result: string) => {
    if (mode === 'BRAND') {
      setBrandName(result);
      setIsPlanning(true);
    } else if (mode === 'TREND') {
      setTrendTopic(result);
      initTrendPlanning(result);
    } else if (mode === 'SCOUT') {
      setScoutIPName(result);
    } else if (mode === 'MATCH') {
      setMatchBrand(result);
    }
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

  // --- PRE-EXECUTION STEPS (GENERATE PROMPT -> OPEN INSPECTOR) ---

  const initiateResearch = () => {
    const config: ResearchConfig = { brandName, keywords, platforms };
    const prompt = getBrandSearchPrompt(config);
    setInspectorState({ isOpen: true, prompt, actionType: 'RESEARCH' });
  };
  
  const initiateTrendSearch = () => { 
    const config: TrendConfig = { 
        topic: trendTopic, 
        timeScale: trendTimeScale, 
        limit: trendLimit, 
        keywords: trendKeywords, 
        platforms 
    };
    const prompt = getTrendAnalysisPrompt(config);
    setInspectorState({ isOpen: true, prompt, actionType: 'TREND' });
  };

  const initiateScout = () => {
    if (scoutIPName) {
      const prompt = getIPScoutPrompt(scoutIPName);
      setInspectorState({ isOpen: true, prompt, actionType: 'SCOUT' });
    }
  };

  const initiateMatch = () => {
    if (matchBrand && matchIndustry && matchGoal) {
      const config: MatchConfig = {
        brandName: matchBrand,
        industry: matchIndustry,
        campaignGoal: matchGoal,
        targetAudience: matchAudience
      };
      const prompt = getMatchmakingPrompt(config);
      setInspectorState({ isOpen: true, prompt, actionType: 'MATCH' });
    }
  };

  // --- FINAL EXECUTION (CALLED BY INSPECTOR) ---
  
  const handleExecutePrompt = (finalPrompt: string) => {
    setInspectorState({ ...inspectorState, isOpen: false });
    
    switch (inspectorState.actionType) {
      case 'RESEARCH':
        onStartResearch({ brandName, keywords, platforms }, finalPrompt);
        setIsPlanning(false);
        break;
      case 'TREND':
        onStartTrendAnalysis({ 
          topic: trendTopic, 
          timeScale: trendTimeScale, 
          limit: trendLimit, 
          keywords: trendKeywords, 
          platforms 
        }, finalPrompt);
        setIsTrendPlanning(false);
        break;
      case 'SCOUT':
        onStartIPScout(scoutIPName, finalPrompt);
        break;
      case 'MATCH':
        onStartMatchmaking({
          brandName: matchBrand,
          industry: matchIndustry,
          campaignGoal: matchGoal,
          targetAudience: matchAudience
        }, finalPrompt);
        break;
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
      <>
        {inspectorState.isOpen && (
          <PromptInspector 
            initialPrompt={inspectorState.prompt}
            title={inspectorState.actionType || 'prompt'}
            onConfirm={handleExecutePrompt}
            onCancel={() => setInspectorState({ ...inspectorState, isOpen: false })}
          />
        )}
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
                    onClick={isPlanning ? initiateResearch : initiateTrendSearch}
                    className="px-10 py-4 bg-gradient-to-r from-slate-900 to-black text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg flex items-center gap-3 active:scale-95"
                  >
                    <span>{isPlanning ? 'Start Hunt' : 'Analyze'}</span>
                    <span className="text-xl animate-pulse">⚡️</span>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </>
    );
  }

  if (appState !== AppState.IDLE) return null;

  return (
    <div className="max-w-4xl mx-auto mt-24 animate-fade-in-up px-4">
      {inspectorState.isOpen && (
          <PromptInspector 
            initialPrompt={inspectorState.prompt}
            title={inspectorState.actionType || 'prompt'}
            onConfirm={handleExecutePrompt}
            onCancel={() => setInspectorState({ ...inspectorState, isOpen: false })}
          />
      )}

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
            <HelperPanel 
              query={helperQuery}
              onQueryChange={setHelperQuery}
              onSubmit={handleSmartHelperSubmit}
              isLoading={isHelperLoading}
              mode={mode}
              results={helperResults}
              onResultClick={handleHelperResultClick}
            />
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
             {activeCategories.find(c => c.id === activeCategory)?.brands.map((item: any) => (
                <button 
                  key={item.query} 
                  onClick={() => { setBrandName(item.query); setIsPlanning(true); }}
                  className="bg-white/40 hover:bg-white/80 backdrop-blur-sm p-4 rounded-2xl text-left shadow-sm hover:shadow-lg transition-all border border-white/60 group flex flex-col justify-between h-full min-h-[100px]"
                >
                   <div>
                       <span className="font-bold text-slate-800 group-hover:text-indigo-600 block text-base leading-tight mb-1">{item.name}</span>
                       <span className="text-[10px] font-medium text-slate-500 block leading-tight">{item.desc}</span>
                   </div>
                   <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mt-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">Quick Search &rarr;</span>
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
               <button 
                 onClick={() => setShowHelper(!showHelper)} 
                 className={`h-full aspect-square rounded-[20px] text-xl flex items-center justify-center transition-all ${showHelper ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-slate-50 hover:bg-fuchsia-50 text-slate-400 hover:text-fuchsia-500'}`}
               >
                  ✨
               </button>
               <button disabled={!trendTopic} onClick={() => initTrendPlanning(trendTopic)} className="h-full px-8 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-[24px] font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-lg shadow-fuchsia-200">
                  Analyze
               </button>
            </div>
          </div>
          
          {showHelper && (
            <HelperPanel 
              query={helperQuery}
              onQueryChange={setHelperQuery}
              onSubmit={handleSmartHelperSubmit}
              isLoading={isHelperLoading}
              mode={mode}
              results={helperResults}
              onResultClick={handleHelperResultClick}
            />
          )}

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
              onKeyDown={(e) => e.key === 'Enter' && scoutIPName && initiateScout()}
              className="block w-full px-8 py-6 rounded-[30px] bg-white/80 backdrop-blur-xl border border-white text-xl font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:bg-white transition-all shadow-lg text-center"
              placeholder="Enter IP Name (e.g. 'Labubu', 'Black Myth: Wukong')"
            />
            <button 
               onClick={() => setShowHelper(!showHelper)} 
               className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${showHelper ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400 hover:bg-cyan-50 hover:text-cyan-500'}`}
            >
                ✨
            </button>
           </div>
           
           {showHelper && (
             <div className="mb-8 text-left">
               <HelperPanel 
                  query={helperQuery}
                  onQueryChange={setHelperQuery}
                  onSubmit={handleSmartHelperSubmit}
                  isLoading={isHelperLoading}
                  mode={mode}
                  results={helperResults}
                  onResultClick={handleHelperResultClick}
                />
             </div>
           )}
           
           <button 
             onClick={initiateScout} 
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
                   <div className="relative">
                      <input 
                        value={matchBrand} 
                        onChange={e => setMatchBrand(e.target.value)} 
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 pr-12" 
                        placeholder="e.g. 'Manner Coffee'"
                      />
                       <button 
                         onClick={() => setShowHelper(!showHelper)} 
                         className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showHelper ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'}`}
                       >
                          ✨
                       </button>
                   </div>
                   {showHelper && (
                     <div className="mt-4">
                        <HelperPanel 
                          query={helperQuery}
                          onQueryChange={setHelperQuery}
                          onSubmit={handleSmartHelperSubmit}
                          isLoading={isHelperLoading}
                          mode={mode}
                          results={helperResults}
                          onResultClick={handleHelperResultClick}
                        />
                     </div>
                   )}
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
                  onClick={initiateMatch} 
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
