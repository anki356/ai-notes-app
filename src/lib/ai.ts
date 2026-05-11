import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function summarizeText(text: string): Promise<string> {
  if (!text) return "";
  
  // If we have a real AI key, use it
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Summarize the following note into 3-5 concise bullet points. Keep it professional and focused on key takeaways:\n\n${text}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Summarization failed, falling back to local:", error);
    }
  }

  // Fallback: simple extractive summary
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  if (lines.length <= 3) return text;
  
  return lines.slice(0, 3).map(l => `• ${l}`).join("\n");
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text || !genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
}
