import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { LoadingState } from './components/LoadingState';
import { ReviewBoard } from './components/ReviewBoard';
import { Notebook } from './components/Notebook';
import { NotebookList } from './components/NotebookList';
import { TrendResultsView } from './components/TrendResultsView';
import { IPProfileView } from './components/IPProfileView';
import { MatchmakerView } from './components/MatchmakerView';
import { searchBrandCases, analyzeTrends, generateIPProfile, matchmakeIPs } from './services/geminiService';
import { AppState, CobrandingCase, ResearchConfig, GroundingMetadata, NotebookData, TrendItem, TrendConfig, CollectionType, IPProfile, MatchConfig, MatchRecommendation } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Data for the current search session (Review Stage)
  const [reviewCases, setReviewCases] = useState<CobrandingCase[]>([]);
  const [currentMetadata, setCurrentMetadata] = useState<GroundingMetadata | undefined>(undefined);
  
  // Data for Trend session
  const [trendTopic, setTrendTopic] = useState('');
  const [trendResults, setTrendResults] = useState<TrendItem[]>([]);

  // Data for Scout
  const [currentIPProfile, setCurrentIPProfile] = useState<IPProfile | null>(null);

  // Data for Matchmaker
  const [currentMatchConfig, setCurrentMatchConfig] = useState<MatchConfig | null>(null);
  const [matchRecommendations, setMatchRecommendations] = useState<MatchRecommendation[]>([]);

  // Notebooks Management - Initialize from LocalStorage with Migration
  const [notebooks, setNotebooks] = useState<NotebookData[]>(() => {
    try {
      const saved = localStorage.getItem('cb_notebooks');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Ensure 'type' exists
        return parsed.map((nb: any) => ({
          ...nb,
          type: nb.type || 'notebook'
        }));
      }
    } catch (e) {
      console.error("Failed to load notebooks from storage", e);
    }
    // Default fallback
    return [{ id: 'default', type: 'notebook', name: 'My First Notebook', cases: [], trends: [], createdAt: Date.now(), updatedAt: Date.now() }];
  });

  const [activeNotebookId, setActiveNotebookId] = useState<string>(() => {
    return localStorage.getItem('cb_active_notebook_id') || 'default';
  });
  
  const [error, setError] = useState<string | null>(null);

  // Set Document Title
  useEffect(() => {
    document.title = "Co-Brand Hunter";
  }, []);

  // Persistence Effect: Save notebooks whenever they change
  useEffect(() => {
    localStorage.setItem('cb_notebooks', JSON.stringify(notebooks));
  }, [notebooks]);

  // Persistence Effect: Save active ID
  useEffect(() => {
    localStorage.setItem('cb_active_notebook_id', activeNotebookId);
  }, [activeNotebookId]);

  // Safeguard Effect: Prevent accidental close during critical states
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if searching or reviewing (unsaved temporary data)
      if (appState === AppState.SEARCHING || appState === AppState.REVIEWING) {
        e.preventDefault();
        e.returnValue = ''; // Standard for modern browsers
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [appState]);

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

  const handleStartTrendAnalysis = useCallback(async (config: TrendConfig) => {
    setAppState(AppState.TREND_SEARCHING);
    setError(null);
    setTrendTopic(config.topic);
    
    try {
      const result = await analyzeTrends(config);
      setTrendResults(result.trends);
      setCurrentMetadata(result.metadata);
      setAppState(AppState.TREND_RESULTS);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze trends. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleStartIPScout = useCallback(async (ipName: string) => {
    setAppState(AppState.SCOUTING_IP);
    setError(null);
    try {
      const result = await generateIPProfile(ipName);
      setCurrentIPProfile(result.profile);
      setAppState(AppState.IP_PROFILE_READY);
    } catch (err) {
      console.error(err);
      setError("Failed to scout IP. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleStartMatchmaking = useCallback(async (config: MatchConfig) => {
    setAppState(AppState.MATCHMAKING);
    setError(null);
    setCurrentMatchConfig(config);
    try {
      const result = await matchmakeIPs(config);
      setMatchRecommendations(result.recommendations);
      setAppState(AppState.MATCH_RESULTS_READY);
    } catch (err) {
      console.error(err);
      setError("Failed to find matches. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, []);

  // Bridge function: Deep research from Trend View
  const handleDeepResearchFromTrend = (brandName: string) => {
    // Construct a default config for the brand
    const config: ResearchConfig = {
      brandName: brandName,
      keywords: [`${brandName} cobranding`, `${brandName} collaboration`, `${brandName} 联名`],
      platforms: [
        "Google Search (google.com)",
        "Official Website/Press Rooms", 
        "Tech News (theverge.com, engadget.com)",
        "Social Media (instagram.com, twitter.com)",
        "Chinese Social (xiaohongshu.com, weibo.com)"
      ]
    };
    handleStartResearch(config);
  };

  // --- SAVING LOGIC ---

  // Save Cases -> To a Notebook (Type: 'notebook')
  const handleConfirmReview = (selected: CobrandingCase[]) => {
    // Check if active notebook is a 'notebook'
    let targetId = activeNotebookId;
    const active = notebooks.find(n => n.id === activeNotebookId);
    
    // If active is not a notebook (it's a report), or doesn't exist, find most recent notebook or create new
    if (!active || active.type !== 'notebook') {
      const existingNotebook = notebooks.find(n => n.type === 'notebook');
      if (existingNotebook) {
        targetId = existingNotebook.id;
      } else {
        // Create new notebook
        const newId = Date.now().toString();
        const newNotebook: NotebookData = {
          id: newId,
          type: 'notebook',
          name: 'My Case Studies',
          cases: [],
          trends: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setNotebooks(prev => [...prev, newNotebook]);
        targetId = newId;
      }
    }

    setNotebooks(prevNotebooks => prevNotebooks.map(nb => {
      if (nb.id === targetId) {
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
    
    setActiveNotebookId(targetId);
    setReviewCases([]); 
    setAppState(AppState.NOTEBOOK_DETAIL);
  };

  // Save Trends -> To a Report (Type: 'report')
  const handleSaveTrends = (selected: TrendItem[]) => {
    // Always create a new Report for a new Topic search for better organization
    const newId = Date.now().toString();
    const newReport: NotebookData = {
      id: newId,
      type: 'report',
      name: `Report: ${trendTopic}`,
      cases: [],
      trends: selected,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setNotebooks(prev => [...prev, newReport]);
    setActiveNotebookId(newId);
    setAppState(AppState.NOTEBOOK_DETAIL);
  };

  const handleDiscardReview = () => {
    setReviewCases([]); // Clear rejected cases
    setAppState(AppState.NOTEBOOK_DETAIL); // Go to notebook view
  };

  // --- MODIFICATION LOGIC ---

  const deleteNotebookCase = (index: number) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id === activeNotebookId) {
        return { ...nb, cases: nb.cases.filter((_, i) => i !== index), updatedAt: Date.now() };
      }
      return nb;
    }));
  };

  const deleteNotebookTrend = (index: number) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id === activeNotebookId && nb.trends) {
        return { ...nb, trends: nb.trends.filter((_, i) => i !== index), updatedAt: Date.now() };
      }
      return nb;
    }));
  };
  
  const handleRenameNotebook = (id: string, newName: string) => {
    setNotebooks(prev => prev.map(nb => {
      if (nb.id === id) {
        return { ...nb, name: newName, updatedAt: Date.now() };
      }
      return nb;
    }));
  };

  // --- NOTEBOOK MANAGEMENT ---

  const handleOpenNotebookList = () => {
    if (appState === AppState.IDLE || appState.includes('RESULTS') || appState.includes('PROFILE')) {
       setAppState(AppState.NOTEBOOK_LIST);
    }
  };

  const createNewNotebook = (type: CollectionType) => {
    const newId = Date.now().toString();
    const newNotebook: NotebookData = {
      id: newId,
      type: type,
      name: type === 'report' ? 'New Trend Report' : 'New Case Notebook',
      cases: [],
      trends: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotebooks([...notebooks, newNotebook]);
    setActiveNotebookId(newId); 
    setAppState(AppState.NOTEBOOK_DETAIL); 
  };

  const deleteNotebook = (id: string) => {
    if (notebooks.length <= 1) {
      alert("You must keep at least one item in your library.");
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
    <div className="min-h-screen flex flex-col relative text-slate-800">
      <Header 
        notebookCount={notebooks.length} 
        onOpenNotebook={handleOpenNotebookList}
        isSearching={appState === AppState.SEARCHING || appState === AppState.TREND_SEARCHING || appState === AppState.SCOUTING_IP || appState === AppState.MATCHMAKING}
      />
      
      <main className="flex-grow w-full px-4 md:px-6 relative z-10 pb-20">
        {appState === AppState.IDLE && (
          <SearchInput 
             onStartResearch={handleStartResearch} 
             onStartTrendAnalysis={handleStartTrendAnalysis}
             onStartIPScout={handleStartIPScout}
             onStartMatchmaking={handleStartMatchmaking}
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
             onSaveToNotebook={handleSaveTrends}
             onClose={() => setAppState(AppState.IDLE)}
           />
        )}

        {appState === AppState.IP_PROFILE_READY && currentIPProfile && (
           <IPProfileView 
             profile={currentIPProfile}
             onClose={() => setAppState(AppState.IDLE)}
           />
        )}

        {appState === AppState.MATCH_RESULTS_READY && currentMatchConfig && (
           <MatchmakerView 
             config={currentMatchConfig}
             recommendations={matchRecommendations}
             onClose={() => setAppState(AppState.IDLE)}
           />
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
             onRename={handleRenameNotebook}
             onDeleteCase={deleteNotebookCase}
             onDeleteTrend={deleteNotebookTrend}
             onBack={handleBackFromNotebookDetail}
             hasPendingReview={reviewCases.length > 0}
           />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto mt-20 p-8 glass-card rounded-3xl text-center animate-fade-in-up">
            <div className="text-4xl mb-4">😵‍💫</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops, Glitch in the Matrix</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button 
              onClick={() => setAppState(AppState.IDLE)}
              className="px-6 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform"
            >
              Try Again
            </button>
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