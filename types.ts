
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
  imageUrl?: string; // Kept as optional for compatibility, but deprecated
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

export interface ResearchConfig {
  brandName: string;
  keywords: string[];
  platforms: string[];
}

export interface NotebookData {
  id: string;
  name: string;
  cases: CobrandingCase[];
  createdAt: number;
  updatedAt: number;
}

export enum AppState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING', 
  SEARCHING = 'SEARCHING',
  REVIEWING = 'REVIEWING',
  NOTEBOOK_LIST = 'NOTEBOOK_LIST', // New state for managing notebooks
  NOTEBOOK_DETAIL = 'NOTEBOOK_DETAIL', // Viewing a specific notebook
  ERROR = 'ERROR'
}

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

export const exportNotebookToMarkdown = (notebook: NotebookData) => {
  const header = `# Co-Branding Research Report: ${notebook.name}\nGenerated on ${new Date().toLocaleDateString()}\n\n---\n\n`;
  const content = notebook.cases.map((c, i) => `## Case ${i + 1}: ${c.projectName}\n\n${formatCaseToMarkdown(c)}`).join('\n\n---\n\n');
  return header + content;
};