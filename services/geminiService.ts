
import { GoogleGenAI } from "@google/genai";
import { CobrandingCase, ResearchConfig, ResearchResult, GroundingMetadata, TrendResult, TrendItem, TrendConfig, IPProfile, MatchConfig, MatchRecommendation, SocialPostResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";
const imageModelName = "gemini-2.5-flash-image"; // Nano Banana

// --- PROMPT GENERATORS (PUBLIC FOR TRANSPARENCY) ---

export const getBrandSearchPrompt = (config: ResearchConfig): string => {
  const strategySection = `
    TARGET BRAND: "${config.brandName}"
    CUSTOM SEARCH KEYWORDS: ${config.keywords.map(k => `"${k}"`).join(', ')}
    TARGET SOURCES: ${config.platforms.join(', ')}
  `;

  return `
    ${strategySection}
    OBJECTIVE: Deep search for co-branding cases (Last 5 years).
    DATA EXTRACTION RULES: Output strictly structured JSON.
    Language: Chinese (Simplified).
    
    CRITICAL FORMAT RULES: 
    - Return a single valid JSON Array [...].
    - Extract ALL required fields.
    - Output raw JSON only. Do not use Markdown code blocks.
    - Escape double quotes within strings.
    - Null Handling: If specific data (like Slogan or URL) is not found, use null (do not use "N/A" string).

    CONTENT GUIDELINES (HIGH PRIORITY):
    1. RIGHTS (联名权益): Must be COMPREHENSIVE and SPECIFIC.
       - Detail the physical changes to the product and packaging.
       - Example Format:
         * Title: "产品外壳" -> Description: "GO3S and Action Pod exterior printed with Doraemon theme color and character design."
         * Title: "包装设计" -> Description: "Custom gift box mimicking a time machine with 3D embossing."
         * Title: "周边配件" -> Description: "Includes limited edition magnet and stickers."
       - Avoid generic phrases like "Custom design". Be descriptive about colors, materials, and specific items.

    2. INSIGHT (案例洞察): Provide deep STRATEGIC analysis.
       - Analyze the Target Audience (e.g., "Anchoring parent-child scenarios", "Gen Z collectors").
       - Explain the Market Move (e.g., "Breaking the tech niche", "Leveraging emotional consumption").
       - Describe the Value (e.g., "Reach high purchasing power groups").
       - Avoid generic summaries.

    JSON Structure per item:
    {
      "projectName": "string (项目概述/名称)",
      "brandName": "string (发起品牌/主体品牌 - e.g. ${config.brandName})",
      "date": "string (项目时间 - YYYY.MM)",
      "productName": "string (涉及产品)",
      "partnerIntro": "string (合作品牌/IP)",
      "campaignSlogan": "string (Slogan or N/A)",
      "impactResult": "string (成效/热度 - Sales, Social Volume, or N/A)",
      "visualStyle": "string (视觉风格 - e.g. Retro, Cyberpunk, Minimalist)",
      "keyVisualUrl": "string (URL to main image if found, else null)",
      "rights": [{ "title": "string (e.g. 产品定制, 包装权益)", "description": "string (Specific details)" }],
      "insight": "string (Deep analysis of strategy, audience, and cultural relevance)",
      "platformSource": "string (信息来源)",
      "sourceUrls": ["string"]
    }
  `;
};

export const getTrendAnalysisPrompt = (config: TrendConfig): string => {
  return `
    TOPIC: "${config.topic}"
    TIME SCALE: "${config.timeScale}"
    REQUIRED COUNT: Identify top ${config.limit} items.
    CUSTOM CONTEXT/KEYWORDS: ${config.keywords.join(', ')}
    TARGET SOURCES/DOMAINS: ${config.platforms.join(', ')}

    TASK: Analyze current market trends to identify top co-branding opportunities, IPs, or brands related to this topic.
    
    DATA EXTRACTION RULES:
    - Determine "Momentum" (Emerging, Peaking, or Stabilizing).
    - Extract "Buzzwords" associated with this trend.
    - Output text in Chinese (Simplified).
    - Output raw JSON only. NO Markdown.
    - Escape internal quotes.
    - Ensure comma separation between array objects.

    JSON Structure per item:
    {
    "ipName": "string (Name of the IP)",
    "originCountry": "string",
    "category": "string (Gaming / Anime / Art / Celebrity)",
    "momentum": "Emerging | Peaking | Stabilizing",
    "commercialValue": "High | Medium | Niche",
    "buzzwords": ["string", "string"],
    "reason": "string (Why is this trending in 2025 specifically?)",
    "targetAudience": "string (e.g., Gen Z, High-Net-Worth Individuals)",
    "compatibility": ["string", "string"]
    }
  `;
};

export const getIPScoutPrompt = (ipName: string): string => {
  return `
    TARGET IP: "${ipName}"
    TASK: Generate a comprehensive commercial profile for this IP (Intellectual Property) focusing on co-branding potential.
    
    DATA GUIDELINES:
    1. FOCUS ON AESTHETICS: Identify specific visual elements (colors, textures, symbols) suitable for product design.
    2. FOCUS ON BUSINESS: Identify the actual licensor/rights holder and commercial tier.
    3. LANGUAGE: Keys in English, Values in Chinese (Simplified).

    OUTPUT FORMAT:
    - Single Raw JSON Object.
    - No Markdown code blocks.
    - Use \`null\` for missing data.

    JSON STRUCTURE:
    {
    "meta": {
      "ipName": "${ipName}",
      "rightsHolder": "string (e.g. Legendary Entertainment)",
      "originMedium": "string (e.g. Literature/Film)",
      "currentStatus": "Active | Dormant | Classic"
      },
    "commercialAnalysis": {
      "tier": "S", // S=Global Blockbuster, A=Regional/Niche Hit, B=Cult
      "marketMomentum": "Rising | Peaking | Stable | Declining",
      "coreAudience": {
        "primaryGen": "string (e.g. Gen Z & Millennials)",
        "psychographics": "string (e.g. Sci-Fi purists, Design lovers, Cinema buffs)",
        "genderSkew": "string"
      },
    "brandArchetype": "string (e.g. The Ruler, The Explorer, The Sage)",
    "riskFactors": ["string (e.g. High licensing cost)", "string (e.g. Complex lore)"]
    },
    "designElements": {
      "keyColors": ["string (e.g. Desert Ochre)", "string (e.g. Spice Blue)"],
      "iconography": ["string (e.g. Sandworm)", "string (e.g. House Atreides Hawk)"],
      "texturesAndMaterials": ["string (e.g. Matte Sand)", "string (e.g. Brutalist Metal)"],
      "signatureQuotes": ["string (e.g. Fear is the mind-killer)"]
    },
    "collabHistory": [
    {
      "time": "string (YYYY.MM)",
      "brand": "string",
      "product": "string",
      "marketEffect": "string (Sales/Buzz/Impact)",
      "link": "string (URL to official source/news or null)"
    }
  ],
  "strategicFit": {
    "bestIndustries": ["string (e.g. Tech)", "string (e.g. Luxury Fashion)"],
    "avoidIndustries": ["string (e.g. Kids Toys)"],
    "marketingHooks": "string (Key angle for selling, e.g. 'Epic Scale', 'Survival')"
  },
  "upcomingTimeline": [
    { "event": "string", "date": "string (YYYY.MM)" }
  ]
}
  
  SORT INSTRUCTION: Ensure "collabHistory" is strictly sorted by "time" in descending order (Latest to Oldest).
  `;
};

export const getMatchmakingPrompt = (config: MatchConfig): string => {
  return `
    MY BRAND CONTEXT:
    - Name: "${config.brandName}"
    - Industry: "${config.industry}"
    - Campaign Goal/Theme: "${config.campaignGoal}"
    - Target Audience: "${config.targetAudience || 'General'}"

    TASK:
    Act as a Creative Director. Recommend 5 specific IPs (Intellectual Properties) that are the BEST match for a co-branding collaboration.
    
    REQUIREMENTS:
    - Assess "Risk Factor" (Why might it fail?).
    - Estimate "Budget Level" ($, $$, $$$).
    - Provide a one-sentence "Campaign Idea".
    - LANGUAGE: Chinese (Simplified).
    - OUTPUT: Raw JSON Array. No Markdown.

    OUTPUT JSON STRUCTURE:
    [
      {
        "ipName": "Name of IP",
        "category": "e.g. Anime, Game",
        "matchScore": 95, // 0-100 Integer
        "whyItWorks": "Strategic rationale...",
        "campaignIdea": "One sentence creative concept...",
        "riskFactor": "Potential mismatch or controversy risk",
        "budgetLevel": "$ | $$ | $$$"
      }
    ]
  `;
};

// --- SOCIAL MEDIA POST GENERATION ---

export const generateSocialPostText = async (content: string): Promise<SocialPostResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    TASK: Create a viral Xiaohongshu (Little Red Book) social media post based on the following research content.
    
    CONTENT TO ADAPT:
    "${content.substring(0, 3000)}"

    REQUIREMENTS:
    1. TITLE: Click-bait style, using emojis, max 15 chars. (e.g. "‼️Exposed! The secret of...")
    2. CAPTION: 
       - Use "Xiaohongshu style" (lots of emojis, casual tone, bullet points).
       - Structure: Hook -> Key Highlights -> Professional Insight -> Call to Action.
       - Language: Chinese (Simplified).
       - Add 5-8 relevant hashtags at the bottom.
    
    OUTPUT FORMAT:
    JSON Object: { "title": "...", "content": "..." }
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.8
    }
  });

  return parseJsonResponse<SocialPostResult>(response.text);
};

