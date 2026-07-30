require("dotenv").config();

const functions = require("firebase-functions");
const { GoogleGenAI } = require("@google/genai");

exports.askGemini = functions.https.onCall(async (data) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: data.prompt,
    });

    return {
      text: response.text,
    };

  } catch (error) {
    console.error("Gemini Error:", error);

    return {
      text: "AI response failed",
    };
  }
});