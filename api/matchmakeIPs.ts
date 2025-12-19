import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// NOTE: keep the schema minimal for the first step
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
      budgetLevel: { type: Type.STRING },
    },
    required: ["ipName", "category", "matchScore", "whyItWorks", "campaignIdea"],
  },
};

const TEXT_MODEL = "gemini-3-pro-preview";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ error: "Missing API_KEY on server" });
    }

    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt (string)" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: MATCH_RECOMMENDATION_RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text || "[]";
    const data = JSON.parse(text);

    return res.status(200).json({
      recommendations: data,
      metadata: response.candidates?.[0]?.groundingMetadata ?? null,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: "Server error",
      details: err?.message || String(err),
    });
  }
}
