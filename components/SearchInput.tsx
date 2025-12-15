import React, { useState, useEffect } from 'react';
import { AppState, ResearchConfig } from '../types';

interface SearchInputProps {
  onStartResearch: (config: ResearchConfig) => void;
  appState: AppState;
}

const BRAND_CATEGORIES = [
  {
    id: 'cameras',
    label: 'Cameras & Drones',
    brands: ['Insta360', 'DJI', 'GoPro', 'Sony', 'Fujifilm', 'Leica']
  },
  {
    id: 'phones',
    label: 'Phones & Mobile',
    brands: ['Samsung', 'Xiaomi', 'OPPO', 'vivo', 'Red Magic', 'OnePlus', 'Google Pixel']
  },
  {
    id: 'gaming',
    label: 'Gaming & PC',
    brands: ['Razer', 'ROG', 'Alienware', 'Logitech', 'MSI']
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle & Audio',
    brands: ['Dyson', 'JBL', 'Marshall', 'Casetify', 'Nothing', 'Hello Kitty', 'Pop Mart']
  }
];

const DEFAULT_PLATFORMS = [
  "Google Search (google.com)",
  "Official Website/Press Rooms",
  "Tech News (theverge.com, engadget.com)",
  "Social Media (instagram.com, twitter.com)",
  "Community (reddit.com)",
  "Chinese Social (xiaohongshu.com, weibo.com)"
];

export const SearchInput: React.FC<SearchInputProps> = ({ onStartResearch, appState }) => {
  const [brandName, setBrandName] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  
  const [keywords, setKeywords] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>(DEFAULT_PLATFORMS);
  const [newKeyword, setNewKeyword] = useState('');
  const [newPlatform, setNewPlatform] = useState('');

  const [activeCategory, setActiveCategory] = useState('lifestyle');

  useEffect(() => {
    if (brandName) {
      setKeywords([
        `${brandName} cobranding`,
        `${brandName} collaboration`,
        `${brandName} limited edition`,
        `${brandName} 联名`,
        `${brandName} 限定`
      ]);
    }
  }, [brandName]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim()) {
      setIsPlanning(true);
    }
  };

  const executeResearch = () => {
    onStartResearch({
      brandName,
      keywords,
      platforms
    });
    setIsPlanning(false);
  };

  const addKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const addPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlatform.trim() && !platforms.includes(newPlatform.trim())) {
      setPlatforms([...platforms, newPlatform.trim()]);
      setNewPlatform('');
    }
  };

  const removeKeyword = (k: string) => {
    setKeywords(keywords.filter(key => key !== k));
  };

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(plat => plat !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const isLoading = appState === AppState.SEARCHING;

  if (isPlanning) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-fade-in">
          <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Research Strategy</h2>
              <p className="text-indigo-100 text-sm mt-1">Configure your search parameters for <span className="font-bold text-white underline">{brandName}</span></p>
            </div>
            <button 
              onClick={() => setIsPlanning(false)}
              className="text-indigo-200 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Keywords Section */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Target Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {keywords.map(k => (
                  <span key={k} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {k}
                    <button onClick={() => removeKeyword(k)} className="ml-2 text-indigo-400 hover:text-indigo-900">×</button>
                  </span>
                ))}
              </div>
              <form onSubmit={addKeyword} className="flex gap-2">
                <input 
                  type="text" 
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add custom keyword (e.g. 'Insta360 Naruto')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Add</button>
              </form>
            </div>

            {/* Platforms Section */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Source Platforms & Websites
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Render ALL Default Platforms so they stay visible even if unchecked */}
                {DEFAULT_PLATFORMS.map(p => (
                   <label key={p} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${platforms.includes(p) ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="checkbox" 
                      checked={platforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 break-words">{p}</span>
                  </label>
                ))}
                
                {/* Render Custom Platforms */}
                 {platforms.filter(p => !DEFAULT_PLATFORMS.includes(p)).map(p => (
                   <label key={p} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all bg-purple-50 border-purple-500 ring-1 ring-purple-500`}>
                    <input 
                      type="checkbox" 
                      checked={true}
                      onChange={() => togglePlatform(p)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-purple-900">{p} (Custom)</span>
                  </label>
                ))}
              </div>
              
              <form onSubmit={addPlatform} className="flex gap-2">
                 <input 
                  type="text" 
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  placeholder="Add specific site (e.g. 'hypebeast.com')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Add Site</button>
              </form>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={() => setIsPlanning(false)}
                className="px-6 py-3 bg-white text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Back
              </button>
              <button 
                onClick={executeResearch}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Deep Research
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simplified view when not idle (e.g. results are shown) can be handled by parent,
  // but here we just show the main input.
  if (appState !== AppState.IDLE) {
    return null; // Hide search input during processing/review/notebook to reduce clutter
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8 animate-fade-in-up">
      {/* Search Bar */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Co-Brand Hunter | 联名情报局</h2>
        <p className="text-gray-500 mb-6 flex flex-col items-center justify-center gap-1">
          <span className="block">Enter a brand to configure your research strategy.</span>
          <span className="block text-gray-400">输入您感兴趣的品牌名并自定义检索设置</span>
        </p>
        
        <form onSubmit={handleInitialSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${isLoading ? 'text-indigo-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={isLoading}
            className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm text-lg"
            placeholder="Enter brand name (e.g., Hello Kitty)..."
          />
          <button
            type="submit"
            disabled={isLoading || !brandName}
            className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl font-medium text-white transition-all ${
              isLoading || !brandName 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? 'Processing...' : 'Configure'}
          </button>
        </form>
      </div>

      {/* Brand Library */}
      {!isLoading && !isPlanning && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Select</h3>
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 border-r border-gray-100 bg-gray-50/30">
              {BRAND_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-6 py-4 text-sm font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-white text-indigo-600 border-l-4 border-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="md:w-3/4 p-6 bg-white min-h-[300px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BRAND_CATEGORIES.find(c => c.id === activeCategory)?.brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setBrandName(brand);
                      setIsPlanning(true);
                    }}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 transition-all text-left group"
                  >
                    <span className="font-semibold text-gray-700 group-hover:text-indigo-700">
                      {brand}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};