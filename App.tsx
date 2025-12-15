import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { LoadingState } from './components/LoadingState';
import { ReviewBoard } from './components/ReviewBoard';
import { Notebook } from './components/Notebook';
import { NotebookList } from './components/NotebookList';
import { searchBrandCases } from './services/geminiService';
import { AppState, CobrandingCase, ResearchConfig, GroundingMetadata, NotebookData } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Data for the current search session (Review Stage)
  const [reviewCases, setReviewCases] = useState<CobrandingCase[]>([]);
  const [currentMetadata, setCurrentMetadata] = useState<GroundingMetadata | undefined>(undefined);
  
  // Notebooks Management
  const [notebooks, setNotebooks] = useState<NotebookData[]>([
    { id: 'default', name: 'My First Notebook', cases: [], createdAt: Date.now(), updatedAt: Date.now() }
  ]);
  const [activeNotebookId, setActiveNotebookId] = useState<string>('default');
  
  const [error, setError] = useState<string | null>(null);

  // Set Document Title
  useEffect(() => {
    document.title = "Co-Brand Hunter | 联名情报局";
  }, []);

  const handleStartResearch = useCallback(async (config: ResearchConfig) => {
    setAppState(AppState.SEARCHING);
    setError(null);
    setReviewCases([]);
    setCurrentMetadata(undefined);

    try {
      const search = searchBrandCases(config);
      // Wait for at least 2 seconds of loading animation to avoid flash
      const [_, result] = await Promise.all([
         new Promise(resolve => setTimeout(resolve, 2000)), 
         search
      ]);
      
      setReviewCases(result.cases);
      setCurrentMetadata(result.metadata);
      setAppState(AppState.REVIEWING);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch cases. Please check your API key or try again later.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleConfirmReview = (selected: CobrandingCase[]) => {
    // Add selected cases to active notebook and auto-sort
    setNotebooks(prevNotebooks => prevNotebooks.map(nb => {
      if (nb.id === activeNotebookId) {
        const combined = [...selected, ...nb.cases];
        const sorted = combined.sort((a, b) => {
          const dateA = new Date(a.date.replace(/\./g, '-')); 
          const dateB = new Date(b.date.replace(/\./g, '-'));
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return dateB.getTime() - dateA.getTime();
        });
        return { ...nb, cases: sorted, updatedAt: Date.now() };
      }
      return nb;
    }));
    
    // Clear review cases
    setReviewCases([]); 
    setAppState(AppState.NOTEBOOK_DETAIL);
  };

  const handleDiscardReview = () => {
    setReviewCases([]); // Clear rejected cases
    setAppState(AppState.NOTEBOOK_DETAIL); // Go to notebook view
  };

  const deleteNotebookCase = (index: number) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id === activeNotebookId) {
        return { ...nb, cases: nb.cases.filter((_, i) => i !== index), updatedAt: Date.now() };
      }
      return nb;
    }));
  };

  // --- Notebook Management Logic ---

  const handleOpenNotebookList = () => {
    if (appState !== AppState.SEARCHING) {
       setAppState(AppState.NOTEBOOK_LIST);
    }
  };

  const createNewNotebook = () => {
    const newId = Date.now().toString();
    const newNotebook: NotebookData = {
      id: newId,
      name: `Notebook ${notebooks.length + 1}`,
      cases: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotebooks([...notebooks, newNotebook]);
    // Optionally auto-select it
    // setActiveNotebookId(newId);
  };

  const deleteNotebook = (id: string) => {
    if (notebooks.length <= 1) {
      alert("You must keep at least one notebook.");
      return;
    }
    const newNotebooks = notebooks.filter(n => n.id !== id);
    setNotebooks(newNotebooks);
    if (activeNotebookId === id) {
      setActiveNotebookId(newNotebooks[0].id);
    }
  };

  const selectNotebook = (id: string) => {
    setActiveNotebookId(id);
    setAppState(AppState.NOTEBOOK_DETAIL);
  };

  const handleBackFromNotebookDetail = () => {
    if (reviewCases.length > 0) {
      setAppState(AppState.REVIEWING);
    } else {
      setAppState(AppState.NOTEBOOK_LIST); // Back to list instead of IDLE
    }
  };

  // Helper: Get active notebook object
  const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header 
        notebookCount={activeNotebook.cases.length} 
        onOpenNotebook={handleOpenNotebookList}
        isSearching={appState === AppState.SEARCHING}
      />
      
      <main className="flex-grow w-full px-6">
        {appState === AppState.IDLE && (
          <SearchInput onStartResearch={handleStartResearch} appState={appState} />
        )}

        {appState === AppState.SEARCHING && (
          <LoadingState />
        )}

        {appState === AppState.REVIEWING && (
           <ReviewBoard 
             newCases={reviewCases} 
             existingCases={activeNotebook.cases}
             metadata={currentMetadata}
             onConfirm={handleConfirmReview}
             onDiscardAll={handleDiscardReview}
           />
        )}

        {appState === AppState.NOTEBOOK_LIST && (
           <NotebookList 
             notebooks={notebooks}
             onSelectNotebook={selectNotebook}
             onCreateNotebook={createNewNotebook}
             onDeleteNotebook={deleteNotebook}
             onClose={() => setAppState(AppState.IDLE)}
           />
        )}

        {appState === AppState.NOTEBOOK_DETAIL && (
           <Notebook 
             notebook={activeNotebook}
             onDeleteCase={deleteNotebookCase}
             onBack={handleBackFromNotebookDetail}
             hasPendingReview={reviewCases.length > 0}
           />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-10 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setAppState(AppState.IDLE)}
              className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>© 2024 Co-Brand Hunter | 联名情报局. Powered by Google Gemini 2.0 Flash.</p>
      </footer>
    </div>
  );
};

export default App;