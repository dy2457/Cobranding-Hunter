
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "https://esm.sh/zod";
import { 
  CobrandingCase, 
  ResearchConfig, 
  ResearchResult, 
  GroundingMetadata, 
  TrendResult, 
  TrendItem, 
  TrendConfig, 
  IPProfile, 
  MatchConfig, 
  MatchRecommendation, 
  SocialPostResult 
} from "../types";

// Initialize GenAI with the recommended method
const API_KEY = (import.meta as any).env?.VITE_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });


// Model names per guidelines
const TEXT_MODEL = "gemini-3-pro-preview"; // Complex reasoning & data synthesis
const FAST_MODEL = "gemini-3-flash-preview"; // Fast generation
const IMAGE_MODEL = "gemini-2.5-flash-image"; 

// --- ZOD SCHEMAS FOR VALIDATION ---

export const CobrandingCaseSchema = z.object({
  projectName: z.string(),
  brandName: z.string(),
  industry: z.string().optional(),
  date: z.string(),
  productName: z.string(),
  partnerIntro: z.string(),
  campaignSlogan: z.string().nullable().optional(),
  impactResult: z.string().nullable().optional(),
  visualStyle: z.string().nullable().optional(),
  keyVisualUrl: z.string().nullable().optional(),
  rights: z.array(z.object({
    title: z.string(),
    description: z.string()
  })),
  insight: z.string(),
  platformSource: z.string(),
  sourceUrls: z.array(z.string())
});

const TrendItemSchema = z.object({
  ipName: z.string(),
  originCountry: z.string().optional(),
  category: z.string(),
  momentum: z.enum(['Emerging', 'Peaking', 'Stabilizing']).optional(),
  commercialValue: z.enum(['High', 'Medium', 'Niche']).optional(),
  buzzwords: z.array(z.string()).optional(),
  reason: z.string(),
  targetAudience: z.string(),
  compatibility: z.array(z.string()).optional()
});

const IPProfileSchema = z.object({
  meta: z.object({
    ipName: z.string(),
    rightsHolder: z.string(),
    originMedium: z.string(),
    currentStatus: z.enum(['Active', 'Dormant', 'Classic'])
  }),
  commercialAnalysis: z.object({
    tier: z.enum(['S', 'A', 'B', 'C']),
    marketMomentum: z.enum(['Rising', 'Peaking', 'Stable', 'Declining']),
    coreAudience: z.object({
      primaryGen: z.string(),
      psychographics: z.string(),
      genderSkew: z.string()
    }),
    brandArchetype: z.string(),
    riskFactors: z.array(z.string())
  }),
  designElements: z.object({
    keyColors: z.array(z.string()),
    iconography: z.array(z.string()),
    texturesAndMaterials: z.array(z.string()),
    signatureQuotes: z.array(z.string())
  }),
  collabHistory: z.array(z.object({
    brand: z.string(),
    product: z.string(),
    time: z.string(),
    marketEffect: z.string(),
    link: z.string().optional()
  })),
  strategicFit: z.object({
    bestIndustries: z.array(z.string()),
    avoidIndustries: z.array(z.string()),
    marketingHooks: z.string()
  }),
  upcomingTimeline: z.array(z.object({
    event: z.string(),
    date: z.string()
  }))
});

const MatchRecommendationSchema = z.object({
  ipName: z.string(),
  category: z.string(),
  matchScore: z.number(),
  whyItWorks: z.string(),
  campaignIdea: z.string(),
  riskFactor: z.string().optional(),
  budgetLevel: z.enum(['$', '$$', '$$$']).optional()
});

const SocialPostResultSchema = z.object({
  title: z.string(),
  content: z.string()
});

// --- GEMINI RESPONSE SCHEMAS (MAPS FROM ZOD/INTERFACES) ---

const COBRANDING_CASE_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      projectName: { type: Type.STRING },
      brandName: { type: Type.STRING },
      industry: { type: Type.STRING },
      date: { type: Type.STRING },
      productName: { type: Type.STRING },
      partnerIntro: { type: Type.STRING },
      campaignSlogan: { type: Type.STRING },
      impactResult: { type: Type.STRING },
      visualStyle: { type: Type.STRING },
      keyVisualUrl: { type: Type.STRING },
      rights: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      },
      insight: { type: Type.STRING },
      platformSource: { type: Type.STRING },
      sourceUrls: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["projectName", "brandName", "date", "productName", "partnerIntro", "rights", "insight", "platformSource", "sourceUrls"]
  }
};

