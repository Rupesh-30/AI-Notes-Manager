import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import AIPanel from "./components/AIPanel";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase/config";

import Login from "./auth/Login";
import Signup from "./auth/Signup";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

function App() {
  // ==========================
  // Auth State
  // ==========================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth Switcher State
  const [showSignup, setShowSignup] = useState(false);
  const [showMobileAI, setShowMobileAI] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ==========================
  // Notes & Optimistic UI State
  // ==========================
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [tempSelectedNote, setTempSelectedNote] = useState(null);
  const [mobileView, setMobileView] = useState("sidebar");

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) || tempSelectedNote;

  // Helper function to handle note selection
  const handleSelectNote = (note) => {
  setSelectedNoteId(note?.id || null);
  setTempSelectedNote(note || null);

  if (note) {
    setMobileView("editor");
  }
};

  // ==========================
  // Firestore Realtime Listener
  // ==========================
  useEffect(() => {
    // Logged out হলে সব local note state clear করে দাও
    if (!user) {
      setNotes([]);
      setSelectedNoteId(null);
      setTempSelectedNote(null);
      return;
    }

    let active = true;

    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!active) return;

        const firebaseNotes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotes(firebaseNotes);

        if (firebaseNotes.length === 0) {
          setSelectedNoteId(null);
          setTempSelectedNote(null);
          return;
        }

        setSelectedNoteId((prev) => {
          const exists = firebaseNotes.some(
            (note) => note.id === prev
          );

          if (exists) return prev;

          setTempSelectedNote(null);
          return firebaseNotes[0].id;
        });
      },
      (error) => {
        // Logout/auth change-এর সময় পুরনো listener error হলে
        // সেটাকে app crash বা noisy error হতে দেব না
        if (!active) return;

        console.error("Notes listener error:", error);

        if (error.code === "permission-denied") {
          setNotes([]);
          setSelectedNoteId(null);
          setTempSelectedNote(null);
        }
      }
    );

    // User change / logout হলে পুরনো listener বন্ধ হবে
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  // ==========================
  // Search & Filter States
  // ==========================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");

  // ==========================
  // Theme State
  // ==========================
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // ==========================
  // Display Size State (NEW)
  // ==========================
  const [displaySize, setDisplaySize] = useState(
    () => localStorage.getItem("displaySize") || "medium"
  );

  useEffect(() => {
    localStorage.setItem("displaySize", displaySize);
  }, [displaySize]);

  // ==========================
  // Settings & Profile State
  // ==========================
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [saveStatus] = useState("✅ Saved");

  // ==========================
  // Loading Screen
  // ==========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading AI Notes Manager...</p>
        </div>
      </div>
    );
  }

  // ==========================
  // Modern Auth Page
  // ==========================
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white p-4">
        {/* Smooth Breathing Glows */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -top-20 -left-20"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-0 right-0"
        />

        {/* Auth Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-[420px] bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center overflow-hidden"
        >
          {/* Logo & Branding */}
          <div className="mb-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-5xl mb-3 inline-block"
            >
              📝
            </motion.div>

            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Notes Manager
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {showSignup
                ? "Create an account to get started"
                : "Welcome back! Login to your account"}
            </p>
          </div>

          {/* Form Switcher */}
          <AnimatePresence mode="wait">
            {showSignup ? (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <Signup />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3 }}
              >
                <Login />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switch Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSignup(!showSignup)}
            className="text-cyan-400 hover:text-cyan-300 text-sm mt-6 font-medium block mx-auto transition-colors outline-none cursor-pointer"
          >
            {showSignup ? "← Back to Login" : "Create a new account →"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ==========================
  // Main Application Dashboard
  // ==========================
 
return (
  <div
    className={`app-display-${displaySize} flex flex-col lg:flex-row h-screen overflow-hidden ${
      theme === "dark"
        ? "bg-slate-900 text-white"
        : "bg-gray-100 text-black"
    }`}
  >
    {/* =========================
        Sidebar
    ========================= */}
    <div
      className={`${
        mobileView === "sidebar"
          ? "flex"
          : "hidden"
      } lg:flex h-full w-full lg:w-auto`}
    >
      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        setSelectedNote={handleSelectNote}
        mobileView={mobileView}
        setMobileView={setMobileView}
        searchTerm={searchTerm}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />
    </div>

    {/* =========================
        Editor + AI Area
    ========================= */}
    <div
      className={`${
        mobileView === "editor"
          ? "flex"
          : "hidden"
      } lg:flex flex-col flex-1 min-w-0 h-full overflow-hidden`}
    >
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedNote={selectedNote}
        theme={theme}
        setTheme={setTheme}
        setShowSettings={setShowSettings}
        setShowProfile={setShowProfile}
        saveStatus={saveStatus}
        onLogout={() => signOut(auth)}
      />

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        <Editor
          key={selectedNote?.id}
          notes={notes}
          setNotes={setNotes}
          selectedNote={selectedNote}
          setSelectedNote={handleSelectNote}
          
          setMobileView={setMobileView}
        />
        {/* Mobile AI Button */}
<button
  onClick={() => setShowMobileAI(true)}
  className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-cyan-500 active:scale-95"
>
  🤖 Ask AI
</button>

        <div className="hidden lg:flex lg:w-80 shrink-0">
  <AIPanel selectedNote={selectedNote} />
</div>
      </div>
    </div>

   
    {/* =========================
        Settings
    ========================= */}
    <Settings
      show={showSettings}
      setShow={setShowSettings}
      theme={theme}
      setTheme={setTheme}
      displaySize={displaySize}
      setDisplaySize={setDisplaySize}
    />

    {/* =========================
        Profile
    ========================= */}
    <Profile
      show={showProfile}
      setShow={setShowProfile}
      notes={notes}
    />

    {/* =========================
        Mobile AI Panel
    ========================= */}
    <AnimatePresence>
      {showMobileAI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={() => setShowMobileAI(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className={`absolute bottom-0 left-0 right-0 h-[90vh] overflow-hidden rounded-t-2xl ${
              theme === "dark"
                ? "bg-slate-900 text-white"
                : "bg-white text-black"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile AI Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <h2 className="font-semibold">
                🤖 AI Assistant
              </h2>

              <button
                onClick={() => setShowMobileAI(false)}
                className="rounded-lg px-3 py-1 text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close AI Assistant"
              >
                ✕
              </button>
            </div>

            {/* AI Panel */}
            <div className="h-[calc(90vh-57px)] overflow-y-auto">
              <AIPanel selectedNote={selectedNote} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}

export default App;

