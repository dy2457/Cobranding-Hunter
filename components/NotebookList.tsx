import React from 'react';
import { NotebookData } from '../types';

interface NotebookListProps {
  notebooks: NotebookData[];
  onSelectNotebook: (id: string) => void;
  onCreateNotebook: () => void;
  onDeleteNotebook: (id: string) => void;
  onClose: () => void;
}

export const NotebookList: React.FC<NotebookListProps> = ({ 
  notebooks, 
  onSelectNotebook, 
  onCreateNotebook, 
  onDeleteNotebook,
  onClose
}) => {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Notebooks</h2>
          <p className="text-gray-500 mt-1">Manage your research collections.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
             Close
           </button>
           <button 
             onClick={onCreateNotebook}
             className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             New Notebook
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notebooks.length === 0 && (
           <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400">No notebooks yet. Create one to start collecting.</p>
           </div>
        )}
        
        {notebooks.map(notebook => (
          <div key={notebook.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
             <div className="flex justify-between items-start mb-4">
                <div 
                   className="cursor-pointer"
                   onClick={() => onSelectNotebook(notebook.id)}
                >
                   <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                     {notebook.name}
                   </h3>
                   <p className="text-xs text-gray-400 mt-1">
                     Created: {new Date(notebook.createdAt).toLocaleDateString()}
                   </p>
                </div>
                <button 
                   onClick={(e) => { e.stopPropagation(); onDeleteNotebook(notebook.id); }}
                   className="p-2 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50"
                   title="Delete Notebook"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
             
             <div className="flex items-end justify-between mt-6">
                <div className="flex items-center gap-2">
                   <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                     {notebook.cases.length} Cases
                   </span>
                </div>
                <button 
                   onClick={() => onSelectNotebook(notebook.id)}
                   className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Open &rarr;
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};