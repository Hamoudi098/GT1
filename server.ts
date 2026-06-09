import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined. Falling back to mock generator.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// AI endpoint allowing generation with different model selections
app.post("/api/generate-copy", async (req, res) => {
  const { model, prompt, modelCategory, gender, targetVibe } = req.body;
  
  // Validate model selection or fallback to 'gemini-3.5-flash'
  const validModels = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
  const chosenModel = validModels.includes(model) ? model : "gemini-3.5-flash";

  const ai = getGeminiClient();

  const mockPredefined = {
    name: `Premium ${modelCategory || "Runway"} Model Campaign`,
    description: `Tingkatkan daya tarik brand Anda dengan visual model profesional modern bertema ${targetVibe || "elegan"}! Solusi tepat untuk kampanye berkualitas tinggi.`,
    targetAudience: `Pecinta Fashion, ${gender === "Male" ? "Pria Modern" : gender === "Female" ? "Wanita Elegan" : "Semua Gender"}, Generasi Z & Millennial`,
    videoPreset: "fashion",
    ctaText: "Pelajari Selengkapnya",
    dailyBudget: 500000,
    generatedBy: `${chosenModel} (Mock Fallback - API Key details in Settings)`
  };

  if (!ai) {
    // Return high quality mock data with information when key is absent
    return res.json(mockPredefined);
  }

  try {
    const promptString = `You are a high-converting digital advertising copywriter for a TikTok-like visual platform.
The user wants to hire/promote a brand model with these details:
- Model Category: ${modelCategory || "Fashion/Runway"}
- Model Gender preference: ${gender || "Any"}
- Campaign Vibe/Theme: ${targetVibe || "Minimalist, Elegant"}
- Extra Custom Prompt: ${prompt || "None"}

Generate a high-converting advertisement slot configuration specifically tailored to modeling/promotional influencer campaigns.
Analyze the user request using the intelligence level of the chosen model: ${chosenModel}.

Return a JSON object containing:
1. name: Short catchy campaign name (max 5 words).
2. description: High-energy TikTok sponsor slogan copy / advertisement description (max 25 words in Indonesian).
3. targetAudience: Specific demographic tags separated by comma.
4. videoPreset: Must be exactly one of: "fashion", "sports", "tech", "lifestyle". Select "fashion" or "lifestyle" as primary for modeling.
5. ctaText: Must be exactly one of: "Beli Sekarang", "Daftar Gratis", "Pesan Sekarang", "Pelajari Selengkapnya", "Unduh Aplikasi".
6. dailyBudget: Realistic Indonesian Rupiah advertising budget suggestion between 50000 and 2000000 (multiple of 25000).`;

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: promptString,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Catchy modeling campaign name, under 5 words" },
            description: { type: Type.STRING, description: "TikTok sponsor copy in Indonesian, max 25 words, persuasive and punchy" },
            targetAudience: { type: Type.STRING, description: "Comma separated demographic keywords" },
            videoPreset: { type: Type.STRING, description: "Must be fashion, sports, tech, or lifestyle" },
            ctaText: { type: Type.STRING, description: "Call to Action label" },
            dailyBudget: { type: Type.INTEGER, description: "Suggested daily budget in IDR, e.g., 250000" }
          },
          required: ["name", "description", "targetAudience", "videoPreset", "ctaText", "dailyBudget"]
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return res.json({
        ...parsed,
        generatedBy: chosenModel
      });
    } else {
      return res.json(mockPredefined);
    }
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate campaign",
      fallback: mockPredefined
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
