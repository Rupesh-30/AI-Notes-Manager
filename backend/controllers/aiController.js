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

    return res.status(200).json({
      success: true,
      text,
    });

  } catch (error) {
    console.error("========== AI ERROR ==========");
    console.error(error);
    console.error("==============================");

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: String(error),
    });
  }
}

module.exports = { askAI };