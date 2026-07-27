import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateNote } from "../services/notesService";

function Editor({ notes, setNotes, selectedNote, setSelectedNote }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ১. সাইডবার থেকে নোট সিলেক্ট করলে Local State আপডেট হবে
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
    }
  }, [selectedNote?.id]);

  // ২. Debounced Auto Save (টাইপিং থামানোর ১ সেকেন্ড পর সেভ হবে)
  useEffect(() => {
    if (!selectedNote) return;

    if (title === selectedNote.title && content === selectedNote.content) return;

    const timer = setTimeout(async () => {
      const updatedAt = new Date().toLocaleString();

      try {
        await updateNote(selectedNote.id, {
          title,
          content,
          updatedAt,
        });

        await updateNote(selectedNote.id, {
  title,
  content,
  updatedAt,
});
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, selectedNote]);

  // ৩. কোনো নোট সিলেক্ট করা না থাকলে এই UI দেখাবে
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

  // ৪. Statistics Calculation (লাইভ কাউন্ট)
  const plainText = (content || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex-1 bg-slate-900 p-8 overflow-hidden">
      <div className="h-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 flex flex-col">
        
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="bg-transparent text-4xl font-bold text-white outline-none border-b border-slate-700 pb-4"
        />

        <div className="text-sm text-slate-400 mt-2 mb-5">
          Last Updated: {selectedNote.updatedAt || "Just Now"}
        </div>

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="flex-1 bg-white text-black rounded-xl overflow-hidden"
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