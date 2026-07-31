const ai = require("../config/gemini");

async function generateAI(prompt) {
  try {
    console.log("AI REQUEST RECEIVED");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("AI RESPONSE SUCCESS");

    return response.text;

  } catch (error) {
    console.error("GEMINI FULL ERROR:");
    console.error(error);

    throw error;
  }
}

module.exports = { generateAI };