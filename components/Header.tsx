import React from 'react';

interface HeaderProps {
  notebookCount?: number;
  onOpenNotebook?: () => void;
  isSearching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ notebookCount = 0, onOpenNotebook, isSearching }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Area - Pointer events auto to allow clicking */}
        <div 
          className="pointer-events-auto flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => !isSearching && onOpenNotebook && onOpenNotebook()} 
          role="button"
        >
          <div className="relative w-10 h-10 transition-transform group-hover:scale-110 duration-300">
             {/* Glowing backdrop for logo */}
             <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
             <div className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-xl border border-white/50 shadow-sm flex items-center justify-center text-xl">
               ⚡️
             </div>
          </div>
          <div className="flex flex-col">
             <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
               Co-Brand Hunter
             </h1>
             <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
               Intelligence Lab
             </span>
          </div>
        </div>
        
        {/* Navigation - Pointer events auto */}
        <div className="pointer-events-auto">
          <button 
            onClick={onOpenNotebook}
            disabled={isSearching}
            className={`
              relative group flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300
              ${isSearching 
                ? 'opacity-50 cursor-not-allowed bg-slate-100/50' 
                : 'bg-white/70 hover:bg-white backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">📂</span>
              <span className="font-bold text-sm text-slate-800">Library</span>
            </div>
            
            {notebookCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full shadow-md group-hover:bg-indigo-600 transition-colors">
                {notebookCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};