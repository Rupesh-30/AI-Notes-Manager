import { auth } from "../firebase/config";
import {
  addNote as addFirestoreNote,
  updateNote,
  deleteNote as deleteFirestoreNote,
} from "../services/notesService";

function Sidebar({
  notes,
  setNotes,
  selectedNote,
  setSelectedNote,
  searchTerm,
}) {
  // ==========================
  // Remove HTML Tags
  // ==========================
  function stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  // ==========================
  // Add Note
  // ==========================
  async function addNote() {
    const user = auth.currentUser;
    if (!user) return;

    const newNote = {
      title: "New Note",
      content: "",
      pinned: false,
      favorite: false,
      deleted: false,
      updatedAt: new Date().toLocaleString(),
      createdAt: Date.now(), // Added for better sorting in future
    };

    try {
      const id = await addFirestoreNote(newNote, user.uid);
      
      const savedNote = { id, ...newNote, uid: user.uid };
      
      // Optimistic UI Update: 
      // onSnapshot আসার আগেই লোকাল স্টেটে নোটটা দিয়ে দিচ্ছি, যাতে Editor-এ delay না হয়!
      setNotes([savedNote, ...notes]);

      // 이제 Editor সাথে সাথে নতুন নোটটা পেয়ে যাবে
      setSelectedNote({ id });
    } catch (error) {
      console.error("Add Note Error:", error);
    }
  }

  // ==========================
  // Move to Trash
  // ==========================
  async function deleteNote(id) {
    try {
      await updateNote(id, { deleted: true });
    } catch (error) {
      console.error("Delete Error:", error);
    }
  }

  // ==========================
  // Restore
  // ==========================
  async function restoreNote(id) {
    try {
      await updateNote(id, { deleted: false });
    } catch (error) {
      console.error("Restore Error:", error);
    }
  }

  // ==========================
  // Delete Forever
  // ==========================
  async function deleteForever(id) {
    try {
      await deleteFirestoreNote(id);
    } catch (error) {
      console.error("Delete Forever Error:", error);
    }
  }

  // ==========================
  // Empty Trash
  // ==========================
  async function emptyTrash() {
    try {
      for (const note of trashNotes) {
        await deleteFirestoreNote(note.id);
      }
    } catch (error) {
      console.error("Empty Trash Error:", error);
    }
  }

  // ==========================
  // Pin
  // ==========================
  async function togglePin(note) {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
    } catch (error) {
      console.error("Pin Update Error:", error);
    }
  }

  // ==========================
  // Favorite
  // ==========================
  async function toggleFavorite(note) {
    try {
      await updateNote(note.id, { favorite: !note.favorite });
    } catch (error) {
      console.error("Favorite Update Error:", error);
    }
  }

  // ==========================
  // Active Notes (Filtered & Sorted)
  // ==========================
  const sortedNotes = [...notes]
    .filter(
      (note) =>
        !note.deleted &&
        (note.title || "")
          .toLowerCase()
          .includes((searchTerm || "").toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      if (a.favorite !== b.favorite) return b.favorite - a.favorite;
      return b.createdAt - a.createdAt; // Default sorting by newest
    });

  // Trash Notes
  const trashNotes = notes.filter((note) => note.deleted);

  return (
    <aside className="w-72 bg-slate-800 p-5 border-r border-slate-700 overflow-y-auto flex flex-col">
      <h1 className="text-3xl font-bold text-cyan-400">AI Notes</h1>

      <button
        onClick={addNote}
        className="w-full mt-5 bg-cyan-500 hover:bg-cyan-600 py-3 rounded-xl font-semibold transition text-white"
      >
        + New Note
      </button>

      {/* Active Notes */}
      <div className="mt-6 space-y-3 flex-1 overflow-y-auto pr-1">
        {sortedNotes.length === 0 ? (
          <p className="text-slate-400 text-sm text-center mt-10">
            No notes found.
          </p>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${
                selectedNote?.id === note.id
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <div className="font-medium truncate text-sm">
                  {note.pinned && "📌 "}
                  {note.favorite && "⭐ "}
                  {note.title || "Untitled Note"}
                </div>

                <div
                  className={`text-xs truncate mt-1 ${
                    selectedNote?.id === note.id
                      ? "text-cyan-100"
                      : "text-slate-400"
                  }`}
                >
                  {note.content
                    ? stripHtml(note.content).slice(0, 35) +
                      (stripHtml(note.content).length > 35 ? "..." : "")
                    : "Empty Note"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note);
                  }}
                  title={note.pinned ? "Unpin" : "Pin"}
                  className="hover:scale-110 transition-transform"
                >
                  {note.pinned ? "📌" : "📍"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(note);
                  }}
                  title={note.favorite ? "Unfavorite" : "Favorite"}
                  className="hover:scale-110 transition-transform"
                >
                  {note.favorite ? "⭐" : "☆"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="hover:scale-110 transition-transform text-red-400 hover:text-red-300"
                  title="Move to Trash"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="my-6 border-slate-600" />

      {/* Trash Section */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-red-400">
          🗑 Trash ({trashNotes.length})
        </h2>

        {trashNotes.length > 0 && (
          <button
            onClick={emptyTrash}
            className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors px-3 py-1.5 rounded-md font-medium"
          >
            Empty
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {trashNotes.length === 0 ? (
          <p className="text-slate-500 text-sm">Trash is empty.</p>
        ) : (
          trashNotes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-3"
            >
              <div className="font-medium truncate text-slate-300 text-sm">
                {note.title || "Untitled Note"}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => restoreNote(note.id)}
                  className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors rounded py-1.5 text-xs font-medium"
                >
                  ♻ Restore
                </button>

                <button
                  onClick={() => deleteForever(note.id)}
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded py-1.5 text-xs font-medium"
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;