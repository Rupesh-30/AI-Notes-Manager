import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import AIPanel from "./components/AIPanel";
import Settings from "./components/Settings";

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
  // Auth
  // ==========================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ==========================
  // Notes
  // ==========================
  const [notes, setNotes] = useState([]);

  // IMPORTANT
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) || null;

  // ==========================
  // Firestore Realtime
  // ==========================
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firebaseNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotes(firebaseNotes);

      if (firebaseNotes.length === 0) {
        setSelectedNoteId(null);
        return;
      }

      setSelectedNoteId((prev) => {
        const exists = firebaseNotes.find((n) => n.id === prev);

        if (exists) return prev;

        return firebaseNotes[0].id;
      });
    });

    return unsubscribe;
  }, [user]);

  // ==========================
  // Search
  // ==========================
  const [searchTerm, setSearchTerm] = useState("");

  // ==========================
  // Theme
  // ==========================
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);

    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);

  // ==========================
  // Settings
  // ==========================
  const [showSettings, setShowSettings] = useState(false);

  const [saveStatus] = useState("✅ Saved");

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <h1 className="text-center mt-20 text-xl">
        Loading...
      </h1>
    );
  }

  // ==========================
  // Login
  // ==========================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-96 space-y-6">
          <Signup />
          <hr />
          <Login />
        </div>
      </div>
    );
  }

  // ==========================
  // Dashboard
  // ==========================
  return (
    <div
      className={`flex h-screen ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <Sidebar
        notes={notes}
        setNotes={setNotes}
        selectedNote={selectedNote}
        setSelectedNote={(note) =>
          setSelectedNoteId(note?.id || null)
        }
        searchTerm={searchTerm}
      />

      <div className="flex flex-col flex-1">
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-4 py-2 rounded m-2 w-fit"
        >
          Logout
        </button>

        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedNote={selectedNote}
          theme={theme}
          setTheme={setTheme}
          setShowSettings={setShowSettings}
          saveStatus={saveStatus}
        />

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <Editor
            notes={notes}
            setNotes={setNotes}
            selectedNote={selectedNote}
            setSelectedNote={(note) =>
              setSelectedNoteId(note?.id || null)
            }
          />

          <AIPanel
            selectedNote={selectedNote}
          />
        </div>
      </div>

      <Settings
        show={showSettings}
        setShow={setShowSettings}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}

export default App;