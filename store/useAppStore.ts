
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AppState, 
  CobrandingCase, 
  NotebookData, 
  TrendItem, 
  IPProfile, 
  MatchConfig, 
  MatchRecommendation, 
  GroundingMetadata,
  ResearchConfig,
  TrendConfig,
  CollectionType
} from '../types';
import { 
  searchBrandCases, 
  analyzeTrends, 
  generateIPProfile, 
  matchmakeIPs 
} from '../services/geminiService';
import { indexedDBStorage } from '../services/storageService';

interface AppStore {
  // State
  appState: AppState;
  notebooks: NotebookData[];
  activeNotebookId: string;
  reviewCases: CobrandingCase[];
  currentMetadata: GroundingMetadata | undefined;
  trendTopic: string;
  trendResults: TrendItem[];
  currentIPProfile: IPProfile | null;
  currentMatchConfig: MatchConfig | null;
  matchRecommendations: MatchRecommendation[];
  error: string | null;

  // Actions
  setAppState: (state: AppState) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  
  // Research Actions
  startResearch: (config: ResearchConfig, prompt?: string) => Promise<void>;
  startTrendAnalysis: (config: TrendConfig, prompt?: string) => Promise<void>;
  startIPScout: (ipName: string, prompt?: string) => Promise<void>;
  startMatchmaking: (config: MatchConfig, prompt?: string) => Promise<void>;
  
  // Review Actions
  confirmReview: (selected: CobrandingCase[]) => void;
  discardReview: () => void;

  // Notebook Actions
  setActiveNotebookId: (id: string) => void;
  createNotebook: (type: CollectionType) => void;
  deleteNotebook: (id: string) => void;
  updateNotebook: (id: string, updates: Partial<NotebookData>) => void;
  reorderNotebookCases: (id: string, newCases: CobrandingCase[]) => void;
  addManualCase: (notebookId: string, manualCase: CobrandingCase) => void;
  deleteNotebookCase: (index: number) => void;
  deleteNotebookTrend: (index: number) => void;
  addReport: (topic: string, trends: TrendItem[]) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      appState: AppState.IDLE,
      notebooks: [{ id: 'default', type: 'notebook', name: 'My First Notebook', cases: [], trends: [], createdAt: Date.now(), updatedAt: Date.now() }],
      activeNotebookId: 'default',
      reviewCases: [],
      currentMetadata: undefined,
      trendTopic: '',
      trendResults: [],
      currentIPProfile: null,
      currentMatchConfig: null,
      matchRecommendations: [],
      error: null,

      setAppState: (appState) => set({ appState }),
      setError: (error) => set({ error }),
      resetSession: () => set({ 
        appState: AppState.IDLE, 
        reviewCases: [], 
        trendTopic: '', 
        trendResults: [], 
        currentIPProfile: null, 
        currentMatchConfig: null, 
        matchRecommendations: [], 
        error: null 
      }),

      setActiveNotebookId: (activeNotebookId) => set({ activeNotebookId }),

      startResearch: async (config, prompt) => {
        set({ appState: AppState.SEARCHING, error: null, reviewCases: [], currentMetadata: undefined });
        try {
          const result = await searchBrandCases(config, prompt);
          set({ reviewCases: result.cases, currentMetadata: result.metadata, appState: AppState.REVIEWING });
        } catch (err) {
          set({ error: "Failed to fetch cases. Please try again.", appState: AppState.ERROR });
        }
      },

      startTrendAnalysis: async (config, prompt) => {
        set({ appState: AppState.TREND_SEARCHING, error: null, trendTopic: config.topic, currentMetadata: undefined });
        try {
          const result = await analyzeTrends(config, prompt);
          set({ trendResults: result.trends, currentMetadata: result.metadata, appState: AppState.TREND_RESULTS });
        } catch (err) {
          set({ error: "Failed to analyze trends.", appState: AppState.ERROR });
        }
      },

      startIPScout: async (ipName, prompt) => {
        set({ appState: AppState.SCOUTING_IP, error: null, currentMetadata: undefined });
        try {
          const result = await generateIPProfile(ipName, prompt);
          set({ currentIPProfile: result.profile, currentMetadata: result.metadata, appState: AppState.IP_PROFILE_READY });
        } catch (err) {
          set({ error: "Failed to scout IP.", appState: AppState.ERROR });
        }
      },

