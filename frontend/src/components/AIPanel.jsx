import { useState } from "react";
import {
  summarizeNote,
  improveGrammar,
  generateTasks,
  translateNote,
  askAI,
} from "../services/gemini";

function AIPanel({ selectedNote }) {
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const runAI = async (action) => {
    if (!selectedNote) {
      setResponse("❌ No note selected.");
      return;
    }

    setLoading(true);

    try {
      const result = await action();
      setResponse(result);
    } catch (error) {
      console.error(error);
      setResponse("❌ Something went wrong.");
    }

    setLoading(false);
  };

  const handleSummarize = () =>
    runAI(() => summarizeNote(selectedNote.content));

  const handleGrammar = () =>
    runAI(() => improveGrammar(selectedNote.content));

  const handleTasks = () =>
    runAI(() => generateTasks(selectedNote.content));

  const handleTranslate = () =>
    runAI(() => translateNote(selectedNote.content));

  const handleAskAI = () => {
    if (!question.trim()) {
      setResponse("❌ Please enter a question.");
      return;
    }

    runAI(() => askAI(question, selectedNote.content));
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

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg mb-3"
      >
        ✨ Summarize
      </button>

      <button
        onClick={handleGrammar}
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg mb-3"
      >
        ✨ Improve Grammar
      </button>

      <button
        onClick={handleTasks}
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg mb-3"
      >
        📋 Generate Tasks
      </button>

      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg mb-5"
      >
        🌍 Translate
      </button>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask AI about this note..."
        className="bg-slate-700 rounded-lg p-3 mb-3 outline-none w-full"
      />

      <button
        onClick={handleAskAI}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg mb-5"
      >
        🤖 Ask AI
      </button>

      <div className="bg-slate-700 rounded-lg p-4 flex-1 overflow-auto min-h-[220px]">
        <h3 className="text-cyan-300 font-bold mb-3">
          AI Response
        </h3>

        <p className="text-slate-200 whitespace-pre-wrap break-words">
          {loading
            ? "🤖 AI is thinking..."
            : response || "Click any AI feature to begin."}
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={copyResponse}
          className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg"
        >
          📋 Copy
        </button>

        <button
          onClick={clearResponse}
          className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
        >
          🗑 Clear
        </button>
      </div>
    </aside>
  );
}

export default AIPanel;