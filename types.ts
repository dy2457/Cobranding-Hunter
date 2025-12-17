
export interface CobrandingRight {
  title: string;
  description: string;
}

export interface CobrandingCase {
  projectName: string;      // 项目概述/名称
  brandName: string;        // 发起品牌/主体品牌 (NEW)
  date: string;             // 项目时间
  productName: string;      // 涉及产品
  partnerIntro: string;     // 合作品牌
  campaignSlogan?: string;  // Slogan
  impactResult?: string;    // 成效/热度
  visualStyle?: string;     // 视觉风格
  keyVisualUrl?: string;    // 参考图 (Direct URL)
  rights: CobrandingRight[];// 联名权益
  insight: string;          // 案例洞察
  platformSource: string;   // 信息来源
  sourceUrls: string[]; 
}

export interface TrendItem {
  ipName: string;
  originCountry?: string; // New field
  category: string;
  momentum?: 'Emerging' | 'Peaking' | 'Stabilizing';
  commercialValue?: 'High' | 'Medium' | 'Niche'; // New field
  buzzwords?: string[];
  reason: string;
  targetAudience: string;
  compatibility?: string[]; // Changed to string array
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
  meta: {
    ipName: string; // Changed from name to ipName
    rightsHolder: string;
    originMedium: string;
    currentStatus: 'Active' | 'Dormant' | 'Classic';
  };
  commercialAnalysis: {
    tier: 'S' | 'A' | 'B' | 'C';
    marketMomentum: 'Rising' | 'Peaking' | 'Stable' | 'Declining';
    coreAudience: {
      primaryGen: string;
      psychographics: string;
      genderSkew: string;
    };
    brandArchetype: string;
    riskFactors: string[];
  };
  designElements: {
    keyColors: string[];
    iconography: string[];
    texturesAndMaterials: string[];
    signatureQuotes: string[];
  };
  collabHistory: {
    brand: string;
    product: string;     // Changed from productCategory
    time: string;        // New field
    marketEffect: string;// New field replacing successLevel/description
    link?: string;       // New field for resource link
  }[];
  strategicFit: {
    bestIndustries: string[];
    avoidIndustries: string[];
    marketingHooks: string;
  };
  upcomingTimeline: {
    event: string;
    date: string;
  }[];
}

export interface MatchConfig {
  brandName: string;
  industry: string;
  campaignGoal: string;
  targetAudience?: string;
}

export interface MatchRecommendation {
  ipName: string;
  category: string;
  matchScore: number;
  whyItWorks: string;
  campaignIdea: string;
  riskFactor?: string;
  budgetLevel?: '$' | '$$' | '$$$';
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
  type: CollectionType;
  name: string;
  cases: CobrandingCase[];
  trends?: TrendItem[]; 
  createdAt: number;
  updatedAt: number;
}

export interface SocialPostResult {
  title: string;
  content: string;
  imageUrl?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING', 
  SEARCHING = 'SEARCHING',
  REVIEWING = 'REVIEWING',
  TREND_SEARCHING = 'TREND_SEARCHING',
  SCOUTING_IP = 'SCOUTING_IP',
  IP_PROFILE_READY = 'IP_PROFILE_READY',
  MATCHMAKING = 'MATCHMAKING',
  MATCH_RESULTS_READY = 'MATCH_RESULTS_READY',
  TREND_RESULTS = 'TREND_RESULTS',
  NOTEBOOK_LIST = 'NOTEBOOK_LIST', 
  NOTEBOOK_DETAIL = 'NOTEBOOK_DETAIL',
  ERROR = 'ERROR'
}

// --- HELPERS ---

export const formatCaseToPlainText = (data: CobrandingCase): string => {
  const rightsFormatted = data.rights
    .map((r, i) => `  ${i + 1}. ${r.title}：${r.description}`)
    .join('\n');

  const linksFormatted = data.sourceUrls && data.sourceUrls.length > 0 
    ? data.sourceUrls.join('\n') 
    : 'N/A';
  
  // Google Image Search Link
  const googleImgLink = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(data.projectName + ' ' + data.brandName + ' ' + data.partnerIntro + ' official')}`;

  return `项目概述：${data.projectName}
