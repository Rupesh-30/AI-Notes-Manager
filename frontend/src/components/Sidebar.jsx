import { useMemo } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import toast from "react-hot-toast";

import {
  moveToTrash,
  restoreNote,
  deleteNotePermanently,
} from "../services/notesService";

function Sidebar({
  notes = [],
  selectedNote,
  setSelectedNote,
  mobileView = "sidebar",
  setMobileView,
  searchTerm = "",
  selectedFolder = "All",
  setSelectedFolder,
  selectedTag = "",
  setSelectedTag,
}) {
  // =========================
  // Create New Note
  // =========================
  const handleNewNote = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    try {
      const newNote = {
        uid: user.uid,
        title: "Untitled Note",
        content: "",
        folder: "Personal",
        tags: [],
        pinned: false,
        favorite: false,
        trash: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "notes"),
        newNote
      );

      const localNote = {
        id: docRef.id,
        ...newNote,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSelectedNote(localNote);

      // Return to All Notes after creating
      setSelectedFolder("All");
      setSelectedTag("");

      toast.success("New note created!");
    } catch (error) {
      console.error("Create Note Error:", error);
      toast.error("Failed to create note.");
    }
  };

  // =========================
  // Move Note To Trash
  // =========================
  const handleMoveToTrash = async (e, note) => {
    e.stopPropagation();

    try {
      await moveToTrash(note.id);

      // If deleted note was selected, clear selection
      if (selectedNote?.id === note.id) {
        setSelectedNote(null);
      }

      toast.success("Note moved to Trash");
    } catch (error) {
      console.error("Move To Trash Error:", error);
      toast.error("Failed to move note to Trash.");
    }
  };

  // =========================
  // Restore Note
  // =========================
  const handleRestore = async (e, note) => {
    e.stopPropagation();

    try {
      await restoreNote(note.id);

      toast.success("Note restored successfully!");
    } catch (error) {
      console.error("Restore Error:", error);
      toast.error("Failed to restore note.");
    }
  };

  // =========================
  // Permanent Delete
  // =========================
  const handlePermanentDelete = async (e, note) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Permanently delete "${note.title || "Untitled Note"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteNotePermanently(note.id);

      if (selectedNote?.id === note.id) {
        setSelectedNote(null);
      }

      toast.success("Note permanently deleted.");
    } catch (error) {
      console.error("Permanent Delete Error:", error);
      toast.error("Failed to permanently delete note.");
    }
  };

  // =========================
  // Search + Folder + Tag
  // =========================
  const filteredNotes = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return notes.filter((note) => {
      const isTrash = note.trash === true;

      // Trash mode
      if (selectedFolder === "Trash") {
        if (!isTrash) return false;
      } else {
        // Normal folders should NEVER show Trash notes
        if (isTrash) return false;
      }

      const title = note.title || "";
      const content = note.content || "";

      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search) ||
        content
          .replace(/<[^>]*>/g, "")
          .toLowerCase()
          .includes(search);

      const matchesFolder =
        selectedFolder === "All" ||
        selectedFolder === "Trash" ||
        note.folder === selectedFolder;

      const tags = Array.isArray(note.tags)
        ? note.tags
        : [];

      const matchesTag =
        selectedFolder === "Trash"
          ? true
          : !selectedTag || tags.includes(selectedTag);

      return (
        matchesSearch &&
        matchesFolder &&
        matchesTag
      );
    });
  }, [
    notes,
    searchTerm,
    selectedFolder,
    selectedTag,
  ]);

  // =========================
  // Folders
  // =========================
  const folders = [
    "All",
    "Personal",
    "Work",
    "Study",
    "Ideas",
  ];

  // =========================
  // Unique Tags
  // =========================
  const allTags = useMemo(() => {
    return [
      ...new Set(
        notes
          .filter((note) => note.trash !== true)
          .flatMap((note) =>
            Array.isArray(note.tags)
              ? note.tags
              : []
          )
      ),
    ];
  }, [notes]);

  // =========================
  // Counts
  // =========================
  const activeNotesCount = notes.filter(
    (note) => note.trash !== true
  ).length;

  const trashCount = notes.filter(
    (note) => note.trash === true
  ).length;

  return (
    <aside
  className={`w-full lg:w-64 shrink-0 bg-slate-950 border-r border-slate-800 text-white flex flex-col h-full ${
    mobileView === "sidebar"
      ? "flex"
      : "hidden lg:flex"
  }`}
>

      {/* =========================
          Header
      ========================= */}
      <div className="p-4 border-b border-slate-800">

        <h2 className="text-xl font-bold text-cyan-400 mb-4">
          📝 My Notes
        </h2>

        {/* New Note */}
        <button
          onClick={handleNewNote}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
        >
          <span className="text-lg">＋</span>
          New Note
        </button>

      </div>

      {/* =========================
          Folders
      ========================= */}
      <div className="p-4 border-b border-slate-800">

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase">
            Folders
          </h3>

          <span className="text-xs text-slate-600">
            {selectedFolder === "Trash"
              ? trashCount
              : activeNotesCount}
          </span>
        </div>

        <div className="space-y-1">

          {folders.map((folder) => {

            const folderCount =
              folder === "All"
                ? activeNotesCount
                : notes.filter(
                    (note) =>
                      note.trash !== true &&
                      note.folder === folder
                  ).length;

            return (
              <button
                key={folder}
                onClick={() => {
                  setSelectedFolder(folder);
                  setSelectedTag("");
                }}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedFolder === folder
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >

                <span>
                  {folder === "All" && "📚 "}
                  {folder === "Personal" && "👤 "}
                  {folder === "Work" && "💼 "}
                  {folder === "Study" && "📖 "}
                  {folder === "Ideas" && "💡 "}
                  {folder}
                </span>

                <span
                  className={`text-xs ${
                    selectedFolder === folder
                      ? "text-cyan-400"
                      : "text-slate-600"
                  }`}
                >
                  {folderCount}
                </span>

              </button>
            );
          })}

          {/* =========================
              Trash
          ========================= */}
          <button
            onClick={() => {
              setSelectedFolder("Trash");
              setSelectedTag("");
            }}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selectedFolder === "Trash"
                ? "bg-red-500/15 text-red-400 border border-red-500/20"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>🗑️ Trash</span>

            {trashCount > 0 && (
              <span
                className={`text-xs ${
                  selectedFolder === "Trash"
                    ? "text-red-400"
                    : "text-slate-600"
                }`}
              >
                {trashCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* =========================
          Tags
      ========================= */}
      {allTags.length > 0 &&
        selectedFolder !== "Trash" && (
          <div className="p-4 border-b border-slate-800">

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase">
                Tags
              </h3>

              {selectedTag && (
                <button
                  onClick={() => setSelectedTag("")}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">

              {allTags.map((tag, index) => {

                const tagKey = `${tag}-${index}`;

                return (
                  <button
                    key={tagKey}
                    onClick={() => {
                      setSelectedTag(
                        selectedTag === tag
                          ? ""
                          : tag
                      );

                      setSelectedFolder("All");
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      selectedTag === tag
                        ? "bg-cyan-500 text-white border-cyan-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-cyan-400"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}

            </div>
          </div>
        )}

      {/* =========================
          Notes List
      ========================= */}
      <div className="flex-1 overflow-y-auto p-3">

        {/* Notes Header */}
        <div className="flex items-center justify-between px-1 mb-3">

          <h3
            className={`text-xs font-semibold uppercase ${
              selectedFolder === "Trash"
                ? "text-red-400"
                : "text-slate-500"
            }`}
          >
            {selectedFolder === "Trash"
              ? "Trash"
              : "Notes"}
          </h3>

          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {filteredNotes.length}
          </span>

        </div>

        {/* Empty */}
        {filteredNotes.length === 0 ? (

          <div className="text-center py-10 px-3">

            <div className="text-4xl mb-3">
              {selectedFolder === "Trash"
                ? "🗑️"
                : "📝"}
            </div>

            <p className="text-slate-400 text-sm">
              {selectedFolder === "Trash"
                ? "Trash is empty"
                : "No notes found"}
            </p>

            {selectedFolder !== "Trash" && (
              <button
                onClick={handleNewNote}
                className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
              >
                + Create a note
              </button>
            )}

          </div>

        ) : (

          <div className="space-y-2">

            {filteredNotes.map((note) => {

              const isSelected =
                selectedNote?.id === note.id;

              const isTrash =
                note.trash === true;

              return (
                <div
                  key={note.id}
                  className={`w-full p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500/50 shadow-sm shadow-cyan-500/5"
                      : "bg-slate-900 border-slate-800 hover:border-slate-600"
                  }`}
                >

                  {/* Note Selection */}
                  <button
                    onClick={() => {
                      setSelectedNote(note)
                      setMobileView("editor");
                    }}
                    className="w-full text-left"
                  >

                    {/* Note title + content */}
                    <div className="min-w-0">

                      <p
                        className={`font-medium text-sm truncate ${
                          isSelected
                            ? "text-cyan-400"
                            : "text-slate-200"
                        }`}
                      >
                        {note.title ||
                          "Untitled Note"}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {note.content
                          ? note.content
                              .replace(
                                /<[^>]*>/g,
                                ""
                              )
                              .replace(
                                /&nbsp;/g,
                                " "
                              )
                              .trim()
                          : "Empty note"}
                      </p>

                    </div>

                    {/* Folder */}
                    {!isTrash &&
                      note.folder && (
                        <div className="mt-2">

                          <span className="text-[10px] text-slate-500">
                            📁 {note.folder}
                          </span>

                        </div>
                      )}

                    {/* Tags */}
                    {!isTrash &&
                      Array.isArray(note.tags) &&
                      note.tags.length > 0 && (

                        <div className="flex flex-wrap gap-1 mt-2">

                          {note.tags
                            .slice(0, 3)
                            .map((tag, index) => (

                              <span
                                key={`${note.id}-tag-${tag}-${index}`}
                                className="text-[10px] bg-cyan-500/5 text-cyan-500/70 border border-cyan-500/10 px-1.5 py-0.5 rounded"
                              >
                                #{tag}
                              </span>

                            ))}

                          {note.tags.length > 3 && (
                            <span className="text-[10px] text-slate-600">
                              +{note.tags.length - 3}
                            </span>
                          )}

                        </div>
                      )}

                  </button>

                  {/* =========================
                      Actions
                  ========================= */}
                  <div className="flex gap-2 mt-3">

                    {isTrash ? (
                      <>
                        {/* Restore */}
                        <button
                          onClick={(e) =>
                            handleRestore(e, note)
                          }
                          className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        >
                          ♻️ Restore
                        </button>

                        {/* Permanent Delete */}
                        <button
                          onClick={(e) =>
                            handlePermanentDelete(e, note)
                          }
                          className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          ❌ Delete
                        </button>
                      </>
                    ) : (
                      /* Move To Trash */
                      <button
                        onClick={(e) =>
                          handleMoveToTrash(e, note)
                        }
                        className="w-full text-xs py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
                      >
                        🗑️ Move to Trash
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </aside>
  );
}

export default Sidebar;