      startMatchmaking: async (config, prompt) => {
        set({ appState: AppState.MATCHMAKING, error: null, currentMatchConfig: config });
        try {
          const result = await matchmakeIPs(config, prompt);
          set({ matchRecommendations: result.recommendations, appState: AppState.MATCH_RESULTS_READY });
        } catch (err) {
          set({ error: "Failed to find matches.", appState: AppState.ERROR });
        }
      },

      confirmReview: (selected) => {
        const { notebooks, activeNotebookId } = get();
        let targetId = activeNotebookId;
        const active = notebooks.find(n => n.id === activeNotebookId);
        
        let updatedNotebooks = [...notebooks];
        if (!active || active.type !== 'notebook') {
          const existingNotebook = notebooks.find(n => n.type === 'notebook');
          if (existingNotebook) {
            targetId = existingNotebook.id;
          } else {
            targetId = Date.now().toString();
            updatedNotebooks.push({ id: targetId, type: 'notebook', name: 'My Case Studies', cases: [], trends: [], createdAt: Date.now(), updatedAt: Date.now() });
          }
        }

        updatedNotebooks = updatedNotebooks.map(nb => {
          if (nb.id === targetId) {
            const combined = [...selected, ...nb.cases];
            return { ...nb, cases: combined, updatedAt: Date.now() };
          }
          return nb;
        });

        set({ notebooks: updatedNotebooks, activeNotebookId: targetId, reviewCases: [], appState: AppState.NOTEBOOK_DETAIL });
      },

      discardReview: () => set({ reviewCases: [], appState: AppState.NOTEBOOK_DETAIL }),

      createNotebook: (type) => {
        const id = Date.now().toString();
        const newNotebook = { id, type, name: type === 'report' ? 'New Trend Report' : 'New Case Notebook', cases: [], trends: [], createdAt: Date.now(), updatedAt: Date.now() };
        set(state => ({ notebooks: [...state.notebooks, newNotebook], activeNotebookId: id, appState: AppState.NOTEBOOK_DETAIL }));
      },

      deleteNotebook: (id) => set(state => {
        if (state.notebooks.length <= 1) return state;
        const filtered = state.notebooks.filter(n => n.id !== id);
        return { 
          notebooks: filtered, 
          activeNotebookId: state.activeNotebookId === id ? filtered[0].id : state.activeNotebookId 
        };
      }),

      updateNotebook: (id, updates) => set(state => ({
        notebooks: state.notebooks.map(nb => nb.id === id ? { ...nb, ...updates, updatedAt: Date.now() } : nb)
      })),

      reorderNotebookCases: (id, newCases) => set(state => ({
        notebooks: state.notebooks.map(nb => nb.id === id ? { ...nb, cases: newCases, updatedAt: Date.now() } : nb)
      })),

      addManualCase: (notebookId, manualCase) => set(state => ({
        notebooks: state.notebooks.map(nb => nb.id === notebookId ? { ...nb, cases: [manualCase, ...nb.cases], updatedAt: Date.now() } : nb)
      })),

      deleteNotebookCase: (index) => set(state => ({
        notebooks: state.notebooks.map(nb => nb.id === state.activeNotebookId ? { ...nb, cases: nb.cases.filter((_, i) => i !== index), updatedAt: Date.now() } : nb)
      })),

      deleteNotebookTrend: (index) => set(state => ({
        notebooks: state.notebooks.map(nb => nb.id === state.activeNotebookId ? { ...nb, trends: (nb.trends || []).filter((_, i) => i !== index), updatedAt: Date.now() } : nb)
      })),

      addReport: (topic, trends) => {
        const id = Date.now().toString();
        const newReport = { id, type: 'report' as CollectionType, name: `Report: ${topic}`, cases: [], trends, createdAt: Date.now(), updatedAt: Date.now() };
        set(state => ({ notebooks: [...state.notebooks, newReport], activeNotebookId: id, appState: AppState.NOTEBOOK_DETAIL }));
      }
    }),
    {
      name: 'cb-hunter-storage',
      // Using custom async IndexedDB storage
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({ 
        notebooks: state.notebooks, 
        activeNotebookId: state.activeNotebookId 
      }),
    }
  )
);
