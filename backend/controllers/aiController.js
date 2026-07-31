const { generateAI } = require("../services/geminiService");

async function askAI(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const text = await generateAI(prompt);

    res.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

module.exports = { askAI };