const CASE_AUTOCOMPLETE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestedPatch: {
      type: Type.OBJECT,
      properties: {
        projectName: { type: Type.STRING },
        brandName: { type: Type.STRING },
        industry: { type: Type.STRING },
        date: { type: Type.STRING },
        productName: { type: Type.STRING },
        partnerIntro: { type: Type.STRING },
        campaignSlogan: { type: Type.STRING },
        impactResult: { type: Type.STRING },
        visualStyle: { type: Type.STRING },
        keyVisualUrl: { type: Type.STRING },
        rights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            }
          }
        },
        insight: { type: Type.STRING },
        platformSource: { type: Type.STRING },
        sourceUrls: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    confidence: {
      type: Type.OBJECT,
      properties: {
        projectName: { type: Type.NUMBER },
        brandName: { type: Type.NUMBER },
        industry: { type: Type.NUMBER },
        date: { type: Type.NUMBER },
        productName: { type: Type.NUMBER },
        partnerIntro: { type: Type.NUMBER },
        insight: { type: Type.NUMBER }
      }
    },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING }
        }
      }
    },
    warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["suggestedPatch"]
};

const TREND_ITEM_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      ipName: { type: Type.STRING },
      originCountry: { type: Type.STRING },
      category: { type: Type.STRING },
      momentum: { type: Type.STRING },
      commercialValue: { type: Type.STRING },
      buzzwords: { type: Type.ARRAY, items: { type: Type.STRING } },
      reason: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      compatibility: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["ipName", "category", "reason", "targetAudience"]
  }
};

const IP_PROFILE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        ipName: { type: Type.STRING },
        rightsHolder: { type: Type.STRING },
        originMedium: { type: Type.STRING },
        currentStatus: { type: Type.STRING }
      },
      required: ["ipName", "rightsHolder", "originMedium", "currentStatus"]
    },
    commercialAnalysis: {
      type: Type.OBJECT,
      properties: {
        tier: { type: Type.STRING },
        marketMomentum: { type: Type.STRING },
        coreAudience: {
          type: Type.OBJECT,
          properties: {
            primaryGen: { type: Type.STRING },
            psychographics: { type: Type.STRING },
            genderSkew: { type: Type.STRING }
          },
          required: ["primaryGen", "psychographics", "genderSkew"]
        },
        brandArchetype: { type: Type.STRING },
        riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["tier", "marketMomentum", "coreAudience", "brandArchetype", "riskFactors"]
    },
    designElements: {
      type: Type.OBJECT,
      properties: {
        keyColors: { type: Type.ARRAY, items: { type: Type.STRING } },
        iconography: { type: Type.ARRAY, items: { type: Type.STRING } },
        texturesAndMaterials: { type: Type.ARRAY, items: { type: Type.STRING } },
        signatureQuotes: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["keyColors", "iconography", "texturesAndMaterials", "signatureQuotes"]
    },
    collabHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING },
          product: { type: Type.STRING },
          time: { type: Type.STRING },
          marketEffect: { type: Type.STRING },
          link: { type: Type.STRING }
        },
        required: ["brand", "product", "time", "marketEffect"]
      }
    },
    strategicFit: {
      type: Type.OBJECT,
      properties: {
        bestIndustries: { type: Type.ARRAY, items: { type: Type.STRING } },
        avoidIndustries: { type: Type.ARRAY, items: { type: Type.STRING } },
        marketingHooks: { type: Type.STRING }
      },
      required: ["bestIndustries", "avoidIndustries", "marketingHooks"]
    },
    upcomingTimeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          event: { type: Type.STRING },
          date: { type: Type.STRING }
        },
        required: ["event", "date"]
      }
    }
  },
  required: ["meta", "commercialAnalysis", "designElements", "collabHistory", "strategicFit", "upcomingTimeline"]
};