项目时间：${data.date}
发起品牌：${data.brandName}
合作品牌：${data.partnerIntro}
涉及产品：${data.productName}
视觉风格：${data.visualStyle || 'N/A'}
Slogan：${data.campaignSlogan || 'N/A'}
成效/热度：${data.impactResult || 'N/A'}
信息来源：${data.platformSource}
参考图库：${googleImgLink}
${data.keyVisualUrl ? `Key Visual: ${data.keyVisualUrl}` : ''}

联名权益：
${rightsFormatted}

案例洞察：
${data.insight}

原始链接：
${linksFormatted}`;
};

export const formatCaseToMarkdown = (data: CobrandingCase): string => {
  const rightsFormatted = data.rights
    .map((r, i) => `  ${i + 1}. ${r.title}：${r.description}`)
    .join('\n');

  const linksFormatted = data.sourceUrls && data.sourceUrls.length > 0 
    ? data.sourceUrls.map(url => `<${url}>`).join('\n') 
    : 'N/A';
  
  const googleImgLink = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(data.projectName + ' ' + data.brandName + ' ' + data.partnerIntro + ' official')}`;

  return `### ${data.projectName}
- **项目时间**：${data.date}
- **发起品牌**：${data.brandName}
- **合作品牌**：${data.partnerIntro}
- **涉及产品**：${data.productName}
- **视觉风格**：${data.visualStyle || 'N/A'}
- **Slogan**：${data.campaignSlogan || 'N/A'}
- **成效/热度**：${data.impactResult || 'N/A'}
- **信息来源**：${data.platformSource}
- **参考图库**：<${googleImgLink}>
${data.keyVisualUrl ? `- **Key Visual**: <${data.keyVisualUrl}>` : ''}

**联名权益**：
${rightsFormatted}

**案例洞察**：
${data.insight}

**原始链接**：
${linksFormatted}`;
};

// --- EXPORT GENERATORS ---

export const generateNotebookMarkdown = (notebook: NotebookData): string => {
  let md = `# ${notebook.name}\nGenerated by Co-Brand Hunter on ${new Date().toLocaleDateString()}\n\n`;
  
  if (notebook.trends && notebook.trends.length > 0) {
    md += `## 📈 Trend Report\n\n`;
    notebook.trends.forEach((t, i) => {
      md += `### ${i+1}. ${t.ipName} (${t.category})\n`;
      if (t.originCountry) md += `**Origin:** ${t.originCountry}\n`;
      md += `**Momentum:** ${t.momentum || 'N/A'}\n`;
      if (t.commercialValue) md += `**Value Tier:** ${t.commercialValue}\n`;
      md += `**Reasoning:** ${t.reason}\n\n`;
      md += `**Buzzwords:** ${t.buzzwords?.join(', ') || 'N/A'}\n\n`;
      md += `**Target Audience:** ${t.targetAudience}\n\n`;
      const compat = Array.isArray(t.compatibility) ? t.compatibility.join(', ') : t.compatibility;
      md += `**Compatibility:** ${compat}\n\n---\n\n`;
    });
  }

  if (notebook.cases && notebook.cases.length > 0) {
    md += `## 📚 Case Studies\n\n`;
    notebook.cases.forEach((c, i) => {
      md += formatCaseToMarkdown(c);
      md += `\n\n---\n\n`;
    });
  }
  return md;
};

