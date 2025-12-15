import React from 'react';

interface HeaderProps {
  notebookCount?: number;
  onOpenNotebook?: () => void;
  isSearching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ notebookCount = 0, onOpenNotebook, isSearching }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => !isSearching && onOpenNotebook && onOpenNotebook()} 
          role="button"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C
          </div>
          <div className="flex flex-col">
             <h1 className="text-lg font-bold text-gray-900 leading-tight">Co-Brand Hunter</h1>
             <span className="text-xs text-indigo-600 font-medium tracking-wider">联名情报局</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 hidden md:block">
            AI-Powered Marketing Research
          </div>
          
          <button 
            onClick={onOpenNotebook}
            disabled={isSearching}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
              isSearching 
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
            }`}
          >
            <span className="text-lg">📓</span>
            <span className="font-medium text-sm">My Notebooks</span>
          </button>
        </div>
      </div>
    </header>
  );
};