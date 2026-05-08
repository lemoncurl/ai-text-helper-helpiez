import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://lemoncurl.github.io",
  methods: ["POST", "GET"]
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;
// const HOST = "0.0.0.0";

// Debug API Key
console.log("API KEY:", process.env.API_KEY ? "Loaded ✅" : "NOT FOUND ❌");

app.post("/rewrite", async (req, res) => {
  const { text, mode } = req.body;

  // Validasi input
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const prompt =
    mode === "paraphrase"
      ? `Paraphrase the following text clearly and naturally:\n\n${text}`
      : `Rewrite the following text to be more professional and clear:\n\n${text}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lemoncurl.github.io/ai-text-helper-helpiez",
        "X-Title": "Helpiez"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();

    // Debug response dari OpenRouter
    console.log("=== OPENROUTER RESPONSE ===");
    console.log(JSON.stringify(data, null, 2));

    // Handle error dari OpenRouter
    if (!response.ok || data.error) {
      return res.status(400).json({
        error: data.error?.message || "OpenRouter API error"
      });
    }

    // Ambil hasil AI
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({
        error: "AI returned empty response"
      });
    }

    // Kirim ke frontend (format clean)
    res.json({ result });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Helpiez backend is running ✅" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});