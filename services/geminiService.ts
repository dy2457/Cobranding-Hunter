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
    Conduct a DEEP and COMPREHENSIVE search for cross-industry co-branding/collaboration cases for this brand (Last 3-4 years).
    Scope includes: Consumer Electronics, Fashion/Apparel, Food & Beverage, Home/Lifestyle, Automotive, Art/Toys, and Collectibles.
    
    SEARCH EXECUTION:
    1. Use the provided keywords to search.
    2. PRIORITIZE searching within the specific requested domains/platforms if mentioned.
    3. Look for "hidden gems" in social media discussions if requested.
    4. Verify details using multiple sources if possible.
    
    DATA EXTRACTION RULES:
    - **Partner Intro**: Who is the partner? (Brand, Artist, IP, or Franchise)
    - **Rights**: Detailed descriptions of customization (Packaging, Product Design, Digital Content, Accessories).
    - **Source URLs**: Collect ALL relevant URLs (Official, News, Social) that verify this case.
    - **Language**: Output text in Chinese (Simplified).
    
    JSON Structure per item:
    {
      "projectName": "string (Project Overview)",
      "date": "string (YYYY.MM.DD - Strict Format)",
      "productName": "string (Product Name or Collection)",
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
        systemInstruction: "You are a rigorous Data Extraction Agent. Your output must be ONLY a valid JSON array containing the research results. \n\nIMPORTANT FORMATTING RULES:\n1. Return ONLY the raw JSON array `[...]`.\n2. Do NOT use Markdown code blocks (e.g., no ```json wrapper).\n3. Do NOT include any conversational text before or after the JSON.\n4. Ensure there are NO trailing commas after the last element in arrays or objects.\n5. Escape all double quotes inside strings properly.",
      },
    });

    let jsonText = response.text || "[]";
    
    // Cleanup: Remove markdown code blocks if they exist (despite instructions)
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    }
    
    // Cleanup: Find the array brackets
    const jsonArrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      jsonText = jsonArrayMatch[0];
    } else {
      console.warn("No JSON array structure found in response:", jsonText);
      // Fallback: if it looks like a single object, wrap it
      if (jsonText.trim().startsWith('{')) {
        jsonText = `[${jsonText}]`;
      } else {
         return { cases: [] };
      }
    }
    
    // Cleanup: Handle unescaped control characters which might break JSON.parse
    // We replace literal newlines with space to prevent parsing errors, 
    // assuming the model didn't properly escape them as \n.
    jsonText = jsonText.replace(/[\n\r\t]/g, " ");

    let cases: CobrandingCase[] = [];
    
    try {
      cases = JSON.parse(jsonText) as CobrandingCase[];
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw JSON Text:", jsonText);
      
      // Attempt to fix common error: Trailing commas
      try {
        const fixedJson = jsonText.replace(/,\s*([\]}])/g, '$1');
        cases = JSON.parse(fixedJson) as CobrandingCase[];
      } catch (retryError) {
        throw new Error("Failed to parse API response. The model output was malformed.");
      }
    }

    // Sort by Date Descending
    cases = cases.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-')); 
      const dateB = new Date(b.date.replace(/\./g, '-'));
      
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;

      return dateB.getTime() - dateA.getTime();
    });

    // Extract Grounding Metadata (Sources)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as unknown as GroundingMetadata | undefined;

    return { cases, metadata: groundingMetadata };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};