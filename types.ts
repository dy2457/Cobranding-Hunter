
export interface CobrandingRight {
  title: string;
  description: string;
}

export interface CobrandingCase {
  projectName: string;
  date: string;
  productName: string;
  partnerIntro: string;
  rights: CobrandingRight[];
  insight: string;
  platformSource: string;
  sourceUrls: string[]; 
  imageUrl?: string; 
}

export interface TrendItem {
  ipName: string;
  category: string;
  reason: string;
  targetAudience: string;
  compatibility?: string;
}

export interface TrendConfig {
  topic: string;
  limit: number;
  timeScale: string;
  keywords: string[];
  platforms: string[];
}

// --- NEW TYPES FOR IP SCOUT & MATCHMAKER ---

export interface IPProfile {
  name: string;
  description: string;
  tags: string[];
  coreValues: string[];
  audienceDemographics: {
    ageRange: string;
    genderSplit: string; // e.g. "60% Female"
    keyInterests: string[];
  };
  commercialTier: 'S' | 'A' | 'B' | 'C'; // S = Global Blockbuster
  riskAssessment: string;
  pastCollabs: string[]; // List of names
}

export interface MatchConfig {
  brandName: string;
  industry: string;
  campaignGoal: string; // e.g. "Summer Campaign", "Product Launch"
  targetAudience?: string;
}

export interface MatchRecommendation {
  ipName: string;
  category: string;
  matchScore: number; // 0-100
  whyItWorks: string;
  campaignIdea: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface ResearchResult {
  cases: CobrandingCase[];
  metadata?: GroundingMetadata;
}

export interface TrendResult {
  trends: TrendItem[];
  metadata?: GroundingMetadata;
}

export interface ResearchConfig {
  brandName: string;
  keywords: string[];
  platforms: string[];
}

export type CollectionType = 'notebook' | 'report';

export interface NotebookData {
  id: string;
  type: CollectionType; // Distinguish between Case Notebooks and Trend Reports
  name: string;
  cases: CobrandingCase[];
  trends?: TrendItem[]; 
  createdAt: number;
  updatedAt: number;
}

// --- NEW TYPES FOR GRANULAR WORKFLOW ---

export interface ResearchPlan {
  topic: string;
  objective: string;
  searchQueries: string[];
  targetDomains: string[];
}

export interface ScanCandidate {
  name: string;
  context: string;
  selected?: boolean;
}

export interface ScanResult {
  candidates: ScanCandidate[];
  metadata?: GroundingMetadata;
}

export enum AppState {
  IDLE = 'IDLE',
  
  // Brand Workflow
  PLANNING = 'PLANNING', 
  SEARCHING = 'SEARCHING',
  REVIEWING = 'REVIEWING',
  
  // Single-shot Trend Workflow
  TREND_SEARCHING = 'TREND_SEARCHING',

  // Granular Trend Workflow
  FETCHING_PLAN = 'FETCHING_PLAN', 
  REVIEW_PLAN = 'REVIEW_PLAN',     
  EXECUTING_SCAN = 'EXECUTING_SCAN', 
  REVIEW_SCAN = 'REVIEW_SCAN',     
  GENERATING_REPORT = 'GENERATING_REPORT', 
  
  // New Features
  SCOUTING_IP = 'SCOUTING_IP',
  IP_PROFILE_READY = 'IP_PROFILE_READY',
  MATCHMAKING = 'MATCHMAKING',
  MATCH_RESULTS_READY = 'MATCH_RESULTS_READY',

  // Results & Notebooks
  TREND_RESULTS = 'TREND_RESULTS',
  NOTEBOOK_LIST = 'NOTEBOOK_LIST', 
  NOTEBOOK_DETAIL = 'NOTEBOOK_DETAIL',
  
  ERROR = 'ERROR'
}

// --- HELPERS ---

export const formatCaseToMarkdown = (data: CobrandingCase): string => {
  const rightsFormatted = data.rights
    .map((r, i) => `  ${i + 1}. ${r.title}：${r.description}`)
    .join('\n');

  const linksFormatted = data.sourceUrls && data.sourceUrls.length > 0 
    ? data.sourceUrls.map(url => `<${url}>`).join('\n') 
    : 'N/A';
  
  return `项目概述：${data.projectName}
项目时间：${data.date}
涉及产品：${data.productName}
合作品牌：${data.partnerIntro}
信息来源：${data.platformSource}
联名权益：
${rightsFormatted}
案例洞察：${data.insight}
参考链接：
${linksFormatted}`;
};
