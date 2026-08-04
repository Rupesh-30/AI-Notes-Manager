import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { auth, db } from "../firebase/config";
import { MONTHLY_LIMIT } from "../services/usageService";

function Profile({ show, setShow, notes = [] }) {
  const [user, setUser] = useState(null);
  const [aiRequests, setAiRequests] = useState(0);
  const [copied, setCopied] = useState(false);

  // =========================
  // Firebase User + Usage
  // =========================
 useEffect(() => {
  if (!show) {
    return;
  }

  let unsubscribeFirestore = null;

  const unsubscribeAuth = onAuthStateChanged(
    auth,
    (currentUser) => {
      // Previous listener বন্ধ
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      setUser(currentUser);

      if (!currentUser) {
        setAiRequests(0);
        return;
      }

      const userRef = doc(
        db,
        "users",
        currentUser.uid
      );

      unsubscribeFirestore = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setAiRequests(0);
            return;
          }

          const data = snapshot.data();

          setAiRequests(
            Number(data.usage?.totalRequests || 0)
          );
        },
        (error) => {
          console.error(
            "Profile usage listener error:",
            error
          );

          if (error.code === "permission-denied") {
            setAiRequests(0);
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
  // =========================
  // Copy Account ID
  // =========================
  const handleCopyId = async () => {
    if (!user?.uid) return;

    try {
      await navigator.clipboard.writeText(user.uid);

      setCopied(true);
      toast.success("Account ID copied!");

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy Error:", error);
      toast.error("Could not copy Account ID.");
    }
  };

  if (!show) return null;

  // =========================
  // Profile Data
  // =========================
  const noteCount = notes.length;

  const usagePercent =
    MONTHLY_LIMIT > 0
      ? Math.min(
          (aiRequests / MONTHLY_LIMIT) * 100,
          100
        )
      : 0;

  const joinedDate =
    user?.metadata?.creationTime
      ? new Date(
          user.metadata.creationTime
        ).toLocaleDateString()
      : "Unknown";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">

      {/* =========================
          Main Modal
      ========================== */}
      <div className="w-full max-w-[640px] max-h-[94vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-x-hidden">

        {/* =========================
            Header
        ========================== */}
        <div className="relative px-7 py-5 border-b border-slate-800">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">
              👤
            </div>

            <div>
              <h2 className="text-3xl font-bold text-cyan-400 animate-pulse">
                Profile
              </h2>

              <p className="text-sm text-slate-500">
                Your account information
              </p>
            </div>

          </div>

          {/* Close */}
          <button
  onClick={() => setShow(false)}
  className="
    absolute top-1 right-5
    w-12 h-12
    rounded-xl
    bg-slate-800/90
    border border-slate-700
    text-slate-400
    hover:bg-red-500/15
    hover:border-red-500/40
    hover:text-red-400
    hover:scale-105
    active:scale-95
    transition-all duration-200
    text-2xl
    font-semibold
    flex items-center justify-center
    shadow-lg
  "
  title="Close Profile"
>
  ✕
</button>

        </div>

        {/* =========================
            Body
        ========================== */}
        <div className="p-7">

          {/* =========================
              Profile Identity
          ========================== */}
          <div className="flex flex-col items-center">

            {/* Avatar */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">

              <div className="text-7xl">
                👤
              </div>

            </div>

            {/* Name */}
            <h3 className="text-3xl font-bold text-white mt-4 animate-pulse">
              {user?.displayName || "AI User"}
            </h3>

            {/* Email */}
            <p className="text-slate-400 text-base mt-1 break-all text-center">
              {user?.email || "No email"}
            </p>

          </div>

          {/* =========================
              Statistics
          ========================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">

            {/* AI Requests */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500/40 transition-all">

              <div className="flex items-center justify-between">

                <span className="text-base text-slate-400 animate-pulse">
                  🤖 AI Requests
                </span>

                <span className="text-cyan-400 text-lg">
                  ⚡
                </span>

              </div>

              <div className="mt-3 flex items-end gap-1">

                <span className="text-3xl font-bold text-cyan-400">
                  {aiRequests}
                </span>

                <span className="text-sm text-slate-500 mb-1">
                  / {MONTHLY_LIMIT}
                </span>

              </div>

              {/* Progress */}
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">

                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${usagePercent}%`,
                  }}
                />

              </div>

              <p className="text-xs text-slate-500 mt-2">
                {Math.round(usagePercent)}% used this month
              </p>

            </div>

            {/* Notes */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-blue-500/40 transition-all">

              <div className="flex items-center justify-between">

                <span className="text-base text-slate-400 animate-pulse">
                  📝 Notes
                </span>

                <span className="text-blue-400 text-lg">
                  ✦
                </span>

              </div>

              <div className="mt-3">

                <span className="text-3xl font-bold text-blue-400">
                  {noteCount}
                </span>

              </div>

              <p className="text-sm text-slate-500 mt-2">
                Total notes created
              </p>

            </div>

          </div>

          {/* =========================
              Account Information
          ========================== */}
          <div className="mt-7">

            <h3 className="text-base font-semibold text-cyan-400 mb-3 animate-pulse">
              Account Information
            </h3>

            <div className="space-y-3">

              {/* Email */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Email Address
                </p>

                <p className="text-sm text-slate-200 mt-1 break-all font-medium">
                  {user?.email || "No email"}
                </p>

              </div>

              {/* Account Type */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center">

                <div>

                  <p className="text-xs text-slate-500">
                    Account Type
                  </p>

                  <p className="text-sm text-slate-200 mt-1 font-medium">
                    AI User
                  </p>

                </div>

                <span className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Standard
                </span>

              </div>

              {/* Joined */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Joined
                </p>

                <p className="text-sm text-slate-200 mt-1 font-medium">
                  📅 {joinedDate}
                </p>

              </div>

              {/* Account ID */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">

                <div className="flex justify-between items-center gap-4">

                  <div className="min-w-0 flex-1">

                    <p className="text-xs text-slate-500">
                      Account ID
                    </p>

                    <p className="text-xs text-slate-300 mt-2 font-mono break-all leading-relaxed">
                      {user?.uid || "Unavailable"}
                    </p>

                  </div>

                  <button
                    onClick={handleCopyId}
                    className={`shrink-0 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                      copied
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white"
                    }`}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>

                </div>

                <p className="text-[11px] text-slate-600 mt-3">
                  Unique account identifier
                </p>

              </div>

            </div>

          </div>

          {/* =========================
              Footer
          ========================== */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">

            <p className="text-xs text-slate-600">
              AI Notes Manager • Your personal notes workspace
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;