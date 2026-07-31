import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

// Firebase Cloud Function এর রেফারেন্স
const generateAI = httpsCallable(functions, "generateAIContent");

// হেল্পার ফাংশন
async function callAIFunction(actionName, note, question = "") {
  try {
    const result = await generateAI({
      action: actionName,
      note: note,
      question: question,
    });

    return result.data.text;
  } catch (error) {
    console.error(`AI ${actionName} Error:`, error);

    if (error.code === "functions/resource-exhausted") {
      return "⚠️ Request limit reached. Please wait a few seconds and try again.";
    }

    if (error.code === "functions/unauthenticated") {
      return "❌ Please login to use AI features.";
    }

    return "❌ Failed to get AI response.";
  }
}

// Exported Functions
export const summarizeNote = (note) => callAIFunction("Summarize", note);
export const improveGrammar = (note) => callAIFunction("Grammar", note);
export const generateTasks = (note) => callAIFunction("Tasks", note);
export const translateNote = (note) => callAIFunction("Translate", note);
export const rewriteNote = (note) => callAIFunction("Rewrite", note);
export const askAI = (question, note) => callAIFunction("Ask AI", note, question);