import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import {
  MONTHLY_LIMIT,
  getRemainingUsage,
} from "../services/usageService";
import { useLanguage } from "../context/LanguageContext";

function Settings({
  show,
  setShow,
  theme,
  setTheme,
  displaySize,
  setDisplaySize,
}) {
  const { language, setLanguage, t } = useLanguage();

  const [usage, setUsage] = useState({
    totalRequests: 0,
    summarize: 0,
    grammar: 0,
    translate: 0,
    tasks: 0,
    rewrite: 0,
    askAI: 0,
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    let unsubscribeFirestore = null;

    const resetUsage = () => {
      setUsage({
        totalRequests: 0,
        summarize: 0,
        grammar: 0,
        translate: 0,
        tasks: 0,
        rewrite: 0,
        askAI: 0,
      });
    };

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        // Previous user's Firestore listener বন্ধ
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }

        if (!user) {
          resetUsage();
          return;
        }

        const userRef = doc(db, "users", user.uid);

        unsubscribeFirestore = onSnapshot(
          userRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              resetUsage();
              return;
            }

            const data = snapshot.data();
            const usageData = data.usage || {};

            setUsage({
              totalRequests: Number(
                usageData.totalRequests || 0
              ),
              summarize: Number(
                usageData.summarize || 0
              ),
              grammar: Number(
                usageData.grammar || 0
              ),
              translate: Number(
                usageData.translate || 0
              ),
              tasks: Number(
                usageData.tasks || 0
              ),
              rewrite: Number(
                usageData.rewrite || 0
              ),
              askAI: Number(
                usageData.askAI || 0
              ),
            });
          },
          (error) => {
            console.error(
              "Settings usage listener error:",
              error
            );

            if (error.code === "permission-denied") {
              resetUsage();
            }
          }
        );
      }
    );

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      unsubscribeAuth();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 w-full max-w-[440px] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">
            ⚙ {t.settings || "Settings"}
          </h2>
          <button
            onClick={() => setShow(false)}
            className="text-red-400 text-xl hover:opacity-80 transition-opacity"
            aria-label={t.close || "Close"}
          >
            ✖
          </button>
        </div>

        {/* Theme Section */}
        {theme && setTheme && (
          <div className="mb-5">
            <p className="mb-2 font-semibold text-slate-200">
              {t.theme || "Theme"}
            </p>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              {theme === "dark" ? "🌙 Dark" : "☀ Light"}
            </button>
          </div>
        )}

        {/* Display Size */}
        <div className="mb-5">
          <p className="mb-2 font-semibold text-slate-200">
            {t.displaySize || "Display Size"}
          </p>
          <div className="flex gap-2">
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                onClick={() => setDisplaySize && setDisplaySize(size)}
                className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition ${
                  displaySize === size
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {t[size] || size}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="mt-5 mb-5">
          <p className="font-semibold text-slate-200 mb-2">
            {t.language || "Language"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                language === "en"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              🇬🇧 {t.english || "English"}
            </button>

            <button
              onClick={() => setLanguage("bn")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                language === "bn"
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              🇧🇩 {t.bengali || "Bengali"}
            </button>
          </div>
        </div>

        {/* AI Usage Dashboard */}
        <div className="mb-6 border-t border-slate-700 pt-5">
          <h3 className="font-semibold text-cyan-400 mb-3">
            🤖 AI Usage Breakdown
          </h3>
          
          <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl mb-3 flex justify-between items-center">
            <p className="text-sm text-cyan-300 font-medium">Total AI Requests</p>
            <p className="text-2xl font-bold text-cyan-400">{usage.totalRequests}</p>
          </div>

          <div className="bg-green-950/40 border border-green-500/30 p-3 rounded-xl mb-3 flex justify-between items-center">
            <p className="text-sm text-green-300 font-medium">Remaining Requests</p>
            <p className="text-xl font-bold text-green-400">
              {getRemainingUsage(usage.totalRequests)} / {MONTHLY_LIMIT}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-700/60 p-2.5 rounded-xl border border-slate-600/40">
              <p className="text-xs text-slate-400">Summarize</p>
              <p className="text-lg font-bold text-slate-100">{usage.summarize}</p>
            </div>
            <div className="bg-slate-700/60 p-2.5 rounded-xl border border-slate-600/40">
              <p className="text-xs text-slate-400">Grammar</p>
              <p className="text-lg font-bold text-slate-100">{usage.grammar}</p>
            </div>
            <div className="bg-slate-700/60 p-2.5 rounded-xl border border-slate-600/40">
              <p className="text-xs text-slate-400">Translate</p>
              <p className="text-lg font-bold text-slate-100">{usage.translate}</p>
            </div>
            <div className="bg-slate-700/60 p-2.5 rounded-xl border border-slate-600/40">
              <p className="text-xs text-slate-400">Tasks</p>
              <p className="text-lg font-bold text-slate-100">{usage.tasks}</p>
            </div>
            <div className="bg-slate-700/60 p-2.5 rounded-xl border border-slate-600/40">
              <p className="text-xs text-slate-400">Rewrite</p>
              <p className="text-lg font-bold text-slate-100">{usage.rewrite}</p>
            </div>
            <div className="bg-slate-700/60 p-2.5 rounded-xl border border-slate-600/40">
              <p className="text-xs text-slate-400">Ask AI</p>
              <p className="text-lg font-bold text-slate-100">{usage.askAI}</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="border-t border-slate-700 pt-5">
          <p className="font-semibold text-slate-200">
            {t.about || "About"}
          </p>

          <p className="text-slate-400 [text-indent:7px]">
            AI Notes Manager
          </p>
        </div>

      </div>
    </div>
  );
}

export default Settings;