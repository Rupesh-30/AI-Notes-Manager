import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import {
  summarizeNote,
  improveGrammar,
  generateTasks,
  translateNote,
  rewriteNote,
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
  const [history, setHistory] = useState([]);
  const [cooldown, setCooldown] = useState(0);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("aiHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("aiHistory", JSON.stringify(history));
  }, [history]);

  // Cooldown Timer Effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const getCleanContent = () => cleanAIResponse(selectedNote?.content);

  const runAI = async (actionName, action) => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before trying again.`);
      return;
    }

    if (!selectedNote || !getCleanContent()) {
      toast.error("No note selected or note is empty.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const result = await action();
      const cleanResult = cleanAIResponse(result);

      setResponse(cleanResult);
      setCooldown(10);

      setHistory((prev) => {
        const newItem = {
          id: Date.now(),
          action: actionName,
          question: actionName === "Ask AI" ? question : "",
          response: cleanResult,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [newItem, ...prev].slice(0, 20);
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => runAI("Summarize", () => summarizeNote(getCleanContent()));
  const handleGrammar = () => runAI("Grammar", () => improveGrammar(getCleanContent()));
  const handleTasks = () => runAI("Tasks", () => generateTasks(getCleanContent()));
  const handleTranslate = () => runAI("Translate", () => translateNote(getCleanContent()));
  const handleRewrite = () => runAI("Rewrite", () => rewriteNote(getCleanContent()));

  const handleAskAI = () => {
    if (!question.trim()) {
      toast.error("Please enter a question.");
      return;
    }
    runAI("Ask AI", () => askAI(question, getCleanContent()));
    setQuestion("");
  };

  const copyResponse = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response);
    toast.success("Response copied!");
  };

  const clearResponse = () => {
    setResponse("");
    setQuestion("");
    toast.success("Response cleared!");
  };

  return (
    <aside className="w-full lg:w-80 bg-slate-800/90 backdrop-blur-xl border-l border-slate-700 p-5 flex flex-col h-full overflow-y-auto select-none">
      {/* Title */}
      <h2 className="text-2xl font-bold text-cyan-400 mb-5 flex items-center gap-2 shrink-0">
        <span>🤖</span> AI Assistant
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 mb-5 shrink-0">
        <button
          onClick={handleSummarize}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "🤖 Thinking..." : cooldown > 0 ? `⏳ ${cooldown}s` : "✨ Summarize"}
        </button>

        <button
          onClick={handleGrammar}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "🤖 Thinking..." : cooldown > 0 ? `⏳ ${cooldown}s` : "✨ Improve Grammar"}
        </button>

        <button
          onClick={handleTasks}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "🤖 Thinking..." : cooldown > 0 ? `⏳ ${cooldown}s` : "📋 Generate Tasks"}
        </button>

        <button
          onClick={handleTranslate}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "🤖 Thinking..." : cooldown > 0 ? `⏳ ${cooldown}s` : "🌍 Translate"}
        </button>

        <button
          onClick={handleRewrite}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "🤖 Thinking..." : cooldown > 0 ? `⏳ ${cooldown}s` : "✍ Rewrite"}
        </button>
      </div>

      {/* Ask AI Input */}
      <div className="mb-5 shrink-0">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI about this note..."
          className="bg-slate-700/80 text-white placeholder-slate-400 border border-slate-600 focus:border-cyan-500 rounded-lg p-2.5 mb-2 outline-none w-full transition-colors text-sm"
        />

        <button
          onClick={handleAskAI}
          disabled={loading || cooldown > 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "🤖 Thinking..." : cooldown > 0 ? `⏳ Wait ${cooldown}s` : "🤖 Ask AI"}
        </button>
      </div>

      {/* AI Response Display */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 max-h-56 overflow-y-auto min-h-[140px] shrink-0 mb-4">
        <h3 className="text-cyan-300 font-bold mb-2 text-sm">AI Response</h3>

        {loading ? (
          <p className="text-slate-200 text-sm animate-pulse">🤖 AI is thinking...</p>
        ) : (
          <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
            {(response || "Click any AI feature to begin.")
              .split("\n")
              .map((line, index) => (
                <div key={index} className="mb-1.5">
                  {line.startsWith("- [ ]") ? (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" disabled className="accent-cyan-400" />
                      <span>{line.replace("- [ ]", "").trim()}</span>
                    </div>
                  ) : (
                    line
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Copy & Clear Actions */}
      <div className="flex gap-2 mb-6 shrink-0">
        <button
          onClick={copyResponse}
          disabled={!response || loading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-2 rounded-lg transition-colors font-medium text-sm"
        >
          📋 Copy
        </button>

        <button
          onClick={clearResponse}
          disabled={!response || loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-2 rounded-lg transition-colors font-medium text-sm"
        >
          🗑 Clear
        </button>
      </div>

      {/* AI History Section */}
      <div className="border-t border-slate-700 pt-4 shrink-0 pb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-cyan-300 font-bold text-sm">🕘 AI History</h3>
          <span className="text-xs text-slate-400 font-medium">
            {history.length} {history.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="max-h-44 overflow-y-auto space-y-2 pr-1 mb-3">
          {history.length === 0 ? (
            <p className="text-slate-400 text-xs">No AI history yet.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-700/70 border border-slate-600 rounded-xl p-3 hover:border-cyan-500/60 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 font-semibold text-xs">{item.action}</span>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>

                {item.question && (
                  <p className="bg-slate-800 rounded-lg p-1.5 mt-1.5 text-yellow-300 text-xs break-words">
                    ❓ {item.question}
                  </p>
                )}

                {/* ⭐ CSS Line-Clamp: কেটে যাওয়া বন্ধ করে সর্বোচ্চ ৩ লাইনে সুন্দরভাবে টেক্সট দেখাবে */}
                <p
                  className="bg-slate-800 rounded-lg p-2 mt-1.5 text-slate-200 text-xs cursor-pointer hover:bg-slate-900 transition-colors line-clamp-3 break-words"
                  title="Click to view full response"
                  onClick={() => setResponse(item.response)}
                >
                  {item.response}
                </p>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => {
            setHistory([]);
            toast.success("History cleared!");
          }}
          disabled={!history.length}
          className="w-full bg-red-700/80 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-700/80 py-2 rounded-lg text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <span>🗑</span> Clear History
        </button>
      </div>
    </aside>
  );
}

export default AIPanel;