export const generateNotebookHtml = (notebook: NotebookData): string => {
  const style = `
    <style>
      body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
      h1 { color: #2E1065; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
      h2 { color: #4C1D95; margin-top: 40px; background: #F3F4F6; padding: 12px; border-radius: 8px; }
      h3 { color: #000; margin-bottom: 5px; margin-top: 30px; border-left: 5px solid #6366F1; padding-left: 10px; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #FAFAFA; padding: 15px; border-radius: 8px; border: 1px solid #EEE; margin-bottom: 15px; }
      .meta-item { font-size: 0.9em; }
      .meta-label { font-weight: bold; color: #666; }
      .insight { background: #F5F3FF; padding: 20px; border-radius: 8px; margin: 15px 0; }
      ul { padding-left: 20px; }
      li { margin-bottom: 5px; }
      a { color: #2563EB; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .kv-img { max-width: 100%; border-radius: 8px; margin: 10px 0; border: 1px solid #eee; }
    </style>
  `;

  let html = `<html><head><meta charset="utf-8">${style}</head><body>`;
  html += `<h1>${notebook.name}</h1>`;
  html += `<p class="meta">Generated on ${new Date().toLocaleDateString()}</p>`;

  if (notebook.trends && notebook.trends.length > 0) {
    html += `<h2>Trend Report</h2>`;
    notebook.trends.forEach((t, i) => {
      html += `<h3>${i+1}. ${t.ipName} <span style="background:#eee;padding:2px 6px;border-radius:4px;font-size:0.8em;">${t.category}</span></h3>`;
      if (t.originCountry) html += `<p><strong>Origin:</strong> ${t.originCountry}</p>`;
      html += `<p><strong>Momentum:</strong> ${t.momentum || '-'}</p>`;
      if (t.commercialValue) html += `<p><strong>Value Tier:</strong> ${t.commercialValue}</p>`;
      html += `<p><strong>Why:</strong> ${t.reason}</p>`;
      html += `<p><strong>Keywords:</strong> ${t.buzzwords?.join(', ')}</p>`;
      html += `<p><strong>Audience:</strong> ${t.targetAudience}</p>`;
      const compat = Array.isArray(t.compatibility) ? t.compatibility.join(', ') : t.compatibility;
      html += `<p><strong>Compatibility:</strong> ${compat}</p><hr/>`;
    });
  }

  if (notebook.cases && notebook.cases.length > 0) {
    html += `<h2>Case Studies</h2>`;
    notebook.cases.forEach((c, i) => {
      const googleImgLink = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(c.projectName + ' ' + c.brandName + ' ' + c.partnerIntro)}`;
      
      html += `<h3>${c.projectName}</h3>`;
      html += `<div class="meta-grid">
        <div class="meta-item"><span class="meta-label">项目时间:</span> ${c.date}</div>
        <div class="meta-item"><span class="meta-label">发起品牌:</span> ${c.brandName}</div>
        <div class="meta-item"><span class="meta-label">合作品牌:</span> ${c.partnerIntro}</div>
        <div class="meta-item"><span class="meta-label">涉及产品:</span> ${c.productName}</div>
        <div class="meta-item"><span class="meta-label">视觉风格:</span> ${c.visualStyle || 'N/A'}</div>
        <div class="meta-item"><span class="meta-label">成效/热度:</span> ${c.impactResult || 'N/A'}</div>
      </div>`;
      
      if (c.campaignSlogan) html += `<p><strong>Slogan:</strong> "${c.campaignSlogan}"</p>`;
      
      if (c.keyVisualUrl && c.keyVisualUrl !== 'N/A') {
        html += `<img src="${c.keyVisualUrl}" alt="Key Visual" class="kv-img"/>`;
      }
      
      html += `<p><a href="${googleImgLink}" target="_blank">View Reference Images (Google) ↗</a></p>`;

      html += `<div class="insight"><strong>案例洞察:</strong> ${c.insight}</div>`;
      html += `<h4>联名权益:</h4><ul>`;
      c.rights.forEach(r => html += `<li><strong>${r.title}:</strong> ${r.description}</li>`);
      html += `</ul><br/>`;
    });
  }
  html += `</body></html>`;
  return html;
};

export const generateNotebookMindmap = (notebook: NotebookData): string => {
  let mm = `${notebook.name}\n`;
  if (notebook.cases && notebook.cases.length > 0) {
    mm += `Cases\n`;
    notebook.cases.forEach(c => {
      mm += `\t${c.projectName}\n`;
      mm += `\t\tBrand: ${c.brandName} x ${c.partnerIntro}\n`;
      mm += `\t\tProduct: ${c.productName}\n`;
      if (c.impactResult) mm += `\t\tImpact: ${c.impactResult}\n`;
      mm += `\t\tInsight: ${c.insight}\n`;
      mm += `\t\tRights\n`;
      c.rights.forEach(r => mm += `\t\t\t${r.title}\n`);
    });
  }
  return mm;
};
