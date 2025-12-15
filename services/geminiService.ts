import { GoogleGenAI } from "@google/genai";
import { CobrandingCase, ResearchConfig, ResearchResult, GroundingMetadata, TrendResult, TrendItem, ResearchPlan, ScanResult, ScanCandidate, TrendConfig, IPProfile, MatchConfig, MatchRecommendation } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";

// --- EXISTING BRAND SEARCH (Legacy/Brand Mode) ---
export const searchBrandCases = async (config: ResearchConfig): Promise<ResearchResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const strategySection = `
    TARGET BRAND: "${config.brandName}"
    CUSTOM SEARCH KEYWORDS: ${config.keywords.map(k => `"${k}"`).join(', ')}
    TARGET SOURCES: ${config.platforms.join(', ')}
  `;

  const prompt = `
    ${strategySection}
    OBJECTIVE: Deep search for co-branding cases (Last 3-4 years).
    DATA EXTRACTION RULES: Output strictly structured JSON.
    Language: Chinese (Simplified).
    
    JSON Structure per item:
    {
      "projectName": "string",
      "date": "string (YYYY.MM.DD)",
      "productName": "string",
      "partnerIntro": "string",
      "rights": [{ "title": "string", "description": "string" }],
      "insight": "string",
      "platformSource": "string",
      "sourceUrls": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        temperature: 0.1, 
        systemInstruction: "You are a rigorous Data Extraction Agent. Return ONLY valid JSON array.",
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
export const analyzeTrends = async (config: TrendConfig): Promise<TrendResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    TOPIC: "${config.topic}"
    TIME SCALE: "${config.timeScale}"
    REQUIRED COUNT: Identify top ${config.limit} items.
    CUSTOM CONTEXT/KEYWORDS: ${config.keywords.join(', ')}
    TARGET SOURCES/DOMAINS: ${config.platforms.join(', ')}

    TASK: Analyze current market trends to identify top co-branding opportunities, IPs, or brands related to this topic within the specified time scale and sources.
    
    DATA EXTRACTION RULES:
    - Identify specific entities (IPs, Brands, or Cultural Phenomena).
    - Provide clear reasoning for why they are trending.
    - Output text in Chinese (Simplified).
    - Output strictly structured JSON.

    JSON Structure per item:
    {
      "ipName": "string",
      "category": "string",
      "reason": "string",
      "targetAudience": "string",
      "compatibility": "string"
    }
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.4,
      systemInstruction: "You are a Trend Analyst. Return ONLY a valid JSON array of objects."
    }
  });

  const trends = parseJsonResponse<TrendItem[]>(response.text);
  return { trends, metadata: response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata };
};

// --- IP SCOUT (DEEP DIVE) ---
export const generateIPProfile = async (ipName: string): Promise<{ profile: IPProfile, metadata?: GroundingMetadata }> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    TARGET IP: "${ipName}"
    TASK: Generate a comprehensive commercial profile for this IP (Intellectual Property) focusing on its co-branding potential.
    LANGUAGE: English for Keys, Chinese (Simplified) for Content.

    OUTPUT JSON STRUCTURE:
    {
      "name": "${ipName}",
      "description": "Brief summary of the IP origin and status",
      "tags": ["Tag1", "Tag2"],
      "coreValues": ["Value1", "Value2"],
      "audienceDemographics": {
        "ageRange": "e.g. 18-35",
        "genderSplit": "e.g. 60% Female",
        "keyInterests": ["Interest1", "Interest2"]
      },
      "commercialTier": "S", // Enum: S, A, B, C (S is Global Blockbuster)
      "riskAssessment": "Potential risks (e.g. niche audience, expensive rights)",
      "pastCollabs": ["Brand1", "Brand2"]
    }
  `;

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
export const matchmakeIPs = async (config: MatchConfig): Promise<{ recommendations: MatchRecommendation[], metadata?: GroundingMetadata }> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const prompt = `
    MY BRAND CONTEXT:
    - Name: "${config.brandName}"
    - Industry: "${config.industry}"
    - Campaign Goal/Theme: "${config.campaignGoal}"
    - Target Audience: "${config.targetAudience || 'General'}"

    TASK:
    Act as a Creative Director. Recommend 5 specific IPs (Intellectual Properties - Anime, Games, Art, Characters, Lifestyle Brands) that are the BEST match for a co-branding collaboration with my brand.
    Focus on "Chemistry" and "Commercial Impact".
    LANGUAGE: Chinese (Simplified).

    OUTPUT JSON STRUCTURE:
    [
      {
        "ipName": "Name of IP",
        "category": "e.g. Anime, Game",
        "matchScore": 95, // 0-100 Integer
        "whyItWorks": "Strategic rationale...",
        "campaignIdea": "One sentence creative concept..."
      }
    ]
  `;

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

// --- HELPER FUNCTIONS ---

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

  let cleanText = text;
  
  // Remove markdown
  const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) cleanText = codeBlockMatch[1];

  // Try to find array or object
  const jsonMatch = cleanText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    cleanText = jsonMatch[0];
  } 

  cleanText = cleanText.replace(/[\n\r\t]/g, " ");

  try {
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error("JSON Parse failed", e);
    // Basic fix attempt for trailing commas
    try {
      const fixedJson = cleanText.replace(/,\s*([\]}])/g, '$1');
      return JSON.parse(fixedJson) as T;
    } catch (e2) {
      console.error("JSON Fix failed", e2);
      return [] as T;
    }
  }
}