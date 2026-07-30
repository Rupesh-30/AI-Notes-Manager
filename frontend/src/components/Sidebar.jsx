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
  selectedTag,
  setSelectedTag,
}) {  // ==========================
  // Remove HTML Tags
  // ==========================
  function stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  // ==========================
  // Add Note (Simplified & Safe)
  // ==========================
  async function addNote() {
    const user = auth.currentUser;
    if (!user) return;

    const newNote = {
      folder: "General",
      title: "New Note",
      content: "",
      pinned: false,
      favorite: false,
      deleted: false,
      updatedAt: new Date().toLocaleString(),
      createdAt: Date.now(),
      uid: user.uid, // UID এখানে রাখা ভালো, ডেটাবেসে ফিল্টারিংয়ের জন্য
    };

    try {
      // শুধু ফায়ারবেসে সেভ হবে, onSnapshot অটোমেটিক লিস্ট আপডেট করে দেবে
      await addFirestoreNote(newNote, user.uid);
    } catch (error) {
      console.error("Add Note Error:", error);
    }
  }

  // ==========================
  // Move to Trash (Pessimistic - Firebase confirmed then UI)
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
      await Promise.all(
        trashNotes.map((note) => deleteFirestoreNote(note.id))
      );
    } catch (error) {
      console.error("Empty Trash Error:", error);
    }
  }

  // ==========================
  // Pin & Favorite
  // ==========================
  async function togglePin(note) {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
    } catch (error) {
      console.error("Pin Update Error:", error);
    }
  }

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
      (selectedTag === "" || note.folder === selectedTag) &&
      (note.title || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase())
  )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned - a.pinned;
      if (a.favorite !== b.favorite) return b.favorite - a.favorite;
      return b.createdAt - a.createdAt;
    });

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
          <p className="text-slate-400 text-sm text-center mt-10">No notes found.</p>
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
                  {note.pinned && "📌 "} {note.favorite && "⭐ "}
                  {note.title || "Untitled Note"}
                </div>
                <div className="text-xs truncate mt-1 text-slate-400">
                  {note.content ? stripHtml(note.content).slice(0, 35) + "..." : "Empty Note"}
                </div>
              </div>

              <div className="flex gap-2 ml-2">
                <button onClick={(e) => { e.stopPropagation(); togglePin(note); }}>{note.pinned ? "📌" : "📍"}</button>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(note); }}>{note.favorite ? "⭐" : "☆"}</button>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-red-400">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="my-6 border-slate-600" />
      
      {/* Trash Section */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-red-400">🗑 Trash ({trashNotes.length})</h2>
        {trashNotes.length > 0 && (
          <button onClick={emptyTrash} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded">Empty</button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {trashNotes.map((note) => (
          <div key={note.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
            <div className="text-sm truncate text-slate-300">{note.title}</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => restoreNote(note.id)} className="text-xs text-green-400">♻ Restore</button>
              <button onClick={() => deleteForever(note.id)} className="text-xs text-red-400">❌ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;