import React, { useState } from 'react';
import { CobrandingCase, GroundingMetadata, formatCaseToMarkdown } from '../types';

interface ReviewBoardProps {
  newCases: CobrandingCase[];
  existingCases: CobrandingCase[];
  metadata?: GroundingMetadata;
  onConfirm: (selectedCases: CobrandingCase[]) => void;
  onDiscardAll: () => void;
}

export const ReviewBoard: React.FC<ReviewBoardProps> = ({ newCases, existingCases, metadata, onConfirm, onDiscardAll }) => {
  // By default select all new cases
  const [selectedIndices, setSelectedIndices] = useState<number[]>(newCases.map((_, i) => i));

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleConfirm = () => {
    const selected = newCases.filter((_, i) => selectedIndices.includes(i));
    onConfirm(selected);
  };

  // Helper to check duplicates
  const isDuplicate = (newCase: CobrandingCase) => {
    return existingCases.some(existing => 
      existing.productName.toLowerCase() === newCase.productName.toLowerCase() ||
      existing.projectName.toLowerCase() === newCase.projectName.toLowerCase()
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-8">
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden mb-8">
        <div className="bg-gray-900 text-white px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Mission Report: Review Findings</h2>
            <p className="text-gray-400 text-sm mt-1">Review the AI's findings before adding them to your notebook.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={onDiscardAll} className="px-4 py-2 text-gray-300 hover:text-white text-sm">Discard All</button>
             <button 
                onClick={handleConfirm}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg transition-all"
             >
               Add {selectedIndices.length} Cases to Notebook
             </button>
          </div>
        </div>

        {/* Source Intelligence */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             Source Intelligence Scanned
           </h3>
           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
             {metadata?.groundingChunks?.map((chunk, i) => (
                <a 
                  key={i} 
                  href={chunk.web?.uri} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(chunk.web?.uri || 'http://google.com').hostname}`} alt="" className="w-3 h-3 mr-2 opacity-50"/>
                  <span className="truncate max-w-[200px]">{chunk.web?.title || 'Web Source'}</span>
                </a>
             )) || <span className="text-gray-400 text-sm">No direct sources returned by grounding.</span>}
           </div>
        </div>
        
        {/* Cases Grid */}
        <div className="p-8 bg-gray-100">
           <div className="grid grid-cols-1 gap-6">
              {newCases.map((c, idx) => {
                 const isDup = isDuplicate(c);
                 return (
                  <div 
                    key={idx} 
                    onClick={() => toggleSelection(idx)}
                    className={`relative bg-white rounded-xl p-6 cursor-pointer transition-all border-2 ${selectedIndices.includes(idx) ? 'border-indigo-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {/* Selection Checkbox */}
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIndices.includes(idx) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                       {selectedIndices.includes(idx) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>

                    {/* Duplicate Warning */}
                    {isDup && (
                      <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Potential Duplicate
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{c.projectName}</h3>
                        <span className="text-sm text-gray-500 font-mono">{c.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.insight}</p>
                      
                      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 font-mono overflow-hidden">
                        {formatCaseToMarkdown(c).substring(0, 150)}...
                      </div>
                    </div>
                  </div>
                 );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};