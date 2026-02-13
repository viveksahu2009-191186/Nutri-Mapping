
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          portion: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER }
            }
          },
          micros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                unit: { type: Type.STRING }
              }
            }
          }
        },
        required: ["name", "portion", "calories", "macros"]
      }
    },
    summary: { type: Type.STRING },
    gapAnalysis: { type: Type.STRING, description: "Suggest foods to fill nutrient gaps based on the user's current intake vs common RDAs" }
  },
  required: ["items", "summary", "gapAnalysis"]
};

export const analyzeFoodInput = async (
  input: { text?: string; imageBase64?: string },
  profile: UserProfile
): Promise<AnalysisResult> => {
  const modelName = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are a world-class nutritionist AI. 
    Analyze the provided food input (text or image). 
    Estimate portions and provide detailed nutrient breakdowns.
    User Profile: Age ${profile.age}, Sex ${profile.sex}, Goal ${profile.goal}.
    Be as accurate as possible with scientific estimates.
  `;

  const contents: any[] = [];
  if (input.text) contents.push({ text: `Analyze this food: ${input.text}` });
  if (input.imageBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.imageBase64
      }
    });
    contents.push({ text: "Analyze the food shown in this image." });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to analyze food. Please try again.");
  }
};
