
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  notebookCount?: number;
  onOpenNotebook?: () => void;
  isSearching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ notebookCount = 0, onOpenNotebook, isSearching }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 pointer-events-none
        ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm py-2' : 'bg-transparent py-6'}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Area - Pointer events auto to allow clicking */}
        <div 
          className="pointer-events-auto flex items-center gap-4 cursor-pointer group select-none" 
          onClick={() => !isSearching && onOpenNotebook && onOpenNotebook()} 
          role="button"
        >
          {/* Increased Size: w-16 h-16 (64px) for clearer logo visibility */}
          <div className={`relative transition-all duration-300 ${isScrolled ? 'w-12 h-12' : 'w-16 h-16'}`}>
             {/* Glowing backdrop for logo */}
             <div className="absolute inset-0 bg-[#b5004a] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <div className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm flex items-center justify-center p-1.5">
               {/* Custom Dolphin IP Logo SVG - Preserving Ratio */}
               <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                  {/* Tail/Base */}
                  <path d="M22 84 Q 32 84 38 76 L 34 86 Z" fill="#b5004a" />
                  <circle cx="26" cy="86" r="6" fill="#b5004a" />

                  {/* Body & Fin - Smoothed curves to match natural dolphin shape */}
                  <path 
                    d="M32 76 
                       C 20 48, 30 25, 55 25 
                       C 80 25, 95 45, 90 60 
                       C 85 75, 65 65, 55 65 
                       C 45 65, 40 75, 32 76 Z" 
                    fill="#b5004a"
                  />
                  {/* Dorsal Fin */}
                  <path d="M48 28 L 42 12 L 62 26 Z" fill="#b5004a" />

                  {/* Eye */}
                  <circle cx="72" cy="48" r="5" fill="white" />

                  {/* IP Text */}
                  <text 
                    x="70" 
                    y="22" 
                    fontSize="22" 
                    fontWeight="900" 
                    fill="#b5004a" 
                    style={{ fontFamily: 'Arial, sans-serif', transform: 'rotate(12deg)', transformOrigin: '70px 22px' }}
                  >
                    IP
                  </text>
               </svg>
             </div>
          </div>
          <div className="flex flex-col justify-center">
             <h1 className={`font-bold tracking-tight leading-none group-hover:text-[#b5004a] transition-colors ${isScrolled ? 'text-lg text-slate-900' : 'text-2xl text-slate-900'}`}>
               IP鲸选站
             </h1>
             <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
               帮助市场营销人员进行IP营销、品牌联名的AI行研工具
             </span>
          </div>
        </div>
        
        {/* Navigation - Pointer events auto */}
        <div className="pointer-events-auto">
          <button 
            onClick={onOpenNotebook}
            disabled={isSearching}
            className={`
              relative group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300
              ${isSearching 
                ? 'opacity-50 cursor-not-allowed bg-slate-100/50' 
                : isScrolled 
                  ? 'bg-slate-900 text-white shadow-md hover:bg-black py-2.5'
                  : 'bg-white/70 hover:bg-white backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xl group-hover:scale-110 transition-transform duration-300 ${isSearching ? '' : isScrolled ? 'text-white' : ''}`}>📂</span>
              <span className={`font-bold ${isSearching ? 'text-slate-800' : isScrolled ? 'text-white' : 'text-slate-800'}`}>灵感库</span>
            </div>
            
            {notebookCount > 0 && (
              <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full shadow-md transition-colors
                 ${isScrolled ? 'bg-white text-slate-900' : 'bg-slate-900 text-white group-hover:bg-[#b5004a]'}
              `}>
                {notebookCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
