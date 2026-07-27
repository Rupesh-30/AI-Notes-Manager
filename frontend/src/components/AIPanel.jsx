import { useState } from "react";
import {
  summarizeNote,
  improveGrammar,
  generateTasks,
  translateNote,
  askAI,
} from "../services/gemini";

// Helper function to remove HTML tags and format text nicely
function cleanAIResponse(text) {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function AIPanel({ selectedNote }) {
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // Bonus Fix: Clean content BEFORE sending to Gemini to save tokens & avoid AI confusion
  const getCleanContent = () => cleanAIResponse(selectedNote?.content);

  const runAI = async (action) => {
    if (!selectedNote || !getCleanContent()) {
      setResponse("❌ No note selected or note is empty.");
      return;
    }

    setLoading(true);
    setResponse(""); // Clear previous response while loading

    try {
      const result = await action();
      // Apply cleanAIResponse when saving the state, as you suggested!
      setResponse(cleanAIResponse(result)); 
    } catch (error) {
      console.error(error);
      setResponse("❌ Something went wrong.");
    }

    setLoading(false);
  };

  const handleSummarize = () =>
    runAI(() => summarizeNote(getCleanContent()));

  const handleGrammar = () =>
    runAI(() => improveGrammar(getCleanContent()));

  const handleTasks = () =>
    runAI(() => generateTasks(getCleanContent()));

  const handleTranslate = () =>
    runAI(() => translateNote(getCleanContent()));

  const handleAskAI = () => {
    if (!question.trim()) {
      setResponse("❌ Please enter a question.");
      return;
    }

    runAI(() => askAI(question, getCleanContent()));
  };

  const copyResponse = async () => {
    if (!response) return;

    await navigator.clipboard.writeText(response);
    alert("✅ Response copied!");
  };

  const clearResponse = () => {
    setResponse("");
    setQuestion("");
  };

  return (
    <aside className="w-full lg:w-72 bg-slate-800 border-l border-slate-700 p-5 flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">
        🤖 AI Assistant
      </h2>

      <div className="flex flex-col gap-3 mb-5">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          ✨ Summarize
        </button>

        <button
          onClick={handleGrammar}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          ✨ Improve Grammar
        </button>

        <button
          onClick={handleTasks}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          📋 Generate Tasks
        </button>

        <button
          onClick={handleTranslate}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          🌍 Translate
        </button>
      </div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask AI about this note..."
        className="bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-cyan-500 rounded-lg p-3 mb-3 outline-none w-full transition-colors"
      />

      <button
        onClick={handleAskAI}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium py-3 rounded-lg mb-5 transition-colors"
      >
        🤖 Ask AI
      </button>

      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex-1 overflow-auto min-h-[220px]">
        <h3 className="text-cyan-300 font-bold mb-3">AI Response</h3>

        <p className="text-slate-200 whitespace-pre-wrap break-words text-sm leading-relaxed">
          {loading
            ? "🤖 AI is thinking..."
            : response || "Click any AI feature to begin."}
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={copyResponse}
          disabled={!response || loading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-2 rounded-lg transition-colors font-medium"
        >
          📋 Copy
        </button>

        <button
          onClick={clearResponse}
          disabled={!response || loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-2 rounded-lg transition-colors font-medium"
        >
          🗑 Clear
        </button>
      </div>
    </aside>
  );
}

export default AIPanel;