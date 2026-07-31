const { GoogleGenAI } = require("@google/genai");

console.log("GEMINI KEY STATUS:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

module.exports = ai;