export const generateSocialPostImage = async (summary: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  // Using 'gemini-2.5-flash-image' (Nano Banana)
  // Requesting a vertical 3:4 image
  // VI Color: #b5004a (Magenta)
  
  const prompt = `
    Design a high-quality, trendy social media poster background for a co-branding research report.
    
    VISUAL THEME:
    - Main Brand Color: #b5004a (Deep Magenta/Pink).
    - Style: Modern, Tech-Savvy, High-Fashion, Professional Infographic aesthetics.
    - Composition: Vertical (3:4). Leave some negative space for text overlay.
    - Content Abstract: ${summary.substring(0, 300)}
    - Atmosphere: "Insightful", "Premium", "Viral".
    - No text on image.
  `;

  const response = await ai.models.generateContent({
    model: imageModelName,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        // imageSize: "1K" // Optional, default is 1K
      }
    }
  });

  // Extract image from response
  // The output might contain image in inlineData
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  return ''; // Fallback
};

// --- API FUNCTIONS ---

// --- EXISTING BRAND SEARCH (Legacy/Brand Mode) ---
export const searchBrandCases = async (config: ResearchConfig, promptOverride?: string): Promise<ResearchResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = promptOverride || getBrandSearchPrompt(config);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        temperature: 0.1, 
        systemInstruction: "You are a rigorous Data Extraction Agent. Return ONLY valid JSON array. Ensure all objects in the array are separated by commas.",
      },
    });

    const cases = parseJsonResponse<CobrandingCase[]>(response.text);
    const sortedCases = cases.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-')); 
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return (isNaN(dateB.getTime()) ? 0 : dateB.getTime()) - (isNaN(dateA.getTime()) ? 0 : dateA.getTime());
    });

    return { cases: sortedCases, metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- SINGLE-SHOT TREND SEARCH (Used by App.tsx) ---
export const analyzeTrends = async (config: TrendConfig, promptOverride?: string): Promise<TrendResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = promptOverride || getTrendAnalysisPrompt(config);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.4,
      systemInstruction: "You are a Trend Analyst. Return ONLY a valid JSON array of objects. Ensure comma separation."
    }
  });

  const trends = parseJsonResponse<TrendItem[]>(response.text);
  return { trends, metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata };
};

