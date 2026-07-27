function Settings({
  show,
  setShow,
  theme,
  setTheme,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-slate-800 w-[420px] rounded-2xl p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-cyan-400">
            ⚙ Settings
          </h2>

          <button
            onClick={() => setShow(false)}
            className="text-red-400 text-xl"
          >
            ✖
          </button>

        </div>

        {/* Theme */}

        <div className="mb-5">

          <p className="mb-2 font-semibold">
            Theme
          </p>

          <button
            onClick={() =>
              setTheme(
                theme === "dark"
                  ? "light"
                  : "dark"
              )
            }
            className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg"
          >
            {theme === "dark"
              ? "🌙 Dark"
              : "☀ Light"}
          </button>

        </div>

        {/* Font */}

        <div className="mb-5">

          <p className="font-semibold">
            Font Size
          </p>

          <p className="text-slate-400">
            Coming Soon...
          </p>

        </div>

        {/* Language */}

        <div className="mb-5">

          <p className="font-semibold">
            Language
          </p>

          <p className="text-slate-400">
            English
          </p>

        </div>

        {/* About */}

        <div>

          <p className="font-semibold">
            About
          </p>

          <p className="text-slate-400 mt-2">
            AI Notes Manager
            <br />
            Version 1.0
            <br />
            Built with React + Gemini AI
          </p>

        </div>

      </div>

    </div>
  );
}

export default Settings;