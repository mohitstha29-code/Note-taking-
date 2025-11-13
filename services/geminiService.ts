
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this example, we'll throw an error if the key isn't set.
  // This helps developers remember to set up their .env file.
  console.warn("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateContent = async (prompt: string) => {
  if (!API_KEY) {
    // Simulate a delay and return a mock response if API key is missing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "Gemini API key not configured. This is a mock response.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error: Could not generate content.";
  }
};

export const summarizeNote = (content: string) => {
  const prompt = `Summarize the following note into a short paragraph:\n\n---\n${content}\n---`;
  return generateContent(prompt);
};

export const improveWriting = (content: string) => {
  const prompt = `Proofread and improve the writing of the following text. Fix any spelling or grammar mistakes, and enhance clarity and flow. Return only the improved text:\n\n---\n${content}\n---`;
  return generateContent(prompt);
};

export const generateTitle = (content: string) => {
  const prompt = `Generate a concise and descriptive title (max 5-7 words) for the following note. Return only the title text:\n\n---\n${content}\n---`;
  return generateContent(prompt);
};

export const suggestTags = (content: string) => {
  const prompt = `Suggest up to 5 relevant, single-word tags (or two-word phrases) for the following note. Return them as a comma-separated list. For example: "productivity, work, ideas, brainstorming, project-management".\n\n---\n${content}\n---`;
  return generateContent(prompt);
};
   