// --- IP SCOUT (DEEP DIVE) ---
export const generateIPProfile = async (ipName: string, promptOverride?: string): Promise<{ profile: IPProfile, metadata?: GroundingMetadata }> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = promptOverride || getIPScoutPrompt(ipName);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
      systemInstruction: "You are a Commercial IP Analyst. Return ONLY valid JSON matching the structure."
    }
  });

  const profile = parseJsonResponse<IPProfile>(response.text);
  return { profile, metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata };
};

// --- MATCHMAKER ---
export const matchmakeIPs = async (config: MatchConfig, promptOverride?: string): Promise<{ recommendations: MatchRecommendation[], metadata?: GroundingMetadata }> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = promptOverride || getMatchmakingPrompt(config);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
      systemInstruction: "You are a Creative Strategy Director. Return ONLY valid JSON array."
    }
  });

  const recommendations = parseJsonResponse<MatchRecommendation[]>(response.text);
  return { recommendations, metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata };
};

// --- HELPER FUNCTIONS (REMAIN UNCHANGED) ---

export const generateSmartIPList = async (query: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    USER QUERY: "${query}"
    TASK: Generate a list of 20-30 specific IP Names, Popular Characters, or Cultural Entities that match the user's request for potential co-branding targets.
    
    Example input: "Most famous JP anime"
    Example output: ["One Piece", "Naruto", "Dragon Ball", ...]

    OUTPUT: Return ONLY a raw JSON array of strings. No extra text.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });

  return parseJsonResponse<string[]>(response.text);
};

