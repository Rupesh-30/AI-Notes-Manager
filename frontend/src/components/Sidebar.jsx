import { auth } from "../firebase/config";

import {
  addNote as addFirestoreNote,
  updateNote,
  deleteNote as deleteFirestoreNote,
} from "../services/notesService";
console.log(addFirestoreNote);

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
  };

  try {
    const id = await addFirestoreNote(newNote, user.uid);

    const savedNote = {
      id,
      ...newNote,
      uid: user.uid,
    };

    setNotes([savedNote, ...notes]);
    setSelectedNote(savedNote);

  } catch (error) {
    console.error("Add Note Error:", error);
  }
}

  // ==========================
  // Move to Trash
  // ==========================
  async function deleteNote(id) {
  try {
    await updateNote(id, {
      deleted: true,
    });
  } catch (error) {
    console.error("Delete Error:", error);
  }
}

  // ==========================
  // Restore
  // ==========================
  async function restoreNote(id) {
  try {
    await updateNote(id, {
      deleted: false,
    });
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
  function togglePin(id) {
    const updated = notes.map((note) =>
      note.id === id
        ? { ...note, pinned: !note.pinned }
        : note
    );

    setNotes(updated);

    if (selectedNote?.id === id) {
      setSelectedNote(updated.find((n) => n.id === id));
    }
  }

  // ==========================
  // Favorite
  // ==========================
  function toggleFavorite(id) {
    const updated = notes.map((note) =>
      note.id === id
        ? { ...note, favorite: !note.favorite }
        : note
    );

    setNotes(updated);

    if (selectedNote?.id === id) {
      setSelectedNote(updated.find((n) => n.id === id));
    }
  }

  // ==========================
  // Active Notes
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
      return 0;
    });

  // Trash
  const trashNotes = notes.filter((note) => note.deleted);

  return (
    <aside className="w-72 bg-slate-800 p-5 border-r border-slate-700 overflow-y-auto">

      <h1 className="text-3xl font-bold text-cyan-400">
        AI Notes
      </h1>

      <button
        onClick={addNote}
        className="w-full mt-5 bg-cyan-500 hover:bg-cyan-600 py-3 rounded-xl font-semibold transition"
      >
        + New Note
      </button>

      {/* Active Notes */}
      <div className="mt-6 space-y-3">

        {sortedNotes.length === 0 ? (
          <p className="text-slate-400 text-sm text-center">
            No notes found.
          </p>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              onClick={() =>
  setSelectedNote(
    notes.find((n) => n.id === note.id)
  )
}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition ${
                selectedNote?.id === note.id
                  ? "bg-cyan-500"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >

              <div className="flex-1 overflow-hidden">

                <div className="font-medium truncate">
                  {note.pinned && "📌 "}
                  {note.favorite && "⭐ "}
                  {note.title || "Untitled Note"}
                </div>

                <div className="text-xs text-slate-300 truncate mt-1">
                  {note.content
                    ? stripHtml(note.content).slice(0, 35) +
                      (stripHtml(note.content).length > 35
                        ? "..."
                        : "")
                    : "Empty Note"}
                </div>

              </div>

              <div className="flex gap-2 ml-2">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note.id);
                  }}
                  title="Pin"
                >
                  📌
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(note.id);
                  }}
                  title="Favorite"
                >
                  {note.favorite ? "⭐" : "☆"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="text-red-400"
                  title="Delete"
                >
                  🗑️
                </button>

              </div>

            </div>
          ))
        )}

      </div>

      <hr className="my-6 border-slate-600" />

      {/* Trash */}
      <div className="flex justify-between items-center mb-3">

        <h2 className="text-lg font-bold text-red-400">
          🗑 Trash ({trashNotes.length})
        </h2>

        {trashNotes.length > 0 && (
          <button
            onClick={emptyTrash}
            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
          >
            Empty
          </button>
        )}

      </div>

      <div className="space-y-2">

        {trashNotes.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Trash is empty.
          </p>
        ) : (
          trashNotes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-700 rounded-lg p-2"
            >

              <div className="font-medium truncate">
                {note.title || "Untitled Note"}
              </div>

              <div className="flex gap-2 mt-2">

                <button
                  onClick={() => restoreNote(note.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded py-1 text-sm"
                >
                  ♻ Restore
                </button>

                <button
                  onClick={() => deleteForever(note.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded py-1 text-sm"
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