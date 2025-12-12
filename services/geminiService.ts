
import { GoogleGenAI } from "@google/genai";
import { CobrandingCase, ResearchConfig, ResearchResult, GroundingMetadata } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey });

export const searchBrandCases = async (config: ResearchConfig): Promise<ResearchResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-2.5-flash";
  
  // Construct the strategy part of the prompt based on user input
  const strategySection = `
    TARGET BRAND: "${config.brandName}"
    
    CUSTOM SEARCH KEYWORDS (Must use these):
    ${config.keywords.map(k => `- "${k}"`).join('\n')}

    TARGET SOURCES/PLATFORMS:
    ${config.platforms.join(', ')}
  `;

  const prompt = `
    ${strategySection}
    
    OBJECTIVE:
    Conduct a DEEP and COMPREHENSIVE search for hardware co-branding/collaboration cases for this brand (Last 3-4 years).
    
    SEARCH EXECUTION:
    1. Use the provided keywords to search.
    2. PRIORITIZE searching within the specific requested domains/platforms if mentioned (e.g., zhihu.com, reddit.com).
    3. Look for "hidden gems" in social media discussions if requested.
    4. Verify details using multiple sources if possible.
    
    DATA EXTRACTION RULES:
    - **Partner Intro**: Who is the partner?
    - **Rights**: Detailed descriptions of customization.
    - **Source URLs**: Collect ALL relevant URLs (Official, News, Social) that verify this case.
    - **Language**: Output text in Chinese (Simplified).
    
    JSON Structure per item:
    {
      "projectName": "string (Project Overview)",
      "date": "string (YYYY.MM.DD - Strict Format)",
      "productName": "string (Hardware Model)",
      "partnerIntro": "string (Partner Description)",
      "rights": [
        { 
          "title": "string", 
          "description": "string" 
        }
      ],
      "insight": "string (Marketing Analysis)",
      "platformSource": "string (e.g. 'Reddit + Official' or 'Zhihu')",
      "sourceUrls": ["string (url1)", "string (url2)"] 
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        temperature: 0.1, 
        systemInstruction: "You are a rigorous Data Extraction Agent. Your output must be ONLY a valid JSON array containing the research results. Do not include markdown formatting. Do not include conversational text. If no results are found, output []. Ensure all JSON strings are properly escaped.",
      },
    });

    let jsonText = response.text || "[]";
    
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    } else {
      console.warn("No JSON structure found in response:", jsonText);
      return { cases: [] };
    }
    
    jsonText = jsonText.replace(/[\n\r]/g, " ");

    let cases = JSON.parse(jsonText) as CobrandingCase[];

    // Sort by Date Descending
    cases = cases.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-')); 
      const dateB = new Date(b.date.replace(/\./g, '-'));
      
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;

      return dateB.getTime() - dateA.getTime();
    });

    // Extract Grounding Metadata (Sources)
    // Cast to unknown first because SDK types might contain extra properties or minor mismatches (like optional vs required) that we've now aligned in types.ts but explicit casting ensures safety.
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata | undefined;

    return { cases, metadata: groundingMetadata };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
