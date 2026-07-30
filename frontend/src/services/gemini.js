import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});


async function callGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    console.error("AI Error:", error);

    return "❌ Failed to get AI response.";
  }
}


// Summarize
export async function summarizeNote(note) {
  return callGemini(`
Summarize the following note in simple English.

${note}
`);
}


// Grammar
export async function improveGrammar(note) {
  return callGemini(`
Correct the grammar of this text.
Do not change the meaning.
Return only corrected text.

${note}
`);
}


// Generate Tasks
export async function generateTasks(note) {
  return callGemini(`
Convert this note into actionable tasks.

Rules:
- Return ONLY markdown checklist.
- Every task starts with "- [ ]"
- One task per line.

Note:
${note}
`);
}


// Translate
export async function translateNote(note) {
  return callGemini(`
Translate this text into Bengali.
Keep the meaning.

${note}
`);
}


// Rewrite
export async function rewriteNote(note) {
  return callGemini(`
Rewrite this note professionally.
Improve clarity.
Do not add new information.

${note}
`);
}


// Ask AI
export async function askAI(question, note) {
  return callGemini(`
Current Note:
${note}

User Question:
${question}

Answer shortly and clearly.
`);
}