const MATCH_RECOMMENDATION_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      ipName: { type: Type.STRING },
      category: { type: Type.STRING },
      matchScore: { type: Type.INTEGER },
      whyItWorks: { type: Type.STRING },
      campaignIdea: { type: Type.STRING },
      riskFactor: { type: Type.STRING },
      budgetLevel: { type: Type.STRING }
    },
    required: ["ipName", "category", "matchScore", "whyItWorks", "campaignIdea"]
  }
};

const SOCIAL_POST_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING }
  },
  required: ["title", "content"]
};

// --- HELPER: RETRY LOGIC ---
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`API call failed, retrying... (${retries} attempts left). Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// --- PROMPT GENERATORS (MANDATING CHINESE OUTPUT) ---

export const getBrandSearchPrompt = (config: ResearchConfig) => {
  return `请寻找 ${config.brandName} 的跨界联名/合作案例。重点关注硬件、数码和生活方式领域。
考虑的关键词：${config.keywords.join(', ')}。
检索范围：${config.platforms.join(', ')}。
**要求：所有返回的字段内容（如：项目名称、品牌名称、行业类别、视觉风格、Slogan、联名权益、案例洞察等）必须使用简体中文编写。**
需包含：项目名称、品牌、行业（如：科技、服饰、餐饮等）、时间、产品、合作伙伴简介、视觉风格、Slogan、成效、权益详情、战略洞察及来源链接。`;
};

export const getTrendAnalysisPrompt = (config: TrendConfig) => {
  return `请分析关于话题 "${config.topic}" 的联名及文化趋势。
时间范围：${config.timeScale}。
结果数量：${config.limit}个。
关键词：${config.keywords.join(', ')}。
**要求：所有返回的文本内容（如：流行原因、受众群体、趋势词、兼容性等）必须使用简体中文。**
重点关注势能（新兴、巅峰、稳定）、商业价值（高、中、小众）、受众画像及其与品牌的契合度。`;
};

export const getIPScoutPrompt = (ipName: string) => {
  return `请为知识产权 IP "${ipName}" 生成一份全面的商业百科档案。
**要求：除了 JSON 的键名外，所有生成的文本值（包括元数据、商业分析、设计元素、联名历史、战略契合度等）必须使用简体中文。**
包含：版权方信息、商业等级(Tier)、核心受众心理画像、品牌原型、设计元素（色盘、纹理、口号）、历史联名成效、未来大事件及营销钩子。`;
};

export const getMatchmakingPrompt = (config: MatchConfig) => {
  return `请为品牌 "${config.brandName}" 推荐最佳的 IP 联名合作伙伴。
