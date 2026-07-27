import { exportPDF } from "../services/pdf";

function Navbar({
  searchTerm,
  setSearchTerm,
  selectedNote,
  theme,
  setTheme,
  showSettings,
  setShowSettings,
  saveStatus,
}) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <h2 className="text-2xl font-bold text-white">
          AI Notes Manager
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg outline-none w-full md:w-80"
          />
          <p className="text-green-400 font-medium">
  {saveStatus}
</p>

          <button
            onClick={() => {
              if (!selectedNote) {
                alert("Please select a note.");
                return;
              }

              exportPDF(selectedNote);
            }}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
          >
            ⚙ Settings
          </button>

          

        </div>
      </div>
    </header>
  );
}

export default Navbar;