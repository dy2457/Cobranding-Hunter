
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

export enum AppState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING', 
  SEARCHING = 'SEARCHING',
  REVIEWING = 'REVIEWING', // New state for checking results before saving
  NOTEBOOK = 'NOTEBOOK',   // State for viewing saved cases
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

export const exportNotebookToMarkdown = (cases: CobrandingCase[], brandName: string) => {
  const header = `# Co-Branding Research Report: ${brandName}\nGenerated on ${new Date().toLocaleDateString()}\n\n---\n\n`;
  const content = cases.map((c, i) => `## Case ${i + 1}: ${c.projectName}\n\n${formatCaseToMarkdown(c)}`).join('\n\n---\n\n');
  return header + content;
};