所属行业：${config.industry}。
营销目标：${config.campaignGoal}。
目标受众：${config.targetAudience || '通用人群'}。
**要求：所有字段内容（如：推荐理由、创意切入点、风险提示等）必须使用简体中文编写。**
需包含：IP名称、类别、匹配得分(0-100)、战略理由、一个具体的创意活动想法、风险提示及预算等级($, $$, $$$)。`;
};

// --- API FUNCTIONS ---

export const searchBrandCases = async (config: ResearchConfig, promptOverride?: string): Promise<ResearchResult> => {
  const prompt = promptOverride || getBrandSearchPrompt(config);

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: COBRANDING_CASE_RESPONSE_SCHEMA,
        temperature: 0.1
      }
    });

    const parsed = JSON.parse(response.text);
    const validated = z.array(CobrandingCaseSchema).parse(parsed);

    return { 
      cases: validated as CobrandingCase[], 
      metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata 
    };
  });
};

export interface AutoCompleteResult {
  suggestedPatch: Partial<CobrandingCase>;
  confidence?: Record<string, number>;
  sources?: Array<{ title?: string; url: string }>;
  warnings?: string[];
}

export const generateCaseFromKeyword = async (
  keyword: string,
  existing?: Partial<CobrandingCase>
): Promise<AutoCompleteResult> => {
  const prompt = `你是一个专业的联名研究员。请通过搜索查询关于联名案例 "${keyword}" 的详细信息。
  目标是补全联名案例的数据。现有部分数据如下：${JSON.stringify(existing || {})}。
  
  **要求**：
  1. 所有文本字段必须使用简体中文。
  2. 只返回一个合法的 JSON 对象。
  3. ` + "`suggestedPatch`" + ` 包含补全的字段（包括 industry 行业类别）。不要编造不可信的时间或数据。
  4. 提供 ` + "`confidence`" + ` (0-1) 用于评估数据的可靠性。
  5. 必须引用检索到的 ` + "`sources`" + `。
  6. 如果存在歧义或不确定性，在 ` + "`warnings`" + ` 中说明。`;

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: CASE_AUTOCOMPLETE_RESPONSE_SCHEMA,
        temperature: 0.2
      }
    });

    const jsonStr = response.text.trim();
    // Use a try-catch and regex to ensure we get valid JSON if model wraps it in markdown
    const cleanedJson = jsonStr.replace(/^```json\n|```$/g, '');
    const parsed = JSON.parse(cleanedJson);

    return parsed as AutoCompleteResult;
  });
};

export const analyzeTrends = async (config: TrendConfig, promptOverride?: string): Promise<TrendResult> => {
  const prompt = promptOverride || getTrendAnalysisPrompt(config);

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: TREND_ITEM_RESPONSE_SCHEMA,
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(response.text);
    const validated = z.array(TrendItemSchema).parse(parsed);

    return { 
      trends: validated as TrendItem[], 
      metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata 
    };
  });
};

export const generateIPProfile = async (ipName: string, promptOverride?: string): Promise<{ profile: IPProfile, metadata?: GroundingMetadata }> => {
  const prompt = promptOverride || getIPScoutPrompt(ipName);

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: IP_PROFILE_RESPONSE_SCHEMA,
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text);
    const validated = IPProfileSchema.parse(parsed);

    return { 
      profile: validated as IPProfile, 
      metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata 
    };
  });
};

export const matchmakeIPs = async (config: MatchConfig, promptOverride?: string): Promise<{ recommendations: MatchRecommendation[], metadata?: GroundingMetadata }> => {
  const prompt = promptOverride || getMatchmakingPrompt(config);

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: MATCH_RECOMMENDATION_RESPONSE_SCHEMA,
        temperature: 0.7
      }
    });

    const parsed = JSON.parse(response.text);
    const validated = z.array(MatchRecommendationSchema).parse(parsed);

    return { 
      recommendations: validated as MatchRecommendation[], 
      metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata 
    };
  });
};

export const generateSocialPostText = async (content: string): Promise<SocialPostResult> => {
  const prompt = `请将以下调研内容改编成一篇适合在小红书(Xiaohongshu)上发布的爆款笔记：
内容：${content.substring(0, 3000)}
**要求：语气要专业、有洞察力且带有个人博主风格。必须使用简体中文。**`;

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: SOCIAL_POST_RESPONSE_SCHEMA,
        temperature: 0.7
      }
    });

    const parsed = JSON.parse(response.text);
    const validated = SocialPostResultSchema.parse(parsed);

    return validated as SocialPostResult;
  });
};

export const generateSocialPostImage = async (summary: string): Promise<string> => {
  const prompt = `Poster background for co-branding report. Theme: #b5004a. Content: ${summary.substring(0, 300)}. No text. High aesthetic quality.`;

  return await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        imageConfig: { aspectRatio: "3:4" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return '';
  });
};

// --- QUICK GENERATORS ---

export const generateSmartIPList = async (query: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: [{ role: 'user', parts: [{ text: `根据查询 "${query}" 列出 20 个相关的 IP 名字。**要求：使用简体中文编写 IP 名字。** 格式为 JSON 字符串数组。` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      temperature: 0.7
    }
  });
  return JSON.parse(response.text);
};

export const generateSmartBrandList = async (query: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: [{ role: 'user', parts: [{ text: `根据查询 "${query}" 列出 20 个相关的品牌名称。**要求：使用简体中文编写品牌名称。** 格式为 JSON 字符串数组。` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      temperature: 0.7
    }
  });
  return JSON.parse(response.text);
};

export const generateSmartTrendTopics = async (query: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: [{ role: 'user', parts: [{ text: `根据查询 "${query}" 列出 10 个具体的高价值趋势研究话题。**要求：使用简体中文编写话题。** 格式为 JSON 字符串数组。` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      temperature: 0.7
    }
  });
  return JSON.parse(response.text);
};
