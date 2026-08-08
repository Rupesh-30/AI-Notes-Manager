import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { askBackendAI } from "../services/aiService";

// ==========================================
// Max AI Prompt Content Length (Characters)
// ==========================================
const MAX_AI_CONTENT_LENGTH = 12000;

// ==========================================
// Remove HTML tags and clean AI response
// ==========================================
function cleanAIResponse(text) {
  if (!text) return "";

  return String(text)
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

  // Storage readiness state
  const [storageReady, setStorageReady] = useState(false);

  // ==========================================
  // Get current user's storage keys
  // ==========================================
  const getStorageKey = (uid = auth.currentUser?.uid) => {
    if (!uid) return null;
    return `aiHistory_${uid}`;
  };

  const getResponseStorageKey = (uid = auth.currentUser?.uid) => {
    if (!uid) return null;
    return `aiLastResponse_${uid}`;
  };

  // ==========================================
  // Load user's saved AI data
  // ==========================================
  useEffect(() => {
    const loadSavedAIData = (user) => {
      setHistory([]);
      setResponse("");
      setStorageReady(false);

      if (!user?.uid) {
        setStorageReady(true);
        return;
      }

      const historyKey = getStorageKey(user.uid);
      const responseKey = getResponseStorageKey(user.uid);

      try {
        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            setHistory(parsedHistory.slice(0, 20));
          }
        }

        const savedResponse = localStorage.getItem(responseKey);
        if (savedResponse) {
          setResponse(savedResponse);
        }
      } catch (error) {
        console.error("Error loading AI saved data:", error);
        setHistory([]);
        setResponse("");
      } finally {
        setStorageReady(true);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      loadSavedAIData(user);
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // Save History
  // ==========================================
  useEffect(() => {
    if (!storageReady) return;

    const user = auth.currentUser;
    if (!user?.uid) return;

    const historyKey = getStorageKey(user.uid);
    if (!historyKey) return;

    try {
      localStorage.setItem(
        historyKey,
        JSON.stringify(history.slice(0, 20))
      );
    } catch (error) {
      console.error("Error saving AI history:", error);
    }
  }, [history, storageReady]);

  // ==========================================
  // Save Last AI Response
  // ==========================================
  useEffect(() => {
    if (!storageReady) return;

    const user = auth.currentUser;
    if (!user?.uid) return;

    const responseKey = getResponseStorageKey(user.uid);
    if (!responseKey) return;

    try {
      if (response) {
        localStorage.setItem(responseKey, response);
      } else {
        localStorage.removeItem(responseKey);
      }
    } catch (error) {
      console.error("Error saving AI response:", error);
    }
  }, [response, storageReady]);

  // ==========================================
  // Cooldown Timer
  // ==========================================
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // ==========================================
  // Content Extraction and Validation
  // ==========================================
  const getCleanContent = () => cleanAIResponse(selectedNote?.content);

  const validateAIContent = () => {
    const content = getCleanContent();

    if (!content) {
      toast.error("No note selected or note is empty.");
      return null;
    }

    if (content.length > MAX_AI_CONTENT_LENGTH) {
      toast.error(
        `This note is too long for AI. Please keep it under ${MAX_AI_CONTENT_LENGTH.toLocaleString()} characters.`
      );
      return null;
    }

    return content;
  };

  // ==========================================
  // Core AI Execution
  // ==========================================
  const runAI = async (actionName, action, questionText = "") => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown}s before trying again.`);
      return;
    }

    const content = validateAIContent();
    if (!content) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login first.");
      return;
    }

    setLoading(true);

    try {
      setResponse("");

      // AI Request
      const result = await action();
      const cleanResult = cleanAIResponse(result);

      if (!cleanResult) {
        toast.error("AI returned an empty response.");
        return;
      }

      setResponse(cleanResult);
      setCooldown(10);

      // Add to history
      const now = new Date();
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action: actionName,
        question: actionName === "Ask AI" ? questionText : "",
        response: cleanResult,
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: now.toLocaleDateString(),
      };

      setHistory((prev) => [newItem, ...prev].slice(0, 20));
    } catch (error) {
      console.error("AI request error:", error);
      toast.error(error.message || "Something went wrong with AI request.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // AI Actions
  // ==========================================
  const handleSummarize = () =>
    runAI("Summarize", () =>
      askBackendAI(`Summarize this note briefly:\n\n${getCleanContent()}`, "summarize")
    );

  const handleGrammar = () =>
    runAI("Grammar", () =>
      askBackendAI(`Fix grammar mistakes in this text:\n\n${getCleanContent()}`, "grammar")
    );

  const handleTasks = () =>
    runAI("Tasks", () =>
      askBackendAI(
        `Create an actionable markdown checklist from this note:\n\n${getCleanContent()}`,
        "tasks"
      )
    );

  const handleTranslate = () =>
    runAI("Translate", () =>
      askBackendAI(`Translate this note into Bengali:\n\n${getCleanContent()}`, "translate")
    );

  const handleRewrite = () =>
    runAI("Rewrite", () =>
      askBackendAI(`Rewrite this note professionally:\n\n${getCleanContent()}`, "rewrite")
    );

  const handleAskAI = () => {
    const currentQuestion = question.trim();

    if (!currentQuestion) {
      toast.error("Please enter a question.");
      return;
    }

    runAI(
      "Ask AI",
      () =>
        askBackendAI(
          `Based on this note:\n\n${getCleanContent()}\n\nQuestion: ${currentQuestion}`,
          "askAI"
        ),
      currentQuestion
    );

    setQuestion("");
  };

  // ==========================================
  // Copy Response
  // ==========================================
  const copyResponse = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      toast.success("Response copied!");
    } catch (error) {
      console.error("Copy response error:", error);
      toast.error("Could not copy response.");
    }
  };

  // ==========================================
  // Clear Response
  // ==========================================
  const clearResponse = () => {
    setResponse("");
    setQuestion("");

    const user = auth.currentUser;
    if (user?.uid) {
      const responseKey = getResponseStorageKey(user.uid);
      if (responseKey) {
        localStorage.removeItem(responseKey);
      }
    }

    toast.success("Response cleared!");
  };

  // ==========================================
  // Clear History
  // ==========================================
  const clearHistory = () => {
    const user = auth.currentUser;
    setHistory([]);

    if (user?.uid) {
      const historyKey = getStorageKey(user.uid);
      if (historyKey) {
        localStorage.removeItem(historyKey);
      }
    }

    toast.success("History cleared!");
  };

  // ==========================================
  // Render UI
  // ==========================================
  return (
    <aside className="w-full lg:w-80 lg:border-l border-t lg:border-t-0 border-slate-700 bg-slate-800/90 backdrop-blur-xl p-4 lg:p-5 flex flex-col h-full overflow-y-auto select-none">
      {/* Title */}
      <h2 className="text-2xl font-bold text-cyan-400 mb-5 flex items-center gap-2 shrink-0">
        <span>🤖</span>
        AI Assistant
      </h2>

      {/* AI Action Buttons */}
      <div className="flex flex-col gap-2.5 mb-5 shrink-0">
        <button
          onClick={handleSummarize}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "🤖 Thinking..."
            : cooldown > 0
            ? `⏳ ${cooldown}s`
            : "✨ Summarize"}
        </button>

        <button
          onClick={handleGrammar}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "🤖 Thinking..."
            : cooldown > 0
            ? `⏳ ${cooldown}s`
            : "✨ Improve Grammar"}
        </button>

        <button
          onClick={handleTasks}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "🤖 Thinking..."
            : cooldown > 0
            ? `⏳ ${cooldown}s`
            : "📋 Generate Tasks"}
        </button>

        <button
          onClick={handleTranslate}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "🤖 Thinking..."
            : cooldown > 0
            ? `⏳ ${cooldown}s`
            : "🌍 Translate"}
        </button>

        <button
          onClick={handleRewrite}
          disabled={loading || cooldown > 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "🤖 Thinking..."
            : cooldown > 0
            ? `⏳ ${cooldown}s`
            : "✍ Rewrite"}
        </button>
      </div>

      {/* Ask AI */}
      <div className="mb-5 shrink-0">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAskAI();
            }
          }}
          placeholder="Ask AI about this note..."
          className="bg-slate-700/80 text-white placeholder-slate-400 border border-slate-600 focus:border-cyan-500 rounded-lg p-2.5 mb-2 outline-none w-full transition-colors text-sm"
        />

        <button
          onClick={handleAskAI}
          disabled={loading || cooldown > 0 || !question.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "🤖 Thinking..."
            : cooldown > 0
            ? `⏳ Wait ${cooldown}s`
            : "🤖 Ask AI"}
        </button>
      </div>

      {/* AI Response Display */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 max-h-56 overflow-y-auto min-h-[140px] shrink-0 mb-4">
        <h3 className="text-cyan-300 font-bold mb-2 text-sm">AI Response</h3>

        {loading ? (
          <p className="text-slate-200 text-sm animate-pulse">
            🤖 AI is thinking...
          </p>
        ) : (
          <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
            {(response || "Click any AI feature to begin.")
              .split("\n")
              .map((line, index) => (
                <div key={index} className="mb-1.5">
                  {line.startsWith("- [ ]") ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled
                        className="accent-cyan-400"
                      />
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

      {/* Copy + Clear Actions */}
      <div className="flex gap-2 mb-6 shrink-0">
        <button
          onClick={copyResponse}
          disabled={!response || loading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-2 rounded-lg transition-colors font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          📋 Copy
        </button>

        <button
          onClick={clearResponse}
          disabled={!response || loading}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-2 rounded-lg transition-colors font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          🗑 Clear
        </button>
      </div>

      {/* AI History */}
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
                  <span className="text-cyan-400 font-semibold text-xs">
                    {item.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.time}
                  </span>
                </div>

                {item.question && (
                  <p className="bg-slate-800 rounded-lg p-1.5 mt-1.5 text-yellow-300 text-xs break-words">
                    ❓ {item.question}
                  </p>
                )}

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
          onClick={clearHistory}
          disabled={!history.length}
          className="w-full bg-red-700/80 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-700/80 py-2 rounded-lg text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>🗑</span> Clear History
        </button>
      </div>
    </aside>
  );
}

export default AIPanel;