import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// ===============================
// Summarize Note
// ===============================
export async function summarizeNote(note) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `
Summarize the following note in simple English.

${note}
`,
    });

    return response.text;
  } catch (error) {
    console.error("Summarize Error:", error);

    if (error.message) {
      return "❌ " + error.message;
    }

    return "❌ Failed to summarize.";
  }
}

// ===============================
// Improve Grammar
// ===============================
export async function improveGrammar(note) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `
Correct the grammar of the following text.
Do not change the meaning.
Return only the corrected version.

${note}
`,
    });

    return response.text;
  } catch (error) {
    console.error("Grammar Error:", error);

    if (error.message) {
      return "❌ " + error.message;
    }

    return "❌ Failed to improve grammar.";
  }
}

// ===============================
// Generate Tasks
// ===============================
export async function generateTasks(note) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `
Extract all actionable tasks from the following note.

Rules:
- Return only a checklist.
- Start every task with "☐".
- Do not explain anything.
- If there are no tasks, return "No tasks found."

Note:
${note}
`,
    });

    return response.text;
  } catch (error) {
    console.error("Task Error:", error);

    if (error.message) {
      return "❌ " + error.message;
    }

    return "❌ Failed to generate tasks.";
  }
}

// ===============================
// Translate Note
// ===============================
export async function translateNote(note) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `
Translate the following text into Bengali.

Rules:
- Keep the original meaning.
- Return only the translated text.

Text:
${note}
`,
    });

    return response.text;
  } catch (error) {
    console.error("Translate Error:", error);

    if (error.message) {
      return "❌ " + error.message;
    }

    return "❌ Failed to translate.";
  }
}
// ===============================
// Ask AI
// ===============================
export async function askAI(question, note) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `
You are an intelligent AI assistant.

Current Note:
${note}

User Question:
${question}

Instructions:
- Answer the question using the note if possible.
- If the answer is not available in the note, clearly mention that.
- Then provide a helpful general answer.
- Keep the answer short and easy to understand.
`,
    });

    return response.text;
  } catch (error) {
    console.error("Ask AI Error:", error);

    if (error.message) {
      return "❌ " + error.message;
    }

    return "❌ Failed to get AI response.";
  }
}