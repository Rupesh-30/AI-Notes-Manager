import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { updateNote } from "../services/notesService";

function Editor({ notes, setNotes, selectedNote, setSelectedNote }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]); // ✅ Tags State
  const [folder, setFolder] = useState("General");

  // ১. সাইডবার থেকে নোট সিলেক্ট করলে Local State আপডেট হবে
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");
      setTags(selectedNote.tags || []); // ✅ Load Tags
       setFolder(selectedNote.folder || "General");
    }
  }, [selectedNote?.id]);

  // ২. Debounced Auto Save (টাইপিং থামানোর ৫০০ মিলিসেকেন্ড পর সেভ হবে)
  useEffect(() => {
    if (!selectedNote) return;

    // Tags এর পরিবর্তন ট্র্যাক করার জন্য stringify করছি
    const isSame =
  title === selectedNote.title &&
  content === selectedNote.content &&
  folder === (selectedNote.folder || "General") &&
  JSON.stringify(tags) === JSON.stringify(selectedNote.tags || []);
    if (isSame) return;

    const timer = setTimeout(async () => {
      const updatedAt = new Date().toLocaleString();

      try {
        console.log("=== SAVING NOTE ===");
console.log({
  title,
  content,
  tags,
});
        // ফায়ারবেসে সেভ
        await updateNote(selectedNote.id, {
          title,
          content,
          tags, // ✅ Save Tags
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

        setSelectedNote(updatedNote);

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
        );
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, tags, folder, selectedNote?.id]);

  // ৩. পেজ রিফ্রেশ বা ক্লোজ করার আগে Warning দেখানো
  useEffect(() => {
    const hasUnsavedChanges = 
      selectedNote && 
      (title !== selectedNote.title || 
       content !== selectedNote.content || 
       folder !== (selectedNote.folder || "General") ||
       JSON.stringify(tags) !== JSON.stringify(selectedNote.tags || []));

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
  title,
  content,
  tags,
  folder,
  selectedNote?.id,
  selectedNote?.title,
  selectedNote?.content,
  selectedNote?.tags,
  selectedNote?.folder,
]);

  // ট্যাগ অ্যাড করা
  const handleAddTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setTags([...tags, e.target.value.trim()]);
      e.target.value = "";
    }
  };

  // ট্যাগ রিমুভ করা
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // ৪. কোনো নোট সিলেক্ট করা না থাকলে এই UI দেখাবে
  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-300">📝 No Note Selected</h2>
          <p className="text-slate-500 mt-2">Select a note from the sidebar or create a new one.</p>
        </div>
      </div>
    );
  }

  // ৫. Statistics Calculation
  const plainText = (content || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\n/g, " ").trim();
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

        {/* Tag Input Section */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {tags.map((tag, index) => (
            <span key={index} className="bg-cyan-900/50 text-cyan-200 px-2 py-1 rounded text-xs flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(index)} className="hover:text-red-400">×</button>
            </span>
          ))}
          <input
            onKeyDown={handleAddTag}
            placeholder="+ Add tag..."
            className="bg-transparent text-xs text-slate-400 outline-none w-24"
          />
        </div>

<div className="mt-4 mb-3">
  <label className="text-sm text-slate-400 mr-2">
    📁 Folder:
  </label>

  <select
    value={folder}
    onChange={(e) => setFolder(e.target.value)}
    className="bg-slate-700 text-white px-3 py-1 rounded-lg outline-none"
  >
    <option>General</option>
    <option>Personal</option>
    <option>Work</option>
    <option>Study</option>
    <option>Ideas</option>
  </select>
</div>

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