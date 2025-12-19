
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { LoadingState } from './components/LoadingState';
import { ReviewBoard } from './components/ReviewBoard';
import { Notebook } from './components/Notebook';
import { NotebookList } from './components/NotebookList';
import { TrendResultsView } from './components/TrendResultsView';
import { IPProfileView } from './components/IPProfileView';
import { MatchmakerView } from './components/MatchmakerView';
import { useAppStore } from './store/useAppStore';
import { AppState, ResearchConfig } from './types';

const App: React.FC = () => {
  const {
    appState, setAppState,
    notebooks, activeNotebookId, setActiveNotebookId, createNotebook, deleteNotebook, updateNotebook,
    reorderNotebookCases,
    reviewCases, currentMetadata, confirmReview, discardReview,
    trendTopic, trendResults, startTrendAnalysis,
    currentIPProfile, startIPScout,
    currentMatchConfig, matchRecommendations, startMatchmaking,
    startResearch,
    resetSession,
    error,
    addReport,
    deleteNotebookCase,
    deleteNotebookTrend
  } = useAppStore();

  // Reactive hydration state
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 1. Check if hydration is already complete (for fast storage or cached state)
    if (useAppStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    // 2. Subscribe to the hydration finish event (crucial for async storage like IndexedDB)
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    document.title = "IP鲸选站";
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (appState === AppState.SEARCHING || appState === AppState.REVIEWING) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appState]);

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0];

  const handleDeepResearchFromTrend = (brandName: string) => {
    const config: ResearchConfig = {
      brandName: brandName,
      keywords: [`${brandName} cobranding`, `${brandName} collaboration`, `${brandName} 联名`],
      platforms: ["Google Search", "Official Sites", "Xiaohongshu"]
    };
    startResearch(config);
  };

  // While waiting for the store to hydrate from IndexedDB, show the restoration screen
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/40">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-12 h-12 rounded-2xl bg-[#b5004a] opacity-20"></div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">正在恢复您的灵感库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative text-slate-800">
      <Header 
        notebookCount={notebooks.length} 
        onOpenNotebook={() => setAppState(AppState.NOTEBOOK_LIST)}
        isSearching={appState.includes('SEARCHING') || appState === AppState.MATCHMAKING}
      />
      
      <main className="flex-grow w-full px-4 md:px-6 relative pb-20 pt-32">
        {appState === AppState.IDLE && (
          <SearchInput 
             onStartResearch={startResearch} 
             onStartTrendAnalysis={startTrendAnalysis}
             onStartIPScout={startIPScout}
             onStartMatchmaking={startMatchmaking}
             appState={appState} 
          />
        )}

        {(appState === AppState.SEARCHING || appState === AppState.TREND_SEARCHING || appState === AppState.SCOUTING_IP || appState === AppState.MATCHMAKING) && (
          <LoadingState />
        )}

        {appState === AppState.TREND_RESULTS && (
           <TrendResultsView 
             topic={trendTopic}
             trends={trendResults}
             metadata={currentMetadata}
             onAnalyzeBrand={handleDeepResearchFromTrend}
             // Fix: TrendResultsView expects a single argument (selectedTrends), but addReport needs both topic and trends
             onSaveToNotebook={(selectedTrends) => addReport(trendTopic, selectedTrends)}
             onClose={resetSession}
           />
        )}

        {appState === AppState.IP_PROFILE_READY && currentIPProfile && (
           <IPProfileView 
             profile={currentIPProfile}
             metadata={currentMetadata}
             onClose={resetSession}
           />
        )}

        {appState === AppState.MATCH_RESULTS_READY && currentMatchConfig && (
           <MatchmakerView 
             config={currentMatchConfig}
             recommendations={matchRecommendations}
             onClose={resetSession}
           />
        )}

        {appState === AppState.REVIEWING && (
           <ReviewBoard 
             newCases={reviewCases} 
             existingCases={activeNotebook.cases}
             metadata={currentMetadata}
             onConfirm={confirmReview}
             onDiscardAll={discardReview}
           />
        )}

        {appState === AppState.NOTEBOOK_LIST && (
           <NotebookList 
             notebooks={notebooks}
             onSelectNotebook={(id) => { setActiveNotebookId(id); setAppState(AppState.NOTEBOOK_DETAIL); }}
             onCreateNotebook={createNotebook}
             onDeleteNotebook={deleteNotebook}
             onClose={resetSession}
           />
        )}

        {appState === AppState.NOTEBOOK_DETAIL && (
           <Notebook 
             notebook={activeNotebook}
             onUpdate={updateNotebook}
             onReorderCases={(newCases) => reorderNotebookCases(activeNotebook.id, newCases)}
             onDeleteCase={deleteNotebookCase}
             onDeleteTrend={deleteNotebookTrend}
             onBack={() => setAppState(reviewCases.length > 0 ? AppState.REVIEWING : AppState.NOTEBOOK_LIST)}
             hasPendingReview={reviewCases.length > 0}
           />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-3xl text-center">
            <div className="text-4xl mb-4">😵‍💫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={resetSession} className="px-8 py-3 bg-black text-white rounded-full font-bold">Try Again</button>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-gray-400 text-xs font-medium">
        <p className="glass inline-block px-4 py-1 rounded-full">Powered by Gemini 2.0 Flash</p>
      </footer>
    </div>
  );
};

export default App;
