import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";
import { exportPDF } from "../services/pdf";

function Navbar({
  searchTerm,
  setSearchTerm,
  selectedNote,
  theme,
  setTheme,
  setShowSettings,
  saveStatus,
}) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          AI Notes Manager
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 text-white placeholder-slate-400 px-4 py-2 rounded-lg outline-none w-full md:w-80 border border-slate-600 focus:border-cyan-500 transition-colors"
          />

          {/* Save Status Badge */}
          <div className="text-sm font-medium text-slate-400 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600 flex items-center gap-1">
            {saveStatus}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-slate-700 hover:bg-slate-600 p-2.5 rounded-lg text-white transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => {
              if (!selectedNote) {
                toast.error("Please select a note to export.");
                return;
              }
              exportPDF(selectedNote);
            }}
            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            📄 Export PDF
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            ⚙️ Settings
          </button>

          {/* 🚪 Logout Button */}
          <button
            onClick={async () => {
              try {
                await signOut(auth);
                toast.success("Logged out successfully!");
              } catch (error) {
                console.error("Logout Error:", error);
                toast.error("Logout failed. Please try again.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            🚪 Logout
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;