export const generateSmartBrandList = async (query: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    USER QUERY: "${query}"
    TASK: Generate a list of 20-30 specific Brand Names that match the user's request. Focus on commercial brands.
    
    Example input: "Top Chinese EV makers"
    Example output: ["BYD", "NIO", "XPeng", "Xiaomi Auto", ...]

    OUTPUT: Return ONLY a raw JSON array of strings. No extra text.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });

  return parseJsonResponse<string[]>(response.text);
};

export const generateSmartTrendTopics = async (query: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    USER QUERY: "${query}"
    TASK: Generate a list of 10-15 specific, high-value "IP (Intellectual Property) & Co-branding" Research Topics based on the user's broad interest.
    Focus on identifying trending Characters, Anime, Games, Movies, Art, or Cultural Icons that would be suitable for co-branding in this sector.
    
    Example input: "Food"
    Example output: ["Trending Anime IPs for Snack Packaging 2025", "Nostalgic Gaming Characters for Energy Drinks", "Viral Mascot IPs for Fast Food Collabs", "Top Art IPs for Coffee Brands"]

    OUTPUT: Return ONLY a raw JSON array of strings. No extra text.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });

  return parseJsonResponse<string[]>(response.text);
};

// Helper to reliably parse JSON from LLM output
function parseJsonResponse<T>(text?: string): T {
  if (!text) return [] as T;

  // 1. Strip Markdown Code Blocks
  let cleanText = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  // 2. Locate JSON bounds (find the outer-most structure)
  const firstOpenBrace = cleanText.indexOf('{');
  const firstOpenBracket = cleanText.indexOf('[');
  const lastCloseBrace = cleanText.lastIndexOf('}');
  const lastCloseBracket = cleanText.lastIndexOf(']');
  
  let startIndex = -1;
  let endIndex = -1;

  // Determine if it looks like an object or array and find start/end
  if (firstOpenBracket !== -1 && (firstOpenBrace === -1 || firstOpenBracket < firstOpenBrace)) {
    startIndex = firstOpenBracket;
    endIndex = lastCloseBracket + 1;
  } else if (firstOpenBrace !== -1) {
    startIndex = firstOpenBrace;
    endIndex = lastCloseBrace + 1;
  }

  if (startIndex !== -1 && endIndex > startIndex) {
    cleanText = cleanText.substring(startIndex, endIndex);
  }

  // 3. Attempt Parsing
  try {
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.warn("JSON Parse failed on first attempt. Trying to fix...");
    console.debug("Failed text snippet:", cleanText.substring(0, 100) + "...");

    // Attempt fixes
    try {
       // Fix 1: Add missing commas between objects } { -> }, {
       cleanText = cleanText.replace(/}\s*{/g, "},{");
       
       // Fix 2: Remove comments (// style and /* style)
       cleanText = cleanText.replace(/\/\/.*$/gm, ""); // Line comments
       cleanText = cleanText.replace(/\/\*[\s\S]*?\*\//g, ""); // Block comments

       // Fix 3: Remove trailing commas before closing brackets/braces
       cleanText = cleanText.replace(/,\s*([\]}])/g, '$1');
       
       return JSON.parse(cleanText) as T;
    } catch (e2) {
       console.error("JSON Fix failed", e2);
       // Return empty array as fallback if we expect an array-like structure failure
       return [] as unknown as T;
    }
  }
}
