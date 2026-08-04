import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateNote } from "../services/notesService";

function formatUpdatedAt(value) {
  if (!value) return "Just Now";

  // Firebase Timestamp
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  // Firebase Timestamp object
  if (
    typeof value === "object" &&
    typeof value.seconds === "number"
  ) {
    return new Date(value.seconds * 1000).toLocaleString();
  }

  // String
  if (typeof value === "string") {
    return value;
  }

  return "Just Now";
}

function Editor({
  notes,
  setNotes,
  selectedNote,
  setSelectedNote,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [folder, setFolder] = useState("General");

  // =========================
  // Load Selected Note
  // =========================
  useEffect(() => {
    if (!selectedNote) return;

    setTitle(selectedNote.title || "");
    setContent(selectedNote.content || "");
    setTags(
      Array.isArray(selectedNote.tags)
        ? selectedNote.tags
        : []
    );
    setFolder(selectedNote.folder || "General");
  }, [selectedNote?.id]);

  // =========================
  // Auto Save
  // =========================
  useEffect(() => {
    if (!selectedNote) return;

    const isSame =
      title === (selectedNote.title || "") &&
      content === (selectedNote.content || "") &&
      folder === (selectedNote.folder || "General") &&
      JSON.stringify(tags) ===
        JSON.stringify(selectedNote.tags || []);

    if (isSame) return;

    const timer = setTimeout(async () => {
      const updatedAt = new Date().toLocaleString();

      try {
        console.log("=== SAVING NOTE ===");

        await updateNote(selectedNote.id, {
          title,
          content,
          tags,
          folder,
          updatedAt,
        });

        const updatedNote = {
          ...selectedNote,
          title,
          content,
          tags,
          folder,
          updatedAt,
        };

        // setSelectedNote(updatedNote) সরিয়ে নেওয়া হলো অকারণে re-render আটকানোর জন্য
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === updatedNote.id
              ? updatedNote
              : note
          )
        );
      } catch (error) {
        console.error(
          "Error saving note:",
          error
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    title,
    content,
    tags,
    folder,
    selectedNote?.id,
  ]);

  // =========================
  // Add Tag
  // =========================
  const handleAddTag = (e) => {
    if (
      e.key === "Enter" &&
      e.target.value.trim()
    ) {
      const newTag = e.target.value.trim();

      // Prevent duplicate tags
      if (
        !tags.some(
          (tag) =>
            tag.toLowerCase() ===
            newTag.toLowerCase()
        )
      ) {
        setTags([...tags, newTag]);
      }

      e.target.value = "";
    }
  };

  // =========================
  // Remove Tag
  // =========================
  const removeTag = (index) => {
    setTags(
      tags.filter((_, i) => i !== index)
    );
  };

  // =========================
  // No Note Selected
  // =========================
  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">
            📝
          </div>

          <h2 className="text-2xl font-bold text-slate-300">
            No Note Selected
          </h2>

          <p className="text-slate-500 mt-2">
            Select a note from the sidebar
            or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // Statistics
  // =========================
  const plainText = (content || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n/g, " ")
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
    <div className="flex-1 bg-slate-900 p-4 md:p-6 overflow-hidden">

      <div className="h-full flex flex-col">

        {/* ================================= */}
        {/* NOTE HEADER */}
        {/* ================================= */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl mb-4 shrink-0 overflow-hidden">

          {/* Title Area */}
          <div className="px-5 pt-5 pb-4">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl shrink-0">
                📝
              </div>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Untitled Note"
                className="
                  flex-1
                  bg-transparent
                  text-3xl
                  md:text-4xl
                  font-bold
                  text-white
                  outline-none
                  placeholder-slate-600
                "
              />

            </div>

          </div>

          {/* Metadata Bar */}
          <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-700">

            <div className="flex flex-wrap items-center gap-3">

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">

                {tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      bg-cyan-500/10
                      border
                      border-cyan-500/20
                      text-cyan-400
                      px-2.5
                      py-1
                      rounded-full
                      text-xs
                    "
                  >
                    #{tag}

                    <button
                      type="button"
                      onClick={() =>
                        removeTag(index)
                      }
                      className="
                        text-slate-500
                        hover:text-red-400
                        transition-colors
                        ml-1
                      "
                    >
                      ×
                    </button>
                  </span>
                ))}

                <input
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag"
                  className="
                    bg-transparent
                    text-xs
                    text-slate-300
                    placeholder-slate-600
                    outline-none
                    w-24
                  "
                />

              </div>

              {/* Divider */}
              <div className="hidden md:block h-5 w-px bg-slate-700" />

              {/* Folder */}
              <div className="flex items-center gap-2">

                <span className="text-sm">
                  📁
                </span>

                <select
                  value={folder}
                  onChange={(e) =>
                    setFolder(e.target.value)
                  }
                  className="
                    bg-slate-800
                    border
                    border-slate-700
                    text-slate-300
                    text-sm
                    px-3
                    py-1.5
                    rounded-lg
                    outline-none
                    hover:border-cyan-500
                    focus:border-cyan-500
                    transition-colors
                  "
                >
                  <option>General</option>
                  <option>Personal</option>
                  <option>Work</option>
                  <option>Study</option>
                  <option>Ideas</option>
                </select>

              </div>

            </div>

          </div>

          {/* Last Updated */}
          <div className="px-5 py-2.5 border-t border-slate-700">

            <span className="text-xs text-slate-500">
              🕒 Last Updated:
            </span>

            <span className="text-xs text-slate-400 ml-1">
              {formatUpdatedAt(
                selectedNote.updatedAt
              )}
            </span>

          </div>

        </div>

        {/* ================================= */}
        {/* EDITOR CONTAINER (FIXED LAYOUT) */}
        {/* ================================= */}
        <div className="flex-1 min-h-0 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col">

          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="flex-1 min-h-0 text-black"
          />

        </div>

        {/* ================================= */}
        {/* FOOTER STATS */}
        {/* ================================= */}
        <div className="mt-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">

          <span>
            📝 Words:
            <span className="text-slate-200 ml-1 font-medium">
              {wordCount}
            </span>
          </span>

          <span>
            🔤 Characters:
            <span className="text-slate-200 ml-1 font-medium">
              {charCount}
            </span>
          </span>

          <span>
            📖 Reading:
            <span className="text-slate-200 ml-1 font-medium">
              {readingTime} min
            </span>
          </span>

        </div>

      </div>
    </div>
  );
}

export default Editor;