import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { LoadingState } from './components/LoadingState';
import { ReviewBoard } from './components/ReviewBoard';
import { Notebook } from './components/Notebook';
import { searchBrandCases } from './services/geminiService';
import { AppState, CobrandingCase, ResearchConfig, GroundingMetadata } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentBrand, setCurrentBrand] = useState('');
  
  // Data for the current search session (Review Stage)
  const [reviewCases, setReviewCases] = useState<CobrandingCase[]>([]);
  const [currentMetadata, setCurrentMetadata] = useState<GroundingMetadata | undefined>(undefined);
  
  // Permanent Notebook Data
  const [notebookCases, setNotebookCases] = useState<CobrandingCase[]>([]);
  
  const [error, setError] = useState<string | null>(null);

  const handleStartResearch = useCallback(async (config: ResearchConfig) => {
    setAppState(AppState.SEARCHING);
    setCurrentBrand(config.brandName);
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
    // Add selected cases to notebook and auto-sort chronologically (Newest first)
    setNotebookCases(prev => {
      const combined = [...selected, ...prev];
      return combined.sort((a, b) => {
        // Normalize date format (YYYY.MM.DD -> YYYY-MM-DD) for parsing
        const dateA = new Date(a.date.replace(/\./g, '-')); 
        const dateB = new Date(b.date.replace(/\./g, '-'));
        
        // Handle invalid dates by pushing them to the end
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        // Descending order (Newest first)
        return dateB.getTime() - dateA.getTime();
      });
    });
    
    // Clear review cases because they are processed
    setReviewCases([]); 
    setAppState(AppState.NOTEBOOK);
  };

  const handleDiscardReview = () => {
    setReviewCases([]); // Clear rejected cases
    setAppState(AppState.NOTEBOOK); // Go to notebook
  };

  const deleteNotebookCase = (index: number) => {
    setNotebookCases(prev => prev.filter((_, i) => i !== index));
  };

  // Logic to return from Notebook
  const handleBackFromNotebook = () => {
    // If we have pending review cases, go back to review
    if (reviewCases.length > 0) {
      setAppState(AppState.REVIEWING);
    } else {
      setAppState(AppState.IDLE);
    }
  };

  // Nav bar Notebook button click
  const handleOpenNotebook = () => {
    if (appState !== AppState.SEARCHING) {
      setAppState(AppState.NOTEBOOK);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header 
        notebookCount={notebookCases.length} 
        onOpenNotebook={handleOpenNotebook}
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
             existingCases={notebookCases}
             metadata={currentMetadata}
             onConfirm={handleConfirmReview}
             onDiscardAll={handleDiscardReview}
           />
        )}

        {appState === AppState.NOTEBOOK && (
           <Notebook 
             cases={notebookCases} 
             brandName={currentBrand}
             onDelete={deleteNotebookCase}
             onBack={handleBackFromNotebook}
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
        <p>© 2024 Co-Brand Hunter. Powered by Google Gemini 2.0 Flash.</p>
      </footer>
    </div>
  );
};

export default App;