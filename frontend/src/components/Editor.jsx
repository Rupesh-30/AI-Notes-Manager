import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateNote } from "../services/notesService";

function Editor({
  notes,
  setNotes,
  selectedNote,
  setSelectedNote,
}) {
  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-300">
            📝 No Note Selected
          </h2>

          <p className="text-slate-500 mt-2">
            Select a note from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // ==========================
  // Update Title
  // ==========================
  async function updateTitle(e) {
    const title = e.target.value;
    const updatedAt = new Date().toLocaleString();

    setSelectedNote((prev) => ({
      ...prev,
      title,
      updatedAt,
    }));

    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title,
              updatedAt,
            }
          : note
      )
    );

    try {
      await updateNote(selectedNote.id, {
        title,
        updatedAt,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // ==========================
  // Update Content
  // ==========================
  async function updateContent(value) {
    const updatedAt = new Date().toLocaleString();

    setSelectedNote((prev) => ({
      ...prev,
      content: value,
      updatedAt,
    }));

    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              content: value,
              updatedAt,
            }
          : note
      )
    );

    try {
      await updateNote(selectedNote.id, {
        content: value,
        updatedAt,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // ==========================
  // Statistics
  // ==========================
  const plainText = (selectedNote.content || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  const wordCount = plainText
    ? plainText.split(/\s+/).length
    : 0;

  const charCount = plainText.length;

  const readingTime = Math.max(
    1,
    Math.ceil(wordCount / 200)
  );

  return (
    <div className="flex-1 bg-slate-900 p-8 overflow-hidden">
      <div className="h-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 flex flex-col">

        <input
          value={selectedNote.title}
          onChange={updateTitle}
          placeholder="Untitled Note"
          className="bg-transparent text-4xl font-bold text-white outline-none border-b border-slate-700 pb-4"
        />

        <div className="text-sm text-slate-400 mt-2 mb-5">
          Last Updated: {selectedNote.updatedAt || "Just Now"}
        </div>

        <ReactQuill
          key={selectedNote.id}
          theme="snow"
          value={selectedNote.content || ""}
          onChange={updateContent}
          className="flex-1 bg-white text-black rounded-xl"
        />

        <div className="mt-4 flex justify-between text-sm text-slate-400 border-t border-slate-700 pt-3">
          <span>📝 Words: {wordCount}</span>
          <span>🔤 Characters: {charCount}</span>
          <span>📖 {readingTime} min read</span>
        </div>

      </div>
    </div>
  );
}

export default Editor;